const fs = require('fs');
const jsPath = 'scripts/main.js';
let content = fs.readFileSync(jsPath, 'utf8');

// The old regex (without /g) only replaced the first instance.
// Now I'll find any remaining instances of the old To-Do code and remove them.
const oldRegex = /\/\/ 1\. Full-Page To-Do \/ Tasks Tab \(Enterprise V8\)[\s\S]*?window\.toggleTodoStatus\s*=\s*function\(idx\)\s*{[\s\S]*?};\s*/g;

// Since I already replaced the first instance with "1. Full-Page Kanban Tasks Board", 
// this regex will only match the duplicate OLD instances because they say "To-Do / Tasks Tab".
let matchCount = 0;
content = content.replace(oldRegex, (match) => {
    matchCount++;
    return ''; // Remove the duplicate old block entirely
});

fs.writeFileSync(jsPath, content, 'utf8');
console.log("Removed " + matchCount + " duplicate old To-Do block(s).");
