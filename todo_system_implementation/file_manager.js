const fs = require('fs');
const path = require('path');
const { SESSION_ID, TODOS_DIR_NAME } = require('./config');
const { validateTodoList } = require('./schema');

// Simulates Pb5
function getTodosDirectory() {
    // Using path.resolve to get absolute path relative to the script's directory
    const dirPath = path.resolve(__dirname, TODOS_DIR_NAME);
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            // console.log(`Created TODO directory: ${dirPath}`);
        }
        return dirPath;
    } catch (error) {
        console.error(`Error ensuring TODO directory exists: ${dirPath}`, error);
        // In a real app, might throw or handle more gracefully
        throw new Error(`Failed to get or create TODO directory: ${error.message}`);
    }
}

// Simulates ij2
function getTodoFilePath() {
    const dirPath = getTodosDirectory();
    const fileName = `${SESSION_ID}.json`;
    return path.join(dirPath, fileName);
}

// Simulates n51
function loadTodos() {
    const filePath = getTodoFilePath();
    try {
        if (!fs.existsSync(filePath)) {
            // console.log(`TODO file not found, returning empty list: ${filePath}`);
            return []; // Return empty list if file doesn't exist
        }
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        if (fileContent.trim() === '') {
            return []; // Return empty list if file is empty
        }
        const todos = JSON.parse(fileContent);

        // Validate the loaded todos against the schema
        const validationResult = validateTodoList(todos);
        if (!validationResult.success) {
            console.error(`Invalid TODO data loaded from ${filePath}:`, validationResult.errors);
            // Decide how to handle invalid data - return empty, corrupted marker, etc.
            // For this demo, we'll return an empty list to prevent downstream errors.
            return [];
        }
        // console.log(`Loaded ${todos.length} TODOs from ${filePath}`);
        return todos;
    } catch (error) {
        console.error(`Error loading TODOs from ${filePath}:`, error);
        // Decide how to handle load errors - return empty, throw, etc.
        // For this demo, return empty list
        return [];
    }
}

// Simulates nj2
function saveTodos(todos) {
    const filePath = getTodoFilePath();

    // Validate the list before saving
    const validationResult = validateTodoList(todos);
    if (!validationResult.success) {
        console.error("Validation failed. Cannot save invalid TODO list:", validationResult.errors);
        // Returning an error indication or throwing might be better in a real tool
        return { success: false, message: `Validation failed: ${validationResult.errors.join(', ')}` };
    }

    try {
        const fileContent = JSON.stringify(todos, null, 2); // Pretty-print JSON
        fs.writeFileSync(filePath, fileContent, 'utf-8');
        // console.log(`Saved ${todos.length} TODOs to ${filePath}`);
        return { success: true, message: `Successfully saved ${todos.length} TODOs.` };
    } catch (error) {
        console.error(`Error saving TODOs to ${filePath}:`, error);
        // Return error indication
         return { success: false, message: `Failed to save TODOs: ${error.message}` };
    }
}

module.exports = {
    getTodosDirectory,
    getTodoFilePath,
    loadTodos,
    saveTodos,
}; 