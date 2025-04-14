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
OUTPUT_PATH = "cli_renamed.js"

def create_regex_for_identifier(identifier):
    """
    Creates a regex pattern that matches the identifier with appropriate boundaries.
    Handles special characters like $, _, etc. properly.
    """
    # If the identifier starts with a special character like $, handle it specially
    if identifier.startswith('$'):
        # For identifiers starting with $, we need to escape the $ and then use word boundary after
        return r'(?<!\w)\$' + re.escape(identifier[1:]) + r'\b'
    else:
        # For normal identifiers, use word boundaries on both sides
        return r'\b' + re.escape(identifier) + r'\b'

def create_safe_replacements(replacements):
    """
    Transform replacements into regex patterns with appropriate boundaries.
    Sort by length (longest first) to avoid partial replacements.
    """
    # Sort by length (descending) and then alphabetically for deterministic output
    sorted_keys = sorted(replacements.keys(), key=lambda x: (-len(x), x))
    
    safe_replacements = []
    for key in sorted_keys:
        pattern = create_regex_for_identifier(key)
        safe_replacements.append((key, pattern, replacements[key]))
    
    return safe_replacements

def rename_identifiers(input_path, output_path, safe_replacements):
    """
    Apply all replacements to the input file and write the result to output_path.
    """
    with open(input_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    replacement_count = 0
    # Apply all replacements
    for original, pattern, replacement in safe_replacements:
        # Count occurrences before replacement
        occurrences = len(re.findall(pattern, content))
        replacement_count += occurrences
        
        # Make the replacement (new content overwrites old content)
        content = re.sub(pattern, replacement, content)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return replacement_count

def main():
    # Check if input file exists
    if not os.path.exists(CLI_JS_PATH):
        print(f"Error: {CLI_JS_PATH} not found")
        return 1
    
    # Hardcoded replacement mappings extracted from REPLACE.md
    replacements = OrderedDict([
        ('P41', 'BedrockClient'),
        ('Y91', 'VertexAIClient'),
        ('q91', 'getApiKeyFromStorage'),
        ('L2', 'KEYCHAIN_SERVICE_NAME'),
        ('bH', 'execShellCommand'),
        ('Zm5', 'anthropicOAuthConfig'),
        ('Im5', 'baseOAuthConfig'),
        ('Ov1', 'preprocessToolInput'),
        ('cc5', 'executeToolCall'),
        ('O61', 'processToolMessage'),
        ('Zn5', 'getAdditionalHeaders'),
        ('In5', 'createHttpAgent'),
        ('$00', 'getRegionForModel'),
        ('jW1', 'hasCommandFlag'),
        ('RT1', 'CommanderError'),
        ('rr2', 'InvalidArgumentError'),
        ('qT1', 'BaseCommanderError'),
        ('ri2', 'ToolUseRenderer'),
        ('ni2', 'ToolResultRenderer'),
        ('k61', 'findToolById'),
        ('nr5', 'ReplInterface'),
        ('Cr2', 'MemoizedReplInterface'),
        ('ar5', 'exitProcess'),
        ('Fr2', 'formatPastedText'),
        ('fM', 'initializeCommand'),
        ('WN', 'getEnvironmentContext'),
        ('ZB0', 'getConfigValue'),
        ('GB0', 'setConfigValue'),
        ('WB0', 'removeConfigValue'),
        ('BB0', 'listConfigValues'),
        ('En2', 'formatMessages'),
        ('Np', 'generateMetadata'),
        ('jt2', 'isErrorObject'),
        ('Qc', 'safeInstanceCheck'),
        ('tO', 'createApiClient'),
        ('N_0', 'AnthropicClient'),
        ('b3', 'useBedrockBackend'),
        ('s3', 'useVertexBackend'),
        ('uY', 'getApiKey'),
        ('f0', 'loadConfig'),
        ('Au', 'getAuthToken'),
        ('o$', 'configCache'),
        ('qp', 'cachedApiClient'),
        ('OO', 'USER_AGENT'),
        ('PB', 'OAUTH_CONFIG'),
        ('P9', 'BashTool'),
        ('HI', 'EditTool'),
        ('iY', 'ViewTool'),
        ('Zw', 'GlobTool'),
        ('aX', 'GrepTool'),
        ('$J', 'LSTool'),
        ('XC', 'WebFetchTool'),
        ('hW', 'BatchTool'),
        ('sl5', 'primaryTools'),
        ('Ji5', 'getAvailableTools'),
        ('TU', 'validateCommands'),
        ('z5', 'createToolResult'),
        ('x1', 'trackEvent'),
        ('bI', 'httpClient'),
        ('_0', 'applyTermStyle'),
        ('I9', 'getThemeColors'),
        ('l1', 'logError'),
        ('I', 'input'), # Note: Parameters might need context-specific renaming later
        ('Z', 'options'),
        ('G', 'context'),
        ('W', 'config'),
        ('B', 'state'),
        ('V', 'result')
    ])
    print(f"Using {len(replacements)} hardcoded replacement mappings")
    
    # Create safe replacement patterns
    safe_replacements = create_safe_replacements(replacements)
    
    # Apply replacements
    print(f"Applying replacements to {CLI_JS_PATH}...")
    total_replacements = rename_identifiers(CLI_JS_PATH, OUTPUT_PATH, safe_replacements)
    print(f"Renamed identifiers written to {OUTPUT_PATH}")
    print(f"Total replacements made: {total_replacements}")
    
    # Report top replacements
    print("\nTop 10 replacements (sorted by original identifier length):")
    count = 0
    for original, _, replacement in safe_replacements:
        if count < 10:
            print(f"  {original} -> {replacement}")
            count += 1
    
    print(f"\nTotal unique identifiers renamed: {len(safe_replacements)}")
    return 0

if __name__ == "__main__":
    sys.exit(main())