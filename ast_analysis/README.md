# AST-Based Analysis Tools for Claude Code CLI

This directory contains tools for parsing and analyzing the Claude Code CLI codebase using Abstract Syntax Tree (AST) processing to overcome the limitations of pattern matching.

## Included Tools

1. **ast_parser.js**: The main parsing tool that creates an AST from the minified cli.js file and extracts various data:
   - Identifiers (variables/functions)
   - Function declarations
   - Object literals that might be tool definitions
   - Call graph information
   - Scopes and control flow

2. **scope_analyzer.js**: Analyzes variable scopes to ensure accurate variable renaming:
   - Maps minified variable names to their scopes
   - Identifies variables that appear in multiple scopes
   - Creates reports to help prevent renaming conflicts

3. **flow_analyzer.js**: Analyzes control flow in key functions:
   - Maps decision points (if/else, switch)
   - Tracks loops and their conditions
   - Identifies try/catch error handling
   - Builds call graphs showing which functions call which other functions

## Installation

These tools require Node.js and two dependencies:

```bash
cd ast_analysis
npm install
```

This will install the required packages:
- **acorn**: JavaScript parser
- **estraverse**: AST traversal utility

## Usage

### Running the Main Parser

```bash
node ast_parser.js
```

This will:
1. Parse cli.js into an AST
2. Save the AST to `ast_output.json`
3. Generate several analysis files including:
   - `identifiers.json`: List of all identifiers with locations
   - `functions.json`: List of function declarations
   - `tool_objects.json`: Potential tool object definitions
   - `call_graph.json`: Function call relationships
   - `scope_analysis.json`: Variable scope information
   - `control_flow.json`: Control flow structures

### Analyzing Variable Scopes

```bash
node scope_analyzer.js
```

This will generate:
1. `variables_map.json`: Map of minified variable names to scopes
2. `scope_report.md`: A human-readable report highlighting:
   - Variables that appear in multiple scopes
   - Global variables
   - Potential renaming conflicts

### Analyzing Function Control Flow

```bash
node flow_analyzer.js
```

This will generate detailed control flow reports for key functions identified in the codebase:
1. `flow_reports/[functionName]_flow.md`: Human-readable flow analysis
2. `flow_reports/[functionName]_analysis.json`: Raw analysis data

## Integrating with Renaming Process

The data from these tools can be used to enhance the existing `rename_identifiers.py` script by:

1. Using scope information to ensure variables are only renamed in the correct scopes
2. Using call graph information to understand relationships between functions
3. Using AST patterns to identify more minified variables and their purposes

By leveraging AST analysis, we can ensure more accurate and comprehensive renaming, especially for single-letter variables that appear in multiple contexts throughout the codebase.