const net = require('net');
const { normalizePath, getParentDir, parseMdtmResponse } = require('./utils');

/**
 * FTP command implementations
 */
class FTPCommands {
  constructor(client) {
    this.client = client;
    this.connection = client._connection;
  }

  /**
   * Upload file to FTP server
   * @param {string|Buffer} data - File data
   * @param {string} remotePath - Remote file path
   * @returns {Promise<void>}
   */
  async upload(data, remotePath) {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    this.client._debug(`Uploading ${buffer.length} bytes to ${remotePath}`);
    const { host, port } = await this.connection.enterPassiveMode();

    return new Promise((resolve, reject) => {
      let commandSent = false;

      this.client.dataSocket = net.createConnection({ host, port }, () => {
        // Send STOR command to start upload (expects 150, then 226)
        if (!commandSent) {
          commandSent = true;
          this.client._debug(`Data connection established for upload`);
          this.connection.sendCommand(`STOR ${remotePath}`, true).catch(reject);
          
          // Write data to data socket
          this.client.dataSocket.write(buffer);
          this.client.dataSocket.end();
        }
      });

      this.client.dataSocket.on('error', reject);

      this.client.dataSocket.on('close', () => {
        // Wait for final response from control socket
        const finalHandler = (line) => {
          const code = parseInt(line.substring(0, 3));
          if (code === 226 || code === 250) {
            this.client.removeListener('response', finalHandler);
            this.client._debug(`Upload completed successfully`);
            resolve();
          } else if (code >= 400) {
            this.client.removeListener('response', finalHandler);
            reject(new Error(`FTP Error ${code}: ${line.substring(4)}`));
          }
        };
        this.client.on('response', finalHandler);
        
        // Timeout if no response
        setTimeout(() => {
          this.client.removeListener('response', finalHandler);
          resolve();
        }, 5000);
      });
    });
  }

  /**
   * Download file from FTP server
   * @param {string} remotePath - Remote file path
   * @returns {Promise<Buffer>}
   */
  async download(remotePath) {
    this.client._debug(`Downloading ${remotePath}`);
    const { host, port } = await this.connection.enterPassiveMode();

    return new Promise((resolve, reject) => {
      const chunks = [];
      let commandSent = false;

      this.client.dataSocket = net.createConnection({ host, port }, () => {
        // Send RETR command to start download (expects 150, then 226)
        if (!commandSent) {
          commandSent = true;
          this.client._debug(`Data connection established for download`);
          this.connection.sendCommand(`RETR ${remotePath}`, true).catch(reject);
        }
      });

      this.client.dataSocket.on('data', (chunk) => {
        chunks.push(chunk);
        this.client._debug(`Received ${chunk.length} bytes`);
      });

      this.client.dataSocket.on('error', reject);

      this.client.dataSocket.on('close', () => {
        // Wait for final 226 response
        const finalHandler = (line) => {
          const code = parseInt(line.substring(0, 3));
          if (code === 226 || code === 250) {
            this.client.removeListener('response', finalHandler);
            const result = Buffer.concat(chunks);
            this.client._debug(`Download completed: ${result.length} bytes`);
            resolve(result);
          } else if (code >= 400) {
            this.client.removeListener('response', finalHandler);
            reject(new Error(`FTP Error ${code}: ${line.substring(4)}`));
          }
        };
        this.client.on('response', finalHandler);
        
        // Timeout if no response
        setTimeout(() => {
          this.client.removeListener('response', finalHandler);
          if (chunks.length > 0) {
            resolve(Buffer.concat(chunks));
          }
        }, 5000);
      });
    });
  }

  /**
   * List directory contents
   * @param {string} [path='.'] - Directory path
   * @returns {Promise<string>}
   */
  async list(path = '.') {
    this.client._debug(`Listing directory: ${path}`);
    const { host, port } = await this.connection.enterPassiveMode();

    return new Promise((resolve, reject) => {
      const chunks = [];
      let commandSent = false;

      this.client.dataSocket = net.createConnection({ host, port }, () => {
        if (!commandSent) {
          commandSent = true;
          this.connection.sendCommand(`LIST ${path}`, true).catch(reject);
        }
      });

      this.client.dataSocket.on('data', (chunk) => {
        chunks.push(chunk);
      });

      this.client.dataSocket.on('error', reject);

      this.client.dataSocket.on('close', () => {
        // Wait for final 226 response
        const finalHandler = (line) => {
          const code = parseInt(line.substring(0, 3));
          if (code === 226 || code === 250) {
            this.client.removeListener('response', finalHandler);
            resolve(Buffer.concat(chunks).toString('utf8'));
          }
        };
        this.client.on('response', finalHandler);
        
        // Timeout fallback
        setTimeout(() => {
          this.client.removeListener('response', finalHandler);
          resolve(Buffer.concat(chunks).toString('utf8'));
        }, 3000);
      });
    });
  }

  /**
   * Change working directory
   * @param {string} path - Directory path
   * @returns {Promise<void>}
   */
  async cd(path) {
    await this.connection.sendCommand(`CWD ${path}`);
  }

  /**
   * Get current working directory
   * @returns {Promise<string>}
   */
  async pwd() {
    const response = await this.connection.sendCommand('PWD');
    const match = response.message.match(/"(.+)"/);
    return match ? match[1] : '/';
  }

  /**
   * Create directory
   * @param {string} path - Directory path
   * @returns {Promise<void>}
   */
  async mkdir(path) {
    await this.connection.sendCommand(`MKD ${path}`);
  }

  /**
   * Delete file
   * @param {string} path - File path
   * @returns {Promise<void>}
   */
  async delete(path) {
    await this.connection.sendCommand(`DELE ${path}`);
  }

  /**
   * Rename file
   * @param {string} from - Current name
   * @param {string} to - New name
   * @returns {Promise<void>}
   */
  async rename(from, to) {
    await this.connection.sendCommand(`RNFR ${from}`);
    await this.connection.sendCommand(`RNTO ${to}`);
  }

  /**
   * Get file size
   * @param {string} path - File path
   * @returns {Promise<number>}
   */
  async size(path) {
    this.client._debug(`Getting size of ${path}`)
    const response = await this.connection.sendCommand(`SIZE ${path}`);
    return parseInt(response.message);
  }

  /**
   * Check if file or directory exists
   * @param {string} path - File or directory path
   * @returns {Promise<boolean>}
   */
  async exists(path) {
    try {
      await this.size(path);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Ensure directory exists, creating it if necessary
   * @param {string} dirPath - Directory path to ensure exists
   * @param {boolean} recursive - Create parent directories if needed (default: true)
   * @returns {Promise<void>}
   */
  async ensureDir(dirPath, recursive = true) {
    this.client._debug(`Ensuring directory exists: ${dirPath}`);
    
    // Normalize path
    const normalized = normalizePath(dirPath);
    if (normalized === '/' || normalized === '.') {
      return; // Root or current directory always exists
    }

    // Try to cd to the directory
    try {
      await this.cd(normalized);
      this.client._debug(`Directory already exists: ${normalized}`);
      return;
    } catch (err) {
      this.client._debug(`Directory doesn't exist: ${normalized}`);
    }

    // If recursive, ensure parent directory exists first
    if (recursive) {
      const parentDir = normalized.substring(0, normalized.lastIndexOf('/')) || '/';
      if (parentDir !== '/' && parentDir !== '.') {
        await this.ensureDir(parentDir, true);
      }
    }

    // Create the directory
    try {
      await this.mkdir(normalized);
      this.client._debug(`Created directory: ${normalized}`);
    } catch (err) {
      // Ignore error if directory was created by another process
      if (!err.message.includes('550') && !err.message.includes('exists')) {
        throw err;
      }
    }
  }

  /**
   * Ensure parent directory exists for a file path
   * @param {string} filePath - File path
   * @returns {Promise<void>}
   */
  async ensureParentDir(filePath) {
    const parentDir = getParentDir(filePath);
    if (parentDir && parentDir !== '.' && parentDir !== '/') {
      await this.ensureDir(parentDir);
    }
  }

  /**
   * Upload file and ensure parent directory exists
   * @param {string|Buffer} data - File data
   * @param {string} remotePath - Remote file path
   * @param {boolean} ensureDir - Ensure parent directory exists (default: false)
   * @returns {Promise<void>}
   */
  async uploadFile(data, remotePath, ensureDir = false) {
    if (ensureDir) {
      await this.ensureParentDir(remotePath);
    }
    return this.upload(data, remotePath);
  }

  /**
   * Get file modification time
   * @param {string} path - File path
   * @returns {Promise<Date>}
   */
  async modifiedTime(path) {
    this.client._debug(`Getting modification time of ${path}`);
    const response = await this.connection.sendCommand(`MDTM ${path}`);
    return parseMdtmResponse(response.message);
  }
}

module.exports = FTPCommands;
