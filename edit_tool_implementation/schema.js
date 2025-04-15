/**
 * A simple schema validation for the Edit tool.
 * In a real implementation, this would use a proper schema validation library
 * like Zod, Joi, or ajv, but for simplicity we're creating our own basic version.
 */

/**
 * Schema validator for Edit tool inputs.
 */
class Schema {
  constructor(shape) {
    this.shape = shape;
  }

  /**
   * Validate the input against the schema
   * @param {object} input - The input to validate
   * @returns {object} - Success or error result
   */
  safeParse(input) {
    try {
      const errors = [];
      
      // Check all required fields are present
      for (const key in this.shape) {
        if (this.shape[key].required && (input[key] === undefined || input[key] === null)) {
          errors.push(`Missing required field: ${key}`);
        }
      }
      
      // Validate types for each field
      for (const key in input) {
        if (this.shape[key]) {
          const value = input[key];
          const fieldType = this.shape[key].type;
          const typeOk = this.checkType(value, fieldType);
          
          if (!typeOk) {
            errors.push(`Invalid type for ${key}: expected ${fieldType}, got ${typeof value}`);
          }
          
          // Check additional validations if they exist
          if (this.shape[key].validate && typeOk) {
            const validateResult = this.shape[key].validate(value);
            if (!validateResult.success) {
              errors.push(validateResult.error);
            }
          }
        }
      }
      
      if (errors.length > 0) {
        return {
          success: false,
          error: new ValidationError(errors.join('; '))
        };
      }
      
      return { success: true, data: input };
    } catch (error) {
      return {
        success: false,
        error: new ValidationError('Schema validation failed: ' + error.message)
      };
    }
  }
  
  /**
   * Check if a value matches the expected type
   */
  checkType(value, type) {
    if (type === 'string') return typeof value === 'string';
    if (type === 'number') return typeof value === 'number';
    if (type === 'boolean') return typeof value === 'boolean';
    if (type === 'object') return typeof value === 'object' && value !== null;
    if (type === 'array') return Array.isArray(value);
    return true; // Accept any type if not specified
  }
  
  /**
   * Parse the input, throwing an error if validation fails
   */
  parse(input) {
    const result = this.safeParse(input);
    if (!result.success) {
      throw result.error;
    }
    return input;
  }
}

/**
 * Schema validation error
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Create the Edit tool input schema
 */
const editToolInputSchema = new Schema({
  file_path: { 
    type: 'string', 
    required: true,
    validate: (value) => {
      if (!value.startsWith('/')) {
        return { success: false, error: 'file_path must be an absolute path' };
      }
      return { success: true };
    }
  },
  old_string: { 
    type: 'string', 
    required: true 
  },
  new_string: { 
    type: 'string', 
    required: true 
  },
  expected_replacements: { 
    type: 'number', 
    required: false 
  }
});

/**
 * Format a validation error message for display
 */
function formatValidationError(toolName, error) {
  const errorMessage = error.message || String(error);
  return `${toolName} validation error: ${errorMessage}`;
}

module.exports = {
  editToolInputSchema,
  formatValidationError,
  ValidationError
};