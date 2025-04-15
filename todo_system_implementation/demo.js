const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { TodoWriteTool } = require('./todo_write_tool');
const { loadTodos, getTodoFilePath } = require('./file_manager');
const { SESSION_ID } = require('./config');

// Simple color codes for console output
const colors = {
  reset: "\x1b[0m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  green: "\x1b[32m",
};

function printHeader(title) {
  console.log(`
${colors.magenta}--- ${title} ---${colors.reset}`);
}

function printResult(label, data) {
    console.log(`${colors.yellow}${label}:${colors.reset}`);
    if (data?.success === false) {
        console.log(`${colors.red}  Success: ${data.success}${colors.reset}`);
        console.log(`${colors.red}  Message: ${data.message}${colors.reset}`);
    } else if (data?.success === true) {
        console.log(`${colors.green}  Success: ${data.success}${colors.reset}`);
        console.log(`${colors.green}  Message: ${data.message}${colors.reset}`);
    } else {
        // Handle unexpected generator yield if necessary
        console.log("  Received:", data);
    }
     console.log("--------------------");
}

function printTodoList(label, todos) {
    console.log(`${colors.cyan}${label}:${colors.reset}`);
    if (todos.length === 0) {
        console.log("  (empty)");
    } else {
        todos.forEach(todo => {
            let statusColor = colors.reset;
            switch (todo.status) {
                case 'IN_PROGRESS': statusColor = colors.yellow; break;
                case 'COMPLETED': statusColor = colors.green; break;
                case 'CANCELED': statusColor = colors.red; break;
                default: statusColor = colors.cyan; // TODO
            }
            console.log(`  - [${statusColor}${todo.status.padEnd(11)}${colors.reset}] (${todo.id.substring(0, 8)}) ${todo.description}${todo.priority ? ` (${todo.priority})` : ''}`);
        });
    }
    console.log("--------------------");
}

async function runTool(tool, input) {
    const callGenerator = tool.call(input);
    // Assuming the tool yields a single result in this simplified version
    const { value } = await callGenerator.next();
    return value?.data; // Extract the data part of the yielded result
}

// --- Demo Execution ---
async function runDemo() {
    const todoFilePath = getTodoFilePath();
    printHeader(`TODO System Demo (Session: ${SESSION_ID})`);
    console.log(`Using TODO file: ${todoFilePath}`);

    // 1. Initial Load (file likely doesn't exist yet)
    let currentTodos = loadTodos();
    printTodoList("Initial TODO List (Loaded)", currentTodos);

    // 2. Add First Todos using the Tool
    printHeader("Adding Initial Tasks");
    const initialTodosInput = {
        todos: [
            { id: crypto.randomUUID(), description: "Analyze cli_renamed.js for TODO system", status: "COMPLETED", priority: "HIGH" },
            { id: crypto.randomUUID(), description: "Recreate file_manager.js", status: "COMPLETED" },
            { id: crypto.randomUUID(), description: "Implement TodoWriteTool", status: "IN_PROGRESS", priority: "MEDIUM" },
            { id: crypto.randomUUID(), description: "Create demo script", status: "TODO" },
        ]
    };
    let result = await runTool(TodoWriteTool, initialTodosInput);
    printResult("Tool Result (Add Initial)", result);

    currentTodos = loadTodos();
    printTodoList("TODO List After Add", currentTodos);

    // 3. Update Status and Add a New Task
    printHeader("Updating Tasks and Adding New One");
    const updatedTodosInput = {
        todos: [
             // Keep completed ones
            currentTodos.find(t => t.description.includes("Analyze")),
            currentTodos.find(t => t.description.includes("Recreate file_manager")),
            // Update status
            { ...currentTodos.find(t => t.description.includes("Implement TodoWriteTool")), status: "COMPLETED" },
            { ...currentTodos.find(t => t.description.includes("Create demo script")), status: "IN_PROGRESS", priority: "LOW"},
            // Add new
            { id: crypto.randomUUID(), description: "Test edge cases", status: "TODO", priority: "MEDIUM" },
        ].filter(Boolean) // Filter out potential undefined if find fails
    };
    result = await runTool(TodoWriteTool, updatedTodosInput);
    printResult("Tool Result (Update/Add)", result);

    currentTodos = loadTodos();
    printTodoList("TODO List After Update", currentTodos);

    // 4. Cancel a Task
    printHeader("Canceling a Task");
     const cancelTaskInput = {
        todos: currentTodos.map(todo =>
            todo.description.includes("Test edge cases")
                ? { ...todo, status: "CANCELED" }
                : todo
        )
    };
    result = await runTool(TodoWriteTool, cancelTaskInput);
    printResult("Tool Result (Cancel Task)", result);

    currentTodos = loadTodos();
    printTodoList("Final TODO List", currentTodos);

    // 5. Demonstrate Validation Error (Optional)
    printHeader("Attempting Invalid Update (Validation Demo)");
    const invalidInput = {
        todos: [
            { id: "not-a-uuid", description: 123, status: "INVALID_STATUS" } // Invalid data
        ]
    };
     result = await runTool(TodoWriteTool, invalidInput);
     printResult("Tool Result (Invalid Input)", result); // Should show validation errors

     // Verify list wasn't saved
     const todosAfterInvalid = loadTodos();
     if (JSON.stringify(currentTodos) === JSON.stringify(todosAfterInvalid)) {
         console.log(`${colors.green}Verification: TODO list unchanged after invalid input attempt.${colors.reset}`);
     } else {
          console.log(`${colors.red}Verification Failed: TODO list changed after invalid input attempt!${colors.reset}`);
          printTodoList("TODO List After Invalid Attempt", todosAfterInvalid);
     }


    console.log(`
${colors.magenta}Demo Complete.${colors.reset}`);
}

runDemo().catch(error => {
  console.error("
Demo failed with error:", error);
}); 