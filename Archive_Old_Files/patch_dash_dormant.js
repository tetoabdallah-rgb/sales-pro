const fs = require('fs');
let c = fs.readFileSync('ui-components.js', 'utf8');

let calc = `
    let maxD = 0; ds.forEach(r => { let d = new Date(pd(r['Order Date'])).getTime(); if(!isNaN(d) && d>maxD) maxD=d; });
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

c = c.replace("$('M').innerHTML = `", calc + "\\n    $('M').innerHTML = `");
c = c.replace('<div class="kg">', '${dormantCard}\\n        <div class="kg">');
fs.writeFileSync('ui-components.js', c);
console.log('patched rDash for dormant customers');
