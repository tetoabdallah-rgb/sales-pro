const fs = require('fs');
let html = fs.readFileSync('index_restored.html', 'utf8');

// 1. HEAD (PDF)
html = html.replace(
    `    <title>Sales Pro Enterprise - Sales Pro</title>`,
    `    <title>Sales Pro Enterprise - Sales Pro</title>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>`
);

// 2. PWA
html = html.replace(
    `</head>`,
    `    <link rel="manifest" href="manifest.json">\n</head>`
);
html = html.replace(
    `</body>`,
    `<script>\n  if ('serviceWorker' in navigator) {\n    window.addEventListener('load', () => {\n      navigator.serviceWorker.register('sw.js');\n    });\n  }\n</script>\n</body>`
);

// 3. Currency Globals
html = html.replace(
    `let L = localStorage.getItem('sp_lang') || 'ar';\nL = L.replace(/"/g, '');`,
    `let L = localStorage.getItem('sp_lang') || 'ar';\nlet CURR = localStorage.getItem('SalesPro_Currency') || '';\nL = L.replace(/"/g, '');`
);

// 4. Formatters
html = html.replace(
    `function fmt(n) { return (n == null || isNaN(n)) ? '0' : Number(n).toLocaleString('en-US', {maximumFractionDigits: 0}); }\nfunction pc(n) { return (n == null || isNaN(n)) ? '0%' : Number(n).toFixed(1) + '%'; }\nfunction aFmt(n, isPc) { return \`<span class="anm" data-v="\${n}"\${isPc ? ' data-p="1"' : ''}>\${isPc ? '0%' : '0'}</span>\`; }`,
    `function fmt(n) { \n    let f = (n == null || isNaN(n)) ? '0' : Number(n).toLocaleString('en-US', {maximumFractionDigits: 0}); \n    return CURR ? f + ' ' + CURR : f;\n}\nfunction pc(n) { return (n == null || isNaN(n)) ? '0%' : Number(n).toFixed(1) + '%'; }\nfunction aFmt(n, isPc, isCurr=true) { \n    let c = (isCurr && !isPc && CURR) ? \` \${CURR}\` : '';\n    return \`<span class="anm" data-v="\${n}"\${isPc ? ' data-p="1"' : ''}\${c ? \` data-c="\${c}"\` : ''}>\${isPc ? '0%' : '0'+c}</span>\`; \n}`
);

// 5. rDash Calc
html = html.replace(
    `    let ds = getFilteredSales();\n    let ts = 0, tp = 0, tt = 0, tpt = 0;\n    \n    ds.forEach(r => { ts += getSalesVal(r); tp += getProfitVal(r); });`,
    `    let ds = getFilteredSales();\n    let ts = 0, tp = 0, tt = 0, tpt = 0;\n    ds.forEach(r => { ts += getSalesVal(r); tp += getProfitVal(r); });\n\n    let prevSales = 0;\n    if(S && S.length > 0) {\n        if (globalDateRange.start && globalDateRange.end) {\n            let s= globalDateRange.start;\n            let e = globalDateRange.end;\n            let sDate = new Date(s);\n            let eDate = new Date(e);\n            let pEnd = new Date(sDate.getTime() - 86400000);\n            let pStart = new Date(pEnd.getTime() - (eDate - sDate));\n            let pStartStr = \`\${pStart.getFullYear()}-\${String(pStart.getMonth()+1).padStart(2,'0')}-\${String(pStart.getDate()).padStart(2,'0')}\`;\n            let pEndStr = \`\${pEnd.getFullYear()}-\${String(pEnd.getMonth()+1).padStart(2,'0')}-\${String(pEnd.getDate()).padStart(2,'0')}\`;\n            S.forEach(r => {\n                let d = pd(r['Order Date']);\n                if(d && d >= pStartStr && d <= pEndStr) prevSales += getSalesVal(r);\n            });\n        } else {\n            let now = new Date();\n            let pEnd = new Date(now.getFullYear(), now.getMonth(), 0);\n            let pStart = new Date(pEnd.getFullYear(), pEnd.getMonth(), 1);\n            let pStartStr = \`\${pStart.getFullYear()}-\${String(pStart.getMonth()+1).padStart(2,'0')}-\${String(pStart.getDate()).padStart(2,'0')}\`;\n            let pEndStr = \`\${pEnd.getFullYear()}-\${String(pEnd.getMonth()+1).padStart(2,'0')}-\${String(pEnd.getDate()).padStart(2,'0')}\`;\n            S.forEach(r => {\n                let d = pd(r['Order Date']);\n                if(d && d >= pStartStr && d <= pEndStr) prevSales += getSalesVal(r);\n            });\n        }\n    }\n    let trendHtml = '';\n    if (ts > 0 && prevSales > 0) {\n        let diffPct = ((ts - prevSales) / prevSales) * 100;\n        let c = diffPct >= 0 ? 'var(--gr)' : 'var(--rd)';\n        let a = diffPct >= 0 ? '&#x25B2;' : '&#x25BC;';\n        trendHtml = \`<span style="color:\${c};font-size:0.6rem;margin-left:5px;background:var(--bg3);padding:2px 4px;border-radius:4px;">\${a} \${Math.abs(diffPct).toFixed(1)}%</span>\`;\n    }`
);

// 6. rDash Header
html = html.replace(
    `    $('M').innerHTML = \`\n        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">\n            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">\${ICONS.dash}</span> \${t('dash')}</h1>\n            \${dateFilterUI}\n        </div>\n        <div class="kg">\n            <div class="ki"><div class="lb">\${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">\${aFmt(ts)}</div></div>\n            <div class="ki"><div class="lb">\${L==='ar'?TUI('Profit'):'Profit'}</div><div class="vl">\${aFmt(tp)}</div></div>`,
    `    $('M').innerHTML = \`\n        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">\n            <div style="display:flex;align-items:center;gap:12px;">\n                <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">\${ICONS.dash}</span> \${t('dash')}</h1>\n                <button id="bPdfExport" class="btn" style="padding:4px 8px;font-size:0.7rem;" title="\${L==='ar'?'تصدير PDF':'Export PDF'}">&#x1F5C4; PDF</button>\n            </div>\n            \${dateFilterUI}\n        </div>\n        <div class="kg">\n            <div class="ki"><div class="lb" style="display:flex;align-items:center;">\${L==='ar'?TUI('Sales'):'Sales'}\${trendHtml}</div><div class="vl">\${aFmt(ts)}</div></div>\n            <div class="ki"><div class="lb">\${L==='ar'?TUI('Profit'):'Profit'}</div><div class="vl">\${aFmt(tp)}</div></div>`
);

// 7. rDash pdf logic
html = html.replace(
    `    $('bDateClear').onclick = () => {`,
    `    if($('bPdfExport')) $('bPdfExport').onclick = () => {\n        let element = $('M');\n        html2pdf().set({\n            margin: 10,\n            filename: 'Sales_Dashboard.pdf',\n            image: { type: 'jpeg', quality: 0.98 },\n            html2canvas: { scale: 2 },\n            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }\n        }).from(element).save();\n    };\n\n    $('bDateClear').onclick = () => {`
);

// 8. Currency UI in rSettings
html = html.replace(
    `        <div class="card" style="margin-bottom:20px;">\n            <h3>🎨 \${L==='ar'?'اللون الأساسي':'Primary Color'}</h3>\n            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">\${L==='ar'?'اختر اللون الذي يناسب ذوقك':'Choose the color that fits you'}</p>`,
    `        <div class="card" style="margin-bottom:20px;">\n            <h3>💰 \${L==='ar'?'العملة':'Currency'}</h3>\n            <div style="display:flex;gap:12px;margin-bottom:12px;">\n                <select id="currSelect" class="sbox" style="width:200px;padding:8px;">\n                    <option value="" \${CURR===''?'selected':''}>\${L==='ar'?'بدون عملة':'None'}</option>\n                    <option value="EGP" \${CURR==='EGP'?'selected':''}>EGP (جنيه)</option>\n                    <option value="SAR" \${CURR==='SAR'?'selected':''}>SAR (ريال)</option>\n                    <option value="AED" \${CURR==='AED'?'selected':''}>AED (درهم)</option>\n                    <option value="$" \${CURR==='$'?'selected':''}>$ (USD)</option>\n                    <option value="€" \${CURR==='€'?'selected':''}>€ (EUR)</option>\n                </select>\n                <button class="btn" onclick="localStorage.setItem('SalesPro_Currency', $('currSelect').value); CURR=$('currSelect').value; render();">\${L==='ar'?'حفظ':'Save'}</button>\n            </div>\n        </div>\n        \n        <div class="card" style="margin-bottom:20px;">\n            <h3>🎨 \${L==='ar'?'اللون الأساسي':'Primary Color'}</h3>\n            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">\${L==='ar'?'اختر اللون الذي يناسب ذوقك':'Choose the color that fits you'}</p>`
);

// 9. Animation logic
html = html.replace(
    `            let p = Math.min((t - st) / d, 1);\n            el.textContent = el.getAttribute('data-p') ? pc(p * e) : fmt(Math.floor(p * e));\n            if(p < 1) requestAnimationFrame(r);\n            else el.textContent = el.getAttribute('data-p') ? pc(e) : fmt(e);`,
    `            let p = Math.min((t - st) / d, 1);\n            let cStr = el.getAttribute('data-c') || '';\n            let val = el.getAttribute('data-p') ? pc(p * e) : fmt(Math.floor(p * e));\n            if(!el.getAttribute('data-p') && CURR) val = val.replace(CURR, '').trim() + ' ' + CURR;\n            el.textContent = val;\n            if(p < 1) requestAnimationFrame(r);\n            else {\n                let finalVal = el.getAttribute('data-p') ? pc(e) : fmt(e);\n                if(!el.getAttribute('data-p') && CURR) finalVal = finalVal.replace(CURR, '').trim() + ' ' + CURR;\n                el.textContent = finalVal;\n            }`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Patched correctly');
