const fs = require('fs');

let c = fs.readFileSync('ui-components.js', 'utf8');

// 1. Add "dormant" to the WhatsApp injector logic
c = c.replace(
    "if(P === 'sales' || P === 'customers' || P === 'collections') {",
    "if(P === 'sales' || P === 'customers' || P === 'collections' || P === 'dormant') {"
);

// 2. Modify rDorm to extract phone number and add buttons
let searchDorm1 = "        if(!cu[c]) cu[c] = {last: dStr, s: 0};";
let replDorm1 = "        let ph = r['Phone']||r['Mobile']||r['رقم الموبايل']||r['التليفون']||'';\\n        if(!cu[c]) cu[c] = {last: dStr, s: 0, phone: ph};";

c = c.replace(searchDorm1, replDorm1);

let searchDorm2 = "return {n, last: data.last, days, s: data.s};";
let replDorm2 = "return {n, last: data.last, days, s: data.s, phone: data.phone};";
c = c.replace(searchDorm2, replDorm2);

// 3. Add Phone column to table and Export buttons
let searchDorm3 = "<div class=\\"tbs\\"><table><thead><tr><th>\\${L==='ar'?TUI('Customer'):'Customer'}</th><th>\\${L==='ar'?TUI('Total Sales'):'Total Sales'}</th><th>\\${L==='ar'?TUI('Last Purchase'):'Last Purchase'}</th><th>\\${L==='ar'?TUI('Days Ago'):'Days Ago'}</th><th>\\${L==='ar'?TUI('Status'):'Status'}</th></tr></thead>";
let replDorm3 = "<div style=\\"display:flex;gap:8px;margin-bottom:12px;justify-content:flex-end;\\">" +
    "<button class=\\"btn export-btn\\" onclick=\\"exportTableToExcel('dormantTable', 'Dormant_Customers')\\">📥 Excel</button>" +
    "<button class=\\"btn export-btn\\" style=\\"background:var(--rdl); color:var(--rd); border-color:var(--rd);\\" onclick=\\"exportTableToPDF('dormantTable', 'Dormant_Customers')\\">📄 Export PDF</button>" +
    "</div>" +
    "<div class=\\"tbs\\"><table id=\\"dormantTable\\"><thead><tr><th>\\${L==='ar'?TUI('Customer'):'Customer'}</th><th>\\${L==='ar'?TUI('Total Sales'):'Total Sales'}</th><th>\\${L==='ar'?TUI('Phone'):'Phone'}</th><th>\\${L==='ar'?TUI('Last Purchase'):'Last Purchase'}</th><th>\\${L==='ar'?TUI('Days Ago'):'Days Ago'}</th><th>\\${L==='ar'?TUI('Status'):'Status'}</th></tr></thead>";

c = c.replace(searchDorm3, replDorm3);

let searchDorm4 = "<tbody>\\${dormant.map(r=>`<tr><td><strong>\\${r.n}</strong></td><td>\\${fmt(r.s)}</td><td>\\${r.last}</td><td>\\${r.days}</td><td><span class=\\"badge \\${r.days>=120?'bg-r':'bg-a'}\\">\\${r.days>=120?(L==='ar'?TUI('Lost'):'Lost'):(L==='ar'?TUI('Dormant'):'Dormant')}</span></td></tr>`).join('')}</tbody>";
let replDorm4 = "<tbody>\\${dormant.map(r=>`<tr><td><strong>\\${r.n}</strong></td><td>\\${fmt(r.s)}</td><td>\\${r.phone}</td><td>\\${r.last}</td><td>\\${r.days}</td><td><span class=\\"badge \\${r.days>=120?'bg-r':'bg-a'}\\">\\${r.days>=120?(L==='ar'?TUI('Lost'):'Lost'):(L==='ar'?TUI('Dormant'):'Dormant')}</span></td></tr>`).join('')}</tbody>";

c = c.replace(searchDorm4, replDorm4);

// 4. Add Dashboard Card
let searchDash1 = "<div class=\\"tb\\"><div class=\\"tbt\\"><h3>\\${L==='ar'?TUI('Monthly'):'Monthly'}</h3></div>";

// We want to add a widget right ABOVE the Monthly chart.
// Let's count dormant customers first in rDash
let countDormantBlock = `
    let maxD = 0; ds.forEach(r => { let d = new Date(pd(r['Order Date'])).getTime(); if(!isNaN(d) && d>maxD) maxD=d; });
    let cuD = {}; ds.forEach(r => { let c = r.Customer; if(!c) return; let d = pd(r['Order Date']); if(!cuD[c] || d > cuD[c]) cuD[c]=d; });
    let dormantCount = 0; let ttD = maxD>0?maxD:new Date().getTime();
    Object.values(cuD).forEach(v => { let t = new Date(v).getTime(); if(!isNaN(t) && Math.floor((ttD-t)/86400000)>=60) dormantCount++; });

    let dormantCard = \`
    <div class="card" style="margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:linear-gradient(to right, rgba(231,76,60,0.1), transparent); border-left:4px solid var(--rd);" onclick="nav('dormant')">
        <div style="display:flex; align-items:center; gap:16px;">
            <div style="font-size:2rem; width:50px; height:50px; background:var(--rd); color:white; border-radius:12px; display:flex; align-items:center; justify-content:center;">\${ICONS.dormant}</div>
            <div>
                <h3 style="margin:0 0 4px; color:var(--tx1);">\${L==='ar'?'العملاء الخاملين':'Dormant Customers'}</h3>
                <div style="color:var(--tx2); font-size:0.9rem;">\${L==='ar'?'العملاء الذين لم يشتروا منذ 60 يوم':'Customers with no orders in 60+ days'}</div>
            </div>
        </div>
        <div style="font-size:1.8rem; font-weight:900; color:var(--rd);">\${dormantCount}</div>
    </div>\`;
`;

// Insert the calculation at the start of rDash right after ds = getFilteredSales()
let rDashStart = "let ds = getFilteredSales();";
c = c.replace(rDashStart, rDashStart + "\\n" + countDormantBlock);

// Insert the card above Monthly
c = c.replace(searchDash1, "\\${dormantCard}\\n        " + searchDash1);

fs.writeFileSync('ui-components.js', c);
console.log('ui-components.js patched!');
