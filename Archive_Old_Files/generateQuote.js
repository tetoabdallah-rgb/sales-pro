window.generateQuote = function(customerName) {
    let items = JSON.parse(localStorage.getItem('draft_quote') || '[]');
    if(items.length === 0) items = [{desc:'',qty:1,price:0}];
    let modal = document.createElement('div');
    modal.className = 'sp-modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
    
    let renderItems = () => items.map((it, i) => `
        <div style="display:flex;gap:10px;margin-bottom:10px;">
            <input type="text" value="${it.desc}" onchange="window.updateQItem(${i},'desc',this.value)" style="flex:2;padding:8px;" class="sbox" placeholder="الصنف / البيان">
            <input type="number" value="${it.qty}" onchange="window.updateQItem(${i},'qty',this.value)" style="flex:1;padding:8px;" class="sbox" placeholder="الكمية">
            <input type="number" value="${it.price}" onchange="window.updateQItem(${i},'price',this.value)" style="flex:1;padding:8px;" class="sbox" placeholder="السعر">
            <button onclick="window.delQItem(${i})" class="btn" style="background:#f44336;color:white;padding:8px;">X</button>
        </div>
    `).join('');

    window.updateQItem = (i, field, val) => { items[i][field] = val; localStorage.setItem('draft_quote', JSON.stringify(items)); };
    window.addQItem = () => { items.push({desc:'',qty:1,price:0}); document.getElementById('qItemsList').innerHTML = renderItems(); };
    window.delQItem = (i) => { items.splice(i,1); localStorage.setItem('draft_quote', JSON.stringify(items)); document.getElementById('qItemsList').innerHTML = renderItems(); };
    window.closeQModal = () => { if(modal && modal.parentNode) modal.parentNode.removeChild(modal); };
    
    window.printQuote = () => {
        let total = items.reduce((s, it) => s + (it.qty * it.price), 0);
        let printWin = window.open('', '', 'width=800,height=900');
        printWin.document.write(`
            <html dir="rtl"><head><title>عرض سعر - ${customerName}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                .header { border-bottom: 2px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; display:flex; justify-content:space-between; align-items:center; }
                .header h1 { color: #0056b3; margin:0; font-size:2.5rem; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
                th { background-color: #f8f9fa; color: #0056b3; }
                .total { font-size: 1.5em; font-weight: bold; text-align: left; color: #0056b3; padding-top:20px; border-top:2px solid #ddd; }
                .footer { margin-top: 50px; text-align: center; color: #777; font-size: 0.9em; padding-top:20px; border-top:1px solid #ddd; }
                @media print { body { padding:0; margin:0; } }
            </style>
            </head><body>
                <div class="header">
                    <div><h1>عرض سعر</h1><p>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p></div>
                    <div style="text-align:left;"><h3>العميل / ${customerName}</h3><p>عناية السيد المحترم</p></div>
                </div>
                <table>
                    <thead><tr><th>م.</th><th>الصنف / البيان</th><th>الكمية</th><th>السعر (ج.م)</th><th>الإجمالي (ج.م)</th></tr></thead>
                    <tbody>
                        ${items.map((it,idx) => `<tr><td>${idx+1}</td><td>${it.desc}</td><td>${it.qty}</td><td>${fmt(it.price)}</td><td>${fmt(it.qty * it.price)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="total">الإجمالي الكلي: ${fmt(total)} ج.م</div>
                <div class="footer">شكراً لتعاملكم معنا. نتمنى لكم يوماً سعيداً.</div>
            </body></html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => { printWin.print(); printWin.close(); }, 500);
    };

    modal.innerHTML = `
        <div style="background:var(--bg);padding:20px;border-radius:12px;width:90%;max-width:600px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <button onclick="window.closeQModal()" style="position:absolute;top:10px;left:10px;background:none;border:none;font-size:1.5rem;color:var(--tx);cursor:pointer;z-index:9999;">&times;</button>
            <h2 style="margin-bottom:20px;color:var(--p);">إنشاء عرض سعر / ${customerName}</h2>
            <div id="qItemsList" style="margin-bottom:20px;">${renderItems()}</div>
            <button onclick="window.addQItem()" class="btn" style="background:var(--bg2);color:var(--tx);width:100%;margin-bottom:20px;padding:10px;">+ إضافة صنف</button>
            <button onclick="window.printQuote()" class="btn" style="background:var(--p);color:white;width:100%;padding:12px;font-size:1.1rem;font-weight:bold;">طباعة وتحميل عرض السعر (PDF)</button>
        </div>
    `;
    document.body.appendChild(modal);
};
