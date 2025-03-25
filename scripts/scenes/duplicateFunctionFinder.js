const fs = require("fs");
const path = require("path");

// Set the JS file path to scan
const filePath = path.resolve(__dirname, "EncounterScene.js");

const content = fs.readFileSync(filePath, "utf8");
const lines = content.split("\n");

const matches = {};

// Regexes to match: traditional functions, arrow functions, class methods
const regexes = [
  /function\s+([a-zA-Z0-9_]+)\s*\(/,                                    // function foo() { ... }
  /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*\(.*?\)\s*=>\s*{/,         // const foo = (...) => { ... }
  /^\s*([a-zA-Z0-9_]+)\s*\(.*?\)\s*{/                                   // class method: foo(...) {
];

lines.forEach((line, index) => {
  regexes.forEach((regex) => {
    const match = line.match(regex);
    if (match) {
      const name = match[1];
      
      // Ensure we store an array for each unique name
      if (!Array.isArray(matches[name])) {
        matches[name] = [];
      }

      // Only add the line number if it hasn't already been added (prevents duplicates)
      if (!matches[name].includes(index + 1)) {
        matches[name].push(index + 1);
      }
    }
  });
});

console.log("🔍 Scanning for duplicate function names in EncounterScene.js...\n");

let foundDuplicates = false;
for (const [name, occurrences] of Object.entries(matches)) {
  if (occurrences.length > 1) {
    foundDuplicates = true;
    console.log(`⚠️  Function "${name}" is defined ${occurrences.length} times at lines: ${occurrences.join(", ")}`);
  }
}

if (!foundDuplicates) {
  console.log("✅ No duplicate function definitions found!");
}
