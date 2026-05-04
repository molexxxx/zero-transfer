"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/entries/sftp.ts
var sftp_exports = {};
__export(sftp_exports, {
  AbortError: () => AbortError,
  AuthenticationError: () => AuthenticationError,
  AuthorizationError: () => AuthorizationError,
  CLASSIC_PROVIDER_IDS: () => CLASSIC_PROVIDER_IDS,
  ConfigurationError: () => ConfigurationError,
  ConnectionError: () => ConnectionError,
  ParseError: () => ParseError,
  PathAlreadyExistsError: () => PathAlreadyExistsError,
  PathNotFoundError: () => PathNotFoundError,
  PermissionDeniedError: () => PermissionDeniedError,
  ProtocolError: () => ProtocolError,
  ProviderRegistry: () => ProviderRegistry,
  REDACTED: () => REDACTED,
  REMOTE_MANIFEST_FORMAT_VERSION: () => REMOTE_MANIFEST_FORMAT_VERSION,
  TimeoutError: () => TimeoutError,
  TransferClient: () => TransferClient,
  TransferEngine: () => TransferEngine,
  TransferError: () => TransferError,
  TransferQueue: () => TransferQueue,
  UnsupportedFeatureError: () => UnsupportedFeatureError,
  VerificationError: () => VerificationError,
  ZeroTransfer: () => ZeroTransfer,
  ZeroTransferError: () => ZeroTransferError,
  assertSafeFtpArgument: () => assertSafeFtpArgument,
  basenameRemotePath: () => basenameRemotePath,
  buildRemoteBreadcrumbs: () => buildRemoteBreadcrumbs,
  compareRemoteManifests: () => compareRemoteManifests,
  copyBetween: () => copyBetween,
  createAtomicDeployPlan: () => createAtomicDeployPlan,
  createBandwidthThrottle: () => createBandwidthThrottle,
  createLocalProviderFactory: () => createLocalProviderFactory,
  createMemoryProviderFactory: () => createMemoryProviderFactory,
  createNativeSftpProviderFactory: () => createNativeSftpProviderFactory,
  createOAuthTokenSecretSource: () => createOAuthTokenSecretSource,
  createProgressEvent: () => createProgressEvent,
  createProviderTransferExecutor: () => createProviderTransferExecutor,
  createRemoteBrowser: () => createRemoteBrowser,
  createRemoteManifest: () => createRemoteManifest,
  createSftpJumpHostSocketFactory: () => createSftpJumpHostSocketFactory,
  createSftpProviderFactory: () => createSftpProviderFactory,
  createSyncPlan: () => createSyncPlan,
  createTransferClient: () => createTransferClient,
  createTransferJobsFromPlan: () => createTransferJobsFromPlan,
  createTransferPlan: () => createTransferPlan,
  createTransferResult: () => createTransferResult,
  diffRemoteTrees: () => diffRemoteTrees,
  downloadFile: () => downloadFile,
  emitLog: () => emitLog,
  errorFromFtpReply: () => errorFromFtpReply,
  filterRemoteEntries: () => filterRemoteEntries,
  importFileZillaSites: () => importFileZillaSites,
  importOpenSshConfig: () => importOpenSshConfig,
  importWinScpSessions: () => importWinScpSessions,
  isClassicProviderId: () => isClassicProviderId,
  isSensitiveKey: () => isSensitiveKey,
  joinRemotePath: () => joinRemotePath,
  matchKnownHosts: () => matchKnownHosts,
  matchKnownHostsEntry: () => matchKnownHostsEntry,
  noopLogger: () => noopLogger,
  normalizeRemotePath: () => normalizeRemotePath,
  parentRemotePath: () => parentRemotePath,
  parseKnownHosts: () => parseKnownHosts,
  parseOpenSshConfig: () => parseOpenSshConfig,
  parseRemoteManifest: () => parseRemoteManifest,
  redactCommand: () => redactCommand,
  redactConnectionProfile: () => redactConnectionProfile,
  redactObject: () => redactObject,
  redactSecretSource: () => redactSecretSource,
  redactValue: () => redactValue,
  resolveConnectionProfileSecrets: () => resolveConnectionProfileSecrets,
  resolveOpenSshHost: () => resolveOpenSshHost,
  resolveProviderId: () => resolveProviderId,
  resolveSecret: () => resolveSecret,
  runConnectionDiagnostics: () => runConnectionDiagnostics,
  serializeRemoteManifest: () => serializeRemoteManifest,
  sortRemoteEntries: () => sortRemoteEntries,
  summarizeClientDiagnostics: () => summarizeClientDiagnostics,
  summarizeTransferPlan: () => summarizeTransferPlan,
  throttleByteIterable: () => throttleByteIterable,
  uploadFile: () => uploadFile,
  validateConnectionProfile: () => validateConnectionProfile,
  walkRemoteTree: () => walkRemoteTree
});
module.exports = __toCommonJS(sftp_exports);

// src/client/ZeroTransfer.ts
var import_node_events = require("events");

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
var import_node_buffer = require("buffer");

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
    return import_node_buffer.Buffer.from(padded, "base64").byteLength === SHA256_DIGEST_BYTE_LENGTH;
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
    message: "Connection profile ssh.algorithms must use SSH-compatible non-empty algorithm lists",
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
var ZeroTransfer = class _ZeroTransfer extends import_node_events.EventEmitter {
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
var import_node_path = require("path");

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
  return (0, import_node_path.isAbsolute)(localPath) ? localPath : (0, import_node_path.resolve)(localPath);
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
var import_node_buffer2 = require("buffer");
var import_promises = require("fs/promises");
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
    return import_node_buffer2.Buffer.from(value, "base64");
  }
  if (isFileSecretSource(source)) {
    const fileReader = options.readFile ?? import_promises.readFile;
    const value = await fileReader(source.path);
    if (source.encoding === "buffer") {
      return import_node_buffer2.Buffer.from(value);
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
  return typeof value === "string" || import_node_buffer2.Buffer.isBuffer(value);
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
  return import_node_buffer2.Buffer.isBuffer(value) ? import_node_buffer2.Buffer.from(value) : value;
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
var import_node_fs = require("fs");
var import_promises2 = require("fs/promises");
var import_node_path2 = __toESM(require("path"));

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
      const rootPath = import_node_path2.default.resolve(this.configuredRootPath ?? profile.host);
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
      await (0, import_promises2.unlink)(localPath);
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
      await (0, import_promises2.rename)(fromLocal, toLocal);
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
    await (0, import_promises2.mkdir)(localPath, { recursive: options.recursive === true });
  }
  async rmdir(remote, options = {}) {
    const remotePath = normalizeLocalProviderPath(remote);
    const localPath = resolveLocalPath(this.rootPath, remotePath);
    try {
      await (0, import_promises2.rm)(localPath, { recursive: options.recursive === true, force: false });
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
  const stream = (0, import_node_fs.createReadStream)(localPath, {
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
    await (0, import_promises2.mkdir)(import_node_path2.default.dirname(localPath), { recursive: true });
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
}
async function writeLocalContent(localPath, remotePath, content, offset) {
  try {
    if (offset === void 0) {
      await (0, import_promises2.writeFile)(localPath, content);
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
    return await (0, import_promises2.open)(localPath, "r+");
  } catch (error) {
    if (getErrorCode(error) === "ENOENT") {
      return (0, import_promises2.open)(localPath, "w+");
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
    return await (0, import_promises2.readdir)(localPath);
  } catch (error) {
    throw mapLocalFileSystemError(error, remotePath);
  }
}
async function readLocalEntry(rootPath, remotePath) {
  const localPath = resolveLocalPath(rootPath, remotePath);
  let stats;
  try {
    stats = await (0, import_promises2.lstat)(localPath);
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
    return await (0, import_promises2.readlink)(localPath);
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
  const resolvedRootPath = import_node_path2.default.resolve(rootPath);
  const candidateAbsolute = import_node_path2.default.resolve(normalizedRemotePath.split("/").join(import_node_path2.default.sep));
  if (candidateAbsolute === resolvedRootPath || candidateAbsolute.startsWith(resolvedRootPath + import_node_path2.default.sep)) {
    return candidateAbsolute;
  }
  const relativePath = normalizedRemotePath === "/" ? "." : normalizedRemotePath.slice(1);
  const resolvedPath = import_node_path2.default.resolve(rootPath, relativePath.split("/").join(import_node_path2.default.sep));
  const relativeToRoot = import_node_path2.default.relative(rootPath, resolvedPath);
  if (relativeToRoot === "" || !relativeToRoot.startsWith("..") && !import_node_path2.default.isAbsolute(relativeToRoot)) {
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
var import_node_buffer3 = require("buffer");
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
  return typeof content === "string" ? import_node_buffer3.Buffer.from(content) : new Uint8Array(content);
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
var import_node_buffer4 = require("buffer");
var import_node_crypto = require("crypto");
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
  const saltBuffer = import_node_buffer4.Buffer.from(salt, "base64");
  if (saltBuffer.length === 0) return false;
  const candidates = port === DEFAULT_SSH_PORT ? [host] : [`[${host}]:${String(port)}`, host];
  for (const candidate of candidates) {
    const expected = (0, import_node_crypto.createHmac)("sha1", saltBuffer).update(candidate).digest("base64");
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
var import_node_buffer5 = require("buffer");
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
      password = import_node_buffer5.Buffer.from(rawPass, "base64").toString("utf8");
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

// src/providers/native/sftp/NativeSftpProvider.ts
var import_node_buffer20 = require("buffer");
var import_node_crypto9 = require("crypto");
var import_node_net = require("net");

// src/protocols/ssh/binary/SshDataWriter.ts
var import_node_buffer6 = require("buffer");
var MAX_UINT32 = 4294967295;
var MAX_UINT64 = (1n << 64n) - 1n;
var SshDataWriter = class {
  chunks = [];
  length = 0;
  writeByte(value) {
    this.assertByte(value, "byte");
    const chunk = import_node_buffer6.Buffer.allocUnsafe(1);
    chunk.writeUInt8(value, 0);
    return this.push(chunk);
  }
  writeBoolean(value) {
    return this.writeByte(value ? 1 : 0);
  }
  writeBytes(value) {
    return this.push(import_node_buffer6.Buffer.from(value));
  }
  writeUint32(value) {
    if (!Number.isInteger(value) || value < 0 || value > MAX_UINT32) {
      throw new ConfigurationError({
        details: { value },
        message: "SSH uint32 values must be integers in the range 0..2^32-1",
        retryable: false
      });
    }
    const chunk = import_node_buffer6.Buffer.allocUnsafe(4);
    chunk.writeUInt32BE(value, 0);
    return this.push(chunk);
  }
  writeUint64(value) {
    if (value < 0n || value > MAX_UINT64) {
      throw new ConfigurationError({
        details: { value: value.toString() },
        message: "SSH uint64 values must be in the range 0..2^64-1",
        retryable: false
      });
    }
    const chunk = import_node_buffer6.Buffer.allocUnsafe(8);
    chunk.writeBigUInt64BE(value, 0);
    return this.push(chunk);
  }
  writeString(value, encoding = "utf8") {
    const payload = typeof value === "string" ? import_node_buffer6.Buffer.from(value, encoding) : import_node_buffer6.Buffer.from(value);
    this.writeUint32(payload.length);
    return this.push(payload);
  }
  writeMpint(value) {
    const normalized = normalizePositiveMpint(value);
    this.writeUint32(normalized.length);
    return this.push(normalized);
  }
  writeNameList(values) {
    for (const name of values) {
      if (name.includes(",")) {
        throw new ConfigurationError({
          details: { name },
          message: "SSH name-list entries cannot contain commas",
          retryable: false
        });
      }
    }
    return this.writeString(values.join(","), "ascii");
  }
  toBuffer() {
    return import_node_buffer6.Buffer.concat(this.chunks, this.length);
  }
  push(chunk) {
    this.chunks.push(chunk);
    this.length += chunk.length;
    return this;
  }
  assertByte(value, label) {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new ConfigurationError({
        details: { value },
        message: `SSH ${label} values must be integers in the range 0..255`,
        retryable: false
      });
    }
  }
};
function normalizePositiveMpint(value) {
  const input = import_node_buffer6.Buffer.from(value);
  let offset = 0;
  while (offset < input.length && input[offset] === 0) {
    offset += 1;
  }
  if (offset >= input.length) {
    return import_node_buffer6.Buffer.alloc(0);
  }
  const stripped = input.subarray(offset);
  if ((stripped[0] & 128) === 128) {
    return import_node_buffer6.Buffer.concat([import_node_buffer6.Buffer.from([0]), stripped]);
  }
  return stripped;
}

// src/protocols/ssh/binary/SshDataReader.ts
var import_node_buffer7 = require("buffer");
var SshDataReader = class {
  constructor(source) {
    this.source = source;
  }
  source;
  offset = 0;
  get remaining() {
    return this.source.length - this.offset;
  }
  hasMore() {
    return this.remaining > 0;
  }
  readByte() {
    this.ensureAvailable(1, "byte");
    const value = this.source[this.offset];
    this.offset += 1;
    return value;
  }
  readBoolean() {
    return this.readByte() !== 0;
  }
  readBytes(length) {
    this.ensureAvailable(length, "bytes");
    const data = this.source.subarray(this.offset, this.offset + length);
    this.offset += length;
    return import_node_buffer7.Buffer.from(data);
  }
  readUint32() {
    this.ensureAvailable(4, "uint32");
    const buffer = import_node_buffer7.Buffer.from(this.source);
    const value = buffer.readUInt32BE(this.offset);
    this.offset += 4;
    return value;
  }
  readUint64() {
    this.ensureAvailable(8, "uint64");
    const buffer = import_node_buffer7.Buffer.from(this.source);
    const value = buffer.readBigUInt64BE(this.offset);
    this.offset += 8;
    return value;
  }
  readString() {
    const length = this.readUint32();
    this.ensureAvailable(length, "string");
    const data = this.source.subarray(this.offset, this.offset + length);
    this.offset += length;
    return import_node_buffer7.Buffer.from(data);
  }
  readUtf8String() {
    return this.readString().toString("utf8");
  }
  readNameList() {
    const value = this.readString().toString("ascii");
    if (value.length === 0) {
      return [];
    }
    return value.split(",").filter((item) => item.length > 0);
  }
  /**
   * Reads an SSH `mpint` value (RFC 4251 §5): a length-prefixed two's-complement
   * big-endian integer. Returns the raw magnitude bytes (non-negative integers
   * may have a leading 0x00 byte preserved by the caller as needed).
   */
  readMpint() {
    return this.readString();
  }
  assertFinished() {
    if (this.remaining !== 0) {
      throw new ParseError({
        details: { remaining: this.remaining },
        message: "Unexpected trailing SSH packet bytes",
        retryable: false
      });
    }
  }
  ensureAvailable(bytes, type) {
    if (this.remaining >= bytes) {
      return;
    }
    throw new ParseError({
      details: {
        available: this.remaining,
        needed: bytes
      },
      message: `Unexpected end of SSH packet while reading ${type}`,
      retryable: false
    });
  }
};

// src/protocols/ssh/auth/SshAuthMessages.ts
var SSH_MSG_SERVICE_REQUEST = 5;
var SSH_MSG_SERVICE_ACCEPT = 6;
var SSH_MSG_USERAUTH_REQUEST = 50;
var SSH_MSG_USERAUTH_FAILURE = 51;
var SSH_MSG_USERAUTH_SUCCESS = 52;
var SSH_MSG_USERAUTH_BANNER = 53;
var SSH_MSG_USERAUTH_PK_OK = 60;
var SSH_MSG_USERAUTH_INFO_REQUEST = 60;
var SSH_MSG_USERAUTH_INFO_RESPONSE = 61;
function encodeSshServiceRequest(serviceName) {
  return new SshDataWriter().writeByte(SSH_MSG_SERVICE_REQUEST).writeString(serviceName, "utf8").toBuffer();
}
function decodeSshServiceAccept(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_SERVICE_ACCEPT) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_SERVICE_ACCEPT",
      protocol: "sftp",
      retryable: false
    });
  }
  return { serviceName: reader.readString().toString("utf8") };
}
function encodeUserauthRequestPassword(args) {
  return new SshDataWriter().writeByte(SSH_MSG_USERAUTH_REQUEST).writeString(args.username, "utf8").writeString(args.serviceName, "utf8").writeString("password", "ascii").writeBoolean(false).writeString(args.password, "utf8").toBuffer();
}
function encodeUserauthRequestPublickeyQuery(args) {
  return new SshDataWriter().writeByte(SSH_MSG_USERAUTH_REQUEST).writeString(args.username, "utf8").writeString(args.serviceName, "utf8").writeString("publickey", "ascii").writeBoolean(false).writeString(args.algorithmName, "ascii").writeString(args.publicKeyBlob).toBuffer();
}
function encodeUserauthRequestPublickeySign(args) {
  return new SshDataWriter().writeByte(SSH_MSG_USERAUTH_REQUEST).writeString(args.username, "utf8").writeString(args.serviceName, "utf8").writeString("publickey", "ascii").writeBoolean(true).writeString(args.algorithmName, "ascii").writeString(args.publicKeyBlob).writeString(args.signature).toBuffer();
}
function buildPublickeySignData(args) {
  return new SshDataWriter().writeString(args.sessionId).writeByte(SSH_MSG_USERAUTH_REQUEST).writeString(args.username, "utf8").writeString(args.serviceName, "utf8").writeString("publickey", "ascii").writeBoolean(true).writeString(args.algorithmName, "ascii").writeString(args.publicKeyBlob).toBuffer();
}
function decodeSshUserauthFailure(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_USERAUTH_FAILURE) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_USERAUTH_FAILURE",
      protocol: "sftp",
      retryable: false
    });
  }
  const nameList = reader.readString().toString("ascii");
  const allowedAuthentications = nameList.length === 0 ? [] : nameList.split(",");
  const partialSuccess = reader.readBoolean();
  return { allowedAuthentications, partialSuccess };
}
function decodeSshUserauthBanner(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_USERAUTH_BANNER) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_USERAUTH_BANNER",
      protocol: "sftp",
      retryable: false
    });
  }
  const message = reader.readString().toString("utf8");
  const languageTag = reader.readString().toString("ascii");
  return { languageTag, message };
}
function decodeSshUserauthPkOk(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_USERAUTH_PK_OK) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_USERAUTH_PK_OK",
      protocol: "sftp",
      retryable: false
    });
  }
  return {
    algorithmName: reader.readString().toString("ascii"),
    publicKeyBlob: reader.readString()
  };
}
function decodeSshUserauthInfoRequest(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_USERAUTH_INFO_REQUEST) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_USERAUTH_INFO_REQUEST",
      protocol: "sftp",
      retryable: false
    });
  }
  const name = reader.readString().toString("utf8");
  const instruction = reader.readString().toString("utf8");
  const languageTag = reader.readString().toString("ascii");
  const count = reader.readUint32();
  const prompts = [];
  for (let i = 0; i < count; i++) {
    const prompt = reader.readString().toString("utf8");
    const echo = reader.readBoolean();
    prompts.push({ echo, prompt });
  }
  return { instruction, languageTag, name, prompts };
}
function encodeSshUserauthInfoResponse(responses) {
  const writer = new SshDataWriter().writeByte(SSH_MSG_USERAUTH_INFO_RESPONSE).writeUint32(responses.length);
  for (const r of responses) {
    writer.writeString(r, "utf8");
  }
  return writer.toBuffer();
}

// src/protocols/ssh/auth/SshAuthSession.ts
var SSH_USERAUTH_SERVICE = "ssh-userauth";
var SSH_CONNECTION_SERVICE = "ssh-connection";
var SshAuthSession = class {
  constructor(transport) {
    this.transport = transport;
  }
  transport;
  async authenticate(options) {
    const { credential, sessionId, maxAttempts = 4 } = options;
    const bannerLines = [];
    this.transport.sendPayload(encodeSshServiceRequest(SSH_USERAUTH_SERVICE));
    const serviceAcceptPayload = await this.nextPayload();
    decodeSshServiceAccept(serviceAcceptPayload);
    let attempts = 0;
    while (attempts < maxAttempts) {
      attempts += 1;
      const method = credential.type;
      switch (credential.type) {
        case "password": {
          this.transport.sendPayload(
            encodeUserauthRequestPassword({
              password: credential.password,
              serviceName: SSH_CONNECTION_SERVICE,
              username: credential.username
            })
          );
          break;
        }
        case "publickey": {
          this.transport.sendPayload(
            encodeUserauthRequestPublickeyQuery({
              algorithmName: credential.algorithmName,
              publicKeyBlob: credential.publicKeyBlob,
              serviceName: SSH_CONNECTION_SERVICE,
              username: credential.username
            })
          );
          const queryResponse = await this.nextPayloadSkippingBanners(bannerLines);
          const queryMsgType = queryResponse[0];
          if (queryMsgType === SSH_MSG_USERAUTH_FAILURE) {
            const failure = decodeSshUserauthFailure(queryResponse);
            throw new AuthenticationError({
              details: { allowed: failure.allowedAuthentications },
              message: `SSH server does not accept public key for user "${credential.username}"`,
              protocol: "sftp",
              retryable: false
            });
          }
          if (queryMsgType !== SSH_MSG_USERAUTH_PK_OK) {
            throw new AuthenticationError({
              details: { msgType: queryMsgType },
              message: "Unexpected server response to publickey query",
              protocol: "sftp",
              retryable: false
            });
          }
          decodeSshUserauthPkOk(queryResponse);
          const signData = buildPublickeySignData({
            algorithmName: credential.algorithmName,
            publicKeyBlob: credential.publicKeyBlob,
            serviceName: SSH_CONNECTION_SERVICE,
            sessionId,
            username: credential.username
          });
          const rawSignature = await credential.sign(signData);
          const signatureBlob = buildSignatureBlob(credential.algorithmName, rawSignature);
          this.transport.sendPayload(
            encodeUserauthRequestPublickeySign({
              algorithmName: credential.algorithmName,
              publicKeyBlob: credential.publicKeyBlob,
              serviceName: SSH_CONNECTION_SERVICE,
              signature: signatureBlob,
              username: credential.username
            })
          );
          break;
        }
        case "keyboard-interactive": {
          await this.runKeyboardInteractiveRounds(credential, bannerLines);
          const kiResult = await this.nextPayloadSkippingBanners(bannerLines);
          if (kiResult[0] === SSH_MSG_USERAUTH_SUCCESS) {
            return { bannerLines, method: "keyboard-interactive" };
          }
          if (kiResult[0] === SSH_MSG_USERAUTH_FAILURE) {
            throw new AuthenticationError({
              details: { allowed: decodeSshUserauthFailure(kiResult).allowedAuthentications },
              message: `SSH keyboard-interactive authentication failed for user "${credential.username}"`,
              protocol: "sftp",
              retryable: false
            });
          }
          throw new AuthenticationError({
            details: { msgType: kiResult[0] },
            message: "Unexpected message type after keyboard-interactive exchange",
            protocol: "sftp",
            retryable: false
          });
        }
      }
      const response = await this.nextPayloadSkippingBanners(bannerLines);
      const responseMsgType = response[0];
      if (responseMsgType === SSH_MSG_USERAUTH_SUCCESS) {
        return { bannerLines, method };
      }
      if (responseMsgType === SSH_MSG_USERAUTH_FAILURE) {
        const failure = decodeSshUserauthFailure(response);
        if (attempts >= maxAttempts || !failure.allowedAuthentications.includes(credential.type)) {
          throw new AuthenticationError({
            details: { allowed: failure.allowedAuthentications, attempts },
            message: `SSH authentication failed for user "${credential.username}" after ${attempts} attempt(s)`,
            protocol: "sftp",
            retryable: false
          });
        }
        continue;
      }
      throw new AuthenticationError({
        details: { msgType: responseMsgType },
        message: "Unexpected message type during SSH authentication",
        protocol: "sftp",
        retryable: false
      });
    }
    throw new AuthenticationError({
      details: { maxAttempts },
      message: `SSH authentication exceeded maximum attempts (${maxAttempts})`,
      protocol: "sftp",
      retryable: false
    });
  }
  // -- Private helpers ------------------------------------------------------
  async runKeyboardInteractiveRounds(credential, bannerLines) {
    this.transport.sendPayload(
      buildKiRequest({ serviceName: SSH_CONNECTION_SERVICE, username: credential.username })
    );
    while (true) {
      const payload = await this.nextPayloadSkippingBanners(bannerLines);
      const msgType = payload[0];
      if (msgType === SSH_MSG_USERAUTH_INFO_REQUEST) {
        const infoReq = decodeSshUserauthInfoRequest(payload);
        const responses = await credential.respond(
          infoReq.name,
          infoReq.instruction,
          infoReq.prompts
        );
        this.transport.sendPayload(encodeSshUserauthInfoResponse(responses));
        continue;
      }
      this.pendingPayload = payload;
      return;
    }
  }
  pendingPayload;
  async nextPayload() {
    if (this.pendingPayload !== void 0) {
      const p = this.pendingPayload;
      this.pendingPayload = void 0;
      return p;
    }
    const result = await this.transport.receivePayloads().next();
    if (result.done === true) {
      throw new AuthenticationError({
        message: "SSH connection closed during authentication",
        protocol: "sftp",
        retryable: false
      });
    }
    return result.value;
  }
  async nextPayloadSkippingBanners(bannerLines) {
    while (true) {
      const payload = await this.nextPayload();
      if (payload[0] === SSH_MSG_USERAUTH_BANNER) {
        bannerLines.push(decodeSshUserauthBanner(payload).message);
        continue;
      }
      return payload;
    }
  }
};
function buildSignatureBlob(algorithmName, rawSignature) {
  return new SshDataWriter().writeString(algorithmName, "ascii").writeString(rawSignature).toBuffer();
}
function buildKiRequest(args) {
  return new SshDataWriter().writeByte(50).writeString(args.username, "utf8").writeString(args.serviceName, "utf8").writeString("keyboard-interactive", "ascii").writeString("", "utf8").writeString("", "utf8").toBuffer();
}

// src/protocols/ssh/auth/SshPublickeyCredentialBuilder.ts
var import_node_buffer8 = require("buffer");
var import_node_crypto2 = require("crypto");
var ED25519_RAW_KEY_LENGTH = 32;
var ED25519_SPKI_PREFIX_LENGTH = 12;
function buildPublickeyCredential(options) {
  const { privateKey, username } = options;
  const publicKey = (0, import_node_crypto2.createPublicKey)(privateKey);
  switch (privateKey.asymmetricKeyType) {
    case "ed25519": {
      const spki = publicKey.export({ format: "der", type: "spki" });
      if (spki.length !== ED25519_SPKI_PREFIX_LENGTH + ED25519_RAW_KEY_LENGTH) {
        throw createInvalidKeyError("Ed25519 SPKI export has unexpected length");
      }
      const raw = spki.subarray(ED25519_SPKI_PREFIX_LENGTH);
      const publicKeyBlob = new SshDataWriter().writeString("ssh-ed25519", "ascii").writeString(raw).toBuffer();
      return {
        algorithmName: "ssh-ed25519",
        publicKeyBlob,
        sign: (data) => (0, import_node_crypto2.sign)(null, import_node_buffer8.Buffer.from(data), privateKey),
        type: "publickey",
        username
      };
    }
    case "rsa": {
      const algorithmName = options.rsaSignatureAlgorithm ?? "rsa-sha2-512";
      const hash = algorithmName === "rsa-sha2-256" ? "sha256" : "sha512";
      const jwk = publicKey.export({ format: "jwk" });
      if (jwk.n === void 0 || jwk.e === void 0) {
        throw createInvalidKeyError("RSA public key is missing modulus or exponent");
      }
      const n = base64UrlToMpint(jwk.n);
      const e = base64UrlToMpint(jwk.e);
      const publicKeyBlob = new SshDataWriter().writeString("ssh-rsa", "ascii").writeMpint(e).writeMpint(n).toBuffer();
      return {
        algorithmName,
        publicKeyBlob,
        sign: (data) => (0, import_node_crypto2.sign)(hash, import_node_buffer8.Buffer.from(data), privateKey),
        type: "publickey",
        username
      };
    }
    default:
      throw createInvalidKeyError(
        `Unsupported SSH private key type: ${privateKey.asymmetricKeyType ?? "unknown"}`
      );
  }
}
function base64UrlToMpint(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const buffer = import_node_buffer8.Buffer.from(padded, "base64");
  return buffer;
}
function createInvalidKeyError(message) {
  return new ConfigurationError({
    message,
    protocol: "sftp",
    retryable: false
  });
}

// src/protocols/ssh/connection/SshConnectionMessages.ts
var SSH_MSG_CHANNEL_OPEN = 90;
var SSH_MSG_CHANNEL_OPEN_CONFIRMATION = 91;
var SSH_MSG_CHANNEL_OPEN_FAILURE = 92;
var SSH_MSG_CHANNEL_WINDOW_ADJUST = 93;
var SSH_MSG_CHANNEL_DATA = 94;
var SSH_MSG_CHANNEL_EXTENDED_DATA = 95;
var SSH_MSG_CHANNEL_EOF = 96;
var SSH_MSG_CHANNEL_CLOSE = 97;
var SSH_MSG_CHANNEL_REQUEST = 98;
var SSH_MSG_CHANNEL_SUCCESS = 99;
var SSH_MSG_CHANNEL_FAILURE = 100;
function encodeSshChannelOpen(args) {
  return new SshDataWriter().writeByte(SSH_MSG_CHANNEL_OPEN).writeString(args.channelType, "ascii").writeUint32(args.senderChannel).writeUint32(args.initialWindowSize).writeUint32(args.maxPacketSize).toBuffer();
}
function decodeSshChannelOpenConfirmation(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_OPEN_CONFIRMATION) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_OPEN_CONFIRMATION",
      protocol: "sftp",
      retryable: false
    });
  }
  const recipientChannel = reader.readUint32();
  const senderChannel = reader.readUint32();
  const initialWindowSize = reader.readUint32();
  const maxPacketSize = reader.readUint32();
  return { initialWindowSize, maxPacketSize, recipientChannel, senderChannel };
}
function decodeSshChannelOpenFailure(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_OPEN_FAILURE) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_OPEN_FAILURE",
      protocol: "sftp",
      retryable: false
    });
  }
  const recipientChannel = reader.readUint32();
  const reasonCode = reader.readUint32();
  const description = reader.readString().toString("utf8");
  const languageTag = reader.readString().toString("ascii");
  return { description, languageTag, reasonCode, recipientChannel };
}
function encodeSshChannelRequestSubsystem(args) {
  return new SshDataWriter().writeByte(SSH_MSG_CHANNEL_REQUEST).writeUint32(args.recipientChannel).writeString("subsystem", "ascii").writeBoolean(args.wantReply).writeString(args.subsystemName, "ascii").toBuffer();
}
function encodeSshChannelRequestExec(args) {
  return new SshDataWriter().writeByte(SSH_MSG_CHANNEL_REQUEST).writeUint32(args.recipientChannel).writeString("exec", "ascii").writeBoolean(args.wantReply).writeString(args.command, "utf8").toBuffer();
}
function encodeSshChannelData(args) {
  return new SshDataWriter().writeByte(SSH_MSG_CHANNEL_DATA).writeUint32(args.recipientChannel).writeString(args.data).toBuffer();
}
function decodeSshChannelData(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_DATA) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_DATA",
      protocol: "sftp",
      retryable: false
    });
  }
  const recipientChannel = reader.readUint32();
  const data = reader.readString();
  return { data, recipientChannel };
}
function decodeSshChannelExtendedData(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_EXTENDED_DATA) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_EXTENDED_DATA",
      protocol: "sftp",
      retryable: false
    });
  }
  const recipientChannel = reader.readUint32();
  const dataTypeCode = reader.readUint32();
  const data = reader.readString();
  return { data, dataTypeCode, recipientChannel };
}
function encodeSshChannelWindowAdjust(args) {
  return new SshDataWriter().writeByte(SSH_MSG_CHANNEL_WINDOW_ADJUST).writeUint32(args.recipientChannel).writeUint32(args.bytesToAdd).toBuffer();
}
function decodeSshChannelWindowAdjust(payload) {
  const reader = new SshDataReader(payload);
  const msgType = reader.readByte();
  if (msgType !== SSH_MSG_CHANNEL_WINDOW_ADJUST) {
    throw new ParseError({
      details: { msgType },
      message: "Expected SSH_MSG_CHANNEL_WINDOW_ADJUST",
      protocol: "sftp",
      retryable: false
    });
  }
  const recipientChannel = reader.readUint32();
  const bytesToAdd = reader.readUint32();
  return { bytesToAdd, recipientChannel };
}
function encodeSshChannelEof(recipientChannel) {
  return new SshDataWriter().writeByte(SSH_MSG_CHANNEL_EOF).writeUint32(recipientChannel).toBuffer();
}
function encodeSshChannelClose(recipientChannel) {
  return new SshDataWriter().writeByte(SSH_MSG_CHANNEL_CLOSE).writeUint32(recipientChannel).toBuffer();
}

// src/protocols/ssh/connection/SshSessionChannel.ts
var import_node_buffer9 = require("buffer");
var INITIAL_WINDOW_SIZE = 256 * 1024;
var MAX_PACKET_SIZE = 32 * 1024;
var WINDOW_REFILL_THRESHOLD = 64 * 1024;
var SshSessionChannel = class {
  constructor(transport, options = {}) {
    this.transport = transport;
    this.localChannelId = options.localChannelId ?? 0;
  }
  transport;
  phase = "opening";
  /** Remote channel id assigned by the server in OPEN_CONFIRMATION. */
  remoteChannelId = 0;
  /** Bytes the remote side can still receive before we must stop sending. */
  remoteWindowRemaining = 0;
  /** Maximum packet data size the remote accepts. */
  remoteMaxPacketSize = MAX_PACKET_SIZE;
  /** Local window: bytes we can still accept from remote. */
  localWindowConsumed = 0;
  localWindowSize = INITIAL_WINDOW_SIZE;
  /** Queue of inbound data for the `receiveData()` generator. */
  inboundQueue = [];
  waitingConsumer;
  /** Queue of outbound data waiting for remote window space. */
  outboundQueue = [];
  /**
   * FIFO of waiters blocked on remote window credit. Each WINDOW_ADJUST wakes
   * exactly one waiter; concurrent senders must not lose wakeups.
   */
  outboundDrainedWaiters = [];
  /** Serializes sendData() calls so byte order on the wire matches call order. */
  sendChain = Promise.resolve();
  localChannelId;
  // -- Lifecycle ---------------------------------------------------------------
  /**
   * Opens the channel and requests a subsystem.
   * Resolves once the server confirms both CHANNEL_OPEN and the subsystem request.
   */
  async openSubsystem(subsystemName) {
    await this.openChannel();
    await this.requestSubsystem(subsystemName);
  }
  /**
   * Opens the channel and executes a command.
   */
  async openExec(command) {
    await this.openChannel();
    await this.requestExec(command);
  }
  async openChannel() {
    this.transport.sendPayload(
      encodeSshChannelOpen({
        channelType: "session",
        initialWindowSize: INITIAL_WINDOW_SIZE,
        maxPacketSize: MAX_PACKET_SIZE,
        senderChannel: this.localChannelId
      })
    );
    const payload = await this.nextPayload();
    const msgType = payload[0];
    if (msgType === SSH_MSG_CHANNEL_OPEN_FAILURE) {
      const failure = decodeSshChannelOpenFailure(payload);
      throw new ConnectionError({
        details: { reason: failure.reasonCode, description: failure.description },
        message: `SSH channel open failed: ${failure.description}`,
        protocol: "sftp",
        retryable: false
      });
    }
    if (msgType !== SSH_MSG_CHANNEL_OPEN_CONFIRMATION) {
      throw new ProtocolError({
        details: { msgType },
        message: "Expected SSH_MSG_CHANNEL_OPEN_CONFIRMATION",
        protocol: "sftp",
        retryable: false
      });
    }
    const confirmation = decodeSshChannelOpenConfirmation(payload);
    this.remoteChannelId = confirmation.senderChannel;
    this.remoteWindowRemaining = confirmation.initialWindowSize;
    this.remoteMaxPacketSize = confirmation.maxPacketSize;
    this.phase = "requesting";
  }
  async requestSubsystem(subsystemName) {
    this.transport.sendPayload(
      encodeSshChannelRequestSubsystem({
        recipientChannel: this.remoteChannelId,
        subsystemName,
        wantReply: true
      })
    );
    await this.awaitChannelRequestReply("subsystem");
  }
  async requestExec(command) {
    this.transport.sendPayload(
      encodeSshChannelRequestExec({
        command,
        recipientChannel: this.remoteChannelId,
        wantReply: true
      })
    );
    await this.awaitChannelRequestReply("exec");
  }
  async awaitChannelRequestReply(requestType) {
    const payload = await this.nextPayload();
    const msgType = payload[0];
    if (msgType === SSH_MSG_CHANNEL_SUCCESS) {
      this.phase = "open";
      return;
    }
    if (msgType === SSH_MSG_CHANNEL_FAILURE) {
      throw new ConnectionError({
        details: { requestType },
        message: `SSH channel request "${requestType}" was rejected by the server`,
        protocol: "sftp",
        retryable: false
      });
    }
    throw new ProtocolError({
      details: { msgType },
      message: `Unexpected response to channel request "${requestType}"`,
      protocol: "sftp",
      retryable: false
    });
  }
  // -- Send --------------------------------------------------------------------
  /**
   * Sends data on the channel. Respects the remote window; if there is no space,
   * splits the data and queues the remainder for when WINDOW_ADJUST arrives.
   *
   * Concurrent calls are serialized so wire byte order matches call order.
   */
  sendData(data) {
    const next = this.sendChain.then(() => this.sendDataLocked(data));
    this.sendChain = next.catch(() => void 0);
    return next;
  }
  async sendDataLocked(data) {
    if (this.phase !== "open") {
      throw new ProtocolError({
        message: "Cannot send data on a channel that is not open",
        protocol: "sftp",
        retryable: false
      });
    }
    let offset = 0;
    while (offset < data.length) {
      if (this.remoteWindowRemaining <= 0) {
        await new Promise((resolve) => {
          this.outboundDrainedWaiters.push(resolve);
        });
        continue;
      }
      const chunkSize = Math.min(
        data.length - offset,
        this.remoteWindowRemaining,
        this.remoteMaxPacketSize
      );
      const chunk = import_node_buffer9.Buffer.from(data.subarray(offset, offset + chunkSize));
      this.transport.sendPayload(
        encodeSshChannelData({ data: chunk, recipientChannel: this.remoteChannelId })
      );
      this.remoteWindowRemaining -= chunkSize;
      offset += chunkSize;
    }
  }
  // -- Receive -----------------------------------------------------------------
  /**
   * Async generator that yields raw data buffers from the channel.
   * Returns (done) when the channel receives EOF or CLOSE.
   */
  async *receiveData() {
    while (true) {
      const entry = await this.dequeueInbound();
      if (entry.type === "error") throw entry.error;
      if (entry.type === "eof" || entry.type === "close") return;
      yield entry.data;
    }
  }
  // -- Close -------------------------------------------------------------------
  /**
   * Sends EOF and CLOSE.  Should be called when the client is done sending.
   */
  close() {
    if (this.phase === "closed" || this.phase === "closing") return;
    this.phase = "closing";
    this.transport.sendPayload(encodeSshChannelEof(this.remoteChannelId));
    this.transport.sendPayload(encodeSshChannelClose(this.remoteChannelId));
  }
  // -- Dispatch (called by SshConnectionManager) -----------------------------
  /**
   * Feed an inbound transport payload to this channel.
   * Called by the channel multiplexer (`SshConnectionManager`).
   */
  dispatch(payload) {
    const msgType = payload[0];
    switch (msgType) {
      case SSH_MSG_CHANNEL_DATA: {
        const msg = decodeSshChannelData(payload);
        this.consumeLocalWindow(msg.data.length);
        this.enqueueInbound({ type: "data", data: msg.data });
        break;
      }
      case SSH_MSG_CHANNEL_EXTENDED_DATA: {
        const msg = decodeSshChannelExtendedData(payload);
        this.consumeLocalWindow(msg.data.length);
        break;
      }
      case SSH_MSG_CHANNEL_WINDOW_ADJUST: {
        const msg = decodeSshChannelWindowAdjust(payload);
        this.remoteWindowRemaining += msg.bytesToAdd;
        const waiters = this.outboundDrainedWaiters.splice(0);
        for (const cb of waiters) cb();
        break;
      }
      case SSH_MSG_CHANNEL_EOF: {
        this.enqueueInbound({ type: "eof" });
        break;
      }
      case SSH_MSG_CHANNEL_CLOSE: {
        this.phase = "closed";
        this.enqueueInbound({ type: "close" });
        const waiters = this.outboundDrainedWaiters.splice(0);
        for (const cb of waiters) cb();
        break;
      }
      default:
        break;
    }
  }
  dispatchError(error) {
    this.enqueueInbound({ type: "error", error });
    const waiters = this.outboundDrainedWaiters.splice(0);
    for (const cb of waiters) cb();
  }
  // -- Private helpers ------------------------------------------------------
  consumeLocalWindow(bytes) {
    this.localWindowConsumed += bytes;
    if (this.localWindowConsumed >= WINDOW_REFILL_THRESHOLD) {
      const bytesToAdd = this.localWindowConsumed;
      this.localWindowConsumed = 0;
      this.transport.sendPayload(
        encodeSshChannelWindowAdjust({
          bytesToAdd,
          recipientChannel: this.remoteChannelId
        })
      );
    }
  }
  enqueueInbound(entry) {
    this.inboundQueue.push(entry);
    if (this.waitingConsumer !== void 0) {
      const cb = this.waitingConsumer;
      this.waitingConsumer = void 0;
      cb();
    }
  }
  dequeueInbound() {
    if (this.inboundQueue.length > 0) {
      return Promise.resolve(this.inboundQueue.shift());
    }
    return new Promise((resolve) => {
      this.waitingConsumer = () => {
        resolve(this.inboundQueue.shift());
      };
    });
  }
  /** Pull the next payload from the transport (used during channel setup only). */
  async nextPayload() {
    const result = await this.transport.receivePayloads().next();
    if (result.done === true) {
      throw new ConnectionError({
        message: "SSH connection closed during channel setup",
        protocol: "sftp",
        retryable: false
      });
    }
    return result.value;
  }
};

// src/protocols/ssh/connection/SshConnectionManager.ts
var CHANNEL_MSG_TYPES = /* @__PURE__ */ new Set([
  SSH_MSG_CHANNEL_OPEN_CONFIRMATION,
  SSH_MSG_CHANNEL_OPEN_FAILURE,
  SSH_MSG_CHANNEL_WINDOW_ADJUST,
  SSH_MSG_CHANNEL_DATA,
  SSH_MSG_CHANNEL_EXTENDED_DATA,
  SSH_MSG_CHANNEL_EOF,
  SSH_MSG_CHANNEL_CLOSE,
  SSH_MSG_CHANNEL_REQUEST,
  SSH_MSG_CHANNEL_SUCCESS,
  SSH_MSG_CHANNEL_FAILURE
]);
var SshConnectionManager = class {
  constructor(transport) {
    this.transport = transport;
  }
  transport;
  channels = /* @__PURE__ */ new Map();
  nextLocalId = 0;
  pumpPromise;
  pumpResolve;
  pumpReject;
  /** Payloads that arrived before any channel registered (buffered for the first channel). */
  pendingSetupPayloads = [];
  setupPayloadConsumer;
  // -- Setup-phase payload delivery (for channel open/request handshakes) -----
  /**
   * Delivers the next connection-layer payload to callers during channel setup.
   * Called by `SshSessionChannel` during `openChannel()` / `requestSubsystem()`.
   *
   * Channel setup happens sequentially before `start()` begins pumping, so we
   * pull directly from the transport iterator here.
   */
  async nextSetupPayload() {
    if (this.pendingSetupPayloads.length > 0) {
      return this.pendingSetupPayloads.shift();
    }
    const result = await this.transport.receivePayloads().next();
    if (result.done === true) {
      throw new ConnectionError({
        message: "SSH connection closed during channel setup",
        protocol: "sftp",
        retryable: false
      });
    }
    return result.value;
  }
  // -- Channel factory -------------------------------------------------------
  /**
   * Opens a session channel and starts the SFTP subsystem on it.
   * Must be called before `start()`.
   */
  async openSubsystemChannel(subsystemName) {
    const localId = this.nextLocalId++;
    const channel = new SshSessionChannel(this.transport, { localChannelId: localId });
    this.channels.set(localId, channel);
    await this.runChannelSetup(channel, () => channel.openSubsystem(subsystemName));
    return channel;
  }
  /**
   * Opens a session channel and runs the given command on it.
   * Must be called before `start()`.
   */
  async openExecChannel(command) {
    const localId = this.nextLocalId++;
    const channel = new SshSessionChannel(this.transport, { localChannelId: localId });
    this.channels.set(localId, channel);
    await this.runChannelSetup(channel, () => channel.openExec(command));
    return channel;
  }
  // -- Pump --------------------------------------------------------------------
  /**
   * Starts the main dispatch loop.  Returns a Promise that resolves when the
   * connection closes cleanly, or rejects on a fatal transport error.
   *
   * Call this after all channels have been opened and the application is ready
   * to receive data.
   */
  start() {
    if (this.pumpPromise !== void 0) return this.pumpPromise;
    this.pumpPromise = new Promise((resolve, reject) => {
      this.pumpResolve = resolve;
      this.pumpReject = reject;
      void this.pump();
    });
    return this.pumpPromise;
  }
  // -- Private --------------------------------------------------------------
  /**
   * Runs channel setup (open + request) with a dedicated payload pump that
   * pulls from the transport iterator and dispatches non-channel-setup messages
   * to `pendingSetupPayloads` for later processing.
   */
  async runChannelSetup(channel, setup) {
    await setup();
  }
  async pump() {
    try {
      for await (const payload of this.transport.receivePayloads()) {
        this.dispatch(payload);
      }
      this.terminateChannels(
        new ConnectionError({
          message: "SSH connection closed",
          protocol: "sftp",
          retryable: false
        })
      );
      this.pumpResolve?.();
    } catch (err) {
      const error = err instanceof Error ? err : new ConnectionError({
        message: String(err),
        protocol: "sftp",
        retryable: false
      });
      this.terminateChannels(error);
      this.pumpReject?.(error);
    }
  }
  dispatch(payload) {
    const msgType = payload[0];
    if (msgType === void 0) return;
    if (CHANNEL_MSG_TYPES.has(msgType)) {
      const recipientChannel = payload.readUInt32BE(1);
      const channel = this.channels.get(recipientChannel);
      if (channel !== void 0) {
        channel.dispatch(payload);
      }
    }
  }
  terminateChannels(error) {
    for (const channel of this.channels.values()) {
      channel.dispatchError(error);
    }
  }
};

// src/protocols/ssh/transport/SshTransportConnection.ts
var import_node_buffer17 = require("buffer");

// src/protocols/ssh/transport/SshTransportHandshake.ts
var import_node_buffer15 = require("buffer");

// src/protocols/ssh/transport/SshAlgorithmNegotiation.ts
var DEFAULT_SSH_ALGORITHM_PREFERENCES = {
  compressionClientToServer: ["none"],
  compressionServerToClient: ["none"],
  encryptionClientToServer: [
    "chacha20-poly1305@openssh.com",
    "aes256-gcm@openssh.com",
    "aes128-gcm@openssh.com",
    "aes256-ctr",
    "aes128-ctr"
  ],
  encryptionServerToClient: [
    "chacha20-poly1305@openssh.com",
    "aes256-gcm@openssh.com",
    "aes128-gcm@openssh.com",
    "aes256-ctr",
    "aes128-ctr"
  ],
  kexAlgorithms: ["curve25519-sha256", "curve25519-sha256@libssh.org"],
  languagesClientToServer: [],
  languagesServerToClient: [],
  macClientToServer: ["hmac-sha2-512", "hmac-sha2-256"],
  macServerToClient: ["hmac-sha2-512", "hmac-sha2-256"],
  serverHostKeyAlgorithms: [
    "ssh-ed25519",
    "ecdsa-sha2-nistp256",
    "ecdsa-sha2-nistp384",
    "ecdsa-sha2-nistp521",
    "rsa-sha2-512",
    "rsa-sha2-256"
  ]
};
function negotiateSshAlgorithms(client, server) {
  const languageClientToServer = chooseLanguage(
    "languages client->server",
    client.languagesClientToServer,
    server.languagesClientToServer
  );
  const languageServerToClient = chooseLanguage(
    "languages server->client",
    client.languagesServerToClient,
    server.languagesServerToClient
  );
  return {
    compressionClientToServer: chooseRequired(
      "compression client->server",
      client.compressionClientToServer,
      server.compressionClientToServer
    ),
    compressionServerToClient: chooseRequired(
      "compression server->client",
      client.compressionServerToClient,
      server.compressionServerToClient
    ),
    encryptionClientToServer: chooseRequired(
      "encryption client->server",
      client.encryptionClientToServer,
      server.encryptionClientToServer
    ),
    encryptionServerToClient: chooseRequired(
      "encryption server->client",
      client.encryptionServerToClient,
      server.encryptionServerToClient
    ),
    kexAlgorithm: chooseRequired("kex", client.kexAlgorithms, server.kexAlgorithms),
    ...languageClientToServer === void 0 ? {} : { languageClientToServer },
    ...languageServerToClient === void 0 ? {} : { languageServerToClient },
    macClientToServer: chooseRequired(
      "mac client->server",
      client.macClientToServer,
      server.macClientToServer
    ),
    macServerToClient: chooseRequired(
      "mac server->client",
      client.macServerToClient,
      server.macServerToClient
    ),
    serverHostKeyAlgorithm: chooseRequired(
      "server host key",
      client.serverHostKeyAlgorithms,
      server.serverHostKeyAlgorithms
    )
  };
}
function chooseRequired(label, preferred, supported) {
  const selected = preferred.find((candidate) => supported.includes(candidate));
  if (selected !== void 0) {
    return selected;
  }
  throw new UnsupportedFeatureError({
    details: {
      preferred,
      supported
    },
    message: `Unable to negotiate SSH ${label} algorithm`,
    protocol: "sftp",
    retryable: false
  });
}
function chooseLanguage(label, preferred, supported) {
  if (preferred.length === 0 || supported.length === 0) {
    return void 0;
  }
  return chooseRequired(label, preferred, supported);
}

// src/protocols/ssh/transport/SshIdentification.ts
var SSH_IDENT_PREFIX = "SSH-";
var SSH_PROTOCOL_VERSION = "2.0";
function buildSshIdentificationLine(options) {
  const protocolVersion = options.protocolVersion ?? SSH_PROTOCOL_VERSION;
  if (protocolVersion.trim().length === 0 || options.softwareVersion.trim().length === 0) {
    throw new ParseError({
      message: "SSH identification protocol and software versions must be non-empty",
      retryable: false
    });
  }
  const base = `${SSH_IDENT_PREFIX}${protocolVersion}-${options.softwareVersion}`;
  if (options.comments === void 0 || options.comments.length === 0) {
    return base;
  }
  return `${base} ${options.comments}`;
}
function parseSshIdentificationLine(line) {
  if (!line.startsWith(SSH_IDENT_PREFIX)) {
    throw new ParseError({
      details: { line },
      message: "SSH identification line must start with 'SSH-'",
      retryable: false
    });
  }
  const firstSpace = line.indexOf(" ");
  const header = firstSpace === -1 ? line : line.slice(0, firstSpace);
  const comments = firstSpace === -1 ? void 0 : line.slice(firstSpace + 1);
  const headerParts = header.split("-");
  if (headerParts.length < 3) {
    throw new ParseError({
      details: { line },
      message: "SSH identification line is malformed",
      retryable: false
    });
  }
  const protocolVersion = headerParts[1] ?? "";
  const softwareVersion = headerParts.slice(2).join("-");
  if (protocolVersion.length === 0 || softwareVersion.length === 0) {
    throw new ParseError({
      details: { line },
      message: "SSH identification line must include protocol and software versions",
      retryable: false
    });
  }
  return {
    protocolVersion,
    softwareVersion,
    raw: line,
    ...comments === void 0 || comments.length === 0 ? {} : { comments }
  };
}

// src/protocols/ssh/transport/SshKexInit.ts
var import_node_buffer10 = require("buffer");
var import_node_crypto3 = require("crypto");
var SSH_MSG_KEXINIT = 20;
var KEXINIT_COOKIE_LENGTH = 16;
function encodeSshKexInitMessage(options) {
  const cookie = options.cookie === void 0 ? (0, import_node_crypto3.randomBytes)(KEXINIT_COOKIE_LENGTH) : import_node_buffer10.Buffer.from(options.cookie);
  if (cookie.length !== KEXINIT_COOKIE_LENGTH) {
    throw new ConfigurationError({
      details: { actualLength: cookie.length, expectedLength: KEXINIT_COOKIE_LENGTH },
      message: "SSH KEXINIT cookie must be 16 bytes",
      protocol: "sftp",
      retryable: false
    });
  }
  const writer = new SshDataWriter();
  writer.writeByte(SSH_MSG_KEXINIT);
  writer.writeBytes(cookie);
  writer.writeNameList(options.algorithms.kexAlgorithms);
  writer.writeNameList(options.algorithms.serverHostKeyAlgorithms);
  writer.writeNameList(options.algorithms.encryptionClientToServer);
  writer.writeNameList(options.algorithms.encryptionServerToClient);
  writer.writeNameList(options.algorithms.macClientToServer);
  writer.writeNameList(options.algorithms.macServerToClient);
  writer.writeNameList(options.algorithms.compressionClientToServer);
  writer.writeNameList(options.algorithms.compressionServerToClient);
  writer.writeNameList(options.algorithms.languagesClientToServer);
  writer.writeNameList(options.algorithms.languagesServerToClient);
  writer.writeBoolean(options.firstKexPacketFollows ?? false);
  writer.writeUint32(0);
  return writer.toBuffer();
}
function decodeSshKexInitMessage(payload) {
  const reader = new SshDataReader(payload);
  const messageType = reader.readByte();
  if (messageType !== SSH_MSG_KEXINIT) {
    throw new ParseError({
      details: { messageType },
      message: "Expected SSH_MSG_KEXINIT payload",
      protocol: "sftp",
      retryable: false
    });
  }
  const cookie = reader.readBytes(KEXINIT_COOKIE_LENGTH);
  const kexAlgorithms = reader.readNameList();
  const serverHostKeyAlgorithms = reader.readNameList();
  const encryptionClientToServer = reader.readNameList();
  const encryptionServerToClient = reader.readNameList();
  const macClientToServer = reader.readNameList();
  const macServerToClient = reader.readNameList();
  const compressionClientToServer = reader.readNameList();
  const compressionServerToClient = reader.readNameList();
  const languagesClientToServer = reader.readNameList();
  const languagesServerToClient = reader.readNameList();
  const firstKexPacketFollows = reader.readBoolean();
  const reserved = reader.readUint32();
  reader.assertFinished();
  return {
    compressionClientToServer,
    compressionServerToClient,
    cookie,
    encryptionClientToServer,
    encryptionServerToClient,
    firstKexPacketFollows,
    kexAlgorithms,
    languagesClientToServer,
    languagesServerToClient,
    macClientToServer,
    macServerToClient,
    messageType,
    reserved,
    serverHostKeyAlgorithms
  };
}

// src/protocols/ssh/transport/SshKexCurve25519.ts
var import_node_buffer11 = require("buffer");
var import_node_crypto4 = require("crypto");
var SSH_MSG_KEX_ECDH_INIT = 30;
var SSH_MSG_KEX_ECDH_REPLY = 31;
var X25519_PUBLIC_KEY_LENGTH = 32;
var X25519_SPKI_PREFIX = import_node_buffer11.Buffer.from("302a300506032b656e032100", "hex");
function createCurve25519Ephemeral() {
  const { privateKey, publicKey } = (0, import_node_crypto4.generateKeyPairSync)("x25519");
  const encodedPublicKey = exportX25519PublicKeyRaw(publicKey);
  return {
    deriveSharedSecret: (serverPublicKey) => {
      const peer = importX25519PublicKeyRaw(serverPublicKey);
      return (0, import_node_crypto4.diffieHellman)({ privateKey, publicKey: peer });
    },
    publicKey: encodedPublicKey
  };
}
function encodeSshKexEcdhInitMessage(publicKey) {
  const normalized = normalizeX25519PublicKey(publicKey, "client");
  return new SshDataWriter().writeByte(SSH_MSG_KEX_ECDH_INIT).writeString(normalized).toBuffer();
}
function decodeSshKexEcdhReplyMessage(payload) {
  const reader = new SshDataReader(payload);
  const messageType = reader.readByte();
  if (messageType !== SSH_MSG_KEX_ECDH_REPLY) {
    throw new ParseError({
      details: { messageType },
      message: "Expected SSH_MSG_KEX_ECDH_REPLY payload",
      protocol: "sftp",
      retryable: false
    });
  }
  const hostKey = reader.readString();
  const serverPublicKey = normalizeX25519PublicKey(reader.readString(), "server");
  const signature = reader.readString();
  reader.assertFinished();
  return {
    hostKey,
    messageType,
    serverPublicKey,
    signature
  };
}
function exportX25519PublicKeyRaw(publicKey) {
  const der = publicKey.export({ format: "der", type: "spki" });
  const raw = der.subarray(der.length - X25519_PUBLIC_KEY_LENGTH);
  return normalizeX25519PublicKey(raw, "client");
}
function importX25519PublicKeyRaw(raw) {
  const normalized = normalizeX25519PublicKey(raw, "server");
  const der = import_node_buffer11.Buffer.concat([X25519_SPKI_PREFIX, normalized]);
  return (0, import_node_crypto4.createPublicKey)({
    format: "der",
    key: der,
    type: "spki"
  });
}
function normalizeX25519PublicKey(value, label) {
  const key = import_node_buffer11.Buffer.from(value);
  if (key.length !== X25519_PUBLIC_KEY_LENGTH) {
    throw new ConfigurationError({
      details: { keyLength: key.length, label },
      message: `SSH ${label} Curve25519 public key must be 32 bytes`,
      protocol: "sftp",
      retryable: false
    });
  }
  return key;
}

// src/protocols/ssh/transport/SshKeyDerivation.ts
var import_node_buffer12 = require("buffer");
var import_node_crypto5 = require("crypto");
function deriveSshSessionKeys(input) {
  const hashAlgorithm = resolveKexHashAlgorithm(input.kexAlgorithm);
  const exchangeHash = computeCurve25519ExchangeHash(input, hashAlgorithm);
  const sessionId = exchangeHash;
  const c2sEncryptionLength = resolveEncryptionKeyLength(
    input.negotiatedAlgorithms.encryptionClientToServer
  );
  const s2cEncryptionLength = resolveEncryptionKeyLength(
    input.negotiatedAlgorithms.encryptionServerToClient
  );
  const c2sIvLength = resolveIvLength(input.negotiatedAlgorithms.encryptionClientToServer);
  const s2cIvLength = resolveIvLength(input.negotiatedAlgorithms.encryptionServerToClient);
  const c2sMacLength = resolveMacKeyLength(
    input.negotiatedAlgorithms.encryptionClientToServer,
    input.negotiatedAlgorithms.macClientToServer
  );
  const s2cMacLength = resolveMacKeyLength(
    input.negotiatedAlgorithms.encryptionServerToClient,
    input.negotiatedAlgorithms.macServerToClient
  );
  const sharedSecret = import_node_buffer12.Buffer.from(input.sharedSecret);
  return {
    clientToServer: {
      encryptionKey: deriveMaterial(
        sharedSecret,
        exchangeHash,
        sessionId,
        "C",
        c2sEncryptionLength,
        hashAlgorithm
      ),
      iv: deriveMaterial(sharedSecret, exchangeHash, sessionId, "A", c2sIvLength, hashAlgorithm),
      macKey: deriveMaterial(
        sharedSecret,
        exchangeHash,
        sessionId,
        "E",
        c2sMacLength,
        hashAlgorithm
      )
    },
    exchangeHash,
    serverToClient: {
      encryptionKey: deriveMaterial(
        sharedSecret,
        exchangeHash,
        sessionId,
        "D",
        s2cEncryptionLength,
        hashAlgorithm
      ),
      iv: deriveMaterial(sharedSecret, exchangeHash, sessionId, "B", s2cIvLength, hashAlgorithm),
      macKey: deriveMaterial(
        sharedSecret,
        exchangeHash,
        sessionId,
        "F",
        s2cMacLength,
        hashAlgorithm
      )
    },
    sessionId
  };
}
function computeCurve25519ExchangeHash(input, hashAlgorithm) {
  const transcript = new SshDataWriter().writeString(input.clientIdentification, "ascii").writeString(input.serverIdentification, "ascii").writeString(input.clientKexInitPayload).writeString(input.serverKexInitPayload).writeString(input.serverHostKey).writeString(input.clientPublicKey).writeString(input.serverPublicKey).writeMpint(input.sharedSecret).toBuffer();
  return (0, import_node_crypto5.createHash)(hashAlgorithm).update(transcript).digest();
}
function deriveMaterial(sharedSecret, exchangeHash, sessionId, letter, length, hashAlgorithm) {
  if (length <= 0) {
    return import_node_buffer12.Buffer.alloc(0);
  }
  const result = [];
  const first2 = (0, import_node_crypto5.createHash)(hashAlgorithm).update(
    new SshDataWriter().writeMpint(sharedSecret).writeBytes(exchangeHash).writeByte(letter.charCodeAt(0)).writeBytes(sessionId).toBuffer()
  ).digest();
  result.push(first2);
  while (import_node_buffer12.Buffer.concat(result).length < length) {
    const previous = import_node_buffer12.Buffer.concat(result);
    const next = (0, import_node_crypto5.createHash)(hashAlgorithm).update(
      new SshDataWriter().writeMpint(sharedSecret).writeBytes(exchangeHash).writeBytes(previous).toBuffer()
    ).digest();
    result.push(next);
  }
  return import_node_buffer12.Buffer.concat(result).subarray(0, length);
}
function resolveKexHashAlgorithm(kexAlgorithm) {
  if (kexAlgorithm === "curve25519-sha256" || kexAlgorithm === "curve25519-sha256@libssh.org") {
    return "sha256";
  }
  throw new ProtocolError({
    details: { kexAlgorithm },
    message: "Unsupported key exchange hash algorithm",
    protocol: "sftp",
    retryable: false
  });
}
function resolveEncryptionKeyLength(algorithm) {
  switch (algorithm) {
    case "chacha20-poly1305@openssh.com":
      return 64;
    case "aes128-gcm@openssh.com":
    case "aes128-ctr":
      return 16;
    case "aes256-gcm@openssh.com":
    case "aes256-ctr":
      return 32;
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH encryption algorithm for key derivation",
        protocol: "sftp",
        retryable: false
      });
  }
}
function resolveIvLength(algorithm) {
  switch (algorithm) {
    case "chacha20-poly1305@openssh.com":
      return 0;
    case "aes128-gcm@openssh.com":
    case "aes256-gcm@openssh.com":
      return 12;
    case "aes128-ctr":
    case "aes256-ctr":
      return 16;
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH encryption algorithm for IV derivation",
        protocol: "sftp",
        retryable: false
      });
  }
}
function resolveMacKeyLength(encryptionAlgorithm, macAlgorithm) {
  if (encryptionAlgorithm.endsWith("-gcm@openssh.com") || encryptionAlgorithm === "chacha20-poly1305@openssh.com") {
    return 0;
  }
  switch (macAlgorithm) {
    case "hmac-sha2-256":
      return 32;
    case "hmac-sha2-512":
      return 64;
    default:
      throw new ProtocolError({
        details: { macAlgorithm },
        message: "Unsupported SSH MAC algorithm for key derivation",
        protocol: "sftp",
        retryable: false
      });
  }
}

// src/protocols/ssh/transport/SshNewKeys.ts
var SSH_MSG_NEWKEYS = 21;
function encodeSshNewKeysMessage() {
  return Buffer.from([SSH_MSG_NEWKEYS]);
}
function decodeSshNewKeysMessage(payload) {
  if (payload.length !== 1 || payload[0] !== SSH_MSG_NEWKEYS) {
    throw new ParseError({
      details: { length: payload.length, messageType: payload[0] },
      message: "Expected SSH_MSG_NEWKEYS payload",
      protocol: "sftp",
      retryable: false
    });
  }
  return { messageType: SSH_MSG_NEWKEYS };
}

// src/protocols/ssh/transport/SshTransportPacket.ts
var import_node_buffer13 = require("buffer");
var import_node_crypto6 = require("crypto");
var MIN_PADDING_LENGTH = 4;
var MIN_PACKET_LENGTH = 1 + MIN_PADDING_LENGTH;
function encodeSshTransportPacket(payload, options = {}) {
  const body = import_node_buffer13.Buffer.from(payload);
  const blockSize = normalizeBlockSize(options.blockSize ?? 8);
  let paddingLength = MIN_PADDING_LENGTH;
  while ((1 + body.length + paddingLength + 4) % blockSize !== 0) {
    paddingLength += 1;
  }
  const padding = options.randomPadding === false ? import_node_buffer13.Buffer.alloc(paddingLength) : (0, import_node_crypto6.randomBytes)(paddingLength);
  const packetLength = 1 + body.length + paddingLength;
  const frame = import_node_buffer13.Buffer.allocUnsafe(4 + packetLength);
  frame.writeUInt32BE(packetLength, 0);
  frame.writeUInt8(paddingLength, 4);
  body.copy(frame, 5);
  padding.copy(frame, 5 + body.length);
  return frame;
}
function decodeSshTransportPacket(frame) {
  const bytes = import_node_buffer13.Buffer.from(frame);
  if (bytes.length < 4 + MIN_PACKET_LENGTH) {
    throw new ParseError({
      details: { length: bytes.length },
      message: "SSH transport frame is too short",
      protocol: "sftp",
      retryable: false
    });
  }
  const packetLength = bytes.readUInt32BE(0);
  if (packetLength < MIN_PACKET_LENGTH) {
    throw new ParseError({
      details: { packetLength },
      message: "SSH transport packet length is invalid",
      protocol: "sftp",
      retryable: false
    });
  }
  const totalLength = 4 + packetLength;
  if (bytes.length !== totalLength) {
    throw new ParseError({
      details: { actualLength: bytes.length, expectedLength: totalLength },
      message: "SSH transport packet length prefix does not match frame size",
      protocol: "sftp",
      retryable: false
    });
  }
  const paddingLength = bytes.readUInt8(4);
  if (paddingLength < MIN_PADDING_LENGTH) {
    throw new ParseError({
      details: { paddingLength },
      message: "SSH transport packet padding length is invalid",
      protocol: "sftp",
      retryable: false
    });
  }
  const payloadLength = packetLength - 1 - paddingLength;
  if (payloadLength < 0) {
    throw new ParseError({
      details: { packetLength, paddingLength },
      message: "SSH transport packet payload length is negative",
      protocol: "sftp",
      retryable: false
    });
  }
  const payloadStart = 5;
  const payloadEnd = payloadStart + payloadLength;
  return {
    padding: bytes.subarray(payloadEnd, payloadEnd + paddingLength),
    paddingLength,
    payload: bytes.subarray(payloadStart, payloadEnd)
  };
}
var SshTransportPacketFramer = class {
  pending = import_node_buffer13.Buffer.alloc(0);
  push(chunk) {
    this.pending = import_node_buffer13.Buffer.concat([this.pending, import_node_buffer13.Buffer.from(chunk)]);
    const packets = [];
    while (this.pending.length >= 4) {
      const packetLength = this.pending.readUInt32BE(0);
      const frameLength = 4 + packetLength;
      if (this.pending.length < frameLength) {
        break;
      }
      const frame = this.pending.subarray(0, frameLength);
      packets.push(decodeSshTransportPacket(frame));
      this.pending = this.pending.subarray(frameLength);
    }
    return packets;
  }
  getBufferedByteLength() {
    return this.pending.length;
  }
  /** Returns and clears any bytes buffered but not yet part of a complete packet. */
  takeRemainingBytes() {
    const remaining = import_node_buffer13.Buffer.from(this.pending);
    this.pending = import_node_buffer13.Buffer.alloc(0);
    return remaining;
  }
};
function normalizeBlockSize(blockSize) {
  if (!Number.isInteger(blockSize) || blockSize < 8 || blockSize > 255) {
    throw new ConfigurationError({
      details: { blockSize },
      message: "SSH transport block size must be an integer between 8 and 255",
      protocol: "sftp",
      retryable: false
    });
  }
  return blockSize;
}

// src/protocols/ssh/transport/SshHostKeyVerification.ts
var import_node_buffer14 = require("buffer");
var import_node_crypto7 = require("crypto");
var ED25519_RAW_KEY_LENGTH2 = 32;
var ED25519_SPKI_PREFIX = import_node_buffer14.Buffer.from("302a300506032b6570032100", "hex");
function verifySshHostKeySignature(input) {
  const { algorithmName, publicKey } = parseHostKey(input.hostKeyBlob);
  const { signatureAlgorithm, signatureBytes } = parseSignatureBlob(input.signatureBlob);
  if (!isCompatibleSignatureAlgorithm(algorithmName, signatureAlgorithm)) {
    throw new ProtocolError({
      details: { hostKeyAlgorithm: algorithmName, signatureAlgorithm },
      message: "SSH host key signature algorithm does not match host key type",
      protocol: "sftp",
      retryable: false
    });
  }
  const verified = verifySignature({
    data: import_node_buffer14.Buffer.from(input.exchangeHash),
    publicKey,
    signature: import_node_buffer14.Buffer.from(signatureBytes),
    signatureAlgorithm
  });
  if (!verified) {
    throw new ProtocolError({
      details: { signatureAlgorithm },
      message: "SSH host key signature verification failed",
      protocol: "sftp",
      retryable: false
    });
  }
  const hostKeySha256 = (0, import_node_crypto7.createHash)("sha256").update(input.hostKeyBlob).digest();
  return { algorithmName, hostKeySha256 };
}
function parseHostKey(blob) {
  const reader = new SshDataReader(blob);
  const algorithmName = reader.readString().toString("ascii");
  switch (algorithmName) {
    case "ssh-ed25519": {
      const raw = reader.readString();
      reader.assertFinished();
      if (raw.length !== ED25519_RAW_KEY_LENGTH2) {
        throw new ProtocolError({
          details: { actualLength: raw.length, expectedLength: ED25519_RAW_KEY_LENGTH2 },
          message: "Ed25519 host key has invalid length",
          protocol: "sftp",
          retryable: false
        });
      }
      const spki = import_node_buffer14.Buffer.concat([ED25519_SPKI_PREFIX, raw]);
      return {
        algorithmName,
        publicKey: (0, import_node_crypto7.createPublicKey)({ format: "der", key: spki, type: "spki" })
      };
    }
    case "rsa-sha2-256":
    case "rsa-sha2-512":
    case "ssh-rsa": {
      const e = reader.readMpint();
      const n = reader.readMpint();
      reader.assertFinished();
      return {
        algorithmName,
        publicKey: rsaPublicKeyFromComponents(e, n)
      };
    }
    case "ecdsa-sha2-nistp256":
    case "ecdsa-sha2-nistp384":
    case "ecdsa-sha2-nistp521": {
      const curveIdentifier = reader.readString().toString("ascii");
      const expectedIdentifier = algorithmName.slice("ecdsa-sha2-".length);
      if (curveIdentifier !== expectedIdentifier) {
        throw new ProtocolError({
          details: { algorithmName, curveIdentifier },
          message: "ECDSA host key curve identifier does not match algorithm",
          protocol: "sftp",
          retryable: false
        });
      }
      const point = reader.readString();
      reader.assertFinished();
      return {
        algorithmName,
        publicKey: ecdsaPublicKeyFromPoint(curveIdentifier, point)
      };
    }
    default:
      throw new ProtocolError({
        details: { algorithmName },
        message: "Unsupported SSH host key algorithm",
        protocol: "sftp",
        retryable: false
      });
  }
}
function parseSignatureBlob(blob) {
  const reader = new SshDataReader(blob);
  const signatureAlgorithm = reader.readString().toString("ascii");
  const signatureBytes = reader.readString();
  return { signatureAlgorithm, signatureBytes };
}
function isCompatibleSignatureAlgorithm(hostKeyAlgorithm, signatureAlgorithm) {
  if (hostKeyAlgorithm === signatureAlgorithm) return true;
  if (hostKeyAlgorithm === "ssh-rsa") {
    return signatureAlgorithm === "rsa-sha2-256" || signatureAlgorithm === "rsa-sha2-512";
  }
  return false;
}
function verifySignature(input) {
  switch (input.signatureAlgorithm) {
    case "ssh-ed25519":
      return (0, import_node_crypto7.verify)(null, input.data, input.publicKey, input.signature);
    case "rsa-sha2-256":
      return (0, import_node_crypto7.verify)("sha256", input.data, input.publicKey, input.signature);
    case "rsa-sha2-512":
      return (0, import_node_crypto7.verify)("sha512", input.data, input.publicKey, input.signature);
    case "ecdsa-sha2-nistp256":
      return (0, import_node_crypto7.verify)(
        "sha256",
        input.data,
        input.publicKey,
        sshEcdsaSignatureToDer(input.signature)
      );
    case "ecdsa-sha2-nistp384":
      return (0, import_node_crypto7.verify)(
        "sha384",
        input.data,
        input.publicKey,
        sshEcdsaSignatureToDer(input.signature)
      );
    case "ecdsa-sha2-nistp521":
      return (0, import_node_crypto7.verify)(
        "sha512",
        input.data,
        input.publicKey,
        sshEcdsaSignatureToDer(input.signature)
      );
    case "ssh-rsa":
      throw new ProtocolError({
        message: "Legacy ssh-rsa (SHA-1) host key signatures are not accepted",
        protocol: "sftp",
        retryable: false
      });
    default:
      throw new ProtocolError({
        details: { signatureAlgorithm: input.signatureAlgorithm },
        message: "Unsupported SSH host key signature algorithm",
        protocol: "sftp",
        retryable: false
      });
  }
}
function rsaPublicKeyFromComponents(e, n) {
  const eDer = encodeAsn1Integer(e);
  const nDer = encodeAsn1Integer(n);
  const rsaPublicKeyDer = encodeAsn1Sequence(import_node_buffer14.Buffer.concat([nDer, eDer]));
  const bitStringContent = import_node_buffer14.Buffer.concat([import_node_buffer14.Buffer.from([0]), rsaPublicKeyDer]);
  const bitString = import_node_buffer14.Buffer.concat([
    import_node_buffer14.Buffer.from([3]),
    encodeAsn1Length(bitStringContent.length),
    bitStringContent
  ]);
  const algoId = import_node_buffer14.Buffer.from("300d06092a864886f70d010101 0500".replace(/\s+/g, ""), "hex");
  const spki = encodeAsn1Sequence(import_node_buffer14.Buffer.concat([algoId, bitString]));
  return (0, import_node_crypto7.createPublicKey)({ format: "der", key: spki, type: "spki" });
}
function encodeAsn1Integer(value) {
  let body = value;
  while (body.length > 1 && body[0] === 0) body = body.subarray(1);
  if (body.length > 0 && (body[0] & 128) !== 0) {
    body = import_node_buffer14.Buffer.concat([import_node_buffer14.Buffer.from([0]), body]);
  }
  return import_node_buffer14.Buffer.concat([import_node_buffer14.Buffer.from([2]), encodeAsn1Length(body.length), body]);
}
function encodeAsn1Sequence(content) {
  return import_node_buffer14.Buffer.concat([import_node_buffer14.Buffer.from([48]), encodeAsn1Length(content.length), content]);
}
function encodeAsn1Length(length) {
  if (length < 128) return import_node_buffer14.Buffer.from([length]);
  const bytes = [];
  let n = length;
  while (n > 0) {
    bytes.unshift(n & 255);
    n >>>= 8;
  }
  return import_node_buffer14.Buffer.from([128 | bytes.length, ...bytes]);
}
var ECDSA_OID_BY_CURVE = {
  nistp256: "06082a8648ce3d030107",
  // secp256r1 / prime256v1
  nistp384: "06052b81040022",
  // secp384r1
  nistp521: "06052b81040023"
  // secp521r1
};
var ECDSA_ALGORITHM_OID_HEX = "06072a8648ce3d0201";
function ecdsaPublicKeyFromPoint(curveIdentifier, point) {
  const oidHex = ECDSA_OID_BY_CURVE[curveIdentifier];
  if (oidHex === void 0) {
    throw new ProtocolError({
      details: { curveIdentifier },
      message: "Unsupported ECDSA curve",
      protocol: "sftp",
      retryable: false
    });
  }
  const algoIdContent = import_node_buffer14.Buffer.from(ECDSA_ALGORITHM_OID_HEX + oidHex, "hex");
  const algoId = encodeAsn1Sequence(algoIdContent);
  const bitStringContent = import_node_buffer14.Buffer.concat([import_node_buffer14.Buffer.from([0]), point]);
  const bitString = import_node_buffer14.Buffer.concat([
    import_node_buffer14.Buffer.from([3]),
    encodeAsn1Length(bitStringContent.length),
    bitStringContent
  ]);
  const spki = encodeAsn1Sequence(import_node_buffer14.Buffer.concat([algoId, bitString]));
  return (0, import_node_crypto7.createPublicKey)({ format: "der", key: spki, type: "spki" });
}
function sshEcdsaSignatureToDer(sshSignature) {
  const reader = new SshDataReader(sshSignature);
  const r = reader.readMpint();
  const s = reader.readMpint();
  const rDer = encodeAsn1Integer(r);
  const sDer = encodeAsn1Integer(s);
  return encodeAsn1Sequence(import_node_buffer14.Buffer.concat([rDer, sDer]));
}

// src/protocols/ssh/transport/SshTransportHandshake.ts
var SshTransportHandshake = class {
  constructor(options = {}) {
    this.options = options;
    this.clientAlgorithms = options.algorithms ?? DEFAULT_SSH_ALGORITHM_PREFERENCES;
    this.clientIdentificationLine = buildSshIdentificationLine({
      ...options.clientComments === void 0 ? {} : { comments: options.clientComments },
      softwareVersion: options.clientSoftwareVersion ?? "ZeroTransfer_Dev"
    });
    this.clientKexInitPayload = encodeSshKexInitMessage({
      algorithms: this.clientAlgorithms,
      ...options.kexCookie === void 0 ? {} : { cookie: options.kexCookie }
    });
  }
  options;
  clientAlgorithms;
  clientIdentificationLine;
  clientKexInitPayload;
  identificationLines = [];
  packetFramer = new SshTransportPacketFramer();
  pendingIdentification = new SshIdentificationAccumulator();
  phase = "awaiting-server-identification";
  inboundPacketCount = 0;
  outboundPacketCount = 0;
  pendingCurve25519;
  pendingKeyExchange;
  serverIdentification;
  /** Creates the first outbound bytes (client identification line). */
  createInitialClientBytes() {
    return import_node_buffer15.Buffer.from(`${this.clientIdentificationLine}\r
`, "ascii");
  }
  /**
   * Feeds raw server bytes into the handshake state machine.
   */
  pushServerBytes(chunk) {
    const outbound = [];
    if (this.phase === "awaiting-server-identification") {
      const scan = this.pendingIdentification.push(chunk);
      for (const banner of scan.bannerLines) {
        this.identificationLines.push(banner);
      }
      if (scan.identLine !== void 0) {
        this.serverIdentification = parseSshIdentificationLine(scan.identLine);
        this.phase = "awaiting-server-kexinit";
        outbound.push(encodeSshTransportPacket(this.clientKexInitPayload));
        this.outboundPacketCount += 1;
        if (scan.remainder.length > 0) {
          return this.pushServerBytesWithPhase(outbound, scan.remainder);
        }
      }
      return { outbound };
    }
    return this.pushServerBytesWithPhase(outbound, import_node_buffer15.Buffer.from(chunk));
  }
  getServerBannerLines() {
    return this.identificationLines;
  }
  isComplete() {
    return this.phase === "complete";
  }
  /**
   * Returns any bytes received after the last complete handshake packet and clears the buffer.
   * Call this once after `pushServerBytes` returns a result to drain bytes that belong to the
   * post-NEWKEYS encrypted phase but arrived in the same TCP segment as NEWKEYS.
   */
  takeRemainingBytes() {
    return this.packetFramer.takeRemainingBytes();
  }
  pushServerBytesWithPhase(outbound, chunk) {
    if (this.phase === "awaiting-server-identification") {
      return { outbound };
    }
    for (const packet of this.packetFramer.push(chunk)) {
      const messageType = packet.payload[0];
      this.inboundPacketCount += 1;
      if (this.phase === "awaiting-server-kexinit") {
        if (messageType !== 20) {
          throw new ProtocolError({
            details: { messageType },
            message: "Expected SSH_MSG_KEXINIT from server during initial handshake",
            protocol: "sftp",
            retryable: false
          });
        }
        const serverKexInit = decodeSshKexInitMessage(packet.payload);
        const negotiatedAlgorithms = negotiateSshAlgorithms(this.clientAlgorithms, serverKexInit);
        if (negotiatedAlgorithms.kexAlgorithm !== "curve25519-sha256" && negotiatedAlgorithms.kexAlgorithm !== "curve25519-sha256@libssh.org") {
          throw new ProtocolError({
            details: { kexAlgorithm: negotiatedAlgorithms.kexAlgorithm },
            message: "Native SSH transport currently supports only Curve25519 key exchange",
            protocol: "sftp",
            retryable: false
          });
        }
        this.pendingCurve25519 = createCurve25519Ephemeral();
        this.phase = "awaiting-server-kexreply";
        outbound.push(
          encodeSshTransportPacket(encodeSshKexEcdhInitMessage(this.pendingCurve25519.publicKey))
        );
        this.outboundPacketCount += 1;
        this.pendingKeyExchange = {
          clientIdentification: this.clientIdentificationLine,
          algorithm: negotiatedAlgorithms.kexAlgorithm,
          clientKexInitPayload: this.clientKexInitPayload,
          clientPublicKey: this.pendingCurve25519.publicKey,
          negotiatedAlgorithms,
          serverHostKey: import_node_buffer15.Buffer.alloc(0),
          serverIdentification: (this.serverIdentification ?? missingServerIdentificationError()).raw,
          serverKexInitPayload: import_node_buffer15.Buffer.from(packet.payload),
          serverPublicKey: import_node_buffer15.Buffer.alloc(0),
          serverSignature: import_node_buffer15.Buffer.alloc(0),
          sharedSecret: import_node_buffer15.Buffer.alloc(0)
        };
        continue;
      }
      if (this.phase === "awaiting-server-kexreply") {
        if (messageType !== 31) {
          throw new ProtocolError({
            details: { messageType },
            message: "Expected SSH_MSG_KEX_ECDH_REPLY from server",
            protocol: "sftp",
            retryable: false
          });
        }
        if (this.pendingCurve25519 === void 0 || this.pendingKeyExchange === void 0) {
          throw new ProtocolError({
            message: "Curve25519 client key state missing while processing server key exchange reply",
            protocol: "sftp",
            retryable: false
          });
        }
        const reply = decodeSshKexEcdhReplyMessage(packet.payload);
        const sharedSecret = this.pendingCurve25519.deriveSharedSecret(reply.serverPublicKey);
        this.pendingKeyExchange = {
          ...this.pendingKeyExchange,
          serverHostKey: reply.hostKey,
          serverPublicKey: reply.serverPublicKey,
          serverSignature: reply.signature,
          sharedSecret
        };
        this.phase = "awaiting-server-newkeys";
        outbound.push(encodeSshTransportPacket(encodeSshNewKeysMessage()));
        this.outboundPacketCount += 1;
        continue;
      }
      if (this.phase === "awaiting-server-newkeys") {
        decodeSshNewKeysMessage(packet.payload);
        const keyExchange = this.pendingKeyExchange ?? missingPendingKeyExchangeError();
        const derivedKeys = deriveSshSessionKeys({
          clientIdentification: keyExchange.clientIdentification,
          clientKexInitPayload: keyExchange.clientKexInitPayload,
          clientPublicKey: keyExchange.clientPublicKey,
          kexAlgorithm: keyExchange.algorithm,
          negotiatedAlgorithms: keyExchange.negotiatedAlgorithms,
          serverHostKey: keyExchange.serverHostKey,
          serverIdentification: keyExchange.serverIdentification,
          serverKexInitPayload: keyExchange.serverKexInitPayload,
          serverPublicKey: keyExchange.serverPublicKey,
          sharedSecret: keyExchange.sharedSecret
        });
        const hostKeyVerification = verifySshHostKeySignature({
          exchangeHash: derivedKeys.exchangeHash,
          hostKeyBlob: keyExchange.serverHostKey,
          signatureBlob: keyExchange.serverSignature
        });
        const verifyHook = this.options.verifyHostKey;
        if (verifyHook !== void 0) {
          const maybe = verifyHook({
            algorithmName: hostKeyVerification.algorithmName,
            hostKeyBlob: keyExchange.serverHostKey,
            hostKeySha256: hostKeyVerification.hostKeySha256
          });
          if (maybe instanceof Promise) {
            throw new ProtocolError({
              message: "verifyHostKey must be synchronous; perform any async lookups before calling connect()",
              protocol: "sftp",
              retryable: false
            });
          }
        }
        const serverKexInit = decodeSshKexInitMessage(keyExchange.serverKexInitPayload);
        const result = {
          keyExchange: {
            algorithm: keyExchange.algorithm,
            clientKexInitPayload: keyExchange.clientKexInitPayload,
            clientPublicKey: keyExchange.clientPublicKey,
            exchangeHash: derivedKeys.exchangeHash,
            serverHostKey: keyExchange.serverHostKey,
            serverKexInitPayload: keyExchange.serverKexInitPayload,
            serverPublicKey: keyExchange.serverPublicKey,
            serverSignature: keyExchange.serverSignature,
            sessionId: derivedKeys.sessionId,
            sharedSecret: keyExchange.sharedSecret,
            transportKeys: {
              clientToServer: derivedKeys.clientToServer,
              serverToClient: derivedKeys.serverToClient
            }
          },
          negotiatedAlgorithms: keyExchange.negotiatedAlgorithms,
          serverIdentification: this.serverIdentification ?? missingServerIdentificationError(),
          serverKexInit,
          inboundPacketCount: this.inboundPacketCount,
          outboundPacketCount: this.outboundPacketCount
        };
        this.phase = "complete";
        this.pendingCurve25519 = void 0;
        this.pendingKeyExchange = void 0;
        return { outbound, result };
      }
      throw new ProtocolError({
        details: { phase: this.phase },
        message: "SSH transport handshake received unexpected packets after completion",
        protocol: "sftp",
        retryable: false
      });
    }
    return { outbound };
  }
};
var SshIdentificationAccumulator = class {
  pending = import_node_buffer15.Buffer.alloc(0);
  push(chunk) {
    this.pending = import_node_buffer15.Buffer.concat([this.pending, import_node_buffer15.Buffer.from(chunk)]);
    const bannerLines = [];
    while (true) {
      const lfIndex = this.pending.indexOf(10);
      if (lfIndex < 0) break;
      const lineText = trimLineEndings(this.pending.subarray(0, lfIndex + 1).toString("ascii"));
      const remainder = import_node_buffer15.Buffer.from(this.pending.subarray(lfIndex + 1));
      this.pending = remainder;
      if (lineText.startsWith("SSH-")) {
        this.pending = import_node_buffer15.Buffer.alloc(0);
        return { bannerLines, identLine: lineText, remainder };
      }
      bannerLines.push(lineText);
    }
    return { bannerLines, remainder: import_node_buffer15.Buffer.alloc(0) };
  }
};
function trimLineEndings(value) {
  if (value.endsWith("\r\n")) {
    return value.slice(0, -2);
  }
  if (value.endsWith("\n")) {
    return value.slice(0, -1);
  }
  return value;
}
function missingServerIdentificationError() {
  throw new ParseError({
    message: "Missing server SSH identification while negotiating KEXINIT",
    protocol: "sftp",
    retryable: false
  });
}
function missingPendingKeyExchangeError() {
  throw new ProtocolError({
    message: "SSH transport key exchange state was not initialized",
    protocol: "sftp",
    retryable: false
  });
}

// src/protocols/ssh/transport/SshTransportProtection.ts
var import_node_buffer16 = require("buffer");
var import_node_crypto8 = require("crypto");
function createSshTransportProtectionContext(input) {
  return {
    inbound: new SshTransportPacketUnprotector({
      encryptionAlgorithm: input.negotiatedAlgorithms.encryptionServerToClient,
      initialSequence: input.initialInboundSequence ?? 0,
      macAlgorithm: input.negotiatedAlgorithms.macServerToClient,
      keys: input.keys.serverToClient
    }),
    outbound: new SshTransportPacketProtector({
      deterministicPadding: input.deterministicPadding ?? false,
      encryptionAlgorithm: input.negotiatedAlgorithms.encryptionClientToServer,
      initialSequence: input.initialOutboundSequence ?? 0,
      macAlgorithm: input.negotiatedAlgorithms.macClientToServer,
      keys: input.keys.clientToServer
    })
  };
}
var SshTransportPacketProtector = class {
  constructor(options) {
    this.options = options;
    this.encryptionAlgorithm = options.encryptionAlgorithm;
    this.macAlgorithm = options.macAlgorithm;
    this.sequenceNumber = options.initialSequence >>> 0;
    this.blockLength = resolveBlockLength(options.encryptionAlgorithm);
    this.macLength = resolveMacLength(options.encryptionAlgorithm, options.macAlgorithm);
    this.cipher = createCipher(
      options.encryptionAlgorithm,
      options.keys.encryptionKey,
      options.keys.iv
    );
  }
  options;
  blockLength;
  cipher;
  encryptionAlgorithm;
  macAlgorithm;
  macLength;
  sequenceNumber;
  getSequenceNumber() {
    return this.sequenceNumber;
  }
  protectPayload(payload) {
    const clearPacket = encodeSshTransportPacket(payload, {
      blockSize: this.blockLength,
      randomPadding: !this.options.deterministicPadding
    });
    const mac = computeMac(
      this.macAlgorithm,
      this.options.keys.macKey,
      this.sequenceNumber,
      clearPacket,
      this.macLength
    );
    const encrypted = this.cipher === void 0 ? clearPacket : this.cipher.update(clearPacket);
    this.sequenceNumber = this.sequenceNumber + 1 >>> 0;
    return import_node_buffer16.Buffer.concat([encrypted, mac]);
  }
};
var SshTransportPacketUnprotector = class {
  constructor(options) {
    this.options = options;
    this.encryptionAlgorithm = options.encryptionAlgorithm;
    this.macAlgorithm = options.macAlgorithm;
    this.sequenceNumber = options.initialSequence >>> 0;
    this.blockLength = resolveBlockLength(options.encryptionAlgorithm);
    this.macLength = resolveMacLength(options.encryptionAlgorithm, options.macAlgorithm);
    this.decipher = createDecipher(
      options.encryptionAlgorithm,
      options.keys.encryptionKey,
      options.keys.iv
    );
  }
  options;
  blockLength;
  decipher;
  encryptionAlgorithm;
  macAlgorithm;
  macLength;
  sequenceNumber;
  // Streaming framing state for pushBytes()
  framePartialDecrypted;
  framePendingRaw = import_node_buffer16.Buffer.alloc(0);
  frameRemainingNeeded;
  getSequenceNumber() {
    return this.sequenceNumber;
  }
  /**
   * Feeds raw encrypted bytes from the socket and returns any fully decoded payloads.
   * Maintains internal framing state across calls — pass each `data` event chunk directly.
   */
  pushBytes(chunk) {
    this.framePendingRaw = import_node_buffer16.Buffer.concat([this.framePendingRaw, chunk]);
    const results = [];
    while (true) {
      if (this.framePartialDecrypted === void 0) {
        if (this.framePendingRaw.length < this.blockLength) break;
        const firstBlock = this.framePendingRaw.subarray(0, this.blockLength);
        this.framePendingRaw = import_node_buffer16.Buffer.from(this.framePendingRaw.subarray(this.blockLength));
        this.framePartialDecrypted = this.decipher ? import_node_buffer16.Buffer.from(this.decipher.update(firstBlock)) : import_node_buffer16.Buffer.from(firstBlock);
        const packetLength = this.framePartialDecrypted.readUInt32BE(0);
        const remaining = 4 + packetLength - this.blockLength + this.macLength;
        if (remaining < 0) {
          throw new ProtocolError({
            details: { blockLength: this.blockLength, packetLength },
            message: "SSH encrypted packet_length is smaller than one cipher block",
            protocol: "sftp",
            retryable: false
          });
        }
        this.frameRemainingNeeded = remaining;
      }
      const needed = this.frameRemainingNeeded;
      if (this.framePendingRaw.length < needed) break;
      const encryptedRest = this.framePendingRaw.subarray(0, needed - this.macLength);
      const receivedMac = this.framePendingRaw.subarray(needed - this.macLength, needed);
      this.framePendingRaw = import_node_buffer16.Buffer.from(this.framePendingRaw.subarray(needed));
      const decryptedRest = encryptedRest.length > 0 ? this.decipher ? import_node_buffer16.Buffer.from(this.decipher.update(encryptedRest)) : import_node_buffer16.Buffer.from(encryptedRest) : import_node_buffer16.Buffer.alloc(0);
      const clearPacket = import_node_buffer16.Buffer.concat([this.framePartialDecrypted, decryptedRest]);
      const expectedMac = computeMac(
        this.macAlgorithm,
        this.options.keys.macKey,
        this.sequenceNumber,
        clearPacket,
        this.macLength
      );
      if (!(0, import_node_crypto8.timingSafeEqual)(receivedMac, expectedMac)) {
        throw new ProtocolError({
          message: "SSH packet MAC verification failed",
          protocol: "sftp",
          retryable: false
        });
      }
      this.sequenceNumber = this.sequenceNumber + 1 >>> 0;
      results.push(decodeSshTransportPacket(clearPacket).payload);
      this.framePartialDecrypted = void 0;
      this.frameRemainingNeeded = void 0;
    }
    return results;
  }
  unprotectPayload(packet) {
    const frame = import_node_buffer16.Buffer.from(packet);
    if (frame.length < this.macLength) {
      throw new ProtocolError({
        details: { length: frame.length, macLength: this.macLength },
        message: "SSH packet is shorter than its expected MAC length",
        protocol: "sftp",
        retryable: false
      });
    }
    const macOffset = frame.length - this.macLength;
    const encryptedPacket = frame.subarray(0, macOffset);
    const receivedMac = frame.subarray(macOffset);
    const clearPacket = this.decipher === void 0 ? encryptedPacket : this.decipher.update(encryptedPacket);
    const expectedMac = computeMac(
      this.macAlgorithm,
      this.options.keys.macKey,
      this.sequenceNumber,
      clearPacket,
      this.macLength
    );
    if (!(0, import_node_crypto8.timingSafeEqual)(receivedMac, expectedMac)) {
      throw new ProtocolError({
        message: "SSH packet MAC verification failed",
        protocol: "sftp",
        retryable: false
      });
    }
    this.sequenceNumber = this.sequenceNumber + 1 >>> 0;
    return decodeSshTransportPacket(clearPacket).payload;
  }
};
function createCipher(algorithm, key, iv) {
  if (algorithm === "none") {
    return void 0;
  }
  validateCipherMaterial(algorithm, key, iv);
  const cipher = (0, import_node_crypto8.createCipheriv)(toOpenSslCipherName(algorithm), key, iv);
  cipher.setAutoPadding(false);
  return cipher;
}
function createDecipher(algorithm, key, iv) {
  if (algorithm === "none") {
    return void 0;
  }
  validateCipherMaterial(algorithm, key, iv);
  const decipher = (0, import_node_crypto8.createDecipheriv)(toOpenSslCipherName(algorithm), key, iv);
  decipher.setAutoPadding(false);
  return decipher;
}
function toOpenSslCipherName(algorithm) {
  switch (algorithm) {
    case "aes128-ctr":
      return "aes-128-ctr";
    case "aes256-ctr":
      return "aes-256-ctr";
    default:
      return algorithm;
  }
}
function validateCipherMaterial(algorithm, key, iv) {
  const expectedKeyLength = resolveCipherKeyLength(algorithm);
  const expectedIvLength = resolveCipherIvLength(algorithm);
  if (key.length !== expectedKeyLength || iv.length !== expectedIvLength) {
    throw new ProtocolError({
      details: {
        algorithm,
        ivLength: iv.length,
        keyLength: key.length
      },
      message: "SSH cipher key material does not match algorithm requirements",
      protocol: "sftp",
      retryable: false
    });
  }
}
function resolveCipherKeyLength(algorithm) {
  switch (algorithm) {
    case "aes128-ctr":
      return 16;
    case "aes256-ctr":
      return 32;
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH cipher algorithm for transport protection",
        protocol: "sftp",
        retryable: false
      });
  }
}
function resolveCipherIvLength(algorithm) {
  switch (algorithm) {
    case "aes128-ctr":
    case "aes256-ctr":
      return 16;
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH cipher IV length for transport protection",
        protocol: "sftp",
        retryable: false
      });
  }
}
function resolveBlockLength(algorithm) {
  switch (algorithm) {
    case "aes128-ctr":
    case "aes256-ctr":
      return 16;
    case "none":
      return 8;
    // RFC 4253 §6.1: minimum block size for framing with no cipher
    default:
      throw new ProtocolError({
        details: { algorithm },
        message: "Unsupported SSH cipher block length for transport protection",
        protocol: "sftp",
        retryable: false
      });
  }
}
function resolveMacLength(encryptionAlgorithm, macAlgorithm) {
  if (encryptionAlgorithm === "none") {
    return 0;
  }
  switch (macAlgorithm) {
    case "hmac-sha2-256":
      return 32;
    case "hmac-sha2-512":
      return 64;
    default:
      throw new ProtocolError({
        details: { macAlgorithm },
        message: "Unsupported SSH MAC algorithm for transport protection",
        protocol: "sftp",
        retryable: false
      });
  }
}
function computeMac(macAlgorithm, macKey, sequence, packet, macLength) {
  if (macLength === 0) {
    return import_node_buffer16.Buffer.alloc(0);
  }
  const hashName = macAlgorithm === "hmac-sha2-512" ? "sha512" : "sha256";
  const sequenceBuffer = import_node_buffer16.Buffer.allocUnsafe(4);
  sequenceBuffer.writeUInt32BE(sequence >>> 0, 0);
  return (0, import_node_crypto8.createHmac)(hashName, macKey).update(sequenceBuffer).update(packet).digest().subarray(0, macLength);
}

// src/protocols/ssh/transport/SshTransportConnection.ts
var SshDisconnectReason = {
  HOST_NOT_ALLOWED_TO_CONNECT: 1,
  PROTOCOL_ERROR: 2,
  KEY_EXCHANGE_FAILED: 3,
  MAC_ERROR: 5,
  COMPRESSION_ERROR: 6,
  SERVICE_NOT_AVAILABLE: 7,
  PROTOCOL_VERSION_NOT_SUPPORTED: 8,
  HOST_KEY_NOT_VERIFIABLE: 9,
  CONNECTION_LOST: 10,
  BY_APPLICATION: 11,
  TOO_MANY_CONNECTIONS: 12,
  AUTH_CANCELLED_BY_USER: 13,
  NO_MORE_AUTH_METHODS: 14,
  ILLEGAL_USER_NAME: 15
};
var MSG_DISCONNECT = 1;
var MSG_IGNORE = 2;
var MSG_DEBUG = 4;
var SshTransportConnection = class {
  constructor(options = {}) {
    this.options = options;
  }
  options;
  connected = false;
  disposed = false;
  protector;
  unprotector;
  socket;
  keepaliveTimer;
  inboundQueue = [];
  /**
   * FIFO of waiters when the queue is empty. Multiple iterators may suspend on
   * the same transport (auth session, channel setup, connection-manager pump);
   * each receives exactly one entry in arrival order. A single-slot field would
   * lose wakeups when a second consumer suspends before the first is resolved.
   */
  waitingConsumers = [];
  /**
   * Runs the SSH handshake on a TCP-connected socket.
   * Resolves when NEWKEYS completes and the transport is ready for encrypted messages.
   * Rejects on socket error, abort, or protocol failure.
   */
  connect(socket) {
    if (this.connected || this.socket !== void 0) {
      throw new ProtocolError({
        message: "SshTransportConnection.connect() called more than once",
        protocol: "sftp",
        retryable: false
      });
    }
    this.socket = socket;
    const handshake = new SshTransportHandshake({
      ...this.options.algorithms === void 0 ? {} : { algorithms: this.options.algorithms },
      ...this.options.clientSoftwareVersion === void 0 ? {} : { clientSoftwareVersion: this.options.clientSoftwareVersion },
      ...this.options.verifyHostKey === void 0 ? {} : { verifyHostKey: this.options.verifyHostKey }
    });
    return new Promise((resolve, reject) => {
      const { abortSignal, handshakeTimeoutMs } = this.options;
      let timeoutHandle;
      const onError = (err) => {
        cleanup();
        reject(
          new ConnectionError({
            message: `SSH socket error during handshake: ${err.message}`,
            protocol: "sftp",
            retryable: false
          })
        );
      };
      const onClose = () => {
        cleanup();
        reject(
          new ConnectionError({
            message: "SSH socket closed before handshake completed",
            protocol: "sftp",
            retryable: false
          })
        );
      };
      const onAbort = () => {
        cleanup();
        socket.destroy();
        reject(
          new ConnectionError({
            message: "SSH connection aborted before handshake completed",
            protocol: "sftp",
            retryable: false
          })
        );
      };
      const onTimeout = () => {
        cleanup();
        socket.destroy();
        reject(
          new TimeoutError({
            details: { handshakeTimeoutMs },
            message: `SSH handshake did not complete within ${handshakeTimeoutMs}ms`,
            protocol: "sftp",
            retryable: true
          })
        );
      };
      function cleanup() {
        if (timeoutHandle !== void 0) {
          clearTimeout(timeoutHandle);
          timeoutHandle = void 0;
        }
        abortSignal?.removeEventListener("abort", onAbort);
        socket.off("error", onError);
        socket.off("close", onClose);
      }
      if (abortSignal?.aborted) {
        socket.destroy();
        reject(
          new ConnectionError({
            message: "SSH connection aborted before handshake completed",
            protocol: "sftp",
            retryable: false
          })
        );
        return;
      }
      abortSignal?.addEventListener("abort", onAbort, { once: true });
      socket.on("error", onError);
      socket.on("close", onClose);
      if (handshakeTimeoutMs !== void 0 && handshakeTimeoutMs > 0) {
        timeoutHandle = setTimeout(onTimeout, handshakeTimeoutMs);
      }
      const handshakeDataHandler = (chunk) => {
        let handshakeResult;
        try {
          const { outbound, result } = handshake.pushServerBytes(chunk);
          for (const outbuf of outbound) {
            socket.write(outbuf);
          }
          handshakeResult = result;
        } catch (err) {
          cleanup();
          socket.off("data", handshakeDataHandler);
          socket.destroy();
          reject(
            err instanceof Error ? err : new ProtocolError({
              message: "SSH handshake failed",
              protocol: "sftp",
              retryable: false
            })
          );
          return;
        }
        if (handshakeResult !== void 0) {
          cleanup();
          socket.off("data", handshakeDataHandler);
          let protection;
          try {
            protection = createSshTransportProtectionContext({
              keys: {
                clientToServer: handshakeResult.keyExchange.transportKeys.clientToServer,
                serverToClient: handshakeResult.keyExchange.transportKeys.serverToClient
              },
              negotiatedAlgorithms: handshakeResult.negotiatedAlgorithms,
              // RFC 4253 §6.4: sequence numbers are never reset across NEWKEYS;
              // they continue counting from the unencrypted handshake packets.
              initialInboundSequence: handshakeResult.inboundPacketCount,
              initialOutboundSequence: handshakeResult.outboundPacketCount
            });
          } catch (err) {
            socket.destroy();
            reject(
              err instanceof Error ? err : new ProtocolError({
                message: "SSH transport protection context creation failed",
                protocol: "sftp",
                retryable: false
              })
            );
            return;
          }
          this.protector = protection.outbound;
          this.unprotector = protection.inbound;
          this.connected = true;
          socket.on("data", this.onEncryptedData.bind(this));
          socket.on("error", this.onSocketError.bind(this));
          socket.on("close", this.onSocketClose.bind(this));
          this.startKeepalive();
          const leftover = handshake.takeRemainingBytes();
          if (leftover.length > 0) {
            this.onEncryptedData(leftover);
          }
          resolve(handshakeResult);
        }
      };
      socket.write(handshake.createInitialClientBytes());
      socket.on("data", handshakeDataHandler);
    });
  }
  /**
   * Sends an SSH payload over the encrypted transport.
   * The payload must start with the SSH message type byte.
   */
  sendPayload(payload) {
    this.assertConnected();
    const frame = this.protector.protectPayload(import_node_buffer17.Buffer.from(payload));
    this.socket.write(frame);
    this.resetKeepaliveTimer();
  }
  /**
   * Async generator that yields inbound SSH payloads (post-NEWKEYS).
   *
   * Transparent handling:
   * - SSH_MSG_IGNORE (2) and SSH_MSG_DEBUG (4) are silently dropped.
   * - SSH_MSG_DISCONNECT (1) from the server throws a `ConnectionError`.
   * - Socket error or close terminates the generator.
   */
  async *receivePayloads() {
    this.assertConnected();
    while (true) {
      const entry = await this.dequeuePayload();
      if (entry.type === "end") return;
      if (entry.type === "error") throw entry.error;
      yield entry.payload;
    }
  }
  /**
   * Sends SSH_MSG_DISCONNECT and ends the socket.
   * Safe to call multiple times; subsequent calls are no-ops.
   */
  disconnect(reason = SshDisconnectReason.BY_APPLICATION, description = "") {
    if (this.disposed || this.socket === void 0) return;
    this.disposed = true;
    this.stopKeepalive();
    if (this.connected && this.protector !== void 0) {
      try {
        const payload = new SshDataWriter().writeByte(MSG_DISCONNECT).writeUint32(reason).writeString(description, "utf8").writeString("", "utf8").toBuffer();
        this.socket.write(this.protector.protectPayload(payload));
      } catch {
      }
    }
    this.socket.end();
    this.enqueueEntry({ type: "end" });
  }
  isConnected() {
    return this.connected && !this.disposed;
  }
  onEncryptedData(chunk) {
    try {
      const payloads = this.unprotector.pushBytes(chunk);
      for (const payload of payloads) {
        const msgType = payload[0];
        if (msgType === MSG_IGNORE || msgType === MSG_DEBUG) continue;
        if (msgType === MSG_DISCONNECT) {
          this.enqueueEntry({ type: "error", error: parseDisconnectPayload(payload) });
          this.socket?.destroy();
          return;
        }
        this.enqueueEntry({ type: "payload", payload });
      }
    } catch (err) {
      this.enqueueEntry({
        type: "error",
        error: err instanceof Error ? err : new ProtocolError({
          message: "SSH encrypted data processing error",
          protocol: "sftp",
          retryable: false
        })
      });
      this.socket?.destroy();
    }
  }
  onSocketError(err) {
    this.stopKeepalive();
    if (!this.disposed) {
      this.enqueueEntry({
        type: "error",
        error: new ConnectionError({
          message: `SSH socket error: ${err.message}`,
          protocol: "sftp",
          retryable: false
        })
      });
    }
  }
  onSocketClose() {
    this.stopKeepalive();
    if (!this.disposed) {
      this.enqueueEntry({ type: "end" });
    }
  }
  enqueueEntry(entry) {
    if (this.waitingConsumers.length > 0) {
      const resolve = this.waitingConsumers.shift();
      resolve(entry);
    } else {
      this.inboundQueue.push(entry);
    }
  }
  dequeuePayload() {
    if (this.inboundQueue.length > 0) {
      return Promise.resolve(this.inboundQueue.shift());
    }
    return new Promise((resolve) => {
      this.waitingConsumers.push(resolve);
    });
  }
  assertConnected() {
    if (!this.connected) {
      throw new ProtocolError({
        message: "SshTransportConnection is not yet connected \u2014 call connect() first",
        protocol: "sftp",
        retryable: false
      });
    }
  }
  startKeepalive() {
    const intervalMs = this.options.keepaliveIntervalMs;
    if (intervalMs === void 0 || intervalMs <= 0) return;
    this.keepaliveTimer = setInterval(() => this.sendKeepalivePing(), intervalMs);
    this.keepaliveTimer.unref?.();
  }
  stopKeepalive() {
    if (this.keepaliveTimer !== void 0) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = void 0;
    }
  }
  resetKeepaliveTimer() {
    if (this.keepaliveTimer === void 0) return;
    this.stopKeepalive();
    this.startKeepalive();
  }
  sendKeepalivePing() {
    if (!this.connected || this.disposed || this.protector === void 0) return;
    try {
      const payload = new SshDataWriter().writeByte(MSG_IGNORE).writeString("", "utf8").toBuffer();
      this.socket.write(this.protector.protectPayload(payload));
    } catch {
    }
  }
};
function parseDisconnectPayload(payload) {
  try {
    const reader = new SshDataReader(payload.subarray(1));
    const reasonCode = reader.readUint32();
    const description = reader.readString().toString("utf8");
    return new ConnectionError({
      details: { reasonCode },
      message: `SSH_MSG_DISCONNECT: ${description.length > 0 ? description : "connection closed by server"} (code ${reasonCode})`,
      protocol: "sftp",
      retryable: false
    });
  } catch {
    return new ConnectionError({
      message: "SSH_MSG_DISCONNECT received from server",
      protocol: "sftp",
      retryable: false
    });
  }
}

// src/protocols/sftp/v3/SftpSession.ts
var import_node_buffer19 = require("buffer");

// src/protocols/sftp/v3/SftpAttributes.ts
var SFTP_ATTR_FLAG = {
  SIZE: 1,
  UIDGID: 2,
  PERMISSIONS: 4,
  ACMODTIME: 8,
  EXTENDED: 2147483648
};
function encodeSftpAttributes(attrs) {
  let flags = 0;
  if (attrs.size !== void 0) flags |= SFTP_ATTR_FLAG.SIZE;
  if (attrs.uid !== void 0 || attrs.gid !== void 0) flags |= SFTP_ATTR_FLAG.UIDGID;
  if (attrs.permissions !== void 0) flags |= SFTP_ATTR_FLAG.PERMISSIONS;
  if (attrs.atime !== void 0 || attrs.mtime !== void 0) flags |= SFTP_ATTR_FLAG.ACMODTIME;
  if (attrs.extended !== void 0 && attrs.extended.length > 0) flags |= SFTP_ATTR_FLAG.EXTENDED;
  const writer = new SshDataWriter().writeUint32(flags >>> 0);
  if (flags & SFTP_ATTR_FLAG.SIZE) {
    writer.writeUint64(attrs.size);
  }
  if (flags & SFTP_ATTR_FLAG.UIDGID) {
    writer.writeUint32(attrs.uid ?? 0);
    writer.writeUint32(attrs.gid ?? 0);
  }
  if (flags & SFTP_ATTR_FLAG.PERMISSIONS) {
    writer.writeUint32(attrs.permissions);
  }
  if (flags & SFTP_ATTR_FLAG.ACMODTIME) {
    writer.writeUint32(attrs.atime ?? 0);
    writer.writeUint32(attrs.mtime ?? 0);
  }
  if (flags & SFTP_ATTR_FLAG.EXTENDED) {
    const ext = attrs.extended;
    writer.writeUint32(ext.length);
    for (const { type, data } of ext) {
      writer.writeString(type, "utf8");
      writer.writeString(data);
    }
  }
  return writer.toBuffer();
}
function decodeSftpAttributesFromReader(reader) {
  const flags = reader.readUint32();
  const attrs = {};
  if (flags & SFTP_ATTR_FLAG.SIZE) {
    attrs.size = reader.readUint64();
  }
  if (flags & SFTP_ATTR_FLAG.UIDGID) {
    attrs.uid = reader.readUint32();
    attrs.gid = reader.readUint32();
  }
  if (flags & SFTP_ATTR_FLAG.PERMISSIONS) {
    attrs.permissions = reader.readUint32();
  }
  if (flags & SFTP_ATTR_FLAG.ACMODTIME) {
    attrs.atime = reader.readUint32();
    attrs.mtime = reader.readUint32();
  }
  if (flags & SFTP_ATTR_FLAG.EXTENDED) {
    const count = reader.readUint32();
    const extended = [];
    for (let i = 0; i < count; i++) {
      const type = reader.readString().toString("utf8");
      const data = reader.readString();
      extended.push({ data, type });
    }
    attrs.extended = extended;
  }
  return attrs;
}

// src/protocols/sftp/v3/SftpPacket.ts
var import_node_buffer18 = require("buffer");
var SFTP_PACKET_TYPE = {
  ATTRS: 105,
  CLOSE: 4,
  DATA: 103,
  EXTENDED: 200,
  EXTENDED_REPLY: 201,
  FSETSTAT: 10,
  FSTAT: 8,
  HANDLE: 102,
  INIT: 1,
  LSTAT: 7,
  MKDIR: 14,
  NAME: 104,
  OPEN: 3,
  OPENDIR: 11,
  READ: 5,
  READDIR: 12,
  READLINK: 19,
  REALPATH: 16,
  REMOVE: 13,
  RENAME: 18,
  RMDIR: 15,
  SETSTAT: 9,
  STAT: 17,
  STATUS: 101,
  SYMLINK: 20,
  VERSION: 2,
  WRITE: 6
};
function decodeSftpPacket(frame) {
  const bytes = import_node_buffer18.Buffer.from(frame);
  if (bytes.length < 5) {
    throw new ParseError({
      details: { length: bytes.length },
      message: "SFTP frame must be at least 5 bytes",
      retryable: false
    });
  }
  const expectedLength = bytes.readUInt32BE(0);
  const actualLength = bytes.length - 4;
  if (expectedLength !== actualLength) {
    throw new ParseError({
      details: { actualLength, expectedLength },
      message: "SFTP frame length prefix does not match packet size",
      retryable: false
    });
  }
  return {
    payload: bytes.subarray(5),
    type: bytes.readUInt8(4)
  };
}
var SftpPacketFramer = class {
  pending = import_node_buffer18.Buffer.alloc(0);
  push(chunk) {
    this.pending = import_node_buffer18.Buffer.concat([this.pending, import_node_buffer18.Buffer.from(chunk)]);
    const packets = [];
    while (this.pending.length >= 4) {
      const bodyLength = this.pending.readUInt32BE(0);
      const frameLength = 4 + bodyLength;
      if (this.pending.length < frameLength) {
        break;
      }
      const frame = this.pending.subarray(0, frameLength);
      packets.push(decodeSftpPacket(frame));
      this.pending = this.pending.subarray(frameLength);
    }
    return packets;
  }
  getBufferedByteLength() {
    return this.pending.length;
  }
};

// src/protocols/sftp/v3/SftpMessages.ts
var SFTP_OPEN_FLAG = {
  READ: 1,
  WRITE: 2,
  APPEND: 4,
  CREAT: 8,
  TRUNC: 16,
  EXCL: 32
};
function encodeSftpInit(version) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.INIT).writeUint32(version).toBuffer();
}
function decodeSftpVersion(payload) {
  const reader = new SshDataReader(payload);
  const version = reader.readUint32();
  const extensions = [];
  while (reader.hasMore()) {
    const name = reader.readString().toString("utf8");
    const data = reader.readString().toString("utf8");
    extensions.push({ data, name });
  }
  return { extensions, version };
}
function encodeSftpOpen(args) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.OPEN).writeUint32(args.requestId).writeString(args.path, "utf8").writeUint32(args.pflags).writeBytes(encodeSftpAttributes(args.attrs)).toBuffer();
}
function encodeSftpClose(requestId, handle) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.CLOSE).writeUint32(requestId).writeString(handle).toBuffer();
}
function encodeSftpRead(args) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.READ).writeUint32(args.requestId).writeString(args.handle).writeUint64(args.offset).writeUint32(args.length).toBuffer();
}
function encodeSftpWrite(args) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.WRITE).writeUint32(args.requestId).writeString(args.handle).writeUint64(args.offset).writeString(args.data).toBuffer();
}
function encodeSftpStat(requestId, path2) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.STAT).writeUint32(requestId).writeString(path2, "utf8").toBuffer();
}
function encodeSftpLstat(requestId, path2) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.LSTAT).writeUint32(requestId).writeString(path2, "utf8").toBuffer();
}
function encodeSftpFstat(requestId, handle) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.FSTAT).writeUint32(requestId).writeString(handle).toBuffer();
}
function encodeSftpSetstat(requestId, path2, attrs) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.SETSTAT).writeUint32(requestId).writeString(path2, "utf8").writeBytes(encodeSftpAttributes(attrs)).toBuffer();
}
function encodeSftpFsetstat(requestId, handle, attrs) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.FSETSTAT).writeUint32(requestId).writeString(handle).writeBytes(encodeSftpAttributes(attrs)).toBuffer();
}
function encodeSftpOpendir(requestId, path2) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.OPENDIR).writeUint32(requestId).writeString(path2, "utf8").toBuffer();
}
function encodeSftpReaddir(requestId, handle) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.READDIR).writeUint32(requestId).writeString(handle).toBuffer();
}
function encodeSftpRemove(requestId, path2) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.REMOVE).writeUint32(requestId).writeString(path2, "utf8").toBuffer();
}
function encodeSftpMkdir(requestId, path2, attrs) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.MKDIR).writeUint32(requestId).writeString(path2, "utf8").writeBytes(encodeSftpAttributes(attrs)).toBuffer();
}
function encodeSftpRmdir(requestId, path2) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.RMDIR).writeUint32(requestId).writeString(path2, "utf8").toBuffer();
}
function encodeSftpRealpath(requestId, path2) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.REALPATH).writeUint32(requestId).writeString(path2, "utf8").toBuffer();
}
function encodeSftpRename(requestId, oldPath, newPath) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.RENAME).writeUint32(requestId).writeString(oldPath, "utf8").writeString(newPath, "utf8").toBuffer();
}
function encodeSftpReadlink(requestId, path2) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.READLINK).writeUint32(requestId).writeString(path2, "utf8").toBuffer();
}
function encodeSftpSymlink(requestId, linkPath, targetPath) {
  return new SshDataWriter().writeByte(SFTP_PACKET_TYPE.SYMLINK).writeUint32(requestId).writeString(linkPath, "utf8").writeString(targetPath, "utf8").toBuffer();
}
function decodeSftpHandlePayload(payload) {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const handle = reader.readString();
  return { handle, requestId };
}
function decodeSftpDataPayload(payload) {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const data = reader.readString();
  return { data, requestId };
}
function decodeSftpNamePayload(payload) {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const count = reader.readUint32();
  const entries = [];
  for (let i = 0; i < count; i++) {
    const filename = reader.readString().toString("utf8");
    const longname = reader.readString().toString("utf8");
    const attrs = decodeSftpAttributesFromReader(reader);
    entries.push({ attrs, filename, longname });
  }
  return { entries, requestId };
}
function decodeSftpAttrsPayload(payload) {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const attrs = decodeSftpAttributesFromReader(reader);
  return { attrs, requestId };
}

// src/protocols/sftp/v3/SftpStatus.ts
var SFTP_STATUS = {
  OK: 0,
  EOF: 1,
  NO_SUCH_FILE: 2,
  PERMISSION_DENIED: 3,
  FAILURE: 4,
  BAD_MESSAGE: 5,
  NO_CONNECTION: 6,
  CONNECTION_LOST: 7,
  OP_UNSUPPORTED: 8
};
function decodeSftpStatusPayload(payload) {
  const reader = new SshDataReader(payload);
  const requestId = reader.readUint32();
  const statusCode = reader.readUint32();
  const errorMessage = reader.hasMore() ? reader.readString().toString("utf8") : "";
  const languageTag = reader.hasMore() ? reader.readString().toString("ascii") : "";
  return { errorMessage, languageTag, requestId, statusCode };
}
function sftpStatusToError(status, path2) {
  switch (status.statusCode) {
    case SFTP_STATUS.OK:
      return null;
    case SFTP_STATUS.EOF:
      return null;
    // not an error: caller checks for EOF explicitly
    case SFTP_STATUS.NO_SUCH_FILE:
      return new PathNotFoundError({
        details: { path: path2, sftpMessage: status.errorMessage },
        message: `SFTP: no such file or directory${path2 !== void 0 ? ` \u2014 ${path2}` : ""}`,
        protocol: "sftp",
        retryable: false
      });
    case SFTP_STATUS.PERMISSION_DENIED:
      return new PermissionDeniedError({
        details: { path: path2, sftpMessage: status.errorMessage },
        message: `SFTP: permission denied${path2 !== void 0 ? ` \u2014 ${path2}` : ""}`,
        protocol: "sftp",
        retryable: false
      });
    case SFTP_STATUS.NO_CONNECTION:
    case SFTP_STATUS.CONNECTION_LOST:
      return new ConnectionError({
        details: { sftpMessage: status.errorMessage, statusCode: status.statusCode },
        message: `SFTP: connection error \u2014 ${status.errorMessage}`,
        protocol: "sftp",
        retryable: true
      });
    case SFTP_STATUS.OP_UNSUPPORTED:
      return new UnsupportedFeatureError({
        details: { sftpMessage: status.errorMessage },
        message: `SFTP: operation unsupported \u2014 ${status.errorMessage}`,
        protocol: "sftp",
        retryable: false
      });
    case SFTP_STATUS.BAD_MESSAGE:
      return new ProtocolError({
        details: { sftpMessage: status.errorMessage },
        message: `SFTP: bad message \u2014 ${status.errorMessage}`,
        protocol: "sftp",
        retryable: false
      });
    default:
      return new ZeroTransferError({
        code: "SFTP_FAILURE",
        details: { sftpMessage: status.errorMessage, statusCode: status.statusCode },
        message: `SFTP: operation failed (status ${status.statusCode}) \u2014 ${status.errorMessage}`,
        protocol: "sftp",
        retryable: false
      });
  }
}
function throwIfSftpError(status, path2) {
  if (status.statusCode === SFTP_STATUS.OK) return;
  const err = sftpStatusToError(status, path2);
  if (err !== null) throw err;
  throw new ProtocolError({
    message: "SFTP: unexpected SSH_FX_EOF in non-data response",
    protocol: "sftp",
    retryable: false
  });
}

// src/protocols/sftp/v3/SftpSession.ts
var SFTP_PROTOCOL_VERSION = 3;
var SftpSession = class {
  constructor(channel) {
    this.channel = channel;
  }
  channel;
  nextRequestId = 1;
  pending = /* @__PURE__ */ new Map();
  framer = new SftpPacketFramer();
  /** Resolves on the first packet (VERSION) during init(). */
  versionWaiter;
  serverVersion = 0;
  // -- Lifecycle -------------------------------------------------------------
  /**
   * Sends SSH_FXP_INIT and awaits SSH_FXP_VERSION.
   * Must be called once before any other operation.
   */
  async init() {
    void this.pump();
    const versionPromise = new Promise((resolve, reject) => {
      this.versionWaiter = { reject, resolve };
    });
    this.sendRaw(encodeSftpInit(SFTP_PROTOCOL_VERSION));
    const resp = await versionPromise;
    if (resp.type !== SFTP_PACKET_TYPE.VERSION) {
      throw new ProtocolError({
        details: { got: resp.type },
        message: "SFTP: expected SSH_FXP_VERSION as first server packet",
        protocol: "sftp",
        retryable: false
      });
    }
    const result = decodeSftpVersion(resp.payload);
    this.serverVersion = result.version;
    return result;
  }
  get negotiatedVersion() {
    return this.serverVersion;
  }
  // -- File operations -------------------------------------------------------
  /**
   * Opens a remote file. Returns an opaque handle buffer.
   */
  async open(path2, pflags, attrs = {}) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpOpen({ attrs, path: path2, pflags, requestId: id }), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpHandlePayload(resp.payload).handle;
  }
  /**
   * Closes a file or directory handle.
   */
  async close(handle) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpClose(id, handle), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload));
  }
  /**
   * Reads up to `length` bytes from `handle` at `offset`.
   * Returns `null` on EOF.
   */
  async read(handle, offset, length) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRead({ handle, length, offset, requestId: id }), id);
    const resp = await this.awaitResponse(id);
    if (resp.type === SFTP_PACKET_TYPE.STATUS) {
      const status = decodeSftpStatusPayload(resp.payload);
      if (status.statusCode === SFTP_STATUS.EOF) return null;
      throwIfSftpError(status);
      return null;
    }
    return decodeSftpDataPayload(resp.payload).data;
  }
  /**
   * Writes `data` to `handle` at `offset`.
   */
  async write(handle, offset, data) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpWrite({ data, handle, offset, requestId: id }), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload));
  }
  // -- Stat operations -------------------------------------------------------
  async stat(path2) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpStat(id, path2), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpAttrsPayload(resp.payload).attrs;
  }
  async lstat(path2) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpLstat(id, path2), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpAttrsPayload(resp.payload).attrs;
  }
  async fstat(handle) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpFstat(id, handle), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpAttrsPayload(resp.payload).attrs;
  }
  async setstat(path2, attrs) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpSetstat(id, path2, attrs), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), path2);
  }
  async fsetstat(handle, attrs) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpFsetstat(id, handle, attrs), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload));
  }
  // -- Directory operations --------------------------------------------------
  async opendir(path2) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpOpendir(id, path2), id);
    const resp = await this.awaitResponse(id);
    return decodeSftpHandlePayload(resp.payload).handle;
  }
  /**
   * Reads one batch of directory entries.
   * Returns an empty array when the server sends SSH_FX_EOF.
   */
  async readdir(handle) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpReaddir(id, handle), id);
    const resp = await this.awaitResponse(id);
    if (resp.type === SFTP_PACKET_TYPE.STATUS) {
      const status = decodeSftpStatusPayload(resp.payload);
      if (status.statusCode === SFTP_STATUS.EOF) return [];
      throwIfSftpError(status);
      return [];
    }
    return decodeSftpNamePayload(resp.payload).entries;
  }
  /**
   * Convenience: opens a directory, reads all entries, and closes the handle.
   */
  async readdirAll(path2) {
    const handle = await this.opendir(path2);
    const entries = [];
    try {
      while (true) {
        const batch = await this.readdir(handle);
        if (batch.length === 0) break;
        entries.push(...batch);
      }
    } finally {
      await this.close(handle);
    }
    return entries;
  }
  async remove(path2) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRemove(id, path2), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), path2);
  }
  async mkdir(path2, attrs = {}) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpMkdir(id, path2, attrs), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), path2);
  }
  async rmdir(path2) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRmdir(id, path2), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), path2);
  }
  async realpath(path2) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRealpath(id, path2), id);
    const resp = await this.awaitResponse(id);
    const result = decodeSftpNamePayload(resp.payload);
    const first2 = result.entries[0];
    if (first2 === void 0) {
      throw new ProtocolError({
        message: "SFTP: SSH_FXP_NAME for REALPATH returned zero entries",
        protocol: "sftp",
        retryable: false
      });
    }
    return first2.filename;
  }
  async rename(oldPath, newPath) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpRename(id, oldPath, newPath), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), oldPath);
  }
  async readlink(path2) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpReadlink(id, path2), id);
    const resp = await this.awaitResponse(id);
    const result = decodeSftpNamePayload(resp.payload);
    const first2 = result.entries[0];
    if (first2 === void 0) {
      throw new ProtocolError({
        message: "SFTP: SSH_FXP_NAME for READLINK returned zero entries",
        protocol: "sftp",
        retryable: false
      });
    }
    return first2.filename;
  }
  async symlink(linkPath, targetPath) {
    const id = this.allocRequestId();
    this.sendRaw(encodeSftpSymlink(id, linkPath, targetPath), id);
    const resp = await this.awaitResponse(id);
    throwIfSftpError(decodeSftpStatusPayload(resp.payload), linkPath);
  }
  // -- Private: request plumbing ---------------------------------------------
  allocRequestId() {
    const id = this.nextRequestId;
    this.nextRequestId = id % 4294967295 + 1;
    return id;
  }
  /**
   * Sends raw SFTP message bytes over the channel.
   * The message encoders embed the type byte at position 0, followed by the body.
   * We prefix with a uint32 length so the remote SFTP framer can parse the frame.
   *
   * Send is asynchronous because the underlying SSH channel may apply
   * backpressure when the remote window is exhausted; the channel itself
   * serializes concurrent calls so byte ordering is preserved.
   */
  sendRaw(encodedMessage, requestId) {
    const frame = import_node_buffer19.Buffer.allocUnsafe(4 + encodedMessage.length);
    frame.writeUInt32BE(encodedMessage.length, 0);
    encodedMessage.copy(frame, 4);
    this.channel.sendData(frame).catch((err) => {
      const error = err instanceof Error ? err : new ConnectionError({
        message: "SFTP channel send failed",
        protocol: "sftp",
        retryable: false
      });
      if (requestId !== void 0) {
        const entry = this.pending.get(requestId);
        if (entry !== void 0) {
          this.pending.delete(requestId);
          entry.reject(error);
          return;
        }
      }
      if (this.versionWaiter !== void 0) {
        const waiter = this.versionWaiter;
        this.versionWaiter = void 0;
        waiter.reject(error);
      }
    });
  }
  async pump() {
    const failAll = (error) => {
      if (this.versionWaiter !== void 0) {
        this.versionWaiter.reject(error);
        this.versionWaiter = void 0;
      }
      for (const { reject } of this.pending.values()) {
        reject(error);
      }
      this.pending.clear();
    };
    try {
      for await (const chunk of this.channel.receiveData()) {
        const packets = this.framer.push(chunk);
        for (const pkt of packets) {
          this.dispatchPacket(pkt.type, pkt.payload);
        }
      }
      failAll(
        new ConnectionError({
          message: "SFTP: channel closed with pending requests",
          protocol: "sftp",
          retryable: false
        })
      );
    } catch (err) {
      failAll(
        err instanceof Error ? err : new ConnectionError({
          message: "SFTP channel error",
          protocol: "sftp",
          retryable: false
        })
      );
    }
  }
  dispatchPacket(packetType, payload) {
    if (packetType === SFTP_PACKET_TYPE.VERSION) {
      if (this.versionWaiter !== void 0) {
        const waiter = this.versionWaiter;
        this.versionWaiter = void 0;
        waiter.resolve({ payload, type: packetType });
      }
      return;
    }
    if (this.versionWaiter !== void 0) {
      const waiter = this.versionWaiter;
      this.versionWaiter = void 0;
      waiter.reject(
        new ProtocolError({
          details: { got: packetType },
          message: "SFTP: expected SSH_FXP_VERSION as first server packet",
          protocol: "sftp",
          retryable: false
        })
      );
      return;
    }
    if (payload.length < 4) return;
    const requestId = payload.readUInt32BE(0);
    const entry = this.pending.get(requestId);
    if (entry === void 0) return;
    this.pending.delete(requestId);
    entry.resolve({ payload, type: packetType });
  }
  awaitResponse(requestId) {
    return new Promise((resolve, reject) => {
      this.pending.set(requestId, { reject, resolve });
    });
  }
};

// src/providers/native/sftp/NativeSftpProvider.ts
var NATIVE_SFTP_PROVIDER_ID = "sftp-native";
var NATIVE_SFTP_DEFAULT_PORT = 22;
var SFTP_READ_CHUNK_BYTES = 32768;
var NATIVE_SFTP_ALGORITHM_PREFERENCES = {
  compressionClientToServer: ["none"],
  compressionServerToClient: ["none"],
  encryptionClientToServer: ["aes256-ctr", "aes128-ctr"],
  encryptionServerToClient: ["aes256-ctr", "aes128-ctr"],
  kexAlgorithms: ["curve25519-sha256", "curve25519-sha256@libssh.org"],
  languagesClientToServer: [],
  languagesServerToClient: [],
  macClientToServer: ["hmac-sha2-256", "hmac-sha2-512"],
  macServerToClient: ["hmac-sha2-256", "hmac-sha2-512"],
  serverHostKeyAlgorithms: [
    "ssh-ed25519",
    "ecdsa-sha2-nistp256",
    "ecdsa-sha2-nistp384",
    "ecdsa-sha2-nistp521",
    "rsa-sha2-512",
    "rsa-sha2-256"
  ]
};
var NATIVE_SFTP_PROVIDER_CAPABILITIES = {
  provider: NATIVE_SFTP_PROVIDER_ID,
  authentication: ["password", "keyboard-interactive", "publickey"],
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
  metadata: ["accessedAt", "group", "modifiedAt", "owner", "permissions"],
  maxConcurrency: 8,
  notes: [
    "Native SSH/SFTP provider using the project's own protocol stack (Waves 1\u20133).",
    "Supports password and keyboard-interactive authentication."
  ]
};
function createNativeSftpProviderFactory(options = {}) {
  validateNativeSftpOptions(options);
  return {
    capabilities: NATIVE_SFTP_PROVIDER_CAPABILITIES,
    create: () => new NativeSftpProvider(options),
    id: NATIVE_SFTP_PROVIDER_ID
  };
}
var NativeSftpProvider = class {
  constructor(options) {
    this.options = options;
  }
  options;
  id = NATIVE_SFTP_PROVIDER_ID;
  capabilities = NATIVE_SFTP_PROVIDER_CAPABILITIES;
  async connect(profile) {
    const resolved = await resolveConnectionProfileSecrets(profile);
    const username = requireNativeSftpUsername(resolved);
    const credential = buildNativeSftpCredential(resolved, username);
    let socket;
    const hostKeyPins = normalizeNativeHostKeyPins(resolved.ssh?.pinnedHostKeySha256);
    const knownHostsEntries = parseNativeKnownHosts(resolved.ssh?.knownHosts);
    const verifyHostKeyHook = buildNativeHostKeyVerifier({
      host: resolved.host,
      port: resolved.port ?? NATIVE_SFTP_DEFAULT_PORT,
      pins: hostKeyPins,
      knownHosts: knownHostsEntries
    });
    const handshakeTimeoutMs = resolved.timeoutMs ?? this.options.readyTimeoutMs;
    const keepaliveIntervalMs = this.options.keepaliveIntervalMs;
    const baseTransportOptions = {
      algorithms: NATIVE_SFTP_ALGORITHM_PREFERENCES,
      ...verifyHostKeyHook === void 0 ? {} : { verifyHostKey: verifyHostKeyHook },
      ...handshakeTimeoutMs === void 0 ? {} : { handshakeTimeoutMs },
      ...keepaliveIntervalMs === void 0 ? {} : { keepaliveIntervalMs }
    };
    const transportOptions = resolved.signal !== void 0 ? { abortSignal: resolved.signal, ...baseTransportOptions } : baseTransportOptions;
    const transport = new SshTransportConnection(transportOptions);
    try {
      socket = await openNativeSftpSocket(resolved, this.options);
      const handshakeResult = await transport.connect(socket);
      const authSession = new SshAuthSession(transport);
      await authSession.authenticate({
        credential,
        sessionId: handshakeResult.keyExchange.sessionId
      });
      const connectionManager = new SshConnectionManager(transport);
      const channel = await connectionManager.openSubsystemChannel("sftp");
      connectionManager.start().catch(() => {
      });
      const sftp = new SftpSession(channel);
      await sftp.init();
      return new NativeSftpSession(transport, sftp);
    } catch (error) {
      if (socket !== void 0 && !socket.destroyed) {
        socket.destroy();
      }
      throw mapNativeSftpConnectError(error, resolved.host);
    }
  }
};
var NativeSftpSession = class {
  constructor(transport, sftp) {
    this.transport = transport;
    this.sftp = sftp;
    this.fs = new NativeSftpFileSystem(sftp);
    this.transfers = new NativeSftpTransferOperations(sftp);
  }
  transport;
  sftp;
  provider = NATIVE_SFTP_PROVIDER_ID;
  capabilities = NATIVE_SFTP_PROVIDER_CAPABILITIES;
  fs;
  transfers;
  disconnect() {
    this.transport.disconnect();
    return Promise.resolve();
  }
  raw() {
    return { sftp: this.sftp, transport: this.transport };
  }
};
var NativeSftpFileSystem = class {
  constructor(sftp) {
    this.sftp = sftp;
  }
  sftp;
  async list(path2, options = {}) {
    nativeSftpThrowIfAborted(options.signal, path2, "list");
    const remotePath = normalizeRemotePath(path2);
    const entries = await this.sftp.readdirAll(remotePath);
    return entries.filter((e) => e.filename !== "." && e.filename !== "..").map((e) => mapNativeSftpEntry(joinRemotePath(remotePath, e.filename), e.filename, e.attrs)).sort(compareNativeSftpEntries);
  }
  async stat(path2, options = {}) {
    nativeSftpThrowIfAborted(options.signal, path2, "stat");
    const remotePath = normalizeRemotePath(path2);
    const attrs = await this.sftp.lstat(remotePath);
    return {
      ...mapNativeSftpEntry(remotePath, basenameRemotePath(remotePath), attrs),
      exists: true
    };
  }
  async remove(path2, options = {}) {
    nativeSftpThrowIfAborted(options.signal, path2, "remove");
    const remotePath = normalizeRemotePath(path2);
    try {
      await this.sftp.remove(remotePath);
    } catch (error) {
      if (options.ignoreMissing === true && error instanceof ZeroTransferError && error.code === "ZERO_TRANSFER_PATH_NOT_FOUND") {
        return;
      }
      throw error;
    }
  }
  async rename(from, to, options = {}) {
    nativeSftpThrowIfAborted(options.signal, from, "rename");
    const fromPath = normalizeRemotePath(from);
    const toPath = normalizeRemotePath(to);
    await this.sftp.rename(fromPath, toPath);
  }
  async mkdir(path2, options = {}) {
    nativeSftpThrowIfAborted(options.signal, path2, "mkdir");
    const remotePath = normalizeRemotePath(path2);
    if (options.recursive !== true) {
      await this.sftp.mkdir(remotePath);
      return;
    }
    const segments = remotePath.split("/").filter((s) => s.length > 0);
    let current = "";
    for (const segment of segments) {
      current = `${current}/${segment}`;
      try {
        await this.sftp.mkdir(current);
      } catch (error) {
        if (error instanceof ZeroTransferError && error.code === "ZERO_TRANSFER_PATH_NOT_FOUND") {
          throw error;
        }
        try {
          const attrs = await this.sftp.lstat(current);
          const mode = attrs.permissions ?? 0;
          if (nativeSftpEntryTypeFromMode(mode) !== "directory") {
            throw error;
          }
        } catch {
          throw error;
        }
      }
    }
  }
  async rmdir(path2, options = {}) {
    nativeSftpThrowIfAborted(options.signal, path2, "rmdir");
    const remotePath = normalizeRemotePath(path2);
    if (options.recursive === true) {
      await this.removeDirRecursive(remotePath, options);
      return;
    }
    try {
      await this.sftp.rmdir(remotePath);
    } catch (error) {
      if (options.ignoreMissing === true && error instanceof ZeroTransferError && error.code === "ZERO_TRANSFER_PATH_NOT_FOUND") {
        return;
      }
      throw error;
    }
  }
  async removeDirRecursive(remotePath, options) {
    let entries;
    try {
      entries = await this.sftp.readdirAll(remotePath);
    } catch (error) {
      if (options.ignoreMissing === true && error instanceof ZeroTransferError && error.code === "ZERO_TRANSFER_PATH_NOT_FOUND") {
        return;
      }
      throw error;
    }
    for (const entry of entries) {
      if (entry.filename === "." || entry.filename === "..") continue;
      const childPath = joinRemotePath(remotePath, entry.filename);
      const mode = entry.attrs.permissions ?? 0;
      const isDir = nativeSftpEntryTypeFromMode(mode) === "directory";
      if (isDir) {
        await this.removeDirRecursive(childPath, {});
      } else {
        await this.sftp.remove(childPath);
      }
    }
    await this.sftp.rmdir(remotePath);
  }
};
var NativeSftpTransferOperations = class {
  constructor(sftp) {
    this.sftp = sftp;
  }
  sftp;
  async read(request) {
    request.throwIfAborted();
    const remotePath = normalizeRemotePath(request.endpoint.path);
    const statAttrs = await this.sftp.lstat(remotePath);
    const mode = statAttrs.permissions ?? 0;
    if (nativeSftpEntryTypeFromMode(mode) !== "file") {
      throw new ConfigurationError({
        details: { path: remotePath, provider: NATIVE_SFTP_PROVIDER_ID },
        message: `Native SFTP path is not a file: ${remotePath}`,
        protocol: "sftp",
        retryable: false
      });
    }
    const totalSize = statAttrs.size !== void 0 ? Number(statAttrs.size) : 0;
    const range = resolveNativeSftpReadRange(totalSize, request.range);
    return {
      content: this.createReadSource(remotePath, range, request),
      totalBytes: range.length,
      ...range.offset > 0 ? { bytesRead: range.offset } : {}
    };
  }
  async *createReadSource(path2, range, request) {
    if (range.length <= 0) return;
    request.throwIfAborted();
    const handle = await this.sftp.open(path2, SFTP_OPEN_FLAG.READ);
    try {
      let remaining = range.length;
      let offset = range.offset;
      while (remaining > 0) {
        request.throwIfAborted();
        const chunkLen = Math.min(SFTP_READ_CHUNK_BYTES, remaining);
        const data = await this.sftp.read(handle, BigInt(offset), chunkLen);
        if (data === null) break;
        yield new Uint8Array(data);
        offset += data.length;
        remaining -= data.length;
      }
    } finally {
      await this.sftp.close(handle).catch(() => {
      });
    }
  }
  async write(request) {
    request.throwIfAborted();
    const remotePath = normalizeRemotePath(request.endpoint.path);
    const startOffset = normalizeNativeSftpOffset(request.offset, remotePath);
    const pflags = startOffset !== void 0 && startOffset > 0 ? SFTP_OPEN_FLAG.WRITE : SFTP_OPEN_FLAG.WRITE | SFTP_OPEN_FLAG.CREAT | SFTP_OPEN_FLAG.TRUNC;
    request.throwIfAborted();
    const handle = await this.sftp.open(remotePath, pflags);
    let bytesTransferred = 0;
    try {
      let writeOffset = startOffset ?? 0;
      for await (const chunk of request.content) {
        request.throwIfAborted();
        if (chunk.byteLength === 0) continue;
        await this.sftp.write(handle, BigInt(writeOffset), chunk);
        writeOffset += chunk.byteLength;
        bytesTransferred += chunk.byteLength;
        request.reportProgress(bytesTransferred, request.totalBytes);
      }
    } finally {
      await this.sftp.close(handle).catch(() => {
      });
    }
    const result = {
      bytesTransferred,
      resumed: (startOffset ?? 0) > 0,
      totalBytes: request.totalBytes ?? (startOffset ?? 0) + bytesTransferred,
      verified: request.verification?.verified ?? false
    };
    if (request.verification !== void 0) {
      result.verification = cloneNativeSftpVerification(request.verification);
    }
    return result;
  }
};
function openNativeSftpSocket(profile, options) {
  return new Promise((resolve, reject) => {
    const port = profile.port ?? NATIVE_SFTP_DEFAULT_PORT;
    const host = profile.host;
    const timeoutMs = profile.timeoutMs ?? options.readyTimeoutMs;
    if (profile.signal?.aborted === true) {
      reject(
        new AbortError({
          details: { operation: "connect" },
          host,
          message: "Native SFTP connection was aborted before socket open",
          protocol: "sftp",
          retryable: false
        })
      );
      return;
    }
    const socket = (0, import_node_net.createConnection)({ host, port });
    if (timeoutMs !== void 0) {
      socket.setTimeout(timeoutMs);
    }
    const cleanup = () => {
      socket.off("connect", handleConnect);
      socket.off("error", handleError);
      socket.off("timeout", handleTimeout);
      profile.signal?.removeEventListener("abort", handleAbort);
    };
    const handleConnect = () => {
      socket.setTimeout(0);
      cleanup();
      resolve(socket);
    };
    const handleError = (err) => {
      cleanup();
      socket.destroy();
      reject(err);
    };
    const handleTimeout = () => {
      cleanup();
      socket.destroy();
      reject(
        new TimeoutError({
          details: { operation: "connect" },
          host,
          message: `Native SFTP socket connection timed out after ${timeoutMs ?? "?"}ms`,
          protocol: "sftp",
          retryable: true
        })
      );
    };
    const handleAbort = () => {
      cleanup();
      socket.destroy();
      reject(
        new AbortError({
          details: { operation: "connect" },
          host,
          message: "Native SFTP connection was aborted",
          protocol: "sftp",
          retryable: false
        })
      );
    };
    socket.once("connect", handleConnect);
    socket.once("error", handleError);
    socket.once("timeout", handleTimeout);
    profile.signal?.addEventListener("abort", handleAbort, { once: true });
  });
}
function buildNativeSftpCredential(profile, username) {
  const password = resolveNativeSftpTextSecret(profile.password);
  const keyboardInteractive = profile.ssh?.keyboardInteractive;
  const privateKey = profile.ssh?.privateKey;
  if (privateKey !== void 0) {
    return buildNativePublickeyCredential(profile, username);
  }
  if (password !== void 0) {
    return {
      password,
      type: "password",
      username
    };
  }
  if (keyboardInteractive !== void 0) {
    return {
      respond: async (name, instruction, prompts) => {
        const challenge = {
          instructions: instruction,
          language: "",
          name,
          prompts: prompts.map((p) => ({
            echo: p.echo,
            prompt: p.prompt
          }))
        };
        const result = await keyboardInteractive(challenge);
        return Array.from(result);
      },
      type: "keyboard-interactive",
      username
    };
  }
  throw new ConfigurationError({
    details: { provider: NATIVE_SFTP_PROVIDER_ID },
    message: "Native SFTP profiles require ssh.privateKey, password, or ssh.keyboardInteractive",
    protocol: "sftp",
    retryable: false
  });
}
function buildNativePublickeyCredential(profile, username) {
  const keyMaterial = profile.ssh?.privateKey;
  if (keyMaterial === void 0) {
    throw new ConfigurationError({
      details: { provider: NATIVE_SFTP_PROVIDER_ID },
      message: "ssh.privateKey is required for public-key authentication",
      protocol: "sftp",
      retryable: false
    });
  }
  const passphrase = profile.ssh?.passphrase;
  try {
    const privateKey = (0, import_node_crypto9.createPrivateKey)({
      key: import_node_buffer20.Buffer.isBuffer(keyMaterial) ? keyMaterial : keyMaterial,
      ...passphrase === void 0 ? {} : {
        passphrase: import_node_buffer20.Buffer.isBuffer(passphrase) ? passphrase : passphrase
      }
    });
    return buildPublickeyCredential({ privateKey, username });
  } catch (error) {
    throw new ConfigurationError({
      cause: error,
      details: {
        originalMessage: error instanceof Error ? error.message : String(error),
        provider: NATIVE_SFTP_PROVIDER_ID
      },
      message: "Failed to parse ssh.privateKey: ensure the key is in OpenSSH or PKCS#8 PEM format and the passphrase (if any) is correct",
      protocol: "sftp",
      retryable: false
    });
  }
}
function mapNativeSftpConnectError(error, host) {
  if (error instanceof ZeroTransferError) {
    return error;
  }
  if (isNativeSftpAuthFailure(error)) {
    return new AuthenticationError({
      cause: error,
      host,
      message: "Native SFTP authentication failed",
      protocol: "sftp",
      retryable: false
    });
  }
  return new ConnectionError({
    cause: error,
    details: { originalMessage: getNativeSftpErrorMessage(error) },
    host,
    message: `Native SFTP connection failed: ${getNativeSftpErrorMessage(error)}`,
    protocol: "sftp",
    retryable: true
  });
}
function isNativeSftpAuthFailure(error) {
  if (error instanceof AuthenticationError) return true;
  const msg = getNativeSftpErrorMessage(error).toLowerCase();
  return msg.includes("auth") || msg.includes("permission denied");
}
function mapNativeSftpEntry(path2, name, attrs) {
  const mode = attrs.permissions ?? 0;
  const entry = {
    name,
    path: path2,
    ...attrs.gid !== void 0 ? { group: String(attrs.gid) } : {},
    ...attrs.uid !== void 0 ? { owner: String(attrs.uid) } : {},
    permissions: { raw: formatNativeSftpMode(mode) },
    raw: {
      attrs: {
        atime: attrs.atime ?? 0,
        gid: attrs.gid ?? 0,
        mode,
        mtime: attrs.mtime ?? 0,
        size: attrs.size !== void 0 ? Number(attrs.size) : 0,
        uid: attrs.uid ?? 0
      }
    },
    type: nativeSftpEntryTypeFromMode(mode)
  };
  if (attrs.size !== void 0) {
    entry.size = Number(attrs.size);
  }
  if (attrs.mtime !== void 0) {
    entry.modifiedAt = new Date(attrs.mtime * 1e3);
  }
  if (attrs.atime !== void 0) {
    entry.accessedAt = new Date(attrs.atime * 1e3);
  }
  return entry;
}
function nativeSftpEntryTypeFromMode(mode) {
  const fileTypeBits = mode & 61440;
  if (fileTypeBits === 32768) return "file";
  if (fileTypeBits === 16384) return "directory";
  if (fileTypeBits === 40960) return "symlink";
  return "unknown";
}
function formatNativeSftpMode(mode) {
  return mode.toString(8).padStart(6, "0");
}
function compareNativeSftpEntries(left, right) {
  return left.path.localeCompare(right.path);
}
function resolveNativeSftpReadRange(size, range) {
  if (range === void 0) {
    return { length: size, offset: 0 };
  }
  const offset = Math.min(Math.max(0, Math.floor(range.offset)), size);
  const requestedLength = range.length === void 0 ? size - offset : Math.max(0, Math.floor(range.length));
  const length = Math.min(requestedLength, size - offset);
  return { length, offset };
}
function normalizeNativeSftpOffset(value, path2) {
  if (value === void 0) return void 0;
  if (!Number.isFinite(value) || value < 0) {
    throw new ConfigurationError({
      details: { field: "offset", path: path2, provider: NATIVE_SFTP_PROVIDER_ID },
      message: "Native SFTP write offset must be a non-negative finite number",
      protocol: "sftp",
      retryable: false
    });
  }
  return Math.floor(value);
}
function cloneNativeSftpVerification(v) {
  const clone = { verified: v.verified };
  if (v.method !== void 0) clone.method = v.method;
  if (v.checksum !== void 0) clone.checksum = v.checksum;
  if (v.expectedChecksum !== void 0) clone.expectedChecksum = v.expectedChecksum;
  if (v.actualChecksum !== void 0) clone.actualChecksum = v.actualChecksum;
  if (v.details !== void 0) clone.details = { ...v.details };
  return clone;
}
function normalizeNativeHostKeyPins(value) {
  if (value === void 0) return void 0;
  const pins = typeof value === "string" ? [value] : value;
  if (pins.length === 0) return void 0;
  const normalized = /* @__PURE__ */ new Set();
  for (const pin of pins) {
    const trimmed = pin.trim();
    const hex = trimmed.replace(/:/g, "");
    if (hex.length === 64 && /^[a-f0-9]+$/i.test(hex)) {
      normalized.add(import_node_buffer20.Buffer.from(hex, "hex").toString("base64").replace(/=+$/g, ""));
      continue;
    }
    const bare = trimmed.startsWith("SHA256:") ? trimmed.slice("SHA256:".length) : trimmed;
    const padded = bare.length % 4 === 0 ? bare : `${bare}${"=".repeat(4 - bare.length % 4)}`;
    normalized.add(import_node_buffer20.Buffer.from(padded, "base64").toString("base64").replace(/=+$/g, ""));
  }
  return normalized;
}
function parseNativeKnownHosts(source) {
  if (source === void 0) return void 0;
  const sources = Array.isArray(source) ? source : [source];
  const entries = [];
  for (const value of sources) {
    const text = import_node_buffer20.Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
    if (text.length === 0) continue;
    entries.push(...parseKnownHosts(text));
  }
  return entries.length === 0 ? void 0 : entries;
}
function buildNativeHostKeyVerifier(input) {
  const { host, knownHosts, pins, port } = input;
  if (pins === void 0 && knownHosts === void 0) return void 0;
  return ({ hostKeyBlob }) => {
    if (pins !== void 0) {
      const fingerprint = (0, import_node_crypto9.createHash)("sha256").update(hostKeyBlob).digest("base64").replace(/=+$/g, "");
      if (!pins.has(fingerprint)) {
        throw new AuthenticationError({
          details: { fingerprint, host },
          message: "SSH server host key does not match any pinned fingerprint",
          protocol: "sftp",
          retryable: false
        });
      }
    }
    if (knownHosts !== void 0) {
      const keyBase64 = hostKeyBlob.toString("base64");
      let matched = false;
      for (const entry of knownHosts) {
        if (!matchKnownHostsEntry(entry, host, port)) continue;
        if (entry.keyBase64 !== keyBase64) continue;
        if (entry.marker === "revoked") {
          throw new AuthenticationError({
            details: { host, marker: entry.marker },
            message: "SSH server host key is marked @revoked in known_hosts",
            protocol: "sftp",
            retryable: false
          });
        }
        if (entry.marker === void 0) {
          matched = true;
        }
      }
      if (!matched) {
        throw new AuthenticationError({
          details: { host, port },
          message: "SSH server host key is not present in known_hosts for this host",
          protocol: "sftp",
          retryable: false
        });
      }
    }
  };
}
function requireNativeSftpUsername(profile) {
  const text = resolveNativeSftpTextSecret(profile.username);
  if (text === void 0) {
    throw new ConfigurationError({
      details: { field: "username", provider: NATIVE_SFTP_PROVIDER_ID },
      message: "Native SFTP profiles require a username",
      protocol: "sftp",
      retryable: false
    });
  }
  return text;
}
function resolveNativeSftpTextSecret(value) {
  if (value === void 0) return void 0;
  const text = import_node_buffer20.Buffer.isBuffer(value) ? value.toString("utf8") : value;
  if (text.length === 0) return void 0;
  return text;
}
function nativeSftpThrowIfAborted(signal, path2, operation) {
  if (signal?.aborted !== true) return;
  throw new AbortError({
    details: { operation },
    message: `Native SFTP ${operation} was aborted`,
    path: path2,
    protocol: "sftp",
    retryable: false
  });
}
function getNativeSftpErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function validateNativeSftpOptions(options) {
  if (options.readyTimeoutMs !== void 0 && (!Number.isFinite(options.readyTimeoutMs) || options.readyTimeoutMs <= 0)) {
    throw new ConfigurationError({
      details: { readyTimeoutMs: options.readyTimeoutMs },
      message: "Native SFTP provider readyTimeoutMs must be a positive finite number",
      protocol: "sftp",
      retryable: false
    });
  }
  if (options.keepaliveIntervalMs !== void 0 && (!Number.isFinite(options.keepaliveIntervalMs) || options.keepaliveIntervalMs < 0)) {
    throw new ConfigurationError({
      details: { keepaliveIntervalMs: options.keepaliveIntervalMs },
      message: "Native SFTP provider keepaliveIntervalMs must be a non-negative finite number",
      protocol: "sftp",
      retryable: false
    });
  }
}

// src/providers/classic/sftp/SftpProvider.ts
var import_node_buffer21 = require("buffer");
var import_node_crypto10 = require("crypto");
var import_ssh2 = __toESM(require("ssh2"));
var { Client: SshClientCtor, utils } = import_ssh2.default;
var SFTP_PROVIDER_ID = "sftp";
var SFTP_DEFAULT_PORT = 22;
var SFTP_PROVIDER_CAPABILITIES = {
  provider: SFTP_PROVIDER_ID,
  authentication: ["password", "private-key", "agent", "keyboard-interactive"],
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
  metadata: ["accessedAt", "group", "modifiedAt", "owner", "permissions"],
  maxConcurrency: 8,
  notes: [
    "Initial ssh2-backed SFTP provider with password/private-key/agent authentication, metadata reads, and transfer streams"
  ]
};
function createSftpProviderFactory(options = {}) {
  validateSftpProviderOptions(options);
  return {
    id: SFTP_PROVIDER_ID,
    capabilities: SFTP_PROVIDER_CAPABILITIES,
    create: () => new SftpProvider(options)
  };
}
var SftpProvider = class {
  constructor(options) {
    this.options = options;
  }
  options;
  id = SFTP_PROVIDER_ID;
  capabilities = SFTP_PROVIDER_CAPABILITIES;
  async connect(profile) {
    const resolvedProfile = await resolveConnectionProfileSecrets(profile);
    const username = requireTextCredential(resolvedProfile.username, "username");
    const authentication = resolveSftpAuthentication(resolvedProfile);
    const client = await connectSshClient(resolvedProfile, this.options, username, authentication);
    try {
      const sftp = await openSftpSession(client, resolvedProfile);
      return new SftpTransferSession(client, sftp);
    } catch (error) {
      client.end();
      throw mapSftpError(error, {
        command: "SFTP",
        host: resolvedProfile.host
      });
    }
  }
};
var SftpTransferSession = class {
  constructor(client, sftp) {
    this.client = client;
    this.sftp = sftp;
    this.client.on("error", noop);
    this.fs = new SftpFileSystem(sftp);
    this.transfers = new SftpTransferOperations(sftp);
  }
  client;
  sftp;
  provider = SFTP_PROVIDER_ID;
  capabilities = SFTP_PROVIDER_CAPABILITIES;
  fs;
  transfers;
  disconnect() {
    return Promise.resolve().then(() => {
      this.client.end();
    });
  }
  raw() {
    return {
      client: this.client,
      sftp: this.sftp
    };
  }
};
var SftpTransferOperations = class {
  constructor(sftp) {
    this.sftp = sftp;
  }
  sftp;
  async read(request) {
    request.throwIfAborted();
    const remotePath = normalizeSftpPath(request.endpoint.path);
    try {
      const stats = await readSftpStats(this.sftp, remotePath);
      if (!stats.isFile()) {
        throw createSftpPathNotFoundError(remotePath, `SFTP path is not a file: ${remotePath}`);
      }
      const range = resolveSftpReadRange(stats.size, request.range);
      const result = {
        content: createSftpReadSource(this.sftp, remotePath, range, request),
        totalBytes: range.length
      };
      if (range.offset > 0) {
        result.bytesRead = range.offset;
      }
      return result;
    } catch (error) {
      throw mapSftpError(error, { command: "READ", path: remotePath });
    }
  }
  async write(request) {
    request.throwIfAborted();
    const remotePath = normalizeSftpPath(request.endpoint.path);
    const offset = normalizeOptionalByteCount3(request.offset, "offset", remotePath);
    try {
      const bytesTransferred = await writeSftpContent(this.sftp, remotePath, request, offset);
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
    } catch (error) {
      throw mapSftpError(error, { command: "WRITE", path: remotePath });
    }
  }
};
var SftpFileSystem = class {
  constructor(sftp) {
    this.sftp = sftp;
  }
  sftp;
  async list(path2, options = {}) {
    throwIfAborted3(options.signal, path2, "list");
    const remotePath = normalizeSftpPath(path2);
    try {
      const entries = await readSftpDirectory(this.sftp, remotePath);
      return entries.filter((entry) => entry.filename !== "." && entry.filename !== "..").map((entry) => mapSftpDirectoryEntry(remotePath, entry)).sort(compareEntries5);
    } catch (error) {
      throw mapSftpError(error, { command: "READDIR", path: remotePath });
    }
  }
  async stat(path2, options = {}) {
    throwIfAborted3(options.signal, path2, "stat");
    const remotePath = normalizeSftpPath(path2);
    try {
      const stats = await readSftpStats(this.sftp, remotePath);
      return {
        ...mapSftpStats(remotePath, basenameRemotePath(remotePath), stats),
        exists: true
      };
    } catch (error) {
      throw mapSftpError(error, { command: "LSTAT", path: remotePath });
    }
  }
  async remove(path2, options = {}) {
    throwIfAborted3(options.signal, path2, "remove");
    const remotePath = normalizeSftpPath(path2);
    try {
      await sftpUnlink(this.sftp, remotePath);
    } catch (error) {
      const mapped = mapSftpError(error, { command: "REMOVE", path: remotePath });
      if (options.ignoreMissing && mapped instanceof PathNotFoundError) return;
      throw mapped;
    }
  }
  async rename(from, to, options = {}) {
    throwIfAborted3(options.signal, from, "rename");
    const fromPath = normalizeSftpPath(from);
    const toPath = normalizeSftpPath(to);
    try {
      await sftpRename(this.sftp, fromPath, toPath);
    } catch (error) {
      throw mapSftpError(error, { command: "RENAME", path: fromPath });
    }
  }
  async mkdir(path2, options = {}) {
    throwIfAborted3(options.signal, path2, "mkdir");
    const remotePath = normalizeSftpPath(path2);
    if (!options.recursive) {
      try {
        await sftpMkdir(this.sftp, remotePath);
      } catch (error) {
        throw mapSftpError(error, { command: "MKDIR", path: remotePath });
      }
      return;
    }
    const segments = remotePath.split("/").filter((s) => s.length > 0);
    let current = "";
    for (const segment of segments) {
      current = `${current}/${segment}`;
      try {
        await sftpMkdir(this.sftp, current);
      } catch (error) {
        try {
          const stats = await readSftpStats(this.sftp, current);
          if (stats.isDirectory()) continue;
        } catch {
        }
        throw mapSftpError(error, { command: "MKDIR", path: current });
      }
    }
  }
  async rmdir(path2, options = {}) {
    throwIfAborted3(options.signal, path2, "rmdir");
    const remotePath = normalizeSftpPath(path2);
    if (options.recursive) {
      await this.removeDirectoryRecursive(remotePath);
      return;
    }
    try {
      await sftpRmdir(this.sftp, remotePath);
    } catch (error) {
      const mapped = mapSftpError(error, { command: "RMDIR", path: remotePath });
      if (options.ignoreMissing && mapped instanceof PathNotFoundError) return;
      throw mapped;
    }
  }
  async removeDirectoryRecursive(remotePath) {
    let entries;
    try {
      entries = await readSftpDirectory(this.sftp, remotePath);
    } catch (error) {
      const mapped = mapSftpError(error, { command: "READDIR", path: remotePath });
      if (mapped instanceof PathNotFoundError) return;
      throw mapped;
    }
    for (const entry of entries) {
      if (entry.filename === "." || entry.filename === "..") continue;
      const childPath = `${remotePath.replace(/\/+$/, "")}/${entry.filename}`.replace(/\/+/g, "/");
      const isDir = entry.attrs.isDirectory();
      try {
        if (isDir) {
          await this.removeDirectoryRecursive(childPath);
        } else {
          await sftpUnlink(this.sftp, childPath);
        }
      } catch (error) {
        throw mapSftpError(error, {
          command: isDir ? "RMDIR" : "REMOVE",
          path: childPath
        });
      }
    }
    try {
      await sftpRmdir(this.sftp, remotePath);
    } catch (error) {
      throw mapSftpError(error, { command: "RMDIR", path: remotePath });
    }
  }
};
async function connectSshClient(profile, options, username, authentication) {
  const client = new SshClientCtor();
  let config;
  try {
    config = await createConnectConfig(profile, options, username, authentication);
  } catch (error) {
    client.end();
    throw mapSftpConnectionError(error, profile.host);
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      client.end();
      reject(mapSftpConnectionError(error, profile.host));
    };
    const handleAbort = () => {
      fail(
        new AbortError({
          details: { operation: "connect" },
          host: profile.host,
          message: "SFTP connection was aborted",
          protocol: "sftp",
          retryable: false
        })
      );
    };
    const handleReady = () => {
      settled = true;
      cleanup();
      resolve(client);
    };
    const handleTimeout = () => {
      fail(
        new TimeoutError({
          details: { operation: "connect" },
          host: profile.host,
          message: "SFTP connection timed out",
          protocol: "sftp",
          retryable: true
        })
      );
    };
    const cleanup = () => {
      client.off("ready", handleReady);
      client.off("error", fail);
      client.off("timeout", handleTimeout);
      profile.signal?.removeEventListener("abort", handleAbort);
    };
    client.once("ready", handleReady);
    client.once("error", fail);
    client.once("timeout", handleTimeout);
    if (profile.signal?.aborted === true) {
      handleAbort();
      return;
    }
    profile.signal?.addEventListener("abort", handleAbort, { once: true });
    try {
      client.connect(config);
    } catch (error) {
      fail(error);
    }
  });
}
async function createConnectConfig(profile, options, username, authentication) {
  const config = {
    authHandler: authentication.authHandler,
    host: profile.host,
    port: profile.port ?? SFTP_DEFAULT_PORT,
    username
  };
  const timeoutMs = profile.timeoutMs ?? options.readyTimeoutMs;
  if (timeoutMs !== void 0) {
    config.readyTimeout = timeoutMs;
    config.timeout = timeoutMs;
  }
  if (profile.ssh?.algorithms !== void 0) {
    config.algorithms = profile.ssh.algorithms;
  }
  const socket = await createSftpSocket(profile, username);
  if (socket !== void 0) {
    config.sock = socket;
  }
  configureSftpHostKeyVerifier(config, profile, options);
  return config;
}
async function createSftpSocket(profile, username) {
  const socketFactory = profile.ssh?.socketFactory;
  if (socketFactory === void 0) {
    return void 0;
  }
  if (profile.signal?.aborted === true) {
    throw new AbortError({
      details: { operation: "connect" },
      host: profile.host,
      message: "SFTP connection was aborted",
      protocol: "sftp",
      retryable: false
    });
  }
  const context = {
    host: profile.host,
    port: profile.port ?? SFTP_DEFAULT_PORT,
    username
  };
  const socket = await socketFactory(
    profile.signal === void 0 ? context : { ...context, signal: profile.signal }
  );
  if (typeof socket !== "object" || socket === null || typeof socket.pipe !== "function") {
    throw new ConfigurationError({
      details: { socket: typeof socket },
      message: "Connection profile ssh.socketFactory must return a socket-like readable stream",
      protocol: "sftp",
      retryable: false
    });
  }
  return socket;
}
function configureSftpHostKeyVerifier(config, profile, options) {
  const policy = createSftpHostKeyPolicy(profile);
  if (policy === void 0) {
    if (options.hostHash !== void 0) config.hostHash = options.hostHash;
    if (options.hostVerifier !== void 0) config.hostVerifier = options.hostVerifier;
    return;
  }
  if (options.hostHash !== void 0 || options.hostVerifier !== void 0) {
    throw new ConfigurationError({
      details: { provider: SFTP_PROVIDER_ID },
      message: "SFTP profile host-key policies cannot be combined with provider-level hostHash or hostVerifier options",
      protocol: "sftp",
      retryable: false
    });
  }
  config.hostVerifier = (key) => verifySftpHostKey(policy, key);
}
function createSftpHostKeyPolicy(profile) {
  const knownHosts = parseKnownHosts2(profile.ssh?.knownHosts);
  const pins = normalizeHostKeyPins(profile.ssh?.pinnedHostKeySha256);
  if (knownHosts === void 0 && pins === void 0) {
    return void 0;
  }
  const policy = {
    host: profile.host,
    port: profile.port ?? SFTP_DEFAULT_PORT
  };
  if (knownHosts !== void 0) policy.knownHosts = knownHosts;
  if (pins !== void 0) policy.pinnedHostKeySha256 = pins;
  return policy;
}
function verifySftpHostKey(policy, key) {
  if (policy.pinnedHostKeySha256 !== void 0 && !policy.pinnedHostKeySha256.has(hashHostKey(key))) {
    return false;
  }
  if (policy.knownHosts !== void 0 && !matchesKnownHosts(policy, key)) {
    return false;
  }
  return true;
}
function parseKnownHosts2(source) {
  if (source === void 0) {
    return void 0;
  }
  const values = Array.isArray(source) ? source : [source];
  const entries = [];
  for (const value of values) {
    const text = import_node_buffer21.Buffer.isBuffer(value) ? value.toString("utf8") : value;
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      const entry = parseKnownHostsLine2(line, index + 1);
      if (entry !== void 0) {
        entries.push(entry);
      }
    });
  }
  return entries;
}
function parseKnownHostsLine2(line, lineNumber) {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.startsWith("#")) {
    return void 0;
  }
  const fields = trimmed.split(/\s+/);
  const offset = fields[0]?.startsWith("@") === true ? 1 : 0;
  const hosts = fields[offset];
  const keyType = fields[offset + 1];
  const keyData = fields[offset + 2];
  if (hosts === void 0 || keyType === void 0 || keyData === void 0) {
    throw createKnownHostsConfigurationError(lineNumber, "is malformed");
  }
  const key = parseKnownHostPublicKey(`${keyType} ${keyData}`, lineNumber);
  return {
    key,
    patterns: hosts.split(",").filter((pattern) => pattern.length > 0)
  };
}
function parseKnownHostPublicKey(value, lineNumber) {
  const parsed = utils.parseKey(value);
  if (parsed instanceof Error) {
    throw createKnownHostsConfigurationError(lineNumber, parsed.message);
  }
  const parsedValues = Array.isArray(parsed) ? parsed : [parsed];
  const parsedKey = parsedValues[0];
  if (!isParsedKey(parsedKey)) {
    throw createKnownHostsConfigurationError(lineNumber, "does not contain a public key");
  }
  return parsedKey;
}
function isParsedKey(value) {
  return typeof value === "object" && value !== null && typeof value.getPublicSSH === "function";
}
function matchesKnownHosts(policy, key) {
  return policy.knownHosts?.some((entry) => knownHostEntryMatches(entry, policy, key)) === true;
}
function knownHostEntryMatches(entry, policy, key) {
  const candidates = createKnownHostCandidates(policy.host, policy.port);
  let hostMatched = false;
  for (const pattern of entry.patterns) {
    const negated = pattern.startsWith("!");
    const hostPattern = negated ? pattern.slice(1) : pattern;
    const patternMatched = candidates.some(
      (candidate) => knownHostPatternMatches(hostPattern, candidate)
    );
    if (negated && patternMatched) {
      return false;
    }
    if (patternMatched) {
      hostMatched = true;
    }
  }
  return hostMatched && entry.key.getPublicSSH().equals(key);
}
function createKnownHostCandidates(host, port) {
  const candidates = [host, `[${host}]:${port}`];
  return port === SFTP_DEFAULT_PORT ? candidates : [`[${host}]:${port}`, host];
}
function knownHostPatternMatches(pattern, candidate) {
  if (pattern.startsWith("|1|")) {
    return hashedKnownHostPatternMatches(pattern, candidate);
  }
  return wildcardKnownHostPatternToRegExp(pattern).test(candidate);
}
function wildcardKnownHostPatternToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}
function hashedKnownHostPatternMatches(pattern, candidate) {
  const [, version, saltText, hashText] = pattern.split("|");
  if (version !== "1" || saltText === void 0 || hashText === void 0) {
    return false;
  }
  const salt = import_node_buffer21.Buffer.from(saltText, "base64");
  const expected = import_node_buffer21.Buffer.from(hashText, "base64");
  const actual = (0, import_node_crypto10.createHmac)("sha1", salt).update(candidate).digest();
  return expected.byteLength === actual.byteLength && (0, import_node_crypto10.timingSafeEqual)(expected, actual);
}
function normalizeHostKeyPins(value) {
  if (value === void 0) {
    return void 0;
  }
  const pins = typeof value === "string" ? [value] : value;
  return new Set(pins.map((pin) => normalizeHostKeyPin(pin)));
}
function normalizeHostKeyPin(value) {
  const trimmed = value.trim();
  const hex = trimmed.replace(/:/g, "");
  if (hex.length === 64 && /^[a-f0-9]+$/i.test(hex)) {
    return import_node_buffer21.Buffer.from(hex, "hex").toString("base64").replace(/=+$/g, "");
  }
  const bare = trimmed.startsWith("SHA256:") ? trimmed.slice("SHA256:".length) : trimmed;
  return import_node_buffer21.Buffer.from(padBase642(bare), "base64").toString("base64").replace(/=+$/g, "");
}
function hashHostKey(key) {
  return (0, import_node_crypto10.createHash)("sha256").update(key).digest("base64").replace(/=+$/g, "");
}
function padBase642(value) {
  const remainder = value.length % 4;
  return remainder === 0 ? value : `${value}${"=".repeat(4 - remainder)}`;
}
function createKnownHostsConfigurationError(lineNumber, reason) {
  return new ConfigurationError({
    details: { lineNumber, provider: SFTP_PROVIDER_ID },
    message: `SFTP known_hosts line ${lineNumber} ${reason}`,
    protocol: "sftp",
    retryable: false
  });
}
function resolveSftpAuthentication(profile) {
  const agent = profile.ssh?.agent;
  const password = resolveOptionalTextCredential(profile.password, "password");
  const privateKey = profile.ssh?.privateKey;
  const passphrase = profile.ssh?.passphrase;
  const keyboardInteractive = profile.ssh?.keyboardInteractive;
  const username = requireTextCredential(profile.username, "username");
  const authHandler = [];
  if (privateKey !== void 0) {
    const method = {
      key: privateKey,
      type: "publickey",
      username
    };
    if (passphrase !== void 0) method.passphrase = passphrase;
    authHandler.push(method);
  }
  if (password !== void 0) {
    authHandler.push({
      password,
      type: "password",
      username
    });
  }
  if (agent !== void 0) {
    authHandler.push({
      agent,
      type: "agent",
      username
    });
  }
  if (keyboardInteractive !== void 0) {
    authHandler.push({
      prompt: (name, instructions, language, prompts, finish) => {
        handleKeyboardInteractiveChallenge(
          {
            instructions,
            language,
            name,
            prompts
          },
          keyboardInteractive,
          finish
        );
      },
      type: "keyboard-interactive",
      username
    });
  }
  if (authHandler.length === 0) {
    throw new ConfigurationError({
      details: { provider: SFTP_PROVIDER_ID },
      message: "SFTP profiles require a password, ssh.privateKey, ssh.agent, or ssh.keyboardInteractive",
      protocol: "sftp",
      retryable: false
    });
  }
  return { authHandler };
}
function handleKeyboardInteractiveChallenge(challenge, handler, finish) {
  Promise.resolve().then(() => handler(challenge)).then((answers) => finish(Array.from(answers))).catch(() => finish([]));
}
function openSftpSession(client, profile) {
  return new Promise((resolve, reject) => {
    client.sftp((error, sftp) => {
      if (error !== void 0) {
        reject(
          mapSftpError(error, {
            command: "SFTP",
            host: profile.host
          })
        );
        return;
      }
      resolve(sftp);
    });
  });
}
function readSftpDirectory(sftp, path2) {
  return new Promise((resolve, reject) => {
    sftp.readdir(path2, (error, entries) => {
      if (error !== void 0) {
        reject(error);
        return;
      }
      resolve(entries);
    });
  });
}
function readSftpStats(sftp, path2) {
  return new Promise((resolve, reject) => {
    sftp.lstat(path2, (error, stats) => {
      if (error !== void 0) {
        reject(error);
        return;
      }
      resolve(stats);
    });
  });
}
function sftpUnlink(sftp, path2) {
  return new Promise((resolve, reject) => {
    sftp.unlink(path2, (error) => {
      if (error !== void 0 && error !== null) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
function sftpRename(sftp, from, to) {
  return new Promise((resolve, reject) => {
    sftp.rename(from, to, (error) => {
      if (error !== void 0 && error !== null) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
function sftpMkdir(sftp, path2) {
  return new Promise((resolve, reject) => {
    sftp.mkdir(path2, (error) => {
      if (error !== void 0 && error !== null) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
function sftpRmdir(sftp, path2) {
  return new Promise((resolve, reject) => {
    sftp.rmdir(path2, (error) => {
      if (error !== void 0 && error !== null) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
async function* createSftpReadSource(sftp, path2, range, request) {
  if (range.length <= 0) {
    return;
  }
  const stream = sftp.createReadStream(path2, {
    end: range.offset + range.length - 1,
    start: range.offset
  });
  const closeOnAbort = () => stream.destroy();
  request.signal?.addEventListener("abort", closeOnAbort, { once: true });
  try {
    for await (const chunk of stream) {
      request.throwIfAborted();
      yield new Uint8Array(import_node_buffer21.Buffer.from(chunk));
    }
  } catch (error) {
    throw mapSftpError(error, { command: "READ", path: path2 });
  } finally {
    request.signal?.removeEventListener("abort", closeOnAbort);
  }
}
async function writeSftpContent(sftp, path2, request, offset) {
  const stream = createSftpWriteStream(sftp, path2, offset);
  const closeOnAbort = () => stream.destroy();
  let bytesTransferred = 0;
  request.signal?.addEventListener("abort", closeOnAbort, { once: true });
  try {
    for await (const chunk of request.content) {
      request.throwIfAborted();
      await writeSftpChunk(stream, chunk);
      bytesTransferred += chunk.byteLength;
      request.reportProgress(bytesTransferred, request.totalBytes);
    }
    await endSftpWriteStream(stream);
    return bytesTransferred;
  } catch (error) {
    stream.destroy();
    throw error;
  } finally {
    request.signal?.removeEventListener("abort", closeOnAbort);
  }
}
function createSftpWriteStream(sftp, path2, offset) {
  if (offset === void 0) {
    return sftp.createWriteStream(path2, { flags: "w" });
  }
  return sftp.createWriteStream(path2, { flags: "r+", start: offset });
}
function writeSftpChunk(stream, chunk) {
  if (chunk.byteLength === 0) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      stream.off("error", handleError);
    };
    const handleError = (error) => {
      cleanup();
      reject(error);
    };
    stream.once("error", handleError);
    stream.write(import_node_buffer21.Buffer.from(chunk), (error) => {
      cleanup();
      if (error != null) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
function endSftpWriteStream(stream) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      stream.off("close", handleClose);
      stream.off("error", handleError);
    };
    const handleClose = () => {
      cleanup();
      resolve();
    };
    const handleError = (error) => {
      cleanup();
      reject(error);
    };
    stream.once("close", handleClose);
    stream.once("error", handleError);
    stream.end();
  });
}
function resolveSftpReadRange(size, range) {
  if (range === void 0) {
    return { length: size, offset: 0 };
  }
  const requestedOffset = normalizeByteCount3(range.offset, "offset", "/");
  const requestedLength = range.length === void 0 ? size - Math.min(requestedOffset, size) : normalizeByteCount3(range.length, "length", "/");
  const offset = Math.min(requestedOffset, size);
  const length = Math.max(0, Math.min(requestedLength, size - offset));
  return { length, offset };
}
function normalizeOptionalByteCount3(value, field, path2) {
  return value === void 0 ? void 0 : normalizeByteCount3(value, field, path2);
}
function normalizeByteCount3(value, field, path2) {
  if (!Number.isFinite(value) || value < 0) {
    throw new ConfigurationError({
      details: { field, provider: SFTP_PROVIDER_ID },
      message: `SFTP provider ${field} must be a non-negative number`,
      path: path2,
      protocol: "sftp",
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
function mapSftpDirectoryEntry(directory, entry) {
  return mapSftpStats(joinRemotePath(directory, entry.filename), entry.filename, entry.attrs, {
    longname: entry.longname
  });
}
function mapSftpStats(path2, name, stats, raw = {}) {
  const entry = {
    group: String(stats.gid),
    name,
    owner: String(stats.uid),
    path: path2,
    permissions: { raw: formatSftpMode(stats.mode) },
    raw: {
      attrs: serializeSftpStats(stats),
      ...raw
    },
    type: mapSftpEntryType(stats)
  };
  const accessedAt = sftpSecondsToDate(stats.atime);
  const modifiedAt = sftpSecondsToDate(stats.mtime);
  entry.size = stats.size;
  entry.accessedAt = accessedAt;
  entry.modifiedAt = modifiedAt;
  return entry;
}
function mapSftpEntryType(stats) {
  if (stats.isFile()) return "file";
  if (stats.isDirectory()) return "directory";
  if (stats.isSymbolicLink()) return "symlink";
  return "unknown";
}
function serializeSftpStats(stats) {
  return {
    atime: stats.atime,
    gid: stats.gid,
    mode: stats.mode,
    mtime: stats.mtime,
    size: stats.size,
    uid: stats.uid
  };
}
function sftpSecondsToDate(value) {
  return new Date(value * 1e3);
}
function formatSftpMode(mode) {
  return mode.toString(8).padStart(6, "0");
}
function normalizeSftpPath(path2) {
  return normalizeRemotePath(path2);
}
function compareEntries5(left, right) {
  return left.path.localeCompare(right.path);
}
function requireTextCredential(value, field) {
  const text = resolveOptionalTextCredential(value, field);
  if (text === void 0) {
    throw new ConfigurationError({
      details: { field, provider: SFTP_PROVIDER_ID },
      message: `SFTP profiles require a ${field}`,
      protocol: "sftp",
      retryable: false
    });
  }
  return text;
}
function resolveOptionalTextCredential(value, field) {
  if (value === void 0) {
    return void 0;
  }
  const text = import_node_buffer21.Buffer.isBuffer(value) ? value.toString("utf8") : value;
  if (text.length === 0) {
    throw new ConfigurationError({
      details: { field, provider: SFTP_PROVIDER_ID },
      message: `SFTP profile ${field} must be non-empty`,
      protocol: "sftp",
      retryable: false
    });
  }
  return text;
}
function validateSftpProviderOptions(options) {
  if (options.readyTimeoutMs !== void 0 && (!Number.isFinite(options.readyTimeoutMs) || options.readyTimeoutMs <= 0)) {
    throw new ConfigurationError({
      details: { readyTimeoutMs: options.readyTimeoutMs },
      message: "SFTP provider readyTimeoutMs must be a positive finite number",
      protocol: "sftp",
      retryable: false
    });
  }
}
function createSftpPathNotFoundError(path2, message) {
  return new PathNotFoundError({
    details: { provider: SFTP_PROVIDER_ID },
    message,
    path: path2,
    protocol: "sftp",
    retryable: false
  });
}
function throwIfAborted3(signal, path2, operation) {
  if (signal?.aborted !== true) {
    return;
  }
  throw new AbortError({
    details: { operation },
    message: `SFTP ${operation} was aborted`,
    path: path2,
    protocol: "sftp",
    retryable: false
  });
}
function mapSftpConnectionError(error, host) {
  if (error instanceof ZeroTransferError) {
    return error;
  }
  if (isSftpAuthenticationError(error)) {
    return new AuthenticationError({
      cause: error,
      host,
      message: "SFTP authentication failed",
      protocol: "sftp",
      retryable: false
    });
  }
  return new ConnectionError({
    cause: error,
    details: { originalMessage: getErrorMessage(error) },
    host,
    message: `SFTP connection failed: ${getErrorMessage(error)}`,
    protocol: "sftp",
    retryable: true
  });
}
function mapSftpError(error, context) {
  if (error instanceof ZeroTransferError) {
    return error;
  }
  const sftpCode = getSftpStatusCode(error);
  const baseDetails = createSftpErrorBase(error, context, sftpCode);
  if (sftpCode === 2 || isMissingPathMessage(error)) {
    return new PathNotFoundError({
      ...baseDetails,
      message: `SFTP path not found: ${context.path ?? "unknown"}`,
      retryable: false
    });
  }
  if (sftpCode === 3) {
    return new PermissionDeniedError({
      ...baseDetails,
      message: `SFTP permission denied: ${context.path ?? context.command}`,
      retryable: false,
      sftpCode
    });
  }
  return new ProtocolError({
    ...baseDetails,
    details: { originalMessage: getErrorMessage(error) },
    message: `SFTP ${context.command} failed: ${getErrorMessage(error)}`,
    retryable: sftpCode === 6 || sftpCode === 7
  });
}
function createSftpErrorBase(error, context, sftpCode) {
  const base = {
    cause: error,
    command: context.command,
    protocol: "sftp"
  };
  if (context.host !== void 0) base.host = context.host;
  if (context.path !== void 0) base.path = context.path;
  if (sftpCode !== void 0) base.sftpCode = sftpCode;
  return base;
}
function getSftpStatusCode(error) {
  const code = isRecord2(error) ? error.code : void 0;
  if (typeof code === "number") {
    return code;
  }
  return void 0;
}
function isSftpAuthenticationError(error) {
  if (!isRecord2(error)) {
    return false;
  }
  const level = error.level;
  const message = getErrorMessage(error).toLowerCase();
  return level === "client-authentication" || message.includes("authentication");
}
function isMissingPathMessage(error) {
  return /no such file|not found/i.test(getErrorMessage(error));
}
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}
function noop() {
}

// src/providers/classic/sftp/jumpHost.ts
var import_node_buffer22 = require("buffer");
var import_ssh22 = __toESM(require("ssh2"));
var { Client: SshClientCtor2 } = import_ssh22.default;
function createSftpJumpHostSocketFactory(options) {
  if (options.bastion === void 0 && options.buildBastion === void 0) {
    throw new ConfigurationError({
      code: "sftp_jump_host_config_missing",
      message: "createSftpJumpHostSocketFactory requires either bastion or buildBastion",
      retryable: false
    });
  }
  return async (context) => {
    const config = options.buildBastion ? await options.buildBastion(context) : options.bastion;
    return openJumpHostChannel({
      bastionConfig: config,
      context,
      ...options.createClient !== void 0 ? { createClient: options.createClient } : {},
      ...options.logger !== void 0 ? { logger: options.logger } : {}
    });
  };
}
function openJumpHostChannel(options) {
  const { bastionConfig, context } = options;
  const client = options.createClient ? options.createClient() : new SshClientCtor2();
  if (context.signal?.aborted === true) {
    return Promise.reject(
      new AbortError({
        details: { operation: "jump-host" },
        host: context.host,
        message: "SFTP jump-host tunnel was aborted before opening",
        protocol: "sftp",
        retryable: false
      })
    );
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      cleanup();
      client.end();
      reject(
        new AbortError({
          details: { operation: "jump-host" },
          host: context.host,
          message: "SFTP jump-host tunnel was aborted",
          protocol: "sftp",
          retryable: false
        })
      );
    };
    const cleanup = () => {
      context.signal?.removeEventListener("abort", onAbort);
    };
    context.signal?.addEventListener("abort", onAbort, { once: true });
    client.once("error", (error) => {
      cleanup();
      reject(
        new ConnectionError({
          cause: error,
          details: { stage: "bastion-connect" },
          host: context.host,
          message: `SFTP jump-host bastion connection failed: ${error.message}`,
          protocol: "sftp",
          retryable: true
        })
      );
    });
    client.once("ready", () => {
      client.forwardOut("127.0.0.1", 0, context.host, context.port, (error, channel) => {
        if (error) {
          cleanup();
          client.end();
          reject(
            new ConnectionError({
              cause: error,
              details: { destination: `${context.host}:${String(context.port)}` },
              host: context.host,
              message: `SFTP jump-host forwardOut failed: ${error.message}`,
              protocol: "sftp",
              retryable: true
            })
          );
          return;
        }
        const closeBastion = () => {
          cleanup();
          client.end();
        };
        channel.once("close", closeBastion);
        channel.once("error", closeBastion);
        options.logger?.debug?.({
          destination: `${context.host}:${String(context.port)}`,
          level: "debug",
          message: "sftp jump-host channel opened"
        });
        resolve(channel);
      });
    });
    try {
      client.connect(normalizeBastionConfig(bastionConfig));
    } catch (error) {
      cleanup();
      const cause = error instanceof Error ? error : new Error(String(error));
      reject(
        new ConnectionError({
          cause,
          details: { stage: "bastion-connect" },
          host: context.host,
          message: `SFTP jump-host bastion connection failed: ${cause.message}`,
          protocol: "sftp",
          retryable: true
        })
      );
    }
  });
}
function normalizeBastionConfig(config) {
  const cloned = { ...config };
  if (typeof cloned.privateKey === "string") {
    cloned.privateKey = import_node_buffer22.Buffer.from(cloned.privateKey);
  }
  return cloned;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
  createLocalProviderFactory,
  createMemoryProviderFactory,
  createNativeSftpProviderFactory,
  createOAuthTokenSecretSource,
  createProgressEvent,
  createProviderTransferExecutor,
  createRemoteBrowser,
  createRemoteManifest,
  createSftpJumpHostSocketFactory,
  createSftpProviderFactory,
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
});
//# sourceMappingURL=index.cjs.map