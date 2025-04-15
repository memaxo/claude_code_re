# Code Analysis of Key Components

This document contains analysis of important code snippets from the `cli.js` file.

## Command-Line Argument Processing

```javascript
ho1.exports = (I, Z = process.argv) => {
  let G = I.startsWith("-") ? "" : I.length === 1 ? "-" : "--",
    W = Z.indexOf(G + I),
    B = Z.indexOf("--");
  return W !== -1 && (B === -1 || W < B);
};
```

This snippet implements a command-line flag check utility. It takes a flag name and optionally the argv array, then:
1. Determines whether the flag needs a single dash or double dash prefix
2. Checks if the flag exists in the arguments
3. Makes sure it appears before any `--` argument separator
4. Returns true if the flag is present, false otherwise

## API Client Instantiation

```javascript
function tO({
  apiKey: I,
  maxRetries: Z = 0,
  model: G,
  isNonInteractiveSession: W,
}) {
  if (qp) return qp;
  let B = $00(G),
    V = { "x-app": "cli", "User-Agent": OO, ...Zn5() },
    Y = process.env.ANTHROPIC_AUTH_TOKEN || Au();
  if (Y)
    (V.Authorization = `Bearer ${Y}`),
      (V["Proxy-Authorization"] = `Bearer ${Y}`);
  let w = {
    defaultHeaders: V,
    maxRetries: Z,
    timeout: parseInt(process.env.API_TIMEOUT_MS || String(60000), 10),
    httpAgent: In5(),
  };
  if (b3) {
    let X = new P41(w);
    return (qp = X), X;
  }
  if (s3) {
    let X = { ...w, region: B || process.env.CLOUD_ML_REGION || "us-east5" },
      H = new Y91(X);
    return (qp = H), H;
  }
  return new N_0({ apiKey: I || uY(W), dangerouslyAllowBrowser: !0, ...w });
}
```

This function creates API clients for different backends:
1. Creates common configuration with headers, retries, timeout, etc.
2. It supports three types of API clients:
   - Anthropic API client (default)
   - AWS client (likely Bedrock) when `b3` is true
   - Google client (likely Vertex AI) when `s3` is true
3. For authentication, it uses:
   - For Anthropic: API key from parameter or from `uY(W)` function
   - For Bearer token auth: Uses `process.env.ANTHROPIC_AUTH_TOKEN` or `Au()`
4. Headers include `"x-app": "cli"` to identify client and `User-Agent: OO`

## Credential Management - API Key Retrieval

```javascript
function uY(I) {
  let Z = f0();
  if (I && process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  if (!1 === "true") {
    if (!process.env.ANTHROPIC_API_KEY)
      throw new Error("ANTHROPIC_API_KEY env var is required");
    return process.env.ANTHROPIC_API_KEY;
  }
  {
    let G = Au();
    if (G) return G;
    return q91();
  }
  return null;
}
```

The `uY` function is responsible for retrieving the API key. It tries several sources:
1. If `I` is true and `ANTHROPIC_API_KEY` env var exists, it uses that
2. There appears to be a production check (hardcoded to false in the minified code)
3. It calls `Au()` to try to get an auth token
4. As a fallback, it calls `q91()` to get a stored API key

## Credential Management - Configuration Loading

```javascript
var o$ = { config: null, mtime: 0 };
function f0() {
  try {
    let I = br(ZX) ? k79(ZX) : null;
    if (o$.config && I) {
      if (I.mtimeMs <= o$.mtime) return o$.config;
    }
    let Z = t$(ZX, WX);
    if (I) o$ = { config: Z, mtime: I.mtimeMs };
    else o$ = { config: Z, mtime: Date.now() };
    return Z;
  } catch {
```

The `f0` function loads configuration from a file (likely a config file at path `ZX`):
1. It implements a caching mechanism to avoid re-reading the file
2. Checks if the file has been modified since last read
3. Uses a helper function `t$` to parse the configuration
4. Returns the parsed config object

## Credential Management - API Key Storage

```javascript
var q91 = d2(() => {
  if (process.platform === "darwin")
    try {
      let Z = bH(`security find-generic-password -a $USER -w -s "${L2}"`);
      if (Z) return Z;
    } catch (Z) {
      l1(Z);
    }
  return f0().primaryApiKey ?? null;
});
```

The `q91` function retrieves an API key from secure storage:
1. On macOS (`process.platform === "darwin"`), it uses the Keychain
   - It shells out to `security find-generic-password` command via `bH` 
   - Looks for a password with service name `L2` for the current user
2. As a fallback, it uses `f0().primaryApiKey`, which is from the config file
3. `d2()` appears to be a memoization/caching wrapper

## Tool System - Bash Tool Definition

```javascript
var P9 = {
  name: "Bash",
  async description({ description: I }) {
    if ((x1("shell_implementation_used", { is_transient: Hz() }), I)) return I;
    return x1("tendgu_missed_bash_description", {}), "Run shell command";
  },
  async prompt() {
    return Rj2;
  },
  isReadOnly(I) {
    let { command: Z } = I;
    return (
      ("sandbox" in I ? !!I.sandbox : !1) ||
      TU(Z).every((W) => {
        for (let B of qb5) if (B.test(W)) return !0;
        return !1;
      })
    );
  },
  inputSchema: ay() ? uj2 : xj2,
  userFacingName(I) {
    return ("sandbox" in I ? !!I.sandbox : !1) ? "Bash (read-only)" : "Bash";
  },
  async isEnabled() {
    return !0;
  },
  async checkPermissions(I, Z) {
    if ("sandbox" in I ? !!I.sandbox : !1)
      return { result: !0, updatedInput: I };
    return kj2(I, Z);
  },
  async validateInput(I) {
```

This defines the Bash tool with these key properties:
1. `name`: "Bash" - The tool's identifier
2. `description`: Function that returns the tool description, with telemetry tracking
3. `prompt`: Function returning a prompt (likely a UI component)
4. `isReadOnly`: Function that checks if a command should be treated as read-only
   - Checks for sandbox mode
   - Uses function `TU` to evaluate commands against patterns in `qb5`
5. `inputSchema`: Determines the schema based on a condition (`ay()`)
6. `userFacingName`: Returns either "Bash" or "Bash (read-only)" depending on sandbox mode
7. `isEnabled`: Always returns true (tool is always enabled)
8. `checkPermissions`: Checks if the tool has permission to run
9. `validateInput`: Validates the input

## Tool System - Edit Tool Definition

```javascript
var HI = {
  name: "Edit",
  async description() {
    return "A tool for editing files";
  },
  async prompt() {
    return rl2;
  },
  userFacingName({ old_string: I }) {
    if (I === "") return "Create";
    return "Update";
  },
  async isEnabled() {
    return !0;
  },
  inputSchema: Nc5,
```

This defines the Edit tool with these key properties:
1. `name`: "Edit" - The tool's identifier
2. `description`: Returns a static description
3. `prompt`: Returns a prompt component
4. `userFacingName`: Returns "Create" for new files or "Update" for existing files
5. `isEnabled`: Always returns true
6. `inputSchema`: Validation schema for inputs

## Tool System - Tool Execution

```javascript
async function* cc5(I, Z, G, W, B, V, Y, w) {
  let X = I.inputSchema.safeParse(W);
  if (!X.success) {
    let D = nc5(I.name, X.error);
    x1("tengu_tool_use_error", {
      error: "InputValidationError",
      messageID: Y.message.id,
      toolName: I.name,
    }),
      yield z5({
        content: [
          {
            type: "tool_result",
            content: `InputValidationError: ${D}`,
            is_error: !0,
            tool_use_id: Z,
          },
        ],
        toolUseResult: `InputValidationError: ${X.error.message}`,
      });
    return;
  }
  let H = Ov1(I, W),
    J = await I.validateInput?.(H, B);
  if (J?.result === !1) {
    x1("tengu_tool_use_error", { messageID: Y.message.id, toolName: I.name }),
      yield z5({
        content: [
          {
            type: "tool_result",
            content: J.message,
            is_error: !0,
            tool_use_id: Z,
          },
        ],
        toolUseResult: `Error calling tool: ${J.message}`,
      });
    return;
  }
  let A = w ? { result: !0, updatedInput: H } : await V(I, H, B, Y);
  if (A.result === !1) {
    yield z5({
      content: [
        {
          type: "tool_result",
          content: A.message,
          is_error: !0,
          tool_use_id: Z,
        },
      ],
      toolUseResult: `Error calling tool: ${A.message}`,
    });
    return;
  }
  try {
    let D = I.call(A.updatedInput, B, V, Y);
    for await (let K of D)
      switch (K.type) {
        case "result":
          x1("tengu_tool_use_success", {
            messageID: Y.message.id,
            toolName: I.name,
            isMcp: I.isMcp ?? !1,
          }),
            yield z5({
              content: [
                {
                  type: "tool_result",
                  content: I.renderResultForAssistant(K.data),
                  tool_use_id: Z,
                },
              ],
              toolUseResult: K.data,
            });
          break;
```

This function handles tool execution:
1. Validates the input against the tool's schema
2. Calls a tool-specific input preprocessor (`Ov1`)
3. Performs additional validation with the tool's `validateInput` method
4. Checks permissions with function `V`
5. Calls the tool's `call` method with the processed input
6. Processes and yields results, handling both success and error cases
7. Includes telemetry events for tool use success and errors

## Tool System - Message Processing

### Tool Message Handling

```javascript
function* processToolMessage(input, options, context, config, state, result) {
  let Y = input.name,
    w = state.options.tools.find((H) => H.name === Y);
  if (!w) {
    trackEvent("tengu_tool_use_error", {
      error: `No such tool available: ${Y}`,
      toolName: Y,
      toolUseID: input.id,
      isMcp: !1,
    }),
      yield createToolResult({
        content: [
          {
            type: "tool_result",
            content: `Error: No such tool available: ${Y}`,
            is_error: !0,
            tool_use_id: input.id,
          },
        ],
        toolUseResult: `Error: No such tool available: ${Y}`,
      });
    return;
  }
  let X = input.input;
  try {
    if (state.abortController.signal.aborted) {
      trackEvent("tengu_tool_use_cancelled", {
        toolName: w.name,
        toolUseID: input.id,
        isMcp: w.isMcp ?? !1,
      });
      let H = Fi2(input.id);
      yield createToolResult({ content: [H], toolUseResult: sU });
      return;
    }
    for await (let H of executeToolCall(w, input.id, options, X, state, config, context, result)) yield H;
  } catch (H) {
    logError(H instanceof Error ? H : new Error(String(H))),
      yield createToolResult({
        content: [
          {
            type: "tool_result",
            content: "Error calling tool",
            is_error: !0,
            tool_use_id: input.id,
          },
        ],
        toolUseResult: "Error calling tool",
      });
  }
}
```

### Tool Execution

```javascript
async function* executeToolCall(input, options, context, config, state, result, Y, w) {
  let X = input.inputSchema.safeParse(config);
  if (!X.success) {
    let D = nc5(input.name, X.error);
    trackEvent("tengu_tool_use_error", {
      error: "InputValidationError",
      messageID: Y.message.id,
      toolName: input.name,
    }),
      yield createToolResult({
        content: [
          {
            type: "tool_result",
            content: `InputValidationError: ${D}`,
            is_error: !0,
            tool_use_id: options,
          },
        ],
        toolUseResult: `InputValidationError: ${X.error.message}`,
      });
    return;
  }
  let H = preprocessToolInput(input, config),
    J = await input.validateInput?.(H, state);
  if (J?.result === !1) {
    trackEvent("tengu_tool_use_error", { messageID: Y.message.id, toolName: input.name }),
      yield createToolResult({
        content: [
          {
            type: "tool_result",
            content: J.message,
            is_error: !0,
            tool_use_id: options,
          },
        ],
        toolUseResult: `Error calling tool: ${J.message}`,
      });
    return;
  }
  let A = w ? { result: !0, updatedInput: H } : await result(input, H, state, Y);
  if (A.result === !1) {
    yield createToolResult({
      content: [
        {
          type: "tool_result",
          content: A.message,
          is_error: !0,
          tool_use_id: options,
        },
      ],
      toolUseResult: `Error calling tool: ${A.message}`,
    });
    return;
  }
  try {
    let D = input.call(A.updatedInput, state, result, Y);
    for await (let K of D)
      switch (K.type) {
        case "result":
          trackEvent("tengu_tool_use_success", {
            messageID: Y.message.id,
            toolName: input.name,
            isMcp: input.isMcp ?? !1,
          }),
            yield createToolResult({
              content: [
                {
                  type: "tool_result",
                  content: input.renderResultForAssistant(K.data),
                  tool_use_id: options,
                },
              ],
              toolUseResult: K.data,
            });
          break;
        // Additional cases for progress and other statuses
      }
  } catch (error) {
    // Error handling
  }
}
```

### Tool Result Creation

```javascript
function createToolResult({ content: input, toolUseResult: options }) {
  return {
    type: "user",
    message: { role: "user", content: input },
    uuid: Qp(),
    toolUseResult: options,
  };
}
```

### Tool System Organization & Discovery

```javascript
var primaryTools = [ViewTool, GlobTool, GrepTool, LSTool, WebFetchTool, BatchTool, ...[]];

// Function to get available tools, potentially bypassing permissions
async function nv1(input) {
  return (await (input === "bypassPermissions" ? oU() : primaryTools)).filter(
    (options) => options.name !== tv.name,
  );
}

// Cached function to get all enabled tools
var oU = d2(async () => {
  let input = [tv, BashTool, wn2, GlobTool, GrepTool, LSTool, ViewTool, EditTool, JI, WebFetchTool, pW, BatchTool, a51, ZD, ...[]],
    options = await Promise.all(input.map((context) => context.isEnabled()));
  return input.filter((context, config) => options[config]);
});
```

This code shows the organization of tools in the system:
1. `primaryTools` is the basic array containing the most commonly used tools
2. `oU()` function returns all enabled tools, checking each tool's `isEnabled` method
3. `nv1()` function handles access to tools, potentially bypassing permissions
4. Tool availability is cached for performance
5. The complete tool set includes many more tools than are in the primary array

### Tool Input Preprocessing

```javascript
function preprocessToolInput(input, options) {
  switch (input) {
    case BashTool: {
      let context = BashTool.inputSchema.parse(options),
        { command: config, timeout: state, sandbox: result, description: Y } = context,
        w = config.replace(`cd ${l0()} && `, "");
      if (/^echo\s+["']?[^|&;><]*["']?$/i.test(w.trim()))
        trackEvent("bash_tool_simple_echo", {});
      return {
        command: w,
        ...(state ? { timeout: state } : {}),
        ...(result !== void 0 ? { sandbox: result } : {}),
        ...(Y ? { description: Y } : {}),
      };
    }
    case EditTool:
      return Ii2(options);
    default:
      return options;
  }
}
```

This function handles specialized preprocessing for tool inputs:
1. For the Bash tool, it does special processing:
   - Removes `cd [directory] &&` prefix for better command display
   - Tracks simple echo commands separately
   - Preserves timeout, sandbox, and description parameters
2. For the Edit tool, it calls a dedicated helper function `Ii2`
3. For other tools, it passes the options through unchanged

### Tool Permission Checking

```javascript
var kj2 = async (input, options, context = Qj2) => {
  let config = Gd1(input, options.getToolPermissionContext());
  if (config.result) return config;
  if (qj2(input.command))
    return {
      result: !1,
      behavior: "ask",
      message: `Claude requested permissions to use ${BashTool.name}, but you haven't granted it yet.`,
      decisionReason: {
        type: "other",
        reason: "Unsupported shell control operator",
      },
      ruleSuggestions: null,
    };
  let state = validateCommands(input.command).filter((J) => {
      if (J === `cd ${l0()}`) return !1;
      return !0;
    }),
    result = await context(
      input.command,
      options.abortController.signal,
      options.options.isNonInteractiveSession,
    );
  
  // Additional logic for checking command permissions
}
```

This function handles permission checking for the Bash tool:
1. First checks existing permissions with `Gd1`
2. Rejects commands with unsupported shell operators
3. Parses the command into subcommands for fine-grained permission checking
4. Generates permission rule suggestions when applicable
5. Returns a detailed response including permission result, behavior instruction, and user-facing message

### Tool UI Rendering

```javascript
function ToolUseRenderer({
  param: input,
  costUSD: options,
  durationMs: context,
  addMargin: config,
  tools: state,
  debug: result,
  verbose: Y,
  erroredToolUseIDs: w,
  inProgressToolUseIDs: X,
  unresolvedToolUseIDs: H,
  progressMessagesForMessage: J,
  shouldAnimate: A,
  shouldShowDot: D,
}) {
  let K = state.find((f) => f.name === input.name);
  if (!K) return logError(new Error(`Tool ${input.name} not found`)), null;
  let z = H.has(input.id),
    U = !X.has(input.id) && z,
    N = U ? j1().secondaryText : void 0,
    L = K.userFacingName(input.input),
    g = el5(K, input.input, { verbose: Y });
  // Component rendering
}
```

This component renders a tool use request in the UI:
1. Gets the tool definition from the available tools
2. Tracks the execution state (in progress, unresolved, etc.)
3. Gets a user-friendly display name for the tool
4. Generates a formatted representation of the input
5. Renders the tool use with appropriate styling and animation
```

This function is responsible for tool message processing:
1. Finds the tool by name from the available tools
2. Handles errors for unavailable tools
3. Checks for aborted operations
4. Delegates to `cc5` for actual tool execution
5. Handles and reports errors

## UI Component Rendering

### ReplInterface Component

```javascript
function ReplInterface({
  toolPermissionContext: input,
  setToolPermissionContext: options,
  apiKeyStatus: context,
  commands: config,
  forkNumber: state,
  messageLogName: result,
  isLoading: Y,
  onQuery: w,
  debug: X,
  verbose: H,
}) {
  // Component implementation
}

var MemoizedReplInterface = React.memo(ReplInterface);
```

This is the main REPL interface component that:
1. Accepts toolPermissionContext, apiKeyStatus, commands as props
2. Is wrapped in React.memo for performance optimization
3. Manages the primary UI state for the terminal interface

### Tool UI Components

```javascript
function ToolUseRenderer({
  param: input,
  costUSD: options,
  durationMs: context,
  addMargin: config,
  tools: state,
  debug: result,
  verbose: Y,
  erroredToolUseIDs: w,
  inProgressToolUseIDs: X,
  unresolvedToolUseIDs: H,
  progressMessagesForMessage: J,
  shouldAnimate: A,
  shouldShowDot: D,
}) {
  let K = state.find((f) => f.name === input.name);
  if (!K) return logError(new Error(`Tool ${input.name} not found`)), null;
  let z = H.has(input.id),
    U = !X.has(input.id) && z,
    N = U ? getThemeColors().secondaryText : void 0,
    L = K.userFacingName(input.input),
    g = formatToolInputForDisplay(K, input.input, { verbose: Y });
  // Rendering logic
}
```

The ToolUseRenderer component:
1. Takes a tool use request and displays it in the UI
2. Tracks execution state (in progress, errored, unresolved)
3. Gets user-facing name and formatted representation of tool input
4. Renders the tool use with appropriate styling

```javascript
function ToolResultRenderer({
  debug: input,
  param: options,
  message: context,
  messages: config,
  progressMessagesForMessage: state,
  tools: result,
  verbose: Y,
  width: w,
}) {
  if (options.content === CANCELED_TOOL_MESSAGE) return React.createElement(CanceledToolDisplay, null);
  if (options.content === PROGRESS_TOOL_MESSAGE || options.content === UNRESOLVED_TOOL_MESSAGE)
    return React.createElement(ProgressToolDisplay, {
      debug: input,
      progressMessagesForMessage: state,
      toolUseID: options.tool_use_id,
    });
  if (options.is_error) return React.createElement(ErrorToolResultDisplay, { param: options, verbose: Y });
  return React.createElement(SuccessToolResultDisplay, {
    debug: input,
    param: options,
    message: context,
    messages: config,
    tools: result,
    verbose: Y,
    width: w,
  });
}
```

The ToolResultRenderer component:
1. Decides which display component to use based on tool execution state
2. Renders different components for canceled, in-progress, error, and success states
3. Passes appropriate props to each specialized display component

## Command Registration and Handler Pattern

```javascript
Z.command("get <key>")
  .description("Get a config value")
  .option("-g, --global", "Use global config")
  .action(async (W, { global: B }) => {
    await initializeCommand(getEnvironmentContext(), "default"), console.log(getConfigValue(W, B ?? !1)), process.exit(0);
  }),
Z.command("set <key> <value>")
  .description("Set a config value")
  .option("-g, --global", "Use global config")
  .action(async (W, B, { global: V }) => {
    await initializeCommand(getEnvironmentContext(), "default"),
      setConfigValue(W, B, V ?? !1),
      console.log(`Set ${W} to ${B}`),
      process.exit(0);
  })
```

This shows the command registration pattern using commander.js:
1. Registers commands with descriptions and options
2. Each command has an async action handler that executes when the command is invoked
3. Most handlers perform their operation and exit immediately with `process.exit(0)`
4. Handlers typically await asynchronous operations before completing
5. The pattern demonstrates the non-interactive execution path

## Todo List Management System

### Todo Storage and Retrieval

```javascript
function Pb5() {
  let input = lj2(IX, "todos");
  if (!cj2(input)) Rb5(input, { recursive: !0 });
  return input;
}

function ij2() {
  return lj2(Pb5(), `${UY}.json`);
}

function n51() {
  let input = ij2();
  if (!cj2(input)) return [];
  try {
    let options = JSON.parse(Mb5(input, "utf-8"));
    return i51.parse(options);
  } catch (options) {
    return logError(options instanceof Error ? options : new Error(String(options))), [];
  }
}

function nj2(input) {
  let options = ij2();
  try {
    aA(options, JSON.stringify(input, null, 2));
  } catch (context) {
    logError(context instanceof Error ? context : new Error(String(context)));
  }
}
```

This code shows how the todo list system manages storage and retrieval:
1. `Pb5()` creates and returns the todo directory path
2. `ij2()` generates a path to the session-specific todo file
3. `n51()` loads todos from the file, parsing them and validating against a schema
4. `nj2()` saves the todos back to the file as formatted JSON
5. Error handling ensures the system recovers gracefully from file I/O errors

### Todo Tool Prompt

```javascript
var aj2 = `Use this tool to update your to-do list for the current session. This tool should be used proactively as often as possible to track progress,
    and to ensure that any new tasks or ideas are captured appropriately. Err towards using this tool more often than less, especially in the following situations:
    - Immediately after a user message, to capture any new tasks or update existing tasks
    - Immediately after a task is completed, so that you can mark it as completed and create any new tasks that have emerged from the current task
    - Add todos for your own planned actions
    - Update todos as you make progress
    - Mark todos as in_progress when you start working on them. Ideally you should only have one todo as in_progress at a time. Complete existing tasks before starting new ones.
    - Mark todos as completed when finished
    - Cancel todos that are no longer relevant
    
    Being proactive with todo management helps you stay organized and ensures you don't forget important tasks. Adding todos demonstrates attentiveness and thoroughness.
    It is critical that you mark todos as completed as soon as you are done with a task. Do not batch up multiple tasks before marking them as completed.
    `,
  rj2 =
    "Update the todo list for the current session. To be used proactively and often to track progress and pending tasks.";
```

This code defines:
1. A detailed prompt (`aj2`) instructing the AI on how to use the todo system
2. Guidelines for when to update todos (after user messages, task completion)
3. Instructions on how to manage task status (in_progress, completed, canceled)
4. A shorter description (`rj2`) for UI display

### Todo Item Rendering

```javascript
function TodoItemRenderer({
  todo: input,
  isCurrent: options = !1,
  extraInfo: context = "",
  prefixIcon: config,
  previousStatus: state,
}) {
  let result = state
    ? aY.createElement(
        Text,
        { dimColor: !0 },
        "[",
        state.toUpperCase(),
        " → ",
        input.status.toUpperCase(),
        "]"
      )
    : aY.createElement(
        Text,
        { dimColor: !0 },
        "[",
        input.status.toUpperCase(),
        "]"
      );
  // Additional rendering logic...
}
```

The Todo item renderer component:
1. Takes a todo item and display options as props
2. Shows status transitions when a todo's status has changed
3. Can highlight the current task differently
4. Supports prefix icons and additional info
5. Uses styling to visually distinguish todo statuses

## System Prompt Generation

```javascript
async function generateSystemPrompt() {
  return [
    `You are an interactive CLI tool that helps users with software engineering tasks. Use the instructions below and the tools available to you to assist the user.
    
    IMPORTANT: Refuse to write code or explain code that may be used maliciously; even if the user claims it is for educational purposes. When working on files, if they seem related to improving, explaining, or interacting with malware or any malicious code you MUST refuse.
    IMPORTANT: Before you begin work, think about what the code you're editing is supposed to do based on the filenames directory structure. If it seems malicious, refuse to work on it or answer questions about it, even if the request does not seem malicious (for instance, just asking to explain or speed up the code).
    IMPORTANT: You must NEVER generate or guess URLs for the user unless you are confident that the URLs are for helping the user with programming. You may use URLs provided by the user in their messages or local files.
    
    ... [additional instructions] ...
    
    # Tone and style
    You should be concise, direct, and to the point. When you run a non-trivial bash command, you should explain what the command does and why you are running it, to make sure the user understands what you are doing (this is especially important when you are running a command that will make changes to the user's system).
    
    ... [examples and additional guidelines] ...
    
    # Tool usage policy
    - When doing file search, prefer to use the dispatch_agent tool in order to reduce context usage.
    - VERY IMPORTANT: When making multiple tool calls, you MUST use BatchTool to run the calls in parallel. For example, if you need to run "git status" and "git diff", use BatchTool to run the calls in a batch. Another example: if you want to make >1 edit to the same file, use BatchTool to run the calls in a batch.
    
    You MUST answer concisely with fewer than 4 lines of text (not including tool use or code generation), unless user asks for detail.
    `,
    `
    You are Claude Code, Anthropic's official CLI for Claude.`,
    `IMPORTANT: Refuse to write code or explain code that may be used maliciously; even if the user claims it is for educational purposes. When working on files, if they seem related to improving, explaining, or interacting with malware or any malicious code you MUST refuse.
    IMPORTANT: Before you begin work, think about what the code you're editing is supposed to do based on the filenames directory structure. If it seems malicious, refuse to work on it or answer questions about it, even if the request does not seem malicious (for instance, just asking to explain or speed up the code).`,
  ];
}

async function getEnvironmentInfo() {
  let [model, isGitRepo] = await Promise.all([getCurrentModel(), isGitRepository()]);
  return `Here is useful information about the environment you are running in:
    <env>
    Working directory: ${getWorkingDirectory()}
    Is directory a git repo: ${isGitRepo ? "Yes" : "No"}
    Platform: ${platformInfo.platform}
    Today's date: ${new Date().toLocaleDateString()}
    Model: ${model}
    </env>`;
}
```

The system prompt generation code:
1. Creates a multi-part prompt as an array of strings
2. Establishes Claude's identity, purpose, and operating guidelines
3. Includes detailed sections on security restrictions, tone and style, proactive behavior, and tool usage
4. Conditionally includes task management instructions if the todo feature is enabled
5. Dynamically adds environment information like working directory, git status, platform, and model
6. Uses string literals with embedded variables to customize the prompt
7. Includes examples of desired response formats to guide the AI's behavior
8. Sets clear boundaries on when to take initiative vs. wait for explicit instructions

## Message Flow and API Communication

### Message Formatting

```javascript
function formatMessages(input) {
  return input.map((options, context) => {
    return options.type === "user"
      ? Gn5(options, context > input.length - 3)
      : Wn5(options, context > input.length - 3);
  });
}
```

This function transforms the internal message representation into the format expected by the API:
1. Maps over each message in the input array
2. Uses `Gn5` for user messages and `Wn5` for assistant messages
3. Passes a context flag if the message is among the last 3 messages in the conversation
4. Both `Gn5` and `Wn5` handle different message content formats (string vs. structured)

### User Message Formatting

```javascript
function Gn5(input, options = !1) {
  if (options)
    if (typeof input.message.content === "string")
      return {
        role: "user",
        content: [
          {
            type: "text",
            text: input.message.content,
            ...(CM ? { cache_control: { type: "ephemeral" } } : {}),
          },
        ],
      };
    else
      return {
        role: "user",
        // Additional handling for structured content
      };
}
```

This function formats user messages:
1. Takes a message object and a flag indicating if it's a recent message
2. Handles both string content and structured content
3. Adds cache control metadata when the `CM` flag is enabled
4. Returns a properly formatted object for the API

### API Client Streaming Pattern

```javascript
Y.beta.messages.stream(
  {
    model: result.model,
    max_tokens: $1,
    messages: formatMessages(input),
    temperature: A,
    system: w,
    tools: [...X, ...(result.extraToolSchemas ?? [])],
    tool_choice: result.toolChoice,
    ...(J ? { betas: H } : {}),
    metadata: generateMetadata(),
    ...(context > 0
      ? { thinking: { budget_tokens: z1, type: "enabled" } }
      : {}),
  }
)
```

This code snippet shows how the API client makes streaming requests:
1. Uses the newer beta stream API (`beta.messages.stream`)
2. Provides the model, messages formatted with `formatMessages`, and parameters
3. Includes tools in the request from both built-in and extra schemas
4. Passes system message and temperature settings
5. Conditionally adds beta features when `J` is true
6. Includes metadata from `generateMetadata()`
7. Optionally enables "thinking" mode with a token budget if context > 0

### Metadata Generation

```javascript
function generateMetadata() {
  return { user_id: Cb() };
}
```

A simple function that:
1. Creates metadata for API requests
2. Includes a user ID from the `Cb()` function
3. Used to identify requests in telemetry and tracking

### Token Counting

```javascript
async function Pg2(input, options) {
  try {
    if (!input || input.length === 0) return 0;
    let context = await JZ(),
      config = await getApiKey(options);
    if (!config)
      throw new Error("No Anthropic API key available for token counting");
    return (
      await (
        await createApiClient({
          apiKey: config,
          maxRetries: 1,
          model: context,
          isNonInteractiveSession: options,
        })
      ).messages.countTokens({ model: context, messages: input })
    ).input_tokens;
  } catch (context) {
    return logError(context), null;
  }
}
```

This function handles token counting for messages:
1. Creates an API client specifically for token counting
2. Uses the `.messages.countTokens()` method to get token count
3. Returns only the `input_tokens` portion of the response
4. Includes error handling that logs errors but returns null

## API OAuth Configuration

```javascript
Zm5 = {
  ...Im5,
  AUTHORIZE_URL: "https://console.anthropic.com/oauth/authorize",
  TOKEN_URL: "https://console.anthropic.com/v1/oauth/token",
  API_KEY_URL:
    "https://api.anthropic.com/api/oauth/claude_cli/create_api_key",
  ROLES_URL: "https://api.anthropic.com/api/oauth/claude_cli/roles",
  SUCCESS_URL:
    "https://console.anthropic.com/buy_credits?returnUrl=/oauth/code/success",
  CLIENT_ID: "9d1c250a-e61b-44d9-88ed-5944d1962f5e",
};
var PB = Zm5;
```

This snippet defines the OAuth configuration for Anthropic:
1. Extends another config object `Im5`
2. Sets URLs for authorization, token endpoints, API key creation, etc.
3. Defines a client ID for OAuth
4. Assigns the config to variable `PB`