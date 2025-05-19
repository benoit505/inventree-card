// function-catalog.js
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Directory to start searching from
const rootDir = './src';
// Output file path
const outputFile = 'function-catalog.md';

// Store all found functions
const functions = [];

// Process a TypeScript file
function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Function to recursively visit each node in the AST
  function visit(node) {
    // Function declarations
    if (ts.isFunctionDeclaration(node) && node.name) {
      functions.push({
        name: node.name.text,
        filePath: path.relative(rootDir, filePath),
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1
      });
    }
    
    // Method declarations in classes
    if (ts.isMethodDeclaration(node) && node.name) {
      const methodName = node.name.getText(sourceFile);
      functions.push({
        name: methodName,
        filePath: path.relative(rootDir, filePath),
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1
      });
    }
    
    // Arrow functions with variable declarations
    if (ts.isVariableDeclaration(node) && 
        node.name && 
        node.initializer && 
        ts.isArrowFunction(node.initializer)) {
      functions.push({
        name: node.name.getText(sourceFile),
        filePath: path.relative(rootDir, filePath),
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1
      });
    }
    
    // Continue traversing
    ts.forEachChild(node, visit);
  }
  
  // Start the traversal
  visit(sourceFile);
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

// Start the process
walkDir(rootDir);

// Sort functions alphabetically
functions.sort((a, b) => a.name.localeCompare(b.name));

// Generate the output
let output = `# Function Catalog\n\nTotal functions: ${functions.length}\n\n`;
output += `| Function Name | File Path | Line |\n`;
output += `|--------------|-----------|------|\n`;

functions.forEach(func => {
  output += `| \`${func.name}\` | ${func.filePath} | ${func.line} |\n`;
});

// Write to file
fs.writeFileSync(outputFile, output);
console.log(`Generated catalog with ${functions.length} functions in ${outputFile}`);