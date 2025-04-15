#!/usr/bin/env node

/**
 * Control Flow Analyzer for Claude Code CLI
 * 
 * This script analyzes the control flow of key functions in the codebase to
 * understand decision points, branches, and execution paths.
 */

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const estraverse = require('estraverse');

// Configuration
const CLI_JS_PATH = path.resolve(__dirname, '../cli.js');
const ANALYZED_FUNCTIONS = [
  'cc5',     // executeToolCall
  'O61',     // processToolMessage
  'tO',      // createApiClient
  'uY',      // getApiKey
  'n9',      // Main REPL handler
  'fM',      // Command initialization
  'nv1',     // Get agent tools
  'oU',      // Get all enabled tools
  'kj2',     // Check bash permissions
  'Ii2',     // Preprocess edit tool input
  'Gd1'      // Check permission context
];

/**
 * Parse JavaScript file to AST
 * @param {string} filePath - Path to the JavaScript file
 * @returns {Object} The AST object
 */
function parseFileToAST(filePath) {
  try {
    // Read file content
    let fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`Parsing ${filePath}...`);
    
    // Handle shebang line if present
    if (fileContent.startsWith('#!')) {
      console.log('Removing shebang line...');
      fileContent = fileContent.replace(/^#!.*\n/, '');
    }
    
    // First try with module mode
    try {
      const ast = acorn.parse(fileContent, {
        ecmaVersion: 2022,
        sourceType: 'module',
        locations: true,
        ranges: true
      });
      
      console.log('Parsing complete with module mode.');
      return ast;
    } catch (moduleError) {
      console.log('Module mode parsing failed, trying script mode...');
      // If module mode fails, try script mode with more lenient options
      const ast = acorn.parse(fileContent, {
        ecmaVersion: 2022,
        sourceType: 'script',
        locations: true,
        ranges: true,
        allowAwaitOutsideFunction: true,
        allowImportExportEverywhere: true
      });
      
      console.log('Parsing complete with script mode.');
      return ast;
    }
  } catch (error) {
    console.error(`Error parsing file: ${error.message}`);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

/**
 * Find the AST node for a specific function
 * @param {Object} ast - The AST object
 * @param {string} functionName - The name of the function to find
 * @returns {Object|null} The function node or null if not found
 */
function findFunctionNode(ast, functionName) {
  let foundNode = null;
  
  estraverse.traverse(ast, {
    enter: function(node) {
      // Function declarations (named functions)
      if (
        node.type === 'FunctionDeclaration' && 
        node.id && 
        node.id.name === functionName
      ) {
        foundNode = node;
        this.break();
        return;
      }
      
      // Variable declarations with function expressions
      if (
        node.type === 'VariableDeclarator' && 
        node.id && 
        node.id.name === functionName && 
        node.init && 
        (node.init.type === 'FunctionExpression' || 
         node.init.type === 'ArrowFunctionExpression')
      ) {
        foundNode = node.init;
        this.break();
        return;
      }
      
      // Function expressions assigned to object properties
      if (
        node.type === 'Property' && 
        node.key && 
        node.key.name === functionName && 
        node.value && 
        (node.value.type === 'FunctionExpression' || 
         node.value.type === 'ArrowFunctionExpression')
      ) {
        foundNode = node.value;
        this.break();
        return;
      }
    }
  });
  
  return foundNode;
}

/**
 * Extract function parameters
 * @param {Object} functionNode - The function AST node
 * @returns {Array} Array of parameter names
 */
function extractFunctionParameters(functionNode) {
  if (!functionNode || !functionNode.params) {
    return [];
  }
  
  return functionNode.params.map(param => {
    if (param.type === 'Identifier') {
      return param.name;
    } else if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier') {
      return `${param.left.name} = defaultValue`;
    } else if (param.type === 'ObjectPattern') {
      return '{' + param.properties.map(prop => {
        if (prop.key.type === 'Identifier') {
          return prop.key.name;
        }
        return '...';
      }).join(', ') + '}';
    } else if (param.type === 'ArrayPattern') {
      return '[...]';
    } else if (param.type === 'RestElement') {
      return '...rest';
    }
    return 'complexParam';
  });
}

/**
 * Analyze control flow in a function body
 * @param {Object} functionNode - The function AST node
 * @returns {Object} Control flow analysis
 */
function analyzeControlFlow(functionNode) {
  if (!functionNode || !functionNode.body) {
    return null;
  }
  
  const analysis = {
    branches: {
      if: [],
      switch: [],
      ternary: []
    },
    loops: {
      for: [],
      while: [],
      doWhile: [],
      forIn: [],
      forOf: []
    },
    errorHandling: {
      try: []
    },
    returns: [],
    yields: [],
    awaits: [],
    functionCalls: {}
  };
  
  estraverse.traverse(functionNode.body, {
    enter: function(node) {
      // Track branches
      if (node.type === 'IfStatement') {
        analysis.branches.if.push({
          line: node.loc.start.line,
          hasElse: !!node.alternate,
          test: extractConditionText(node.test),
          consequentStart: node.consequent.loc.start.line,
          consequentEnd: node.consequent.loc.end.line,
          alternateStart: node.alternate ? node.alternate.loc.start.line : null,
          alternateEnd: node.alternate ? node.alternate.loc.end.line : null
        });
      } else if (node.type === 'SwitchStatement') {
        analysis.branches.switch.push({
          line: node.loc.start.line,
          discriminant: extractConditionText(node.discriminant),
          cases: node.cases.map(c => ({
            test: c.test ? extractConditionText(c.test) : 'default',
            consequentStart: c.consequent.length > 0 ? c.consequent[0].loc.start.line : c.loc.start.line,
            consequentEnd: c.consequent.length > 0 ? c.consequent[c.consequent.length - 1].loc.end.line : c.loc.end.line
          }))
        });
      } else if (node.type === 'ConditionalExpression') {
        analysis.branches.ternary.push({
          line: node.loc.start.line,
          test: extractConditionText(node.test)
        });
      }
      
      // Track loops
      if (node.type === 'ForStatement') {
        analysis.loops.for.push({
          line: node.loc.start.line,
          init: node.init ? extractConditionText(node.init) : null,
          test: node.test ? extractConditionText(node.test) : null,
          update: node.update ? extractConditionText(node.update) : null
        });
      } else if (node.type === 'WhileStatement') {
        analysis.loops.while.push({
          line: node.loc.start.line,
          test: extractConditionText(node.test)
        });
      } else if (node.type === 'DoWhileStatement') {
        analysis.loops.doWhile.push({
          line: node.loc.start.line,
          test: extractConditionText(node.test)
        });
      } else if (node.type === 'ForInStatement') {
        analysis.loops.forIn.push({
          line: node.loc.start.line,
          left: node.left.type === 'VariableDeclaration' 
            ? node.left.declarations[0].id.name 
            : extractConditionText(node.left),
          right: extractConditionText(node.right)
        });
      } else if (node.type === 'ForOfStatement') {
        analysis.loops.forOf.push({
          line: node.loc.start.line,
          left: node.left.type === 'VariableDeclaration' 
            ? node.left.declarations[0].id.name 
            : extractConditionText(node.left),
          right: extractConditionText(node.right),
          await: node.await || false
        });
      }
      
      // Track error handling
      if (node.type === 'TryStatement') {
        analysis.errorHandling.try.push({
          line: node.loc.start.line,
          blockStart: node.block.loc.start.line,
          blockEnd: node.block.loc.end.line,
          hasCatch: !!node.handler,
          catchStart: node.handler ? node.handler.loc.start.line : null,
          catchEnd: node.handler ? node.handler.loc.end.line : null,
          catchParam: node.handler && node.handler.param ? node.handler.param.name : null,
          hasFinally: !!node.finalizer,
          finallyStart: node.finalizer ? node.finalizer.loc.start.line : null,
          finallyEnd: node.finalizer ? node.finalizer.loc.end.line : null
        });
      }
      
      // Track returns
      if (node.type === 'ReturnStatement') {
        analysis.returns.push({
          line: node.loc.start.line,
          hasArgument: !!node.argument,
          argumentType: node.argument ? node.argument.type : null
        });
      }
      
      // Track yields
      if (node.type === 'YieldExpression') {
        analysis.yields.push({
          line: node.loc.start.line,
          delegate: node.delegate || false,
          hasArgument: !!node.argument,
          argumentType: node.argument ? node.argument.type : null
        });
      }
      
      // Track awaits
      if (node.type === 'AwaitExpression') {
        analysis.awaits.push({
          line: node.loc.start.line,
          argumentType: node.argument ? node.argument.type : null
        });
      }
      
      // Track function calls
      if (node.type === 'CallExpression') {
        let calleeName = 'unknown';
        
        if (node.callee.type === 'Identifier') {
          calleeName = node.callee.name;
        } else if (
          node.callee.type === 'MemberExpression' && 
          node.callee.property.type === 'Identifier'
        ) {
          if (node.callee.object.type === 'Identifier') {
            calleeName = `${node.callee.object.name}.${node.callee.property.name}`;
          } else {
            calleeName = `[expr].${node.callee.property.name}`;
          }
        }
        
        if (!analysis.functionCalls[calleeName]) {
          analysis.functionCalls[calleeName] = [];
        }
        
        analysis.functionCalls[calleeName].push({
          line: node.loc.start.line,
          argumentCount: node.arguments.length
        });
      }
    }
  });
  
  // Sort results by line number for better readability
  analysis.branches.if.sort((a, b) => a.line - b.line);
  analysis.branches.switch.sort((a, b) => a.line - b.line);
  analysis.branches.ternary.sort((a, b) => a.line - b.line);
  analysis.loops.for.sort((a, b) => a.line - b.line);
  analysis.loops.while.sort((a, b) => a.line - b.line);
  analysis.loops.doWhile.sort((a, b) => a.line - b.line);
  analysis.loops.forIn.sort((a, b) => a.line - b.line);
  analysis.loops.forOf.sort((a, b) => a.line - b.line);
  analysis.errorHandling.try.sort((a, b) => a.line - b.line);
  analysis.returns.sort((a, b) => a.line - b.line);
  analysis.yields.sort((a, b) => a.line - b.line);
  analysis.awaits.sort((a, b) => a.line - b.line);
  
  return analysis;
}

/**
 * Extract a simplified text representation of a condition
 * @param {Object} node - The AST node representing a condition
 * @returns {string} A simplified text representation
 */
function extractConditionText(node) {
  if (!node) return '';
  
  switch (node.type) {
    case 'Identifier':
      return node.name;
      
    case 'Literal':
      return typeof node.value === 'string' 
        ? `"${node.value}"` 
        : String(node.value);
      
    case 'BinaryExpression':
      return `${extractConditionText(node.left)} ${node.operator} ${extractConditionText(node.right)}`;
      
    case 'LogicalExpression':
      return `${extractConditionText(node.left)} ${node.operator} ${extractConditionText(node.right)}`;
      
    case 'UnaryExpression':
      return `${node.operator}${extractConditionText(node.argument)}`;
      
    case 'MemberExpression':
      if (node.property.type === 'Identifier') {
        return `${extractConditionText(node.object)}.${node.property.name}`;
      }
      return `${extractConditionText(node.object)}[${extractConditionText(node.property)}]`;
      
    case 'CallExpression':
      if (node.callee.type === 'Identifier') {
        return `${node.callee.name}(...)`;
      } else if (
        node.callee.type === 'MemberExpression' && 
        node.callee.property.type === 'Identifier'
      ) {
        return `${extractConditionText(node.callee.object)}.${node.callee.property.name}(...)`;
      }
      return 'func(...)';
      
    case 'ObjectExpression':
      return '{...}';
      
    case 'ArrayExpression':
      return '[...]';
      
    case 'ConditionalExpression':
      return `${extractConditionText(node.test)} ? ${extractConditionText(node.consequent)} : ${extractConditionText(node.alternate)}`;
      
    case 'VariableDeclaration':
      return `${node.kind} ${node.declarations.map(d => d.id.name).join(', ')}`;
      
    default:
      return node.type;
  }
}

/**
 * Create a Markdown report from the control flow analysis
 * @param {string} functionName - The name of the function
 * @param {Array} parameters - The function parameters
 * @param {Object} analysis - The control flow analysis
 * @returns {string} Markdown report
 */
function createControlFlowReport(functionName, parameters, analysis) {
  let report = `# Control Flow Analysis: ${functionName}\n\n`;
  
  // Function signature
  report += '## Function Signature\n\n';
  report += '```javascript\n';
  report += `function ${functionName}(${parameters.join(', ')}) { ... }\n`;
  report += '```\n\n';
  
  // Summary 
  report += '## Control Flow Summary\n\n';
  report += '| Category | Count | Details |\n';
  report += '|----------|-------|--------|\n';
  report += `| If Statements | ${analysis.branches.if.length} | ${analysis.branches.if.length > 0 ? `Lines: ${analysis.branches.if.map(i => i.line).join(', ')}` : 'None'} |\n`;
  report += `| Switch Statements | ${analysis.branches.switch.length} | ${analysis.branches.switch.length > 0 ? `Lines: ${analysis.branches.switch.map(s => s.line).join(', ')}` : 'None'} |\n`;
  report += `| Loops | ${analysis.loops.for.length + analysis.loops.while.length + analysis.loops.doWhile.length + analysis.loops.forIn.length + analysis.loops.forOf.length} | For: ${analysis.loops.for.length}, While: ${analysis.loops.while.length}, DoWhile: ${analysis.loops.doWhile.length}, ForIn: ${analysis.loops.forIn.length}, ForOf: ${analysis.loops.forOf.length} |\n`;
  report += `| Try/Catch Blocks | ${analysis.errorHandling.try.length} | ${analysis.errorHandling.try.length > 0 ? `Lines: ${analysis.errorHandling.try.map(t => t.line).join(', ')}` : 'None'} |\n`;
  report += `| Return Statements | ${analysis.returns.length} | ${analysis.returns.length > 0 ? `Lines: ${analysis.returns.map(r => r.line).join(', ')}` : 'None'} |\n`;
  report += `| Yield Expressions | ${analysis.yields.length} | ${analysis.yields.length > 0 ? `Lines: ${analysis.yields.map(y => y.line).join(', ')}` : 'None'} |\n`;
  report += `| Await Expressions | ${analysis.awaits.length} | ${analysis.awaits.length > 0 ? `Lines: ${analysis.awaits.map(a => a.line).join(', ')}` : 'None'} |\n`;
  report += `| Function Calls | ${Object.keys(analysis.functionCalls).length} | Total calls: ${Object.values(analysis.functionCalls).flat().length} |\n`;
  
  // Branches
  if (analysis.branches.if.length > 0) {
    report += '\n## If Statement Branches\n\n';
    report += '| Line | Condition | Has Else | Consequent Lines | Alternate Lines |\n';
    report += '|------|-----------|----------|-----------------|----------------|\n';
    
    for (const ifStmt of analysis.branches.if) {
      report += `| ${ifStmt.line} | \`${ifStmt.test}\` | ${ifStmt.hasElse ? 'Yes' : 'No'} | ${ifStmt.consequentStart}-${ifStmt.consequentEnd} | ${ifStmt.hasElse ? `${ifStmt.alternateStart}-${ifStmt.alternateEnd}` : 'N/A'} |\n`;
    }
  }
  
  // Switch statements
  if (analysis.branches.switch.length > 0) {
    report += '\n## Switch Statements\n\n';
    
    for (let i = 0; i < analysis.branches.switch.length; i++) {
      const switchStmt = analysis.branches.switch[i];
      report += `### Switch at line ${switchStmt.line}\n\n`;
      report += `Discriminant: \`${switchStmt.discriminant}\`\n\n`;
      report += '| Case | Lines |\n';
      report += '|------|-------|\n';
      
      for (const caseClause of switchStmt.cases) {
        report += `| \`${caseClause.test}\` | ${caseClause.consequentStart}-${caseClause.consequentEnd} |\n`;
      }
      
      if (i < analysis.branches.switch.length - 1) {
        report += '\n';
      }
    }
  }
  
  // Loops
  const totalLoops = analysis.loops.for.length + 
                     analysis.loops.while.length + 
                     analysis.loops.doWhile.length + 
                     analysis.loops.forIn.length + 
                     analysis.loops.forOf.length;
  
  if (totalLoops > 0) {
    report += '\n## Loops\n\n';
    
    if (analysis.loops.for.length > 0) {
      report += '### For Loops\n\n';
      report += '| Line | Init | Test | Update |\n';
      report += '|------|------|------|--------|\n';
      
      for (const forLoop of analysis.loops.for) {
        report += `| ${forLoop.line} | \`${forLoop.init || ''}\` | \`${forLoop.test || ''}\` | \`${forLoop.update || ''}\` |\n`;
      }
      
      report += '\n';
    }
    
    if (analysis.loops.while.length > 0) {
      report += '### While Loops\n\n';
      report += '| Line | Condition |\n';
      report += '|------|----------|\n';
      
      for (const whileLoop of analysis.loops.while) {
        report += `| ${whileLoop.line} | \`${whileLoop.test}\` |\n`;
      }
      
      report += '\n';
    }
    
    if (analysis.loops.forOf.length > 0) {
      report += '### For...Of Loops\n\n';
      report += '| Line | Left | Right | Await |\n';
      report += '|------|------|-------|-------|\n';
      
      for (const forOfLoop of analysis.loops.forOf) {
        report += `| ${forOfLoop.line} | \`${forOfLoop.left}\` | \`${forOfLoop.right}\` | ${forOfLoop.await ? 'Yes' : 'No'} |\n`;
      }
    }
  }
  
  // Try/Catch
  if (analysis.errorHandling.try.length > 0) {
    report += '\n## Error Handling\n\n';
    report += '| Line | Try Block | Catch Parameter | Has Finally |\n';
    report += '|------|----------|-----------------|-------------|\n';
    
    for (const tryStmt of analysis.errorHandling.try) {
      report += `| ${tryStmt.line} | ${tryStmt.blockStart}-${tryStmt.blockEnd} | ${tryStmt.hasCatch ? `\`${tryStmt.catchParam || 'unnamed'}\` (${tryStmt.catchStart}-${tryStmt.catchEnd})` : 'No catch'} | ${tryStmt.hasFinally ? `Yes (${tryStmt.finallyStart}-${tryStmt.finallyEnd})` : 'No'} |\n`;
    }
  }
  
  // Function calls
  if (Object.keys(analysis.functionCalls).length > 0) {
    report += '\n## Function Calls\n\n';
    report += '| Function | Call Count | Lines |\n';
    report += '|----------|------------|-------|\n';
    
    // Sort by call count (descending)
    const sortedCalls = Object.entries(analysis.functionCalls)
      .sort((a, b) => b[1].length - a[1].length);
    
    for (const [funcName, calls] of sortedCalls) {
      const lines = calls.map(c => c.line).sort((a, b) => a - b);
      report += `| \`${funcName}\` | ${calls.length} | ${lines.join(', ')} |\n`;
    }
  }
  
  return report;
}

/**
 * Main function - analyze control flow of key functions
 */
function main() {
  // Parse the file
  const ast = parseFileToAST(CLI_JS_PATH);
  
  console.log(`Analyzing control flow for ${ANALYZED_FUNCTIONS.length} key functions...`);
  
  for (const functionName of ANALYZED_FUNCTIONS) {
    console.log(`\nAnalyzing ${functionName}...`);
    
    // Find the function node
    const functionNode = findFunctionNode(ast, functionName);
    
    if (!functionNode) {
      console.log(`  Function ${functionName} not found`);
      continue;
    }
    
    // Extract function parameters
    const parameters = extractFunctionParameters(functionNode);
    console.log(`  Parameters: ${parameters.join(', ')}`);
    
    // Analyze control flow
    const analysis = analyzeControlFlow(functionNode);
    
    if (!analysis) {
      console.log(`  Failed to analyze control flow for ${functionName}`);
      continue;
    }
    
    console.log('  Analysis complete:');
    console.log(`  - If statements: ${analysis.branches.if.length}`);
    console.log(`  - Switch statements: ${analysis.branches.switch.length}`);
    console.log(`  - Loops: ${analysis.loops.for.length + analysis.loops.while.length + analysis.loops.doWhile.length + analysis.loops.forIn.length + analysis.loops.forOf.length}`);
    console.log(`  - Try/catch blocks: ${analysis.errorHandling.try.length}`);
    console.log(`  - Return statements: ${analysis.returns.length}`);
    console.log(`  - Yield expressions: ${analysis.yields.length}`);
    console.log(`  - Await expressions: ${analysis.awaits.length}`);
    console.log(`  - Function calls: ${Object.keys(analysis.functionCalls).length} unique functions (${Object.values(analysis.functionCalls).flat().length} total calls)`);
    
    // Create and save the control flow report
    const report = createControlFlowReport(functionName, parameters, analysis);
    const reportPath = path.resolve(__dirname, `./flow_reports/${functionName}_flow.md`);
    
    // Make sure the directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, report);
    console.log(`  Report saved to ${reportPath}`);
    
    // Save the raw analysis as JSON
    const analysisPath = path.resolve(__dirname, `./flow_reports/${functionName}_analysis.json`);
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  }
  
  console.log('\nAnalysis complete.');
}

// Run the main function
main();