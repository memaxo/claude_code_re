# UI Component Analysis

This document tracks the UI components and their relationships based on static analysis of the Claude Code CLI.

## Component Hierarchy

```
ReplInterface (nr5)
├── ToolUseRenderer (ri2)
│   ├── CanceledToolDisplay (hi2)
│   ├── ProgressToolDisplay (li2)
│   └── ErrorToolDisplay (pi2)
├── ToolResultRenderer (ni2)
│   ├── SuccessToolResultDisplay (ii2) 
│   └── ErrorToolResultDisplay (pi2)
└── Other UI components
```

## React and Ink Components

| Variable | New Name | Purpose | Evidence |
|----------|----------|---------|----------|
| `nr5` | `ReplInterface` | Main REPL UI component | Contains tool permission context and state |
| `Cr2` | `MemoizedReplInterface` | Memoized version of ReplInterface | React.memo wrapper around ReplInterface |
| `ri2` | `ToolUseRenderer` | Component to render tool use | Displays tool requests in UI |
| `ni2` | `ToolResultRenderer` | Component to render tool results | Displays tool execution results |
| `hi2` | `CanceledToolDisplay` | Component for canceled tools | Renders canceled tool state |
| `pi2` | `ErrorToolResultDisplay` | Component for error results | Renders error messages for failed tools |
| `ii2` | `SuccessToolResultDisplay` | Component for successful results | Renders successful tool execution results |
| `li2` | `ProgressToolDisplay` | Component for in-progress tools | Shows spinner for tool execution |
| `zr2` | `useStartupTimer` | Hook for tracking startup time | Records and reports startup time |

## React and Ink Libraries

| Variable | New Name | Purpose | Evidence |
|----------|----------|---------|----------|
| `p7` | `React` | React library reference | Used for React.memo |
| `Fv4` | `React` | Main React object | Contains React hooks and methods |
| `HC` | `React` | React reference | Used for createElement |
| `AI` | `React` | React reference | Used for createElement |
| `G8` | `React` | React reference | Used for createElement |
| `dB` | `React` | React reference | Used for createElement |
| `Qr2` | `ink` | Ink library | Terminal UI React renderer |
| `BB` | `ReactCurrentDispatcher` | React internals | Used to access React hooks |
| `F7` | `ReactNoopUpdateQueue` | React internals | Used for React state updates |

## UI Elements and Components

| Variable | New Name | Purpose | Evidence |
|----------|----------|---------|----------|
| `C9` | `Box` | Ink Box component | Used for layout |
| `p` | `Box` | Ink Box component | Used for layout |
| `b` | `Text` | Ink Text component | Used for text rendering |
| `m61` | `Spinner` | Spinner/loading component | Used in ProgressToolDisplay |
| `_0` | `applyTermStyle` | Text styling utility | Used for terminal output styling |
| `I9` | `getThemeColors` | Theme color function | Used with applyTermStyle |
| `Fr2` | `formatPastedText` | Text formatter | Formats with line counts |
| `ar5` | `exitProcess` | Process exit function | Calls process.exit(0) |
| `rv1` | `LINE_COUNT_ADJUSTMENT` | Layout constant | Used for text formatting |
| `k61` | `findToolById` | Tool lookup function | Connects tool IDs to definitions |
| `Y0` | `InjectedRootElement` | UI root element | Used in React rendering |

## State Management

| Hook | Purpose | Evidence |
|------|---------|----------|
| `useState` | Manage component state | Used in various components |
| `useEffect` | Handle side effects | Used for startup timing |
| `useCallback` | Memoize callback functions | Referenced in React bindings |
| `useMemo` | Memoize computed values | Referenced in React bindings |
| `useRef` | Store mutable values | Referenced in React bindings |

## UI Constants and Messages

| Variable | New Name | Purpose | Evidence |
|----------|----------|---------|----------|
| `sU` | `CANCELED_TOOL_MESSAGE` | Message for canceled tools | Used in tool result handling |
| `Jp` | `PROGRESS_TOOL_MESSAGE` | Message for in-progress tools | Used in tool result handling |
| `bV` | `UNRESOLVED_TOOL_MESSAGE` | Message for unresolved tools | Used in error handling |