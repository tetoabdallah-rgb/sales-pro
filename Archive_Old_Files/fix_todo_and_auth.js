const fs = require('fs');

// 1. Fix style.css for todo-float-btn position
if (fs.existsSync('style.css')) {
    let css = fs.readFileSync('style.css', 'utf8');
    // Ensure it is safely at bottom: 24px; left: 24px; (away from right sidebar and top header)
    css = css.replace(/bottom:\s*80px;\s*right:\s*22px;/g, 'bottom: 24px; left: 24px;');
    css = css.replace(/bottom:\s*[0-9]+px;\s*(right|left):\s*[0-9]+px;/g, 'bottom: 24px; left: 24px;');
    fs.writeFileSync('style.css', css);
    console.log('Updated style.css for todo-float-btn position to bottom: 24px; left: 24px;');
}

// 2. Fix index.html and index_restored.html so todoFloatBtn is hidden by default and hidden on auth screen
['index.html', 'index_restored.html'].forEach(f => {
    if (!fs.existsSync(f)) return;
    let c = fs.readFileSync(f, 'utf8');
    
    // Make todoFloatBtn display:none by default in HTML
    if (c.includes('id="todoFloatBtn"')) {
        c = c.replace(/<div class="todo-float-btn" id="todoFloatBtn"[^>]*>/g, '<div class="todo-float-btn" id="todoFloatBtn" onclick="toggleTodoDrawer()" title="مفكرة المهام السريعة" style="display:none;">');
        console.log('Set todoFloatBtn display:none by default in', f);
    }
    
    // In auth state changed: show when user is logged in, hide when logged out
    let loginShow = `        $('AUTH').classList.add('hidden');
        $('APP').classList.remove('hidden');
        $('APP').style.display = 'flex';
        if($('todoFloatBtn')) $('todoFloatBtn').style.display = 'flex';`;
        
    let loginHide = `        $('AUTH').classList.remove('hidden');
        $('APP').classList.add('hidden');
        $('APP').style.display = 'none';
        if($('todoFloatBtn')) $('todoFloatBtn').style.display = 'none';
        if($('todoDrawer')) $('todoDrawer').style.display = 'none';
        if($('todoOverlay')) $('todoOverlay').style.display = 'none';`;
        
    if (c.includes("$('APP').style.display = 'flex';")) {
        c = c.replace(/\$\('APP'\)\.style\.display = 'flex';(?!\s*if\(\$\('todoFloatBtn'\)\))/g, "$('APP').style.display = 'flex';\n        if($('todoFloatBtn')) $('todoFloatBtn').style.display = 'flex';");
    }
    if (c.includes("$('APP').style.display = 'none';")) {
        c = c.replace(/\$\('APP'\)\.style\.display = 'none';(?!\s*if\(\$\('todoFloatBtn'\)\))/g, "$('APP').style.display = 'none';\n        if($('todoFloatBtn')) $('todoFloatBtn').style.display = 'none';\n        if($('todoDrawer')) $('todoDrawer').style.display = 'none';\n        if($('todoOverlay')) $('todoOverlay').style.display = 'none';");
    }
    
    fs.writeFileSync(f, c);
    console.log('Updated auth visibility logic in', f);
});
