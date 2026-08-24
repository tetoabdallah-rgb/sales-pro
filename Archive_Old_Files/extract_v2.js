const fs = require('fs');
const path = require('path');

const srcFile = 'C:\\Users\\abdallah.ahmed\\Desktop\\sales-pro-dashboard.html';
const content = fs.readFileSync(srcFile, 'utf8');

// 1. Extract CSS
let cssMatch = content.match(/<style>([\s\S]*?)<\/style>/g);
let css = '';
if (cssMatch && cssMatch.length > 1) {
    css = cssMatch[1].replace(/<\/?style>/g, '');
} else if (cssMatch) {
    css = cssMatch[0].replace(/<\/?style>/g, '');
}

// Clean CSS
css = css.replace(/html\s*\{[^}]+\}/g, '');
css = css.replace(/body\s*\{[^}]+\}/g, '');
css = css.replace(/\*\s*\{\s*box-sizing:\s*border-box;\s*\}/g, '');
css = css.replace(/\.app-shell\s*\{[^}]+\}/g, ''); // Remove app-shell layout
css = css.replace(/\.sidebar\s*\{[^}]+\}/g, ''); // Remove sidebar
css = css.replace(/\.main\s*\{[^}]+\}/g, ''); // Remove main
css = css.replace(/\.topbar\s*\{[^}]+\}/g, ''); // Remove topbar

fs.writeFileSync('e:\\AI\\apk\\SalesProWeb\\styles\\dashboard-v2.css', css);
console.log('CSS extracted and saved.');

// 2. Extract Dashboard HTML
let dashMatch = content.match(/<section class="view active" id="view-dashboard">([\s\S]*?)<\/section>\s*<section class="view" id="view-pipeline">/);
if (dashMatch) {
    let dashHtml = dashMatch[1].trim();
    fs.writeFileSync('e:\\AI\\apk\\SalesProWeb\\dash_template.txt', dashHtml);
    console.log('Dashboard HTML extracted and saved.');
} else {
    console.log('Dashboard HTML not found.');
}
