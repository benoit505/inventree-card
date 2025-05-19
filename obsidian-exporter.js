// obsidian-exporter.js
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Configuration
const rootDir = './src';
const outputDir = './obsidian-vault';
const filesDir = `${outputDir}/files`;
const servicesDir = `${outputDir}/services`;
const componentsDir = `${outputDir}/components`;
const pipelinesDir = `${outputDir}/pipelines`;
const indexFile = `${outputDir}/index.md`;

// Store all found functions, files, and dependencies
const functions = [];
const files = [];
const functionCalls = [];

// Process a TypeScript file
function processFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      fileContent,
      ts.ScriptTarget.Latest,
      true
    );
    
    const relativePath = path.relative(rootDir, filePath);
    const fileName = path.basename(filePath);
    const directory = path.dirname(relativePath);
    
    // Store file info
    const fileInfo = {
      path: relativePath,
      name: fileName,
      directory,
      functions: [],
      imports: [],
      exports: [],
      lineCount: fileContent.split('\n').length
    };
    
    // Track current class/scope for context
    let currentClass = null;
    let currentFunction = null;
    
    // Extract imports
    function collectImports(node) {
      if (ts.isImportDeclaration(node)) {
        let importPath = '';
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          importPath = node.moduleSpecifier.text;
        }
        
        let importItems = [];
        if (node.importClause) {
          if (node.importClause.name) {
            importItems.push(node.importClause.name.text);
          }
          if (node.importClause.namedBindings) {
            if (ts.isNamedImports(node.importClause.namedBindings)) {
              importItems = importItems.concat(
                node.importClause.namedBindings.elements.map(el => el.name.text)
              );
            }
          }
        }
        
        fileInfo.imports.push({
          path: importPath,
          items: importItems
        });
      }
      
      // Track classes
      if (ts.isClassDeclaration(node) && node.name) {
        currentClass = node.name.text;
      }
      
      // Track exports
      if (ts.isExportDeclaration(node) || 
          (node.modifiers && node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword))) {
        
        if (ts.isExportDeclaration(node) && node.exportClause) {
          if (ts.isNamedExports(node.exportClause)) {
            const exportItems = node.exportClause.elements.map(el => el.name.text);
            fileInfo.exports = fileInfo.exports.concat(exportItems);
          }
        } else if (
          (ts.isFunctionDeclaration(node) || 
           ts.isClassDeclaration(node) ||
           ts.isVariableStatement(node)) && 
          node.modifiers && 
          node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)
        ) {
          let exportName = '';
          
          if (ts.isFunctionDeclaration(node) && node.name) {
            exportName = node.name.text;
          } else if (ts.isClassDeclaration(node) && node.name) {
            exportName = node.name.text;
          } else if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach(decl => {
              if (decl.name && ts.isIdentifier(decl.name)) {
                exportName = decl.name.text;
              }
            });
          }
          
          if (exportName) {
            fileInfo.exports.push(exportName);
          }
        }
      }
      
      // Continue traversing
      ts.forEachChild(node, collectImports);
    }
    
    // Process functions and calls
    function processNode(node) {
      // Function declarations
      if (ts.isFunctionDeclaration(node) && node.name) {
        const name = node.name.text;
        const line = sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1;
        const isExported = node.modifiers && node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
        const isPrivate = name.startsWith('_');
        
        // Extract JSDoc comments
        let description = '';
        let params = [];
        let returns = '';
        
        if (node.jsDoc && node.jsDoc.length > 0) {
          const jsDoc = node.jsDoc[0];
          description = jsDoc.comment || '';
          
          if (jsDoc.tags) {
            jsDoc.tags.forEach(tag => {
              if (tag.tagName.text === 'param' && tag.comment) {
                params.push({
                  name: tag.name ? tag.name.text : '',
                  description: tag.comment
                });
              } else if (tag.tagName.text === 'returns' && tag.comment) {
                returns = tag.comment;
              }
            });
          }
        }
        
        // Get parameters
        const parameters = node.parameters.map(param => {
          const paramName = param.name.getText(sourceFile);
          const paramType = param.type ? param.type.getText(sourceFile) : 'any';
          const paramDescription = params.find(p => p.name === paramName)?.description || '';
          
          return {
            name: paramName,
            type: paramType,
            description: paramDescription
          };
        });
        
        // Get return type
        const returnType = node.type ? node.type.getText(sourceFile) : 'void';
        
        // Create function object
        const func = {
          name,
          filePath: relativePath,
          line,
          isExported,
          isPrivate,
          description,
          parameters,
          returnType,
          returns,
          class: currentClass,
          calls: []
        };
        
        functions.push(func);
        fileInfo.functions.push(name);
        currentFunction = name;
        
        // Recursively process function body for calls
        if (node.body) {
          processNode(node.body);
        }
        
        currentFunction = null;
      }
      
      // Method declarations
      if (ts.isMethodDeclaration(node) && node.name) {
        const name = node.name.getText(sourceFile);
        const line = sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1;
        const isPrivate = name.startsWith('_');
        
        // Extract parameters
        const parameters = node.parameters.map(param => {
          return {
            name: param.name.getText(sourceFile),
            type: param.type ? param.type.getText(sourceFile) : 'any',
            description: ''
          };
        });
        
        // Extract return type
        const returnType = node.type ? node.type.getText(sourceFile) : 'void';
        
        // Create function object
        const func = {
          name,
          filePath: relativePath,
          line,
          isExported: false,
          isPrivate,
          description: '',
          parameters,
          returnType,
          returns: '',
          class: currentClass,
          calls: []
        };
        
        functions.push(func);
        fileInfo.functions.push(name);
        currentFunction = name;
        
        // Recursively process method body for calls
        if (node.body) {
          processNode(node.body);
        }
        
        currentFunction = null;
      }
      
      // Arrow functions
      if (ts.isVariableDeclaration(node) && 
          node.name && 
          node.initializer && 
          ts.isArrowFunction(node.initializer)) {
        const name = node.name.getText(sourceFile);
        const line = sourceFile.getLineAndCharacterOfPosition(node.name.pos).line + 1;
        const isExported = false; // We'll handle exports separately
        const isPrivate = name.startsWith('_');
        
        // Extract parameters
        const parameters = node.initializer.parameters.map(param => {
          return {
            name: param.name.getText(sourceFile),
            type: param.type ? param.type.getText(sourceFile) : 'any',
            description: ''
          };
        });
        
        // Extract return type
        const returnType = node.initializer.type ? node.initializer.type.getText(sourceFile) : 'void';
        
        // Create function object
        const func = {
          name,
          filePath: relativePath,
          line,
          isExported,
          isPrivate,
          description: '',
          parameters,
          returnType,
          returns: '',
          class: currentClass,
          calls: []
        };
        
        functions.push(func);
        fileInfo.functions.push(name);
        currentFunction = name;
        
        // Recursively process arrow function body for calls
        if (node.initializer.body) {
          processNode(node.initializer.body);
        }
        
        currentFunction = null;
      }
      
      // Function calls
      if (ts.isCallExpression(node) && currentFunction) {
        let calledFunctionName = '';
        
        // Direct calls: functionName()
        if (ts.isIdentifier(node.expression)) {
          calledFunctionName = node.expression.text;
          
          functionCalls.push({
            caller: currentFunction,
            callerFile: relativePath,
            callerClass: currentClass,
            callee: calledFunctionName,
            calleeFile: '', // We'll resolve this later
            calleeClass: '',
            line: sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
          });
        }
        
        // Property access: object.method()
        if (ts.isPropertyAccessExpression(node.expression)) {
          calledFunctionName = node.expression.name.text;
          const objectPart = node.expression.expression.getText(sourceFile);
          
          // Skip console.* calls
          if (objectPart !== 'console' && objectPart !== 'document' && objectPart !== 'window') {
            functionCalls.push({
              caller: currentFunction,
              callerFile: relativePath,
              callerClass: currentClass,
              callee: calledFunctionName,
              calleeObject: objectPart,
              calleeFile: '', // We'll resolve this later
              calleeClass: '',
              line: sourceFile.getLineAndCharacterOfPosition(node.pos).line + 1
            });
          }
        }
      }
      
      // Continue traversing
      ts.forEachChild(node, processNode);
    }
    
    // First pass: collect imports and class definitions
    collectImports(sourceFile);
    
    // Second pass: process functions and calls
    processNode(sourceFile);
    
    files.push(fileInfo);
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Walk through directories recursively
function walkDir(dir) {
  try {
    const entries = fs.readdirSync(dir);
    
    entries.forEach(entry => {
      const entryPath = path.join(dir, entry);
      const stat = fs.statSync(entryPath);
      
      if (stat.isDirectory()) {
        walkDir(entryPath);
      } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
        processFile(entryPath);
      }
    });
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error);
  }
}

// Create a file-based link for Obsidian
function createFileLink(fileName, displayName = null) {
  // Remove extension and replace special chars
  const baseName = fileName.replace(/\.\w+$/, '');
  const sanitized = baseName.replace(/[^\w\s-]/g, '-');
  return `[[${sanitized}|${displayName || baseName}]]`;
}

// Create directories if they don't exist
function ensureDirectories() {
  const dirs = [outputDir, filesDir, servicesDir, componentsDir, pipelinesDir];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Generate file documentation
function generateFileDocumentation() {
  files.forEach(file => {
    const sanitizedFileName = file.name.replace(/\.\w+$/, '');
    const outputPath = `${filesDir}/${sanitizedFileName}.md`;
    
    let content = `---
aliases: [${file.name}]
tags: [file, ${file.directory.split('/').join(', ')}]
---

# ${file.name}

**Path:** \`${file.path}\`  
**Line Count:** ${file.lineCount}  
**Functions:** ${file.functions.length}  

## Overview

This file is part of the \`${file.directory}\` directory.

`;

    // Imports section
    if (file.imports.length > 0) {
      content += `## Imports\n\n`;
      file.imports.forEach(imp => {
        let importDisplay = imp.path;
        
        // Create links to local imports
        if (imp.path.startsWith('.')) {
          // Try to find the target file
          const importDir = path.dirname(file.path);
          const resolvedPath = path.normalize(path.join(importDir, imp.path));
          const targetFile = files.find(f => f.path.replace(/\.\w+$/, '') === resolvedPath.replace(/\.\w+$/, ''));
          
          if (targetFile) {
            importDisplay = createFileLink(targetFile.name);
          }
        }
        
        content += `- ${importDisplay}${imp.items.length ? ': ' + imp.items.join(', ') : ''}\n`;
      });
      content += '\n';
    }
    
    // Exports section
    if (file.exports.length > 0) {
      content += `## Exports\n\n`;
      file.exports.forEach(exp => {
        content += `- \`${exp}\`\n`;
      });
      content += '\n';
    }
    
    // Functions section
    if (file.functions.length > 0) {
      content += `## Functions\n\n`;
      
      // Group functions by class if applicable
      const groupedFunctions = {};
      
      functions.filter(f => f.filePath === file.path).forEach(func => {
        const group = func.class || 'global';
        if (!groupedFunctions[group]) {
          groupedFunctions[group] = [];
        }
        groupedFunctions[group].push(func);
      });
      
      // Sort by line number within each group
      Object.keys(groupedFunctions).forEach(group => {
        groupedFunctions[group].sort((a, b) => a.line - b.line);
      });
      
      // Generate content for each group
      Object.keys(groupedFunctions).forEach(group => {
        if (group !== 'global') {
          content += `### Class: ${group}\n\n`;
        }
        
        groupedFunctions[group].forEach(func => {
          const privateLabel = func.isPrivate ? '🔒 Private' : '🌐 Public';
          const exportedLabel = func.isExported ? '📤 Exported' : '';
          const labels = [privateLabel, exportedLabel].filter(Boolean).join(' | ');
          
          content += `### \`${func.name}\` (${labels}) {#${func.name}}\n\n`;
          
          if (func.description) {
            content += `${func.description}\n\n`;
          }
          
          // Parameters
          if (func.parameters.length > 0) {
            content += `**Parameters:**\n\n`;
            func.parameters.forEach(param => {
              content += `- \`${param.name}\`: \`${param.type}\`${param.description ? ` - ${param.description}` : ''}\n`;
            });
            content += '\n';
          }
          
          // Return type
          content += `**Returns:** \`${func.returnType}\`${func.returns ? ` - ${func.returns}` : ''}\n\n`;
          
          // Calls section
          const outgoingCalls = functionCalls.filter(call => 
            call.caller === func.name && call.callerFile === file.path
          );
          
          if (outgoingCalls.length > 0) {
            content += `**Calls:**\n\n`;
            
            // Group calls by target function
            const uniqueCalls = {};
            outgoingCalls.forEach(call => {
              const key = call.calleeObject ? `${call.calleeObject}.${call.callee}` : call.callee;
              if (!uniqueCalls[key]) {
                uniqueCalls[key] = call;
              }
            });
            
            Object.values(uniqueCalls).forEach(call => {
              const callDisplay = call.calleeObject ? `${call.calleeObject}.${call.callee}` : call.callee;
              
              // Check if the called function is in our codebase
              const targetFunc = functions.find(f => f.name === call.callee);
              if (targetFunc) {
                const targetFileName = files.find(f => f.path === targetFunc.filePath)?.name;
                if (targetFileName) {
                  content += `- ${createFileLink(targetFileName)}#${call.callee}\n`;
                } else {
                  content += `- \`${callDisplay}\`\n`;
                }
              } else {
                content += `- \`${callDisplay}\`\n`;
              }
            });
            content += '\n';
          }
          
          // Find incoming calls
          const incomingCalls = functionCalls.filter(call => 
            call.callee === func.name && 
            !(call.callerFile === file.path && call.caller === func.name) // Exclude self-calls
          );
          
          if (incomingCalls.length > 0) {
            content += `**Called By:**\n\n`;
            
            // Group by caller file
            const callersByFile = {};
            incomingCalls.forEach(call => {
              if (!callersByFile[call.callerFile]) {
                callersByFile[call.callerFile] = [];
              }
              if (!callersByFile[call.callerFile].includes(call.caller)) {
                callersByFile[call.callerFile].push(call.caller);
              }
            });
            
            Object.entries(callersByFile).forEach(([callerFile, callers]) => {
              const fileInfo = files.find(f => f.path === callerFile);
              if (fileInfo) {
                content += `- From ${createFileLink(fileInfo.name)}:\n`;
                callers.forEach(caller => {
                  content += `  - \`${caller}\`\n`;
                });
              } else {
                content += `- From \`${callerFile}\`:\n`;
                callers.forEach(caller => {
                  content += `  - \`${caller}\`\n`;
                });
              }
            });
            content += '\n';
          }
          
          // Visual call graph using Mermaid
          if (outgoingCalls.length > 0 || incomingCalls.length > 0) {
            content += `**Call Graph:**\n\n\`\`\`mermaid
flowchart LR
`;
            
            // Node for current function
            content += `    ${func.name}[${func.name}]:::current\n`;
            
            // Nodes and edges for outgoing calls
            if (outgoingCalls.length > 0) {
              const uniqueOutgoing = [...new Set(outgoingCalls.map(call => 
                call.calleeObject ? `${call.calleeObject}.${call.callee}` : call.callee
              ))];
              
              uniqueOutgoing.forEach(callee => {
                // Make node ID safe for Mermaid
                const calleeId = callee.replace(/[^a-zA-Z0-9]/g, '_');
                content += `    ${calleeId}[${callee}]\n`;
                content += `    ${func.name} -->|calls| ${calleeId}\n`;
              });
            }
            
            // Nodes and edges for incoming calls
            if (incomingCalls.length > 0) {
              const uniqueIncoming = [...new Set(incomingCalls.map(call => call.caller))];
              
              uniqueIncoming.forEach(caller => {
                // Make node ID safe for Mermaid
                const callerId = caller.replace(/[^a-zA-Z0-9]/g, '_');
                content += `    ${callerId}[${caller}]\n`;
                content += `    ${callerId} -->|calls| ${func.name}\n`;
              });
            }
            
            content += `    classDef current fill:#f96,stroke:#333,stroke-width:2px;\n`;
            content += `\`\`\`\n\n`;
          }
        });
      });
    }
    
    // Dependencies visualization
    const directImports = file.imports
      .filter(imp => imp.path.startsWith('.'))
      .map(imp => {
        // Try to resolve the import path
        const importDir = path.dirname(file.path);
        const resolvedPath = path.normalize(path.join(importDir, imp.path));
        return files.find(f => f.path.replace(/\.\w+$/, '') === resolvedPath.replace(/\.\w+$/, ''))?.path;
      })
      .filter(Boolean);
    
    const dependents = files
      .filter(f => f.imports.some(imp => {
        if (!imp.path.startsWith('.')) return false;
        
        // Try to resolve the import path
        const importDir = path.dirname(f.path);
        const resolvedPath = path.normalize(path.join(importDir, imp.path));
        return resolvedPath.replace(/\.\w+$/, '') === file.path.replace(/\.\w+$/, '');
      }))
      .map(f => f.path);
    
    if (directImports.length > 0 || dependents.length > 0) {
      content += `## Dependencies\n\n\`\`\`mermaid
flowchart TD
    ${sanitizedFileName}[${file.name}]:::current
`;
      
      // Imports
      directImports.forEach(imp => {
        const importName = path.basename(imp);
        const importId = importName.replace(/\.\w+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        content += `    ${importId}[${importName}]\n`;
        content += `    ${sanitizedFileName} -->|imports| ${importId}\n`;
      });
      
      // Dependents
      dependents.forEach(dep => {
        const depName = path.basename(dep);
        const depId = depName.replace(/\.\w+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        content += `    ${depId}[${depName}]\n`;
        content += `    ${depId} -->|imports| ${sanitizedFileName}\n`;
      });
      
      content += `    classDef current fill:#f96,stroke:#333,stroke-width:2px;\n`;
      content += `\`\`\`\n\n`;
    }
    
    fs.writeFileSync(outputPath, content);
  });
}

// Generate service documentation
function generateServiceDocumentation() {
  // Identify all services by filename pattern
  const services = files.filter(f => 
    f.directory.includes('service') || 
    f.name.includes('service') || 
    f.name.includes('manager')
  );
  
  // Generate index file for services
  let servicesIndex = `---
aliases: [Services]
tags: [services, overview]
---

# Services Overview

This document provides an overview of all services in the codebase.

`;

  services.forEach(service => {
    servicesIndex += `- ${createFileLink(service.name)}\n`;
  });
  
  fs.writeFileSync(`${servicesDir}/index.md`, servicesIndex);
  
  // Generate individual file for each service
  services.forEach(service => {
    const sanitizedFileName = service.name.replace(/\.\w+$/, '');
    const outputPath = `${servicesDir}/${sanitizedFileName}.md`;
    
    let content = `---
aliases: [${service.name}]
tags: [service, ${service.directory.split('/').join(', ')}]
---

# ${service.name}

**Path:** \`${service.path}\`  
**Line Count:** ${service.lineCount}  
**Functions:** ${service.functions.length}  

## Overview

This service is part of the \`${service.directory}\` directory.

`;

    // List of public methods/interface
    const publicFunctions = functions
      .filter(f => f.filePath === service.path && !f.isPrivate)
      .sort((a, b) => a.line - b.line);
    
    if (publicFunctions.length > 0) {
      content += `## Public Interface\n\n`;
      publicFunctions.forEach(func => {
        content += `- \`${func.name}\`${func.description ? ` - ${func.description.split('\n')[0]}` : ''}\n`;
      });
      content += '\n';
    }
    
    // Visual interface diagram
    if (publicFunctions.length > 0) {
      content += `## Service Interface\n\n\`\`\`mermaid
classDiagram
    class ${sanitizedFileName} {
`;
      
      publicFunctions.forEach(func => {
        const params = func.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        content += `        +${func.returnType} ${func.name}(${params})\n`;
      });
      
      content += `    }
\`\`\`\n\n`;
    }
    
    // Service Usage
    const serviceUsage = functionCalls.filter(call => 
      (call.calleeObject === sanitizedFileName || 
       call.calleeObject === 'this' && call.callerFile === service.path) &&
      functions.some(f => f.filePath === service.path && f.name === call.callee)
    );
    
    if (serviceUsage.length > 0) {
      content += `## Service Usage\n\n`;
      
      // Group by calling file
      const usageByFile = {};
      serviceUsage.forEach(call => {
        if (!usageByFile[call.callerFile]) {
          usageByFile[call.callerFile] = new Set();
        }
        usageByFile[call.callerFile].add(call.callee);
      });
      
      Object.entries(usageByFile).forEach(([file, methods]) => {
        const fileInfo = files.find(f => f.path === file);
        if (fileInfo) {
          content += `- **${createFileLink(fileInfo.name)}** uses:\n`;
          [...methods].sort().forEach(method => {
            content += `  - \`${method}\`\n`;
          });
        }
      });
      content += '\n';
    }
    
    // Include general file information (imports, exports, functions) similar to file docs
    // Link back to the file documentation
    content += `## Detailed Documentation\n\n`;
    content += `For full implementation details, see the [${service.name}](../files/${sanitizedFileName}.md) file documentation.\n\n`;
    
    fs.writeFileSync(outputPath, content);
  });
}

// Generate component documentation
function generateComponentDocumentation() {
  // Identify all components by filename pattern
  const components = files.filter(f => 
    f.directory.includes('component') || 
    f.name.includes('component') ||
    f.name.includes('layout') ||
    f.name.includes('view')
  );
  
  // Generate index file for components
  let componentsIndex = `---
aliases: [Components]
tags: [components, overview]
---

# Components Overview

This document provides an overview of all components in the codebase.

`;

  components.forEach(component => {
    componentsIndex += `- ${createFileLink(component.name)}\n`;
  });
  
  fs.writeFileSync(`${componentsDir}/index.md`, componentsIndex);
  
  // Generate individual file for each component
  components.forEach(component => {
    const sanitizedFileName = component.name.replace(/\.\w+$/, '');
    const outputPath = `${componentsDir}/${sanitizedFileName}.md`;
    
    let content = `---
aliases: [${component.name}]
tags: [component, ${component.directory.split('/').join(', ')}]
---

# ${component.name}

**Path:** \`${component.path}\`  
**Line Count:** ${component.lineCount}  
**Functions:** ${component.functions.length}  

## Overview

This component is part of the \`${component.directory}\` directory.

`;

    // Lifecycle methods
    const lifecycleMethods = functions.filter(f => 
      f.filePath === component.path && 
      ['connectedCallback', 'disconnectedCallback', 'attributeChangedCallback', 'firstUpdated', 'updated', 'render'].includes(f.name)
    );
    
    if (lifecycleMethods.length > 0) {
      content += `## Lifecycle Methods\n\n`;
      lifecycleMethods.forEach(method => {
        content += `- \`${method.name}\`\n`;
      });
      content += '\n';
    }
    
    // Event handlers
    const eventHandlers = functions.filter(f => 
      f.filePath === component.path && 
      (f.name.startsWith('handle') || f.name.includes('Handler') || f.name.includes('Listener'))
    );
    
    if (eventHandlers.length > 0) {
      content += `## Event Handlers\n\n`;
      eventHandlers.forEach(handler => {
        content += `- \`${handler.name}\`\n`;
      });
      content += '\n';
    }
    
    // Component dependencies
    const componentImports = component.imports
      .filter(imp => imp.path.startsWith('.'))
      .map(imp => {
        // Try to resolve the import path
        const importDir = path.dirname(component.path);
        const resolvedPath = path.normalize(path.join(importDir, imp.path));
        return files.find(f => f.path.replace(/\.\w+$/, '') === resolvedPath.replace(/\.\w+$/, ''))?.path;
      })
      .filter(Boolean);
    
    const dependentComponents = files
      .filter(f => f.imports.some(imp => {
        if (!imp.path.startsWith('.')) return false;
        
        // Try to resolve the import path
        const importDir = path.dirname(f.path);
        const resolvedPath = path.normalize(path.join(importDir, imp.path));
        return resolvedPath.replace(/\.\w+$/, '') === component.path.replace(/\.\w+$/, '');
      }))
      .map(f => f.path);
    
    if (componentImports.length > 0 || dependentComponents.length > 0) {
      content += `## Component Dependencies\n\n\`\`\`mermaid
flowchart TD
    ${sanitizedFileName}[${component.name}]:::current
`;
      
      // Imports
      componentImports.forEach(imp => {
        const importName = path.basename(imp);
        const importId = importName.replace(/\.\w+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        content += `    ${importId}[${importName}]\n`;
        content += `    ${sanitizedFileName} -->|imports| ${importId}\n`;
      });
      
      // Dependents
      dependentComponents.forEach(dep => {
        const depName = path.basename(dep);
        const depId = depName.replace(/\.\w+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        content += `    ${depId}[${depName}]\n`;
        content += `    ${depId} -->|imports| ${sanitizedFileName}\n`;
      });
      
      content += `    classDef current fill:#f96,stroke:#333,stroke-width:2px;\n`;
      content += `\`\`\`\n\n`;
    }
    
    // Include general file information (imports, exports, functions) similar to file docs
    // Link back to the file documentation
    content += `## Detailed Documentation\n\n`;
    content += `For full implementation details, see the [${component.name}](../files/${sanitizedFileName}.md) file documentation.\n\n`;
    
    fs.writeFileSync(outputPath, content);
  });
}

// Generate pipeline documentation
function generatePipelineDocumentation() {
  // Find all potential pipeline entry points
  const entryPoints = [];
  
  // Event handlers are often entry points
  functions.forEach(func => {
    if (func.name.startsWith('handle') || 
        func.name.includes('Handler') || 
        func.name.includes('Listener') ||
        func.name.includes('callback')) {
      entryPoints.push(func);
    }
  });
  
  // Functions that are called by many others might be pipeline junctions
  const functionCallCount = {};
  functionCalls.forEach(call => {
    functionCallCount[call.callee] = (functionCallCount[call.callee] || 0) + 1;
  });
  
  // Find functions with many callers (more than 5)
  Object.entries(functionCallCount)
    .filter(([_, count]) => count > 5)
    .forEach(([funcName, _]) => {
      const func = functions.find(f => f.name === funcName);
      if (func && !entryPoints.some(ep => ep.name === func.name)) {
        entryPoints.push(func);
      }
    });
  
  // Generate index file for pipelines
  let pipelinesIndex = `---
aliases: [Data Pipelines]
tags: [pipelines, overview]
---

# Data Pipelines Overview

This document provides an overview of key data and control flow pipelines in the codebase.

`;

  entryPoints.forEach(entry => {
    pipelinesIndex += `- [${entry.name} Pipeline](${entry.name.replace(/[^a-zA-Z0-9]/g, '_')}.md)\n`;
  });
  
  fs.writeFileSync(`${pipelinesDir}/index.md`, pipelinesIndex);
  
  // Track visited functions to avoid duplicates and circular references
  const visitedCombinations = new Set();
  
  // Recursive function to trace a pipeline
  function tracePipeline(func, depth = 0, path = [], visitedInPath = new Set()) {
    // Add current function to path
    path.push(func);
    visitedInPath.add(func.name);
    
    // Find outgoing calls from this function
    const outgoingCalls = functionCalls.filter(call => 
      call.caller === func.name && call.callerFile === func.filePath
    );
    
    // Process each outgoing call
    outgoingCalls.forEach(call => {
      // Avoid circular references and duplicates
      const combinationKey = `${func.name}|${call.callee}`;
      if (visitedCombinations.has(combinationKey)) return;
      visitedCombinations.add(combinationKey);
      
      // Find the called function
      const calledFunc = functions.find(f => f.name === call.callee);
      if (calledFunc && !visitedInPath.has(calledFunc.name) && depth < 10) {
        // Continue tracing
        tracePipeline(calledFunc, depth + 1, [...path], new Set(visitedInPath));
      }
    });
    
    return path;
  }
  
  // Generate pipeline documentation for each entry point
  entryPoints.forEach(entry => {
    const sanitizedFileName = entry.name.replace(/[^a-zA-Z0-9]/g, '_');
    const outputPath = `${pipelinesDir}/${sanitizedFileName}.md`;
    
    let content = `---
aliases: [${entry.name} Pipeline]
tags: [pipeline, ${entry.filePath.split('/').join(', ')}]
---

# ${entry.name} Pipeline

**Entry Point:** \`${entry.name}\`  
**Defined in:** \`${entry.filePath}\`  

## Overview

This document visualizes the execution flow starting from \`${entry.name}\`.

`;

    // Clear visited set for each new pipeline
    visitedCombinations.clear();
    
    // Trace the full pipeline
    const pipeline = tracePipeline(entry);
    
    if (pipeline.length > 1) {
      content += `## Key Steps\n\n`;
      pipeline.forEach((func, index) => {
        content += `${index + 1}. \`${func.name}\` in \`${func.filePath}\`\n`;
      });
      content += '\n';
      
      // Create Mermaid diagram of the pipeline
      content += `## Visual Pipeline\n\n\`\`\`mermaid
flowchart TB
`;
      
      // Add nodes for all functions in the pipeline
      pipeline.forEach(func => {
        const nodeId = func.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileBaseName = path.basename(func.filePath).replace(/\.\w+$/, '');
        content += `    ${nodeId}["${func.name}<br><small>${fileBaseName}</small>"${func === entry ? ':::entry' : ''}]\n`;
      });
      
      // Add edges between functions
      for (let i = 0; i < pipeline.length - 1; i++) {
        const sourceId = pipeline[i].name.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Find all direct calls from this function
        const directCalls = functionCalls.filter(call => 
          call.caller === pipeline[i].name && call.callerFile === pipeline[i].filePath
        );
        
        // Add edges to directly called functions in our pipeline
        directCalls.forEach(call => {
          const target = pipeline.find(f => f.name === call.callee);
          if (target) {
            const targetId = target.name.replace(/[^a-zA-Z0-9]/g, '_');
            content += `    ${sourceId} --> ${targetId}\n`;
          }
        });
      }
      
      content += `    classDef entry fill:#f96,stroke:#333,stroke-width:2px;\n`;
      content += `\`\`\`\n\n`;
    }
    
    // Detailed documentation for each function in the pipeline
    content += `## Pipeline Functions\n\n`;
    
    pipeline.forEach(func => {
      const fileInfo = files.find(f => f.path === func.filePath);
      const fileLink = fileInfo ? createFileLink(fileInfo.name) : func.filePath;
      
      content += `### ${func.name}\n\n`;
      content += `Defined in ${fileLink}\n\n`;
      
      if (func.description) {
        content += `${func.description}\n\n`;
      }
      
      // Function parameters
      if (func.parameters.length > 0) {
        content += `**Parameters:**\n\n`;
        func.parameters.forEach(param => {
          content += `- \`${param.name}\`: \`${param.type}\`${param.description ? ` - ${param.description}` : ''}\n`;
        });
        content += '\n';
      }
      
      // Return type
      content += `**Returns:** \`${func.returnType}\`${func.returns ? ` - ${func.returns}` : ''}\n\n`;
    });
    
    fs.writeFileSync(outputPath, content);
  });
}

// Generate main index file
function generateIndexFile() {
  let content = `---
aliases: [Codebase Documentation]
tags: [index, overview]
---

# Codebase Documentation

Welcome to the codebase documentation. This Obsidian vault contains comprehensive documentation of the codebase structure, functions, and dependencies.

## Overview

- **Total Files:** ${files.length}
- **Total Functions:** ${functions.length}
- **Total Function Calls:** ${functionCalls.length}

## Navigation

- [Files](files/index.md) - Documentation for all source files
- [Services](services/index.md) - Service layer documentation
- [Components](components/index.md) - UI components and layouts
- [Pipelines](pipelines/index.md) - Data and control flow pipelines

## Directory Structure

\`\`\`mermaid
flowchart TD
`;

  // Get all top-level directories
  const topDirs = [...new Set(files.map(f => f.directory.split('/')[0]))];
  
  // Add top-level directories
  topDirs.forEach(dir => {
    content += `    ${dir}[${dir}/]\n`;
  });
  
  // Add subdirectories and connections
  const processedDirs = new Set();
  
  files.forEach(file => {
    const parts = file.directory.split('/');
    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i++) {
        const parentDir = parts.slice(0, i).join('_');
        const currentDir = parts.slice(0, i + 1).join('_');
        
        if (!processedDirs.has(currentDir)) {
          processedDirs.add(currentDir);
          content += `    ${currentDir}[${parts[i]}/]\n`;
          content += `    ${parentDir} --> ${currentDir}\n`;
        }
      }
    }
  });
  
  content += `\`\`\`\n\n`;
  
  // Project statistics visualization
  content += `## Project Statistics\n\n`;
  
  // Files by directory
  const filesByDir = {};
  files.forEach(file => {
    const dir = file.directory;
    filesByDir[dir] = (filesByDir[dir] || 0) + 1;
  });
  
  content += `### Files by Directory\n\n\`\`\`mermaid
pie
`;
  
  Object.entries(filesByDir)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // Show top 8 directories
    .forEach(([dir, count]) => {
      content += `    "${dir}" : ${count}\n`;
    });
  
  content += `\`\`\`\n\n`;
  
  // Top 10 files by function count
  const topFilesByFunctionCount = [...files]
    .sort((a, b) => b.functions.length - a.functions.length)
    .slice(0, 10);
  
  content += `### Top 10 Files by Function Count\n\n\`\`\`mermaid
bar
    title Top 10 Files by Function Count
    x-axis [Files]
    y-axis [Function Count]
`;
  
  topFilesByFunctionCount.forEach(file => {
    content += `    "${path.basename(file.path)}" : ${file.functions.length}\n`;
  });
  
  content += `\`\`\`\n\n`;
  
  fs.writeFileSync(indexFile, content);
  
  // Also create a simple index file for files
  let filesIndex = `---
aliases: [Files]
tags: [files, overview]
---

# Files Overview

This section contains documentation for all source files in the codebase.

`;

  // Group files by directory
  const filesByDirectory = {};
  files.forEach(file => {
    if (!filesByDirectory[file.directory]) {
      filesByDirectory[file.directory] = [];
    }
    filesByDirectory[file.directory].push(file);
  });
  
  // List files by directory
  Object.entries(filesByDirectory).forEach(([dir, dirFiles]) => {
    filesIndex += `## ${dir}/\n\n`;
    
    dirFiles.sort((a, b) => a.name.localeCompare(b.name)).forEach(file => {
      filesIndex += `- ${createFileLink(file.name)}\n`;
    });
    
    filesIndex += '\n';
  });
  
  fs.writeFileSync(`${filesDir}/index.md`, filesIndex);
}

// Main execution
console.log("Starting TypeScript codebase analysis...");
walkDir(rootDir);

console.log(`Found ${files.length} files, ${functions.length} functions, and ${functionCalls.length} function calls.`);

console.log("Generating Obsidian vault...");
ensureDirectories();

console.log("Generating file documentation...");
generateFileDocumentation();

console.log("Generating service documentation...");
generateServiceDocumentation();

console.log("Generating component documentation...");
generateComponentDocumentation();

console.log("Generating pipeline documentation...");
generatePipelineDocumentation();

console.log("Generating index files...");
generateIndexFile();

console.log("Done! Open the Obsidian vault at:", outputDir);