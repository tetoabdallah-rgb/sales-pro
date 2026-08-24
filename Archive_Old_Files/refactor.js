const fs = require('fs');
const path = require('path');

const htmlPath = 'index.html';
const outHtmlPath = 'index_clean.html';
const cssDir = 'styles';
const jsDir = 'scripts';
const cssPath = path.join(cssDir, 'main.css');
const jsPath = path.join(jsDir, 'main.js');

if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir);
if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir);

let content = fs.readFileSync(htmlPath, 'utf8');

// Extract styles
const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let styles = [];
let match;
while ((match = styleRegex.exec(content)) !== null) {
    styles.push(match[1]);
}
fs.writeFileSync(cssPath, styles.join('\n\n'));

let firstStyle = true;
content = content.replace(styleRegex, (match) => {
    if (firstStyle) {
        firstStyle = false;
        return '<link rel="stylesheet" href="styles/main.css">';
    }
    return '';
});

// Extract inline scripts
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let scripts = [];
while ((match = scriptRegex.exec(content)) !== null) {
    scripts.push(match[1]);
}
fs.writeFileSync(jsPath, scripts.join('\n\n'));

content = content.replace(scriptRegex, '');

// Insert script tag before </body>
content = content.replace(/<\/body>/i, '<script src="scripts/main.js"></script>\n</body>');

fs.writeFileSync(outHtmlPath, content, 'utf8');

console.log(`Extraction complete!`);
console.log(`CSS size: ${fs.statSync(cssPath).size}`);
console.log(`JS size: ${fs.statSync(jsPath).size}`);
console.log(`Clean HTML size: ${fs.statSync(outHtmlPath).size}`);
