const fs = require('fs');

let c = fs.readFileSync('index.html', 'utf8');

// --- 1. Fix rDash ---
let startStr = "    let allReps = [...new Set(S.map(r => getRowVal(r, ['Sales Person', 'Rep', 'Salesman'])).filter(Boolean))].sort();";
let startIndex = c.indexOf(startStr);
if (startIndex === -1) {
    console.error("Could not find start in index.html");
    process.exit(1);
}

let endStr = "    // Attach filter events";
let endIndex = c.indexOf(endStr, startIndex);
if (endIndex === -1) {
    console.error("Could not find end in index.html");
    process.exit(1);
}

let slice = c.substring(startIndex, endIndex);

let correctCode = `    let allReps = [...new Set(S.map(r => getRowVal(r, ['Sales Person', 'Rep', 'Salesman'])).filter(Boolean))].sort();
    let allCats = [...new Set(S.map(r => getRowVal(r, ['Item Class Name', 'Category', 'category'])).filter(Boolean))].sort();
    
    let repOptions = \`<option value="">\${L==='ar'?'كل المناديب':'All Reps'}</option>\` + allReps.map(r => \`<option value="\${r}" \${globalRepFilter===r?'selected':''}>\${r}</option>\`).join('');
    let catOptions = \`<option value="">\${L==='ar'?'كل الفئات':'All Categories'}</option>\` + allCats.map(c => \`<option value="\${c}" \${globalCatFilter===c?'selected':''}>\${c}</option>\`).join('');

    let dateFilterUI = \`
        <div style="display:flex;gap:10px;align-items:center;background:var(--bg3);padding:8px 16px;border-radius:12px;border:1px solid var(--bd);flex-wrap:wrap;">
            <button onclick="if(typeof sendDailyReportNow==='function')sendDailyReportNow(false);" class="btn" style="background:#10b981;color:#fff;font-weight:bold;padding:6px 12px;font-size:0.75rem;display:flex;align-items:center;gap:4px;cursor:pointer;" title="\${L==='ar'?'إرسال تقرير المبيعات والتحصيلات إلى إيميلك الآن':'Send Report to Email'}">📧 \${L==='ar'?'إرسال التقرير للإيميل':'Email Report'}</button>
            <span style="color:var(--bd);margin:0 4px;">|</span>
            <select id="dfRep" class="sbox" style="padding:6px;width:130px;font-size:0.7rem;">\${repOptions}</select>
            <select id="dfCat" class="sbox" style="padding:6px;width:130px;font-size:0.7rem;">\${catOptions}</select>
            <span style="color:var(--bd);margin:0 4px;">|</span>
            <label style="font-size:0.7rem;font-weight:bold;">\${L==='ar'?TUI('From'):'From'}:</label>
            <input type="date" id="dfStart" class="sbox" style="padding:6px;width:120px;" value="\${globalDateRange.start||''}">
            <label style="font-size:0.7rem;font-weight:bold;">\${L==='ar'?TUI('To'):'To'}:</label>
            <input type="date" id="dfEnd" class="sbox" style="padding:6px;width:120px;" value="\${globalDateRange.end||''}">
            <button id="bDateClear" class="btn" style="padding:6px 10px;font-size:0.7rem;" title="\${L==='ar'?'مسح الفلاتر':'Clear Filters'}">❌</button>
            <span style="color:var(--bd);margin:0 4px;">|</span>
            <button id="bPdfExport" class="btn" style="background:#ef4444;color:#fff;font-weight:bold;padding:6px 12px;font-size:0.75rem;display:flex;align-items:center;gap:4px;cursor:pointer;" title="\${L==='ar'?'تصدير PDF':'Export PDF'}">📄 PDF</button>
        </div>
    \`;
    
    let maxD = 0; ds.forEach(r => { let d = new Date(pd(r['Order Date'])).getTime(); if(!isNaN(d) && d>maxD) maxD=d; });
    let cuD = {}; ds.forEach(r => { let cust = r.Customer; if(!cust) return; let d = pd(r['Order Date']); if(!cuD[cust] || d > cuD[cust]) cuD[cust]=d; });
    let dormantCount = 0; let ttD = maxD>0?maxD:new Date().getTime();
    Object.values(cuD).forEach(v => { let t = new Date(v).getTime(); if(!isNaN(t) && Math.floor((ttD-t)/86400000)>=60) dormantCount++; });

    let dormantCard = \`
    <div class="card" style="margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:linear-gradient(to right, rgba(231,76,60,0.05), transparent); border-left:4px solid var(--rd); box-shadow:0 4px 12px rgba(0,0,0,0.05);" onclick="nav('dormant')">
        <div style="display:flex; align-items:center; gap:16px;">
            <div style="font-size:2rem; width:50px; height:50px; background:var(--rd); color:white; border-radius:12px; display:flex; align-items:center; justify-content:center;">\${ICONS.dormant}</div>
            <div>
                <h3 style="margin:0 0 4px; color:var(--tx1);">\${L==='ar'?'العملاء الخاملين':'Dormant Customers'}</h3>
                <div style="color:var(--tx2); font-size:0.9rem;">\${L==='ar'?'إضغط هنا لمشاهدة قائمة العملاء المنقطعين منذ 60 يوم':'Click to view customers with no orders in 60+ days'}</div>
            </div>
        </div>
        <div style="font-size:1.8rem; font-weight:900; color:var(--rd);">\${dormantCount}</div>
    </div>\`;

    $('M').innerHTML = \`
        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">\${ICONS.dash}</span> \${t('dash')}</h1>
            \${dateFilterUI}
        </div>
        
        \${dormantCard}
        
        <div class="kg">
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">\${aFmt(ts)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Profit'):'Profit'}</div><div class="vl">\${aFmt(tp)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Margin'):'Margin'}</div><div class="vl">\${aFmt(ts>0?tp/ts*100:0,true)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Target'):'Target'}</div><div class="vl">\${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Ach.'):'Ach.'}</div><div class="vl">\${aFmt(ap,true)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Cust.'):'Cust.'}</div><div class="vl">\${aFmt(Object.keys(cu).length)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?'تحصيل إكسسوارات':'Acc Coll.'}</div><div class="vl">\${aFmt(accTot)}</div></div>
            <div class="ki"><div class="lb">\${L==='ar'?'تحصيل هاردوير':'HW Coll.'}</div><div class="vl">\${aFmt(hwTot)}</div></div>
        </div>
        
        <div class="rg">\${ring(L==='ar'?TUI('Sales'):'Sales', ap, ts)}\${ring(L==='ar'?TUI('Profit'):'Profit', pp, tp)}</div>
        
        <div class="cg">
            <div class="cc"><h3>\${L==='ar'?TUI('Daily'):'Daily'}</h3><div class="cw"><canvas id="cD"></canvas></div></div>
            <div class="cc"><h3>\${L==='ar'?TUI('Cats'):'Cats'}</h3><div class="cw"><canvas id="cC"></canvas></div></div>
        </div>
    \`;
    
`;

c = c.replace(slice, correctCode);

// --- 2. Fix rDorm ---
let startDormStr = "function rDorm() {";
let startIndexDorm = c.indexOf(startDormStr);
let endDormStr = "function rPros() {";
let endIndexDorm = c.indexOf(endDormStr, startIndexDorm);
if (startIndexDorm !== -1 && endIndexDorm !== -1) {
    let oldDorm = c.substring(startIndexDorm, endIndexDorm);
    let newDorm = oldDorm.replace(
        "if(!cu[c]) cu[c] = {last: dStr, s: 0};",
        "let ph = r['Phone']||r['Mobile']||r['رقم الموبايل']||r['التليفون']||'';\\n        if(!cu[c]) cu[c] = {last: dStr, s: 0, phone: ph};"
    );
    newDorm = newDorm.replace(
        "return {n, last: data.last, days, s: data.s};",
        "return {n, last: data.last, days, s: data.s, phone: data.phone};"
    );
    
    let oldTable = "<div class=\\"tbs\\"><table><thead><tr><th>\\${L==='ar'?TUI('Customer'):'Customer'}</th><th>\\${L==='ar'?TUI('Total Sales'):'Total Sales'}</th><th>\\${L==='ar'?TUI('Last Purchase'):'Last Purchase'}</th><th>\\${L==='ar'?TUI('Days Ago'):'Days Ago'}</th><th>\\${L==='ar'?TUI('Status'):'Status'}</th></tr></thead>\\n        <tbody>\\${dormant.map(r=>`<tr><td><strong>\\${r.n}</strong></td><td>\\${fmt(r.s)}</td><td>\\${r.last}</td><td>\\${r.days}</td><td><span class=\\"badge \\${r.days>=120?'bg-r':'bg-a'}\\">\\${r.days>=120?(L==='ar'?TUI('Lost'):'Lost'):(L==='ar'?TUI('Dormant'):'Dormant')}</span></td></tr>`).join('')}</tbody>";
    
    let newTable = "<div style=\\"display:flex;gap:8px;margin-bottom:12px;justify-content:flex-end;\\">\\n<button class=\\"btn export-btn\\" onclick=\\"exportTableToExcel('dormantTable', 'Dormant_Customers')\\">📥 Excel</button>\\n<button class=\\"btn export-btn\\" style=\\"background:var(--rdl); color:var(--rd); border-color:var(--rd);\\" onclick=\\"exportTableToPDF('dormantTable', 'Dormant_Customers')\\">📄 Export PDF</button>\\n</div>\\n<div class=\\"tbs\\"><table id=\\"dormantTable\\"><thead><tr><th>\\${L==='ar'?TUI('Customer'):'Customer'}</th><th>\\${L==='ar'?TUI('Total Sales'):'Total Sales'}</th><th>\\${L==='ar'?TUI('Phone'):'Phone'}</th><th>\\${L==='ar'?TUI('Last Purchase'):'Last Purchase'}</th><th>\\${L==='ar'?TUI('Days Ago'):'Days Ago'}</th><th>\\${L==='ar'?TUI('Status'):'Status'}</th></tr></thead>\\n        <tbody>\\${dormant.map(r=>`<tr><td><strong>\\${r.n}</strong></td><td>\\${fmt(r.s)}</td><td>\\${r.phone||''}</td><td>\\${r.last}</td><td>\\${r.days}</td><td><span class=\\"badge \\${r.days>=120?'bg-r':'bg-a'}\\">\\${r.days>=120?(L==='ar'?TUI('Lost'):'Lost'):(L==='ar'?TUI('Dormant'):'Dormant')}</span></td></tr>`).join('')}</tbody>";

    // Since exact spacing might vary, let's use a simpler replace strategy for the table
    let tableRegex = /<div class="tbs"><table><thead><tr><th>\$\{L==='ar'\?TUI\('Customer'\):'Customer'\}.*?<\/tbody>/s;
    newDorm = newDorm.replace(tableRegex, newTable);
    
    c = c.replace(oldDorm, newDorm);
}

// WhatsApp patch for dormant
c = c.replace(
    "if(P === 'sales' || P === 'customers' || P === 'collections') {",
    "if(P === 'sales' || P === 'customers' || P === 'collections' || P === 'dormant') {"
);

fs.writeFileSync('index.html', c);
console.log('index.html successfully fixed!');
