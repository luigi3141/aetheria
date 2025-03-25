const fs = require('fs');
const path = require('path');

// Read the EncounterScene.js file
const filePath = path.resolve(__dirname, 'EncounterScene.js');
let content = fs.readFileSync(filePath, 'utf8');

// Function to remove duplicate method definitions
function removeDuplicateMethods(content) {
    const methodRegex = /\/\*\*[\s\S]*?\*\/\s*\w+\([^)]*\)\s*{[\s\S]*?}/g;
    const methods = {};
    const seenMethods = new Set();
    
    // Find all method definitions
    const matches = content.matchAll(methodRegex);
    for (const match of matches) {
        const method = match[0];
        // Extract method name
        const nameMatch = method.match(/\*\/\s*(\w+)\(/);
        if (nameMatch) {
            const name = nameMatch[1];
            if (!seenMethods.has(name)) {
                methods[name] = method;
                seenMethods.add(name);
            }
        }
    }
    
    // Replace content with unique methods
    let newContent = content;
    seenMethods.forEach(name => {
        const methodRegex = new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*${name}\\([^)]*\\)\\s*{[\\s\\S]*?}`, 'g');
        const matches = newContent.match(methodRegex);
        if (matches && matches.length > 1) {
            // Keep only the first occurrence
            newContent = newContent.replace(methodRegex, (match, offset) => {
                return offset === newContent.indexOf(match) ? match : '';
            });
        }
    });
    
    return newContent;
}

// Clean up the content
const cleanedContent = removeDuplicateMethods(content);

// Write the cleaned content back to a new file
const backupPath = filePath + '.bak';
fs.writeFileSync(backupPath, content); // Backup original
fs.writeFileSync(filePath, cleanedContent); // Write cleaned version

console.log('Cleanup complete. Original file backed up to:', backupPath);
