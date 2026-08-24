const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

const oldCSS = `
        body::after {
            content: "";
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100vw; height: 100vh;
            background: url('logo_2b.png') no-repeat center center;
            background-size: 100vw 100vh;
            opacity: 0.04;
            pointer-events: none;
            z-index: 0;
            mix-blend-mode: screen; /* This removes the black background */
            filter: grayscale(100%); /* Optional: removes color for a more subtle watermark, or leave color */
        }
`;

const newCSS = `
        body::after {
            content: "";
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100vw; height: 100vh;
            background: url('logo_2b.png') no-repeat center center;
            background-size: 100vw 100vh;
            opacity: 0.2; /* Increased opacity so it's clearly visible */
            pointer-events: none;
            z-index: 0;
            mix-blend-mode: screen; /* This removes the black background */
            /* filter: grayscale removed to keep the beautiful colors! */
        }
`;

if (code.includes('grayscale(100%)')) {
    code = code.replace(oldCSS, newCSS);
    fs.writeFileSync('new_features.js', code, 'utf8');
    console.log('Opacity increased and grayscale removed for body watermark');
} else {
    console.log('Could not find the exact string to replace');
}
