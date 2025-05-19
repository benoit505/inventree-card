// enhanced-codebase-analyzer.js
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Directory to start searching from
const rootDir = './src';
// Output file path
const outputFile = 'codebase-analysis.md';

// Store all found functions
const functions = [];
// Track file statistics
const fileStats = {};
// Track overall stats
const stats = {
  totalFiles: 0,
  totalFunctions: 0,
  totalLines: 0,
  privateMethodCount: 0,
  publicMethodCount: 0,
  byFileType: {},
  byDirectory: {}
};

// Process a TypeScript file
function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  const lineCount = fileContent.split('\n').length;
  const relativePath = path.relative(rootDir, filePath);
  const directory = path.dirname(relativePath);
  const fileType = path.extname(filePath);
  
  // Update stats
  stats.totalFiles++;
  stats.totalLines += lineCount;
  stats.byFileType[fileType] = (stats.byFileType[fileType] || 0) + 1;
  stats.byDirectory[directory] = (stats.byDirectory[directory] || 0) + 1;
  
  // Track file-specific stats
  fileStats[relativePath] = {
    lineCount,
    functionCount: 0,
    privateFunctionCount: 0,
    publicFunctionCount: 0
  };
  
  // Function to recursively visit each node in the AST
  function visit(node) {
    // Function declarations
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      const isPrivate = name.startsWith('_');
      
      functions.push({
        name: name,
        filePath: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1,
        isPrivate
      });
      
      stats.totalFunctions++;
      fileStats[relativePath].functionCount++;
      
      if (isPrivate) {
        stats.privateMethodCount++;
        fileStats[relativePath].privateFunctionCount++;
      } else {
        stats.publicMethodCount++;
        fileStats[relativePath].publicFunctionCount++;
      }
    }
    
    // Method declarations in classes
    if (ts.isMethodDeclaration(node) && node.name) {
      const methodName = node.name.getText(sourceFile);
      const isPrivate = methodName.startsWith('_');
      
      functions.push({
        name: methodName,
        filePath: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1,
        isPrivate
      });
      
      stats.totalFunctions++;
      fileStats[relativePath].functionCount++;
      
      if (isPrivate) {
        stats.privateMethodCount++;
        fileStats[relativePath].privateFunctionCount++;
      } else {
        stats.publicMethodCount++;
        fileStats[relativePath].publicFunctionCount++;
      }
    }
    
    // Arrow functions with variable declarations
    if (ts.isVariableDeclaration(node) && 
        node.name && 
        node.initializer && 
        ts.isArrowFunction(node.initializer)) {
      const name = node.name.getText(sourceFile);
      const isPrivate = name.startsWith('_');
      
      functions.push({
        name: name,
        filePath: relativePath,
        line: sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1,
        isPrivate
      });
      
      stats.totalFunctions++;
      fileStats[relativePath].functionCount++;
      
      if (isPrivate) {
        stats.privateMethodCount++;
        fileStats[relativePath].privateFunctionCount++;
      } else {
        stats.publicMethodCount++;
        fileStats[relativePath].publicFunctionCount++;
      }
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

// Group functions by file
const functionsByFile = {};
functions.forEach(func => {
  if (!functionsByFile[func.filePath]) {
    functionsByFile[func.filePath] = [];
  }
  functionsByFile[func.filePath].push(func);
});

// Sort files alphabetically
const sortedFiles = Object.keys(functionsByFile).sort();

// For each file, sort functions by line number
sortedFiles.forEach(file => {
  functionsByFile[file].sort((a, b) => a.line - b.line);
});

// Find files with most functions
const filesByFunctionCount = Object.entries(fileStats)
  .sort((a, b) => b[1].functionCount - a[1].functionCount)
  .slice(0, 10);

// Find largest files by line count
const filesByLineCount = Object.entries(fileStats)
  .sort((a, b) => b[1].lineCount - a[1].lineCount)
  .slice(0, 10);

// Find directories with most files
const directoriesByFileCount = Object.entries(stats.byDirectory)
  .sort((a, b) => b[1] - a[1]);

// Generate the output
let output = `# Codebase Analysis\n\n`;

// Overall stats
output += `## Summary\n\n`;
output += `- **Total Files:** ${stats.totalFiles}\n`;
output += `- **Total Functions:** ${stats.totalFunctions}\n`;
output += `- **Total Lines of Code:** ${stats.totalLines}\n`;
output += `- **Public Functions:** ${stats.publicMethodCount} (${Math.round(stats.publicMethodCount/stats.totalFunctions*100)}%)\n`;
output += `- **Private Functions:** ${stats.privateMethodCount} (${Math.round(stats.privateMethodCount/stats.totalFunctions*100)}%)\n`;
output += `- **Average Functions Per File:** ${(stats.totalFunctions / stats.totalFiles).toFixed(2)}\n`;
output += `- **Average Lines Per File:** ${(stats.totalLines / stats.totalFiles).toFixed(2)}\n\n`;

// Top 10 files by function count
output += `## Top 10 Files by Function Count\n\n`;
output += `| File | Functions | Private | Public | Lines |\n`;
output += `|------|-----------|---------|--------|-------|\n`;
filesByFunctionCount.forEach(([file, stats]) => {
  output += `| ${file} | ${stats.functionCount} | ${stats.privateFunctionCount} | ${stats.publicFunctionCount} | ${stats.lineCount} |\n`;
});
output += `\n`;

// Top 10 files by line count
output += `## Top 10 Files by Line Count\n\n`;
output += `| File | Lines | Functions | Private | Public |\n`;
output += `|------|-------|-----------|---------|--------|\n`;
filesByLineCount.forEach(([file, stats]) => {
  output += `| ${file} | ${stats.lineCount} | ${stats.functionCount} | ${stats.privateFunctionCount} | ${stats.publicFunctionCount} |\n`;
});
output += `\n`;

// Directories breakdown
output += `## Directory Breakdown\n\n`;
output += `| Directory | File Count |\n`;
output += `|-----------|------------|\n`;
directoriesByFileCount.forEach(([dir, count]) => {
  output += `| ${dir} | ${count} |\n`;
});
output += `\n`;

// Functions by file
output += `## Functions By File\n\n`;
sortedFiles.forEach(file => {
  output += `### ${file} (${functionsByFile[file].length} functions)\n\n`;
  output += `| Line | Function Name | Private |\n`;
  output += `|------|--------------|--------|\n`;
  
  functionsByFile[file].forEach(func => {
    output += `| ${func.line} | \`${func.name}\` | ${func.isPrivate ? '✓' : ' '} |\n`;
  });
  
  output += `\n`;
});

// Write to file
fs.writeFileSync(outputFile, output);
console.log(`Generated codebase analysis with details on ${stats.totalFunctions} functions across ${stats.totalFiles} files in ${outputFile}`);