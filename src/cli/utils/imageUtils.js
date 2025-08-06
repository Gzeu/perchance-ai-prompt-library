const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const chalk = require('chalk');

/**
 * Validate image dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {boolean} True if dimensions are valid
 */
function validateDimensions(width, height) {
  if (typeof width !== 'number' || typeof height !== 'number') {
    throw new Error('Width and height must be numbers');
  }
  
  if (width < 64 || width > 2048 || height < 64 || height > 2048) {
    throw new Error('Width and height must be between 64 and 2048 pixels');
  }
  
  return true;
}

/**
 * Validate and parse the output path
 * @param {string} outputPath - The output path
 * @returns {Promise<string>} Resolved absolute path
 */
async function validateOutputPath(outputPath) {
  try {
    // Resolve to absolute path
    const absPath = path.isAbsolute(outputPath) 
      ? outputPath 
      : path.resolve(process.cwd(), outputPath);
    
    // Check if path exists and is a directory
    const stats = await fs.stat(absPath).catch(() => null);
    
    if (stats) {
      if (!stats.isDirectory()) {
        throw new Error(`Output path exists but is not a directory: ${absPath}`);
      }
      // Check if directory is writable
      await fs.access(absPath, fs.constants.W_OK);
    } else {
      // Create directory if it doesn't exist
      await fs.mkdir(absPath, { recursive: true });
    }
    
    return absPath;
  } catch (error) {
    throw new Error(`Invalid output path '${outputPath}': ${error.message}`);
  }
}

/**
 * Generate a safe filename from a prompt
 * @param {string} prompt - The prompt text
 * @param {string} [extension='png'] - File extension
 * @returns {string} Safe filename
 */
function generateSafeFilename(prompt, extension = 'png') {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }
  
  // Limit length and clean up the prompt for filename
  let safeName = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 100); // Limit length
  
  // Add timestamp
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('.')[0];
  
  return `${safeName || 'generated-image'}-${timestamp}.${extension.replace(/^\./, '')}`;
}

/**
 * Save image buffer to file with proper error handling
 * @param {Buffer} buffer - Image buffer
 * @param {string} filePath - Output file path
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.overwrite=false] - Overwrite existing file
 * @returns {Promise<string>} Path to the saved file
 */
async function saveImage(buffer, filePath, { overwrite = false } = {}) {
  try {
    const absPath = path.resolve(process.cwd(), filePath);
    const dir = path.dirname(absPath);
    
    // Ensure directory exists
    await fs.ensureDir(dir);
    
    // Check if file exists
    if (!overwrite && await fs.pathExists(absPath)) {
      throw new Error(`File already exists: ${absPath}`);
    }
    
    // Save the file
    await fs.writeFile(absPath, buffer);
    return absPath;
  } catch (error) {
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

/**
 * Resize image to specified dimensions
 * @param {Buffer} buffer - Input image buffer
 * @param {Object} options - Resize options
 * @param {number} [options.width] - Target width
 * @param {number} [options.height] - Target height
 * @param {string} [options.fit='cover'] - Resize mode (cover, contain, fill, inside, outside)
 * @returns {Promise<Buffer>} Resized image buffer
 */
async function resizeImage(buffer, { width, height, fit = 'cover' }) {
  try {
    if (!width && !height) {
      throw new Error('At least one of width or height must be specified');
    }
    
    return await sharp(buffer)
      .resize({
        width,
        height,
        fit,
        withoutEnlargement: true,
      })
      .toBuffer();
  } catch (error) {
    throw new Error(`Failed to resize image: ${error.message}`);
  }
}

/**
 * Convert image to specified format
 * @param {Buffer} buffer - Input image buffer
 * @param {string} format - Output format (jpeg, png, webp, etc.)
 * @param {Object} [options] - Format-specific options
 * @returns {Promise<Buffer>} Converted image buffer
 */
async function convertImage(buffer, format, options = {}) {
  try {
    let sharpInstance = sharp(buffer);
    
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return await sharpInstance.jpeg({ quality: options.quality || 90 }).toBuffer();
      case 'png':
        return await sharpInstance.png({ compressionLevel: options.compressionLevel || 6 }).toBuffer();
      case 'webp':
        return await sharpInstance.webp({ quality: options.quality || 80 }).toBuffer();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    throw new Error(`Failed to convert image: ${error.message}`);
  }
}

/**
 * Get image metadata
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<Object>} Image metadata
 */
async function getImageMetadata(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.icc !== undefined,
      isProgressive: metadata.isProgressive,
      colorSpace: metadata.space,
      channels: metadata.channels,
    };
  } catch (error) {
    throw new Error(`Failed to get image metadata: ${error.message}`);
  }
}

/**
 * Log image information to console
 * @param {string} filePath - Path to the image file
 */
async function logImageInfo(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);
    const metadata = await getImageMetadata(buffer);
    
    console.log(chalk.cyan.bold('\nImage Information:'));
    console.log(chalk.dim('----------------------------------------'));
    console.log(`  ${chalk.bold('Path:')} ${filePath}`);
    console.log(`  ${chalk.bold('Size:')} ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`  ${chalk.bold('Dimensions:')} ${metadata.width}×${metadata.height}px`);
    console.log(`  ${chalk.bold('Format:')} ${metadata.format.toUpperCase()}`);
    console.log(`  ${chalk.bold('Color Space:')} ${metadata.colorSpace}`);
    console.log(`  ${chalk.bold('Channels:')} ${metadata.channels} (${metadata.hasAlpha ? 'with alpha' : 'no alpha'})`);
    console.log(chalk.dim('----------------------------------------\n'));
    
    return metadata;
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not read image info: ${error.message}`));
    return null;
  }
}

module.exports = {
  validateDimensions,
  validateOutputPath,
  generateSafeFilename,
  saveImage,
  resizeImage,
  convertImage,
  getImageMetadata,
  logImageInfo,
};
