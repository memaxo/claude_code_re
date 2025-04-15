#!/usr/bin/env node

/**
 * Scope Analyzer for Claude Code CLI
 * 
 * This script analyzes the scope of variables in the codebase to ensure
 * accurate variable renaming in the rename_identifiers.py script.
 */

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const estraverse = require('estraverse');

// Configuration
const CLI_JS_PATH = path.resolve(__dirname, '../cli.js');
const VARIABLES_MAP_PATH = path.resolve(__dirname, './variables_map.json');

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
 * Analyze variable scopes in the AST
 * @param {Object} ast - The AST object
 * @returns {Object} Scope analysis result
 */
function analyzeVariableScopes(ast) {
  const scopeAnalysis = {
    variables: {},  // name -> [{scope, location, declaration}]
  };
  
  const scopeStack = ['global'];
  let currentScope = 'global';
  
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
        currentScope = scopeStack.join('.');
        
        // Add function parameters to variable declarations in this scope
        for (const param of node.params) {
          if (param.type === 'Identifier') {
            if (!scopeAnalysis.variables[param.name]) {
              scopeAnalysis.variables[param.name] = [];
            }
            
            scopeAnalysis.variables[param.name].push({
              scope: currentScope,
              location: {
                start: {
                  line: param.loc.start.line,
                  column: param.loc.start.column
                },
                end: {
                  line: param.loc.end.line,
                  column: param.loc.end.column
                }
              },
              range: param.range,
              declarationType: 'parameter'
            });
          }
        }
      } else if (node.type === 'BlockStatement') {
        scopeStack.push(`block_${node.loc.start.line}`);
        currentScope = scopeStack.join('.');
      }
      
      // Track variable declarations
      if (node.type === 'VariableDeclarator') {
        if (node.id.type === 'Identifier') {
          const name = node.id.name;
          
          if (!scopeAnalysis.variables[name]) {
            scopeAnalysis.variables[name] = [];
          }
          
          let declarationType = 'var';
          if (node.parent && node.parent.kind) {
            declarationType = node.parent.kind;
          }
          
          scopeAnalysis.variables[name].push({
            scope: currentScope,
            location: {
              start: {
                line: node.id.loc.start.line,
                column: node.id.loc.start.column
              },
              end: {
                line: node.id.loc.end.line,
                column: node.id.loc.end.column
              }
            },
            range: node.id.range,
            declarationType
          });
        }
      }
      
      // Track function declarations
      if (node.type === 'FunctionDeclaration' && node.id) {
        const name = node.id.name;
        
        if (!scopeAnalysis.variables[name]) {
          scopeAnalysis.variables[name] = [];
        }
        
        scopeAnalysis.variables[name].push({
          scope: currentScope,
          location: {
            start: {
              line: node.id.loc.start.line,
              column: node.id.loc.start.column
            },
            end: {
              line: node.id.loc.end.line,
              column: node.id.loc.end.column
            }
          },
          range: node.id.range,
          declarationType: 'function'
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
        currentScope = scopeStack.join('.');
      }
    }
  });
  
  return scopeAnalysis;
}

/**
 * Generate the variable mapping with scope information
 * @param {Object} scopeAnalysis - The scope analysis result
 * @returns {Object} Variable mapping with scope information
 */
function generateVariableMapping(scopeAnalysis) {
  const variableMap = {};
  
  // Get the list of minified variable names (1-3 chars or $+1-2 chars)
  const minifiedVars = Object.keys(scopeAnalysis.variables)
    .filter(name => /^[a-zA-Z][a-zA-Z0-9]{0,2}$|^\$[a-zA-Z0-9]{1,2}$/.test(name));
  
  for (const varName of minifiedVars) {
    const declarations = scopeAnalysis.variables[varName];
    
    variableMap[varName] = {
      occurences: declarations.length,
      scopes: [...new Set(declarations.map(d => d.scope))],
      declarations: declarations,
      isGlobal: declarations.some(d => d.scope === 'global'),
      declarationTypes: [...new Set(declarations.map(d => d.declarationType))]
    };
  }
  
  return variableMap;
}

/**
 * Find single-letter or two-letter variables that appear in multiple scopes
 * @param {Object} variableMap - The variable mapping
 * @returns {Array} List of variables that appear in multiple scopes
 */
function findMultiScopeVariables(variableMap) {
  return Object.entries(variableMap)
    .filter(([name, info]) => 
      /^[a-zA-Z]$|^\$[a-zA-Z0-9]$/.test(name) && 
      info.scopes.length > 1
    )
    .map(([name, info]) => ({
      name,
      scopeCount: info.scopes.length,
      occurrences: info.occurences,
      scopes: info.scopes
    }))
    .sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Create a report of scope analysis findings
 * @param {Object} variableMap - The variable mapping
 * @returns {string} Markdown report
 */
function createScopeReport(variableMap) {
  const multiScopeVars = findMultiScopeVariables(variableMap);
  
  let report = '# Variable Scope Analysis Report\n\n';
  
  report += '## Summary\n\n';
  report += `- Total minified variables analyzed: ${Object.keys(variableMap).length}\n`;
  report += `- Variables appearing in multiple scopes: ${multiScopeVars.length}\n\n`;
  
  report += '## Multi-Scope Variables\n\n';
  report += 'These single-letter or two-letter variables appear in multiple scopes and should be handled carefully during renaming:\n\n';
  report += '| Variable | Scopes | Occurrences |\n';
  report += '|----------|--------|-------------|\n';
  
  for (const varInfo of multiScopeVars.slice(0, 30)) { // Show top 30
    report += `| \`${varInfo.name}\` | ${varInfo.scopeCount} | ${varInfo.occurrences} |\n`;
  }
  
  report += '\n## Global Variables\n\n';
  report += 'These minified variables are declared in the global scope:\n\n';
  report += '| Variable | Occurrences | Declaration Types |\n';
  report += '|----------|-------------|-------------------|\n';
  
  const globalVars = Object.entries(variableMap)
    .filter(([_, info]) => info.isGlobal)
    .sort((a, b) => b[1].occurences - a[1].occurences);
  
  for (const [name, info] of globalVars.slice(0, 50)) { // Show top 50
    report += `| \`${name}\` | ${info.occurences} | ${info.declarationTypes.join(', ')} |\n`;
  }
  
  return report;
}

/**
 * Main function - analyze variable scopes
 */
function main() {
  // Parse the file
  const ast = parseFileToAST(CLI_JS_PATH);
  
  // Analyze variable scopes
  console.log('Analyzing variable scopes...');
  const scopeAnalysis = analyzeVariableScopes(ast);
  console.log(`Analyzed ${Object.keys(scopeAnalysis.variables).length} variables across scopes`);
  
  // Generate variable mapping
  const variableMap = generateVariableMapping(scopeAnalysis);
  console.log(`Generated mapping for ${Object.keys(variableMap).length} minified variables`);
  
  // Save the variable mapping
  fs.writeFileSync(
    VARIABLES_MAP_PATH,
    JSON.stringify(variableMap, null, 2)
  );
  console.log(`Saved variable mapping to ${VARIABLES_MAP_PATH}`);
  
  // Create and save the scope report
  const report = createScopeReport(variableMap);
  fs.writeFileSync(
    path.resolve(__dirname, './scope_report.md'),
    report
  );
  console.log('Created scope analysis report at scope_report.md');
  
  // Find and report potential renaming issues
  const multiScopeVars = findMultiScopeVariables(variableMap);
  console.log(`\nFound ${multiScopeVars.length} variables that appear in multiple scopes.`);
  console.log('Top 10 multi-scope variables:');
  
  for (const varInfo of multiScopeVars.slice(0, 10)) {
    console.log(`- ${varInfo.name}: ${varInfo.occurrences} occurrences across ${varInfo.scopeCount} scopes`);
  }
}

// Run the main function
main();