const fs = require('fs');

['index.html', 'index_restored.html'].forEach(f => {
    if (!fs.existsSync(f)) return;
    let c = fs.readFileSync(f, 'utf8');
    let idx = c.indexOf('id="bDriveJSON"');
    if (idx !== -1) {
        let endBtn = c.indexOf('</button>', idx) + 9;
        let before = c.substring(0, endBtn);
        let after = c.substring(endBtn);
        let card = `
                <div style="margin-top:14px;padding:12px 16px;background:rgba(16, 185, 129, 0.12);border:1px solid #10b981;border-radius:12px;text-align:center;">
                    <div style="color:#10b981;font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:6px;">
                        <span>⏱️</span> النسخ الاحتياطي التلقائي لجوجل درايف (كل 15 دقيقة): مفعل ✅
                    </div>
                    <div style="color:var(--tx2);font-size:0.75rem;margin-top:4px;">يقوم النظام بحفظ ورفع نسخة أمان تلقائياً إلى حسابك في جوجل درايف كل ربع ساعة في الخلفية دون تدخل منك.</div>
                </div>`;
        if (!c.includes('النسخ الاحتياطي التلقائي لجوجل درايف')) {
            c = before + card + after;
            fs.writeFileSync(f, c);
            console.log('Successfully added auto-backup card to', f);
        } else {
            console.log('Auto-backup card already present in', f);
        }
    }
});
