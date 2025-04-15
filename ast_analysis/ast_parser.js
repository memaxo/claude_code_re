#!/usr/bin/env node

/**
 * AST Parser for Claude Code CLI
 * 
 * This script parses the cli.js file using Acorn and provides utilities for 
 * analyzing the Abstract Syntax Tree (AST) to overcome the limitations of pattern matching.
 */

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const estraverse = require('estraverse');

// Configuration
const CLI_JS_PATH = path.resolve(__dirname, '../cli.js');
const AST_OUTPUT_PATH = path.resolve(__dirname, './ast_output.json');

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
 * Save AST to a JSON file
 * @param {Object} ast - The AST object
 * @param {string} outputPath - Path to save the AST JSON
 */
function saveASTToFile(ast, outputPath) {
  try {
    // The AST is too large to stringify with indentation, so use compact format
    fs.writeFileSync(outputPath, JSON.stringify(ast));
    console.log(`AST saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error saving AST: ${error.message}`);
    console.log('Skipping AST file saving due to size limitations...');
  }
}

/**
 * Collect all identifiers in the AST
 * @param {Object} ast - The AST object
 * @returns {Map<string, Array>} Map of identifier names to locations
 */
function collectIdentifiers(ast) {
  const identifiers = new Map();
  
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      if (node.type === 'Identifier') {
        const name = node.name;
        if (!identifiers.has(name)) {
          identifiers.set(name, []);
        }
        identifiers.get(name).push({
          type: parent.type,
          location: node.loc,
          range: node.range
        });
      }
    }
  });
  
  return identifiers;
}

/**
 * Find function declarations
 * @param {Object} ast - The AST object
 * @returns {Array} Array of function declarations
 */
function findFunctionDeclarations(ast) {
  const functions = [];
  
  estraverse.traverse(ast, {
    enter: function(node) {
      if (
        node.type === 'FunctionDeclaration' || 
        node.type === 'FunctionExpression' || 
        node.type === 'ArrowFunctionExpression'
      ) {
        functions.push({
          type: node.type,
          id: node.id ? node.id.name : 'anonymous',
          params: node.params.map(p => p.type === 'Identifier' ? p.name : 'complexParam'),
          location: node.loc,
          range: node.range
        });
      }
    }
  });
  
  return functions;
}

/**
 * Find object literals that might be tool definitions
 * @param {Object} ast - The AST object
 * @returns {Array} Array of potential tool objects
 */
function findPotentialToolObjects(ast) {
  const toolObjects = [];
  
  estraverse.traverse(ast, {
    enter: function(node) {
      if (node.type === 'ObjectExpression') {
        const properties = node.properties;
        const hasNameProp = properties.some(prop => 
          prop.key && 
          prop.key.type === 'Identifier' && 
          prop.key.name === 'name'
        );
        
        if (hasNameProp) {
          // Extract the name value if possible
          let nameValue = null;
          for (const prop of properties) {
            if (prop.key && prop.key.type === 'Identifier' && prop.key.name === 'name') {
              if (prop.value && prop.value.type === 'Literal') {
                nameValue = prop.value.value;
              }
              break;
            }
          }
          
          // Safely extract property names
          const propertyNames = properties.map(p => {
            if (!p || !p.key) return 'invalidProperty';
            if (p.key.type === 'Identifier') return p.key.name;
            if (p.key.type === 'Literal') return String(p.key.value);
            return 'computedProperty';
          });
          
          toolObjects.push({
            nameValue,
            properties: propertyNames,
            location: node.loc,
            range: node.range
          });
        }
      }
    }
  });
  
  return toolObjects;
}

/**
 * Extract the identifier name from a callee expression
 * @param {Object} callee - The callee node from a CallExpression
 * @returns {string|null} The identifier name or null if not extractable
 */
function getCalleeIdentifier(callee) {
  if (!callee) return null;
  
  if (callee.type === 'Identifier') {
    return callee.name;
  } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
    // For member expressions like obj.method(), return the method name
    return callee.property.name;
  }
  
  return null;
}

/**
 * Find the enclosing function name for a given node
 * @param {Object} node - The AST node
 * @returns {string|null} The function name or null if not in a function
 */
function getEnclosingFunction(node) {
  let current = node;
  
  while (current) {
    if (current.type === 'FunctionDeclaration' || current.type === 'FunctionExpression') {
      return current.id ? current.id.name : 'anonymous';
    } else if (current.type === 'ArrowFunctionExpression') {
      // For arrow functions, try to infer a name from variable assignment
      if (current.parent && current.parent.type === 'VariableDeclarator') {
        return current.parent.id.name;
      }
      return 'arrow_function';
    }
    
    current = current.parent;
  }
  
  return null;
}

/**
 * Build a call graph for functions
 * @param {Object} ast - The AST object
 * @returns {Object} Call graph object
 */
function buildCallGraph(ast) {
  console.log("Building call graph...");
  
  const callGraph = {
    callSites: {},  // callee -> sites where calls occur
    callers: {}     // callee -> functions that call it
  };
  
  estraverse.traverse(ast, {
    enter: function(node, parent) {
      // Add parent pointers for getEnclosingFunction to work
      if (parent) {
        node.parent = parent;
      }
      
      if (node.type === 'CallExpression') {
        let callee = getCalleeIdentifier(node.callee);
        if (callee) {
          // Ensure the entry exists and is an array for callSites
          // Use Object.prototype.hasOwnProperty.call for safety
          if (!Object.prototype.hasOwnProperty.call(callGraph.callSites, callee) || !Array.isArray(callGraph.callSites[callee])) {
            callGraph.callSites[callee] = [];
          }
          // Store only essential, non-circular info
          callGraph.callSites[callee].push({
            type: node.type, 
            location: node.loc,
            range: node.range
            // Avoid storing the whole node or parent to prevent circular refs
          });
          
          // Find the enclosing function
          let enclosingFunction = getEnclosingFunction(node); // Pass node instead of parent
          if (enclosingFunction) {
            // Ensure the entry exists and is an array for callers
            // Use Object.prototype.hasOwnProperty.call for safety
            if (!Object.prototype.hasOwnProperty.call(callGraph.callers, callee) || !Array.isArray(callGraph.callers[callee])) {
              callGraph.callers[callee] = [];
            }
            
            if (!callGraph.callers[callee].includes(enclosingFunction)) {
              callGraph.callers[callee].push(enclosingFunction);
            }
          }
        }
      }
    },
    leave: function(node) {
      // Clean up parent pointers if necessary, though might not be needed if only used during traversal
      // delete node.parent; // <-- REMOVED THIS LINE
    }
  });
  
  return callGraph;
}

/**
 * Analyze variable declarations and scope
 * @param {Object} ast - The AST object
 * @returns {Object} Scope analysis result
 */
function analyzeScope(ast) {
  const scopeAnalysis = {
    variables: {},  // name -> [{scope, location}]
    references: Object.create(null)  // name -> [{location, scope}]
  };
  
  const scopeStack = ['global'];
  
  estraverse.traverse(ast, {
    enter: function(node) {
      // Track entering a new scope
      if (
        node.type === 'FunctionDeclaration' || 
        node.type === 'FunctionExpression' || 
        node.type === 'ArrowFunctionExpression'
      ) {
        const scopeName = node.id ? node.id.name : `anonymous_${node.loc.start.line}`;
        scopeStack.push(scopeName);
        
        // Add function parameters to variable declarations in this scope
        for (const param of node.params) {
          if (param.type === 'Identifier') {
            if (!scopeAnalysis.variables[param.name]) {
              scopeAnalysis.variables[param.name] = [];
            }
            
            scopeAnalysis.variables[param.name].push({
              scope: scopeStack.join('.'),
              location: param.loc,
              isParameter: true
            });
          }
        }
      } else if (node.type === 'BlockStatement') {
        scopeStack.push(`block_${node.loc.start.line}`);
      }
      
      // Track variable declarations
      if (node.type === 'VariableDeclarator') {
        if (node.id.type === 'Identifier') {
          const name = node.id.name;
          
          if (!scopeAnalysis.variables[name]) {
            scopeAnalysis.variables[name] = [];
          }
          
          scopeAnalysis.variables[name].push({
            scope: scopeStack.join('.'),
            location: node.loc,
            kind: node.parent ? node.parent.kind : 'var' // 'var', 'let', or 'const'
          });
        }
      }
      
      // Track variable references
      if (node.type === 'Identifier') {
        // Exclude property names in member expressions
        if (node.parent && 
            node.parent.type === 'MemberExpression' && 
            node.parent.property === node) {
          return;
        }
        
        // Exclude declaration names
        if (node.parent && 
            (node.parent.type === 'VariableDeclarator' && node.parent.id === node) ||
            (node.parent.type === 'FunctionDeclaration' && node.parent.id === node) ||
            (node.parent.type === 'FunctionExpression' && node.parent.id === node)) {
          return;
        }
        
        const name = node.name;
        
        if (!scopeAnalysis.references[name]) {
          scopeAnalysis.references[name] = [];
        }
        
        scopeAnalysis.references[name].push({
          scope: scopeStack.join('.'),
          location: node.loc
        });
      }
    },
    
    leave: function(node) {
      // Track leaving a scope
      if (
        node.type === 'FunctionDeclaration' || 
        node.type === 'FunctionExpression' || 
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'BlockStatement'
      ) {
        scopeStack.pop();
      }
    }
  });
  
  return scopeAnalysis;
}

/**
 * Analyze control flow structures in functions
 * @param {Object} ast - The AST object
 * @returns {Object} Control flow analysis
 */
function analyzeControlFlow(ast) {
  const controlFlow = {};
  
  let currentFunction = null;
  
  estraverse.traverse(ast, {
    enter: function(node) {
      // Track when we enter a function
      if (
        node.type === 'FunctionDeclaration' || 
        node.type === 'FunctionExpression' || 
        node.type === 'ArrowFunctionExpression'
      ) {
        const funcName = node.id ? node.id.name : `anonymous_${node.loc.start.line}`;
        currentFunction = funcName;
        
        if (!controlFlow[currentFunction]) {
          controlFlow[currentFunction] = {
            ifStatements: [],
            switchStatements: [],
            loops: [],
            tryCatch: []
          };
        }
      }
      
      if (!currentFunction) return;
      
      // Record control flow structures
      switch (node.type) {
        case 'IfStatement':
          controlFlow[currentFunction].ifStatements.push({
            location: node.loc,
            hasElse: !!node.alternate
          });
          break;
          
        case 'SwitchStatement':
          controlFlow[currentFunction].switchStatements.push({
            location: node.loc,
            caseCount: node.cases.length
          });
          break;
          
        case 'ForStatement':
        case 'ForInStatement':
        case 'ForOfStatement':
        case 'WhileStatement':
        case 'DoWhileStatement':
          controlFlow[currentFunction].loops.push({
            type: node.type,
            location: node.loc
          });
          break;
          
        case 'TryStatement':
          controlFlow[currentFunction].tryCatch.push({
            location: node.loc,
            hasCatch: !!node.handler,
            hasFinally: !!node.finalizer
          });
          break;
      }
    },
    
    leave: function(node) {
      // Track when we leave a function
      if (
        node.type === 'FunctionDeclaration' || 
        node.type === 'FunctionExpression' || 
        node.type === 'ArrowFunctionExpression'
      ) {
        currentFunction = null;
      }
    }
  });
  
  return controlFlow;
}

/**
 * Main function - parse and analyze the file
 */
function main() {
  // Parse the file
  const ast = parseFileToAST(CLI_JS_PATH);
  
  // Save the AST for reference
  saveASTToFile(ast, AST_OUTPUT_PATH);
  
  // Analyze the AST
  console.log('Collecting identifiers...');
  const identifiers = collectIdentifiers(ast);
  console.log(`Found ${identifiers.size} unique identifiers`);
  
  console.log('Finding function declarations...');
  const functions = findFunctionDeclarations(ast);
  console.log(`Found ${functions.length} functions`);
  
  console.log('Finding potential tool objects...');
  const toolObjects = findPotentialToolObjects(ast);
  console.log(`Found ${toolObjects.length} potential tool objects`);
  
  console.log('Building call graph...');
  const callGraph = buildCallGraph(ast);
  console.log(`Found ${Object.keys(callGraph.callSites).length} unique function calls`);
  
  console.log('Analyzing variable scope...');
  const scopeAnalysis = analyzeScope(ast);
  console.log(`Analyzed ${Object.keys(scopeAnalysis.variables).length} variables across scopes`);
  
  console.log('Analyzing control flow...');
  const controlFlow = analyzeControlFlow(ast);
  console.log(`Analyzed control flow for ${Object.keys(controlFlow).length} functions`);
  
  // Create the output directory if it doesn't exist
  const outputDir = path.resolve(__dirname, './output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Function to safely write potentially large data
  const safeWrite = (filePath, data, filterFn = null, limit = 500) => {
    try {
      let processedData = data;
      
      // Apply filter if provided
      if (filterFn && typeof filterFn === 'function') {
        processedData = filterFn(processedData);
      }
      
      // Apply limit if it's an array
      if (Array.isArray(processedData)) {
        processedData = processedData.slice(0, limit);
      }
      
      fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2));
      console.log(`Successfully wrote ${filePath}`);
    } catch (err) {
      console.error(`Error writing ${filePath}: ${err.message}`);
      
      // Try again with more aggressive filtering
      try {
        let processedData = data;
        
        // Apply filter if provided
        if (filterFn && typeof filterFn === 'function') {
          processedData = filterFn(processedData);
        }
        
        // Apply more aggressive limit
        if (Array.isArray(processedData)) {
          processedData = processedData.slice(0, Math.floor(limit / 2));
        }
        
        // Use compact JSON format
        fs.writeFileSync(filePath, JSON.stringify(processedData));
        console.log(`Successfully wrote ${filePath} with reduced size`);
      } catch (retryErr) {
        console.error(`Failed to write ${filePath} even with reduced size: ${retryErr.message}`);
      }
    }
  };

  // Save identifiers (only minified ones)
  const minifiedIdentifiersFilter = data => 
    Array.from(data.entries())
      .filter(([name]) => /^[a-zA-Z][a-zA-Z0-9]{0,2}$|^\$[a-zA-Z0-9]{1,2}$/.test(name));
  
  safeWrite(
    path.resolve(outputDir, 'identifiers.json'),
    identifiers,
    minifiedIdentifiersFilter,
    1000
  );
  
  // Save functions
  safeWrite(
    path.resolve(outputDir, 'functions.json'),
    functions,
    null,
    500
  );
  
  // Save tool objects
  safeWrite(
    path.resolve(outputDir, 'tool_objects.json'),
    toolObjects
  );
  
  // Save call graph (focus on minified names)
  const minifiedCallSitesFilter = data => ({
    callSites: Object.fromEntries(
      Object.entries(data.callSites)
        .filter(([name]) => /^[a-zA-Z][a-zA-Z0-9]{0,2}$|^\$[a-zA-Z0-9]{1,2}$/.test(name))
        .slice(0, 100)
    ),
    callers: Object.fromEntries(
      Object.entries(data.callers)
        .filter(([name]) => /^[a-zA-Z][a-zA-Z0-9]{0,2}$|^\$[a-zA-Z0-9]{1,2}$/.test(name))
        .slice(0, 100)
    )
  });
  
  safeWrite(
    path.resolve(outputDir, 'call_graph.json'),
    callGraph,
    minifiedCallSitesFilter
  );
  
  // Save scope analysis (focus on minified names)
  const minifiedScopeFilter = data => ({
    variables: Object.fromEntries(
      Object.entries(data.variables)
        .filter(([name]) => /^[a-zA-Z][a-zA-Z0-9]{0,2}$|^\$[a-zA-Z0-9]{1,2}$/.test(name))
        .slice(0, 100)
    ),
    references: Object.fromEntries(
      Object.entries(data.references)
        .filter(([name]) => /^[a-zA-Z][a-zA-Z0-9]{0,2}$|^\$[a-zA-Z0-9]{1,2}$/.test(name))
        .slice(0, 100)
    )
  });
  
  safeWrite(
    path.resolve(outputDir, 'scope_analysis.json'),
    scopeAnalysis,
    minifiedScopeFilter
  );
  
  // Save control flow (focus on minified names)
  const minifiedControlFlowFilter = data => 
    Object.fromEntries(
      Object.entries(data)
        .filter(([name]) => /^[a-zA-Z][a-zA-Z0-9]{0,2}$|^\$[a-zA-Z0-9]{1,2}$/.test(name))
        .slice(0, 100)
    );
  
  safeWrite(
    path.resolve(outputDir, 'control_flow.json'),
    controlFlow,
    minifiedControlFlowFilter
  );
  
  console.log('Analysis complete. Results saved to JSON files in the ast_analysis directory.');
}

// Run the main function
main();