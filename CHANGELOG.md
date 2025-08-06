# Changelog

All notable changes to this project will be documented in this file.

## [2.3.0] - 2025-08-06

### 🚀 New Features
- **Pollinations.ai Integration**: Added image generation capabilities
- **API Documentation**: Added Swagger/OpenAPI documentation at `/api-docs`
- **Landing Page**: Created a professional landing page for the API
- **New Art Styles**: Added 10+ new art styles to the library
- **Batch Scripts**: Added `start_services.bat` and `cleanup.bat` for easier development
- **Image Generation**: Added web interface and CLI support for generating images

### 🛠️ Developer Experience
- **Code Organization**: Refactored API into modular route files
- **Error Handling**: Improved error messages and validation
- **Documentation**: Enhanced API documentation with examples
- **Versioning**: Updated version to 2.3.0 for the new release
- **Dependencies**: Added new dependencies for image generation and validation

### 🧹 Maintenance
- **Dependencies**: Updated all npm packages to latest versions
- **Cleanup**: Removed unnecessary files and improved project structure
- **Performance**: Optimized prompt generation and style handling

## [2.2.5] - 2025-08-06

### 🧹 Code Cleanup & Maintenance
- **Repository Cleanup**: Removed unnecessary and temporary files
- **Documentation Update**: Enhanced README with detailed setup instructions
- **Dependency Updates**: Ensured all dependencies are up-to-date
- **Bug Fixes**: Addressed minor issues in the web interface and API

### 🛠️ Developer Experience
- **Improved Build Process**: Streamlined development and production builds
- **Better Error Handling**: Enhanced error messages and logging
- **Code Organization**: Improved project structure and file organization


## [2.2.0] - 2025-01-05

### 🚀 Major Features Added
- **Advanced CLI Rewrite**: Complete 600+ line professional CLI implementation
- **Batch Processing System**: Parallel processing with up to 5 threads and progress tracking
- **Analytics & Metrics**: Comprehensive usage statistics, popular styles, daily patterns
- **Multi-format Export**: JSON, CSV, TXT export for all commands and data
- **Quality Control System**: 10-level quality scoring with professional enhancement terms

### ✨ Enhanced Features
- **Configuration Management**: Persistent settings with custom themes and preferences
- **History Tracking**: Complete command history with search and export capabilities  
- **Fuzzy Search Engine**: Intelligent search across styles, artists, subjects, themes
- **Mood Variations**: 5 mood types (dramatic, epic, peaceful, vibrant, mysterious)
- **Professional UI**: Beautiful ASCII banners, colored tables, custom borders
- **Performance Optimization**: Intelligent caching, spinners, progress indicators

### 🛠 Technical Improvements
- **Error Handling**: Robust error handling across all modules
- **Memory Management**: Optimized data loading and caching
- **Cross-platform**: Enhanced Windows, macOS, Linux compatibility
- **Dependency Management**: Removed problematic dependencies (ora, inquirer, boxen)
- **Custom Implementations**: Built-in replacements for external dependencies

### 🎨 New Commands
- `perchance-prompts batch` - Advanced batch generation with parallel processing
- `perchance-prompts stats` - Detailed usage analytics and metrics
- `perchance-prompts config` - Configuration management system
- `perchance-prompts history` - Command history with export
- Enhanced `generate` with mood, quality, verbose options
- Enhanced `styles/subjects/artists/themes` with search and export

### 🔧 Developer Experience
- **Testing Scripts**: Automated CLI testing capabilities
- **Documentation**: Comprehensive README with examples
- **Release Process**: Automated versioning and publishing
- **Code Quality**: ESLint integration and code standards

## [2.1.6] - 2025-01-04

### 🔧 Bug Fixes
- Fixed package.json syntax errors
- Resolved CLI dependency issues
- Improved data loading error handling
- Fixed NPM link functionality

### 📊 Data Updates
- Enhanced styles.json with more detailed descriptions
- Expanded artists database with popularity metrics
- Added theme categories with age group specifications
- Improved subject categorization

## [2.1.0] - 2024-12-20

### 🎯 Initial Release
- Basic CLI functionality
- Core encyclopedia data (styles, subjects, artists, themes)
- Simple prompt generation
- NPM package structure
- Basic documentation

---

### Legend
- 🚀 Major Features
- ✨ Enhancements  
- 🔧 Bug Fixes
- 📊 Data Updates
- 🛠 Technical Changes
