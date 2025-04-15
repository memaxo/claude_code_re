# Identifier Replacement Guide for cli.js

This document provides a systematic approach to replacing minified identifiers in cli.js with descriptive names based on our static analysis.

## Usage Instructions
1. Use VS Code's "Find and Replace" functionality with "Match Whole Word" option enabled
2. For function parameters, use "Find in Selection" after selecting the function body
3. Work through the sections sequentially for best results
4. After each batch of replacements, check the code to ensure consistency

## API Client and Authentication

| Original | Replacement | Description |
|----------|-------------|-------------|
| `tO` | `createApiClient` | Function that creates API clients |
| `N_0` | `AnthropicClient` | Anthropic API client constructor |
| `P41` | `BedrockClient` | AWS Bedrock API client constructor |
| `Y91` | `VertexAIClient` | Google Vertex AI client constructor |
| `b3` | `useBedrockBackend` | Flag for using AWS Bedrock |
| `s3` | `useVertexBackend` | Flag for using Google Vertex AI |
| `uY` | `getApiKey` | Function to retrieve API key |
| `f0` | `loadConfig` | Function to load configuration |
| `q91` | `getApiKeyFromStorage` | Function to get API key from secure storage |
| `Au` | `getAuthToken` | Function to get authentication token |
| `L2` | `KEYCHAIN_SERVICE_NAME` | Service name for keychain entry |
| `bH` | `execShellCommand` | Function to execute shell commands |
| `o$` | `configCache` | Cache for configuration |
| `qp` | `cachedApiClient` | Cached API client instance |
| `OO` | `USER_AGENT` | User-Agent string for API requests |
| `PB` | `OAUTH_CONFIG` | Configuration object for OAuth |
| `Zm5` | `anthropicOAuthConfig` | Anthropic-specific OAuth configuration |
| `Im5` | `baseOAuthConfig` | Base OAuth configuration |

## Tool System

| Original | Replacement | Description |
|----------|-------------|-------------|
| `P9` | `BashTool` | Bash tool definition |
| `HI` | `EditTool` | Edit tool definition |
| `iY` | `ViewTool` | View tool definition |
| `Zw` | `GlobTool` | GlobTool definition |
| `aX` | `GrepTool` | GrepTool definition |
| `$J` | `LSTool` | LS tool definition |
| `XC` | `WebFetchTool` | Likely WebFetch tool definition |
| `hW` | `BatchTool` | Likely Batch tool definition |
| `sl5` | `primaryTools` | Array of tool definitions |
| `Ji5` | `getAvailableTools` | Function that returns available tools |
| `TU` | `validateCommands` | Function to validate Bash commands |
| `Ov1` | `preprocessToolInput` | Function to preprocess tool inputs |
| `cc5` | `executeToolCall` | Function for tool execution |
| `O61` | `processToolMessage` | Function for tool message processing |
| `z5` | `createToolResult` | Function to create tool result objects |
| `x1` | `trackEvent` | Telemetry/event tracking function |

## HTTP and Networking

| Original | Replacement | Description |
|----------|-------------|-------------|
| `bI` | `httpClient` | HTTP client for API requests |
| `Zn5` | `getAdditionalHeaders` | Function that generates additional headers |
| `In5` | `createHttpAgent` | Function that creates HTTP agent |
| `$00` | `getRegionForModel` | Function that determines region for a model |

## Command Line Parsing

| Original | Replacement | Description |
|----------|-------------|-------------|
| `jW1` | `hasCommandFlag` | Function to check for command-line flags |
| `RT1` | `CommanderError` | Commander error type |
| `rr2` | `InvalidArgumentError` | Error class for argument validation |
| `qT1` | `BaseCommanderError` | Base error class for commander errors |

## React/UI Components

| Original | Replacement | Description |
|----------|-------------|-------------|
| `_0` | `applyTermStyle` | Text formatting/color utility |
| `I9` | `getThemeColors` | Function that returns styling/colors |
| `ri2` | `ToolUseRenderer` | Component for rendering tool use messages |
| `ni2` | `ToolResultRenderer` | Component for rendering tool results |
| `k61` | `findToolById` | Function to find tool by ID |
| `nr5` | `ReplInterface` | Main REPL UI component |
| `Cr2` | `MemoizedReplInterface` | Memoized version of REPL interface |
| `ar5` | `exitProcess` | Function to exit the process |
| `Fr2` | `formatPastedText` | Function to format pasted text |

## Main Execution Flow

| Original | Replacement | Description |
|----------|-------------|-------------|
| `fM` | `initializeCommand` | Function to initialize before command execution |
| `WN` | `getEnvironmentContext` | Function that returns environment context |
| `ZB0` | `getConfigValue` | Function to get config value |
| `GB0` | `setConfigValue` | Function to set config value |
| `WB0` | `removeConfigValue` | Function to remove config value |
| `BB0` | `listConfigValues` | Function to list all config values |
| `En2` | `formatMessages` | Function to format messages for API |
| `Np` | `generateMetadata` | Function to generate request metadata |

## Error Handling

| Original | Replacement | Description |
|----------|-------------|-------------|
| `jt2` | `isErrorObject` | Function to check if object is an Error |
| `Qc` | `safeInstanceCheck` | Function to safely check instanceof |
| `l1` | `logError` | Error logging function |

## Common Function Parameters
When renaming function parameters, use these consistent names based on the pattern observed:

| Common Parameter | Suggested Name | Description |
|------------------|----------------|-------------|
| `I` | `input` or context-specific name | First parameter, often the main input |
| `Z` | `options` or context-specific name | Second parameter, often options |
| `G` | `context` or context-specific name | Third parameter, often context |
| `W` | `config` or context-specific name | Fourth parameter, often configuration |
| `B` | `state` or context-specific name | Fifth parameter, often state |
| `V` | `result` or context-specific name | Sixth parameter |

## Implementation Order

1. Start with API client and authentication variables
2. Next, rename tool system variables
3. Then networking and command-line parsing variables
4. Followed by UI components
5. Finally, error handling and miscellaneous utilities

## Notes on Approach

- Use the editor's "Find and Replace" with "Match Whole Word" option
- For parameters, select only the function body to avoid changing variables with the same name elsewhere
- Variables with single-letter names (I, Z, G, W) require special attention as they might have different meanings in different contexts. **The scope analysis confirms many of these (see `ast_analysis/scope_report.md`) appear in multiple scopes and should NOT be automatically replaced by script.**
- After renaming a function, immediately rename its parameters for better code understanding
- Property names within objects are often preserved in minification, so focus on variable names