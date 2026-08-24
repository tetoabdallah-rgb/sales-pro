const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

// 1. Remove background logo entirely
code = code.replace(/background:\s*url\('logo_2b\.png'\)[^;]*;/g, "background: none;");

// 2. Add cutout: '40%' and padding to doughnut charts
// In options: { responsive: true, maintainAspectRatio: false...
code = code.replace(/options:\s*\{\s*responsive:\s*true,\s*maintainAspectRatio:\s*false/g, "options: { responsive: true, maintainAspectRatio: false, cutout: '45%', layout: { padding: 15 }");

fs.writeFileSync('new_features.js', code, 'utf8');
console.log("Charts and logo fixed.");
