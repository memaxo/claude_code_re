#!/usr/bin/env python3
"""
Script to rename minified identifiers in cli.js according to a hardcoded mapping.
This script uses regex with word boundary checks to ensure only whole identifiers are replaced.
"""

import re
import os
import sys
from collections import OrderedDict

# Configuration
CLI_JS_PATH = "cli.js"
OUTPUT_PATH = "cli_renamed_v2.js"

# Variables identified as appearing in multiple scopes in scope_report.md
# These will be excluded from automatic replacement to avoid errors.
MULTI_SCOPE_EXCLUDE_SET = {
    'I', 'Z', 'G', 'W', 'B', 'V', 'Y', 'w', 'X', 'H', 'J', 'A', 
    'F', 'D', 'K', 'q', 'z', 'U', 'C', 'R', 'N', 'Q', 'M', 'L', 
    'd', 'f', 'S', 'g', 'v', 'E', 'P', 'T', 'O', '_', '$', 'r', 
    'p', 'b', 'x', 'y', 'm', 'k', 'c', 't', 'n', 's', 'h', 'u', 
    'a', 'e', 'i', 'o', 'l', 'j', 'iO', 'lO', 'S_', 'eO', 'tO', 
    'nO', 'sO' # Added all 61 from report for safety
}

def create_regex_for_identifier(identifier):
    """
    Creates a regex pattern that matches the identifier with appropriate boundaries.
    Handles special characters like $, _, etc. properly.
    """
    # If the identifier starts with a special character like $, handle it specially
    if identifier.startswith('$'):
        # For identifiers starting with $, we need to escape the $ and then use word boundary after
        return r'(?<!\w)\$' + re.escape(identifier[1:]) + r'\b'
    elif identifier == '_': # Handle underscore specifically
        return r'(?<!\w)' + re.escape(identifier) + r'(?!\w)' # Lookbehind/ahead for non-word chars
    else:
        # For normal identifiers, use word boundaries on both sides
        return r'\b' + re.escape(identifier) + r'\b'

def create_safe_replacements(replacements):
    """
    Transform replacements into regex patterns with appropriate boundaries.
    Filters out multi-scope variables.
    Sorts by length (longest first) to avoid partial replacements.
    Returns the safe replacements and the list of excluded keys.
    """
    # Sort by length (descending) and then alphabetically for deterministic output
    sorted_keys = sorted(replacements.keys(), key=lambda x: (-len(x), x))
    
    safe_replacements = []
    excluded_keys = []
    for key in sorted_keys:
        if key in MULTI_SCOPE_EXCLUDE_SET:
            excluded_keys.append(key)
            continue # Skip this key
            
        pattern = create_regex_for_identifier(key)
        safe_replacements.append((key, pattern, replacements[key]))
    
    return safe_replacements, excluded_keys

def rename_identifiers(input_path, output_path, safe_replacements):
    """
    Apply all replacements to the input file and write the result to output_path.
    """
    try:
        with open(input_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_path}")
        return 0, False
    except Exception as e:
        print(f"Error reading file {input_path}: {e}")
        return 0, False

    
    replacement_count = 0
    # Apply all replacements
    for original, pattern, replacement in safe_replacements:
        # Count occurrences before replacement
        try:
            occurrences = len(re.findall(pattern, content))
            replacement_count += occurrences
            
            # Make the replacement (new content overwrites old content)
            content = re.sub(pattern, replacement, content)
        except re.error as e:
            print(f"Regex error for pattern '{pattern}' (original: '{original}'): {e}")
            continue # Skip problematic pattern
        except Exception as e:
            print(f"Error during replacement for '{original}' -> '{replacement}': {e}")
            continue
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return replacement_count, True
    except Exception as e:
        print(f"Error writing file {output_path}: {e}")
        return replacement_count, False

def main():
    # Check if input file exists
    if not os.path.exists(CLI_JS_PATH):
        print(f"Error: Input file '{CLI_JS_PATH}' not found in the current directory.")
        print("Please ensure the script is run from the 'claude_code' directory.")
        return 1
    
    # Hardcoded replacement mappings from all analysis phases
    replacements = OrderedDict([
        # API Clients and Auth
        ('P41', 'BedrockClient'),
        ('Y91', 'VertexAIClient'),
        ('N_0', 'AnthropicClient'),
        ('tO', 'createApiClient'),
        ('uY', 'getApiKey'),
        ('q91', 'getApiKeyFromStorage'),
        ('Au', 'getAuthToken'),
        ('b3', 'useBedrockBackend'),
        ('s3', 'useVertexBackend'),
        ('L2', 'KEYCHAIN_SERVICE_NAME'),
        ('f0', 'loadConfig'),
        ('o$', 'configCache'),
        ('qp', 'cachedApiClient'),
        ('OO', 'USER_AGENT'),
        ('PB', 'OAUTH_CONFIG'),
        ('Zm5', 'anthropicOAuthConfig'),
        ('Im5', 'baseOAuthConfig'),
        ('bH', 'execShellCommand'),
        
        # HTTP and Networking
        ('Zn5', 'getAdditionalHeaders'),
        ('In5', 'createHttpAgent'),
        ('$00', 'getRegionForModel'),
        ('bI', 'httpClient'),
        
        # Message Flow
        ('En2', 'formatMessages'),
        ('Gn5', 'formatUserMessage'),
        ('Wn5', 'formatAssistantMessage'),
        ('e61', 'splitSystemPrompt'),
        ('Np', 'generateMetadata'),
        ('Pg2', 'countMessageTokens'),
        ('JZ', 'getCurrentModel'),
        ('CM', 'useCacheControl'),
        ('Vn5', 'createSystemUserMessage'),
        ('Cb', 'getUserId'),
        
        # Tool System - Definitions
        ('P9', 'BashTool'),
        ('HI', 'EditTool'),
        ('iY', 'ViewTool'),
        ('Zw', 'GlobTool'),
        ('aX', 'GrepTool'),
        ('$J', 'LSTool'),
        ('XC', 'WebFetchTool'),
        ('hW', 'BatchTool'),
        ('JI', 'ReadNotebookTool'),
        ('tv', 'AgentTool'),
        ('ZD', 'TodoWriteTool'),
        ('Sb5', 'todoWriteInputSchema'),
        ('sl5', 'primaryTools'),
        
        # Tool System - Management
        ('oU', 'getAllEnabledTools'),
        ('nv1', 'getAgentTools'),
        ('l61', 'getAllCommands'),
        ('Ji5', 'getAvailableTools'),
        ('TU', 'validateCommands'),
        ('d2', 'memoize'),
        ('Jn2', 'discoverCustomCommands'),
        ('Mi5', 'getBuiltinCommands'),
        
        # Tool System - Execution
        ('Ov1', 'preprocessToolInput'),
        ('cc5', 'executeToolCall'),
        ('O61', 'processToolMessage'),
        ('kj2', 'checkBashPermissions'),
        ('Gd1', 'checkPermissionContext'),
        ('Qj2', 'defaultPermissionContext'),
        ('qj2', 'hasUnsupportedOperators'),
        ('z5', 'createToolResult'),
        ('Ii2', 'preprocessEditToolInput'),
        ('Ec5', 'applyCharacterReplacements'),
        ('TO', 'checkToolPermissions'),
        ('$c5', 'characterReplacements'),
        ('ol2', 'getRelativePath'),
        ('gO', 'readFile'),
        ('S61', 'parseFileContent'),
        ('qV', 'getEncoding'),
        ('L61', 'PatchDisplay'),
        ('HM', 'createFilePatch'),
        ('Nc5', 'editToolInputSchema'),
        ('rl2', 'editToolPrompt'),
        
        # Tool System - UI
        ('ri2', 'ToolUseRenderer'),
        ('ni2', 'ToolResultRenderer'),
        ('k61', 'findToolById'),
        ('ci2', 'React'),
        ('el5', 'formatToolInputForDisplay'),
        ('hi2', 'CanceledToolDisplay'),
        ('pi2', 'ErrorToolResultDisplay'),
        ('ii2', 'SuccessToolResultDisplay'),
        ('sU', 'CANCELED_TOOL_MESSAGE'),
        ('Jp', 'PROGRESS_TOOL_MESSAGE'),
        ('bV', 'UNRESOLVED_TOOL_MESSAGE'),
        
        # Command Line Interface
        ('jW1', 'hasCommandFlag'),
        ('RT1', 'CommanderError'),
        ('rr2', 'InvalidArgumentError'),
        ('qT1', 'BaseCommanderError'),
        ('ho1', 'commandFlagExports'),
        ('nw', 'checkFlag'),
        ('Z', 'commander'),
        ('Ks5', 'exports'),
        ('Un', 'colorSupport'),
        ('hZ', 'processEnv'),
        ('Os2', 'homedir'),
        ('vs2', 'trustDialog'),
        ('wG', 'React'),
        
        # UI Components
        ('nr5', 'ReplInterface'),
        ('Cr2', 'MemoizedReplInterface'),
        ('ar5', 'exitProcess'),
        ('Fr2', 'formatPastedText'),
        ('_0', 'applyTermStyle'),
        ('I9', 'getThemeColors'),
        ('zr2', 'useStartupTimer'),
        ('li2', 'ProgressToolDisplay'),
        ('p7', 'React'),
        ('J1', 'require'),
        ('HC', 'React'),
        ('AI', 'React'),
        ('Qr2', 'ink'),
        ('G8', 'React'),
        ('dB', 'React'),
        ('C9', 'Box'),
        ('m61', 'Spinner'),
        ('p', 'Box'),
        ('b', 'Text'),
        ('rv1', 'LINE_COUNT_ADJUSTMENT'),
        ('Fv4', 'React'),
        ('BB', 'ReactCurrentDispatcher'),
        ('F7', 'ReactNoopUpdateQueue'),
        ('Y0', 'InjectedRootElement'),
        
        # Configuration and Environment
        ('fM', 'initializeCommand'),
        ('WN', 'getEnvironmentContext'),
        ('ZB0', 'getConfigValue'),
        ('GB0', 'setConfigValue'),
        ('WB0', 'removeConfigValue'),
        ('BB0', 'listConfigValues'),
        ('l0', 'getWorkingDirectory'),
        
        # Error Handling and Utilities
        ('jt2', 'isErrorObject'),
        ('Qc', 'safeInstanceCheck'),
        ('x1', 'trackEvent'),
        ('l1', 'logError'),
        ('Qp', 'generateUUID'),
        ('iZ', 'AbortedOperationError'),
        
        # System Prompt Generation
        ('nR', 'generateSystemPrompt'),
        ('Zm2', 'getClaudeIdentity'),
        ('Gm2', 'getEnvironmentInfo'),
        ('Ob5', 'DOCS_OVERVIEW_URL'),
        ('vb5', 'DOCS_TUTORIALS_URL'),
        ('xX', 'INTERRUPTED_REQUEST_MESSAGE'),
        ('Q2', 'platformInfo'),
        ('Qv', 'isTodoEnabled'),
        ('NJ', 'isGitRepository'),
        
        # Todo List Management
        ('aj2', 'todoToolPrompt'),
        ('rj2', 'todoToolDescription'),
        ('SJ', 'TodoItemRenderer'),
        ('fb5', 'TODO_TOOL_ID'),
        ('Pb5', 'getTodosDirectory'),
        ('ij2', 'getTodoFilePath'),
        ('n51', 'loadTodos'),
        ('nj2', 'saveTodos'),
        ('Eb5', 'todoItemSchema'),
        ('i51', 'todoListSchema'),
        ('UY', 'sessionId'),
        
        # Common Parameter Names (NOW EXCLUDED from automatic rename)
        # ('I', 'input'), 
        # ('Z', 'options'),
        # ('G', 'context'),
        # ('W', 'config'),
        # ('B', 'state'),
        # ('V', 'result')
    ])
    print(f"Loaded {len(replacements)} hardcoded replacement mappings")
    
    # Create safe replacement patterns, excluding multi-scope variables
    safe_replacements, excluded_keys = create_safe_replacements(replacements)
    
    print(f"Excluding {len(excluded_keys)} multi-scope variables from automatic replacement:")
    print(f"  {excluded_keys}")
    
    # Apply replacements
    print(f"Applying {len(safe_replacements)} safe replacements to {CLI_JS_PATH}...")
    total_replacements, success = rename_identifiers(CLI_JS_PATH, OUTPUT_PATH, safe_replacements)
    
    if success:
        print(f"Renamed identifiers written to {OUTPUT_PATH}")
        print(f"Total replacements made: {total_replacements}")
        
        # Report top replacements
        print("\nTop 10 replacements applied (sorted by original identifier length):")
        count = 0
        for original, _, replacement in safe_replacements:
            if count < 10:
                print(f"  {original} -> {replacement}")
                count += 1
        
        print(f"\nTotal unique identifiers automatically renamed: {len(safe_replacements)}")
        print("\nReminder: Review the output file carefully.")
        print("Manually rename excluded variables or parameters using IDE refactoring if needed.")
        return 0
    else:
        print("\nRenaming process failed. Please check errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())