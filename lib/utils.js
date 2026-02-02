/**
 * FTP Command helpers
 * Utilities for building and parsing FTP commands
 */

/**
 * Parse PASV response to extract host and port
 * @param {string} message - PASV response message
 * @returns {Object} - { host, port }
 */
function parsePasvResponse(message) {
  const match = message.match(/\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
  
  if (!match) {
    throw new Error('Failed to parse PASV response');
  }

  const host = `${match[1]}.${match[2]}.${match[3]}.${match[4]}`;
  const port = parseInt(match[5]) * 256 + parseInt(match[6]);

  return { host, port };
}

/**
 * Parse MDTM response to Date object
 * @param {string} message - MDTM response message
 * @returns {Date}
 */
function parseMdtmResponse(message) {
  const match = message.match(/(\d{14})/);
  if (!match) {
    throw new Error('Failed to parse MDTM response');
  }

  const str = match[1];
  const year = parseInt(str.substring(0, 4));
  const month = parseInt(str.substring(4, 6)) - 1;
  const day = parseInt(str.substring(6, 8));
  const hour = parseInt(str.substring(8, 10));
  const minute = parseInt(str.substring(10, 12));
  const second = parseInt(str.substring(12, 14));
  
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Normalize FTP path
 * @param {string} path - Path to normalize
 * @returns {string}
 */
function normalizePath(path) {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}

/**
 * Get parent directory path
 * @param {string} filePath - File path
 * @returns {string}
 */
function getParentDir(filePath) {
  const normalized = normalizePath(filePath);
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash <= 0) {
    return '/';
  }
  return normalized.substring(0, lastSlash);
}

/**
 * Mask password in command for logging
 * @param {string} command - FTP command
 * @returns {string}
 */
function maskPassword(command) {
  return command.startsWith('PASS ') ? 'PASS ********' : command;
}

module.exports = {
  parsePasvResponse,
  parseMdtmResponse,
  normalizePath,
  getParentDir,
  maskPassword
};
