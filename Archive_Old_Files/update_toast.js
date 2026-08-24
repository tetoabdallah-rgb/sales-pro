const fs = require('fs');
const jsPath = 'scripts/main.js';
let content = fs.readFileSync(jsPath, 'utf8');

const targetFunctionRegex = /window\.toast\s*=\s*function\(msg,\s*type\s*=\s*'info'\)\s*{[\s\S]*?};\s*/;

const newToast = `window.toast = function(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:10px;z-index:9999;pointer-events:none;';
        document.body.appendChild(container);
    }
    
    let t = document.createElement('div');
    t.className = 'toast show ' + type;
    t.textContent = msg;
    t.style.cssText = 'background:var(--bg4);color:var(--tx1);padding:12px 24px;border-radius:12px;box-shadow:var(--sh-lg);backdrop-filter:var(--glass);border:1px solid var(--bd);opacity:0;transform:translateY(20px);transition:all 0.4s ease-out;';
    
    if (type === 'error') t.style.borderLeft = '4px solid var(--rd)';
    else if (type === 'success') t.style.borderLeft = '4px solid var(--gn)';
    else if (type === 'warning') t.style.borderLeft = '4px solid var(--am)';
    else t.style.borderLeft = '4px solid var(--ac)';

    container.appendChild(t);
    
    // Animate in
    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-20px)';
        setTimeout(() => t.remove(), 400);
    }, 3000);
};\n`;

if (targetFunctionRegex.test(content)) {
    content = content.replace(targetFunctionRegex, newToast);
    fs.writeFileSync(jsPath, content, 'utf8');
    console.log("Successfully updated toast system.");
} else {
    console.log("Could not find window.toast function.");
}
