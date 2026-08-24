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
            background-size: min(350px, 80%);
            opacity: 0.05;
            pointer-events: none;
            z-index: 0;
        }
        
        /* Make sure cards and modals have some glassmorphism so the watermark shows elegantly behind them */
        .card, .sp-modal-content {
            background: rgba(15, 23, 42, 0.8) !important;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }
        
        .loader-overlay::after {
            content: "";
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100%; height: 100%;
            background: url('logo_2b.png') no-repeat center center;
            background-size: min(250px, 60%);
            opacity: 0.15;
            pointer-events: none;
            z-index: -1;
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
            background-size: min(600px, 90%);
            opacity: 0.04;
            pointer-events: none;
            z-index: 0;
            mix-blend-mode: screen; /* This removes the black background */
            filter: grayscale(100%); /* Optional: removes color for a more subtle watermark, or leave color */
        }
        
        /* Make sure cards and modals have some glassmorphism so the watermark shows elegantly behind them */
        .card, .sp-modal-content {
            background: rgba(15, 23, 42, 0.75) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05); /* Enhance glass effect */
        }
        
        .loader-overlay::after {
            content: "";
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100%; height: 100%;
            background: url('logo_2b.png') no-repeat center center;
            background-size: min(400px, 80%);
            opacity: 0.4;
            pointer-events: none;
            z-index: -1;
            mix-blend-mode: screen; /* Removes black background */
        }
`;

if (code.includes('min(350px, 80%)')) {
    code = code.replace(oldCSS, newCSS);
    fs.writeFileSync('new_features.js', code, 'utf8');
    console.log('Watermark updated in new_features.js');
} else {
    // regex fallback if exact match fails
    code = code.replace(/body::after\s*\{[^}]+\}/g, `
        body::after {
            content: "";
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100vw; height: 100vh;
            background: url('logo_2b.png') no-repeat center center;
            background-size: min(600px, 90%);
            opacity: 0.06;
            pointer-events: none;
            z-index: 0;
            mix-blend-mode: screen;
        }
    `);
    
    code = code.replace(/\.loader-overlay::after\s*\{[^}]+\}/g, `
        .loader-overlay::after {
            content: "";
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 100%; height: 100%;
            background: url('logo_2b.png') no-repeat center center;
            background-size: min(400px, 80%);
            opacity: 0.5;
            pointer-events: none;
            z-index: -1;
            mix-blend-mode: screen;
        }
    `);
    fs.writeFileSync('new_features.js', code, 'utf8');
    console.log('Watermark updated in new_features.js via fallback');
}
