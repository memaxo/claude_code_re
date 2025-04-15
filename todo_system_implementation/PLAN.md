# Plan for TODO System Implementation

## Overview
Recreate the TODO list management system observed in the Claude Code CLI (`cli_renamed.js`) as a standalone Node.js implementation.

## Components

1.  **`config.js`**: 
    -   Define `SESSION_ID` (like `UY`).
    -   Define `TODOS_DIR_NAME`.

2.  **`schema.js`**: 
    -   Define `todoStatusEnum` (TODO, IN_PROGRESS, COMPLETED, CANCELED).
    -   Define `todoPriorityEnum` (LOW, MEDIUM, HIGH).
    -   Define `todoItemSchema` (like `Eb5`) with validation for `id` (UUID), `description` (string), `status` (enum), `priority` (optional enum).
    -   Define `todoListSchema` (like `i51`) as an array of `todoItemSchema`.
    -   Define `todoWriteInputSchema` (like `Sb5`) containing `todos` (validated by `todoListSchema`).
    -   Implement simple schema validation functions.

3.  **`file_manager.js`**: 
    -   Implement `getTodosDirectory()` (like `Pb5`): Get path, create if not exists.
    -   Implement `getTodoFilePath()` (like `ij2`): Combine dir path and `SESSION_ID`.
    -   Implement `loadTodos()` (like `n51`): Read JSON, parse, validate with `todoListSchema`, return empty array on error/not found.
    -   Implement `saveTodos()` (like `nj2`): Validate input with `todoListSchema`, stringify, write JSON.
    -   Include necessary `fs` and `path` utilities.

4.  **`todo_write_tool.js`**: 
    -   Define `TodoWriteTool` object (like `ZD`).
    -   Properties: `name`, `description` (use `rj2`), `prompt` (use `aj2`), `inputSchema` (`todoWriteInputSchema`), `userFacingName`, `isEnabled`.
    -   Implement `async *call(input)`:
        -   Validate `input` using `todoWriteInputSchema`.
        -   If valid: 
            -   Call `saveTodos(input.todos)`.
            -   Yield success message.
        -   If invalid:
            -   Yield validation error message.
    -   Implement `renderResultForAssistant()`: Return simple success/error string.
    -   Implement `renderToolResultMessage()`: Return object with success status and message.

5.  **`demo.js`**: 
    -   Demonstrate the workflow:
        -   Initial load.
        -   Add todos using the tool.
        -   Load again.
        -   Update todos using the tool.
        -   Load again.
        -   Attempt invalid update.
        -   Verify list unchanged after invalid attempt.

## Dependencies
- Node.js built-ins (`fs`, `path`, `crypto`).

## Implementation Notes
- Use standard Node.js modules.
- Mimic the structure and function names observed in the static analysis (`VARIABLES.md`, `CODE_ANALYSIS.md`).
- Implement basic schema validation, not relying on external libraries like Zod for simplicity.
- Ensure proper error handling, especially for file operations and validation. 