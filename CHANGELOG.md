# Changelog

## [1.2.0] - 2026-02-02

### Changed
- **Major refactoring**: Improved separation of concerns
  - `index.js` now serves as simple entry point
  - Implementation moved to organized `lib/` structure:
    - `lib/FTPClient.js` - Main class definition
    - `lib/connection.js` - Connection and authentication logic
    - `lib/commands.js` - All FTP command implementations
    - `lib/utils.js` - Helper functions
- Better code maintainability and readability
- No breaking changes - API remains identical

## [1.1.0] - 2026-02-02

### Added
- `ensureDir(dirPath, recursive)` - Ensure directory exists, creating parent directories if needed
- `ensureParentDir(filePath)` - Ensure parent directory exists for a file path
- `uploadFile(data, remotePath, ensureDir)` - Upload with automatic directory creation
- Utility library (`lib/utils.js`) for better code organization
- Helper functions for FTP command parsing and path manipulation

### Changed
- Refactored internal code structure for better maintainability
- Improved path normalization across all directory operations
- Better error handling for directory creation

### Improved
- Cleaner API for common operations
- Reduced boilerplate code needed for directory handling
- More consistent error messages

## [1.0.1] - 2026-02-02

### Fixed
- Updated repository URLs to correct GitHub location

## [1.0.0] - 2026-02-02

### Initial Release
- Zero dependencies FTP client using native Node.js TCP sockets
- Promise-based API with async/await support
- Passive mode (PASV) for data transfers
- Debug logging with configurable options
- Connection keep-alive and timeout configuration
- Upload/download files with Buffer support
- Directory operations (list, cd, mkdir, pwd)
- File operations (delete, rename, size, exists, modifiedTime)
- Connection statistics tracking
- Event-based architecture
