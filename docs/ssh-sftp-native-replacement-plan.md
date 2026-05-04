# Native SSH and SFTP Replacement Plan

Date: 2026-05-03
Owner: ZeroTransfer core and classic provider team
Status: In progress — see "Implementation status" below

## 0. Implementation status (audit, current state)

This section reflects what has actually shipped on disk, distinguished from the
aspirational waves further down. Update this section in the same commit that
changes behaviour.

Implemented and exercised by the in-repo `FakeSftpServer` integration tests
(`test/integration/providers/native/NativeSftpProvider.integration.test.ts`):

- SSH binary layer: identification exchange, KEXINIT, name-list negotiation,
  packet framing.
- KEX: `curve25519-sha256` and `curve25519-sha256@libssh.org`.
- Host-key algorithms advertised: `ssh-ed25519`, `ecdsa-sha2-nistp256`,
  `ecdsa-sha2-nistp384`, `ecdsa-sha2-nistp521`, `rsa-sha2-256`, `rsa-sha2-512`.
- Host-key signature verification (RFC 4253 §8) over the exchange hash, with
  algorithm-compatible matching (e.g. `ssh-rsa` host key may sign with
  `rsa-sha2-256`/`rsa-sha2-512`). Legacy SHA-1 `ssh-rsa` signatures are
  explicitly rejected.
- Optional pinned-fingerprint policy via `profile.ssh.pinnedHostKeySha256`
  (accepts `SHA256:...`, raw base64, or hex). Mismatches fail with
  `AuthenticationError`.
- Optional OpenSSH `known_hosts` policy via `profile.ssh.knownHosts`
  (`SecretSource | SecretSource[]`). Honours hashed (`|1|salt|hash`) and
  plain-text host patterns including `[host]:port` form, negation, and
  `@revoked` markers. `@cert-authority` entries are not yet supported and
  are treated as no-match.
- Sequence-number continuation across `NEWKEYS` (RFC 4253 §6.4).
- Ciphers: `aes128-ctr`, `aes256-ctr`.
- MACs: `hmac-sha2-256`, `hmac-sha2-512` (Encrypt-then-MAC variants are not
  implemented; the transport uses MAC-then-Encrypt as RFC 4253 specifies).
- User auth: `password` and `keyboard-interactive` (the latter goes directly
  via `SSH_MSG_USERAUTH_REQUEST` with the keyboard-interactive method per
  RFC 4256 §3.1, no leading "none" probe).
- User auth: `publickey` for Ed25519 and RSA (signature algorithms
  `ssh-ed25519`, `rsa-sha2-512` default and `rsa-sha2-256`). Accepts OpenSSH
  and PKCS#8 PEM private keys via `crypto.createPrivateKey`; encrypted keys
  are unlocked with `profile.ssh.passphrase`. Pubkey auth is preferred over
  password when both are supplied.
- Connection layer: a single multiplexed session channel (`SshSessionChannel`)
  with FIFO outbound waiters and a send-serialisation chain to preserve byte
  order under concurrent producers. WINDOW_ADJUST, CHANNEL_CLOSE, and channel
  errors all wake every blocked sender.
- SFTP v3 client multiplexing read/write/stat/lstat/fstat/setstat/fsetstat/
  open/close/opendir/readdir/realpath/rename/remove/mkdir/rmdir/readlink/
  symlink, with per-request-id error routing on send failures.
- Handshake timeout: `readyTimeoutMs` (or per-call `profile.timeoutMs`) bounds
  both the TCP connect _and_ the SSH identification + KEX handshake. A hung
  server cannot stall `connect()` indefinitely after the socket is accepted.
- Idle keepalive: `NativeSftpProviderOptions.keepaliveIntervalMs` enables
  periodic `SSH_MSG_IGNORE` packets while the transport is idle so stateful
  NAT / firewall devices do not drop long-lived sessions. The timer resets on
  every outbound payload, so active transfers never generate extra traffic.

Not implemented (gaps vs. ssh2-backed legacy provider):

- `profile.ssh.agent` (ssh-agent forwarding / agent-based signing) is not
  supported in the native provider.
- `@cert-authority` known_hosts entries are skipped (CA certificate
  verification is not implemented).
- No transport-level rekey (no SSH_MSG_KEXINIT after initial key exchange);
  long-lived sessions that exceed the recommended data limits will not rotate
  keys and must be reconnected by the caller.
- `chacha20-poly1305@openssh.com` and AES-GCM are NOT implemented and are
  intentionally excluded from `NATIVE_SFTP_ALGORITHM_PREFERENCES`.
- `ext-info-c` / `ext-info-s` (RFC 8308) is not advertised or processed.
- `SshConnectionManager` opens exactly one subsystem channel (`sftp`); it is
  not a full multi-channel connection layer.

The waves below describe the original plan and remain accurate as a roadmap,
but their per-wave checklists overstate what has shipped. Treat this section
as the source of truth.

## 1. Goal and constraints

Build and ship a first-party SSH and SFTP client implementation in this repository, then remove ssh2 from runtime dependencies while preserving the public SFTP provider behavior used by the SDK.

Constraints:

- Keep current provider contracts green throughout migration.
- Preserve current high-level API and typed error behavior.
- Maintain host-key verification and secure defaults.
- Avoid regressions in stream-based read and write performance.

## 2. Research baseline

The following standards and references define the implementation target.

Core SSH:

- RFC 4251: Architecture.
- RFC 4252: User authentication.
- RFC 4253: Transport.
- RFC 4254: Connection protocol and channels.
- RFC 4256: Keyboard-interactive authentication.

Modern interoperability set:

- RFC 5656: Elliptic curve algorithms.
- RFC 8308: Extension negotiation.
- RFC 8332: RSA SHA-2 signatures.
- RFC 8731: Curve25519 key exchange.

SFTP baseline:

- draft-ietf-secsh-filexfer-02 (SFTP v3; OpenSSH baseline behavior).
- OpenSSH PROTOCOL notes and extension references from OpenSSH specs index.

Important finding:

- OpenSSH documents that SFTP revision 3 is the baseline and newer draft versions are not generally adopted as-is; required production compatibility should target v3 first, then selective extension support.

Environment note:

- During this research pass, direct RFC mirror fetches returned HTTP 403 in this environment. Planning below is still standards-aligned using OpenSSH specs index and available SFTP draft text.

## 3. Current code impact map

Primary runtime replacement targets:

- [src/providers/classic/sftp/SftpProvider.ts](src/providers/classic/sftp/SftpProvider.ts)
- [src/providers/classic/sftp/jumpHost.ts](src/providers/classic/sftp/jumpHost.ts)

Primary test harness and behavior oracle:

- [test/contract/sftpProvider.test.ts](test/contract/sftpProvider.test.ts)
- [test/servers/FakeSftpServer.ts](test/servers/FakeSftpServer.ts)

Build and packaging surfaces to update at cutover:

- [tsup.config.ts](tsup.config.ts)
- [package.json](package.json)
- [packages/sftp/package.json](packages/sftp/package.json)
- [packages/classic/package.json](packages/classic/package.json)
- [scripts/scope-manifest.mjs](scripts/scope-manifest.mjs)

## 4. Target architecture

Introduce an internal protocol stack and adapt the existing provider to it.

Proposed modules:

- src/protocols/ssh/binary
  - Buffer reader and writer for SSH primitive types.
  - Packet framing and parser.
- src/protocols/ssh/transport
  - Identification exchange.
  - KEXINIT negotiation.
  - Key exchange engines.
  - Packet encryption and integrity.
  - Rekey scheduler and state machine.
- src/protocols/ssh/auth
  - none, password, publickey, keyboard-interactive.
  - Agent integration adapter.
- src/protocols/ssh/connection
  - Channel open and close.
  - Flow-control windows.
  - Channel data and extended data.
  - Subsystem request for sftp.
- src/protocols/sftp/v3
  - Packet codec.
  - Request multiplexer by id.
  - Handle table and operation helpers.
  - Status mapping and extension negotiation.
- src/providers/classic/sftp
  - SftpProvider remains API surface.
  - Internal adapter swaps ssh2 client wrappers for new protocol client.

## 5. Protocol scope for first full replacement

### SSH transport minimum ship set

- Protocol identification exchange and banner handling.
- KEX algorithms:
  - curve25519-sha256
  - curve25519-sha256@libssh.org for compatibility fallback
- Server host keys:
  - ssh-ed25519
  - rsa-sha2-256
  - rsa-sha2-512
  - ecdsa-sha2-nistp256
  - ecdsa-sha2-nistp384
  - ecdsa-sha2-nistp521
- Ciphers:
  - chacha20-poly1305@openssh.com
  - aes128-gcm@openssh.com
  - aes256-gcm@openssh.com
  - aes128-ctr and aes256-ctr with HMAC fallback path
- MAC (fallback with CTR path):
  - hmac-sha2-256
  - hmac-sha2-512
- Compression: none in v1 (delayed compression later).
- Rekeying by byte threshold and timer.

### SSH authentication minimum ship set

- password
- publickey
- keyboard-interactive
- ssh agent bridge via existing SshAgentSource shape

### SSH connection protocol minimum ship set

- channel open session
- channel request subsystem sftp
- channel data, eof, close
- window adjust handling

### SFTP v3 minimum ship set

- INIT and VERSION exchange
- OPEN, CLOSE, READ, WRITE
- LSTAT, STAT, FSTAT
- OPENDIR, READDIR
- MKDIR, RMDIR, REMOVE, RENAME
- REALPATH, READLINK, SYMLINK
- STATUS, HANDLE, DATA, NAME, ATTRS
- EXTENDED and EXTENDED_REPLY pass-through support

### OpenSSH extension target set (wave 2)

- posix-rename@openssh.com
- statvfs@openssh.com (optional diagnostics)
- fstatvfs@openssh.com (optional diagnostics)
- hardlink@openssh.com (optional)
- fsync@openssh.com (optional)
- copy-data extension (optional, can back atomic copy in future)

## 6. Waves and execution plan

## Wave 0: Design freeze and scaffolding (1 to 2 weeks)

Deliverables:

- Technical design doc with packet diagrams and state machines.
- Algorithm negotiation matrix and downgrade policy.
- Error mapping table from SSH disconnect and SFTP status to SDK errors.
- New module skeleton and test project wiring.

Exit criteria:

- Architecture review approved.
- Security checklist accepted.
- CI has new protocol unit test suites running.

## Wave 1: SSH transport core (3 to 5 weeks)

Deliverables:

- Binary codec and packet layer with round-trip tests.
- KEXINIT parsing and preference negotiation.
- Curve25519 key exchange and NEWKEYS transition.
- Cipher and MAC pipeline for encrypted packet flow.
- Disconnect and timeout semantics integrated with AbortSignal.

Exit criteria:

- Client can connect and disconnect cleanly against OpenSSH server.
- Host key verified against known_hosts and pinned fingerprint logic.
- Negative tests for malformed packets and MAC failures pass.

## Wave 2: Authentication and channels (2 to 4 weeks)

Deliverables:

- USERAUTH none, password, publickey, keyboard-interactive.
- Agent-backed signing flow.
- Session channel open and subsystem request handling.
- Window management and backpressure under stream load.

Exit criteria:

- Authentication matrix tests pass across all supported methods.
- Connection remains stable for sustained data transfer.

## Wave 3: SFTP v3 client core (3 to 5 weeks)

Deliverables:

- Request id allocator with concurrent in-flight operations.
- Packet codecs and typed operation helpers for full v3 minimum set.
- Status code to typed SDK error mapping.
- Attribute normalization and remote path handling.

Exit criteria:

- All current contract scenarios from [test/contract/sftpProvider.test.ts](test/contract/sftpProvider.test.ts) pass using native client path.
- Read and write streaming interoperability passes against OpenSSH server.

## Wave 4: Provider integration and dual-path rollout (2 to 3 weeks)

Deliverables:

- Adapter layer in [src/providers/classic/sftp/SftpProvider.ts](src/providers/classic/sftp/SftpProvider.ts) supporting two engines:
  - legacy ssh2
  - native protocol
- Runtime feature flag for controlled rollout.
- Comparative integration tests between engines for output equivalence.

Exit criteria:

- Native engine can run in CI as default while legacy remains fallback.
- No public API changes required for consumers.

## Wave 5: Hardening, perf, and extension support (3 to 4 weeks)

Deliverables:

- Rekey reliability under long transfers.
- Stress tests for concurrent requests and large files.
- Fuzzing for packet parser and protocol state transitions.
- Optional OpenSSH extension support prioritized by product value.
- Jump-host logic rewritten on native channel forwarding model.

Exit criteria:

- Perf within target band versus ssh2 baseline.
- No critical security findings in protocol parser and crypto handling.

## Wave 6: Dependency removal and cutover (1 to 2 weeks)

Deliverables:

- Remove ssh2 from runtime dependency graphs.
- Update docs, scope manifests, and package metadata.
- Remove legacy path and dead code.

Exit criteria:

- package lock and workspace manifests no longer include ssh2 at runtime.
- CI green across unit, contract, and integration suites.

## 7. Testing strategy

Test pyramid:

- Unit:
  - binary codec
  - packet parser
  - crypto state transitions
  - auth message builders
  - SFTP packet codecs
- Protocol integration:
  - OpenSSH docker matrix (current stable and previous major)
  - Ciphers and KEX combinations
  - Auth methods matrix
- Contract:
  - Keep [test/contract/sftpProvider.test.ts](test/contract/sftpProvider.test.ts) as compatibility gate.
- Chaos and reliability:
  - packet fragmentation
  - delayed packets
  - rekey during large transfers
  - server disconnect mid-stream

Must-add fixtures:

- Known host mismatch and key rotation scenarios.
- Permission denied vs missing path distinction.
- Keyboard-interactive multi-prompt challenge.
- UTF-8 and edge path normalization scenarios.

## 8. Security requirements

- Constant-time comparisons for host key pin checks.
- Strict known_hosts matching with hashed-host support parity plan.
- Algorithm downgrade protection policy.
- Safe limits on packet sizes and in-flight requests.
- Mandatory validation of all remote handle references.
- Structured audit events for authentication method and host key decisions.

Security review gates:

- Gate A: end of Wave 1 transport review.
- Gate B: end of Wave 3 protocol abuse review.
- Gate C: pre-cutover dependency and supply-chain review.

## 9. Performance targets

Initial targets compared to current ssh2 path on same infra:

- Throughput: at least 90 percent for sequential upload and download.
- CPU: no more than 20 percent overhead at equivalent throughput.
- Memory: bounded in-flight request buffers with no unbounded queue growth.

## 10. Risk register

- Risk: crypto and packet implementation defects.
  - Mitigation: small audited primitives, extensive negative tests, fuzzing.
- Risk: interoperability gaps across server variants.
  - Mitigation: OpenSSH-first target plus compatibility matrix in CI.
- Risk: timeline expansion from protocol complexity.
  - Mitigation: strict wave gates and optional extension deferral.
- Risk: regressions in provider-level behavior.
  - Mitigation: contract tests remain the release gate from day one.

## 11. Suggested staffing and timeline

Recommended team for predictable execution:

- 2 engineers on transport and crypto.
- 1 engineer on auth and connection channels.
- 1 engineer on SFTP client and provider integration.
- 0.5 engineer equivalent on test infra and CI.

Estimated timeline:

- 12 to 20 weeks to production-grade cutover, depending on extension scope and interoperability breadth.

## 12. Immediate next sprint plan

Sprint 1 objectives:

- Create protocol module skeleton and codec tests.
- Land transport packet framing and parser.
- Implement identification exchange and KEXINIT parsing.
- Add OpenSSH docker test harness for native path.

Sprint 1 concrete tasks:

- Add new directories under src/protocols/ssh and src/protocols/sftp/v3.
- Add test suites:
  - test/unit/protocols/ssh
  - test/unit/protocols/sftp
- Add baseline vectors and fixtures for SSH binary types.
- Add design ADR documenting algorithm support and fallback policy.

Definition of done for Sprint 1:

- Binary codec is stable and fully unit-tested.
- First native handshake packets parse and serialize correctly.
- CI runs new protocol tests on pull requests.

## 13. Cutover policy

Rollout stages:

- Stage A: opt-in native engine by feature flag.
- Stage B: default native, legacy fallback enabled.
- Stage C: remove legacy implementation and dependency.

Release safety checks:

- Semver minor while both engines exist.
- Semver major only if any low-level raw session shape must change.
