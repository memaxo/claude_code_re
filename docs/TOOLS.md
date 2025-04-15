# Claude Code Tool System Documentation

This document outlines the architecture and key components of the internal tool system, based on static analysis and AST parsing.

## Overview & Execution Flow

The tool system allows Claude Code to interact with the local environment (filesystem, shell) and external services. The general execution flow is:

1.  **Tool Use Request:** The AI model generates a `tool_use` message indicating the desired tool (`name`) and its `input`.
2.  **Message Processing (`processToolMessage` / `O61`):**
    *   Receives the `tool_use` message.
    *   Finds the corresponding tool definition object by `name` from the list of available tools.
    *   Handles errors if the tool is not found.
    *   Checks for cancellation signals (`abortController`).
    *   Delegates the actual execution to `executeToolCall` (`cc5`).
    *   Iterates over results yielded by `executeToolCall`.
    *   Handles errors during execution.
    *   Formats final results or errors using `createToolResult` (`z5`).
3.  **Tool Execution (`executeToolCall` / `cc5`):**
    *   Receives the tool definition object and processed input.
    *   Validates the input against the tool's `inputSchema` (using `safeParse`, potentially retrieved via `nc5`).
    *   Calls tool-specific preprocessing (`preprocessToolInput` / `Ov1`, e.g., `Ii2` for EditTool).
    *   Performs additional tool-specific validation (`validateInput` method).
    *   Checks permissions (`checkPermissions` method, potentially involving `checkPermissionContext` / `Gd1` or `checkBashPermissions` / `kj2`).
    *   Invokes the core tool logic via the tool's `call` method.
    *   The `call` method (often an async generator) yields results, typically including `progress` and final `result` types.
    *   Handles `progress` messages (potentially via `Ki2`).
    *   Formats the final `result` data using the tool's `renderResultForAssistant` method.
    *   Yields formatted results back to `processToolMessage`.
    *   Includes telemetry (`trackEvent` / `x1`) for success, errors, and cancellation.
4.  **Result Formatting (`createToolResult` / `z5`):**
    *   Takes the content (often including a `tool_result` type) and the raw tool output.
    *   Wraps it in a standard message structure (role: "user") for the conversation history.

## Key Functions & Variables

*   **Discovery & Management:**
    *   `primaryTools` (`sl5`): Array containing core tool definitions (View, Glob, Grep, LS, WebFetch, Batch).
    *   `oU`: Function (cached) returning *all* enabled tool definitions (checks `isEnabled`). Includes Bash, Edit, Agent, Todo, etc.
    *   `nv1`: Function to get tools available in a specific context (agent vs user, handles permissions).
    *   `l61`: Function combining built-in and custom commands.
    *   `getAvailableTools` (`Ji5`): Returns available tools (likely calls `nv1` or `oU`).
    *   `findToolById` (`k61`): Used by UI components to link results back to tool definitions.
*   **Preprocessing:**
    *   `preprocessToolInput` (`Ov1`): Central dispatcher for tool-specific input preprocessing.
    *   `preprocessEditToolInput` (`Ii2`): Specific preprocessing for the Edit tool (handles character replacements).
*   **Execution & Message Handling:**
    *   `processToolMessage` (`O61`): Orchestrates finding the tool and calling `executeToolCall`.
    *   `executeToolCall` (`cc5`): Handles validation, permissions, calling the tool logic, and processing yielded results.
*   **Result Creation:**
    *   `createToolResult` (`z5`): Formats tool results into user messages.
*   **Permissions:**
    *   `checkPermissions`: Method on tool definitions.
    *   `checkPermissionContext` (`Gd1`): General permission checker.
    *   `checkBashPermissions` (`kj2`): Specific permission checker for Bash tool.
    *   `defaultPermissionContext` (`Qj2`): Default context for permissions.
    *   `hasUnsupportedOperators` (`qj2`): Checks shell syntax for dangerous operators.
    *   `validateCommands` (`TU`): Validates Bash commands (used in `isReadOnly` check).
*   **Utilities:**
    *   `applyCharacterReplacements` (`Ec5`): Used by Edit tool preprocessing.
    *   `characterReplacements` (`$c5`): Map of characters for normalization.
    *   `trackEvent` (`x1`): Telemetry function.
    *   `logError` (`l1`): Error logging.

## Tool Definition Structure

Based on `BashTool` (`P9`) and `EditTool` (`HI`), tool definitions are objects with properties like:

*   `name`: (String) Unique identifier (e.g., "Bash", "Edit").
*   `description`: (Async Function) Returns a description string.
*   `prompt`: (Async Function) Returns a UI prompt component.
*   `inputSchema`: (Object/Schema) Used for validating input (e.g., `Nc5` for Edit).
*   `call`: (Async Function/Generator) The core logic of the tool.
*   `isEnabled`: (Async Function) Determines if the tool is available.
*   `isReadOnly`: (Function) Indicates if the tool modifies state/filesystem.
*   `userFacingName`: (Function) Returns a display name, potentially context-dependent.
*   `checkPermissions`: (Async Function) Handles permission validation.
*   `validateInput`: (Async Function, Optional) Performs tool-specific input validation beyond the schema.
*   `renderResultForAssistant`: (Function) Formats the raw tool output for the AI model.
*   `renderToolUseMessage`: (Function) Formats input for display in UI.
*   `renderToolResultMessage`: (Function) Renders the tool result in the UI (often returns a React component like `PatchDisplay` / `L61` for Edit).

## Permission Handling

*   Permissions are checked via the `checkPermissions` method on the tool definition.
*   Uses a context (`getToolPermissionContext`) passed down, likely from the REPL state.
*   Relies on helper functions like `checkPermissionContext` (`Gd1`) and specialized checkers (`kj2` for Bash).
*   Can result in different behaviors (`result: false`, `behavior: "ask"`) with user-facing messages.
*   Bash tool specifically checks for unsupported shell operators (`qj2`).

## UI Integration

*   Tools define UI rendering methods (`renderToolUseMessage`, `renderToolResultMessage`).
*   Dedicated React/Ink components handle rendering:
    *   `ToolUseRenderer` (`ri2`): Displays the tool request, status, and formatted input (`el5`).
    *   `ToolResultRenderer` (`ni2`): Selects the appropriate display based on result state (Success (`ii2`), Error (`pi2`), Canceled (`hi2`), Progress (`li2`)).
*   Uses `findToolById` (`k61`) to link messages.
*   Relies on state tracking for progress/errors (`erroredToolUseIDs`, `inProgressToolUseIDs`, etc.).

## Known Tools (Identified via `primaryTools`, `oU`, and definitions)

*   Bash (`BashTool` / `P9`)
*   Edit (`EditTool` / `HI`)
*   View (`ViewTool` / `iY`)
*   Glob (`GlobTool` / `Zw`)
*   Grep (`GrepTool` / `aX`)
*   LS (`LSTool` / `$J`)
*   WebFetch (`WebFetchTool` / `XC`)
*   Batch (`BatchTool` / `hW`)
*   ReadNotebook (`ReadNotebookTool` / `JI`)
*   Agent (`AgentTool` / `tv`)
*   TodoWrite (`TodoWriteTool` / `ZD`)
*   *(Others potentially exist in `oU` based on variables like `wn2`, `pW`, `a51`)* 