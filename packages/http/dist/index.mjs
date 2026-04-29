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

// src/providers/web/HttpProvider.ts
import { Buffer as Buffer7 } from "buffer";

// src/providers/web/httpInternals.ts
import { Buffer as Buffer6 } from "buffer";
function buildBaseUrl(profile, options) {
  const protocol = options.secure ? "https:" : "http:";
  const portSegment = profile.port !== void 0 ? `:${profile.port}` : "";
  const path2 = options.basePath.length === 0 ? "/" : ensureLeadingSlash(options.basePath);
  try {
    return new URL(`${protocol}//${profile.host}${portSegment}${path2}`);
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      details: { host: profile.host, port: profile.port },
      message: "Invalid host or basePath for HTTP-family provider",
      retryable: false
    });
  }
}
function resolveUrl(baseUrl, remotePath) {
  const trimmedBase = baseUrl.pathname.replace(/\/+$/, "");
  const suffix = remotePath === "/" ? "" : remotePath;
  const merged = new URL(baseUrl.toString());
  merged.pathname = `${trimmedBase}${suffix}`;
  return merged;
}
function ensureLeadingSlash(value) {
  return value.startsWith("/") ? value : `/${value}`;
}
async function dispatchRequest(options, url, init) {
  const headers = { ...options.headers, ...init.headers ?? {} };
  const controller = new AbortController();
  const upstreamSignal = init.signal ?? null;
  if (upstreamSignal !== null) {
    if (upstreamSignal.aborted) controller.abort(upstreamSignal.reason);
    else upstreamSignal.addEventListener("abort", () => controller.abort(upstreamSignal.reason));
  }
  let timer;
  if (options.timeoutMs !== void 0 && options.timeoutMs > 0) {
    timer = setTimeout(
      () => controller.abort(new Error("HTTP request timed out")),
      options.timeoutMs
    );
  }
  try {
    return await options.fetch(url.toString(), {
      ...init,
      headers,
      signal: controller.signal
    });
  } catch (error) {
    if (controller.signal.aborted && upstreamSignal?.aborted !== true) {
      throw new TimeoutError({
        cause: error,
        details: { timeoutMs: options.timeoutMs, url: url.toString() },
        message: `HTTP request to ${url.toString()} timed out after ${String(options.timeoutMs)}ms`,
        retryable: true
      });
    }
    throw new ConnectionError({
      cause: error,
      details: { url: url.toString() },
      message: `HTTP request to ${url.toString()} failed`,
      retryable: true
    });
  } finally {
    if (timer !== void 0) clearTimeout(timer);
  }
}
function parseContentRangeTotal(value) {
  const match = /\/(\d+)\s*$/.exec(value);
  if (match === null) return void 0;
  const total = Number.parseInt(match[1] ?? "", 10);
  return Number.isFinite(total) ? total : void 0;
}
function parseTotalBytes(response, rangeOffset) {
  if (response.status === 206) {
    const contentRange = response.headers.get("content-range");
    if (contentRange !== null) {
      const total = parseContentRangeTotal(contentRange);
      if (total !== void 0) return total;
    }
  }
  const contentLength = response.headers.get("content-length");
  if (contentLength === null) return void 0;
  const length = Number.parseInt(contentLength, 10);
  if (!Number.isFinite(length) || length < 0) return void 0;
  return rangeOffset !== void 0 && rangeOffset > 0 ? length + rangeOffset : length;
}
function formatRangeHeader(offset, length) {
  if (length === void 0) return `bytes=${String(offset)}-`;
  const end = offset + length - 1;
  return `bytes=${String(offset)}-${String(end)}`;
}
function mapResponseError(response, path2) {
  const details = { path: path2, status: response.status, statusText: response.statusText };
  if (response.status === 401) {
    return new AuthenticationError({
      details,
      message: `HTTP authentication failed for ${path2} (${String(response.status)})`,
      retryable: false
    });
  }
  if (response.status === 403) {
    return new PermissionDeniedError({
      details,
      message: `HTTP access forbidden for ${path2} (${String(response.status)})`,
      retryable: false
    });
  }
  if (response.status === 404) {
    return new PathNotFoundError({
      details,
      message: `HTTP path not found: ${path2}`,
      retryable: false
    });
  }
  return new ConnectionError({
    details,
    message: `HTTP request for ${path2} failed with status ${String(response.status)}`,
    retryable: response.status >= 500
  });
}
async function* webStreamToAsyncIterable(body) {
  const reader = body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value !== void 0) yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
function secretToString(value) {
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array || Buffer6.isBuffer(value)) {
    return Buffer6.from(value).toString("utf8");
  }
  return String(value);
}

// src/providers/web/HttpProvider.ts
var HTTP_CHECKSUM_CAPABILITIES = ["etag"];
function createHttpProviderFactory(options = {}) {
  const id = options.id ?? "http";
  const secure = options.secure ?? id === "https";
  const basePath = options.basePath ?? "";
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new ConfigurationError({
      message: "Global fetch is unavailable; supply HttpProviderOptions.fetch explicitly",
      retryable: false
    });
  }
  const capabilities = {
    atomicRename: false,
    authentication: ["anonymous", "password", "token"],
    checksum: [...HTTP_CHECKSUM_CAPABILITIES],
    chmod: false,
    chown: false,
    list: false,
    maxConcurrency: 8,
    metadata: ["modifiedAt", "mimeType", "uniqueId"],
    notes: ["Read-only HTTP(S) provider. Uploads are not supported."],
    provider: id,
    readStream: true,
    resumeDownload: true,
    resumeUpload: false,
    serverSideCopy: false,
    serverSideMove: false,
    stat: true,
    symlink: false,
    writeStream: false
  };
  return {
    capabilities,
    create: () => new HttpProvider({
      basePath,
      capabilities,
      defaultHeaders: { ...options.defaultHeaders ?? {} },
      fetch: fetchImpl,
      id,
      secure
    }),
    id
  };
}
var HttpProvider = class {
  constructor(internals) {
    this.internals = internals;
    this.id = internals.id;
    this.capabilities = internals.capabilities;
  }
  internals;
  id;
  capabilities;
  async connect(profile) {
    const headers = { ...this.internals.defaultHeaders };
    if (profile.username !== void 0) {
      const username = await resolveSecret(profile.username);
      const password = profile.password !== void 0 ? await resolveSecret(profile.password) : "";
      const usernameText = secretToString(username);
      const passwordText = secretToString(password);
      headers["Authorization"] = `Basic ${Buffer7.from(`${usernameText}:${passwordText}`).toString("base64")}`;
    }
    const baseUrl = buildSessionBaseUrl(profile, this.internals);
    const sessionOptions = {
      baseUrl,
      capabilities: this.internals.capabilities,
      fetch: this.internals.fetch,
      headers,
      id: this.internals.id
    };
    if (profile.timeoutMs !== void 0) sessionOptions.timeoutMs = profile.timeoutMs;
    const session = new HttpTransferSession(sessionOptions);
    return session;
  }
};
var HttpTransferSession = class {
  constructor(options) {
    this.options = options;
    this.provider = options.id;
    this.capabilities = options.capabilities;
    this.fs = new HttpFileSystem(options);
    this.transfers = new HttpTransferOperations(options);
  }
  options;
  provider;
  capabilities;
  fs;
  transfers;
  disconnect() {
    return Promise.resolve();
  }
};
var HttpFileSystem = class {
  constructor(options) {
    this.options = options;
  }
  options;
  list() {
    return Promise.reject(
      new UnsupportedFeatureError({
        message: "HTTP provider does not support directory listing",
        retryable: false
      })
    );
  }
  async stat(path2) {
    const normalized = normalizeRemotePath(path2);
    const url = resolveUrl(this.options.baseUrl, normalized);
    const response = await dispatchRequest(this.options, url, {
      method: "HEAD"
    });
    if (!response.ok) {
      throw mapResponseError(response, normalized);
    }
    return responseToStat(response, normalized);
  }
};
var HttpTransferOperations = class {
  constructor(options) {
    this.options = options;
  }
  options;
  async read(request) {
    request.throwIfAborted();
    const normalized = normalizeRemotePath(request.endpoint.path);
    const url = resolveUrl(this.options.baseUrl, normalized);
    const headers = {};
    if (request.range !== void 0) {
      headers["Range"] = formatRangeHeader(request.range.offset, request.range.length);
    }
    const requestInit = {
      headers,
      method: "GET"
    };
    if (request.signal !== void 0) requestInit.signal = request.signal;
    const response = await dispatchRequest(this.options, url, requestInit);
    if (!response.ok && response.status !== 206) {
      throw mapResponseError(response, normalized);
    }
    const body = response.body;
    if (body === null) {
      throw new ConnectionError({
        message: `HTTP response had no body for ${url.toString()}`,
        retryable: true
      });
    }
    const result = {
      content: webStreamToAsyncIterable(body)
    };
    const totalBytes = parseTotalBytes(response, request.range?.offset);
    if (totalBytes !== void 0) result.totalBytes = totalBytes;
    if (request.range?.offset !== void 0 && request.range.offset > 0) {
      result.bytesRead = request.range.offset;
    }
    const etag = response.headers.get("etag");
    if (etag !== null) result.checksum = etag;
    return result;
  }
  write() {
    return Promise.reject(
      new UnsupportedFeatureError({
        message: "HTTP provider is read-only; uploads are not supported",
        retryable: false
      })
    );
  }
};
function buildSessionBaseUrl(profile, internals) {
  return buildBaseUrl(profile, { basePath: internals.basePath, secure: internals.secure });
}
function responseToStat(response, normalizedPath) {
  const stat = {
    exists: true,
    name: basenameRemotePath(normalizedPath),
    path: normalizedPath,
    type: "file"
  };
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null) {
    const size = Number.parseInt(contentLength, 10);
    if (Number.isFinite(size) && size >= 0) stat.size = size;
  }
  const lastModified = response.headers.get("last-modified");
  if (lastModified !== null) {
    const parsed = new Date(lastModified);
    if (!Number.isNaN(parsed.getTime())) stat.modifiedAt = parsed;
  }
  const etag = response.headers.get("etag");
  if (etag !== null) stat.uniqueId = etag;
  return stat;
}
export {
  AbortError,
  AuthenticationError,
  AuthorizationError,
  CLASSIC_PROVIDER_IDS,
  ConfigurationError,
  ConnectionError,
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
  createHttpProviderFactory,
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
  parseKnownHosts,
  parseOpenSshConfig,
  parseRemoteManifest,
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