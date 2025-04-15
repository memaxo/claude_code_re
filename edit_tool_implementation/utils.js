const fs = require('fs');
const path = require('path');

/**
 * Read a file and return its contents.
 * @param {string} filePath - Absolute path to the file
 * @returns {string} - The file content as string
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    // Return null for non-existent files (for new file creation case)
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;  // Re-throw other errors
  }
}

/**
 * Write content to a file, creating directories if needed.
 * @param {string} filePath - Absolute path to the file
 * @param {string} content - Content to write to the file
 */
function writeFile(filePath, content) {
  try {
    // Ensure the directory exists
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing to file: ${error.message}`);
    throw error;
  }
}

/**
 * Check if a path is an absolute path.
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if absolute path
 */
function isAbsolutePath(filePath) {
  return path.isAbsolute(filePath);
}

/**
 * Get the relative path from the current working directory.
 * @param {string} filePath - Absolute file path
 * @returns {string} - Relative path
 */
function getRelativePath(workingDir, filePath) {
  try {
    return path.relative(workingDir, filePath);
  } catch (error) {
    return filePath;
  }
}

/**
 * Get the current working directory.
 * @returns {string} - Current working directory
 */
function getWorkingDirectory() {
  return process.cwd();
}

/**
 * Apply character replacements to a string.
 * Useful for handling special characters and edge cases.
 * @param {string} input - String to apply replacements to
 * @returns {object} - Object with result and applied replacements
 */
function applyCharacterReplacements(input) {
  // Character replacement mappings
  const characterReplacements = {
    '\r\n': '\n',            // Normalize Windows line endings
    '\u2028': '\n',          // Line separator
    '\u2029': '\n',          // Paragraph separator
    '\u00A0': ' ',           // Non-breaking space
    '\u1680': ' ',           // Ogham space mark
    '\u2000': ' ',           // En quad
    '\u2001': ' ',           // Em quad
    '\u2002': ' ',           // En space
    '\u2003': ' ',           // Em space
    '\u2004': ' ',           // Three-per-em space
    '\u2005': ' ',           // Four-per-em space
    '\u2006': ' ',           // Six-per-em space
    '\u2007': ' ',           // Figure space
    '\u2008': ' ',           // Punctuation space
    '\u2009': ' ',           // Thin space
    '\u200A': ' ',           // Hair space
    '\u202F': ' ',           // Narrow no-break space
    '\u205F': ' ',           // Medium mathematical space
    '\u3000': ' ',           // Ideographic space
    '\t': '    '             // Tab to spaces
  };

  let result = input;
  const appliedReplacements = [];

  for (const [from, to] of Object.entries(characterReplacements)) {
    const original = result;
    result = result.replaceAll(from, to);
    
    if (original !== result) {
      appliedReplacements.push({ from, to });
    }
  }

  return { result, appliedReplacements };
}

/**
 * Create a structured patch showing the differences between old and new content.
 * Based on the Claude Code CLI implementation.
 * 
 * @param {string} filePath - Path to the file
 * @param {string} oldString - Original content
 * @param {string} newString - New content
 * @returns {object} - Object with patch and updatedFile properties
 */
function createFilePatch(filePath, oldString, newString) {
  // Get the absolute path and current file content
  const absPath = isAbsolutePath(filePath) ? filePath : path.resolve(getWorkingDirectory(), filePath);
  const fileContent = oldString === "" ? "" : (readFile(absPath) || "");
  
  // Create the updated file content by replacing the old string with the new string
  let updatedFile;
  
  if (oldString === "") {
    // This is a file creation operation
    updatedFile = newString;
  } else {
    // This is a file update operation
    updatedFile = fileContent.replace(oldString, newString);
  }
  
  // Validate the change was made
  if (updatedFile === fileContent && oldString !== "") {
    throw new Error("Original and edited file match exactly. Failed to apply edit.");
  }
  
  // Generate the structured patch
  const patch = generateStructuredPatch(filePath, fileContent, oldString, newString);
  
  return {
    patch,
    updatedFile
  };
}

/**
 * Generate a structured patch showing the differences between old and new content.
 * This is a simplified version of the Claude Code CLI's patch generator.
 * 
 * @param {string} filePath - Path to the file
 * @param {string} fileContent - Original file content
 * @param {string} oldStr - String to replace
 * @param {string} newStr - Replacement string
 * @param {boolean} ignoreWhitespace - Whether to ignore whitespace in diff
 * @returns {Array} - Array of hunk objects representing the changes
 */
function generateStructuredPatch(filePath, fileContent, oldStr, newStr, ignoreWhitespace = false) {
  // Special case for file creation
  if (oldStr === "") {
    return createNewFilePatch(filePath, newStr);
  }
  
  // Find the location of oldStr in fileContent
  const startIndex = fileContent.indexOf(oldStr);
  if (startIndex === -1) {
    return [{
      oldStart: 1,
      oldLines: 0,
      newStart: 1,
      newLines: 0,
      lines: ["(No changes detected)"]
    }];
  }
  
  // Count the number of lines before the change
  const beforeLines = fileContent.substring(0, startIndex).split('\n');
  const oldStart = beforeLines.length;
  
  // Split both strings into lines
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  
  // Create the hunk
  const hunk = {
    oldStart,
    oldLines: oldLines.length,
    newStart: oldStart,
    newLines: newLines.length,
    lines: []
  };
  
  // Add context lines before (if they exist)
  const maxContextLines = 3;
  for (let i = Math.max(0, oldStart - maxContextLines); i < oldStart; i++) {
    if (i < beforeLines.length) {
      hunk.lines.push(' ' + beforeLines[i]);
    }
  }
  
  // Add removal lines
  for (const line of oldLines) {
    hunk.lines.push('-' + line);
  }
  
  // Add addition lines
  for (const line of newLines) {
    hunk.lines.push('+' + line);
  }
  
  // Add context lines after (if they exist)
  const afterStart = startIndex + oldStr.length;
  const afterText = fileContent.substring(afterStart);
  const afterLines = afterText.split('\n');
  
  for (let i = 0; i < Math.min(maxContextLines, afterLines.length); i++) {
    hunk.lines.push(' ' + afterLines[i]);
  }
  
  return [hunk];
}

/**
 * Create a patch for a new file
 * @param {string} filePath - Path to the file
 * @param {string} content - New file content
 * @returns {Array} - Array with a single hunk representing the new file
 */
function createNewFilePatch(filePath, content) {
  const lines = content.split('\n');
  
  const hunk = {
    oldStart: 0,
    oldLines: 0,
    newStart: 1,
    newLines: lines.length,
    lines: []
  };
  
  for (const line of lines) {
    hunk.lines.push('+' + line);
  }
  
  return [hunk];
}

module.exports = {
  readFile,
  writeFile,
  isAbsolutePath,
  getRelativePath,
  getWorkingDirectory,
  applyCharacterReplacements,
  createFilePatch,
  generateStructuredPatch,
  createNewFilePatch
};