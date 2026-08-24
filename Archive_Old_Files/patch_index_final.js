const fs = require('fs');

let c = fs.readFileSync('index.html', 'utf8');

// 1. Fix the missing dormant card and broken rings in rDash
let searchStr = `        <div class="kg">
            <div class="ki"><div class="lb">\${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">\${aFmt(ts)}</div></div>`;
let endStr = `        <div class="cg">`;
let startIndex = c.indexOf(searchStr);
let endIndex = c.indexOf(endStr, startIndex);

if (startIndex > -1 && endIndex > -1) {
    let calc = `    let maxD = 0; ds.forEach(r => { let d = new Date(pd(r['Order Date'])).getTime(); if(!isNaN(d) && d>maxD) maxD=d; });
    let cuD = {}; ds.forEach(r => { let cust = r.Customer; if(!cust) return; let d = pd(r['Order Date']); if(!cuD[cust] || d > cuD[cust]) cuD[cust]=d; });
    let dormantCount = 0; let ttD = maxD>0?maxD:new Date().getTime();
    Object.values(cuD).forEach(v => { let t = new Date(v).getTime(); if(!isNaN(t) && Math.floor((ttD-t)/86400000)>=60) dormantCount++; });

    let dormantCard = \\\`
    <div class="card" style="margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:linear-gradient(to right, rgba(231,76,60,0.05), transparent); border-left:4px solid var(--rd); box-shadow:0 4px 12px rgba(0,0,0,0.05);" onclick="nav('dormant')">
        <div style="display:flex; align-items:center; gap:16px;">
            <div style="font-size:2rem; width:50px; height:50px; background:var(--rd); color:white; border-radius:12px; display:flex; align-items:center; justify-content:center;">\\\${ICONS.dormant}</div>
            <div>
                <h3 style="margin:0 0 4px; color:var(--tx1);">\\\${L==='ar'?'العملاء الخاملين':'Dormant Customers'}</h3>
                <div style="color:var(--tx2); font-size:0.9rem;">\\\${L==='ar'?'إضغط هنا لمشاهدة قائمة العملاء المنقطعين منذ 60 يوم':'Click to view customers with no orders in 60+ days'}</div>
            </div>
        </div>
        <div style="font-size:1.8rem; font-weight:900; color:var(--rd);">\\\${dormantCount}</div>
    </div>\\\`;
`;

    // Inject calc right before $('M').innerHTML = ...
    let htmlStartStr = `    $('M').innerHTML = \\\``;
    let htmlStartIndex = c.lastIndexOf(htmlStartStr, startIndex);
    
    // Now replace the inner HTML parts!
    let replacement = `        \${dormantCard}
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
        
`;

    // First replace the broken HTML
    c = c.substring(0, startIndex) + replacement + c.substring(endIndex);
    
    // Then insert the variable calc
    htmlStartIndex = c.lastIndexOf(`$('M').innerHTML = \``, c.indexOf(`\${dormantCard}`));
    let actualCalcStr = calc.replace(/\\\\`/g, '`').replace(/\\\\\$/g, '$');
    c = c.substring(0, htmlStartIndex) + actualCalcStr + '\\n    ' + c.substring(htmlStartIndex);
} else {
    console.log("Could not find rDash HTML to replace.");
}

// 2. Fix the WhatsApp Injector logic
c = c.replace(
    "if(P === 'sales' || P === 'customers' || P === 'collections') {",
    "if(P === 'sales' || P === 'customers' || P === 'collections' || P === 'dormant') {"
);

fs.writeFileSync('index.html', c);
console.log('Fixed index.html!');
