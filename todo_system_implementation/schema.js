const crypto = require('crypto');

// --- Enums ---
const todoStatusEnum = ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELED"];
const todoPriorityEnum = ["LOW", "MEDIUM", "HIGH"];

// --- Validation Helpers ---

function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
}

function isValidStatus(status) {
    return typeof status === 'string' && todoStatusEnum.includes(status);
}

function isValidPriority(priority) {
    // Priority is optional
    return priority === undefined || (typeof priority === 'string' && todoPriorityEnum.includes(priority));
}

// --- Schemas (Simple Validation Functions) ---

// Simulates Eb5
function validateTodoItem(item) {
    const errors = [];
    if (typeof item !== 'object' || item === null) {
        return { success: false, errors: ["Item must be an object."] };
    }
    if (!isValidUUID(item.id)) {
        errors.push(`Invalid or missing 'id': ${item.id}`);
    }
    if (typeof item.description !== 'string' || item.description.trim() === '') {
        errors.push(`Invalid or missing 'description': ${item.description}`);
    }
    if (!isValidStatus(item.status)) {
        errors.push(`Invalid or missing 'status': ${item.status}`);
    }
    if (!isValidPriority(item.priority)) {
        errors.push(`Invalid 'priority': ${item.priority}`);
    }

    return { success: errors.length === 0, errors };
}

// Simulates i51
function validateTodoList(list) {
    if (!Array.isArray(list)) {
        return { success: false, errors: ["Input must be an array."] };
    }
    const allErrors = [];
    list.forEach((item, index) => {
        const result = validateTodoItem(item);
        if (!result.success) {
            allErrors.push(`Item at index ${index}: ${result.errors.join(', ')}`);
        }
    });

    return { success: allErrors.length === 0, errors: allErrors };
}

// Simulates Sb5 (Input schema for the TodoWrite tool)
const todoWriteInputSchema = {
    description: "Input schema for the TodoWrite tool",
    validate: (input) => {
        if (typeof input !== 'object' || input === null) {
            return { success: false, errors: ["Input must be an object."] };
        }
        if (!input.hasOwnProperty('todos')) {
             return { success: false, errors: ["Input must have a 'todos' property."] };
        }
        return validateTodoList(input.todos);
    }
};

module.exports = {
    validateTodoItem,
    validateTodoList,
    todoWriteInputSchema,
    // Export enums if needed elsewhere, though likely not for this simple case
    // todoStatusEnum,
    // todoPriorityEnum,
}; 