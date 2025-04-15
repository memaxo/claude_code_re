#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { EditTool, preprocessEditToolInput } = require('./edit_tool');
const { formatValidationError } = require('./schema');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Run a demonstration of the Edit tool
 */
async function runDemo() {
  console.log(`${colors.bold}${colors.cyan}=== Edit Tool Demonstration ===${colors.reset}\n`);
  
  // Create a temp directory for the demo
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  try {
    // Demo 1: Create a new file
    await demoCreateFile(tempDir);
    
    // Demo 2: Update an existing file
    await demoUpdateFile(tempDir);
    
    // Demo 3: Expected replacements
    await demoExpectedReplacements(tempDir);
    
    // Demo 4: Validation failure
    await demoValidationFailure(tempDir);
    
  } catch (error) {
    console.error(`${colors.red}Demonstration failed: ${error.message}${colors.reset}`);
  } finally {
    // Clean up temp directory
    // Comment this out if you want to inspect the files
    // fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * Demonstrate creating a new file
 */
async function demoCreateFile(tempDir) {
  console.log(`${colors.magenta}Demo 1: Creating a new file${colors.reset}`);
  
  const filePath = path.join(tempDir, 'new_file.txt');
  const input = {
    file_path: filePath,
    old_string: "",  // Empty old_string for creation
    new_string: "This is a new file\nCreated by the Edit tool demo\n"
  };
  
  // Preprocess the input (unnecessary for new files but showing the pattern)
  const processedInput = preprocessEditToolInput(input);
  
  // Run validation
  const validationResult = EditTool.inputSchema.safeParse(processedInput);
  if (!validationResult.success) {
    console.error(`${colors.red}${formatValidationError(EditTool.name, validationResult.error)}${colors.reset}`);
    return;
  }
  
  // Check permissions
  const permissionsResult = await EditTool.checkPermissions(processedInput, {});
  if (!permissionsResult.result) {
    console.error(`${colors.red}Permission check failed: ${permissionsResult.message}${colors.reset}`);
    return;
  }
  
  // Execute the tool
  console.log(`${colors.blue}Executing Edit tool to create ${filePath}${colors.reset}`);
  
  try {
    const generator = EditTool.call(processedInput, {});
    let result;
    
    for await (const item of generator) {
      result = item;
    }
    
    if (result.type === 'result') {
      console.log(`${colors.green}File created successfully!${colors.reset}`);
      
      // Format patch for display
      const patchDisplay = result.data.structuredPatch.map(hunk => {
        return hunk.lines.join('\n');
      }).join('\n');
      
      console.log(`${colors.yellow}${patchDisplay}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
  
  console.log();
}

/**
 * Demonstrate updating an existing file
 */
async function demoUpdateFile(tempDir) {
  console.log(`${colors.magenta}Demo 2: Updating an existing file${colors.reset}`);
  
  // Create a file to update
  const filePath = path.join(tempDir, 'existing_file.txt');
  fs.writeFileSync(filePath, "This is line 1\nThis is line 2\nThis is line 3\n");
  
  const input = {
    file_path: filePath,
    old_string: "This is line 2",
    new_string: "This line has been modified"
  };
  
  // Preprocess the input
  const processedInput = preprocessEditToolInput(input);
  
  // Run validation
  const validationResult = EditTool.inputSchema.safeParse(processedInput);
  if (!validationResult.success) {
    console.error(`${colors.red}${formatValidationError(EditTool.name, validationResult.error)}${colors.reset}`);
    return;
  }
  
  // Check permissions
  const permissionsResult = await EditTool.checkPermissions(processedInput, {});
  if (!permissionsResult.result) {
    console.error(`${colors.red}Permission check failed: ${permissionsResult.message}${colors.reset}`);
    return;
  }
  
  // Execute the tool
  console.log(`${colors.blue}Executing Edit tool to update ${filePath}${colors.reset}`);
  
  try {
    const generator = EditTool.call(processedInput, {});
    let result;
    
    for await (const item of generator) {
      result = item;
    }
    
    if (result.type === 'result') {
      console.log(`${colors.green}File updated successfully!${colors.reset}`);
      
      // Format patch for display
      const patchDisplay = result.data.structuredPatch.map(hunk => {
        return hunk.lines.join('\n');
      }).join('\n');
      
      console.log(`${colors.yellow}${patchDisplay}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
  
  console.log();
}

/**
 * Demonstrate expected replacements
 */
async function demoExpectedReplacements(tempDir) {
  console.log(`${colors.magenta}Demo 3: Using expected_replacements${colors.reset}`);
  
  // Create a file with repeating content
  const filePath = path.join(tempDir, 'repeating_content.txt');
  fs.writeFileSync(filePath, "Replace me\nKeep this line\nReplace me\n");
  
  const input = {
    file_path: filePath,
    old_string: "Replace me",
    new_string: "I've been replaced",
    expected_replacements: 2  // There are exactly 2 occurrences
  };
  
  // Preprocess the input
  const processedInput = preprocessEditToolInput(input);
  
  // Run validation
  const validationResult = EditTool.inputSchema.safeParse(processedInput);
  if (!validationResult.success) {
    console.error(`${colors.red}${formatValidationError(EditTool.name, validationResult.error)}${colors.reset}`);
    return;
  }
  
  // Check permissions
  const permissionsResult = await EditTool.checkPermissions(processedInput, {});
  if (!permissionsResult.result) {
    console.error(`${colors.red}Permission check failed: ${permissionsResult.message}${colors.reset}`);
    return;
  }
  
  // Execute the tool
  console.log(`${colors.blue}Executing Edit tool with expected_replacements=${input.expected_replacements}${colors.reset}`);
  
  try {
    const generator = EditTool.call(processedInput, {});
    let result;
    
    for await (const item of generator) {
      result = item;
    }
    
    if (result.type === 'result') {
      console.log(`${colors.green}File updated successfully with ${input.expected_replacements} replacements!${colors.reset}`);
      console.log(`${colors.yellow}${result.data.structuredPatch}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
  
  console.log();
}

/**
 * Demonstrate validation failure
 */
async function demoValidationFailure(tempDir) {
  console.log(`${colors.magenta}Demo 4: Handling validation failures${colors.reset}`);
  
  // Test with wrong expected_replacements
  const filePath = path.join(tempDir, 'repeating_content.txt');
  
  const input = {
    file_path: filePath,
    old_string: "Replace me",
    new_string: "This will fail",
    expected_replacements: 1  // But there are 2 occurrences in the file
  };
  
  // Preprocess the input
  const processedInput = preprocessEditToolInput(input);
  
  // Run validation
  const validationResult = EditTool.inputSchema.safeParse(processedInput);
  if (!validationResult.success) {
    console.error(`${colors.red}${formatValidationError(EditTool.name, validationResult.error)}${colors.reset}`);
    return;
  }
  
  // Check permissions
  const permissionsResult = await EditTool.checkPermissions(processedInput, {});
  if (!permissionsResult.result) {
    console.error(`${colors.red}Permission check failed: ${permissionsResult.message}${colors.reset}`);
    return;
  }
  
  // Execute the tool
  console.log(`${colors.blue}Executing Edit tool with incorrect expected_replacements=${input.expected_replacements}${colors.reset}`);
  
  try {
    const generator = EditTool.call(processedInput, {});
    let result;
    
    for await (const item of generator) {
      result = item;
    }
    
    if (result.type === 'result') {
      console.log(`${colors.green}File updated successfully!${colors.reset}`);
      
      // Format patch for display
      const patchDisplay = result.data.structuredPatch.map(hunk => {
        return hunk.lines.join('\n');
      }).join('\n');
      
      console.log(`${colors.yellow}${patchDisplay}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.yellow}Validation caught the error as expected:${colors.reset}`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

// Run the demo
runDemo();