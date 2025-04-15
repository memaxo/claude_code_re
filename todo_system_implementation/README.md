# Standalone TODO System Implementation

This directory contains a standalone implementation of the TODO list management system based on the static analysis of the Claude Code CLI (`cli_renamed.js`).

## Purpose

To recreate the core functionality of how the CLI tool appears to manage session-specific TODO lists, including:
*   Defining the structure (schema) of TODO items.
*   Loading TODOs from a session-specific JSON file.
*   Saving updated TODO lists back to the JSON file.
*   Providing a tool-like interface (`TodoWriteTool`) for updating the list.

## Files

*   `PLAN.md`: Outlines the implementation plan and component details.
*   `README.md`: This file.
*   `config.js`: Defines configuration constants like session ID and directory name.
*   `schema.js`: Defines the data structures (schemas) for TODO items and the input validation logic.
*   `file_manager.js`: Handles reading from and writing to the TODO JSON file, including directory creation and path management.
*   `todo_write_tool.js`: Implements the `TodoWriteTool` object, mimicking the tool interface observed in the CLI, responsible for validating input and orchestrating the saving process.
*   `demo.js`: A script to demonstrate the usage of the `TodoWriteTool` and the file management functions.

## How to Run

1.  Ensure you have Node.js installed.
2.  Navigate to this directory in your terminal.
3.  Run the demo script: `node demo.js`

The script will simulate adding, updating, and canceling TODOs, showing the list's state at each step and demonstrating error handling for invalid input. It reads/writes to a file within a `todos_data` subdirectory (created automatically).

## Disclaimer

This is a recreation based on static analysis of minified code. It aims for functional similarity but may differ in implementation details from the original Claude Code CLI. It does not use external libraries like Zod for schema validation, opting for simpler, built-in validation for demonstration purposes. 