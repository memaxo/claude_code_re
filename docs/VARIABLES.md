# Minified Variable Mapping

This document tracks the mapping of minified variable names to their likely purposes based on static analysis.

## API Client and Authentication

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `tO` | Function to create API client | Creates and returns client instances for different APIs |
| `N_0` | Anthropic API client constructor | Created with API key and configuration |
| `P41` | AWS (Bedrock) API client constructor | Used when `b3` flag is true |
| `Y91` | Google (Vertex AI) API client constructor | Used when `s3` flag is true |
| `b3` | Flag for using AWS Bedrock | Used to determine which client to create |
| `s3` | Flag for using Google Vertex AI | Used to determine which client to create |
| `uY` | Function to retrieve API key | Tries multiple sources for API key |
| `f0` | Function to load configuration | Reads from config file with caching |
| `q91` | Function to get API key from secure storage | Checks macOS Keychain, then config |
| `Au` | Function to get auth token | Used for bearer token authentication |
| `L2` | Service name for keychain entry | Used with macOS `security` command |
| `bH` | Function to execute shell commands | Used to access macOS Keychain |
| `o$` | Cache for configuration | Holds config and modification time |
| `PB`, `Zm5`, `Im5` | Configuration objects for API endpoints | Contains URL constants for Anthropic's API endpoints |

## Tool System

### Tool Definitions

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `BashTool` | Bash tool definition | Contains name:"Bash" and validation logic |
| `EditTool` | Edit tool definition | Contains name:"Edit" and file editing logic |
| `ViewTool` | View tool definition | Referenced in agent tool description |
| `GlobTool` | GlobTool definition | Referenced in agent tool description |
| `GrepTool` | GrepTool definition | Referenced in agent tool description |
| `LSTool` | LS tool definition | Used in code with path and ignore params |
| `WebFetchTool` | WebFetch tool definition | Fetches and processes web content |
| `BatchTool` | Batch tool definition | Executes multiple tools in parallel |
| `JI` | ReadNotebook tool definition | Reads Jupyter notebook files |
| `tv` | Agent tool definition | Dispatches tasks to agent tools |
| `primaryTools` | Array of primary tool definitions | Contains core tools like ViewTool, GlobTool, etc. |

### Tool Management

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `oU` | Function to get all enabled tools | Returns filtered list of all available tools |
| `nv1` | Function to get agent-available tools | Filters tools based on permissions context |
| `l61` | Function to get all commands | Combines custom commands with built-in commands |
| `validateCommands` | Function to validate Bash commands | Used in Bash tool's isReadOnly check |
| `preprocessToolInput` | Function to preprocess tool inputs | Transforms input for specific tools |
| `Jn2` | Function to discover custom commands | Searches filesystem for command definitions |
| `Mi5` | Function that returns built-in commands | Returns array of command definitions |

### Tool Execution

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `executeToolCall` | Function for tool execution | Core function that executes tool logic |
| `processToolMessage` | Function for tool message processing | Handles tool use messages and results |
| `createToolResult` | Function to create tool result | Creates result objects for tool execution |
| `kj2` | Bash permission checking function | Validates Bash commands for permissions |
| `Gd1` | Permission context checker | Checks tool permissions against context |
| `Qj2` | Default permission context | Used as default for permission checking |
| `qj2` | Function to check for unsupported operators | Validates shell command syntax |
| `nc5` | Likely retrieves tool input schema | Called near schema validation in `executeToolCall` |
| `Ki2` | Likely handles tool progress messages/updates | Called in progress case within `executeToolCall` |
| `lc5` | Likely final result processing/cleanup | Called near end of `executeToolCall` |
| `Fi2` | Likely creates/logs cancellation message | Called on abort within `processToolMessage` |

### Tool UI Components

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `ToolUseRenderer` | Component to render tool use | Displays tool requests in UI |
| `ToolResultRenderer` | Component to render tool results | Displays tool execution results |
| `findToolById` | Function to find tool by ID | Connects tool use IDs to definitions |
| `ci2` | React.useMemo reference | Used for memoization in tool components |
| `el5` | Function to format tool input for display | Formats input for readable display |
| `hi2` | Component for canceled tools | Renders canceled tool state |
| `pi2` | Component for error results | Renders error messages for failed tools |
| `ii2` | Component for successful results | Renders successful tool execution results |

### Tool Tracking

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `trackEvent` | Telemetry/event tracking function | Records tool usage events |
| `sU` | Canceled tool message constant | Represents canceled tool message |
| `Jp`, `bV` | Special tool result constants | Represent special tool result states |

## HTTP and Networking

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `bI` | HTTP client for API requests | Used for making requests to api.anthropic.com endpoints |
| `OO` | User-Agent string | Used in headers for API requests |
| `Zn5` | Function that generates additional headers | Added to default headers for API requests |
| `In5` | Function that creates HTTP agent | Used for connection pooling/management |

## Command Line Parsing

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `commander` | Command-line argument parsing | Error handling related to commander library |
| `jW1` | Likely related to command-line flag checking | Used to check if flags are present in argv |
| `RT1` | Commander error type | Used in exit handling for command execution |
| `rr2` | InvalidArgumentError class | Extends CommanderError for argument validation |
| `qT1` | CommanderError class | Base error class for commander errors |

## React/UI Components

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `Fv4.createElement` | React createElement function | Assigned to Ss1 |
| `V.createElement` | Another reference to React's createElement | Assigned to w2 |
| `_0` | Text formatting/color utility | Used for terminal output styling |
| `I9()` | Function that returns styling/colors | Used with _0 for terminal output |
| `ri2` | Tool use rendering component | Renders tool_use messages in UI |
| `ni2` | Tool result rendering component | Renders tool_result messages in UI |
| `k61` | Function to find tool and use by ID | Used in UI components to locate tools/uses |

## Error Handling

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `jt2` | Function to check if object is an Error | Tests against multiple error types |
| `Qc` | Function to safely check instanceof | Wrapped in try/catch |
| `e71.CONSOLE_LEVELS` | Array of console methods to intercept | Used in console instrumentation |
| `l1` | Error logging function | Used to log errors from API key retrieval |

## System Prompt Generation

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `nR` | Function that generates the system prompt | Returns an array of prompt segments |
| `Zm2` | Function that returns the Claude identity line | Creates the "You are Claude Code" line |
| `Gm2` | Function that generates environment information | Returns working dir, platform, date, model info |
| `Ob5` | URL for Claude Code documentation overview | Used in system prompt for help references |
| `vb5` | URL for Claude Code tutorials | Used in system prompt for help references |
| `xX` | Text for interrupted request message | Referenced in synthetic messages section |
| `UNRESOLVED_TOOL_MESSAGE` | Message for unresolved tool requests | Used to identify synthetic messages |
| `Q2` | Platform information object | Used to get platform details |
| `Qv` | Function to check if todo feature is enabled | Controls inclusion of task management instructions |

## Main Execution Flow

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `fM` | Function to initialize/setup before command execution | Called at the start of command handlers |
| `WN` | Likely returns a context or environment object | Used in command initialization |
| `ZB0` | Function to get config value | Used in "get" command handler |
| `GB0` | Function to set config value | Used in "set" command handler |
| `WB0` | Function to remove config value | Used in "remove" command handler |
| `BB0` | Function to list config values | Used in "list" command handler |
| `En2` | Function to process/format messages | Used when sending messages to API |
| `Np` | Function to generate metadata | Used in API requests |
| `nr5` | Main REPL UI component | Contains tool permission context and other REPL state |
| `Cr2` | Memoized version of nr5 component | React.memo wrapper around nr5 |

## Todo List Management

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `aj2` | Todo tool prompt | Detailed instructions for todo management |
| `rj2` | Todo tool short description | Brief description of todo functionality |
| `SJ` | Todo item rendering component | Displays a todo with status information |
| `fb5` | Todo tool identifier string | Used for accessing todo tool config |
| `Pb5` | Function to get todos directory | Creates directory if needed |
| `ij2` | Function to get todo file path | Returns path to session-specific todo file |
| `n51` | Function to load todos | Retrieves todos from JSON file |
| `nj2` | Function to save todos | Saves todo list to JSON file |
| `Eb5` | Todo item schema | Defines structure of a todo item |
| `i51` | Todo list schema | Array of todo items |
| `UY` | Session identifier | Used to create session-specific todo files |

## REPL and UI

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `useInput` | Hook for capturing user input | Common pattern in Ink applications |
| `ar5` | Function to exit the process | Calls `process.exit(0)` |
| `zr2` | Unknown UI-related function | Located near other UI components |
| `Fr2` | Function to format pasted text | Formats text with line counts |

## Message Flow and API Communication

| Variable | Purpose | Evidence |
|----------|---------|----------|
| `formatMessages` | Formats messages for API calls | Used before API requests to transform message format |
| `Gn5` | Formats user messages | Called by `formatMessages` for user messages |
| `Wn5` | Formats assistant messages | Called by `formatMessages` for assistant messages |
| `generateMetadata` | Creates metadata for API requests | Returns an object with user ID info |
| `Pg2` | Counts tokens in messages | Uses API to count tokens in messages |
| `e61` | Splits system prompt into parts | Processes system prompt text |
| `Vn5` | Creates API request with system/user messages | Sets up API request parameters |
| `JZ` | Gets the current model | Used to determine model for API calls |
| `createToolResult` | Creates tool result message | Transforms tool output into message format |
| `Ki2` | Handles tool message continuation | Used for progressive tool execution |
| `sU` | Represents canceled tool message | Used when a tool is canceled |

## Note on Naming Patterns

The variable naming follows typical minification patterns:
- Single letters (I, Z, G, W) for common function parameters. **Scope analysis confirms these specific variables appear in many different scopes (`ast_analysis/scope_report.md`), making automatic replacement unsafe.**
- Short character sequences with numbers (xP, _0, I9) for module-level variables
- Longer names with numbers (jW1, RT1, Ub5) for exported functions/objects
- Command handlers tend to use `process.exit(0)` to terminate after execution
- UI components have React patterns (useState, useEffect, memo)