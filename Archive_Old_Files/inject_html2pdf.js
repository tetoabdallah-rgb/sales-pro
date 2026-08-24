const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

if (!code.includes('html2pdf.bundle.min.js')) {
    code = code.replace('</head>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>\n</head>');
    fs.writeFileSync('index.html', code, 'utf8');
    console.log("Injected html2pdf.");
} else {
    console.log("html2pdf already exists.");
}
