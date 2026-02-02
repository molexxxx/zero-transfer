const { EventEmitter } = require('events');
const FTPConnection = require('./connection');
const FTPCommands = require('./commands');

/**
 * Lightweight FTP Client using native Node.js TCP sockets (net module)
 */
class FTPClient extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Connection state
    this.socket = null;
    this.dataSocket = null;
    this.buffer = '';
    this.connected = false;
    this.authenticated = false;
    
    // Configuration
    this.debug = options.debug || false;
    this.timeout = options.timeout || 30000;
    this.keepAlive = options.keepAlive !== false;
    this._log = options.logger || console.log;
    
    // Statistics
    this._commandCount = 0;
    this._lastCommand = null;
    
    // Initialize subsystems
    this._connection = new FTPConnection(this);
    this._commands = new FTPCommands(this);
  }

  /**
   * Log message if debug is enabled
   * @private
   */
  _debug(...args) {
    if (this.debug && this._log) {
      this._log('[FTP Debug]', ...args);
    }
  }

  /**
   * Connect to FTP server
   * @param {Object} options - Connection options
   * @param {string} options.host - FTP server host
   * @param {number} [options.port=21] - FTP server port
   * @param {string} [options.user='anonymous'] - Username
   * @param {string} [options.password='anonymous@'] - Password
   * @returns {Promise<void>}
   */
  async connect(options) {
    return this._connection.connect(options);
  }

  /**
   * Upload file to FTP server
   * @param {string|Buffer} data - File data
   * @param {string} remotePath - Remote file path
   * @returns {Promise<void>}
   */
  async upload(data, remotePath) {
    return this._commands.upload(data, remotePath);
  }

  /**
   * Download file from FTP server
   * @param {string} remotePath - Remote file path
   * @returns {Promise<Buffer>}
   */
  async download(remotePath) {
    return this._commands.download(remotePath);
  }

  /**
   * List directory contents
   * @param {string} [path='.'] - Directory path
   * @returns {Promise<string>}
   */
  async list(path = '.') {
    return this._commands.list(path);
  }

  /**
   * Change working directory
   * @param {string} path - Directory path
   * @returns {Promise<void>}
   */
  async cd(path) {
    return this._commands.cd(path);
  }

  /**
   * Get current working directory
   * @returns {Promise<string>}
   */
  async pwd() {
    return this._commands.pwd();
  }

  /**
   * Create directory
   * @param {string} path - Directory path
   * @returns {Promise<void>}
   */
  async mkdir(path) {
    return this._commands.mkdir(path);
  }

  /**
   * Delete file
   * @param {string} path - File path
   * @returns {Promise<void>}
   */
  async delete(path) {
    return this._commands.delete(path);
  }

  /**
   * Rename file
   * @param {string} from - Current name
   * @param {string} to - New name
   * @returns {Promise<void>}
   */
  async rename(from, to) {
    return this._commands.rename(from, to);
  }

  /**
   * Get file size
   * @param {string} path - File path
   * @returns {Promise<number>}
   */
  async size(path) {
    return this._commands.size(path);
  }

  /**
   * Check if file or directory exists
   * @param {string} path - File or directory path
   * @returns {Promise<boolean>}
   */
  async exists(path) {
    return this._commands.exists(path);
  }

  /**
   * Ensure directory exists, creating it if necessary
   * @param {string} dirPath - Directory path to ensure exists
   * @param {boolean} recursive - Create parent directories if needed (default: true)
   * @returns {Promise<void>}
   */
  async ensureDir(dirPath, recursive = true) {
    return this._commands.ensureDir(dirPath, recursive);
  }

  /**
   * Ensure parent directory exists for a file path
   * @param {string} filePath - File path
   * @returns {Promise<void>}
   */
  async ensureParentDir(filePath) {
    return this._commands.ensureParentDir(filePath);
  }

  /**
   * Upload file and ensure parent directory exists
   * @param {string|Buffer} data - File data
   * @param {string} remotePath - Remote file path
   * @param {boolean} ensureDir - Ensure parent directory exists (default: false)
   * @returns {Promise<void>}
   */
  async uploadFile(data, remotePath, ensureDir = false) {
    return this._commands.uploadFile(data, remotePath, ensureDir);
  }

  /**
   * Get file modification time
   * @param {string} path - File path
   * @returns {Promise<Date>}
   */
  async modifiedTime(path) {
    return this._commands.modifiedTime(path);
  }

  /**
   * Get connection statistics
   * @returns {Object}
   */
  getStats() {
    return {
      connected: this.connected,
      authenticated: this.authenticated,
      commandCount: this._commandCount,
      lastCommand: this._lastCommand
    };
  }

  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Enable debug mode
   */
  setDebug(enabled) {
    this.debug = enabled;
    this._debug(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Close connection
   * @returns {Promise<void>}
   */
  async close() {
    return this._connection.close();
  }

  /**
   * Disconnect (alias for close)
   * @returns {Promise<void>}
   */
  async disconnect() {
    return this.close();
  }
}

module.exports = FTPClient;
