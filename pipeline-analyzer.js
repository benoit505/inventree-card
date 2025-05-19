// pipeline-analyzer.js
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Directory to start searching from
const rootDir = './src';
// Output file path
const outputFile = 'pipeline-analysis.md';

// Store all function calls
const functionCalls = [];
// Store all function definitions
const functionDefinitions = new Map();
// Store pipeline data
const pipelines = {};

// Process a TypeScript file to extract function definitions and calls
function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  const relativePath = path.relative(rootDir, filePath);
  
  // Collect function definitions
  function collectDefinitions(node) {
    // Function declarations
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      functionDefinitions.set(name, {
        name,
        filePath: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1
      });
    }
    
    // Method declarations in classes
    if (ts.isMethodDeclaration(node) && node.name) {
      const methodName = node.name.getText(sourceFile);
      functionDefinitions.set(methodName, {
        name: methodName,
        filePath: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1
      });
    }
    
    // Arrow functions with variable declarations
    if (ts.isVariableDeclaration(node) && 
        node.name && 
        node.initializer && 
        ts.isArrowFunction(node.initializer)) {
      const name = node.name.getText(sourceFile);
      functionDefinitions.set(name, {
        name,
        filePath: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1
      });
    }
    
    // Continue traversing
    ts.forEachChild(node, collectDefinitions);
  }
  
  // Find function calls within a function
  function findFunctionCalls(node, currentFunction = null) {
    // If we're in a function declaration, update current function
    if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && node.name) {
      const name = node.name.getText(sourceFile);
      currentFunction = name;
    }
    
    // If we're in a variable declaration with an arrow function, update current function
    if (ts.isVariableDeclaration(node) && 
        node.name && 
        node.initializer && 
        ts.isArrowFunction(node.initializer)) {
      currentFunction = node.name.getText(sourceFile);
    }
    
    // Find call expressions
    if (ts.isCallExpression(node) && currentFunction) {
      let calledFunctionName = '';
      
      // Direct calls: functionName()
      if (ts.isIdentifier(node.expression)) {
        calledFunctionName = node.expression.text;
      }
      
      // Property access: object.method()
      if (ts.isPropertyAccessExpression(node.expression)) {
        // We're interested in both local calls and service method calls
        calledFunctionName = node.expression.name.text;
        
        // Also capture the object part for context (e.g., 'this.method' or 'service.method')
        const objectPart = node.expression.expression.getText(sourceFile);
        
        // Only track non-built-in method calls (skip things like array.push)
        const builtInObjects = ['console', 'document', 'window', 'Array', 'Object', 'String', 'Math'];
        if (!builtInObjects.some(obj => objectPart.includes(obj))) {
          // Record the full call for reference
          functionCalls.push({
            caller: currentFunction,
            callee: calledFunctionName,
            fullCall: `${objectPart}.${calledFunctionName}`,
            filePath: relativePath,
            line: sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
          });
        }
      }
      
      // Only track direct function calls that are not built-in functions
      if (calledFunctionName && 
          !['log', 'error', 'warn', 'info', 'debug', 'forEach', 'map', 'filter', 'reduce', 'push', 'pop', 'setTimeout', 'setInterval'].includes(calledFunctionName)) {
        functionCalls.push({
          caller: currentFunction,
          callee: calledFunctionName,
          fullCall: calledFunctionName,
          filePath: relativePath,
          line: sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
        });
      }
    }
    
    // Continue traversing
    ts.forEachChild(node, n => findFunctionCalls(n, currentFunction));
  }
  
  // First pass: collect all function definitions
  collectDefinitions(sourceFile);
  
  // Second pass: find function calls
  findFunctionCalls(sourceFile);
}

// Walk through directories recursively
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      processFile(filePath);
    }
  });
}

// Build pipelines starting from a given function
function buildPipeline(startFunction, depth = 0, visited = new Set(), currentPath = []) {
  // Prevent infinite recursion and limit depth
  if (visited.has(startFunction) || depth > 10) {
    return currentPath;
  }
  
  visited.add(startFunction);
  currentPath.push(startFunction);
  
  // Find all calls made by this function
  const calls = functionCalls.filter(call => call.caller === startFunction);
  
  // Add each callee to the pipeline
  calls.forEach(call => {
    if (!visited.has(call.callee)) {
      buildPipeline(call.callee, depth + 1, visited, [...currentPath]);
    }
  });
  
  return currentPath;
}

// Find important entry points (functions not called by anyone else)
function findEntryPoints() {
  const allCallers = new Set(functionCalls.map(call => call.caller));
  const allCallees = new Set(functionCalls.map(call => call.callee));
  
  // Functions that call others but aren't called themselves
  const entryPoints = [...allCallers].filter(caller => !allCallees.has(caller));
  
  // Also include functions with "handle" in the name as they're often event handlers
  const eventHandlers = [...functionDefinitions.keys()].filter(
    name => (name.startsWith('handle') || name.includes('Handler')) && !entryPoints.includes(name)
  );
  
  return [...entryPoints, ...eventHandlers];
}

// Start the process
walkDir(rootDir);

// Identify potential pipeline entry points
const entryPoints = findEntryPoints();

// Build pipelines from each entry point
entryPoints.forEach(entry => {
  const pipeline = buildPipeline(entry);
  if (pipeline.length > 2) { // Only keep pipelines with at least 3 functions
    pipelines[entry] = pipeline;
  }
});

// Find most complex pipelines (most steps)
const pipelinesByComplexity = Object.entries(pipelines)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 30); // Show top 30 pipelines

// Generate the output
let output = `# Pipeline Analysis\n\n`;

// Overall stats
output += `## Summary\n\n`;
output += `- **Total Function Definitions:** ${functionDefinitions.size}\n`;
output += `- **Total Function Calls:** ${functionCalls.length}\n`;
output += `- **Identified Pipeline Entry Points:** ${entryPoints.length}\n`;
output += `- **Complete Pipelines:** ${Object.keys(pipelines).length}\n\n`;

// Top pipelines by complexity
output += `## Top 30 Pipelines by Number of Steps\n\n`;
output += `| Entry Point | Pipeline Length | Pipeline |\n`;
output += `|-------------|-----------------|----------|\n`;

pipelinesByComplexity.forEach(([entry, pipeline]) => {
  output += `| \`${entry}\` | ${pipeline.length} | ${pipeline.map(f => `\`${f}\``).join(' → ')} |\n`;
});
output += `\n`;

// Pipeline details
output += `## Detailed Pipeline Analysis\n\n`;

pipelinesByComplexity.forEach(([entry, pipeline]) => {
  output += `### Pipeline: \`${entry}\`\n\n`;
  output += `- **Length:** ${pipeline.length} steps\n`;
  
  if (functionDefinitions.has(entry)) {
    const def = functionDefinitions.get(entry);
    output += `- **Defined in:** ${def.filePath}:${def.line}\n`;
  }
  
  output += `\n**Pipeline Steps:**\n\n`;
  
  pipeline.forEach((func, index) => {
    output += `${index + 1}. \`${func}\``;
    
    if (functionDefinitions.has(func)) {
      const def = functionDefinitions.get(func);
      output += ` (${def.filePath}:${def.line})`;
    }
    
    if (index < pipeline.length - 1) {
      // Find the specific call
      const calls = functionCalls.filter(
        call => call.caller === func && call.callee === pipeline[index + 1]
      );
      
      if (calls.length > 0) {
        output += `\n   - Calls \`${pipeline[index + 1]}\` at ${calls[0].filePath}:${calls[0].line}`;
        if (calls[0].fullCall !== calls[0].callee) {
          output += ` as \`${calls[0].fullCall}\``;
        }
      }
    }
    
    output += `\n`;
  });
  
  output += `\n`;
});

// Function call heatmap - which functions call the most other functions
const callerHeatmap = {};
functionCalls.forEach(call => {
  callerHeatmap[call.caller] = (callerHeatmap[call.caller] || 0) + 1;
});

const topCallers = Object.entries(callerHeatmap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

output += `## Top 20 Functions by Number of Outgoing Calls\n\n`;
output += `| Function | Calls Made | Defined In |\n`;
output += `|----------|------------|------------|\n`;

topCallers.forEach(([func, count]) => {
  let location = "Unknown";
  if (functionDefinitions.has(func)) {
    const def = functionDefinitions.get(func);
    location = `${def.filePath}:${def.line}`;
  }
  output += `| \`${func}\` | ${count} | ${location} |\n`;
});
output += `\n`;

// Function call heatmap - which functions are called the most
const calleeHeatmap = {};
functionCalls.forEach(call => {
  calleeHeatmap[call.callee] = (calleeHeatmap[call.callee] || 0) + 1;
});

const topCallees = Object.entries(calleeHeatmap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

output += `## Top 20 Most Called Functions\n\n`;
output += `| Function | Times Called | Defined In |\n`;
output += `|----------|--------------|------------|\n`;

topCallees.forEach(([func, count]) => {
  let location = "Unknown";
  if (functionDefinitions.has(func)) {
    const def = functionDefinitions.get(func);
    location = `${def.filePath}:${def.line}`;
  }
  output += `| \`${func}\` | ${count} | ${location} |\n`;
});
output += `\n`;

// Export the DOT file for Graphviz visualization
let dotOutput = 'digraph Pipelines {\n';
dotOutput += '  rankdir=LR;\n';
dotOutput += '  node [shape=box, style=filled, fillcolor=lightblue];\n\n';

// Add edges for each function call
functionCalls.forEach(call => {
  // Skip some common utility functions to reduce noise
  const skipFunctions = ['log', 'error', 'warn', 'info', 'debug'];
  if (!skipFunctions.includes(call.callee)) {
    dotOutput += `  "${call.caller}" -> "${call.callee}";\n`;
  }
});

dotOutput += '}\n';

// Write to files
fs.writeFileSync(outputFile, output);
fs.writeFileSync('pipeline-graph.dot', dotOutput);

console.log(`Generated pipeline analysis in ${outputFile}`);
console.log(`Created Graphviz DOT file in pipeline-graph.dot - you can visualize this with Graphviz or online tools`);