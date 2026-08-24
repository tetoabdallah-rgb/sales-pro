const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const confettiScript = `<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>`;

if (!code.includes('canvas-confetti')) {
    code = code.replace('</head>', `  ${confettiScript}\n</head>`);
    fs.writeFileSync('index.html', code, 'utf8');
    console.log('canvas-confetti injected');
} else {
    console.log('canvas-confetti already exists');
}
