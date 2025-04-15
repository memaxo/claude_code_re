# Claude Code Architecture Diagrams

This document contains diagrams illustrating the overall architecture and component interactions of the Claude Code CLI.

## High-Level Architecture

This diagram shows the main components and their interactions at a high level.

```mermaid
graph LR
    subgraph User Interface (React/Ink)
        CLI_Interface[CLI Input/Output]
        UI_Renderer[UI Renderer (Ink)]
        Tool_UI[Tool Renderers]
    end

    subgraph Core Logic
        Command_Parser[Command Parser (Commander.js)]
        Message_Processor[Message Processor]
        Tool_Executor[Tool Executor (`executeToolCall`)]
        Config_Mgr[Config Manager]
        Auth_Mgr[Auth Manager]
    end

    subgraph Backend Services
        API_Client[API Client (Anthropic/Bedrock/Vertex)]
        Ext_API[(External APIs)]
    end

    subgraph System Interaction
        Tools[Tools (Bash, Edit, etc.)]
        FileSystem[(File System)]
        Keychain[(macOS Keychain)]
        Shell[(Shell)]
    end

    User[User] -- Interacts --> CLI_Interface
    CLI_Interface -- User Input --> Command_Parser
    CLI_Interface -- Renders --> UI_Renderer

    Command_Parser -- Non-Interactive Cmd --> Config_Mgr
    Command_Parser -- Interactive Mode --> Message_Processor
    Command_Parser -- Uses --> Config_Mgr

    Message_Processor -- Sends/Receives --> API_Client
    Message_Processor -- Triggers Tool --> Tool_Executor
    Message_Processor -- Updates --> UI_Renderer

    Tool_Executor -- Executes --> Tools
    Tool_Executor -- Checks Auth --> Auth_Mgr
    Tool_Executor -- Updates UI --> Tool_UI
    Tool_Executor -- Uses --> Config_Mgr

    Tools -- Access --> FileSystem
    Tools -- Access --> Shell
    Tools -- Access --> Keychain # Via AuthMgr?

    Auth_Mgr -- Access --> Keychain
    Auth_Mgr -- Uses --> Config_Mgr

    API_Client -- Calls --> Ext_API
    API_Client -- Uses --> Auth_Mgr
    API_Client -- Uses --> Config_Mgr

    UI_Renderer -- Contains --> Tool_UI

    classDef default fill:#2d2d2d,stroke:#ccc,stroke-width:1px,color:#ccc;

```

**Key Interactions:**

1.  **User -> CLI:** User interacts via the terminal.
2.  **CLI -> Parser:** Input is parsed by Commander.js.
3.  **Parser -> Core:** Depending on the command, either configuration/auth is managed directly, or the main message processing loop is initiated for interactive mode.
4.  **Core <-> API Client:** Core logic sends formatted messages and receives responses/tool requests.
5.  **Core -> Tool Executor:** When a tool is requested, the executor handles validation, permissions, and execution.
6.  **Tool Executor -> Tools:** The specific tool logic is invoked.
7.  **Tools -> System:** Tools interact with the filesystem, shell, etc.
8.  **Core -> UI:** Core logic updates the React/Ink UI renderer with messages, status, and tool outputs. 