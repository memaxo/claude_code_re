# Claude Code Internal Todo System Documentation

This document describes the functionality and components related to the internal todo list feature, based on static analysis.

## Purpose

The CLI includes a built-in todo list management system intended for tracking tasks within a specific interactive session. It seems designed to encourage the user and the AI to manage tasks proactively during their interaction.

## Storage

*   **Format:** Todos are stored as JSON data.
*   **Location:** Each session appears to have its own dedicated todo file.
    *   A base directory for todos is determined by `getTodosDirectory` (`Pb5`). This function likely resolves to a path like `~/.claude/todos` or similar and creates it if it doesn't exist (using helpers like `lj2` for path join, `cj2` for exists check, `Rb5` for mkdir).
    *   The specific file path is constructed by `getTodoFilePath` (`ij2`), combining the base directory with a session identifier (`UY`) and the `.json` extension (e.g., `<base_dir>/<session_id>.json`).

## Data Structure

*   **Todo Item:** Defined by `todoItemSchema` (`Eb5`). Expected fields include:
    *   `id`: Unique identifier for the todo item.
    *   `description`: The text of the task.
    *   `status`: The current state (e.g., "TODO", "COMPLETED", likely others).
    *   `priority`: A priority level for the task.
*   **Todo List:** Defined by `todoListSchema` (`i51`), which represents an array of Todo Items.

## Key Functions & Variables

*   **Storage & Access:**
    *   `getTodosDirectory` (`Pb5`): Gets/creates the base storage directory.
    *   `getTodoFilePath` (`ij2`): Constructs the full path to the session's todo file using the session ID (`UY`).
    *   `loadTodos` (`n51`): Reads the session's JSON file, parses it, validates against `todoListSchema` (`i51`), and returns the array of todos. Returns an empty array if the file doesn't exist.
    *   `saveTodos` (`nj2`): Writes a given array of todos back to the session's JSON file.
*   **Session ID:**
    *   `sessionId` (`UY`): Used to ensure todo lists are specific to the current session.

## UI Integration

*   **Rendering:**
    *   `TodoItemRenderer` (`SJ`): A dedicated React/Ink component likely responsible for displaying a single todo item, including its status.
    *   The UI visually represents todo status transitions (e.g., "TODO → COMPLETED").

## AI & Tool Interaction

*   **Activation:** The feature appears to be controlled by a flag or check via `isTodoEnabled` (`Qv`).
*   **Guidance:**
    *   A detailed prompt, identified as `todoToolPrompt` (`aj2`), guides the AI on how and when to interact with the todo system.
    *   A shorter `todoToolDescription` (`rj2`) likely exists for summarizing the tool's capability.
*   **Tool Definition:**
    *   Likely exposed to the AI as a dedicated tool, potentially `TodoWriteTool` (`ZD`) identified in the `oU` function.
    *   Uses a specific identifier `TODO_TOOL_ID` (`fb5`), possibly for configuration or internal referencing. 