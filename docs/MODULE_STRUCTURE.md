# Claude Code Inferred Module Structure & Repo Layout

This document outlines the hypothesized module structure and original source code layout based on static analysis of the minified `cli.js` bundle.

## Inferred High-Level Modules

Based on functional groupings observed during analysis, the original codebase likely contained modules/directories responsible for:

*   **`src/`**: Root source directory.
    *   **`cli/` or `commands/`**: Handles command-line argument parsing (likely using `commander.js`), command definitions, and top-level execution flow.
        *   _Key Functions:_ `initializeCommand`, `hasCommandFlag`.
        *   _Related Files:_ `COMMAND_PROCESSING.md`.
    *   **`core/` or `services/`**: Core application logic.
        *   **`api/`**: API client creation and interaction logic for different backends (Anthropic, Bedrock, Vertex).
            *   _Key Functions:_ `createApiClient`, `AnthropicClient`, `BedrockClient`, `VertexAIClient`.
            *   _Key Variables:_ `httpClient`, `USER_AGENT`.
        *   **`auth/`**: Authentication flows (OAuth) and credential management (API keys, tokens, keychain).
            *   _Key Functions:_ `getApiKey`, `getAuthToken`, `getApiKeyFromStorage`, `execShellCommand`.
            *   _Key Variables:_ `KEYCHAIN_SERVICE_NAME`, `OAUTH_CONFIG`.
        *   **`config/`**: Loading, saving, and managing application configuration.
            *   _Key Functions:_ `loadConfig`, `getConfigValue`, `setConfigValue`, `removeConfigValue`, `listConfigValues`.
            *   _Key Variables:_ `configCache`.
        *   **`messaging/`**: Formatting messages for API calls and processing responses.
            *   _Key Functions:_ `formatMessages`, `formatUserMessage`, `formatAssistantMessage`, `createToolResult`.
        *   **`prompt/`**: System prompt generation logic.
            *   _Key Functions:_ `generateSystemPrompt`, `getEnvironmentInfo`, `getClaudeIdentity`.
    *   **`tools/`**: Definitions and implementation for all built-in tools.
        *   Individual tool files (e.g., `bash.tool.js`, `edit.tool.js`, `view.tool.js`).
        *   Core execution logic (`executeToolCall`, `processToolMessage`).
        *   Permission handling (`checkPermissions`, `checkBashPermissions`).
        *   Preprocessing (`preprocessToolInput`).
        *   Shared utilities (character replacement for Edit tool).
        *   _Key Files:_ `DOCS_TOOLS.md`, `EDIT_TOOL.md`.
        *   _Key Variables:_ `primaryTools`, `BashTool`, `EditTool`, etc.
    *   **`ui/` or `components/`**: React/Ink components for the terminal interface.
        *   Main REPL (`ReplInterface`).
        *   Tool rendering (`ToolUseRenderer`, `ToolResultRenderer`, `SuccessToolResultDisplay`, etc.).
        *   Styling/theming (`applyTermStyle`, `getThemeColors`).
        *   Hooks (`useStartupTimer`).
        *   _Key Files:_ `VARIABLES_UI.md`.
    *   **`todo/`**: Specific implementation for the internal todo list feature.
        *   Storage functions (`loadTodos`, `saveTodos`, `getTodoFilePath`).
        *   UI component (`TodoItemRenderer`).
        *   Schemas (`todoItemSchema`, `todoListSchema`).
        *   _Key Files:_ `docs/TODO_SYSTEM.md`.
    *   **`utils/`**: Common utility functions.
        *   Error handling (`isErrorObject`, `logError`, `BaseCommanderError`).
        *   Type checking (`safeInstanceCheck`).
        *   Networking helpers (`createHttpAgent`).
        *   Other misc helpers (`generateUUID`, path functions).
    *   **`telemetry/`**: Event tracking implementation.
        *   _Key Functions:_ `trackEvent`.

## Hypothesized Directory Structure

```plaintext
claude-code-cli/
├── src/
│   ├── cli/                # Command definitions and handlers
│   │   ├── commands/
│   │   │   ├── config.command.js
│   │   │   └── ...
│   │   └── cli.js              # Main entry point, commander setup
│   ├── core/
│   │   ├── api/              # API client logic
│   │   │   ├── clients/        # Specific clients (Anthropic, Bedrock, Vertex)
│   │   │   ├── index.js        # createApiClient
│   │   │   └── httpClient.js
│   │   ├── auth/             # Authentication and credentials
│   │   │   ├── keychain.js
│   │   │   └── credentials.js
│   │   ├── config/           # Configuration loading/saving
│   │   │   └── index.js
│   │   ├── messaging/        # API message formatting
│   │   │   └── formatters.js
│   │   └── prompt/           # System prompt generation
│   │       └── index.js
│   ├── tools/
│   │   ├── definitions/      # Individual tool files (BashTool, EditTool...)
│   │   │   ├── bash.tool.js
│   │   │   ├── edit.tool.js
│   │   │   └── ...
│   │   ├── execution/        # executeToolCall, processToolMessage
│   │   │   └── index.js
│   │   ├── permissions.js    # Permission checking logic
│   │   └── preprocessing.js  # preprocessToolInput
│   ├── ui/
│   │   ├── components/       # Specific UI pieces (ToolUseRenderer, etc)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── styles/           # Styling/theming
│   │   └── ReplInterface.js  # Main REPL component
│   ├── todo/
│   │   ├── storage.js
│   │   ├── schema.js
│   │   └── TodoItemRenderer.js
│   ├── utils/
│   │   ├── error.js
│   │   ├── log.js
│   │   └── index.js
│   └── telemetry/
│       └── index.js        # trackEvent
├── package.json
├── tsconfig.json
└── ... (Other project files like tests, docs, etc.)
```

## Module Dependency Diagram (Inferred High-Level)

This diagram shows the likely high-level dependencies between the inferred modules. Arrows indicate a dependency (e.g., A --> B means A depends on B).

```mermaid
graph TD
    subgraph Core
        Core_API[api]
        Core_Auth[auth]
        Core_Config[config]
        Core_Messaging[messaging]
        Core_Prompt[prompt]
    end

    CLI[cli] --> Core_Config
    CLI --> Core_Auth
    CLI --> Tools[tools]
    CLI --> UI[ui]
    CLI --> Utils[utils]

    UI --> Tools
    UI --> Core_Messaging
    UI --> Utils
    UI --> Todo[todo] # TodoItemRenderer
    UI --> Telemetry[telemetry]

    Tools --> Core_Config
    Tools --> Core_Prompt # Tools listed in prompt
    Tools --> Utils
    Tools --> Telemetry
    Tools --> Core_Messaging # For createToolResult format

    Core_API --> Core_Auth
    Core_API --> Core_Config
    Core_API --> Utils
    Core_API --> Telemetry

    Core_Auth --> Core_Config
    Core_Auth --> Utils

    Core_Messaging --> Core_API
    Core_Messaging --> Tools # Uses tool output

    Core_Prompt --> Tools # Needs list of tools

    Todo --> Utils

    # Telemetry is likely used across multiple modules
    Telemetry -- Used By --> Core_API
    Telemetry -- Used By --> Tools
    Telemetry -- Used By --> UI

    classDef default fill:#2d2d2d,stroke:#ccc,stroke-width:1px,color:#ccc;
```

## Dependencies

Key external dependencies inferred:

*   `react`
*   `ink` (for terminal UI)
*   `commander` (for CLI parsing)
*   `zod` (likely used for schemas like `inputSchema`, `todoItemSchema`)
*   AWS SDK components (e.g., `@aws-sdk/client-bedrock-runtime`)
*   Potentially `@google-cloud/vertexai`
*   Filesystem (`fs`), path (`path`), child process (`child_process`) Node.js modules.
*   Possibly security/keychain access libraries or direct shell execution. 