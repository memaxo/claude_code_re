import json
import os
from collections import Counter
from collections.abc import Mapping, Sequence

# Configuration
INPUT_JSON_PATH = os.path.join('ast_analysis', 'output', 'tool_objects.json')

def analyze_potential_tools(input_path):
    """
    Analyzes objects with a 'name' property and reports their structure.
    """
    potential_tools = []
    property_patterns = Counter()
    name_values = set()

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            all_objects = json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_path}")
        return [], Counter(), set()
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {input_path}")
        return [], Counter(), set()
    except Exception as e:
        print(f"Error reading file {input_path}: {e}")
        return [], Counter(), set()

    if not isinstance(all_objects, list):
        print(f"Error: Expected a list in {input_path}, got {type(all_objects)}")
        return [], Counter(), set()

    for obj in all_objects:
        if not isinstance(obj, dict) or 'properties' not in obj or not isinstance(obj['properties'], list):
            continue

        props_list = obj['properties']
        props_set = set(props_list)

        # Focus only on objects that have a 'name' property
        if 'name' in props_set:
            potential_tools.append(obj)
            # Create a sorted tuple of properties (excluding 'name') for pattern counting
            pattern = tuple(sorted([p for p in props_list if p != 'name']))
            property_patterns[pattern] += 1

            # Extract the name if available and it's a string
            name_value = obj.get('nameValue')
            if isinstance(name_value, str):
                name_values.add(name_value)

    return potential_tools, property_patterns, name_values

def main():
    """
    Main function to run the analysis.
    """
    print(f"Analyzing potential tools from: {INPUT_JSON_PATH}")
    potential_tools, property_patterns, name_values = analyze_potential_tools(INPUT_JSON_PATH)

    if not potential_tools:
        print("No objects found with a 'name' property.")
        return 1

    print(f"\nFound {len(potential_tools)} objects with a 'name' property.")

    print("\nProperty patterns found (excluding 'name', sorted by frequency):")
    # Sort patterns by frequency (most common first)
    for pattern, count in property_patterns.most_common():
        print(f"- Count: {count}, Properties: {pattern}")

    print("\nPotential Tool Names (from 'nameValue' property where available):")
    if name_values:
        # Sort for consistent output
        for name in sorted(list(name_values)):
            print(f"- {name}")
        print(f"\nFound {len(name_values)} unique string literal tool names.")
    else:
        print("(No string literal names found)")

    print("\nSuggestion: Review the common property patterns above to identify likely tool structures.")
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main()) 