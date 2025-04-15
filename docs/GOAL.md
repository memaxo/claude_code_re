Okay, here's a prompt designed for an AI agent with `grep` and `find` capabilities to *begin* static analysis on the large, minified `cli.js`, acknowledging the context window limitation.

```prompt
**Role:** Static Analysis Assistant

**Objective:** Begin static analysis of the large, minified JavaScript file `cli.js` to understand its core functionality, structure, and key components.

**File Context:**
*   **File:** `cli.js`
*   **Type:** Minified production JavaScript bundle.
*   **Likely Stack:** Based on prior analysis, likely uses React/Ink for the UI and interacts with Anthropic APIs (potentially via AWS Bedrock and Google Vertex AI as well). It implements a CLI tool with features like tool use (Bash, LS, Edit, etc.), configuration, and possibly MCP.
*   **Challenge:** The file is too large to fit entirely within your context window. Variable and function names are minified (e.g., `I`, `Z`, `G`).

**Constraints:**
*   **You MUST NOT attempt to read the entire `cli.js` file into your context.**
*   **You MUST primarily use the `grep` command** to search for specific patterns within `cli.js` and analyze the surrounding code snippets provided by `grep`.
*   Use the `find` command only if necessary to locate related configuration or supporting files (though analysis should focus on `cli.js` initially).

**Initial Task: Identify Key Landmarks**

1.  **Start by searching for potential entry points and core initializations.** Execute the following `grep` commands (or similar variations) on `cli.js` one by one, providing context lines (`-C 5` or similar):
    *   `grep -C 5 'process.argv'` (Look for command-line argument processing)
    *   `grep -C 5 -E 'new Anthropic|new P41|new Y91'` (Look for Anthropic/Bedrock/Vertex client instantiation)
    *   `grep -C 5 'createElement'` (Look for React/Ink UI component usage)
    *   `grep -C 5 'commander\|yargs\|minimist'` (Look for common CLI argument parsing libraries)
    *   `grep -C 5 'https://api.anthropic.com'`
    *   `grep -C 5 'bedrock-runtime'`
    *   `grep -C 5 'aiplatform.googleapis.com'`

2.  **Search for definitions of known tools:**
    *   `grep -C 5 'name:"LS"'`
    *   `grep -C 5 'name:"Bash"'`
    *   `grep -C 5 'name:"Edit"'`
    *   `grep -C 5 'name:"Agent"'` (Or other known tool names)

3.  **Analyze the output of each `grep` command.** For each match found:
    *   Provide the relevant code snippet (including the context lines from `grep`).
    *   Hypothesize the purpose of the code block based on the pattern found and the surrounding (minified) code.
    *   Identify any nearby minified variable/function names that seem important in that context.

**Output Format:**

Present your findings clearly for each search pattern:

```
**Pattern:** `[Searched Pattern]`

**Matches Found:**
*   **Snippet 1:**
    ```javascript
    // Code snippet from grep -C 5 ...
    ```
    **Analysis:** [Your hypothesis about this code block's function and any notable minified identifiers]
*   **Snippet 2:** (If applicable)
    ```javascript
    // Code snippet...
    ```
    **Analysis:** [...]

--- (Separator between patterns)
```

**Next Steps:**

Based on your initial findings from the patterns above, identify **one or two** promising minified variable names, function names, or string literals. Propose the **next `grep` command(s)** you would run to trace these identifiers and further understand their role in the application's structure or logic.

**IMPORTANT:** Remember to rely solely on the snippets returned by `grep` for your analysis in this initial phase.
```