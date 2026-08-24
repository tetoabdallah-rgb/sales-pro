const fs = require('fs');

['index.html', 'index_restored.html'].forEach(f => {
    if (!fs.existsSync(f)) return;
    let c = fs.readFileSync(f, 'utf8');
    
    // 1. Add missing CSS for Floating To-Do Drawer and Button into <style>
    let todoCSS = `
/* Floating To-Do Drawer Styles */
.todo-float-btn {
    position: fixed !important;
    bottom: 24px !important;
    left: 24px !important;
    background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
    color: #fff !important;
    width: 56px !important;
    height: 56px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 1.6rem !important;
    box-shadow: 0 8px 24px rgba(79, 70, 229, 0.45) !important;
    cursor: pointer !important;
    z-index: 9000 !important;
    transition: transform 0.25s, box-shadow 0.25s !important;
    user-select: none;
}
.todo-float-btn:hover {
    transform: scale(1.1) rotate(5deg) !important;
    box-shadow: 0 12px 30px rgba(79, 70, 229, 0.6) !important;
}
.todo-overlay {
    position: fixed !important;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5) !important;
    backdrop-filter: blur(4px) !important;
    z-index: 9001 !important;
    display: none;
    opacity: 0;
    transition: opacity 0.3s !important;
}
.todo-drawer {
    position: fixed !important;
    bottom: 0; left: 0; width: 100%; max-width: 400px; height: 80vh;
    background: var(--bg) !important;
    border-top-right-radius: 20px !important;
    border-bottom-right-radius: 20px !important;
    box-shadow: 20px 0 50px rgba(0,0,0,0.3) !important;
    z-index: 9002 !important;
    padding: 20px !important;
    display: flex !important;
    flex-direction: column !important;
    transform: translateX(-110%) !important;
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
    border-right: 1px solid var(--bd) !important;
}
.todo-drawer.open {
    transform: translateX(0) !important;
}
`;

    if (!c.includes('.todo-float-btn {')) {
        c = c.replace('</style>', todoCSS + '\n</style>');
        console.log('Added missing To-Do CSS to', f);
    }
    
    // 2. Add OS Startup splash screen trigger on auth state change (login/session restore)
    let osTrigger = `
        // Show macOS / Windows OS Startup Splash Screen upon user authentication
        let over = document.getElementById('osStartupOverlay');
        if (over && !window.osShownAfterAuth) {
            window.osShownAfterAuth = true;
            over.style.display = 'flex';
            over.style.opacity = '1';
            over.style.transform = 'scale(1)';
            let prog = document.getElementById('osStartProgress');
            let stat = document.getElementById('osStartStatus');
            if(prog) prog.style.width = '30%';
            if(stat) stat.textContent = 'جاري تسجيل الدخول ومزامنة بياناتك...';
            
            setTimeout(() => {
                if(prog) prog.style.width = '70%';
                if(stat) stat.textContent = 'تجهيز واجهة المبيعات والأيقونات الذكية (3D)...';
            }, 500);
            
            setTimeout(() => {
                if(prog) prog.style.width = '100%';
                if(stat) stat.textContent = '✅ مرحباً بك في واجهة المبيعات الملكية!';
            }, 1000);
            
            setTimeout(() => {
                over.style.opacity = '0';
                over.style.transform = 'scale(1.08)';
                setTimeout(() => { over.style.display = 'none'; }, 600);
            }, 1400);
        }
`;

    if (c.includes("$('AUTH').classList.add('hidden');") && !c.includes('osShownAfterAuth')) {
        c = c.replace("$('AUTH').classList.add('hidden');", "$('AUTH').classList.add('hidden');" + osTrigger);
        console.log('Added OS Splash Screen auth trigger to', f);
    }
    
    fs.writeFileSync(f, c);
    console.log('Successfully saved', f);
});
