const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

const watermarkCSS = `
// --- UI STYLES ---
(function injectStyles() {
    if(document.getElementById('sp-new-features-css')) return;
    let style = document.createElement('style');
    style.id = 'sp-new-features-css';
    style.innerHTML = \`
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

        .sp-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
            display: flex; justify-content: center; align-items: center; z-index: 9999;
            opacity: 0; animation: spFadeIn 0.3s forwards;
        }
        .sp-modal-content {
            width: 90%; max-width: 450px;
            border-radius: 16px; padding: 24px; position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            transform: translateY(20px); animation: spSlideUp 0.3s forwards;
            border: 1px solid var(--bd);
        }
        .sp-modal-close {
            position: absolute; top: 16px; left: 16px; cursor: pointer;
            font-size: 1.5rem; color: var(--tx3); line-height: 1;
        }
        .sp-modal-close:hover { color: var(--rd); }
        @keyframes spFadeIn { to { opacity: 1; } }
        @keyframes spSlideUp { to { transform: translateY(0); } }
        
        .sp-form-label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--tx2); font-size: 0.9rem; }
        .sp-form-input { 
            width: 100%; padding: 12px; margin-bottom: 16px; 
            background: var(--bg3); border: 1px solid var(--bd); 
            color: var(--tx1); border-radius: 8px; font-family: inherit;
        }
        .sp-form-input:focus { border-color: var(--ac); outline: none; }
        .sp-btn-primary {
            width: 100%; padding: 12px; background: var(--ac); color: #fff;
            border: none; border-radius: 8px; font-weight: bold; cursor: pointer;
            transition: opacity 0.2s;
        }
        .sp-btn-primary:hover { opacity: 0.9; }
    \`;
    document.head.appendChild(style);
})();
`;

// we need to replace the old styles block which ends before `// --- VISITS ---`
const startIndex = code.indexOf('// --- UI STYLES ---');
const endIndex = code.indexOf('// --- VISITS ---');

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + watermarkCSS + '\n' + code.substring(endIndex);
    fs.writeFileSync('new_features.js', code, 'utf8');
    console.log('Watermark styles injected');
} else {
    console.log('Could not find injection boundaries');
}
