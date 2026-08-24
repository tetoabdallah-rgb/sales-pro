const fs = require('fs');

let f = fs.readFileSync('e:/AI/apk/SalesProWeb/index.html', 'utf8');

// Helper to replace precisely
function replaceAll(str, search, replacement) {
    return str.split(search).join(replacement);
}

// 1. rSales - Top 5 Best-Sellers
let salesTopProfit = `<div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--tx2); font-size:0.85rem;">\${L==='ar'?TUI('Profit'):'Profit'}</span>
                    <strong style="font-size:0.9rem;">\${aFmt(d.p)}</strong>
                </div>`;
let salesTopProfit_win = salesTopProfit.replace(/\\n/g, '\\r\\n');

let marginUI_card = `\\n                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--tx2); font-size:0.85rem;">\${L==='ar'?TUI('Margin %'):'Margin %'}</span>
                    <strong style="font-size:0.9rem;">\${d.s>0?aFmt(d.p/d.s*100,true):0}</strong>
                </div>`;
                
if (!f.includes('TUI(\\'Margin %\\')') && f.includes("TUI('Profit')")) {
    f = replaceAll(f, salesTopProfit, salesTopProfit + marginUI_card);
    f = replaceAll(f, salesTopProfit_win, salesTopProfit_win + marginUI_card);
}

// 2. rSales - Table Header
let salesTh = `<th data-c="Qty">Qty ? </th><th data-c="Sales">Sales ? </th><th data-c="Profit">Profit ? </th>`;
let salesThNew = `<th data-c="Qty">Qty ? </th><th data-c="Sales">Sales ? </th><th data-c="Profit">Profit ? </th><th data-c="Margin">Margin % ? </th>`;
f = replaceAll(f, salesTh, salesThNew);

// 3. rSales - Table Body
let salesTd = `<td>\${fmt(pr)} \${b}</td></tr>`;
let salesTdNew = `<td>\${fmt(pr)} \${b}</td><td>\${aFmt(pm,true)}</td></tr>`;
f = replaceAll(f, salesTd, salesTdNew);

// 4. rTgt - Table Header
let tgtTh = `<th>Acc</th><th>Acc P</th><th>HW</th><th>HW P</th>`;
let tgtThNew = `<th>Acc</th><th>Acc P</th><th>Acc M%</th><th>HW</th><th>HW P</th><th>HW M%</th>`;
f = replaceAll(f, tgtTh, tgtThNew);

// 5. rTgt - Table Body
let tgtTd = `<td>\${fmt(cSF(r.Customer,isAcc))}</td><td>\${fmt(cPF(r.Customer,isAcc))}</td><td>\${fmt(cSF(r.Customer,isHW))}</td><td>\${fmt(cPF(r.Customer,isHW))}</td>`;
let tgtTdNew = `<td>\${fmt(cSF(r.Customer,isAcc))}</td><td>\${fmt(cPF(r.Customer,isAcc))}</td><td>\${aFmt(cSF(r.Customer,isAcc)>0?cPF(r.Customer,isAcc)/cSF(r.Customer,isAcc)*100:0,true)}</td><td>\${fmt(cSF(r.Customer,isHW))}</td><td>\${fmt(cPF(r.Customer,isHW))}</td><td>\${aFmt(cSF(r.Customer,isHW)>0?cPF(r.Customer,isHW)/cSF(r.Customer,isHW)*100:0,true)}</td>`;
f = replaceAll(f, tgtTd, tgtTdNew);

// 6. rBrands - Top 3 Brands
let brandProfit = `<div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">\${L==='ar'?TUI('Profit'):'Profit'}</span>
                    <strong>\${aFmt(d.p)}</strong>
                </div>`;
let brandProfit_win = brandProfit.replace(/\\n/g, '\\r\\n');

let marginUI_brand = `\\n                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">\${L==='ar'?TUI('Margin %'):'Margin %'}</span>
                    <strong>\${d.s>0?aFmt(d.p/d.s*100,true):0}</strong>
                </div>`;

if (!f.includes(marginUI_brand.trim())) {
    f = replaceAll(f, brandProfit, brandProfit + marginUI_brand);
    f = replaceAll(f, brandProfit_win, brandProfit_win + marginUI_brand.replace(/\\n/g, '\\r\\n'));
}

// Propagate back
let files = ['index.html', 'index_bundle.html', 'index_final.html', 'index_github.html', 'old_index.html'];
files.forEach(file => {
    fs.writeFileSync('e:/AI/apk/SalesProWeb/' + file, f, 'utf8');
});
console.log('Patched all successfully');
