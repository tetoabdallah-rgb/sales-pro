const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

const fontToggleScript = `
// --- FONT SIZE TOGGLER ---
(function initFontResizer() {
    if(document.getElementById('font-resizer-btn')) return;
    
    // Default size is 0 (normal)
    let currentSize = parseInt(localStorage.getItem('sp_font_size') || '0');
    const sizes = ['16px', '18px', '20px'];
    
    function applySize() {
        document.documentElement.style.fontSize = sizes[currentSize];
    }
    applySize();
    
    let btn = document.createElement('div');
    btn.id = 'font-resizer-btn';
    btn.innerHTML = 'Aa';
    btn.style.cssText = \`
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 45px;
        height: 45px;
        background: var(--ac, #4285F4);
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        z-index: 9999;
        transition: transform 0.2s, background 0.2s;
        user-select: none;
    \`;
    
    btn.onclick = () => {
        currentSize = (currentSize + 1) % sizes.length;
        localStorage.setItem('sp_font_size', currentSize);
        applySize();
        
        // simple animation
        btn.style.transform = 'scale(0.8)';
        setTimeout(() => btn.style.transform = 'scale(1)', 150);
        
        if (typeof toast === 'function') {
            let labels = ['خط عادي', 'خط كبير', 'خط كبير جداً'];
            toast(labels[currentSize]);
        }
    };
    
    document.body.appendChild(btn);
})();
`;

if (!code.includes('font-resizer-btn')) {
    code += '\n\n' + fontToggleScript;
    fs.writeFileSync('new_features.js', code, 'utf8');
    console.log('Font resizer injected into new_features.js');
}
