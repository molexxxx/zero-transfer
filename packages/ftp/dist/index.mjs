// src/client/ZeroTransfer.ts
import { EventEmitter } from "events";

// src/errors/ZeroTransferError.ts
var ZeroTransferError = class extends Error {
  /** Stable machine-readable error code. */
  code;
  /** Protocol active when the error occurred. */
  protocol;
  /** Remote host associated with the failing operation. */
  host;
  /** Protocol command associated with the failure, if any. */
  command;
  /** FTP response code associated with the failure. */
  ftpCode;
  /** SFTP status code associated with the failure. */
  sftpCode;
  /** Remote path associated with the failure. */
  path;
  /** Whether retry policy may safely retry this failure. */
  retryable;
  /** Additional structured details for diagnostics. */
  details;
  /**
   * Creates a structured SDK error.
   *
   * @param details - Code, message, retryability, and optional protocol context.
   */
  constructor(details) {
    super(details.message, details.cause === void 0 ? void 0 : { cause: details.cause });
    this.name = new.target.name;
    this.code = details.code;
    this.retryable = details.retryable;
    if (details.protocol !== void 0) this.protocol = details.protocol;
    if (details.host !== void 0) this.host = details.host;
    if (details.command !== void 0) this.command = details.command;
    if (details.ftpCode !== void 0) this.ftpCode = details.ftpCode;
    if (details.sftpCode !== void 0) this.sftpCode = details.sftpCode;
    if (details.path !== void 0) this.path = details.path;
    if (details.details !== void 0) this.details = details.details;
  }
  /**
   * Serializes the error into a plain object suitable for logs or API responses.
   *
   * @returns A JSON-safe object containing public structured error fields.
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      protocol: this.protocol,
      host: this.host,
      command: this.command,
      ftpCode: this.ftpCode,
      sftpCode: this.sftpCode,
      path: this.path,
      retryable: this.retryable,
      details: this.details
    };
  }
};
function withDefaultCode(details, code) {
  return {
    ...details,
    code: details.code ?? code
  };
}
var ConnectionError = class extends ZeroTransferError {
  /**
   * Creates a connection failure.
   *
   * @param details - Error context with optional host, protocol, and retryability details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_CONNECTION_ERROR"));
  }
};
var AuthenticationError = class extends ZeroTransferError {
  /**
   * Creates an authentication failure.
   *
   * @param details - Error context with optional host, protocol, and command details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_AUTHENTICATION_ERROR"));
  }
};
var AuthorizationError = class extends ZeroTransferError {
  /**
   * Creates an authorization failure.
   *
   * @param details - Error context with optional path and protocol details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_AUTHORIZATION_ERROR"));
  }
};
var PathNotFoundError = class extends ZeroTransferError {
  /**
   * Creates a missing-path failure.
   *
   * @param details - Error context with optional path and protocol details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_PATH_NOT_FOUND"));
  }
};
var PathAlreadyExistsError = class extends ZeroTransferError {
  /**
   * Creates an already-exists failure.
   *
   * @param details - Error context with optional path and command details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_PATH_ALREADY_EXISTS"));
  }
};
var PermissionDeniedError = class extends ZeroTransferError {
  /**
   * Creates a permission failure.
   *
   * @param details - Error context with optional path, command, and protocol details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_PERMISSION_DENIED"));
  }
};
var TimeoutError = class extends ZeroTransferError {
  /**
   * Creates a timeout failure.
   *
   * @param details - Error context with optional duration and retryability details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_TIMEOUT"));
  }
};
var AbortError = class extends ZeroTransferError {
  /**
   * Creates an aborted-operation failure.
   *
   * @param details - Error context with optional operation and path details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_ABORTED"));
  }
};
var ProtocolError = class extends ZeroTransferError {
  /**
   * Creates a protocol failure.
   *
   * @param details - Error context with optional response code and command details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_PROTOCOL_ERROR"));
  }
};
var ParseError = class extends ZeroTransferError {
  /**
   * Creates a parser failure.
   *
   * @param details - Error context with malformed input details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_PARSE_ERROR"));
  }
};
var TransferError = class extends ZeroTransferError {
  /**
   * Creates a transfer failure.
   *
   * @param details - Error context with optional path, bytes, and retryability details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_TRANSFER_ERROR"));
  }
};
var VerificationError = class extends ZeroTransferError {
  /**
   * Creates a verification failure.
   *
   * @param details - Error context with checksum, size, or timestamp mismatch details.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_VERIFICATION_ERROR"));
  }
};
var UnsupportedFeatureError = class extends ZeroTransferError {
  /**
   * Creates an unsupported-feature failure.
   *
   * @param details - Error context describing the missing feature or adapter.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_UNSUPPORTED_FEATURE"));
  }
};
var ConfigurationError = class extends ZeroTransferError {
  /**
   * Creates a configuration failure.
   *
   * @param details - Error context describing the invalid option or argument.
   */
  constructor(details) {
    super(withDefaultCode(details, "ZERO_TRANSFER_CONFIGURATION_ERROR"));
  }
};

// src/logging/Logger.ts
var noopLogger = {
  trace() {
  },
  debug() {
  },
  info() {
  },
  warn() {
  },
  error() {
  }
};
function emitLog(logger, level, record) {
  const method = logger[level];
  if (method === void 0) {
    return;
  }
  const logRecord = {
    ...record,
    level
  };
  method(logRecord, logRecord.message);
}

// src/profiles/ProfileValidator.ts
import { Buffer } from "buffer";

// src/core/ProviderId.ts
var CLASSIC_PROVIDER_IDS = ["ftp", "ftps", "sftp"];
function isClassicProviderId(providerId) {
  return typeof providerId === "string" && CLASSIC_PROVIDER_IDS.includes(providerId);
}
function resolveProviderId(selection) {
  return selection.provider ?? selection.protocol;
}

// src/profiles/ProfileValidator.ts
var TLS_VERSIONS = /* @__PURE__ */ new Set(["TLSv1", "TLSv1.1", "TLSv1.2", "TLSv1.3"]);
var SHA256_FINGERPRINT_HEX_LENGTH = 64;
var SHA256_DIGEST_BYTE_LENGTH = 32;
function validateConnectionProfile(profile) {
  if (resolveProviderId(profile) === void 0) {
    throw new ConfigurationError({
      message: "Connection profiles must include a provider or protocol",
      retryable: false
    });
  }
  if (profile.host.trim().length === 0) {
    throw new ConfigurationError({
      message: "Connection profiles must include a non-empty host",
      retryable: false
    });
  }
  if (profile.port !== void 0 && !isValidPort(profile.port)) {
    throw new ConfigurationError({
      details: { port: profile.port },
      message: "Connection profile port must be an integer between 1 and 65535",
      retryable: false
    });
  }
  if (profile.timeoutMs !== void 0 && !isPositiveFiniteNumber(profile.timeoutMs)) {
    throw new ConfigurationError({
      details: { timeoutMs: profile.timeoutMs },
      message: "Connection profile timeoutMs must be a positive finite number",
      retryable: false
    });
  }
  if (profile.tls !== void 0) {
    validateTlsProfile(profile.tls);
  }
  if (profile.ssh !== void 0) {
    validateSshProfile(profile.ssh);
  }
  return profile;
}
function validateSshProfile(profile) {
  validatePinnedHostKeySha256(profile.pinnedHostKeySha256);
  if (profile.algorithms !== void 0) {
    validateSshAlgorithms(profile.algorithms);
  }
  if (profile.agent !== void 0) {
    validateSshAgentSource(profile.agent);
  }
  if (profile.keyboardInteractive !== void 0 && typeof profile.keyboardInteractive !== "function") {
    throw new ConfigurationError({
      details: { keyboardInteractive: typeof profile.keyboardInteractive },
      message: "Connection profile ssh.keyboardInteractive must be a function when provided",
      retryable: false
    });
  }
  if (profile.socketFactory !== void 0 && typeof profile.socketFactory !== "function") {
    throw new ConfigurationError({
      details: { socketFactory: typeof profile.socketFactory },
      message: "Connection profile ssh.socketFactory must be a function when provided",
      retryable: false
    });
  }
}
function validateSshAlgorithms(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw createSshAlgorithmsError(value);
  }
  const algorithms = value;
  for (const [name, list] of Object.entries(algorithms)) {
    if (list === void 0) {
      continue;
    }
    if (Array.isArray(list)) {
      if (!isNonEmptyStringArray(list)) {
        throw createSshAlgorithmsError({ [name]: list });
      }
      continue;
    }
    if (typeof list !== "object" || list === null || Array.isArray(list)) {
      throw createSshAlgorithmsError({ [name]: list });
    }
    const operationLists = list;
    for (const [operation, operationList] of Object.entries(operationLists)) {
      if (!["append", "prepend", "remove"].includes(operation)) {
        throw createSshAlgorithmsError({ [name]: list });
      }
      if (typeof operationList !== "string" && (!Array.isArray(operationList) || !isNonEmptyStringArray(operationList))) {
        throw createSshAlgorithmsError({ [name]: list });
      }
    }
  }
}
function isNonEmptyStringArray(value) {
  return value.length > 0 && value.every((item) => typeof item === "string" && item.length > 0);
}
function validateSshAgentSource(value) {
  if (typeof value === "string") {
    if (value.trim().length > 0) {
      return;
    }
  } else if (typeof value === "object" && value !== null && typeof value.getIdentities === "function" && typeof value.sign === "function") {
    return;
  }
  throw new ConfigurationError({
    details: { agent: typeof value },
    message: "Connection profile ssh.agent must be a non-empty socket path or agent object",
    retryable: false
  });
}
function validateTlsProfile(profile) {
  if (profile.servername !== void 0 && profile.servername.trim().length === 0) {
    throw new ConfigurationError({
      message: "Connection profile tls.servername must be non-empty when provided",
      retryable: false
    });
  }
  if (profile.rejectUnauthorized !== void 0 && typeof profile.rejectUnauthorized !== "boolean") {
    throw new ConfigurationError({
      details: { rejectUnauthorized: profile.rejectUnauthorized },
      message: "Connection profile tls.rejectUnauthorized must be a boolean",
      retryable: false
    });
  }
  validateTlsVersion(profile.minVersion, "minVersion");
  validateTlsVersion(profile.maxVersion, "maxVersion");
  validatePinnedFingerprint256(profile.pinnedFingerprint256);
}
function validatePinnedFingerprint256(value) {
  if (value === void 0) {
    return;
  }
  const fingerprints = Array.isArray(value) ? value : [value];
  if (fingerprints.length === 0) {
    throw createPinnedFingerprintError(value);
  }
  for (const fingerprint of fingerprints) {
    if (typeof fingerprint !== "string" || !isSha256Fingerprint(fingerprint)) {
      throw createPinnedFingerprintError(value);
    }
  }
}
function validatePinnedHostKeySha256(value) {
  if (value === void 0) {
    return;
  }
  const fingerprints = Array.isArray(value) ? value : [value];
  if (fingerprints.length === 0) {
    throw createPinnedHostKeyError(value);
  }
  for (const fingerprint of fingerprints) {
    if (typeof fingerprint !== "string" || !isSshHostKeySha256Fingerprint(fingerprint)) {
      throw createPinnedHostKeyError(value);
    }
  }
}
function isSha256Fingerprint(value) {
  const normalized = value.trim().replace(/:/g, "");
  return normalized.length === SHA256_FINGERPRINT_HEX_LENGTH && /^[a-f0-9]+$/i.test(normalized);
}
function isSshHostKeySha256Fingerprint(value) {
  const trimmed = value.trim();
  if (isSha256Fingerprint(trimmed)) {
    return true;
  }
  const bare = trimmed.startsWith("SHA256:") ? trimmed.slice("SHA256:".length) : trimmed;
  const padded = padBase64(bare);
  if (!/^[a-z0-9+/]+={0,2}$/i.test(padded)) {
    return false;
  }
  try {
    return Buffer.from(padded, "base64").byteLength === SHA256_DIGEST_BYTE_LENGTH;
  } catch {
    return false;
  }
}
function padBase64(value) {
  const remainder = value.length % 4;
  return remainder === 0 ? value : `${value}${"=".repeat(4 - remainder)}`;
}
function createPinnedFingerprintError(value) {
  return new ConfigurationError({
    details: { pinnedFingerprint256: value },
    message: "Connection profile tls.pinnedFingerprint256 must be a SHA-256 hex fingerprint or non-empty array of fingerprints",
    retryable: false
  });
}
function createPinnedHostKeyError(value) {
  return new ConfigurationError({
    details: { pinnedHostKeySha256: value },
    message: "Connection profile ssh.pinnedHostKeySha256 must be an OpenSSH SHA256, base64, or hex fingerprint or non-empty array of fingerprints",
    retryable: false
  });
}
function createSshAlgorithmsError(value) {
  return new ConfigurationError({
    details: { algorithms: value },
    message: "Connection profile ssh.algorithms must use ssh2-compatible non-empty algorithm lists",
    retryable: false
  });
}
function validateTlsVersion(value, field) {
  if (value === void 0) {
    return;
  }
  if (!TLS_VERSIONS.has(value)) {
    throw new ConfigurationError({
      details: { [field]: value },
      message: `Connection profile tls.${field} must be a supported TLS version`,
      retryable: false
    });
  }
}
function isValidPort(value) {
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}
function isPositiveFiniteNumber(value) {
  return Number.isFinite(value) && value > 0;
}

// src/core/ProviderRegistry.ts
var ProviderRegistry = class {
  factories = /* @__PURE__ */ new Map();
  /**
   * Creates a registry and optionally seeds it with provider factories.
   *
   * @param providers - Provider factories to register immediately.
   */
  constructor(providers = []) {
    for (const provider of providers) {
      this.register(provider);
    }
  }
  /**
   * Registers a provider factory.
   *
   * @param provider - Provider factory to add.
   * @returns This registry for fluent setup.
   * @throws {@link ConfigurationError} When a provider id is registered twice.
   */
  register(provider) {
    if (this.factories.has(provider.id)) {
      throw new ConfigurationError({
        details: { provider: provider.id },
        message: `Provider "${provider.id}" is already registered`,
        retryable: false
      });
    }
    this.factories.set(provider.id, provider);
    return this;
  }
  /**
   * Removes a provider factory from the registry.
   *
   * @param providerId - Provider id to remove.
   * @returns `true` when a provider was removed.
   */
  unregister(providerId) {
    return this.factories.delete(providerId);
  }
  /**
   * Checks whether a provider id is registered.
   *
   * @param providerId - Provider id to inspect.
   * @returns `true` when a provider factory exists.
   */
  has(providerId) {
    return this.factories.has(providerId);
  }
  /**
   * Gets a provider factory when registered.
   *
   * @param providerId - Provider id to retrieve.
   * @returns The provider factory, or `undefined` when missing.
   */
  get(providerId) {
    return this.factories.get(providerId);
  }
  /**
   * Gets a registered provider factory or throws a typed SDK error.
   *
   * @param providerId - Provider id to retrieve.
   * @returns The registered provider factory.
   * @throws {@link UnsupportedFeatureError} When no provider has been registered.
   */
  require(providerId) {
    const provider = this.get(providerId);
    if (provider === void 0) {
      throw new UnsupportedFeatureError({
        details: { provider: providerId },
        message: `Provider "${providerId}" is not registered`,
        retryable: false
      });
    }
    return provider;
  }
  /**
   * Gets a provider capability snapshot when registered.
   *
   * @param providerId - Provider id to inspect.
   * @returns Capability snapshot, or `undefined` when missing.
   */
  getCapabilities(providerId) {
    return this.get(providerId)?.capabilities;
  }
  /**
   * Gets a provider capability snapshot or throws a typed SDK error.
   *
   * @param providerId - Provider id to inspect.
   * @returns Capability snapshot for the registered provider.
   * @throws {@link UnsupportedFeatureError} When no provider has been registered.
   */
  requireCapabilities(providerId) {
    return this.require(providerId).capabilities;
  }
  /**
   * Lists registered provider factories in insertion order.
   *
   * @returns Registered provider factories.
   */
  list() {
    return [...this.factories.values()];
  }
  /**
   * Lists registered provider capabilities in insertion order.
   *
   * @returns Capability snapshots for every registered provider.
   */
  listCapabilities() {
    return this.list().map((provider) => provider.capabilities);
  }
};

// src/core/TransferClient.ts
var TransferClient = class {
  /** Provider registry used by this client. */
  registry;
  logger;
  /**
   * Creates a transfer client without opening any provider connections.
   *
   * @param options - Optional registry, provider factories, and logger.
   */
  constructor(options = {}) {
    this.registry = options.registry ?? new ProviderRegistry();
    this.logger = options.logger ?? noopLogger;
    for (const provider of options.providers ?? []) {
      this.registry.register(provider);
    }
  }
  /**
   * Registers a provider factory with this client's registry.
   *
   * @param provider - Provider factory to register.
   * @returns This client for fluent setup.
   */
  registerProvider(provider) {
    this.registry.register(provider);
    return this;
  }
  /**
   * Checks whether this client can create sessions for a provider id.
   *
   * @param providerId - Provider id to inspect.
   * @returns `true` when a provider factory is registered.
   */
  hasProvider(providerId) {
    return this.registry.has(providerId);
  }
  getCapabilities(providerId) {
    if (providerId === void 0) {
      return this.registry.listCapabilities();
    }
    return this.registry.requireCapabilities(providerId);
  }
  /**
   * Opens a provider session using `profile.provider`, with `profile.protocol` as compatibility fallback.
   *
   * @param profile - Connection profile containing a provider or legacy protocol field.
   * @returns A connected provider session.
   * @throws {@link ConfigurationError} When neither provider nor protocol is present.
   */
  async connect(profile) {
    const validProfile = validateConnectionProfile(profile);
    const providerId = resolveProviderId(validProfile);
    if (providerId === void 0) {
      throw new ConfigurationError({
        message: "Connection profiles must include a provider or protocol",
        retryable: false
      });
    }
    const providerFactory = this.registry.require(providerId);
    const provider = providerFactory.create();
    const normalizedProfile = {
      ...validProfile,
      provider: providerId
    };
    if (normalizedProfile.protocol === void 0 && isClassicProviderId(providerId)) {
      normalizedProfile.protocol = providerId;
    }
    emitLog(this.logger, "info", createConnectLogRecord(normalizedProfile, providerId));
    return provider.connect(normalizedProfile);
  }
};
function createConnectLogRecord(profile, providerId) {
  const record = {
    component: "core",
    host: profile.host,
    message: "Connecting through provider",
    provider: providerId
  };
  if (isClassicProviderId(providerId)) {
    record.protocol = providerId;
  }
  return record;
}

// src/core/createTransferClient.ts
function createTransferClient(options = {}) {
  return new TransferClient(options);
}

// src/client/ZeroTransfer.ts
var ZeroTransfer = class _ZeroTransfer extends EventEmitter {
  /** Creates a provider-neutral transfer client with the built-in provider registry. */
  static createTransferClient = createTransferClient;
  /** Protocol selected for this client instance. */
  protocol;
  logger;
  adapter;
  connected = false;
  /**
   * Creates a client facade without opening a network connection.
   *
   * @param options - Optional facade configuration, logger, and protocol adapter.
   */
  constructor(options = {}) {
    super();
    this.protocol = options.protocol ?? "ftp";
    this.logger = options.logger ?? noopLogger;
    this.adapter = options.adapter;
  }
  /**
   * Creates a new client facade using the provided options.
   *
   * @param options - Optional facade configuration, logger, and adapter.
   * @returns A disconnected {@link ZeroTransfer} instance.
   */
  static create(options = {}) {
    return new _ZeroTransfer(options);
  }
  /**
   * Creates a client and connects it in one step.
   *
   * @param profile - Remote host, authentication, and protocol connection settings.
   * @param options - Optional facade settings that can be overridden by the profile.
   * @returns A connected {@link ZeroTransfer} instance.
   * @throws {@link UnsupportedFeatureError} When no adapter is available for the protocol.
   */
  static async connect(profile, options = {}) {
    const clientOptions = { ...options };
    if (profile.logger !== void 0) {
      clientOptions.logger = profile.logger;
    }
    if (profile.protocol !== void 0) {
      clientOptions.protocol = profile.protocol;
    } else if (isClassicProviderId(profile.provider)) {
      clientOptions.protocol = profile.provider;
    }
    const client = new _ZeroTransfer(clientOptions);
    await client.connect(profile);
    return client;
  }
  /**
   * Opens a remote connection through the configured protocol adapter.
   *
   * @param profile - Remote host, authentication, timeout, logger, and protocol settings.
   * @returns A promise that resolves after the adapter reports a successful connection.
   * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
   */
  async connect(profile) {
    const adapter = this.requireAdapter();
    const protocol = profile.protocol ?? (isClassicProviderId(profile.provider) ? profile.provider : this.protocol);
    emitLog(this.logger, "info", {
      component: "client",
      host: profile.host,
      message: "Connecting",
      protocol
    });
    await adapter.connect({
      ...profile,
      protocol
    });
    this.connected = true;
    this.emit("connect", {
      host: profile.host,
      protocol
    });
  }
  /**
   * Closes the active remote connection if one exists.
   *
   * @returns A promise that resolves after the adapter disconnects or immediately when idle.
   */
  async disconnect() {
    if (this.adapter !== void 0 && this.connected) {
      await this.adapter.disconnect();
    }
    this.connected = false;
    this.emit("disconnect");
  }
  /**
   * Checks whether the facade currently considers the adapter connected.
   *
   * @returns `true` after a successful connection and before disconnection.
   */
  isConnected() {
    return this.connected;
  }
  /**
   * Describes protocol and adapter readiness for feature discovery.
   *
   * @returns A capability snapshot for diagnostics and UI state.
   */
  getCapabilities() {
    return {
      adapterReady: this.adapter !== void 0,
      protocol: this.protocol
    };
  }
  /**
   * Lists remote entries for a path using the configured adapter.
   *
   * @param path - Remote directory path to inspect.
   * @param options - Optional listing controls such as recursion and abort signal.
   * @returns Normalized remote entries for the requested directory.
   * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
   */
  async list(path2, options) {
    return this.requireAdapter().list(path2, options);
  }
  /**
   * Reads metadata for a remote path using the configured adapter.
   *
   * @param path - Remote file, directory, or symbolic-link path to inspect.
   * @param options - Optional stat controls such as abort signal.
   * @returns Normalized metadata for an existing remote entry.
   * @throws {@link UnsupportedFeatureError} When the client does not have an adapter.
   */
  async stat(path2, options) {
    return this.requireAdapter().stat(path2, options);
  }
  /**
   * Returns the configured adapter or raises the alpha unsupported-feature error.
   *
   * @returns A concrete remote file adapter ready to execute operations.
   * @throws {@link UnsupportedFeatureError} When no adapter has been provided.
   */
  requireAdapter() {
    if (this.adapter === void 0) {
      throw new UnsupportedFeatureError({
        message: `The ${this.protocol.toUpperCase()} adapter is not implemented in this alpha foundation yet`,
        protocol: this.protocol,
        retryable: false
      });
    }
    return this.adapter;
  }
};

// src/client/operations.ts
import { isAbsolute, resolve as resolvePath } from "path";

// src/transfers/BandwidthThrottle.ts
function createBandwidthThrottle(limit, options = {}) {
  if (limit === void 0) return void 0;
  const bytesPerSecond = normalizeRate(limit.bytesPerSecond);
  const burstBytes = normalizeBurst(limit.burstBytes, bytesPerSecond);
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? defaultSleep;
  let tokens = burstBytes;
  let lastRefillAt = now();
  function refill() {
    const current = now();
    const elapsedMs = Math.max(0, current - lastRefillAt);
    if (elapsedMs > 0) {
      tokens = Math.min(burstBytes, tokens + elapsedMs / 1e3 * bytesPerSecond);
      lastRefillAt = current;
    }
  }
  async function consume(bytes, signal) {
    if (!Number.isFinite(bytes) || bytes < 0) {
      throw new ConfigurationError({
        details: { bytes },
        message: "Bandwidth throttle byte count must be a non-negative number",
        retryable: false
      });
    }
    if (bytes === 0) return;
    let remaining = bytes;
    while (remaining > 0) {
      throwIfAborted(signal);
      refill();
      if (tokens >= remaining) {
        tokens -= remaining;
        return;
      }
      if (tokens >= burstBytes) {
        const drained = tokens;
        tokens = 0;
        remaining -= drained;
        const waitMs2 = Math.ceil(Math.min(remaining, burstBytes) / bytesPerSecond * 1e3);
        await sleep(waitMs2, signal);
        continue;
      }
      const deficit = Math.min(remaining, burstBytes) - tokens;
      const waitMs = Math.max(1, Math.ceil(deficit / bytesPerSecond * 1e3));
      await sleep(waitMs, signal);
    }
  }
  return { burstBytes, bytesPerSecond, consume };
}
function throttleByteIterable(source, throttle, signal) {
  if (throttle === void 0) return source;
  return {
    [Symbol.asyncIterator]: async function* () {
      for await (const chunk of source) {
        throwIfAborted(signal);
        if (chunk.byteLength > 0) {
          await throttle.consume(chunk.byteLength, signal);
        }
        yield chunk;
      }
    }
  };
}
function normalizeRate(value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ConfigurationError({
      details: { bytesPerSecond: value },
      message: "Bandwidth limit bytesPerSecond must be a positive number",
      retryable: false
    });
  }
  return value;
}
function normalizeBurst(value, bytesPerSecond) {
  if (value === void 0) return bytesPerSecond;
  if (!Number.isFinite(value) || value <= 0) {
    throw new ConfigurationError({
      details: { burstBytes: value },
      message: "Bandwidth limit burstBytes must be a positive number when provided",
      retryable: false
    });
  }
  return value;
}
function throwIfAborted(signal) {
  if (signal?.aborted === true) {
    throw new AbortError({
      message: "Bandwidth throttle wait aborted",
      retryable: false
    });
  }
}
function defaultSleep(delayMs, signal) {
  if (delayMs <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);
    const onAbort = () => {
      cleanup();
      reject(
        new AbortError({
          message: "Bandwidth throttle wait aborted",
          retryable: false
        })
      );
    };
    function cleanup() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
    if (signal !== void 0) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

// src/transfers/createProviderTransferExecutor.ts
function createProviderTransferExecutor(options) {
  return async (context) => {
    const { job } = context;
    if (!isReadWriteOperation(job.operation)) {
      throw new UnsupportedFeatureError({
        details: { jobId: job.id, operation: job.operation },
        message: `Provider read/write executor does not support transfer operation: ${job.operation}`,
        retryable: false
      });
    }
    const source = requireEndpoint(job, "source");
    const destination = requireEndpoint(job, "destination");
    const sourceSession = options.resolveSession({ endpoint: source, job, role: "source" });
    const destinationSession = options.resolveSession({
      endpoint: destination,
      job,
      role: "destination"
    });
    const sourceTransfers = requireTransferOperations(sourceSession, source, "source", job);
    const destinationTransfers = requireTransferOperations(
      destinationSession,
      destination,
      "destination",
      job
    );
    context.throwIfAborted();
    const readResult = await sourceTransfers.read(createReadRequest(context, source));
    context.throwIfAborted();
    const throttledReadResult = applyBandwidthThrottle(readResult, context, options.throttle);
    const writeResult = await destinationTransfers.write(
      createWriteRequest(context, destination, throttledReadResult)
    );
    return mergeProviderTransferResult(readResult, writeResult, job);
  };
}
function applyBandwidthThrottle(readResult, context, options) {
  const throttle = createBandwidthThrottle(context.bandwidthLimit, options);
  if (throttle === void 0) return readResult;
  return {
    ...readResult,
    content: throttleByteIterable(readResult.content, throttle, context.signal)
  };
}
function isReadWriteOperation(operation) {
  return operation === "copy" || operation === "download" || operation === "upload";
}
function requireEndpoint(job, role) {
  const endpoint = role === "source" ? job.source : job.destination;
  if (endpoint === void 0) {
    throw new ConfigurationError({
      details: { jobId: job.id, operation: job.operation, role },
      message: `Transfer job requires a ${role} endpoint: ${job.id}`,
      retryable: false
    });
  }
  return endpoint;
}
function requireTransferOperations(session, endpoint, role, job) {
  if (session === void 0) {
    throw new UnsupportedFeatureError({
      details: { endpoint: cloneEndpoint(endpoint), jobId: job.id, operation: job.operation, role },
      message: `No provider session resolved for ${role} endpoint: ${endpoint.path}`,
      retryable: false
    });
  }
  if (session.transfers === void 0) {
    throw new UnsupportedFeatureError({
      details: {
        endpoint: cloneEndpoint(endpoint),
        jobId: job.id,
        operation: job.operation,
        provider: session.provider,
        role
      },
      message: `Provider session does not expose transfer operations: ${session.provider}`,
      retryable: false
    });
  }
  return session.transfers;
}
function createReadRequest(context, endpoint) {
  const request = {
    attempt: context.attempt,
    endpoint: cloneEndpoint(endpoint),
    job: context.job,
    reportProgress: (bytesTransferred, totalBytes) => context.reportProgress(bytesTransferred, totalBytes),
    throwIfAborted: () => context.throwIfAborted()
  };
  if (context.signal !== void 0) request.signal = context.signal;
  if (context.bandwidthLimit !== void 0) {
    request.bandwidthLimit = { ...context.bandwidthLimit };
  }
  return request;
}
function createWriteRequest(context, endpoint, readResult) {
  const request = {
    attempt: context.attempt,
    content: readResult.content,
    endpoint: cloneEndpoint(endpoint),
    job: context.job,
    reportProgress: (bytesTransferred, totalBytes2) => context.reportProgress(bytesTransferred, totalBytes2),
    throwIfAborted: () => context.throwIfAborted()
  };
  const totalBytes = readResult.totalBytes ?? context.job.totalBytes;
  if (context.signal !== void 0) request.signal = context.signal;
  if (context.bandwidthLimit !== void 0) {
    request.bandwidthLimit = { ...context.bandwidthLimit };
  }
  if (totalBytes !== void 0) request.totalBytes = totalBytes;
  if (context.job.resumed === true) request.offset = readResult.bytesRead ?? 0;
  if (readResult.verification !== void 0) {
    request.verification = cloneVerification(readResult.verification);
  }
  return request;
}
function mergeProviderTransferResult(readResult, writeResult, job) {
  const result = {
    bytesTransferred: writeResult.bytesTransferred
  };
  const totalBytes = writeResult.totalBytes ?? readResult.totalBytes ?? job.totalBytes;
  const warnings = [...readResult.warnings ?? [], ...writeResult.warnings ?? []];
  if (totalBytes !== void 0) result.totalBytes = totalBytes;
  if (writeResult.resumed !== void 0) result.resumed = writeResult.resumed;
  if (writeResult.verified !== void 0) result.verified = writeResult.verified;
  if (writeResult.checksum !== void 0) result.checksum = writeResult.checksum;
  else if (readResult.checksum !== void 0) result.checksum = readResult.checksum;
  if (writeResult.verification !== void 0) {
    result.verification = cloneVerification(writeResult.verification);
  } else if (readResult.verification !== void 0) {
    result.verification = cloneVerification(readResult.verification);
  }
  if (warnings.length > 0) result.warnings = warnings;
  return result;
}
function cloneEndpoint(endpoint) {
  const clone = { path: endpoint.path };
  if (endpoint.provider !== void 0) clone.provider = endpoint.provider;
  return clone;
}
function cloneVerification(verification) {
  const clone = { verified: verification.verified };
  if (verification.method !== void 0) clone.method = verification.method;
  if (verification.checksum !== void 0) clone.checksum = verification.checksum;
  if (verification.expectedChecksum !== void 0) {
    clone.expectedChecksum = verification.expectedChecksum;
  }
  if (verification.actualChecksum !== void 0) clone.actualChecksum = verification.actualChecksum;
  if (verification.details !== void 0) clone.details = { ...verification.details };
  return clone;
}

// src/services/TransferService.ts
function createTransferResult(input) {
  const durationMs = Math.max(0, input.completedAt.getTime() - input.startedAt.getTime());
  const result = {
    destinationPath: input.destinationPath,
    bytesTransferred: input.bytesTransferred,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    durationMs,
    averageBytesPerSecond: calculateBytesPerSecond(input.bytesTransferred, durationMs),
    resumed: input.resumed ?? false,
    verified: input.verified ?? false
  };
  if (input.sourcePath !== void 0) result.sourcePath = input.sourcePath;
  if (input.checksum !== void 0) result.checksum = input.checksum;
  return result;
}
function createProgressEvent(input) {
  const now = input.now ?? /* @__PURE__ */ new Date();
  const elapsedMs = Math.max(0, now.getTime() - input.startedAt.getTime());
  const event = {
    transferId: input.transferId,
    bytesTransferred: input.bytesTransferred,
    startedAt: input.startedAt,
    elapsedMs,
    bytesPerSecond: calculateBytesPerSecond(input.bytesTransferred, elapsedMs)
  };
  if (input.totalBytes !== void 0) {
    event.totalBytes = input.totalBytes;
    event.percent = input.totalBytes > 0 ? input.bytesTransferred / input.totalBytes * 100 : 0;
  }
  return event;
}
function calculateBytesPerSecond(bytes, durationMs) {
  if (durationMs <= 0) {
    return bytes;
  }
  return bytes / (durationMs / 1e3);
}

// src/transfers/TransferEngine.ts
var TransferEngine = class {
  now;
  /**
   * Creates a transfer engine.
   *
   * @param options - Optional clock override for deterministic tests.
   */
  constructor(options = {}) {
    this.now = options.now ?? (() => /* @__PURE__ */ new Date());
  }
  /**
   * Executes a transfer job through a caller-supplied operation.
   *
   * @param job - Job metadata used for correlation and receipts.
   * @param executor - Concrete transfer operation implementation.
   * @param options - Optional abort, retry, and progress hooks.
   * @returns Receipt for the completed transfer.
   * @throws {@link AbortError} When execution is cancelled.
   * @throws {@link TransferError} When all attempts fail.
   */
  async execute(job, executor, options = {}) {
    const maxAttempts = normalizeMaxAttempts(options.retry?.maxAttempts);
    const attempts = [];
    const startedAt = this.now();
    const abortScope = createAbortScope(options.signal, options.timeout, job);
    let latestBytesTransferred = 0;
    try {
      for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
        this.throwIfAborted(abortScope.signal, job);
        const attemptStartedAt = this.now();
        const context = this.createExecutionContext(
          job,
          attemptNumber,
          attemptStartedAt,
          options,
          abortScope.signal,
          (bytesTransferred) => {
            latestBytesTransferred = bytesTransferred;
          }
        );
        try {
          const result = await runExecutor(executor, context, abortScope.signal, job);
          context.throwIfAborted();
          latestBytesTransferred = result.bytesTransferred;
          const completedAt = this.now();
          attempts.push(
            createAttempt(attemptNumber, attemptStartedAt, completedAt, result.bytesTransferred)
          );
          return createReceipt(job, result, attempts, startedAt, completedAt);
        } catch (error) {
          const completedAt = this.now();
          const attempt = createAttempt(
            attemptNumber,
            attemptStartedAt,
            completedAt,
            latestBytesTransferred,
            summarizeError(error)
          );
          attempts.push(attempt);
          if (error instanceof AbortError || error instanceof TimeoutError) {
            throw error;
          }
          const retryInput = { attempt: attemptNumber, error, job };
          const shouldRetry = attemptNumber < maxAttempts && (options.retry?.shouldRetry?.(retryInput) ?? isRetryable(error));
          if (shouldRetry) {
            options.retry?.onRetry?.(retryInput);
            continue;
          }
          throw createTransferFailure(job, error, attempts);
        }
      }
      throw createTransferFailure(job, void 0, attempts);
    } finally {
      abortScope.dispose();
    }
  }
  createExecutionContext(job, attempt, startedAt, options, signal, updateBytesTransferred) {
    const context = {
      attempt,
      job,
      reportProgress: (bytesTransferred, totalBytes) => {
        this.throwIfAborted(signal, job);
        updateBytesTransferred(bytesTransferred);
        const progressInput = {
          bytesTransferred,
          now: this.now(),
          startedAt,
          transferId: job.id
        };
        const resolvedTotalBytes = totalBytes ?? job.totalBytes;
        const event = createProgressEvent(
          resolvedTotalBytes === void 0 ? progressInput : { ...progressInput, totalBytes: resolvedTotalBytes }
        );
        options.onProgress?.(event);
        return event;
      },
      throwIfAborted: () => this.throwIfAborted(signal, job)
    };
    if (signal !== void 0) {
      context.signal = signal;
    }
    if (options.bandwidthLimit !== void 0) {
      context.bandwidthLimit = { ...options.bandwidthLimit };
    }
    return context;
  }
  throwIfAborted(signal, job) {
    if (signal?.aborted === true) {
      if (signal.reason instanceof ZeroTransferError) {
        throw signal.reason;
      }
      throw new AbortError({
        details: { jobId: job.id, operation: job.operation },
        message: `Transfer job aborted: ${job.id}`,
        retryable: false
      });
    }
  }
};
function createAbortScope(parentSignal, timeout, job) {
  const timeoutMs = normalizeTimeoutMs(timeout?.timeoutMs);
  if (parentSignal === void 0 && timeoutMs === void 0) {
    return { dispose: () => void 0 };
  }
  const controller = new AbortController();
  const abortFromParent = () => controller.abort(parentSignal?.reason);
  const timeoutHandle = timeoutMs === void 0 ? void 0 : setTimeout(() => {
    controller.abort(
      new TimeoutError({
        details: { jobId: job.id, operation: job.operation, timeoutMs },
        message: `Transfer job timed out after ${timeoutMs}ms: ${job.id}`,
        retryable: timeout?.retryable ?? true
      })
    );
  }, timeoutMs);
  if (parentSignal?.aborted === true) {
    abortFromParent();
  } else {
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  }
  return {
    dispose: () => {
      if (timeoutHandle !== void 0) {
        clearTimeout(timeoutHandle);
      }
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
    signal: controller.signal
  };
}
function normalizeTimeoutMs(value) {
  if (value === void 0 || !Number.isFinite(value) || value <= 0) {
    return void 0;
  }
  return Math.floor(value);
}
async function runExecutor(executor, context, signal, job) {
  if (signal === void 0) {
    return executor(context);
  }
  return Promise.race([executor(context), rejectWhenAborted(signal, job)]);
}
function rejectWhenAborted(signal, job) {
  return new Promise((_, reject) => {
    const rejectAbort = () => {
      if (signal.reason instanceof ZeroTransferError) {
        reject(signal.reason);
        return;
      }
      reject(
        new AbortError({
          details: { jobId: job.id, operation: job.operation },
          message: `Transfer job aborted: ${job.id}`,
          retryable: false
        })
      );
    };
    if (signal.aborted) {
      rejectAbort();
      return;
    }
    signal.addEventListener("abort", rejectAbort, { once: true });
  });
}
function normalizeMaxAttempts(value) {
  if (value === void 0) {
    return 1;
  }
  return Math.max(1, Math.floor(value));
}
function createAttempt(attempt, startedAt, completedAt, bytesTransferred, error) {
  const result = {
    attempt,
    bytesTransferred,
    completedAt,
    durationMs: Math.max(0, completedAt.getTime() - startedAt.getTime()),
    startedAt
  };
  if (error !== void 0) {
    result.error = error;
  }
  return result;
}
function createReceipt(job, result, attempts, startedAt, completedAt) {
  const durationMs = Math.max(0, completedAt.getTime() - startedAt.getTime());
  const verification = normalizeVerificationResult(result);
  const receipt = {
    attempts,
    averageBytesPerSecond: calculateBytesPerSecond2(result.bytesTransferred, durationMs),
    bytesTransferred: result.bytesTransferred,
    completedAt,
    durationMs,
    jobId: job.id,
    operation: job.operation,
    resumed: result.resumed ?? job.resumed ?? false,
    startedAt,
    transferId: job.id,
    verified: verification?.verified ?? result.verified ?? false,
    warnings: [...result.warnings ?? []]
  };
  if (job.source !== void 0) receipt.source = { ...job.source };
  if (job.destination !== void 0) receipt.destination = { ...job.destination };
  if (result.totalBytes !== void 0) receipt.totalBytes = result.totalBytes;
  else if (job.totalBytes !== void 0) receipt.totalBytes = job.totalBytes;
  if (result.checksum !== void 0) receipt.checksum = result.checksum;
  else if (verification?.checksum !== void 0) receipt.checksum = verification.checksum;
  if (verification !== void 0) receipt.verification = verification;
  if (job.metadata !== void 0) receipt.metadata = { ...job.metadata };
  return receipt;
}
function normalizeVerificationResult(result) {
  const verification = result.verification;
  if (verification !== void 0) {
    const normalized2 = { verified: verification.verified };
    if (verification.method !== void 0) normalized2.method = verification.method;
    if (verification.checksum !== void 0) normalized2.checksum = verification.checksum;
    if (verification.expectedChecksum !== void 0) {
      normalized2.expectedChecksum = verification.expectedChecksum;
    }
    if (verification.actualChecksum !== void 0)
      normalized2.actualChecksum = verification.actualChecksum;
    if (verification.details !== void 0) normalized2.details = { ...verification.details };
    return normalized2;
  }
  if (result.verified === void 0 && result.checksum === void 0) {
    return void 0;
  }
  const normalized = { verified: result.verified ?? false };
  if (result.checksum !== void 0) {
    normalized.checksum = result.checksum;
  }
  return normalized;
}
function createTransferFailure(job, error, attempts) {
  return new TransferError({
    cause: error,
    details: {
      attempts,
      jobId: job.id,
      operation: job.operation
    },
    message: `Transfer job failed: ${job.id}`,
    retryable: isRetryable(error)
  });
}
function summarizeError(error) {
  if (error instanceof ZeroTransferError) {
    return {
      code: error.code,
      message: error.message,
      name: error.name,
      retryable: error.retryable
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name
    };
  }
  return {
    message: String(error),
    name: "Error"
  };
}
function isRetryable(error) {
  return error instanceof ZeroTransferError && error.retryable;
}
function calculateBytesPerSecond2(bytes, durationMs) {
  if (durationMs <= 0) {
    return bytes;
  }
  return bytes / (durationMs / 1e3);
}

// src/mft/runRoute.ts
async function runRoute(options) {
  const { client, route } = options;
  if (route.enabled === false) {
    throw new ConfigurationError({
      details: { routeId: route.id },
      message: `MFT route "${route.id}" is disabled`,
      retryable: false
    });
  }
  const sourceSession = await client.connect(route.source.profile);
  let destinationSession;
  try {
    destinationSession = await client.connect(route.destination.profile);
    const engine = options.engine ?? new TransferEngine();
    const job = createRouteJob(route, sourceSession, destinationSession, options);
    const sessions = /* @__PURE__ */ new Map([
      ["source", sourceSession],
      ["destination", destinationSession]
    ]);
    const executor = createProviderTransferExecutor({
      resolveSession: ({ role }) => sessions.get(role)
    });
    return await engine.execute(job, executor, buildExecuteOptions(options));
  } finally {
    if (destinationSession !== void 0) {
      await destinationSession.disconnect();
    }
    await sourceSession.disconnect();
  }
}
function createRouteJob(route, sourceSession, destinationSession, options) {
  const operation = route.operation ?? "copy";
  const source = {
    path: route.source.path,
    provider: sourceSession.provider
  };
  const destination = {
    path: route.destination.path,
    provider: destinationSession.provider
  };
  const baseMetadata = { routeId: route.id };
  if (route.name !== void 0) baseMetadata["routeName"] = route.name;
  if (route.metadata !== void 0) Object.assign(baseMetadata, route.metadata);
  if (options.metadata !== void 0) Object.assign(baseMetadata, options.metadata);
  const job = {
    destination,
    id: options.jobId ?? defaultJobId(route, options.now),
    operation,
    source
  };
  if (Object.keys(baseMetadata).length > 0) {
    job.metadata = baseMetadata;
  }
  return job;
}
function defaultJobId(route, now) {
  const timestamp = (now?.() ?? /* @__PURE__ */ new Date()).getTime();
  return `route:${route.id}:${timestamp.toString(36)}`;
}
function buildExecuteOptions(options) {
  const execute = {};
  if (options.signal !== void 0) execute.signal = options.signal;
  if (options.retry !== void 0) execute.retry = options.retry;
  if (options.onProgress !== void 0) execute.onProgress = options.onProgress;
  if (options.timeout !== void 0) execute.timeout = options.timeout;
  if (options.bandwidthLimit !== void 0) execute.bandwidthLimit = options.bandwidthLimit;
  return execute;
}

// src/client/operations.ts
var LOCAL_PROFILE = { host: "local", provider: "local" };
function uploadFile(options) {
  const { client, destination, localPath, routeId, routeName, ...rest } = options;
  const route = buildRoute({
    destination: { path: destination.path, profile: destination.profile },
    id: routeId ?? `upload:${defaultRouteSuffix(localPath, destination.path)}`,
    name: routeName,
    operation: "upload",
    source: { path: absolutePath(localPath), profile: LOCAL_PROFILE }
  });
  return runRoute({ client, route, ...rest });
}
function downloadFile(options) {
  const { client, localPath, routeId, routeName, source, ...rest } = options;
  const route = buildRoute({
    destination: { path: absolutePath(localPath), profile: LOCAL_PROFILE },
    id: routeId ?? `download:${defaultRouteSuffix(source.path, localPath)}`,
    name: routeName,
    operation: "download",
    source: { path: source.path, profile: source.profile }
  });
  return runRoute({ client, route, ...rest });
}
function copyBetween(options) {
  const { client, destination, routeId, routeName, source, ...rest } = options;
  const route = buildRoute({
    destination: { path: destination.path, profile: destination.profile },
    id: routeId ?? `copy:${defaultRouteSuffix(source.path, destination.path)}`,
    name: routeName,
    operation: "copy",
    source: { path: source.path, profile: source.profile }
  });
  return runRoute({ client, route, ...rest });
}
function buildRoute(input) {
  const route = {
    destination: input.destination,
    id: input.id,
    operation: input.operation,
    source: input.source
  };
  if (input.name !== void 0) route.name = input.name;
  return route;
}
function absolutePath(localPath) {
  return isAbsolute(localPath) ? localPath : resolvePath(localPath);
}
function defaultRouteSuffix(source, destination) {
  return `${source}->${destination}`;
}

// src/logging/redaction.ts
var REDACTED = "[REDACTED]";
var SENSITIVE_KEY_PATTERN = /(?:password|passphrase|privatekey|token|secret|username|user)$/i;
var SECRET_COMMAND_PATTERN = /^(PASS|USER|ACCT)\s+(.+)$/i;
function isSensitiveKey(key) {
  return SENSITIVE_KEY_PATTERN.test(key.replace(/[_-]/g, ""));
}
function redactCommand(command) {
  return command.replace(SECRET_COMMAND_PATTERN, (_fullMatch, commandName) => {
    return `${commandName.toUpperCase()} ${REDACTED}`;
  });
}
function redactValue(value) {
  if (typeof value === "string") {
    return redactCommand(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }
  if (value !== null && typeof value === "object") {
    return redactObject(value);
  }
  return value;
}
function redactObject(input) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (isSensitiveKey(key)) {
        return [key, REDACTED];
      }
      return [key, redactValue(value)];
    })
  );
}

// src/profiles/SecretSource.ts
import { Buffer as Buffer2 } from "buffer";
import { readFile } from "fs/promises";
async function resolveSecret(source, options = {}) {
  if (isSecretValue(source)) {
    return cloneSecretValue(source);
  }
  if (typeof source === "function") {
    return cloneSecretValue(await source());
  }
  if (isValueSecretSource(source)) {
    return cloneSecretValue(source.value);
  }
  if (isEnvSecretSource(source)) {
    const value = (options.env ?? process.env)[source.env];
    if (value === void 0) {
      throw createSecretConfigurationError(
        "Secret environment variable is not set",
        "env",
        source.env
      );
    }
    return value;
  }
  if (isBase64EnvSecretSource(source)) {
    const value = (options.env ?? process.env)[source.base64Env];
    if (value === void 0) {
      throw createSecretConfigurationError(
        "Secret environment variable is not set",
        "base64Env",
        source.base64Env
      );
    }
    return Buffer2.from(value, "base64");
  }
  if (isFileSecretSource(source)) {
    const fileReader = options.readFile ?? readFile;
    const value = await fileReader(source.path);
    if (source.encoding === "buffer") {
      return Buffer2.from(value);
    }
    return value.toString(source.encoding ?? "utf8");
  }
  throw createSecretConfigurationError("Unsupported secret source", "source", "unknown");
}
function redactSecretSource(source) {
  if (isSecretValue(source) || typeof source === "function") {
    return REDACTED;
  }
  if (isValueSecretSource(source)) return { value: REDACTED };
  if (isEnvSecretSource(source)) return { env: REDACTED };
  if (isBase64EnvSecretSource(source)) return { base64Env: REDACTED };
  if (isFileSecretSource(source)) return { encoding: source.encoding, path: REDACTED };
  return REDACTED;
}
function isSecretValue(value) {
  return typeof value === "string" || Buffer2.isBuffer(value);
}
function isValueSecretSource(value) {
  return isRecord(value) && "value" in value && isSecretValue(value.value);
}
function isEnvSecretSource(value) {
  return isRecord(value) && typeof value.env === "string";
}
function isBase64EnvSecretSource(value) {
  return isRecord(value) && typeof value.base64Env === "string";
}
function isFileSecretSource(value) {
  return isRecord(value) && typeof value.path === "string";
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function cloneSecretValue(value) {
  return Buffer2.isBuffer(value) ? Buffer2.from(value) : value;
}
function createSecretConfigurationError(message, sourceType, sourceName) {
  return new ConfigurationError({
    details: { sourceName, sourceType },
    message,
    retryable: false
  });
}

// src/profiles/ProfileRedactor.ts
function redactConnectionProfile(profile) {
  const { logger, password, signal, ssh, tls, username, ...rest } = profile;
  const redacted = redactObject(rest);
  if (username !== void 0) redacted.username = redactSecretSource(username);
  if (password !== void 0) redacted.password = redactSecretSource(password);
  if (ssh !== void 0) redacted.ssh = redactSshProfile(ssh);
  if (tls !== void 0) redacted.tls = redactTlsProfile(tls);
  if (signal !== void 0) redacted.signal = "[AbortSignal]";
  if (logger !== void 0) redacted.logger = REDACTED;
  return redacted;
}
function redactSshProfile(profile) {
  const { agent, keyboardInteractive, knownHosts, passphrase, privateKey, socketFactory, ...rest } = profile;
  const redacted = redactObject(rest);
  if (agent !== void 0) redacted.agent = REDACTED;
  if (privateKey !== void 0) redacted.privateKey = redactSecretSource(privateKey);
  if (passphrase !== void 0) redacted.passphrase = redactSecretSource(passphrase);
  if (knownHosts !== void 0) redacted.knownHosts = redactSshKnownHostsSource(knownHosts);
  if (keyboardInteractive !== void 0) redacted.keyboardInteractive = REDACTED;
  if (socketFactory !== void 0) redacted.socketFactory = REDACTED;
  return redacted;
}
function redactSshKnownHostsSource(source) {
  if (Array.isArray(source)) {
    return source.map((item) => redactSecretSource(item));
  }
  return redactSecretSource(source);
}
function redactTlsProfile(profile) {
  const { ca, cert, checkServerIdentity, key, passphrase, pfx, ...rest } = profile;
  const redacted = redactObject(rest);
  if (ca !== void 0) redacted.ca = redactTlsSecretSource(ca);
  if (cert !== void 0) redacted.cert = redactSecretSource(cert);
  if (key !== void 0) redacted.key = redactSecretSource(key);
  if (passphrase !== void 0) redacted.passphrase = redactSecretSource(passphrase);
  if (pfx !== void 0) redacted.pfx = redactSecretSource(pfx);
  if (checkServerIdentity !== void 0) redacted.checkServerIdentity = REDACTED;
  return redacted;
}
function redactTlsSecretSource(source) {
  if (Array.isArray(source)) {
    return source.map((item) => redactSecretSource(item));
  }
  return redactSecretSource(source);
}

// src/diagnostics/index.ts
function summarizeClientDiagnostics(client) {
  const capabilities = client.getCapabilities();
  return {
    providers: capabilities.map((entry) => ({ capabilities: entry, id: entry.provider }))
  };
}
async function runConnectionDiagnostics(options) {
  const now = options.now ?? (() => performance.now());
  const probeList = options.probeList !== false;
  const listPath = options.listPath ?? "/";
  const sampleSize = Math.max(0, options.sampleSize ?? 5);
  const redactedProfile = redactConnectionProfile(options.profile);
  const result = {
    host: options.profile.host,
    ok: false,
    redactedProfile,
    timings: {}
  };
  const connectStart = now();
  try {
    const session = await options.client.connect(options.profile);
    result.timings.connectMs = now() - connectStart;
    result.provider = session.provider;
    result.capabilities = session.capabilities;
    try {
      if (probeList) {
        const listStart = now();
        const entries = await session.fs.list(listPath);
        result.timings.listMs = now() - listStart;
        result.sample = entries.slice(0, sampleSize);
      }
      result.ok = true;
    } finally {
      const disconnectStart = now();
      await session.disconnect();
      result.timings.disconnectMs = now() - disconnectStart;
    }
  } catch (error) {
    result.error = summarizeDiagnosticError(error);
  }
  return result;
}
function summarizeDiagnosticError(error) {
  if (error instanceof Error) {
    const summary = { message: error.message };
    if (error.name !== "Error") summary.name = error.name;
    const code = error.code;
    if (typeof code === "string") summary.code = code;
    return summary;
  }
  return { message: String(error) };
}

// src/providers/local/LocalProvider.ts
import { createReadStream } from "fs";
import {
  lstat,
  mkdir,
  open,
  readdir,
  readlink,
  rename,
  rm,
  unlink,
  writeFile
} from "fs/promises";
import path from "path";

// src/utils/path.ts
var UNSAFE_FTP_ARGUMENT_PATTERN = /[\r\n]/;
function assertSafeFtpArgument(value, label = "path") {
  if (UNSAFE_FTP_ARGUMENT_PATTERN.test(value)) {
    throw new ConfigurationError({
      message: `Unsafe FTP ${label}: CR and LF characters are not allowed`,
      retryable: false,
      details: {
        label
      }
    });
  }
  return value;
}
function normalizeRemotePath(input) {
  assertSafeFtpArgument(input);
  if (input.length === 0) {
    return ".";
  }
  const isAbsolute2 = input.startsWith("/");
  const segments = [];
  for (const segment of input.split(/[\\/]+/)) {
    if (segment.length === 0 || segment === ".") {
      continue;
    }
    if (segment === "..") {
      if (segments.length > 0 && segments[segments.length - 1] !== "..") {
        segments.pop();
      } else if (!isAbsolute2) {
        segments.push(segment);
      }
      continue;
    }
    segments.push(segment);
  }
  const normalized = segments.join("/");
  if (isAbsolute2) {
    return normalized.length > 0 ? `/${normalized}` : "/";
  }
  return normalized.length > 0 ? normalized : ".";
}
function joinRemotePath(...segments) {
  if (segments.length === 0) {
    return ".";
  }
  return normalizeRemotePath(segments.join("/"));
}
function basenameRemotePath(input) {
  const normalized = normalizeRemotePath(input);
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? normalized;
}

// src/providers/local/LocalProvider.ts
var LOCAL_PROVIDER_ID = "local";
var LOCAL_PROVIDER_CAPABILITIES = {
  provider: LOCAL_PROVIDER_ID,
  authentication: ["anonymous"],
  list: true,
  stat: true,
  readStream: true,
  writeStream: true,
  serverSideCopy: false,
  serverSideMove: false,
  resumeDownload: true,
  resumeUpload: true,
  checksum: [],
  atomicRename: false,
  chmod: false,
  chown: false,
  symlink: true,
  metadata: ["accessedAt", "createdAt", "modifiedAt", "permissions", "symlinkTarget", "uniqueId"],
  maxConcurrency: 16,
  notes: ["Local filesystem provider for tests and local-only workflows"]
};
function createLocalProviderFactory(options = {}) {
  return {
    id: LOCAL_PROVIDER_ID,
    capabilities: LOCAL_PROVIDER_CAPABILITIES,
    create: () => new LocalProvider(options.rootPath)
  };
}
var LocalProvider = class {
  constructor(configuredRootPath) {
    this.configuredRootPath = configuredRootPath;
  }
  configuredRootPath;
  id = LOCAL_PROVIDER_ID;
  capabilities = LOCAL_PROVIDER_CAPABILITIES;
  connect(profile) {
    return Promise.resolve().then(() => {
      const rootPath = path.resolve(this.configuredRootPath ?? profile.host);
      return new LocalTransferSession(rootPath);
    });
  }
};
var LocalTransferSession = class {
  provider = LOCAL_PROVIDER_ID;
  capabilities = LOCAL_PROVIDER_CAPABILITIES;
  fs;
  transfers;
  constructor(rootPath) {
    this.fs = new LocalFileSystem(rootPath);
    this.transfers = new LocalTransferOperations(rootPath);
  }
  disconnect() {
    return Promise.resolve();
  }
};
var LocalTransferOperations = class {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }
  rootPath;
  async read(request) {
    request.throwIfAborted();
    const remotePath = normalizeLocalProviderPath(request.endpoint.path);
    const entry = await readLocalEntry(this.rootPath, remotePath);
    if (entry.type !== "file") {
      throw createPathNotFoundError(remotePath, `Local provider path is not a file: ${remotePath}`);
    }
    const range = resolveReadRange(entry.size ?? 0, request.range);
    const result = {
      content: createLocalReadSource(resolveLocalPath(this.rootPath, remotePath), range),
      totalBytes: range.length
    };
    if (range.offset > 0) {
      result.bytesRead = range.offset;
    }
    return result;
  }
  async write(request) {
    request.throwIfAborted();
    const remotePath = normalizeLocalProviderPath(request.endpoint.path);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    const content = await collectTransferContent(request);
    const offset = normalizeOptionalByteCount(request.offset, "offset", remotePath);
    await ensureLocalParentDirectory(localPath, remotePath);
    await writeLocalContent(localPath, remotePath, content, offset);
    const stat = await readLocalEntry(this.rootPath, remotePath);
    const result = {
      bytesTransferred: content.byteLength,
      resumed: offset !== void 0 && offset > 0,
      verified: request.verification?.verified ?? false
    };
    if (stat.size !== void 0) {
      result.totalBytes = stat.size;
    }
    if (request.verification !== void 0) {
      result.verification = cloneVerification2(request.verification);
    }
    return result;
  }
};
var LocalFileSystem = class {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }
  rootPath;
  async list(path2) {
    const remotePath = normalizeLocalProviderPath(path2);
    const directory = await this.stat(remotePath);
    if (directory.type !== "directory") {
      throw createPathNotFoundError(
        remotePath,
        `Local provider path is not a directory: ${remotePath}`
      );
    }
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    const names = await readLocalDirectory(localPath, remotePath);
    const entries = await Promise.all(
      names.map((name) => readLocalEntry(this.rootPath, joinRemotePath(remotePath, name)))
    );
    return entries.sort(compareEntries);
  }
  async stat(path2) {
    return readLocalEntry(this.rootPath, normalizeLocalProviderPath(path2));
  }
  async remove(remote, options = {}) {
    const remotePath = normalizeLocalProviderPath(remote);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    try {
      await unlink(localPath);
    } catch (error) {
      if (options.ignoreMissing && isNodeErrno(error, "ENOENT")) return;
      if (isNodeErrno(error, "ENOENT")) {
        throw createPathNotFoundError(remotePath, `Local path not found: ${remotePath}`);
      }
      throw error;
    }
  }
  async rename(from, to) {
    const fromRemote = normalizeLocalProviderPath(from);
    const toRemote = normalizeLocalProviderPath(to);
    const fromLocal = resolveLocalPath(this.rootPath, fromRemote);
    const toLocal = resolveLocalPath(this.rootPath, toRemote);
    try {
      await rename(fromLocal, toLocal);
    } catch (error) {
      if (isNodeErrno(error, "ENOENT")) {
        throw createPathNotFoundError(fromRemote, `Local path not found: ${fromRemote}`);
      }
      throw error;
    }
  }
  async mkdir(remote, options = {}) {
    const remotePath = normalizeLocalProviderPath(remote);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    await mkdir(localPath, { recursive: options.recursive === true });
  }
  async rmdir(remote, options = {}) {
    const remotePath = normalizeLocalProviderPath(remote);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    try {
      await rm(localPath, { recursive: options.recursive === true, force: false });
    } catch (error) {
      if (isNodeErrno(error, "ENOENT")) {
        if (options.ignoreMissing) return;
        throw createPathNotFoundError(remotePath, `Local path not found: ${remotePath}`);
      }
      throw error;
    }
  }
};
function isNodeErrno(error, code) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
function resolveReadRange(size, range) {
  if (range === void 0) {
    return { length: size, offset: 0 };
  }
  const requestedOffset = normalizeByteCount(range.offset, "offset", "/");
  const requestedLength = range.length === void 0 ? size - Math.min(requestedOffset, size) : normalizeByteCount(range.length, "length", "/");
  const offset = Math.min(requestedOffset, size);
  const length = Math.max(0, Math.min(requestedLength, size - offset));
  return { length, offset };
}
async function* createLocalReadSource(localPath, range) {
  if (range.length <= 0) {
    return;
  }
  const stream = createReadStream(localPath, {
    end: range.offset + range.length - 1,
    start: range.offset
  });
  for await (const chunk of stream) {
    yield new Uint8Array(chunk);
  }
}
async function collectTransferContent(request) {
  const chunks = [];
  let byteLength = 0;
  for await (const chunk of request.content) {
    request.throwIfAborted();
    const clonedChunk = new Uint8Array(chunk);
    chunks.push(clonedChunk);
    byteLength += clonedChunk.byteLength;
    request.reportProgress(byteLength, request.totalBytes);
  }
  return concatChunks(chunks, byteLength);
}
function concatChunks(chunks, byteLength) {
  const content = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    content.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return content;
}
async function ensureLocalParentDirectory(localPath, remotePath) {
  try {
    await mkdir(path.dirname(localPath), { recursive: true });
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
}
async function writeLocalContent(localPath, remotePath, content, offset) {
  try {
    if (offset === void 0) {
      await writeFile(localPath, content);
      return;
    }
    const handle = await openLocalFileForOffsetWrite(localPath);
    try {
      await handle.write(content, 0, content.byteLength, offset);
    } finally {
      await handle.close();
    }
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
}
async function openLocalFileForOffsetWrite(localPath) {
  try {
    return await open(localPath, "r+");
  } catch (error) {
    if (getErrorCode(error) === "ENOENT") {
      return open(localPath, "w+");
    }
    throw error;
  }
}
function normalizeOptionalByteCount(value, field, remotePath) {
  return value === void 0 ? void 0 : normalizeByteCount(value, field, remotePath);
}
function normalizeByteCount(value, field, remotePath) {
  if (!Number.isFinite(value) || value < 0) {
    throw new ConfigurationError({
      details: { field, provider: LOCAL_PROVIDER_ID },
      message: `Local provider ${field} must be a non-negative number`,
      path: remotePath,
      retryable: false
    });
  }
  return Math.floor(value);
}
function cloneVerification2(verification) {
  const clone = { verified: verification.verified };
  if (verification.method !== void 0) clone.method = verification.method;
  if (verification.checksum !== void 0) clone.checksum = verification.checksum;
  if (verification.expectedChecksum !== void 0) {
    clone.expectedChecksum = verification.expectedChecksum;
  }
  if (verification.actualChecksum !== void 0) clone.actualChecksum = verification.actualChecksum;
  if (verification.details !== void 0) clone.details = { ...verification.details };
  return clone;
}
async function readLocalDirectory(localPath, remotePath) {
  try {
    return await readdir(localPath);
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
}
async function readLocalEntry(rootPath, remotePath) {
  const localPath = resolveLocalPath(rootPath, remotePath);
  let stats;
  try {
    stats = await lstat(localPath);
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
  const entry = {
    accessedAt: cloneDate(stats.atime),
    createdAt: cloneDate(stats.birthtime),
    modifiedAt: cloneDate(stats.mtime),
    name: basenameRemotePath(remotePath),
    path: remotePath,
    permissions: { raw: formatMode(stats.mode) },
    size: stats.size,
    type: getLocalEntryType(stats),
    uniqueId: `${stats.dev}:${stats.ino}`
  };
  if (entry.type === "symlink") {
    const symlinkTarget = await readSymlinkTarget(localPath);
    if (symlinkTarget !== void 0) {
      entry.symlinkTarget = symlinkTarget;
    }
  }
  return {
    ...entry,
    exists: true
  };
}
async function readSymlinkTarget(localPath) {
  try {
    return await readlink(localPath);
  } catch {
    return void 0;
  }
}
function normalizeLocalProviderPath(input) {
  const normalized = normalizeRemotePath(input);
  if (normalized === ".." || normalized.startsWith("../")) {
    throw new ConfigurationError({
      details: { provider: LOCAL_PROVIDER_ID },
      message: `Local provider path escapes the configured root: ${normalized}`,
      path: normalized,
      retryable: false
    });
  }
  if (normalized === "." || normalized === "/") {
    return "/";
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
function resolveLocalPath(rootPath, remotePath) {
  const normalizedRemotePath = normalizeLocalProviderPath(remotePath);
  const resolvedRootPath = path.resolve(rootPath);
  const candidateAbsolute = path.resolve(normalizedRemotePath.split("/").join(path.sep));
  if (candidateAbsolute === resolvedRootPath || candidateAbsolute.startsWith(resolvedRootPath + path.sep)) {
    return candidateAbsolute;
  }
  const relativePath = normalizedRemotePath === "/" ? "." : normalizedRemotePath.slice(1);
  const resolvedPath = path.resolve(rootPath, relativePath.split("/").join(path.sep));
  const relativeToRoot = path.relative(rootPath, resolvedPath);
  if (relativeToRoot === "" || !relativeToRoot.startsWith("..") && !path.isAbsolute(relativeToRoot)) {
    return resolvedPath;
  }
  throw new ConfigurationError({
    details: { provider: LOCAL_PROVIDER_ID, rootPath },
    message: `Local provider path escapes the configured root: ${normalizedRemotePath}`,
    path: normalizedRemotePath,
    retryable: false
  });
}
function getLocalEntryType(stats) {
  if (stats.isFile()) return "file";
  if (stats.isDirectory()) return "directory";
  if (stats.isSymbolicLink()) return "symlink";
  return "unknown";
}
function formatMode(mode) {
  return (mode & 511).toString(8).padStart(3, "0");
}
function cloneDate(value) {
  return new Date(value.getTime());
}
function compareEntries(left, right) {
  return left.path.localeCompare(right.path);
}
function mapLocalFileSystemError(error, remotePath) {
  const code = getErrorCode(error);
  if (code === "ENOENT" || code === "ENOTDIR") {
    return createPathNotFoundError(remotePath, `Local provider path not found: ${remotePath}`);
  }
  if (code === "EACCES" || code === "EPERM") {
    return new PermissionDeniedError({
      cause: error,
      details: { provider: LOCAL_PROVIDER_ID },
      message: `Local provider permission denied: ${remotePath}`,
      path: remotePath,
      retryable: false
    });
  }
  return new ConfigurationError({
    cause: error,
    details: { code, provider: LOCAL_PROVIDER_ID },
    message: `Local provider filesystem operation failed: ${remotePath}`,
    path: remotePath,
    retryable: false
  });
}
function createPathNotFoundError(path2, message) {
  return new PathNotFoundError({
    details: { provider: LOCAL_PROVIDER_ID },
    message,
    path: path2,
    retryable: false
  });
}
function getErrorCode(error) {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : void 0;
}

// src/providers/memory/MemoryProvider.ts
import { Buffer as Buffer3 } from "buffer";
var MEMORY_PROVIDER_ID = "memory";
var MEMORY_PROVIDER_CAPABILITIES = {
  provider: MEMORY_PROVIDER_ID,
  authentication: ["anonymous"],
  list: true,
  stat: true,
  readStream: true,
  writeStream: true,
  serverSideCopy: false,
  serverSideMove: false,
  resumeDownload: true,
  resumeUpload: true,
  checksum: [],
  atomicRename: false,
  chmod: false,
  chown: false,
  symlink: true,
  metadata: [
    "accessedAt",
    "createdAt",
    "group",
    "modifiedAt",
    "owner",
    "permissions",
    "symlinkTarget",
    "uniqueId"
  ],
  maxConcurrency: 32,
  notes: ["Deterministic in-memory provider for tests and provider contract validation"]
};
function createMemoryProviderFactory(options = {}) {
  const state = createMemoryState(options.entries ?? []);
  return {
    id: MEMORY_PROVIDER_ID,
    capabilities: MEMORY_PROVIDER_CAPABILITIES,
    create: () => new MemoryProvider(state)
  };
}
var MemoryProvider = class {
  constructor(state) {
    this.state = state;
  }
  state;
  id = MEMORY_PROVIDER_ID;
  capabilities = MEMORY_PROVIDER_CAPABILITIES;
  connect() {
    return Promise.resolve(new MemoryTransferSession(this.state));
  }
};
var MemoryTransferSession = class {
  provider = MEMORY_PROVIDER_ID;
  capabilities = MEMORY_PROVIDER_CAPABILITIES;
  fs;
  transfers;
  constructor(state) {
    this.fs = new MemoryFileSystem(state);
    this.transfers = new MemoryTransferOperations(state);
  }
  disconnect() {
    return Promise.resolve();
  }
};
var MemoryFileSystem = class {
  constructor(state) {
    this.state = state;
  }
  state;
  list(path2) {
    return Promise.resolve().then(() => {
      const normalizedPath = normalizeMemoryPath(path2);
      const directory = this.requireEntry(normalizedPath);
      if (directory.type !== "directory") {
        throw createPathNotFoundError2(
          normalizedPath,
          `Memory path is not a directory: ${normalizedPath}`
        );
      }
      return [...this.state.entries.values()].filter(
        (entry) => entry.path !== normalizedPath && getParentPath(entry.path) === normalizedPath
      ).map(cloneRemoteEntry).sort(compareEntries2);
    });
  }
  stat(path2) {
    return Promise.resolve().then(
      () => cloneRemoteStat(this.requireEntry(normalizeMemoryPath(path2)))
    );
  }
  remove(path2, options = {}) {
    return Promise.resolve().then(() => {
      const normalized = normalizeMemoryPath(path2);
      const entry = this.state.entries.get(normalized);
      if (entry === void 0) {
        if (options.ignoreMissing) return;
        throw createPathNotFoundError2(normalized, `Memory path not found: ${normalized}`);
      }
      if (entry.type === "directory") {
        throw createPathNotFoundError2(
          normalized,
          `Memory path is a directory; use rmdir: ${normalized}`
        );
      }
      this.state.entries.delete(normalized);
      this.state.content.delete(normalized);
    });
  }
  rename(from, to) {
    return Promise.resolve().then(() => {
      const fromPath = normalizeMemoryPath(from);
      const toPath = normalizeMemoryPath(to);
      const entry = this.state.entries.get(fromPath);
      if (entry === void 0) {
        throw createPathNotFoundError2(fromPath, `Memory path not found: ${fromPath}`);
      }
      ensureParentDirectories(this.state.entries, toPath);
      const moved = { ...entry, path: toPath, name: basenameRemotePath(toPath) };
      this.state.entries.delete(fromPath);
      this.state.entries.set(toPath, moved);
      const content = this.state.content.get(fromPath);
      if (content !== void 0) {
        this.state.content.delete(fromPath);
        this.state.content.set(toPath, content);
      }
    });
  }
  mkdir(path2, options = {}) {
    return Promise.resolve().then(() => {
      const normalized = normalizeMemoryPath(path2);
      const existing = this.state.entries.get(normalized);
      if (existing !== void 0) {
        if (existing.type === "directory" && options.recursive) return;
        throw createInvalidFixtureError(normalized, `Memory path already exists: ${normalized}`);
      }
      if (options.recursive) {
        ensureParentDirectories(this.state.entries, normalized);
      } else {
        const parent = getParentPath(normalized);
        if (parent !== void 0 && !this.state.entries.has(parent)) {
          throw createPathNotFoundError2(parent, `Memory parent not found: ${parent}`);
        }
      }
      this.state.entries.set(normalized, createDirectoryEntry(normalized));
    });
  }
  rmdir(path2, options = {}) {
    return Promise.resolve().then(() => {
      const normalized = normalizeMemoryPath(path2);
      const entry = this.state.entries.get(normalized);
      if (entry === void 0) {
        if (options.ignoreMissing) return;
        throw createPathNotFoundError2(normalized, `Memory path not found: ${normalized}`);
      }
      if (entry.type !== "directory") {
        throw createPathNotFoundError2(normalized, `Memory path is not a directory: ${normalized}`);
      }
      const children = [...this.state.entries.values()].filter(
        (child) => child.path !== normalized && getParentPath(child.path) === normalized
      );
      if (children.length > 0 && !options.recursive) {
        throw createInvalidFixtureError(normalized, `Memory directory not empty: ${normalized}`);
      }
      const stack = [...children];
      while (stack.length > 0) {
        const next = stack.pop();
        if (!next) continue;
        if (next.type === "directory") {
          for (const grand of this.state.entries.values()) {
            if (grand.path !== next.path && getParentPath(grand.path) === next.path) {
              stack.push(grand);
            }
          }
        }
        this.state.entries.delete(next.path);
        this.state.content.delete(next.path);
      }
      this.state.entries.delete(normalized);
    });
  }
  requireEntry(path2) {
    const entry = this.state.entries.get(path2);
    if (entry === void 0) {
      throw createPathNotFoundError2(path2, `Memory path not found: ${path2}`);
    }
    return entry;
  }
};
var MemoryTransferOperations = class {
  constructor(state) {
    this.state = state;
  }
  state;
  read(request) {
    return Promise.resolve().then(() => {
      request.throwIfAborted();
      const path2 = normalizeMemoryPath(request.endpoint.path);
      const entry = requireFileEntry(this.state, path2);
      const content = this.state.content.get(path2) ?? new Uint8Array(entry.size ?? 0);
      const range = resolveByteRange(content.byteLength, request.range);
      const chunk = content.slice(range.offset, range.offset + range.length);
      const result = {
        content: createMemoryContentSource(chunk),
        totalBytes: chunk.byteLength
      };
      if (range.offset > 0) {
        result.bytesRead = range.offset;
      }
      return result;
    });
  }
  async write(request) {
    request.throwIfAborted();
    const path2 = normalizeMemoryPath(request.endpoint.path);
    const existing = this.state.entries.get(path2);
    if (existing?.type === "directory") {
      throw createInvalidFixtureError(path2, `Memory path is a directory: ${path2}`);
    }
    const writtenContent = await collectTransferContent2(request);
    const offset = normalizeOptionalByteCount2(request.offset, "offset");
    const previousContent = this.state.content.get(path2) ?? new Uint8Array(0);
    const content = offset === void 0 ? writtenContent : mergeContentAtOffset(previousContent, writtenContent, offset);
    ensureParentDirectories(this.state.entries, path2);
    this.state.entries.set(path2, createWrittenFileEntry(path2, content.byteLength));
    this.state.content.set(path2, content);
    const result = {
      bytesTransferred: writtenContent.byteLength,
      resumed: offset !== void 0 && offset > 0,
      totalBytes: content.byteLength,
      verified: request.verification?.verified ?? false
    };
    if (request.verification !== void 0) {
      result.verification = cloneVerification3(request.verification);
    }
    return result;
  }
};
function createMemoryState(entries) {
  const state = {
    content: /* @__PURE__ */ new Map(),
    entries: /* @__PURE__ */ new Map([["/", createDirectoryEntry("/")]])
  };
  for (const input of entries) {
    const entry = createMemoryEntry(input);
    const content = createMemoryContent(input, entry);
    if (entry.path === "/" && entry.type !== "directory") {
      throw createInvalidFixtureError(entry.path, "Memory provider root must be a directory");
    }
    ensureParentDirectories(state.entries, entry.path);
    state.entries.set(entry.path, entry);
    if (content !== void 0) {
      state.content.set(entry.path, content);
    }
  }
  return state;
}
function createMemoryEntry(input) {
  const path2 = normalizeMemoryPath(input.path);
  const entry = {
    name: input.name ?? basenameRemotePath(path2),
    path: path2,
    type: input.type
  };
  copyOptionalEntryFields(entry, input);
  const content = normalizeMemoryContent(input.content);
  if (content !== void 0) {
    entry.size = content.byteLength;
  }
  return {
    ...entry,
    exists: true
  };
}
function createMemoryContent(input, entry) {
  const content = normalizeMemoryContent(input.content);
  if (content !== void 0) {
    if (entry.type !== "file") {
      throw createInvalidFixtureError(
        entry.path,
        `Memory fixture content requires a file: ${entry.path}`
      );
    }
    return content;
  }
  if (entry.type === "file") {
    return new Uint8Array(entry.size ?? 0);
  }
  return void 0;
}
function normalizeMemoryContent(content) {
  if (content === void 0) {
    return void 0;
  }
  return typeof content === "string" ? Buffer3.from(content) : new Uint8Array(content);
}
function createWrittenFileEntry(path2, size) {
  return {
    exists: true,
    modifiedAt: /* @__PURE__ */ new Date(),
    name: basenameRemotePath(path2),
    path: path2,
    size,
    type: "file"
  };
}
function createDirectoryEntry(path2) {
  return {
    exists: true,
    name: basenameRemotePath(path2),
    path: path2,
    type: "directory"
  };
}
function ensureParentDirectories(state, path2) {
  for (const parentPath of getAncestorPaths(path2)) {
    const parent = state.get(parentPath);
    if (parent !== void 0 && parent.type !== "directory") {
      throw createInvalidFixtureError(
        parentPath,
        `Memory fixture parent is not a directory: ${parentPath}`
      );
    }
    if (parent === void 0) {
      state.set(parentPath, createDirectoryEntry(parentPath));
    }
  }
}
function normalizeMemoryPath(path2) {
  const normalized = normalizeRemotePath(path2);
  if (normalized === "." || normalized === "/") {
    return "/";
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
function getAncestorPaths(path2) {
  const ancestors = [];
  let parentPath = getParentPath(path2);
  while (parentPath !== void 0 && parentPath !== "/") {
    ancestors.unshift(parentPath);
    parentPath = getParentPath(parentPath);
  }
  return ancestors;
}
function getParentPath(path2) {
  if (path2 === "/") {
    return void 0;
  }
  const parentEnd = path2.lastIndexOf("/");
  return parentEnd <= 0 ? "/" : path2.slice(0, parentEnd);
}
function requireFileEntry(state, path2) {
  const entry = state.entries.get(path2);
  if (entry === void 0) {
    throw createPathNotFoundError2(path2, `Memory path not found: ${path2}`);
  }
  if (entry.type !== "file") {
    throw createPathNotFoundError2(path2, `Memory path is not a file: ${path2}`);
  }
  return entry;
}
function resolveByteRange(size, range) {
  if (range === void 0) {
    return { length: size, offset: 0 };
  }
  const requestedOffset = normalizeByteCount2(range.offset, "offset");
  const requestedLength = range.length === void 0 ? size - Math.min(requestedOffset, size) : normalizeByteCount2(range.length, "length");
  const offset = Math.min(requestedOffset, size);
  const length = Math.max(0, Math.min(requestedLength, size - offset));
  return { length, offset };
}
async function collectTransferContent2(request) {
  const chunks = [];
  let byteLength = 0;
  for await (const chunk of request.content) {
    request.throwIfAborted();
    const clonedChunk = new Uint8Array(chunk);
    chunks.push(clonedChunk);
    byteLength += clonedChunk.byteLength;
    request.reportProgress(byteLength, request.totalBytes);
  }
  return concatChunks2(chunks, byteLength);
}
function concatChunks2(chunks, byteLength) {
  const content = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    content.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return content;
}
function mergeContentAtOffset(previousContent, writtenContent, offset) {
  const content = new Uint8Array(
    Math.max(previousContent.byteLength, offset + writtenContent.byteLength)
  );
  content.set(previousContent);
  content.set(writtenContent, offset);
  return content;
}
async function* createMemoryContentSource(content) {
  await Promise.resolve();
  yield new Uint8Array(content);
}
function normalizeOptionalByteCount2(value, field) {
  return value === void 0 ? void 0 : normalizeByteCount2(value, field);
}
function normalizeByteCount2(value, field) {
  if (!Number.isFinite(value) || value < 0) {
    throw createInvalidFixtureError("/", `Memory provider ${field} must be a non-negative number`);
  }
  return Math.floor(value);
}
function cloneVerification3(verification) {
  const clone = { verified: verification.verified };
  if (verification.method !== void 0) clone.method = verification.method;
  if (verification.checksum !== void 0) clone.checksum = verification.checksum;
  if (verification.expectedChecksum !== void 0) {
    clone.expectedChecksum = verification.expectedChecksum;
  }
  if (verification.actualChecksum !== void 0) clone.actualChecksum = verification.actualChecksum;
  if (verification.details !== void 0) clone.details = { ...verification.details };
  return clone;
}
function cloneRemoteEntry(entry) {
  const clone = {
    name: entry.name,
    path: entry.path,
    type: entry.type
  };
  copyOptionalEntryFields(clone, entry);
  return clone;
}
function cloneRemoteStat(entry) {
  return {
    ...cloneRemoteEntry(entry),
    exists: true
  };
}
function copyOptionalEntryFields(target, source) {
  if (source.size !== void 0) target.size = source.size;
  if (source.modifiedAt !== void 0) target.modifiedAt = cloneDate2(source.modifiedAt);
  if (source.createdAt !== void 0) target.createdAt = cloneDate2(source.createdAt);
  if (source.accessedAt !== void 0) target.accessedAt = cloneDate2(source.accessedAt);
  if (source.permissions !== void 0) target.permissions = clonePermissions(source.permissions);
  if (source.owner !== void 0) target.owner = source.owner;
  if (source.group !== void 0) target.group = source.group;
  if (source.symlinkTarget !== void 0) target.symlinkTarget = source.symlinkTarget;
  if (source.uniqueId !== void 0) target.uniqueId = source.uniqueId;
  if (source.raw !== void 0) target.raw = source.raw;
}
function cloneDate2(value) {
  return new Date(value.getTime());
}
function clonePermissions(permissions) {
  return { ...permissions };
}
function compareEntries2(left, right) {
  return left.path.localeCompare(right.path);
}
function createPathNotFoundError2(path2, message) {
  return new PathNotFoundError({
    details: { provider: MEMORY_PROVIDER_ID },
    message,
    path: path2,
    retryable: false
  });
}
function createInvalidFixtureError(path2, message) {
  return new ConfigurationError({
    details: { provider: MEMORY_PROVIDER_ID },
    message,
    path: path2,
    retryable: false
  });
}

// src/profiles/resolveConnectionProfileSecrets.ts
async function resolveConnectionProfileSecrets(profile, options = {}) {
  const { password, ssh, tls, username, ...rest } = profile;
  const resolved = { ...rest };
  if (username !== void 0) {
    resolved.username = await resolveSecret(username, options);
  }
  if (password !== void 0) {
    resolved.password = await resolveSecret(password, options);
  }
  if (tls !== void 0) {
    resolved.tls = await resolveTlsProfile(tls, options);
  }
  if (ssh !== void 0) {
    resolved.ssh = await resolveSshProfile(ssh, options);
  }
  return resolved;
}
async function resolveSshProfile(profile, options) {
  const { knownHosts, passphrase, privateKey, ...rest } = profile;
  const resolved = { ...rest };
  if (privateKey !== void 0) resolved.privateKey = await resolveSecret(privateKey, options);
  if (passphrase !== void 0) resolved.passphrase = await resolveSecret(passphrase, options);
  if (knownHosts !== void 0)
    resolved.knownHosts = await resolveKnownHostsSource(knownHosts, options);
  return resolved;
}
async function resolveKnownHostsSource(source, options) {
  if (Array.isArray(source)) {
    return Promise.all(source.map((item) => resolveSecret(item, options)));
  }
  return resolveSecret(source, options);
}
async function resolveTlsProfile(profile, options) {
  const { ca, cert, key, passphrase, pfx, ...rest } = profile;
  const resolved = { ...rest };
  if (ca !== void 0) resolved.ca = await resolveTlsSecretSource(ca, options);
  if (cert !== void 0) resolved.cert = await resolveSecret(cert, options);
  if (key !== void 0) resolved.key = await resolveSecret(key, options);
  if (passphrase !== void 0) resolved.passphrase = await resolveSecret(passphrase, options);
  if (pfx !== void 0) resolved.pfx = await resolveSecret(pfx, options);
  return resolved;
}
async function resolveTlsSecretSource(source, options) {
  if (Array.isArray(source)) {
    return Promise.all(source.map((item) => resolveSecret(item, options)));
  }
  return resolveSecret(source, options);
}

// src/profiles/OAuthTokenSource.ts
function createOAuthTokenSecretSource(refresh, options = {}) {
  if (typeof refresh !== "function") {
    throw new ConfigurationError({
      message: "createOAuthTokenSecretSource requires a refresh callback",
      retryable: false
    });
  }
  const skewMs = options.skewMs ?? 6e4;
  const now = options.now ?? (() => Date.now());
  if (skewMs < 0) {
    throw new ConfigurationError({
      message: "OAuthTokenSecretSourceOptions.skewMs must be non-negative",
      retryable: false
    });
  }
  let cache;
  let pending;
  const renew = async () => {
    const result = await refresh();
    if (typeof result.accessToken !== "string" || result.accessToken === "") {
      throw new ConfigurationError({
        message: "OAuth refresh callback returned an empty access token",
        retryable: false
      });
    }
    let expiresAtMs;
    if (result.expiresAt !== void 0) {
      const ts = result.expiresAt.getTime();
      if (Number.isFinite(ts)) expiresAtMs = ts;
    } else if (typeof result.expiresInSeconds === "number") {
      if (!Number.isFinite(result.expiresInSeconds) || result.expiresInSeconds <= 0) {
        throw new ConfigurationError({
          message: "OAuth refresh callback returned a non-positive expiresInSeconds",
          retryable: false
        });
      }
      expiresAtMs = now() + result.expiresInSeconds * 1e3;
    }
    const cached = { accessToken: result.accessToken, expiresAtMs };
    cache = cached;
    return cached;
  };
  return async () => {
    const current = cache;
    if (current !== void 0 && isFresh(current, skewMs, now)) {
      return current.accessToken;
    }
    if (pending === void 0) {
      pending = renew().finally(() => {
        pending = void 0;
      });
    }
    const refreshed = await pending;
    return refreshed.accessToken;
  };
}
function isFresh(token, skewMs, now) {
  if (token.expiresAtMs === void 0) return true;
  return token.expiresAtMs - skewMs > now();
}

// src/profiles/importers/KnownHostsParser.ts
import { Buffer as Buffer4 } from "buffer";
import { createHmac } from "crypto";
function parseKnownHosts(text) {
  const entries = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const entry = parseKnownHostsLine(line);
    if (entry !== void 0) entries.push(entry);
  }
  return entries;
}
function parseKnownHostsLine(line) {
  const tokens = line.trim().split(/\s+/);
  if (tokens.length < 3) return void 0;
  let index = 0;
  let marker;
  const first2 = tokens[index];
  if (first2 === "@cert-authority" || first2 === "@revoked") {
    marker = first2 === "@cert-authority" ? "cert-authority" : "revoked";
    index += 1;
  }
  const hostField = tokens[index];
  const keyType = tokens[index + 1];
  const keyBase64 = tokens[index + 2];
  if (hostField === void 0 || keyType === void 0 || keyBase64 === void 0) return void 0;
  const commentTokens = tokens.slice(index + 3);
  const comment = commentTokens.length > 0 ? commentTokens.join(" ") : void 0;
  let hostPatterns = [];
  let hashedSalt;
  let hashedHash;
  if (hostField.startsWith("|1|")) {
    const parts = hostField.split("|");
    if (parts.length < 4) return void 0;
    hashedSalt = parts[2];
    hashedHash = parts[3];
  } else {
    hostPatterns = hostField.split(",").filter((token) => token !== "");
  }
  const entry = {
    hostPatterns,
    keyBase64,
    keyType,
    raw: line
  };
  if (marker !== void 0) entry.marker = marker;
  if (comment !== void 0) entry.comment = comment;
  if (hashedSalt !== void 0) entry.hashedSalt = hashedSalt;
  if (hashedHash !== void 0) entry.hashedHash = hashedHash;
  return entry;
}
var DEFAULT_SSH_PORT = 22;
function matchKnownHostsEntry(entry, host, port = DEFAULT_SSH_PORT) {
  if (entry.hashedSalt !== void 0 && entry.hashedHash !== void 0) {
    return matchesHashedEntry(entry.hashedSalt, entry.hashedHash, host, port);
  }
  let matched = false;
  for (const pattern of entry.hostPatterns) {
    if (pattern.startsWith("!")) {
      const negated = pattern.slice(1);
      if (matchesPlainPattern(negated, host, port)) return false;
      continue;
    }
    if (matchesPlainPattern(pattern, host, port)) matched = true;
  }
  return matched;
}
function matchKnownHosts(entries, host, port = DEFAULT_SSH_PORT) {
  return entries.filter((entry) => matchKnownHostsEntry(entry, host, port));
}
function matchesPlainPattern(pattern, host, port) {
  const portMatch = pattern.match(/^\[(.+)\]:(\d+)$/);
  if (portMatch) {
    const [, hostPattern, portText] = portMatch;
    if (hostPattern === void 0 || portText === void 0) return false;
    const expectedPort = Number.parseInt(portText, 10);
    if (Number.isNaN(expectedPort) || expectedPort !== port) return false;
    return globMatch(hostPattern, host);
  }
  return port === DEFAULT_SSH_PORT && globMatch(pattern, host);
}
function globMatch(pattern, value) {
  const regex = new RegExp(
    `^${pattern.replace(/[.+^${}()|\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
    "i"
  );
  return regex.test(value);
}
function matchesHashedEntry(salt, hash, host, port) {
  const saltBuffer = Buffer4.from(salt, "base64");
  if (saltBuffer.length === 0) return false;
  const candidates = port === DEFAULT_SSH_PORT ? [host] : [`[${host}]:${String(port)}`, host];
  for (const candidate of candidates) {
    const expected = createHmac("sha1", saltBuffer).update(candidate).digest("base64");
    if (expected === hash) return true;
  }
  return false;
}

// src/profiles/importers/OpenSshConfigImporter.ts
function parseOpenSshConfig(text) {
  const entries = [];
  let current;
  let skipping = false;
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (line === "") continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*=?\s*(.*)$/);
    if (!match) continue;
    const [, keywordRaw, valueRaw] = match;
    if (keywordRaw === void 0 || valueRaw === void 0) continue;
    const keyword = keywordRaw.toLowerCase();
    const value = valueRaw.trim();
    if (keyword === "host") {
      if (current !== void 0) entries.push(current);
      current = { options: {}, patterns: tokenizeValues(value) };
      skipping = false;
      continue;
    }
    if (keyword === "match") {
      if (current !== void 0) entries.push(current);
      current = void 0;
      skipping = true;
      continue;
    }
    if (skipping || current === void 0) continue;
    const values = tokenizeValues(value);
    const existing = current.options[keyword];
    if (existing === void 0) {
      current.options[keyword] = [...values];
    } else {
      existing.push(...values);
    }
  }
  if (current !== void 0) entries.push(current);
  return entries;
}
function tokenizeValues(value) {
  if (value === "") return [];
  const tokens = [];
  const regex = /"([^"]*)"|(\S+)/g;
  let match;
  while ((match = regex.exec(value)) !== null) {
    tokens.push(match[1] ?? match[2] ?? "");
  }
  return tokens;
}
function resolveOpenSshHost(entries, alias) {
  const merged = {};
  const matched = [];
  for (const entry of entries) {
    if (!entryMatchesAlias(entry, alias)) continue;
    matched.push(entry);
    for (const [key, values] of Object.entries(entry.options)) {
      if (merged[key] === void 0) merged[key] = [...values];
    }
  }
  return { alias, matched, options: merged };
}
function entryMatchesAlias(entry, alias) {
  let matched = false;
  for (const pattern of entry.patterns) {
    if (pattern.startsWith("!")) {
      if (globMatch2(pattern.slice(1), alias)) return false;
      continue;
    }
    if (globMatch2(pattern, alias)) matched = true;
  }
  return matched;
}
function globMatch2(pattern, value) {
  const regex = new RegExp(
    `^${pattern.replace(/[.+^${}()|\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
    "i"
  );
  return regex.test(value);
}
function importOpenSshConfig(options) {
  const { alias } = options;
  const entries = options.entries ?? (options.text !== void 0 ? parseOpenSshConfig(options.text) : void 0);
  if (entries === void 0) {
    throw new ConfigurationError({
      code: "openssh_config_input_missing",
      message: "importOpenSshConfig requires either text or pre-parsed entries.",
      retryable: false
    });
  }
  const resolved = resolveOpenSshHost(entries, alias);
  const optionsMap = resolved.options;
  const host = first(optionsMap, "hostname") ?? alias;
  const portText = first(optionsMap, "port");
  const port = portText !== void 0 ? safeInt(portText) : void 0;
  const user = first(optionsMap, "user");
  const identityFiles = optionsMap["identityfile"] ?? [];
  const knownHostsFiles = optionsMap["userknownhostsfile"] ?? [];
  const connectTimeoutText = first(optionsMap, "connecttimeout");
  const proxyJump = first(optionsMap, "proxyjump");
  const kex = optionsMap["kexalgorithms"] ?? [];
  const ciphers = optionsMap["ciphers"] ?? [];
  const macs = optionsMap["macs"] ?? [];
  const serverHostKey = optionsMap["hostkeyalgorithms"] ?? [];
  const profile = { host, provider: "sftp" };
  if (port !== void 0) profile.port = port;
  if (user !== void 0) profile.username = { value: user };
  if (connectTimeoutText !== void 0) {
    const seconds = safeInt(connectTimeoutText);
    if (seconds !== void 0) profile.timeoutMs = seconds * 1e3;
  }
  const ssh = {};
  if (identityFiles.length > 0) {
    const firstKey = identityFiles[0];
    if (firstKey !== void 0) ssh.privateKey = { path: expandHome(firstKey) };
  }
  if (knownHostsFiles.length > 0) {
    ssh.knownHosts = knownHostsFiles.map((path2) => ({ path: expandHome(path2) }));
  }
  const algorithms = {};
  if (kex.length > 0) algorithms["kex"] = expandAlgorithms(kex);
  if (ciphers.length > 0) algorithms["cipher"] = expandAlgorithms(ciphers);
  if (macs.length > 0) algorithms["hmac"] = expandAlgorithms(macs);
  if (serverHostKey.length > 0) algorithms["serverHostKey"] = expandAlgorithms(serverHostKey);
  if (Object.keys(algorithms).length > 0) {
    ssh.algorithms = algorithms;
  }
  if (Object.keys(ssh).length > 0) profile.ssh = ssh;
  const result = {
    identityFiles: identityFiles.map(expandHome),
    profile,
    resolved
  };
  if (proxyJump !== void 0) result.proxyJump = proxyJump;
  return result;
}
function first(options, key) {
  const values = options[key];
  return values !== void 0 && values.length > 0 ? values[0] : void 0;
}
function safeInt(text) {
  const value = Number.parseInt(text, 10);
  return Number.isFinite(value) ? value : void 0;
}
function expandHome(path2) {
  if (!path2.startsWith("~")) return path2;
  const home = process.env["HOME"] ?? process.env["USERPROFILE"];
  if (home === void 0) return path2;
  if (path2 === "~") return home;
  if (path2.startsWith("~/") || path2.startsWith("~\\")) return `${home}${path2.slice(1)}`;
  return path2;
}
function expandAlgorithms(values) {
  const out = [];
  for (const value of values) {
    for (const part of value.split(",")) {
      const trimmed = part.trim();
      if (trimmed !== "") out.push(trimmed);
    }
  }
  return out;
}

// src/profiles/importers/FileZillaImporter.ts
import { Buffer as Buffer5 } from "buffer";
function importFileZillaSites(xml) {
  const events = tokenizeXml(xml);
  if (events.length === 0) {
    throw new ConfigurationError({
      code: "filezilla_xml_empty",
      message: "FileZilla sitemanager XML is empty.",
      retryable: false
    });
  }
  const sites = [];
  const skipped = [];
  const folderStack = [];
  const folderNamePending = [];
  let inServer = false;
  let serverFields = {};
  let serverPasswordEncoding;
  let activeTag;
  let captureFolderName = false;
  for (const event of events) {
    if (event.kind === "open") {
      if (event.name === "Folder") {
        folderStack.push("");
        folderNamePending.push(true);
        continue;
      }
      if (event.name === "Server") {
        inServer = true;
        serverFields = {};
        serverPasswordEncoding = void 0;
        continue;
      }
      activeTag = event.name;
      if (event.name === "Pass" && inServer) {
        serverPasswordEncoding = event.attributes["encoding"];
      }
      if (event.name === "Name" && !inServer && folderNamePending.length > 0) {
        captureFolderName = true;
      }
      continue;
    }
    if (event.kind === "text") {
      if (captureFolderName) {
        const top = folderStack.length - 1;
        if (top >= 0) folderStack[top] = event.text.trim();
        captureFolderName = false;
        continue;
      }
      if (inServer && activeTag !== void 0) {
        serverFields[activeTag] = (serverFields[activeTag] ?? "") + event.text;
      }
      continue;
    }
    if (event.kind === "close") {
      if (event.name === "Folder") {
        folderStack.pop();
        folderNamePending.pop();
        continue;
      }
      if (event.name === "Server") {
        const folder = folderStack.filter((segment) => segment !== "");
        const result = buildSiteFromFields(serverFields, serverPasswordEncoding);
        if (result.kind === "site") {
          sites.push({ ...result.site, folder });
        } else {
          skipped.push({
            folder,
            name: result.name,
            ...result.protocol !== void 0 ? { protocol: result.protocol } : {}
          });
        }
        inServer = false;
        serverFields = {};
        serverPasswordEncoding = void 0;
        activeTag = void 0;
        continue;
      }
      if (activeTag === event.name) activeTag = void 0;
    }
  }
  return { sites, skipped };
}
function buildSiteFromFields(fields, passwordEncoding) {
  const name = (fields["Name"] ?? fields["Host"] ?? "Untitled").trim();
  const host = (fields["Host"] ?? "").trim();
  if (host === "") return { kind: "skipped", name };
  const protocolText = fields["Protocol"];
  const protocol = protocolText !== void 0 ? Number.parseInt(protocolText.trim(), 10) : 0;
  const mapped = mapFileZillaProtocol(protocol);
  if (mapped === void 0) {
    return Number.isFinite(protocol) ? { kind: "skipped", name, protocol } : { kind: "skipped", name };
  }
  const profile = { host, provider: mapped.provider };
  if (mapped.secure !== void 0) profile.secure = mapped.secure;
  const portText = fields["Port"];
  if (portText !== void 0) {
    const port = Number.parseInt(portText.trim(), 10);
    if (Number.isFinite(port)) profile.port = port;
  }
  const user = fields["User"]?.trim();
  if (user !== void 0 && user !== "") profile.username = { value: user };
  let password;
  const rawPass = fields["Pass"];
  if (rawPass !== void 0 && rawPass !== "") {
    if (passwordEncoding === "base64") {
      password = Buffer5.from(rawPass, "base64").toString("utf8");
    } else {
      password = rawPass;
    }
    if (password !== void 0 && password !== "") profile.password = { value: password };
  }
  const site = { name, profile };
  if (password !== void 0) site.password = password;
  const logonText = fields["Logontype"];
  if (logonText !== void 0) {
    const logonType = Number.parseInt(logonText.trim(), 10);
    if (Number.isFinite(logonType)) site.logonType = logonType;
  }
  return { kind: "site", site };
}
function mapFileZillaProtocol(code) {
  switch (code) {
    case 0:
      return { provider: "ftp" };
    case 1:
      return { provider: "sftp" };
    case 4:
      return { provider: "ftps", secure: true };
    case 5:
      return { provider: "ftps", secure: true };
    case 6:
      return { provider: "ftp", secure: false };
    default:
      return void 0;
  }
}
function tokenizeXml(xml) {
  const events = [];
  let index = 0;
  const length = xml.length;
  while (index < length) {
    const lt = xml.indexOf("<", index);
    if (lt === -1) {
      const text = xml.slice(index);
      if (text.trim() !== "") events.push({ kind: "text", text: decodeEntities(text) });
      break;
    }
    if (lt > index) {
      const text = xml.slice(index, lt);
      if (text.trim() !== "") events.push({ kind: "text", text: decodeEntities(text) });
    }
    if (xml.startsWith("<!--", lt)) {
      const end = xml.indexOf("-->", lt + 4);
      index = end === -1 ? length : end + 3;
      continue;
    }
    if (xml.startsWith("<![CDATA[", lt)) {
      const end = xml.indexOf("]]>", lt + 9);
      const cdataEnd = end === -1 ? length : end;
      events.push({ kind: "text", text: xml.slice(lt + 9, cdataEnd) });
      index = end === -1 ? length : end + 3;
      continue;
    }
    if (xml[lt + 1] === "?" || xml[lt + 1] === "!") {
      const gt2 = xml.indexOf(">", lt + 1);
      index = gt2 === -1 ? length : gt2 + 1;
      continue;
    }
    const gt = xml.indexOf(">", lt + 1);
    if (gt === -1) break;
    const tagBody = xml.slice(lt + 1, gt);
    if (tagBody.startsWith("/")) {
      events.push({ kind: "close", name: tagBody.slice(1).trim() });
    } else {
      const selfClosing = tagBody.endsWith("/");
      const body = selfClosing ? tagBody.slice(0, -1) : tagBody;
      const { name, attributes } = parseTagBody(body.trim());
      events.push({ attributes, kind: "open", name, selfClosing });
      if (selfClosing) events.push({ kind: "close", name });
    }
    index = gt + 1;
  }
  return events;
}
function parseTagBody(body) {
  const match = body.match(/^([A-Za-z_:][\w:.-]*)\s*(.*)$/);
  if (!match) return { attributes: {}, name: body };
  const name = match[1] ?? "";
  const rest = match[2] ?? "";
  const attributes = {};
  const attrRegex = /([A-Za-z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(rest)) !== null) {
    const key = attrMatch[1];
    const value = attrMatch[3] ?? attrMatch[4] ?? "";
    if (key !== void 0) attributes[key] = decodeEntities(value);
  }
  return { attributes, name };
}
function decodeEntities(text) {
  return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}

// src/profiles/importers/WinScpImporter.ts
function importWinScpSessions(ini) {
  const sections = parseIni(ini);
  const sessionSections = sections.filter((section) => section.name.startsWith("Sessions\\"));
  if (sessionSections.length === 0) {
    throw new ConfigurationError({
      code: "winscp_ini_no_sessions",
      message: "WinSCP INI does not contain any [Sessions\\...] sections.",
      retryable: false
    });
  }
  const sessions = [];
  const skipped = [];
  for (const section of sessionSections) {
    const decodedPath = decodeSessionPath(section.name.slice("Sessions\\".length));
    const segments = decodedPath.split("/").filter((segment) => segment !== "");
    const name = segments[segments.length - 1] ?? decodedPath;
    const folder = segments.slice(0, -1);
    const built = buildSessionProfile(name, section.values);
    if (built.kind === "session") {
      sessions.push({ ...built.session, folder });
    } else {
      skipped.push({
        folder,
        name,
        ...built.fsProtocol !== void 0 ? { fsProtocol: built.fsProtocol } : {}
      });
    }
  }
  return { sessions, skipped };
}
function buildSessionProfile(name, values) {
  const host = values["HostName"]?.trim();
  if (host === void 0 || host === "") return { kind: "skipped" };
  const fsProtocolText = values["FSProtocol"];
  const fsProtocol = fsProtocolText !== void 0 ? Number.parseInt(fsProtocolText, 10) : 1;
  const ftpsText = values["Ftps"];
  const ftps = ftpsText !== void 0 ? Number.parseInt(ftpsText, 10) : 0;
  const mapped = mapWinScpProtocol(fsProtocol, ftps);
  if (mapped === void 0) {
    return Number.isFinite(fsProtocol) ? { fsProtocol, kind: "skipped" } : { kind: "skipped" };
  }
  const profile = { host, provider: mapped.provider };
  if (mapped.secure !== void 0) profile.secure = mapped.secure;
  const portText = values["PortNumber"];
  if (portText !== void 0) {
    const port = Number.parseInt(portText, 10);
    if (Number.isFinite(port)) profile.port = port;
  }
  const user = values["UserName"]?.trim();
  if (user !== void 0 && user !== "") profile.username = { value: user };
  if (mapped.provider === "sftp") {
    const ssh = {};
    const keyPath = values["PublicKeyFile"]?.trim();
    if (keyPath !== void 0 && keyPath !== "") ssh.privateKey = { path: keyPath };
    if (Object.keys(ssh).length > 0) profile.ssh = ssh;
  }
  const session = { name, profile };
  if (Number.isFinite(fsProtocol)) session.fsProtocol = fsProtocol;
  if (Number.isFinite(ftps) && ftps !== 0) session.ftps = ftps;
  return { kind: "session", session };
}
function mapWinScpProtocol(fsProtocol, ftps) {
  switch (fsProtocol) {
    case 0:
    case 1:
    case 2:
      return { provider: "sftp" };
    case 5:
      return ftps === 0 ? { provider: "ftp" } : { provider: "ftps", secure: ftps === 1 };
    default:
      return void 0;
  }
}
function parseIni(text) {
  const sections = [];
  let current;
  const lines = text.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/^\s*[#;].*$/, "").trim();
    if (line === "") continue;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch && sectionMatch[1] !== void 0) {
      current = { name: sectionMatch[1], values: {} };
      sections.push(current);
      continue;
    }
    if (current === void 0) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (key !== "") current.values[key] = value;
  }
  return sections;
}
function decodeSessionPath(name) {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

// src/errors/errorFactory.ts
function errorFromFtpReply(input) {
  const details = {
    ftpCode: input.ftpCode,
    message: input.message,
    protocol: input.protocol ?? "ftp",
    retryable: false
  };
  if (input.command !== void 0) details.command = input.command;
  if (input.path !== void 0) details.path = input.path;
  if (input.cause !== void 0) details.cause = input.cause;
  if (input.ftpCode === 530) {
    return new AuthenticationError(details);
  }
  if (input.ftpCode === 421) {
    return new ConnectionError({
      ...details,
      retryable: true
    });
  }
  if (input.ftpCode === 550) {
    return mapFtp550(details);
  }
  if ([450, 451, 452].includes(input.ftpCode)) {
    return new TransferError({
      ...details,
      retryable: true
    });
  }
  if (input.ftpCode >= 400 && input.ftpCode < 500) {
    return new ConnectionError({
      ...details,
      retryable: true
    });
  }
  return new ProtocolError(details);
}
function mapFtp550(details) {
  const lowerMessage = details.message.toLowerCase();
  if (lowerMessage.includes("already") || lowerMessage.includes("exists")) {
    return new PathAlreadyExistsError(details);
  }
  if (lowerMessage.includes("not found") || lowerMessage.includes("no such") || lowerMessage.includes("unavailable")) {
    return new PathNotFoundError(details);
  }
  return new PermissionDeniedError(details);
}

// src/transfers/TransferPlan.ts
function createTransferPlan(input) {
  const plan = {
    createdAt: input.now?.() ?? /* @__PURE__ */ new Date(),
    dryRun: input.dryRun ?? true,
    id: input.id,
    steps: input.steps.map(clonePlanStep),
    warnings: [...input.warnings ?? []]
  };
  if (input.metadata !== void 0) {
    plan.metadata = { ...input.metadata };
  }
  return plan;
}
function summarizeTransferPlan(plan) {
  const actions = {};
  let destructiveSteps = 0;
  let executableSteps = 0;
  let skippedSteps = 0;
  let totalExpectedBytes = 0;
  for (const step of plan.steps) {
    actions[step.action] = (actions[step.action] ?? 0) + 1;
    destructiveSteps += step.destructive === true ? 1 : 0;
    skippedSteps += step.action === "skip" ? 1 : 0;
    executableSteps += step.action === "skip" ? 0 : 1;
    totalExpectedBytes += step.expectedBytes ?? 0;
  }
  return {
    actions,
    destructiveSteps,
    executableSteps,
    skippedSteps,
    totalExpectedBytes,
    totalSteps: plan.steps.length
  };
}
function createTransferJobsFromPlan(plan) {
  return plan.steps.flatMap((step) => {
    if (step.action === "skip") {
      return [];
    }
    const job = {
      id: `${plan.id}:${step.id}`,
      operation: step.action
    };
    if (step.source !== void 0) job.source = cloneEndpoint2(step.source);
    if (step.destination !== void 0) job.destination = cloneEndpoint2(step.destination);
    if (step.expectedBytes !== void 0) job.totalBytes = step.expectedBytes;
    if (step.metadata !== void 0) job.metadata = { ...step.metadata };
    return [job];
  });
}
function clonePlanStep(step) {
  const clone = {
    action: step.action,
    id: step.id
  };
  if (step.source !== void 0) clone.source = cloneEndpoint2(step.source);
  if (step.destination !== void 0) clone.destination = cloneEndpoint2(step.destination);
  if (step.expectedBytes !== void 0) clone.expectedBytes = step.expectedBytes;
  if (step.destructive !== void 0) clone.destructive = step.destructive;
  if (step.reason !== void 0) clone.reason = step.reason;
  if (step.metadata !== void 0) clone.metadata = { ...step.metadata };
  return clone;
}
function cloneEndpoint2(endpoint) {
  const clone = { path: endpoint.path };
  if (endpoint.provider !== void 0) {
    clone.provider = endpoint.provider;
  }
  return clone;
}

// src/transfers/TransferQueue.ts
var TransferQueue = class {
  engine;
  items = [];
  defaultExecutor;
  resolveExecutor;
  retry;
  timeout;
  bandwidthLimit;
  onProgress;
  onReceipt;
  onError;
  concurrency;
  paused = false;
  /**
   * Creates a transfer queue.
   *
   * @param options - Queue engine, concurrency, executor, and observer options.
   */
  constructor(options = {}) {
    this.engine = options.engine ?? new TransferEngine();
    this.concurrency = normalizeConcurrency(options.concurrency);
    this.defaultExecutor = options.executor;
    this.resolveExecutor = options.resolveExecutor;
    this.retry = options.retry;
    this.timeout = options.timeout;
    this.bandwidthLimit = options.bandwidthLimit;
    this.onProgress = options.onProgress;
    this.onReceipt = options.onReceipt;
    this.onError = options.onError;
  }
  /** Adds a transfer job to the queue. */
  add(job, executor) {
    if (this.items.some((item2) => item2.id === job.id)) {
      throw new ConfigurationError({
        details: { jobId: job.id },
        message: `Transfer queue already contains job: ${job.id}`,
        retryable: false
      });
    }
    const item = {
      controller: new AbortController(),
      id: job.id,
      job: cloneTransferJob(job),
      status: "queued"
    };
    if (executor !== void 0) {
      item.executor = executor;
    }
    this.items.push(item);
    return toPublicItem(item);
  }
  /** Pauses dispatch of new queued jobs. Running jobs are allowed to finish. */
  pause() {
    this.paused = true;
  }
  /** Resumes dispatch of queued jobs on the next `run()` call. */
  resume() {
    this.paused = false;
  }
  /** Updates queue concurrency for subsequent drains. */
  setConcurrency(concurrency) {
    this.concurrency = normalizeConcurrency(concurrency);
  }
  /** Cancels a queued or running job. */
  cancel(jobId) {
    const item = this.items.find((candidate) => candidate.id === jobId);
    if (item === void 0 || item.status === "completed" || item.status === "failed" || item.status === "canceled") {
      return false;
    }
    item.controller.abort();
    if (item.status === "queued") {
      item.status = "canceled";
    }
    return true;
  }
  /** Returns a queued item snapshot by id. */
  get(jobId) {
    const item = this.items.find((candidate) => candidate.id === jobId);
    return item === void 0 ? void 0 : toPublicItem(item);
  }
  /** Lists queue item snapshots in insertion order. */
  list() {
    return this.items.map(toPublicItem);
  }
  /** Drains currently queued jobs until complete, failed, canceled, or paused. */
  async run(options = {}) {
    const workerCount = Math.max(1, Math.min(this.concurrency, this.countDispatchableItems()));
    const workers = Array.from({ length: workerCount }, () => this.runWorker(options));
    await Promise.all(workers);
    return this.summarize();
  }
  /** Returns a queue summary without executing more work. */
  summarize() {
    const publicItems = this.items.map(toPublicItem);
    return {
      canceled: publicItems.filter((item) => item.status === "canceled").length,
      completed: publicItems.filter((item) => item.status === "completed").length,
      failed: publicItems.filter((item) => item.status === "failed").length,
      failures: publicItems.filter((item) => item.status === "failed"),
      queued: publicItems.filter((item) => item.status === "queued").length,
      receipts: publicItems.filter(
        (item) => item.receipt !== void 0
      ).map((item) => item.receipt),
      running: publicItems.filter((item) => item.status === "running").length,
      total: publicItems.length
    };
  }
  async runWorker(options) {
    for (; ; ) {
      const item = this.nextQueuedItem();
      if (item === void 0) {
        return;
      }
      await this.runItem(item, options);
    }
  }
  nextQueuedItem() {
    if (this.paused) {
      return void 0;
    }
    const item = this.items.find((candidate) => candidate.status === "queued");
    if (item !== void 0) {
      item.status = item.controller.signal.aborted ? "canceled" : "running";
    }
    return item?.status === "running" ? item : void 0;
  }
  async runItem(item, options) {
    const abortListener = createAbortForwarder(options.signal, item.controller);
    try {
      const executeOptions = {
        signal: item.controller.signal
      };
      const onProgress = options.onProgress ?? this.onProgress;
      const retry = options.retry ?? this.retry;
      const timeout = options.timeout ?? this.timeout;
      const bandwidthLimit = options.bandwidthLimit ?? this.bandwidthLimit;
      if (onProgress !== void 0) {
        executeOptions.onProgress = onProgress;
      }
      if (retry !== void 0) {
        executeOptions.retry = retry;
      }
      if (timeout !== void 0) {
        executeOptions.timeout = timeout;
      }
      if (bandwidthLimit !== void 0) {
        executeOptions.bandwidthLimit = bandwidthLimit;
      }
      const receipt = await this.engine.execute(
        item.job,
        this.requireExecutor(item),
        executeOptions
      );
      item.receipt = receipt;
      item.status = "completed";
      this.onReceipt?.(receipt);
    } catch (error) {
      item.error = error;
      item.status = item.controller.signal.aborted ? "canceled" : "failed";
      if (item.status === "failed") {
        this.onError?.(toPublicItem(item), error);
      }
    } finally {
      abortListener.dispose();
    }
  }
  requireExecutor(item) {
    const executor = item.executor ?? this.defaultExecutor ?? this.resolveExecutor?.(item.job);
    if (executor === void 0) {
      throw new ConfigurationError({
        details: { jobId: item.job.id },
        message: `Transfer queue job has no executor: ${item.job.id}`,
        retryable: false
      });
    }
    return executor;
  }
  countDispatchableItems() {
    return this.items.filter((item) => item.status === "queued" && !item.controller.signal.aborted).length;
  }
};
function normalizeConcurrency(value) {
  if (value === void 0 || !Number.isFinite(value)) {
    return 1;
  }
  return Math.max(1, Math.floor(value));
}
function createAbortForwarder(source, target) {
  if (source === void 0) {
    return { dispose: () => void 0 };
  }
  const abort = () => target.abort();
  if (source.aborted) {
    abort();
    return { dispose: () => void 0 };
  }
  source.addEventListener("abort", abort, { once: true });
  return {
    dispose: () => source.removeEventListener("abort", abort)
  };
}
function toPublicItem(item) {
  const snapshot = {
    id: item.id,
    job: cloneTransferJob(item.job),
    status: item.status
  };
  if (item.receipt !== void 0) snapshot.receipt = item.receipt;
  if (item.error !== void 0) snapshot.error = item.error;
  return snapshot;
}
function cloneTransferJob(job) {
  const clone = {
    id: job.id,
    operation: job.operation
  };
  if (job.source !== void 0) clone.source = { ...job.source };
  if (job.destination !== void 0) clone.destination = { ...job.destination };
  if (job.totalBytes !== void 0) clone.totalBytes = job.totalBytes;
  if (job.resumed !== void 0) clone.resumed = job.resumed;
  if (job.metadata !== void 0) clone.metadata = { ...job.metadata };
  return clone;
}

// src/sync/createRemoteBrowser.ts
function parentRemotePath(input) {
  const normalized = normalizeRemotePath(input);
  if (normalized === "/") return "/";
  const parts = normalized.split("/").filter(Boolean);
  parts.pop();
  if (parts.length === 0) return "/";
  return `/${parts.join("/")}`;
}
function buildRemoteBreadcrumbs(input) {
  const normalized = normalizeRemotePath(input);
  const crumbs = [{ name: "/", path: "/" }];
  if (normalized === "/") return crumbs;
  const parts = normalized.split("/").filter(Boolean);
  let cursor = "";
  for (const part of parts) {
    cursor += `/${part}`;
    crumbs.push({ name: part, path: cursor });
  }
  return crumbs;
}
function sortRemoteEntries(entries, key = "name", order = "asc") {
  const direction = order === "asc" ? 1 : -1;
  return [...entries].sort((left, right) => {
    if (key !== "type") {
      const leftIsDir = left.type === "directory";
      const rightIsDir = right.type === "directory";
      if (leftIsDir !== rightIsDir) return leftIsDir ? -1 : 1;
    }
    const compared = compareEntriesByKey(left, right, key);
    if (compared !== 0) return compared * direction;
    return compareNames(left, right);
  });
}
function filterRemoteEntries(entries, options = {}) {
  const showHidden = options.showHidden ?? true;
  const filter = options.filter;
  return entries.filter((entry) => {
    if (!showHidden && entry.name.startsWith(".")) return false;
    if (filter !== void 0 && !filter(entry)) return false;
    return true;
  });
}
function createRemoteBrowser(options) {
  const { fs } = options;
  let currentPath = normalizeRemotePath(options.initialPath ?? "/");
  let cachedEntries = [];
  let sortKey = options.sortKey ?? "name";
  let sortOrder = options.sortOrder ?? "asc";
  let showHidden = options.showHidden ?? true;
  const filter = options.filter;
  async function loadCurrent() {
    const raw = await fs.list(currentPath);
    const projected = projectEntries(raw);
    cachedEntries = projected;
    return snapshot();
  }
  function projectEntries(raw) {
    const filterOptions = { showHidden };
    if (filter !== void 0) filterOptions.filter = filter;
    const filtered = filterRemoteEntries(raw, filterOptions);
    return sortRemoteEntries(filtered, sortKey, sortOrder);
  }
  function snapshot() {
    return {
      breadcrumbs: buildRemoteBreadcrumbs(currentPath),
      entries: [...cachedEntries],
      path: currentPath
    };
  }
  async function navigate(target) {
    currentPath = resolveTarget(currentPath, target);
    return loadCurrent();
  }
  async function open2(entry) {
    if (entry.type !== "directory") {
      throw new TypeError(`Cannot open non-directory entry "${entry.path}" (type: ${entry.type})`);
    }
    return navigate(entry.path);
  }
  return {
    breadcrumbs: () => buildRemoteBreadcrumbs(currentPath),
    get entries() {
      return cachedEntries;
    },
    navigate,
    open: open2,
    get path() {
      return currentPath;
    },
    refresh: loadCurrent,
    setShowHidden(value) {
      showHidden = value;
    },
    setSort(key, order = sortOrder) {
      sortKey = key;
      sortOrder = order;
    },
    up: () => navigate(parentRemotePath(currentPath))
  };
}
function resolveTarget(currentPath, target) {
  if (target.startsWith("/")) return normalizeRemotePath(target);
  if (target === "" || target === ".") return currentPath;
  if (target === "..") return parentRemotePath(currentPath);
  const base = currentPath === "/" ? "" : currentPath;
  return normalizeRemotePath(`${base}/${target}`);
}
function compareEntriesByKey(left, right, key) {
  switch (key) {
    case "size":
      return (left.size ?? 0) - (right.size ?? 0);
    case "modifiedAt": {
      const leftTime = left.modifiedAt?.getTime() ?? 0;
      const rightTime = right.modifiedAt?.getTime() ?? 0;
      return leftTime - rightTime;
    }
    case "type":
      return left.type.localeCompare(right.type);
    case "name":
    default:
      return compareNames(left, right);
  }
}
function compareNames(left, right) {
  return left.name.localeCompare(right.name, void 0, { numeric: true, sensitivity: "base" });
}

// src/sync/createSyncPlan.ts
function createSyncPlan(options) {
  const direction = options.direction ?? "source-to-destination";
  const deletePolicy = options.deletePolicy ?? "never";
  const conflictPolicy = options.conflictPolicy ?? "overwrite";
  const includeDirectoryActions = options.includeDirectoryActions ?? false;
  const sourceRoot = normalizeRemotePath(options.source.rootPath);
  const destinationRoot = normalizeRemotePath(options.destination.rootPath);
  const warnings = [];
  const steps = [];
  for (const entry of options.diff.entries) {
    const context = {
      conflictPolicy,
      deletePolicy,
      destinationRoot,
      direction,
      entry,
      includeDirectoryActions,
      sourceRoot,
      warnings
    };
    if (options.source.provider !== void 0) context.sourceProvider = options.source.provider;
    if (options.destination.provider !== void 0) {
      context.destinationProvider = options.destination.provider;
    }
    const step = planEntry(context);
    if (step !== void 0) steps.push(step);
  }
  const planInput = {
    id: options.id,
    steps,
    warnings
  };
  if (options.dryRun !== void 0) planInput.dryRun = options.dryRun;
  if (options.now !== void 0) planInput.now = options.now;
  if (options.metadata !== void 0) planInput.metadata = options.metadata;
  return createTransferPlan(planInput);
}
function planEntry(context) {
  const { entry } = context;
  const isDirectory = isDirectoryEntry(entry);
  if (isDirectory && !context.includeDirectoryActions) {
    return void 0;
  }
  switch (entry.status) {
    case "added":
      return planAdded(context);
    case "removed":
      return planRemoved(context);
    case "modified":
      return planModified(context);
    case "unchanged":
      return planUnchanged(context);
    default:
      return void 0;
  }
}
function planAdded(context) {
  if (context.direction === "source-to-destination") {
    return createCopyStep(context, "source", "destination", expectedBytesFor(context.entry));
  }
  if (context.deletePolicy === "never") {
    return createSkipStep(context, "Source-only entry preserved by delete policy");
  }
  return createDeleteStep(context, "source");
}
function planRemoved(context) {
  if (context.direction === "destination-to-source") {
    return createCopyStep(context, "destination", "source", expectedBytesFor(context.entry));
  }
  if (context.deletePolicy === "never") {
    return createSkipStep(context, "Destination-only entry preserved by delete policy");
  }
  if (context.deletePolicy === "replace-only") {
    return createSkipStep(
      context,
      "Destination-only entry preserved (no source replacement available)"
    );
  }
  return createDeleteStep(context, "destination");
}
function planModified(context) {
  switch (context.conflictPolicy) {
    case "overwrite":
      return createCopyStep(context, "source", "destination", expectedBytesFor(context.entry), {
        destructive: true
      });
    case "prefer-destination":
      return createCopyStep(context, "destination", "source", expectedBytesFor(context.entry), {
        destructive: true
      });
    case "skip":
      return createSkipStep(context, `Conflict skipped: ${context.entry.reasons.join(",")}`);
    case "error":
      throw new ConfigurationError({
        details: {
          path: context.entry.path,
          reasons: context.entry.reasons
        },
        message: `Sync plan conflict at ${context.entry.path} with reasons: ${context.entry.reasons.join(", ")}`,
        retryable: false
      });
    default:
      return createSkipStep(context, "Conflict skipped");
  }
}
function planUnchanged(context) {
  return createSkipStep(context, "Entry already in sync");
}
function createCopyStep(context, fromSide, toSide, expectedBytes, overrides = {}) {
  const step = {
    action: "copy",
    id: makeStepId(context.entry, `copy-${fromSide}-to-${toSide}`),
    reason: describeReasons(context.entry, `Copy ${fromSide} to ${toSide}`)
  };
  step.source = endpointFor(context, fromSide);
  step.destination = endpointFor(context, toSide);
  if (expectedBytes !== void 0) step.expectedBytes = expectedBytes;
  if (overrides.destructive === true) step.destructive = true;
  if (overrides.metadata !== void 0) step.metadata = { ...overrides.metadata };
  return step;
}
function createDeleteStep(context, side) {
  return {
    action: "delete",
    destination: endpointFor(context, side),
    destructive: true,
    id: makeStepId(context.entry, `delete-${side}`),
    reason: `Delete ${side} entry not present on the other side`
  };
}
function createSkipStep(context, reason) {
  return {
    action: "skip",
    id: makeStepId(context.entry, "skip"),
    reason,
    source: endpointFor(context, "source"),
    destination: endpointFor(context, "destination")
  };
}
function endpointFor(context, side) {
  const root = side === "source" ? context.sourceRoot : context.destinationRoot;
  const provider = side === "source" ? context.sourceProvider : context.destinationProvider;
  const endpoint = {
    path: joinRootAndRelative(root, context.entry.path)
  };
  if (provider !== void 0) endpoint.provider = provider;
  return endpoint;
}
function joinRootAndRelative(rootPath, relativePath) {
  if (rootPath === "/") return relativePath;
  if (relativePath === "/") return rootPath;
  return joinRemotePath(rootPath, relativePath);
}
function makeStepId(entry, suffix) {
  return `${entry.path}#${suffix}`;
}
function describeReasons(entry, prefix) {
  if (entry.reasons.length === 0) return prefix;
  return `${prefix} (${entry.reasons.join(",")})`;
}
function expectedBytesFor(entry) {
  return entry.source?.size ?? entry.destination?.size;
}
function isDirectoryEntry(entry) {
  return entry.source?.type === "directory" || entry.destination?.type === "directory";
}

// src/sync/createAtomicDeployPlan.ts
var DEFAULT_RELEASES_DIRECTORY = ".releases";
var DEFAULT_RETAIN = 3;
function createAtomicDeployPlan(options) {
  const retain = options.retain ?? DEFAULT_RETAIN;
  if (retain < 1) {
    throw new ConfigurationError({
      details: { retain },
      message: "Atomic deploy retain count must be at least 1",
      retryable: false
    });
  }
  const livePath = normalizeRemotePath(options.destination.rootPath);
  if (livePath === "/") {
    throw new ConfigurationError({
      message: "Atomic deploy destination rootPath must not be the filesystem root",
      retryable: false
    });
  }
  const strategy = options.strategy ?? "rename";
  const now = options.now?.() ?? /* @__PURE__ */ new Date();
  const releaseId = options.releaseId ?? defaultReleaseId(now);
  const releasesRoot = joinRemotePath(
    livePath,
    options.releasesDirectory ?? DEFAULT_RELEASES_DIRECTORY
  );
  const stagingPath = joinRemotePath(releasesRoot, releaseId);
  const backupPath = strategy === "rename" ? joinRemotePath(releasesRoot, `${releaseId}.previous`) : void 0;
  const provider = options.destination.provider ?? options.source.provider;
  const warnings = [];
  const uploadPlan = createSyncPlan({
    conflictPolicy: "overwrite",
    deletePolicy: "never",
    destination: {
      ...options.destination.provider !== void 0 ? { provider: options.destination.provider } : {},
      rootPath: stagingPath
    },
    diff: options.diff,
    direction: "source-to-destination",
    dryRun: options.dryRun ?? true,
    id: `${options.id}/upload`,
    includeDirectoryActions: false,
    ...options.now !== void 0 ? { now: options.now } : {},
    source: options.source
  });
  const activate = buildActivateSteps({
    backupPath,
    livePath,
    planId: options.id,
    provider,
    stagingPath,
    strategy
  });
  const prune = buildPruneSteps({
    existingReleases: options.existingReleases ?? [],
    planId: options.id,
    provider,
    releaseId,
    releasesRoot,
    retain
  });
  const plan = {
    activate,
    createdAt: now,
    id: options.id,
    livePath,
    prune,
    releaseId,
    releasesRoot,
    retain,
    stagingPath,
    strategy,
    uploadPlan,
    warnings
  };
  if (provider !== void 0) plan.provider = provider;
  if (backupPath !== void 0) plan.backupPath = backupPath;
  if (options.metadata !== void 0) plan.metadata = { ...options.metadata };
  return plan;
}
function buildActivateSteps(context) {
  if (context.strategy === "symlink") {
    const step = {
      destructive: true,
      fromPath: context.stagingPath,
      id: `${context.planId}/activate/symlink`,
      operation: "symlink",
      reason: "Update live symlink to point at the new release",
      toPath: context.livePath
    };
    if (context.provider !== void 0) step.provider = context.provider;
    return [step];
  }
  const steps = [];
  if (context.backupPath !== void 0) {
    const backup = {
      destructive: true,
      fromPath: context.livePath,
      id: `${context.planId}/activate/backup`,
      operation: "rename",
      reason: "Rename current live path aside as a release backup",
      toPath: context.backupPath
    };
    if (context.provider !== void 0) backup.provider = context.provider;
    steps.push(backup);
  }
  const promote = {
    destructive: true,
    fromPath: context.stagingPath,
    id: `${context.planId}/activate/promote`,
    operation: "rename",
    reason: "Promote the staged release to the live path",
    toPath: context.livePath
  };
  if (context.provider !== void 0) promote.provider = context.provider;
  steps.push(promote);
  return steps;
}
function buildPruneSteps(context) {
  if (context.existingReleases.length === 0) return [];
  const normalizedRoot = normalizeRemotePath(context.releasesRoot);
  const newReleasePath = joinRemotePath(normalizedRoot, context.releaseId);
  const candidates = [...new Set(context.existingReleases.map((path2) => normalizeRemotePath(path2)))].filter((path2) => path2 !== newReleasePath).sort();
  const releasesToRetain = Math.max(0, context.retain - 1);
  if (candidates.length <= releasesToRetain) return [];
  const toPrune = candidates.slice(0, candidates.length - releasesToRetain);
  return toPrune.map((path2, index) => {
    const step = {
      id: `${context.planId}/prune/${index}`,
      path: path2,
      reason: "Older release exceeds retain window"
    };
    if (context.provider !== void 0) step.provider = context.provider;
    return step;
  });
}
function defaultReleaseId(now) {
  return now.toISOString().replace(/[:.]/g, "-");
}

// src/sync/walkRemoteTree.ts
async function* walkRemoteTree(fs, rootPath, options = {}) {
  const recursive = options.recursive ?? true;
  const includeDirectories = options.includeDirectories ?? true;
  const includeFiles = options.includeFiles ?? true;
  const followSymlinks = options.followSymlinks ?? false;
  const root = normalizeRemotePath(rootPath);
  const normalized = {
    followSymlinks,
    includeDirectories,
    includeFiles,
    recursive
  };
  if (options.maxDepth !== void 0) normalized.maxDepth = options.maxDepth;
  if (options.filter !== void 0) normalized.filter = options.filter;
  if (options.signal !== void 0) normalized.signal = options.signal;
  yield* walkDirectory(fs, root, 0, normalized);
}
async function* walkDirectory(fs, path2, depth, options) {
  throwIfAborted2(options.signal);
  const entries = await fs.list(path2);
  const sorted = [...entries].sort(compareEntries3);
  for (const entry of sorted) {
    if (options.filter !== void 0 && !options.filter(entry)) continue;
    if (matchesEntryKind(entry, options.includeDirectories, options.includeFiles)) {
      yield { depth, entry, parentPath: path2 };
    }
    if (options.recursive && canDescendInto(entry, options.followSymlinks) && (options.maxDepth === void 0 || depth < options.maxDepth)) {
      yield* walkDirectory(fs, ensureDescendPath(entry, path2), depth + 1, options);
    }
  }
}
function matchesEntryKind(entry, includeDirectories, includeFiles) {
  if (entry.type === "directory") return includeDirectories;
  if (entry.type === "file") return includeFiles;
  return true;
}
function canDescendInto(entry, followSymlinks) {
  if (entry.type === "directory") return true;
  return followSymlinks && entry.type === "symlink";
}
function ensureDescendPath(entry, parentPath) {
  if (entry.path !== "" && entry.path !== entry.name) {
    return normalizeRemotePath(entry.path);
  }
  return joinRemotePath(parentPath, entry.name);
}
function compareEntries3(left, right) {
  if (left.path < right.path) return -1;
  if (left.path > right.path) return 1;
  return 0;
}
function throwIfAborted2(signal) {
  if (signal?.aborted === true) {
    throw new AbortError({
      message: "Remote tree walk aborted",
      retryable: false
    });
  }
}

// src/sync/diffRemoteTrees.ts
async function diffRemoteTrees(source, sourcePath, destination, destinationPath, options = {}) {
  const includeUnchanged = options.includeUnchanged ?? false;
  const sourceRoot = normalizeRemotePath(sourcePath);
  const destinationRoot = normalizeRemotePath(destinationPath);
  const sourceWalk = createWalkOptions(options, options.sourceFilter);
  const destinationWalk = createWalkOptions(options, options.destinationFilter);
  const [sourceEntries, destinationEntries] = await Promise.all([
    collectEntries(source, sourceRoot, sourceWalk),
    collectEntries(destination, destinationRoot, destinationWalk)
  ]);
  const aligned = alignEntries(sourceEntries, destinationEntries);
  const entries = [];
  const summary = {
    added: 0,
    modified: 0,
    removed: 0,
    total: 0,
    unchanged: 0
  };
  for (const { path: path2, source: sourceEntry, destination: destinationEntry } of aligned) {
    summary.total += 1;
    const reasons = [];
    let status;
    if (sourceEntry !== void 0 && destinationEntry === void 0) {
      status = "added";
      summary.added += 1;
    } else if (sourceEntry === void 0 && destinationEntry !== void 0) {
      status = "removed";
      summary.removed += 1;
    } else if (sourceEntry !== void 0 && destinationEntry !== void 0) {
      const computedReasons = compareEntries4(sourceEntry, destinationEntry, options);
      if (computedReasons.length === 0) {
        status = "unchanged";
        summary.unchanged += 1;
      } else {
        status = "modified";
        reasons.push(...computedReasons);
        summary.modified += 1;
      }
    } else {
      continue;
    }
    if (status === "unchanged" && !includeUnchanged) continue;
    const record = { path: path2, reasons, status };
    if (sourceEntry !== void 0) record.source = sourceEntry;
    if (destinationEntry !== void 0) record.destination = destinationEntry;
    entries.push(record);
  }
  entries.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
  return { entries, summary };
}
function createWalkOptions(options, filter) {
  const walk = options.walk ?? {};
  const merged = {};
  if (walk.recursive !== void 0) merged.recursive = walk.recursive;
  if (walk.maxDepth !== void 0) merged.maxDepth = walk.maxDepth;
  if (walk.includeDirectories !== void 0) merged.includeDirectories = walk.includeDirectories;
  if (walk.includeFiles !== void 0) merged.includeFiles = walk.includeFiles;
  if (walk.followSymlinks !== void 0) merged.followSymlinks = walk.followSymlinks;
  const resolvedFilter = filter ?? walk.filter;
  if (resolvedFilter !== void 0) merged.filter = resolvedFilter;
  if (options.signal !== void 0) merged.signal = options.signal;
  return merged;
}
async function collectEntries(fs, rootPath, walkOptions) {
  const map = /* @__PURE__ */ new Map();
  for await (const record of walkRemoteTree(fs, rootPath, walkOptions)) {
    const collected = toCollectedEntry(record.entry, rootPath);
    if (collected !== void 0) map.set(collected.relativePath, collected.entry);
  }
  return map;
}
function toCollectedEntry(entry, rootPath) {
  const root = normalizeRemotePath(rootPath);
  const path2 = normalizeRemotePath(entry.path);
  if (path2 === root) return void 0;
  if (root === "/") return { entry, relativePath: path2 };
  if (path2.startsWith(`${root}/`)) {
    return { entry, relativePath: path2.slice(root.length) };
  }
  return void 0;
}
function alignEntries(sourceEntries, destinationEntries) {
  const paths = /* @__PURE__ */ new Set([...sourceEntries.keys(), ...destinationEntries.keys()]);
  const aligned = [];
  for (const path2 of paths) {
    const pair = { path: path2 };
    const source = sourceEntries.get(path2);
    const destination = destinationEntries.get(path2);
    if (source !== void 0) pair.source = source;
    if (destination !== void 0) pair.destination = destination;
    aligned.push(pair);
  }
  return aligned;
}
function compareEntries4(source, destination, options) {
  const reasons = [];
  const compareSize = options.compareSize ?? true;
  const compareModifiedAt = options.compareModifiedAt ?? true;
  const compareUniqueId = options.compareUniqueId ?? false;
  const tolerance = options.modifiedAtToleranceMs ?? 1e3;
  if (source.type !== destination.type) {
    reasons.push("type");
  }
  if (compareSize && isSizeRelevant(source, destination) && source.size !== destination.size) {
    reasons.push("size");
  }
  if (compareModifiedAt && isModifiedAtDifferent(source, destination, tolerance)) {
    reasons.push("modifiedAt");
  }
  if (compareUniqueId && source.uniqueId !== void 0 && destination.uniqueId !== void 0 && source.uniqueId !== destination.uniqueId) {
    reasons.push("checksum");
  }
  return reasons;
}
function isSizeRelevant(source, destination) {
  if (source.type !== "file" || destination.type !== "file") return false;
  return source.size !== void 0 && destination.size !== void 0;
}
function isModifiedAtDifferent(source, destination, toleranceMs) {
  if (source.modifiedAt === void 0 || destination.modifiedAt === void 0) return false;
  const delta = Math.abs(source.modifiedAt.getTime() - destination.modifiedAt.getTime());
  return delta > toleranceMs;
}

// src/sync/manifest.ts
var REMOTE_MANIFEST_FORMAT_VERSION = 1;
async function createRemoteManifest(fs, rootPath, options = {}) {
  const root = normalizeRemotePath(rootPath);
  const walkOptions = { ...options.walk ?? {} };
  const resolvedFilter = options.filter ?? options.walk?.filter;
  if (resolvedFilter !== void 0) walkOptions.filter = resolvedFilter;
  if (options.signal !== void 0) walkOptions.signal = options.signal;
  const entries = [];
  for await (const record of walkRemoteTree(fs, root, walkOptions)) {
    const relativePath = relativeFromRoot(record.entry.path, root);
    if (relativePath === void 0) continue;
    entries.push(toManifestEntry(record.entry, relativePath));
  }
  entries.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
  const generatedAt = (options.now?.() ?? /* @__PURE__ */ new Date()).toISOString();
  const manifest = {
    entries,
    formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
    generatedAt,
    root
  };
  if (options.provider !== void 0) manifest.provider = options.provider;
  return manifest;
}
function serializeRemoteManifest(manifest, indent = 2) {
  return JSON.stringify(manifest, void 0, indent);
}
function parseRemoteManifest(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      message: "Failed to parse remote manifest payload as JSON",
      retryable: false
    });
  }
  if (parsed === null || typeof parsed !== "object") {
    throw new ConfigurationError({
      message: "Remote manifest payload must be a JSON object",
      retryable: false
    });
  }
  const candidate = parsed;
  if (candidate.formatVersion !== REMOTE_MANIFEST_FORMAT_VERSION) {
    throw new ConfigurationError({
      details: {
        expected: REMOTE_MANIFEST_FORMAT_VERSION,
        received: candidate.formatVersion
      },
      message: `Unsupported remote manifest formatVersion: ${String(candidate.formatVersion)}`,
      retryable: false
    });
  }
  if (typeof candidate.root !== "string" || candidate.root.length === 0) {
    throw new ConfigurationError({
      message: "Remote manifest root must be a non-empty string",
      retryable: false
    });
  }
  if (typeof candidate.generatedAt !== "string") {
    throw new ConfigurationError({
      message: "Remote manifest generatedAt must be an ISO timestamp string",
      retryable: false
    });
  }
  if (!Array.isArray(candidate.entries)) {
    throw new ConfigurationError({
      message: "Remote manifest entries must be an array",
      retryable: false
    });
  }
  const entries = candidate.entries.map((entry, index) => normalizeManifestEntry(entry, index));
  const manifest = {
    entries,
    formatVersion: REMOTE_MANIFEST_FORMAT_VERSION,
    generatedAt: candidate.generatedAt,
    root: normalizeRemotePath(candidate.root)
  };
  if (typeof candidate.provider === "string") manifest.provider = candidate.provider;
  return manifest;
}
function compareRemoteManifests(source, destination, options = {}) {
  const includeUnchanged = options.includeUnchanged ?? false;
  const sourceMap = indexEntries(source);
  const destinationMap = indexEntries(destination);
  const paths = /* @__PURE__ */ new Set([...sourceMap.keys(), ...destinationMap.keys()]);
  const entries = [];
  const summary = {
    added: 0,
    modified: 0,
    removed: 0,
    total: 0,
    unchanged: 0
  };
  for (const path2 of paths) {
    summary.total += 1;
    const sourceEntry = sourceMap.get(path2);
    const destinationEntry = destinationMap.get(path2);
    const reasons = [];
    let status;
    if (sourceEntry !== void 0 && destinationEntry === void 0) {
      status = "added";
      summary.added += 1;
    } else if (sourceEntry === void 0 && destinationEntry !== void 0) {
      status = "removed";
      summary.removed += 1;
    } else if (sourceEntry !== void 0 && destinationEntry !== void 0) {
      const computed = compareManifestEntries(sourceEntry, destinationEntry, options);
      if (computed.length === 0) {
        status = "unchanged";
        summary.unchanged += 1;
      } else {
        status = "modified";
        reasons.push(...computed);
        summary.modified += 1;
      }
    } else {
      continue;
    }
    if (status === "unchanged" && !includeUnchanged) continue;
    const record = { path: path2, reasons, status };
    if (sourceEntry !== void 0) {
      record.source = manifestEntryToRemote(sourceEntry, source.root);
    }
    if (destinationEntry !== void 0) {
      record.destination = manifestEntryToRemote(destinationEntry, destination.root);
    }
    entries.push(record);
  }
  entries.sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
  return { entries, summary };
}
function relativeFromRoot(entryPath, root) {
  const path2 = normalizeRemotePath(entryPath);
  if (path2 === root) return void 0;
  if (root === "/") return path2;
  if (path2.startsWith(`${root}/`)) return path2.slice(root.length);
  return void 0;
}
function toManifestEntry(entry, relativePath) {
  const manifestEntry = {
    path: relativePath,
    type: entry.type
  };
  if (entry.size !== void 0) manifestEntry.size = entry.size;
  if (entry.modifiedAt !== void 0) manifestEntry.modifiedAt = entry.modifiedAt.toISOString();
  if (entry.uniqueId !== void 0) manifestEntry.uniqueId = entry.uniqueId;
  if (entry.symlinkTarget !== void 0) manifestEntry.symlinkTarget = entry.symlinkTarget;
  return manifestEntry;
}
function normalizeManifestEntry(value, index) {
  if (value === null || typeof value !== "object") {
    throw new ConfigurationError({
      details: { index },
      message: `Remote manifest entry at index ${index} must be an object`,
      retryable: false
    });
  }
  const candidate = value;
  if (typeof candidate.path !== "string" || candidate.path.length === 0) {
    throw new ConfigurationError({
      details: { index },
      message: `Remote manifest entry at index ${index} must have a non-empty path`,
      retryable: false
    });
  }
  if (!isRemoteEntryType(candidate.type)) {
    throw new ConfigurationError({
      details: { index, received: candidate.type },
      message: `Remote manifest entry at index ${index} has an invalid type`,
      retryable: false
    });
  }
  const entry = {
    path: candidate.path,
    type: candidate.type
  };
  if (typeof candidate.size === "number") entry.size = candidate.size;
  if (typeof candidate.modifiedAt === "string") entry.modifiedAt = candidate.modifiedAt;
  if (typeof candidate.uniqueId === "string") entry.uniqueId = candidate.uniqueId;
  if (typeof candidate.symlinkTarget === "string") entry.symlinkTarget = candidate.symlinkTarget;
  return entry;
}
function isRemoteEntryType(value) {
  return value === "file" || value === "directory" || value === "symlink" || value === "unknown";
}
function indexEntries(manifest) {
  const map = /* @__PURE__ */ new Map();
  for (const entry of manifest.entries) map.set(entry.path, entry);
  return map;
}
function manifestEntryToRemote(entry, root) {
  const absolutePath2 = root === "/" ? entry.path : `${root}${entry.path}`;
  const remote = {
    name: deriveName(entry.path),
    path: absolutePath2,
    type: entry.type
  };
  if (entry.size !== void 0) remote.size = entry.size;
  if (entry.modifiedAt !== void 0) {
    const parsed = new Date(entry.modifiedAt);
    if (!Number.isNaN(parsed.getTime())) remote.modifiedAt = parsed;
  }
  if (entry.uniqueId !== void 0) remote.uniqueId = entry.uniqueId;
  if (entry.symlinkTarget !== void 0) remote.symlinkTarget = entry.symlinkTarget;
  return remote;
}
function deriveName(path2) {
  const segments = path2.split("/").filter(Boolean);
  return segments.length === 0 ? "/" : segments[segments.length - 1] ?? "/";
}
function compareManifestEntries(source, destination, options) {
  const reasons = [];
  const compareSize = options.compareSize ?? true;
  const compareModifiedAt = options.compareModifiedAt ?? true;
  const compareUniqueId = options.compareUniqueId ?? false;
  const tolerance = options.modifiedAtToleranceMs ?? 1e3;
  if (source.type !== destination.type) reasons.push("type");
  if (compareSize && source.type === "file" && destination.type === "file" && source.size !== void 0 && destination.size !== void 0 && source.size !== destination.size) {
    reasons.push("size");
  }
  if (compareModifiedAt && isModifiedAtDifferent2(source, destination, tolerance)) {
    reasons.push("modifiedAt");
  }
  if (compareUniqueId && source.uniqueId !== void 0 && destination.uniqueId !== void 0 && source.uniqueId !== destination.uniqueId) {
    reasons.push("checksum");
  }
  return reasons;
}
function isModifiedAtDifferent2(source, destination, toleranceMs) {
  if (source.modifiedAt === void 0 || destination.modifiedAt === void 0) return false;
  const sourceTime = Date.parse(source.modifiedAt);
  const destinationTime = Date.parse(destination.modifiedAt);
  if (Number.isNaN(sourceTime) || Number.isNaN(destinationTime)) return false;
  return Math.abs(sourceTime - destinationTime) > toleranceMs;
}

// src/providers/classic/ftp/FtpProvider.ts
import { Buffer as Buffer6 } from "buffer";
import { createConnection, isIP } from "net";
import {
  connect as connectTls
} from "tls";

// src/providers/classic/ftp/FtpListParser.ts
var UNIX_LIST_MONTHS = new Map(
  ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].map(
    (month, index) => [month, index]
  )
);
function parseMlsdList(input, directory = ".") {
  return input.split(/\r?\n/).map((line) => line.trimEnd()).filter((line) => line.length > 0).map((line) => parseMlsdLine(line, directory)).filter((entry) => entry.name !== "." && entry.name !== "..");
}
function parseUnixList(input, directory = ".", now = /* @__PURE__ */ new Date()) {
  return input.split(/\r?\n/).map((line) => line.trimEnd()).filter((line) => line.length > 0 && !line.toLowerCase().startsWith("total ")).map((line) => parseUnixListLine(line, directory, now)).filter((entry) => entry.name !== "." && entry.name !== "..");
}
function parseUnixListLine(line, directory = ".", now = /* @__PURE__ */ new Date()) {
  const match = /^(\S{10})\s+\d+\s+(\S+)\s+(\S+)\s+(\d+)\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4}|\d{1,2}:\d{2})\s+(.+)$/.exec(
    line
  );
  if (match === null) {
    throw new ParseError({
      details: { line },
      message: `Malformed Unix LIST line: ${line}`,
      retryable: false
    });
  }
  const [, mode = "", owner, group, sizeText, monthText, dayText, yearOrTime, rawName] = match;
  const { name, symlinkTarget } = parseUnixListName(rawName, mode);
  const entry = {
    name,
    path: joinRemotePath(directory, name),
    permissions: { raw: mode },
    raw: { line },
    type: mapUnixListType(mode)
  };
  const modifiedAt = parseUnixListTimestamp(monthText, dayText, yearOrTime, now);
  if (owner !== void 0) entry.owner = owner;
  if (group !== void 0) entry.group = group;
  if (sizeText !== void 0) entry.size = Number(sizeText);
  if (modifiedAt !== void 0) entry.modifiedAt = modifiedAt;
  if (symlinkTarget !== void 0) entry.symlinkTarget = symlinkTarget;
  return entry;
}
function parseMlsdLine(line, directory = ".") {
  const separatorIndex = line.indexOf(" ");
  if (separatorIndex <= 0 || separatorIndex === line.length - 1) {
    throw new ParseError({
      message: `Malformed MLSD line: ${line}`,
      retryable: false,
      details: {
        line
      }
    });
  }
  const factText = line.slice(0, separatorIndex);
  const name = line.slice(separatorIndex + 1);
  const facts = parseFacts(factText);
  const type = mapMlsdType(facts.get("type"));
  const modifiedAt = parseMlstTimestamp(facts.get("modify"));
  const sizeText = facts.get("size");
  const permissions = facts.get("perm");
  const uniqueId = facts.get("unique");
  const entry = {
    name,
    path: joinRemotePath(directory, name),
    raw: {
      facts: Object.fromEntries(facts),
      line
    },
    type
  };
  if (sizeText !== void 0) entry.size = Number(sizeText);
  if (modifiedAt !== void 0) entry.modifiedAt = modifiedAt;
  if (permissions !== void 0) entry.permissions = { raw: permissions };
  if (uniqueId !== void 0) entry.uniqueId = uniqueId;
  return entry;
}
function parseMlstTimestamp(input) {
  if (input === void 0) {
    return void 0;
  }
  const timestampMatch = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\.(\d{1,3}))?$/.exec(input);
  if (timestampMatch === null) {
    return void 0;
  }
  const [, year, month, day, hour, minute, second, millisecond = "0"] = timestampMatch;
  const normalizedMillisecond = millisecond.padEnd(3, "0");
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(normalizedMillisecond)
    )
  );
}
function parseFacts(input) {
  const facts = /* @__PURE__ */ new Map();
  for (const fact of input.split(";")) {
    if (fact.length === 0) {
      continue;
    }
    const separatorIndex = fact.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }
    facts.set(fact.slice(0, separatorIndex).toLowerCase(), fact.slice(separatorIndex + 1));
  }
  return facts;
}
function mapMlsdType(input) {
  switch (input?.toLowerCase()) {
    case "file":
      return "file";
    case "cdir":
    case "dir":
    case "pdir":
      return "directory";
    case "os.unix=slink":
      return "symlink";
    default:
      return "unknown";
  }
}
function mapUnixListType(mode) {
  switch (mode[0]) {
    case "-":
      return "file";
    case "d":
      return "directory";
    case "l":
      return "symlink";
    default:
      return "unknown";
  }
}
function parseUnixListTimestamp(monthText, dayText, yearOrTime, now) {
  if (monthText === void 0 || dayText === void 0 || yearOrTime === void 0) {
    return void 0;
  }
  const month = UNIX_LIST_MONTHS.get(monthText.toLowerCase());
  const day = Number(dayText);
  if (month === void 0 || !Number.isInteger(day) || day < 1 || day > 31) {
    return void 0;
  }
  if (/^\d{4}$/.test(yearOrTime)) {
    return new Date(Date.UTC(Number(yearOrTime), month, day));
  }
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(yearOrTime);
  if (timeMatch === null) {
    return void 0;
  }
  const [, hourText, minuteText] = timeMatch;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (hour > 23 || minute > 59) {
    return void 0;
  }
  return new Date(Date.UTC(now.getUTCFullYear(), month, day, hour, minute));
}
function parseUnixListName(rawName, mode) {
  const name = rawName ?? "";
  if (!mode.startsWith("l")) {
    return { name };
  }
  const separator = " -> ";
  const separatorIndex = name.indexOf(separator);
  if (separatorIndex < 0) {
    return { name };
  }
  return {
    name: name.slice(0, separatorIndex),
    symlinkTarget: name.slice(separatorIndex + separator.length)
  };
}

// src/providers/classic/ftp/FtpResponseParser.ts
var FTP_LINE_PATTERN = /^(\d{3})([ -])(.*)$/;
var FtpResponseParser = class {
  buffer = "";
  pendingResponse;
  /**
   * Adds incoming socket data and returns any complete responses.
   *
   * @param chunk - Buffer or string chunk from the FTP control connection.
   * @returns Zero or more complete parsed responses.
   * @throws {@link ParseError} When a malformed standalone response line is received.
   */
  push(chunk) {
    this.buffer += chunk.toString();
    const rawLines = this.buffer.split(/\r?\n/);
    this.buffer = rawLines.pop() ?? "";
    const responses = [];
    for (const rawLine of rawLines) {
      const response = this.consumeLine(rawLine);
      if (response !== void 0) {
        responses.push(response);
      }
    }
    return responses;
  }
  /**
   * Clears buffered text and any incomplete multi-line response state.
   *
   * @returns Nothing.
   */
  reset() {
    this.buffer = "";
    this.pendingResponse = void 0;
  }
  /**
   * Checks whether the parser is holding buffered or incomplete response data.
   *
   * @returns `true` when there is unconsumed text or an open multi-line response.
   */
  hasPendingResponse() {
    return this.pendingResponse !== void 0 || this.buffer.length > 0;
  }
  /**
   * Consumes one line of FTP response text.
   *
   * @param rawLine - Line without a trailing CRLF delimiter.
   * @returns A complete response when the line finishes one, otherwise `undefined`.
   * @throws {@link ParseError} When a malformed standalone line is encountered.
   */
  consumeLine(rawLine) {
    const lineMatch = FTP_LINE_PATTERN.exec(rawLine);
    if (lineMatch === null) {
      if (this.pendingResponse !== void 0) {
        this.pendingResponse.lines.push(rawLine);
        this.pendingResponse.rawLines.push(rawLine);
        return void 0;
      }
      if (rawLine.length === 0) {
        return void 0;
      }
      throw new ParseError({
        message: `Malformed FTP response line: ${rawLine}`,
        retryable: false,
        details: {
          rawLine
        }
      });
    }
    const code = Number(lineMatch[1]);
    const separator = lineMatch[2];
    const message = lineMatch[3];
    if (this.pendingResponse !== void 0) {
      this.pendingResponse.lines.push(messageFromRawLine(rawLine, this.pendingResponse.code));
      this.pendingResponse.rawLines.push(rawLine);
      if (code === this.pendingResponse.code && separator === " ") {
        const completed = this.pendingResponse;
        this.pendingResponse = void 0;
        return buildResponse(completed.code, completed.lines, completed.rawLines);
      }
      return void 0;
    }
    if (separator === "-") {
      this.pendingResponse = {
        code,
        lines: [message],
        rawLines: [rawLine]
      };
      return void 0;
    }
    return buildResponse(code, [message], [rawLine]);
  }
};
function parseFtpResponseLines(lines) {
  const parser = new FtpResponseParser();
  const responses = parser.push(`${lines.join("\r\n")}\r
`);
  if (responses.length !== 1 || parser.hasPendingResponse()) {
    throw new ParseError({
      message: "Expected exactly one complete FTP response",
      retryable: false,
      details: {
        responseCount: responses.length
      }
    });
  }
  return responses[0];
}
function buildResponse(code, lines, rawLines) {
  const status = classifyStatus(code);
  return {
    code,
    message: lines.join("\n"),
    lines,
    raw: rawLines.join("\n"),
    status,
    preliminary: status === "preliminary",
    completion: status === "completion",
    intermediate: status === "intermediate",
    transientFailure: status === "transientFailure",
    permanentFailure: status === "permanentFailure"
  };
}
function classifyStatus(code) {
  if (code >= 100 && code < 200) return "preliminary";
  if (code >= 200 && code < 300) return "completion";
  if (code >= 300 && code < 400) return "intermediate";
  if (code >= 400 && code < 500) return "transientFailure";
  return "permanentFailure";
}
function messageFromRawLine(rawLine, code) {
  const codeText = String(code);
  if (rawLine.startsWith(`${codeText} `) || rawLine.startsWith(`${codeText}-`)) {
    return rawLine.slice(4);
  }
  return rawLine;
}

// src/providers/classic/ftp/FtpProvider.ts
var FTP_PROVIDER_ID = "ftp";
var FTPS_PROVIDER_ID = "ftps";
var DEFAULT_FTP_PORT = 21;
var DEFAULT_PASSIVE_HOST_STRATEGY = "control";
var FTP_PROVIDER_CAPABILITIES = createClassicFtpCapabilities(FTP_PROVIDER_ID, [
  "Classic FTP provider foundation with MLST/MLSD metadata, EPSV/PASV passive mode, timeout-guarded operations, and RETR/STOR streaming support"
]);
var FTPS_PROVIDER_CAPABILITIES = createClassicFtpCapabilities(FTPS_PROVIDER_ID, [
  "FTPS provider foundation with explicit AUTH TLS or implicit TLS, PBSZ/PROT setup, TLS profile support, MLST/MLSD metadata, EPSV/PASV passive mode, and RETR/STOR streaming support"
]);
function createClassicFtpCapabilities(provider, notes) {
  return {
    provider,
    authentication: provider === FTPS_PROVIDER_ID ? ["anonymous", "password", "client-certificate"] : ["anonymous", "password"],
    list: true,
    stat: true,
    readStream: true,
    writeStream: true,
    serverSideCopy: false,
    serverSideMove: false,
    resumeDownload: true,
    resumeUpload: true,
    checksum: [],
    atomicRename: false,
    chmod: false,
    chown: false,
    symlink: true,
    metadata: ["modifiedAt", "permissions", "uniqueId"],
    maxConcurrency: 1,
    notes
  };
}
function createFtpProviderFactory(options = {}) {
  return {
    id: FTP_PROVIDER_ID,
    capabilities: FTP_PROVIDER_CAPABILITIES,
    create: () => new FtpProvider({
      capabilities: FTP_PROVIDER_CAPABILITIES,
      defaultPort: options.defaultPort ?? DEFAULT_FTP_PORT,
      passiveHostStrategy: options.passiveHostStrategy ?? DEFAULT_PASSIVE_HOST_STRATEGY,
      providerId: FTP_PROVIDER_ID
    })
  };
}
var FtpProvider = class {
  /**
   * Creates a provider instance for a single connection attempt.
   *
   * @param config - Provider id, defaults, capabilities, and optional FTPS settings.
   */
  constructor(config) {
    this.config = config;
    this.id = config.providerId;
    this.capabilities = config.capabilities;
  }
  config;
  /** Stable provider id registered in the transfer client. */
  id;
  /** Provider capability snapshot exposed without opening a connection. */
  capabilities;
  /**
   * Opens an FTP-family transfer session from a provider-neutral connection profile.
   *
   * @param profile - Connection profile containing host, credentials, timeout, and optional TLS settings.
   * @returns Connected transfer session with filesystem and transfer operations.
   */
  async connect(profile) {
    const resolvedProfile = await resolveConnectionProfileSecrets(profile);
    const port = resolvedProfile.port ?? this.config.defaultPort;
    const connectOptions = {
      host: resolvedProfile.host,
      passiveHostStrategy: this.config.passiveHostStrategy,
      port,
      providerId: this.config.providerId
    };
    if (this.config.security !== void 0) {
      const pinnedFingerprint256 = createTlsPinnedFingerprints(resolvedProfile);
      connectOptions.security = {
        ...this.config.security,
        ...pinnedFingerprint256 === void 0 ? {} : { pinnedFingerprint256 },
        tlsOptions: createTlsConnectionOptions(resolvedProfile)
      };
    }
    if (resolvedProfile.signal !== void 0) {
      connectOptions.signal = resolvedProfile.signal;
    }
    if (resolvedProfile.timeoutMs !== void 0) {
      connectOptions.timeoutMs = resolvedProfile.timeoutMs;
    }
    const control = await FtpControlConnection.connect(connectOptions);
    try {
      await authenticateFtpSession(
        control,
        resolvedProfile.username === void 0 ? "anonymous" : secretToString(resolvedProfile.username),
        resolvedProfile.password === void 0 ? "anonymous@" : secretToString(resolvedProfile.password),
        resolvedProfile.host
      );
      return new FtpTransferSession(control, this.capabilities);
    } catch (error) {
      control.close();
      throw error;
    }
  }
};
var FtpTransferSession = class {
  /**
   * Creates session facades over an authenticated control connection.
   *
   * @param control - Authenticated FTP-family control connection.
   * @param capabilities - Capability snapshot to expose through the session.
   */
  constructor(control, capabilities) {
    this.control = control;
    this.provider = control.providerId;
    this.capabilities = capabilities;
    this.fs = new FtpFileSystem(control);
    this.transfers = new FtpTransferOperations(control);
  }
  control;
  /** Provider id selected for this session. */
  provider;
  /** Capability snapshot for this connected session. */
  capabilities;
  /** Remote file-system operations backed by FTP metadata/data commands. */
  fs;
  /** Stream-oriented provider transfer operations. */
  transfers;
  /** Disconnects the control connection, swallowing QUIT cleanup noise. */
  async disconnect() {
    try {
      await this.control.sendCommand("QUIT");
    } catch {
    } finally {
      this.control.close();
    }
  }
};
var FtpTransferOperations = class {
  constructor(control) {
    this.control = control;
  }
  control;
  async read(request) {
    request.throwIfAborted();
    const remotePath = normalizeFtpPath(request.endpoint.path);
    const range = resolveReadRange2(request.range);
    await expectCompletion(this.control, "TYPE I", remotePath);
    const dataConnection = await openPassiveDataCommand(
      this.control,
      `RETR ${remotePath}`,
      remotePath,
      {
        offset: range.offset
      }
    );
    request.throwIfAborted();
    const result = {
      content: createPassiveReadSource(
        this.control,
        dataConnection,
        `RETR ${remotePath}`,
        remotePath,
        range,
        request
      )
    };
    if (range.length !== void 0) {
      result.totalBytes = range.length;
    }
    if (range.offset > 0) {
      result.bytesRead = range.offset;
    }
    return result;
  }
  async write(request) {
    request.throwIfAborted();
    const remotePath = normalizeFtpPath(request.endpoint.path);
    const offset = normalizeOptionalByteCount3(request.offset, "offset", remotePath);
    await expectCompletion(this.control, "TYPE I", remotePath);
    const bytesTransferred = await writePassiveDataCommand(
      this.control,
      `STOR ${remotePath}`,
      remotePath,
      request,
      offset === void 0 ? {} : { offset }
    );
    const result = {
      bytesTransferred,
      resumed: offset !== void 0 && offset > 0,
      totalBytes: request.totalBytes ?? (offset ?? 0) + bytesTransferred,
      verified: request.verification?.verified ?? false
    };
    if (request.verification !== void 0) {
      result.verification = cloneVerification4(request.verification);
    }
    return result;
  }
};
var FtpFileSystem = class {
  constructor(control) {
    this.control = control;
  }
  control;
  async list(path2) {
    const remotePath = normalizeFtpPath(path2);
    await expectCompletion(this.control, "TYPE I", remotePath);
    const entries = await readDirectoryEntries(this.control, remotePath);
    return entries.sort(compareEntries5);
  }
  async stat(path2) {
    const remotePath = normalizeFtpPath(path2);
    const response = await this.control.sendCommand(`MLST ${remotePath}`);
    assertPathCommandSucceeded(response, "MLST", remotePath, this.control.providerId);
    const factLine = response.lines.map((line) => line.trim()).find(isFtpFactLine);
    if (factLine === void 0) {
      throw createProtocolError(
        "MLST",
        `${this.control.providerId.toUpperCase()} MLST response did not include a fact line`,
        response,
        this.control.providerId
      );
    }
    const entry = parseMlsdLine(factLine, getParentPath2(remotePath) ?? "/");
    return {
      ...entry,
      exists: true,
      name: basenameRemotePath(remotePath),
      path: remotePath
    };
  }
  async remove(path2, options = {}) {
    const remotePath = normalizeFtpPath(path2);
    const response = await this.control.sendCommand(`DELE ${remotePath}`);
    if (response.completion) return;
    if (response.code === 550 && options.ignoreMissing) return;
    assertPathCommandSucceeded(response, "DELE", remotePath, this.control.providerId);
  }
  async rename(from, to) {
    const fromPath = normalizeFtpPath(from);
    const toPath = normalizeFtpPath(to);
    const rnfr = await this.control.sendCommand(`RNFR ${fromPath}`);
    if (!rnfr.intermediate && !rnfr.completion) {
      assertPathCommandSucceeded(rnfr, "RNFR", fromPath, this.control.providerId);
    }
    await expectCompletion(this.control, `RNTO ${toPath}`, toPath);
  }
  async mkdir(path2, options = {}) {
    const remotePath = normalizeFtpPath(path2);
    if (!options.recursive) {
      await expectCompletion(this.control, `MKD ${remotePath}`, remotePath);
      return;
    }
    const segments = remotePath.split("/").filter((s) => s.length > 0);
    let current = "";
    for (const segment of segments) {
      current = `${current}/${segment}`;
      const response = await this.control.sendCommand(`MKD ${current}`);
      if (response.completion) continue;
      if (response.code === 550) continue;
      assertPathCommandSucceeded(response, "MKD", current, this.control.providerId);
    }
  }
  async rmdir(path2, options = {}) {
    const remotePath = normalizeFtpPath(path2);
    if (options.recursive) {
      await this.removeDirectoryRecursive(remotePath);
      return;
    }
    const response = await this.control.sendCommand(`RMD ${remotePath}`);
    if (response.completion) return;
    if (response.code === 550 && options.ignoreMissing) return;
    assertPathCommandSucceeded(response, "RMD", remotePath, this.control.providerId);
  }
  async removeDirectoryRecursive(remotePath) {
    let entries;
    try {
      entries = await readDirectoryEntries(this.control, remotePath);
    } catch (error) {
      if (error instanceof PathNotFoundError) return;
      throw error;
    }
    for (const entry of entries) {
      if (entry.name === "." || entry.name === "..") continue;
      const childPath = entry.path.startsWith("/") ? entry.path : normalizeFtpPath(`${remotePath.replace(/\/+$/, "")}/${entry.name}`);
      if (entry.type === "directory") {
        await this.removeDirectoryRecursive(childPath);
      } else {
        const del = await this.control.sendCommand(`DELE ${childPath}`);
        if (!del.completion && del.code !== 550) {
          assertPathCommandSucceeded(del, "DELE", childPath, this.control.providerId);
        }
      }
    }
    const response = await this.control.sendCommand(`RMD ${remotePath}`);
    if (response.completion) return;
    if (response.code === 550) return;
    assertPathCommandSucceeded(response, "RMD", remotePath, this.control.providerId);
  }
};
var FtpControlConnection = class _FtpControlConnection {
  /**
   * Creates a control connection around an already-open socket.
   *
   * @param socket - Plain TCP or TLS socket connected to the server.
   * @param host - Host used for diagnostics and passive endpoint defaults.
   * @param passiveHostStrategy - Host selection strategy for PASV data endpoints.
   * @param providerId - Provider id used for errors and sessions.
   * @param timeoutMs - Optional timeout applied to control reads.
   * @param security - Optional FTPS settings, omitted for plain FTP.
   */
  constructor(socket, host, passiveHostStrategy, providerId, timeoutMs, security) {
    this.host = host;
    this.passiveHostStrategy = passiveHostStrategy;
    this.providerId = providerId;
    this.timeoutMs = timeoutMs;
    this.security = security;
    this.socket = socket;
    this.attachSocket(socket);
  }
  host;
  passiveHostStrategy;
  providerId;
  timeoutMs;
  security;
  parser = new FtpResponseParser();
  responses = [];
  waiters = [];
  closedError;
  socket;
  handleSocketData = (chunk) => this.handleData(chunk);
  handleSocketError = (error) => {
    this.failPending(createConnectionError(this.host, error, this.providerId));
  };
  handleSocketClose = () => {
    this.failPending(
      new ConnectionError({
        host: this.host,
        message: `${this.providerId.toUpperCase()} control connection closed`,
        protocol: this.providerId,
        retryable: true
      })
    );
  };
  /** Host used for EPSV passive data connections. */
  get passiveHost() {
    return this.host;
  }
  /** Host selection strategy used for PASV data endpoints. */
  get passiveEndpointHostStrategy() {
    return this.passiveHostStrategy;
  }
  /** Timeout inherited by command waits and passive data operations. */
  get operationTimeoutMs() {
    return this.timeoutMs;
  }
  /** FTPS security settings for encrypted passive data sockets. */
  get dataTlsSecurity() {
    return this.security?.dataProtection === "private" ? this.security : void 0;
  }
  /**
   * Opens a new control connection, reads the greeting, and negotiates FTPS when configured.
   *
   * @param options - Socket and provider connection options.
   * @returns Connected control connection ready for authentication.
   */
  static async connect(options) {
    const socket = createControlSocket(options);
    const control = new _FtpControlConnection(
      socket,
      options.host,
      options.passiveHostStrategy,
      options.providerId,
      options.timeoutMs,
      options.security
    );
    try {
      await waitForSocketConnect(
        socket,
        options,
        options.security?.mode === "implicit" ? "secureConnect" : "connect"
      );
      if (options.security?.mode === "implicit") {
        assertPinnedTlsCertificate(socket, options.security, options.host, options.providerId);
      }
      const greeting = await control.readFinalResponse({ operation: "greeting" });
      if (!greeting.completion) {
        throw createProtocolError(
          "greeting",
          `${options.providerId.toUpperCase()} server greeting was not successful`,
          greeting,
          options.providerId
        );
      }
      if (options.security?.mode === "explicit") {
        await negotiateExplicitFtps(control, options.security);
      } else if (options.security?.mode === "implicit") {
        await configureFtpsProtection(control, options.security);
      }
      return control;
    } catch (error) {
      control.close();
      throw error;
    }
  }
  /**
   * Writes one raw FTP command line to the control socket.
   *
   * @param command - Command text without CRLF.
   */
  writeCommand(command) {
    this.socket.write(`${command}\r
`);
  }
  /**
   * Sends a command and waits for the final non-preliminary response.
   *
   * @param command - Command text without CRLF.
   * @returns Final FTP response for the command.
   */
  async sendCommand(command) {
    this.writeCommand(command);
    return this.readFinalResponse({ command, operation: "command response" });
  }
  /**
   * Reads responses until a final response is reached.
   *
   * @param context - Timeout diagnostic context for the wait.
   * @returns Final FTP response, skipping any preliminary 1xx replies.
   */
  async readFinalResponse(context = { operation: "response" }) {
    let response = await this.readResponse(context);
    while (response.preliminary) {
      response = await this.readResponse(context);
    }
    return response;
  }
  /**
   * Reads the next parsed control-channel response.
   *
   * @param context - Timeout diagnostic context for the wait.
   * @returns Next parsed response from the control channel.
   */
  readResponse(context = { operation: "response" }) {
    const response = this.responses.shift();
    if (response !== void 0) {
      return Promise.resolve(response);
    }
    if (this.closedError !== void 0) {
      return Promise.reject(this.closedError);
    }
    return new Promise((resolve, reject) => {
      let timeout;
      const clearWaiterTimeout = () => {
        if (timeout !== void 0) {
          clearTimeout(timeout);
        }
      };
      const waiter = {
        reject(error) {
          clearWaiterTimeout();
          reject(error);
        },
        resolve(response2) {
          clearWaiterTimeout();
          resolve(response2);
        }
      };
      this.waiters.push(waiter);
      const timeoutMs = this.timeoutMs;
      if (timeoutMs !== void 0) {
        timeout = setTimeout(() => {
          const error = createFtpTimeoutError({
            ...context,
            host: this.host,
            providerId: this.providerId,
            timeoutMs
          });
          this.failPending(error);
          this.close();
        }, timeoutMs);
      }
    });
  }
  /** Closes the current control socket. */
  close() {
    if (!this.socket.destroyed) {
      this.socket.end();
      this.socket.destroy();
    }
  }
  /**
   * Upgrades an explicit-FTPS control connection from plain TCP to TLS.
   *
   * @param security - Resolved FTPS security settings and TLS options.
   */
  async upgradeToTls(security) {
    const plainSocket = this.socket;
    this.detachSocket(plainSocket);
    const tlsSocket = connectTls({ ...security.tlsOptions, socket: plainSocket });
    this.socket = tlsSocket;
    this.attachSocket(tlsSocket);
    const connectOptions = {
      host: this.host,
      passiveHostStrategy: this.passiveHostStrategy,
      port: 0,
      providerId: this.providerId
    };
    if (this.timeoutMs !== void 0) {
      connectOptions.timeoutMs = this.timeoutMs;
    }
    await waitForSocketConnect(tlsSocket, connectOptions, "secureConnect", "TLS negotiation");
    assertPinnedTlsCertificate(tlsSocket, security, this.host, this.providerId);
  }
  /**
   * Attaches shared parser and failure handlers to the active control socket.
   *
   * @param socket - Socket that should feed control-channel responses.
   */
  attachSocket(socket) {
    socket.on("data", this.handleSocketData);
    socket.on("error", this.handleSocketError);
    socket.on("close", this.handleSocketClose);
  }
  /**
   * Detaches shared parser and failure handlers before replacing a control socket.
   *
   * @param socket - Socket being removed from the control connection.
   */
  detachSocket(socket) {
    socket.off("data", this.handleSocketData);
    socket.off("error", this.handleSocketError);
    socket.off("close", this.handleSocketClose);
  }
  /**
   * Parses inbound control-channel bytes into queued responses.
   *
   * @param chunk - Socket data chunk from the control channel.
   */
  handleData(chunk) {
    try {
      for (const response of this.parser.push(chunk)) {
        this.enqueueResponse(response);
      }
    } catch (error) {
      this.failPending(
        error instanceof Error ? error : createConnectionError(this.host, error, this.providerId)
      );
    }
  }
  /**
   * Delivers a parsed response to a waiter or queues it for the next read.
   *
   * @param response - Parsed FTP response.
   */
  enqueueResponse(response) {
    const waiter = this.waiters.shift();
    if (waiter === void 0) {
      this.responses.push(response);
      return;
    }
    waiter.resolve(response);
  }
  /**
   * Fails outstanding waits and records the first terminal connection error.
   *
   * @param error - Error that closed or invalidated the control connection.
   */
  failPending(error) {
    if (this.closedError !== void 0) {
      return;
    }
    this.closedError = error;
    for (const waiter of this.waiters.splice(0)) {
      waiter.reject(error);
    }
  }
};
async function expectCompletion(control, command, path2) {
  const response = await control.sendCommand(command);
  assertPathCommandSucceeded(response, command, path2, control.providerId);
}
async function readPassiveDataCommand(control, command, path2, options = {}) {
  const dataConnection = await openPassiveDataCommand(control, command, path2, options);
  try {
    const payload = await collectPassiveData(
      dataConnection,
      control.operationTimeoutMs,
      path2,
      control.providerId
    );
    const finalResponse = await control.readFinalResponse({
      command,
      operation: "data command completion",
      path: path2
    });
    assertPathCommandSucceeded(finalResponse, command, path2, control.providerId);
    return payload;
  } catch (error) {
    dataConnection.close();
    throw error;
  }
}
async function readDirectoryEntries(control, path2) {
  try {
    const payload2 = await readPassiveDataCommand(control, `MLSD ${path2}`, path2);
    return parseMlsdList(payload2.toString("utf8"), path2);
  } catch (error) {
    if (!isUnsupportedFtpCommandError(error, "MLSD")) {
      throw error;
    }
  }
  const payload = await readPassiveDataCommand(control, `LIST ${path2}`, path2);
  return parseUnixList(payload.toString("utf8"), path2);
}
async function openPassiveDataCommand(control, command, path2, options = {}) {
  const offset = normalizeOptionalByteCount3(options.offset, "offset", path2);
  if (offset !== void 0 && offset > 0) {
    await sendRestartOffset(control, offset, path2);
  }
  const passiveEndpoint = await openPassiveEndpoint(control, path2);
  const dataConnection = openPassiveDataConnection(
    passiveEndpoint,
    control.operationTimeoutMs,
    path2,
    control
  );
  try {
    await dataConnection.ready;
    control.writeCommand(command);
    const initialResponse = await control.readResponse({
      command,
      operation: "data command response",
      path: path2
    });
    if (!initialResponse.preliminary) {
      dataConnection.close();
      assertPathCommandSucceeded(initialResponse, command, path2, control.providerId);
      throw createProtocolError(
        command,
        `${control.providerId.toUpperCase()} data command did not open a data transfer`,
        initialResponse,
        control.providerId
      );
    }
    return dataConnection;
  } catch (error) {
    dataConnection.close();
    throw error;
  }
}
async function openPassiveEndpoint(control, path2) {
  const extendedPassiveResponse = await control.sendCommand("EPSV");
  if (extendedPassiveResponse.completion) {
    return parseExtendedPassiveEndpoint(
      extendedPassiveResponse,
      control.passiveHost,
      control.providerId
    );
  }
  if (!isExtendedPassiveUnsupported(extendedPassiveResponse)) {
    assertPathCommandSucceeded(extendedPassiveResponse, "EPSV", path2, control.providerId);
  }
  const passiveResponse = await control.sendCommand("PASV");
  assertPathCommandSucceeded(passiveResponse, "PASV", path2, control.providerId);
  return parsePassiveEndpoint(
    passiveResponse,
    control.passiveHost,
    control.passiveEndpointHostStrategy,
    control.providerId
  );
}
async function writePassiveDataCommand(control, command, path2, request, options = {}) {
  const dataConnection = await openPassiveDataCommand(control, command, path2, options);
  let bytesTransferred = 0;
  const timeoutContext = {
    host: dataConnection.endpoint.host,
    operation: "passive data transfer",
    path: path2,
    providerId: control.providerId
  };
  try {
    for await (const chunk of request.content) {
      request.throwIfAborted();
      const output = new Uint8Array(chunk);
      await writeSocketChunk(
        dataConnection.socket,
        output,
        control.operationTimeoutMs,
        timeoutContext
      );
      bytesTransferred += output.byteLength;
      request.reportProgress(bytesTransferred, request.totalBytes);
    }
    await endSocket(dataConnection.socket, control.operationTimeoutMs, timeoutContext);
    const finalResponse = await control.readFinalResponse({
      command,
      operation: "data command completion",
      path: path2
    });
    assertPathCommandSucceeded(finalResponse, command, path2, control.providerId);
    return bytesTransferred;
  } catch (error) {
    dataConnection.close();
    throw error;
  }
}
async function sendRestartOffset(control, offset, path2) {
  const response = await control.sendCommand(`REST ${offset}`);
  if (response.completion || response.intermediate) {
    return;
  }
  assertPathCommandSucceeded(response, "REST", path2, control.providerId);
}
function openPassiveDataConnection(endpoint, timeoutMs, path2, control) {
  const dataSecurity = control.dataTlsSecurity;
  const socket = dataSecurity === void 0 ? createConnection({ host: endpoint.host, port: endpoint.port }) : connectTls({ ...dataSecurity.tlsOptions, host: endpoint.host, port: endpoint.port });
  socket.on("error", () => void 0);
  const ready = new Promise((resolve, reject) => {
    let settled = false;
    let timeout;
    const readyEvent = dataSecurity === void 0 ? "connect" : "secureConnect";
    const cleanup = () => {
      socket.off(readyEvent, handleConnect);
      socket.off("error", handleError);
      if (timeout !== void 0) {
        clearTimeout(timeout);
      }
    };
    const rejectOnce = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      socket.destroy();
      reject(error);
    };
    const handleConnect = () => {
      if (settled) {
        return;
      }
      try {
        if (dataSecurity !== void 0) {
          assertPinnedTlsCertificate(socket, dataSecurity, endpoint.host, control.providerId);
        }
        settled = true;
        cleanup();
        resolve();
      } catch (error) {
        rejectOnce(
          error instanceof Error ? error : createConnectionError(endpoint.host, error, control.providerId)
        );
      }
    };
    const handleError = (error) => {
      rejectOnce(
        error instanceof TimeoutError ? error : createConnectionError(endpoint.host, error, control.providerId)
      );
    };
    socket.once(readyEvent, handleConnect);
    socket.once("error", handleError);
    if (timeoutMs !== void 0) {
      timeout = setTimeout(
        () => rejectOnce(
          createFtpTimeoutError({
            host: endpoint.host,
            operation: "passive data connection",
            path: path2,
            providerId: control.providerId,
            timeoutMs
          })
        ),
        timeoutMs
      );
    }
  });
  return {
    endpoint,
    ready,
    socket,
    close() {
      socket.destroy();
    }
  };
}
async function collectPassiveData(dataConnection, timeoutMs, path2, providerId) {
  const chunks = [];
  const clearIdleTimeout = setSocketTimeout(dataConnection.socket, timeoutMs, {
    host: dataConnection.endpoint.host,
    operation: "passive data transfer",
    path: path2,
    providerId
  });
  try {
    for await (const chunk of dataConnection.socket) {
      chunks.push(Buffer6.from(chunk));
    }
  } finally {
    clearIdleTimeout();
  }
  return Buffer6.concat(chunks);
}
async function* createPassiveReadSource(control, dataConnection, command, path2, range, request) {
  let bytesEmitted = 0;
  let completed = false;
  let clearIdleTimeout = () => void 0;
  const closeOnAbort = () => dataConnection.close();
  request.signal?.addEventListener("abort", closeOnAbort, { once: true });
  try {
    clearIdleTimeout = setSocketTimeout(dataConnection.socket, control.operationTimeoutMs, {
      host: dataConnection.endpoint.host,
      operation: "passive data transfer",
      path: path2,
      providerId: control.providerId
    });
    for await (const chunk of dataConnection.socket) {
      request.throwIfAborted();
      const buffer = Buffer6.from(chunk);
      if (range.length === void 0) {
        bytesEmitted += buffer.byteLength;
        yield new Uint8Array(buffer);
        continue;
      }
      const remaining = range.length - bytesEmitted;
      if (remaining <= 0) {
        continue;
      }
      const output = buffer.subarray(0, Math.min(remaining, buffer.byteLength));
      bytesEmitted += output.byteLength;
      if (output.byteLength > 0) {
        yield new Uint8Array(output);
      }
    }
    const finalResponse = await control.readFinalResponse({
      command,
      operation: "data command completion",
      path: path2
    });
    assertPathCommandSucceeded(finalResponse, command, path2, control.providerId);
    completed = true;
  } finally {
    clearIdleTimeout();
    request.signal?.removeEventListener("abort", closeOnAbort);
    if (!completed) {
      dataConnection.close();
    }
  }
}
function writeSocketChunk(socket, chunk, timeoutMs, context) {
  if (chunk.byteLength === 0) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const clearIdleTimeout = setSocketTimeout(socket, timeoutMs, context);
    const handleError = (error) => {
      clearIdleTimeout();
      socket.off("error", handleError);
      reject(error);
    };
    socket.once("error", handleError);
    socket.write(chunk, (error) => {
      clearIdleTimeout();
      socket.off("error", handleError);
      if (error != null) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
function endSocket(socket, timeoutMs, context) {
  return new Promise((resolve, reject) => {
    const clearIdleTimeout = setSocketTimeout(socket, timeoutMs, context);
    const handleError = (error) => {
      clearIdleTimeout();
      socket.off("error", handleError);
      reject(error);
    };
    socket.once("error", handleError);
    socket.end(() => {
      clearIdleTimeout();
      socket.off("error", handleError);
      resolve();
    });
  });
}
function resolveReadRange2(range) {
  if (range === void 0) {
    return { offset: 0 };
  }
  const resolved = {
    offset: normalizeByteCount3(range.offset, "offset", "/")
  };
  if (range.length !== void 0) {
    resolved.length = normalizeByteCount3(range.length, "length", "/");
  }
  return resolved;
}
function normalizeOptionalByteCount3(value, field, path2) {
  return value === void 0 ? void 0 : normalizeByteCount3(value, field, path2);
}
function normalizeByteCount3(value, field, path2) {
  if (!Number.isFinite(value) || value < 0) {
    throw new ConfigurationError({
      details: { field, provider: FTP_PROVIDER_ID },
      message: `FTP provider ${field} must be a non-negative number`,
      path: path2,
      protocol: FTP_PROVIDER_ID,
      retryable: false
    });
  }
  return Math.floor(value);
}
function cloneVerification4(verification) {
  const clone = { verified: verification.verified };
  if (verification.method !== void 0) clone.method = verification.method;
  if (verification.checksum !== void 0) clone.checksum = verification.checksum;
  if (verification.expectedChecksum !== void 0) {
    clone.expectedChecksum = verification.expectedChecksum;
  }
  if (verification.actualChecksum !== void 0) clone.actualChecksum = verification.actualChecksum;
  if (verification.details !== void 0) clone.details = { ...verification.details };
  return clone;
}
function parsePassiveEndpoint(response, controlHost, hostStrategy, providerId) {
  const endpointMatch = /(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)/.exec(response.message);
  if (endpointMatch === null) {
    throw createProtocolError(
      "PASV",
      `${providerId.toUpperCase()} PASV response did not include a host and port`,
      response,
      providerId
    );
  }
  const [, first2, second, third, fourth, highByte, lowByte] = endpointMatch;
  const parts = [first2, second, third, fourth, highByte, lowByte].map((part) => Number(part));
  if (parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    throw createProtocolError(
      "PASV",
      `${providerId.toUpperCase()} PASV response included an invalid host or port`,
      response,
      providerId
    );
  }
  const advertisedHost = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3]}`;
  return {
    host: hostStrategy === "advertised" ? advertisedHost : controlHost,
    port: parts[4] * 256 + parts[5]
  };
}
function parseExtendedPassiveEndpoint(response, host, providerId) {
  const endpointMatch = /\((.+)\)/.exec(response.message);
  if (endpointMatch === null) {
    throw createProtocolError(
      "EPSV",
      `${providerId.toUpperCase()} EPSV response did not include a port`,
      response,
      providerId
    );
  }
  const endpointText = endpointMatch[1] ?? "";
  const delimiter = endpointText[0];
  if (delimiter === void 0) {
    throw createProtocolError(
      "EPSV",
      `${providerId.toUpperCase()} EPSV response did not include a delimiter`,
      response,
      providerId
    );
  }
  const parts = endpointText.split(delimiter);
  const port = Number(parts[3]);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw createProtocolError(
      "EPSV",
      `${providerId.toUpperCase()} EPSV response included an invalid port`,
      response,
      providerId
    );
  }
  return { host, port };
}
function isExtendedPassiveUnsupported(response) {
  return response.code === 500 || response.code === 501 || response.code === 502 || response.code === 504 || response.code === 522;
}
function isUnsupportedFtpCommandError(error, commandName) {
  return error instanceof ProtocolError && error.command?.startsWith(commandName) === true && isUnsupportedFtpCommandCode(error.ftpCode);
}
function isUnsupportedFtpCommandCode(code) {
  return code === 500 || code === 501 || code === 502 || code === 504;
}
function createControlSocket(options) {
  if (options.security?.mode === "implicit") {
    return connectTls({
      ...options.security.tlsOptions,
      host: options.host,
      port: options.port
    });
  }
  return createConnection({ host: options.host, port: options.port });
}
async function negotiateExplicitFtps(control, security) {
  const authResponse = await control.sendCommand("AUTH TLS");
  if (!authResponse.completion) {
    throw createProtocolError(
      "AUTH TLS",
      "FTPS AUTH TLS negotiation failed",
      authResponse,
      control.providerId
    );
  }
  await control.upgradeToTls(security);
  await configureFtpsProtection(control, security);
}
async function configureFtpsProtection(control, security) {
  await expectCompletion(control, "PBSZ 0", "/");
  await expectCompletion(control, security.dataProtection === "private" ? "PROT P" : "PROT C", "/");
}
function createTlsConnectionOptions(profile) {
  const tlsProfile = profile.tls;
  const options = {
    rejectUnauthorized: tlsProfile?.rejectUnauthorized ?? true
  };
  const servername = tlsProfile?.servername ?? (isIP(profile.host) === 0 ? profile.host : void 0);
  if (servername !== void 0) {
    options.servername = servername;
  }
  if (tlsProfile === void 0) {
    return options;
  }
  if (tlsProfile.ca !== void 0) options.ca = normalizeTlsSecretValue(tlsProfile.ca);
  if (tlsProfile.cert !== void 0) options.cert = normalizeTlsSecretValue(tlsProfile.cert);
  if (tlsProfile.key !== void 0) options.key = normalizeTlsSecretValue(tlsProfile.key);
  if (tlsProfile.pfx !== void 0) options.pfx = normalizeTlsSecretValue(tlsProfile.pfx);
  if (tlsProfile.passphrase !== void 0)
    options.passphrase = secretToString(tlsProfile.passphrase);
  if (tlsProfile.minVersion !== void 0) options.minVersion = tlsProfile.minVersion;
  if (tlsProfile.maxVersion !== void 0) options.maxVersion = tlsProfile.maxVersion;
  if (tlsProfile.checkServerIdentity !== void 0) {
    options.checkServerIdentity = tlsProfile.checkServerIdentity;
  }
  return options;
}
function createTlsPinnedFingerprints(profile) {
  const pinnedFingerprint256 = profile.tls?.pinnedFingerprint256;
  if (pinnedFingerprint256 === void 0) {
    return void 0;
  }
  const fingerprints = Array.isArray(pinnedFingerprint256) ? pinnedFingerprint256 : [pinnedFingerprint256];
  if (fingerprints.length === 0) {
    throw new ConfigurationError({
      details: { pinnedFingerprint256 },
      message: "FTPS tls.pinnedFingerprint256 must include at least one SHA-256 fingerprint",
      protocol: FTPS_PROVIDER_ID,
      retryable: false
    });
  }
  return fingerprints.map(normalizePinnedFingerprint256);
}
function normalizePinnedFingerprint256(fingerprint) {
  const normalized = fingerprint.trim().replace(/:/g, "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new ConfigurationError({
      details: { pinnedFingerprint256: fingerprint },
      message: "FTPS tls.pinnedFingerprint256 must be a SHA-256 hex fingerprint",
      protocol: FTPS_PROVIDER_ID,
      retryable: false
    });
  }
  return normalized;
}
function assertPinnedTlsCertificate(socket, security, host, providerId) {
  const pinnedFingerprint256 = security.pinnedFingerprint256;
  if (pinnedFingerprint256 === void 0) {
    return;
  }
  if (!isTlsSocket(socket)) {
    throw createConnectionError(
      host,
      new Error("FTPS certificate pinning requires a TLS socket"),
      providerId
    );
  }
  const certificate = socket.getPeerCertificate();
  const actualFingerprint = normalizeCertificateFingerprint256(certificate);
  if (pinnedFingerprint256.includes(actualFingerprint)) {
    return;
  }
  throw createConnectionError(
    host,
    new Error("FTPS server certificate SHA-256 fingerprint did not match tls.pinnedFingerprint256"),
    providerId
  );
}
function isTlsSocket(socket) {
  return typeof socket.getPeerCertificate === "function";
}
function normalizeCertificateFingerprint256(certificate) {
  return certificate.fingerprint256.replace(/:/g, "").toLowerCase();
}
function normalizeTlsSecretValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => Buffer6.isBuffer(item) ? Buffer6.from(item) : item);
  }
  return Buffer6.isBuffer(value) ? Buffer6.from(value) : value;
}
async function authenticateFtpSession(control, username, password, host) {
  const safeUsername = assertSafeFtpArgument(username, "username");
  const safePassword = assertSafeFtpArgument(password, "password");
  const userResponse = await control.sendCommand(`USER ${safeUsername}`);
  if (userResponse.completion) {
    return;
  }
  if (!userResponse.intermediate) {
    throw createAuthenticationError(host, "USER", userResponse, control.providerId);
  }
  const passwordResponse = await control.sendCommand(`PASS ${safePassword}`);
  if (!passwordResponse.completion) {
    throw createAuthenticationError(host, "PASS", passwordResponse, control.providerId);
  }
}
function assertPathCommandSucceeded(response, command, path2, providerId) {
  if (response.completion) {
    return;
  }
  if (response.code === 550) {
    throw new PathNotFoundError({
      command,
      ftpCode: response.code,
      message: `${providerId.toUpperCase()} path not found: ${path2}`,
      path: path2,
      protocol: providerId,
      retryable: false
    });
  }
  throw createProtocolError(
    command,
    `${providerId.toUpperCase()} command failed: ${command}`,
    response,
    providerId
  );
}
function waitForSocketConnect(socket, options, readyEvent = "connect", operation = "connection") {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timeout;
    const cleanup = () => {
      socket.off("connect", handleConnect);
      socket.off(readyEvent, handleConnect);
      socket.off("error", handleError);
      options.signal?.removeEventListener("abort", handleAbort);
      if (timeout !== void 0) {
        clearTimeout(timeout);
      }
    };
    const rejectOnce = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      socket.destroy();
      reject(error);
    };
    const handleConnect = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    };
    const handleError = (error) => rejectOnce(createConnectionError(options.host, error, options.providerId));
    const handleAbort = () => rejectOnce(
      new AbortError({
        details: { operation },
        host: options.host,
        message: `${options.providerId.toUpperCase()} ${operation} aborted`,
        protocol: options.providerId,
        retryable: false
      })
    );
    socket.once(readyEvent, handleConnect);
    socket.once("error", handleError);
    if (options.signal?.aborted === true) {
      handleAbort();
      return;
    }
    options.signal?.addEventListener("abort", handleAbort, { once: true });
    const timeoutMs = options.timeoutMs;
    if (timeoutMs !== void 0) {
      timeout = setTimeout(
        () => rejectOnce(
          createFtpTimeoutError({
            host: options.host,
            operation,
            providerId: options.providerId,
            timeoutMs
          })
        ),
        timeoutMs
      );
    }
  });
}
function createFtpTimeoutError(input) {
  const details = {
    operation: input.operation,
    timeoutMs: input.timeoutMs
  };
  return new TimeoutError({
    details,
    host: input.host,
    message: `${input.providerId.toUpperCase()} ${input.operation} timed out after ${input.timeoutMs}ms`,
    protocol: input.providerId,
    retryable: true,
    ...input.command === void 0 ? {} : { command: input.command },
    ...input.path === void 0 ? {} : { path: input.path }
  });
}
function setSocketTimeout(socket, timeoutMs, context) {
  if (timeoutMs === void 0) {
    return () => void 0;
  }
  const handleTimeout = () => {
    socket.destroy(createFtpTimeoutError({ ...context, timeoutMs }));
  };
  socket.setTimeout(timeoutMs);
  socket.once("timeout", handleTimeout);
  return () => {
    socket.off("timeout", handleTimeout);
    socket.setTimeout(0);
  };
}
function createAuthenticationError(host, command, response, providerId) {
  return new AuthenticationError({
    command,
    ftpCode: response.code,
    host,
    message: `${providerId.toUpperCase()} authentication failed during ${command}`,
    protocol: providerId,
    retryable: false
  });
}
function createConnectionError(host, cause, providerId) {
  return new ConnectionError({
    cause,
    host,
    message: `${providerId.toUpperCase()} connection failed`,
    protocol: providerId,
    retryable: true
  });
}
function createProtocolError(command, message, response, providerId) {
  return new ProtocolError({
    command,
    ftpCode: response.code,
    message,
    protocol: providerId,
    retryable: response.transientFailure
  });
}
function normalizeFtpPath(path2) {
  const normalized = normalizeRemotePath(path2);
  if (normalized === "." || normalized === "/") {
    return "/";
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
function getParentPath2(path2) {
  if (path2 === "/") {
    return void 0;
  }
  const parentEnd = path2.lastIndexOf("/");
  return parentEnd <= 0 ? "/" : path2.slice(0, parentEnd);
}
function isFtpFactLine(line) {
  return line.includes(";") && line.includes(" ");
}
function compareEntries5(left, right) {
  return left.path.localeCompare(right.path);
}
function secretToString(value) {
  return Buffer6.isBuffer(value) ? value.toString("utf8") : value;
}

// src/providers/classic/ftp/FtpFeatureParser.ts
function parseFtpFeatures(input) {
  const lines = normalizeFeatureLines(input);
  const raw = [];
  const names = /* @__PURE__ */ new Set();
  const mlstFacts = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || /^\d{3}/.test(trimmed) || trimmed.toLowerCase() === "end") {
      continue;
    }
    raw.push(trimmed);
    const [featureName = ""] = trimmed.split(/\s+/, 1);
    const normalizedName = featureName.toUpperCase();
    names.add(normalizedName);
    if (normalizedName === "MLST") {
      const factText = trimmed.slice(featureName.length).trim();
      mlstFacts.push(
        ...factText.split(";").map((fact) => fact.trim()).filter(Boolean)
      );
    }
  }
  return {
    raw,
    names,
    mlstFacts,
    supports(featureName) {
      return names.has(featureName.toUpperCase());
    }
  };
}
function normalizeFeatureLines(input) {
  if (typeof input === "string") {
    return input.split(/\r?\n/);
  }
  if (Array.isArray(input)) {
    return input;
  }
  return input.lines;
}
export {
  AbortError,
  AuthenticationError,
  AuthorizationError,
  CLASSIC_PROVIDER_IDS,
  ConfigurationError,
  ConnectionError,
  FtpResponseParser,
  ParseError,
  PathAlreadyExistsError,
  PathNotFoundError,
  PermissionDeniedError,
  ProtocolError,
  ProviderRegistry,
  REDACTED,
  REMOTE_MANIFEST_FORMAT_VERSION,
  TimeoutError,
  TransferClient,
  TransferEngine,
  TransferError,
  TransferQueue,
  UnsupportedFeatureError,
  VerificationError,
  ZeroTransfer,
  ZeroTransferError,
  assertSafeFtpArgument,
  basenameRemotePath,
  buildRemoteBreadcrumbs,
  compareRemoteManifests,
  copyBetween,
  createAtomicDeployPlan,
  createBandwidthThrottle,
  createFtpProviderFactory,
  createLocalProviderFactory,
  createMemoryProviderFactory,
  createOAuthTokenSecretSource,
  createProgressEvent,
  createProviderTransferExecutor,
  createRemoteBrowser,
  createRemoteManifest,
  createSyncPlan,
  createTransferClient,
  createTransferJobsFromPlan,
  createTransferPlan,
  createTransferResult,
  diffRemoteTrees,
  downloadFile,
  emitLog,
  errorFromFtpReply,
  filterRemoteEntries,
  importFileZillaSites,
  importOpenSshConfig,
  importWinScpSessions,
  isClassicProviderId,
  isSensitiveKey,
  joinRemotePath,
  matchKnownHosts,
  matchKnownHostsEntry,
  noopLogger,
  normalizeRemotePath,
  parentRemotePath,
  parseFtpFeatures,
  parseFtpResponseLines,
  parseKnownHosts,
  parseMlsdLine,
  parseMlsdList,
  parseMlstTimestamp,
  parseOpenSshConfig,
  parseRemoteManifest,
  parseUnixList,
  parseUnixListLine,
  redactCommand,
  redactConnectionProfile,
  redactObject,
  redactSecretSource,
  redactValue,
  resolveConnectionProfileSecrets,
  resolveOpenSshHost,
  resolveProviderId,
  resolveSecret,
  runConnectionDiagnostics,
  serializeRemoteManifest,
  sortRemoteEntries,
  summarizeClientDiagnostics,
  summarizeTransferPlan,
  throttleByteIterable,
  uploadFile,
  validateConnectionProfile,
  walkRemoteTree
};
//# sourceMappingURL=index.mjs.map