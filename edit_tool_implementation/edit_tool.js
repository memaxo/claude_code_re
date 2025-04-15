const { 
  readFile, 
  writeFile, 
  isAbsolutePath, 
  getRelativePath, 
  getWorkingDirectory,
  applyCharacterReplacements,
  createFilePatch
} = require('./utils');

const { 
  editToolInputSchema, 
  formatValidationError
} = require('./schema');

/**
 * Preprocess the input for the Edit tool.
 * This handles special characters and ensures exact matching.
 * 
 * @param {Object} input - The input object with file_path, old_string, and new_string
 * @returns {Object} - Processed input
 */
function preprocessEditToolInput(input) {
  let { file_path, old_string, new_string } = input;
  
  // For new file creation, skip preprocessing
  if (!old_string) return input;
  
  try {
    // Read the file content
    const fileContent = readFile(file_path);
    
    // If file doesn't exist, return input as is (will be caught by validation later)
    if (fileContent === null) return input;
    
    // Normalize line endings in the file content
    const normalizedContent = fileContent.replaceAll('\r\n', '\n');
    
    // If the old_string already matches exactly, return input as is
    if (normalizedContent.includes(old_string)) return input;
    
    // Try applying character replacements to see if that helps matching
    const { result: processedOldString, appliedReplacements } = applyCharacterReplacements(old_string);
    
    // If after replacements there's a match, also apply the same replacements to new_string
    if (normalizedContent.includes(processedOldString)) {
      let processedNewString = new_string;
      
      // Apply the same replacements to new_string
      for (const { from, to } of appliedReplacements) {
        processedNewString = processedNewString.replaceAll(from, to);
      }
      
      return { 
        file_path, 
        old_string: processedOldString, 
        new_string: processedNewString,
        expected_replacements: input.expected_replacements
      };
    }
  } catch (error) {
    console.error('Error preprocessing edit input:', error);
  }
  
  // If all attempts fail, return the original input
  return input;
}

/**
 * The Edit Tool object - implements the core functionality of the Edit tool.
 */
const EditTool = {
  name: "Edit",
  
  /**
   * Get the tool description
   */
  async description() {
    return "A tool for editing files";
  },
  
  /**
   * Check if the tool is enabled
   */
  async isEnabled() {
    return true;
  },
  
  /**
   * Get the user-facing name based on the operation type
   */
  userFacingName({ old_string }) {
    if (old_string === "") return "Create";
    return "Update";
  },
  
  /**
   * The input validation schema
   */
  inputSchema: editToolInputSchema,
  
  /**
   * Determine if the operation is read-only (always false for Edit)
   */
  isReadOnly() {
    return false;
  },
  
  /**
   * Get the path from the input
   */
  getPath(input) {
    return input.file_path;
  },
  
  /**
   * Check if the user has permission to edit the file
   */
  async checkPermissions(input, context) {
    // This is a simplified implementation
    // In a real environment, this would check file permissions
    // and potentially get user approval for certain operations
    
    const filePath = input.file_path;
    
    if (!isAbsolutePath(filePath)) {
      return { 
        result: false,
        message: "File path must be absolute" 
      };
    }
    
    // For new files, check if we can write to the directory
    if (input.old_string === "") {
      try {
        const directory = require('path').dirname(filePath);
        const testAccess = () => require('fs').accessSync(directory, require('fs').constants.W_OK);
        
        try {
          testAccess();
        } catch (error) {
          if (error.code === 'ENOENT') {
            // Directory doesn't exist, check parent directory
            const parentDir = require('path').dirname(directory);
            try {
              require('fs').accessSync(parentDir, require('fs').constants.W_OK);
            } catch (err) {
              return { 
                result: false,
                message: `Cannot create directory ${directory}: permission denied` 
              };
            }
          } else {
            return { 
              result: false,
              message: `Cannot write to directory ${directory}: ${error.message}` 
            };
          }
        }
      } catch (error) {
        return { 
          result: false,
          message: `Error checking permissions: ${error.message}` 
        };
      }
    } else {
      // For existing files, check if file exists and is writable
      try {
        const fs = require('fs');
        if (fs.existsSync(filePath)) {
          try {
            fs.accessSync(filePath, fs.constants.W_OK);
          } catch (error) {
            return { 
              result: false,
              message: `Cannot write to file ${filePath}: permission denied` 
            };
          }
        } else {
          return { 
            result: false,
            message: `File ${filePath} does not exist` 
          };
        }
      } catch (error) {
        return { 
          result: false,
          message: `Error checking file permissions: ${error.message}` 
        };
      }
    }
    
    return { 
      result: true,
      updatedInput: input
    };
  },
  
  /**
   * Validate the input for format and constraints
   */
  async validateInput(input, context) {
    // Check that file path is absolute
    if (!isAbsolutePath(input.file_path)) {
      return {
        result: false,
        message: "File path must be absolute"
      };
    }
    
    // If it's an update (not a create), validate file exists
    if (input.old_string !== "") {
      const content = readFile(input.file_path);
      if (content === null) {
        return {
          result: false,
          message: `File ${input.file_path} does not exist`
        };
      }
      
      // Check that old_string exists in the file
      if (!content.includes(input.old_string)) {
        return {
          result: false,
          message: `The text to replace was not found in file ${input.file_path}`
        };
      }
    }
    
    return { result: true };
  },
  
  /**
   * Render a user-facing message about the tool use
   */
  renderToolUseMessage(input, { verbose }) {
    return verbose 
      ? input.file_path 
      : getRelativePath(getWorkingDirectory(), input.file_path);
  },
  
  /**
   * Render a progress message (placeholder)
   */
  renderToolUseProgressMessage() {
    return null;
  },
  
  /**
   * Render the result message
   */
  renderToolResultMessage({ filePath, structuredPatch, oldString, newString, originalFile }, { verbose }) {
    // In a real implementation this would return a React component
    // Here we just return a simple string representation
    
    const operation = oldString === "" ? "Created" : "Modified";
    
    // Format patch for display
    const patchDisplay = structuredPatch.map(hunk => {
      return hunk.lines.join('\n');
    }).join('\n');
    
    // Create a better representation of the file with line numbers
    const fileWithLineNumbers = (originalFile || newString).split('\n')
      .map((line, index) => `${(index + 1).toString().padStart(5)}  ${line}`)
      .join('\n');
    
    return `${operation} file: ${filePath}\n\nChanges:\n${patchDisplay}\n\nResult:\n${fileWithLineNumbers}`;
  },
  
  /**
   * Render a message for when the tool use is rejected
   */
  renderToolUseRejectedMessage({ file_path, old_string, new_string }, { columns, verbose }) {
    try {
      const { patch } = createFilePatch(file_path, old_string, new_string);
      
      // Format patch for display
      const patchDisplay = patch.map(hunk => {
        return hunk.lines.join('\n');
      }).join('\n');
      
      return `Tool use rejected for ${file_path}:\n${patchDisplay}`;
    } catch (error) {
      return `Tool use rejected for ${file_path}`;
    }
  },
  
  /**
   * The main call method that performs the edit
   */
  async *call(input, context) {
    const { file_path, old_string, new_string, expected_replacements } = input;
    
    try {
      // Handle new file creation
      if (old_string === "") {
        writeFile(file_path, new_string);
        
        const { patch, updatedFile } = createFilePatch(file_path, "", new_string);
        
        yield {
          type: "result",
          data: {
            filePath: file_path,
            oldString: "",
            newString: new_string,
            structuredPatch: patch
          }
        };
        
        return;
      }
      
      // Handle existing file update
      const content = readFile(file_path);
      if (content === null) {
        throw new Error(`File ${file_path} does not exist`);
      }
      
      // Count occurrences of old_string in the file
      let occurrences = 0;
      let position = content.indexOf(old_string);
      while (position !== -1) {
        occurrences++;
        position = content.indexOf(old_string, position + 1);
      }
      
      // Validate the number of replacements
      if (expected_replacements !== undefined && occurrences !== expected_replacements) {
        throw new Error(
          `Expected ${expected_replacements} occurrences of the string to replace, ` +
          `but found ${occurrences} occurrences. ` +
          `To replace all ${occurrences} occurrences, use expected_replacements=${occurrences}.`
        );
      }
      
      // Perform the replacement
      const newContent = content.replaceAll(old_string, new_string);
      
      // Save the file
      writeFile(file_path, newContent);
      
      // Create a patch
      const { patch, updatedFile } = createFilePatch(file_path, old_string, new_string);
      
      // Return the result
      yield {
        type: "result",
        data: {
          filePath: file_path,
          oldString: old_string,
          newString: new_string,
          originalFile: content,
          structuredPatch: patch
        }
      };
    } catch (error) {
      console.error('Error in EditTool.call:', error);
      throw error;
    }
  }
};

module.exports = {
  EditTool,
  preprocessEditToolInput
};