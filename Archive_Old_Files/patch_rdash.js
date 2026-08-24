const fs = require('fs');

let mainPath = 'e:\\AI\\apk\\SalesProWeb\\scripts\\main.js';
let mainStr = fs.readFileSync(mainPath, 'utf8');

// Find the block from $('M').innerHTML = ` to `;
let startIndex = mainStr.indexOf("$('M').innerHTML = `");
let endIndex = mainStr.indexOf("`;", startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find rDash innerHTML");
    process.exit(1);
}

// Read dash template
let dashTemplate = fs.readFileSync('e:\\AI\\apk\\SalesProWeb\\dash_template.txt', 'utf8');

// We will inject variables into the template
let newDashboard = `
        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px; margin-bottom: 24px;">
            <h1 style="display:flex;align-items:center;gap:12px; margin:0;"><i data-lucide="layout-dashboard" style="width:28px;height:28px;"></i> \${t('dash')}</h1>
            \${dateFilterUI}
        </div>
        <div class="stats">
          <article class="stat"><div class="stat-head"><span>\${L==='ar'?'إجمالي المبيعات':'Total Sales'}</span><span class="stat-icon"><i data-lucide="wallet-cards" width="16" height="16"></i></span></div><div class="stat-value">\${aFmt(ts)} <small>\${L==='ar'?'ج.م':'EGP'}</small></div><div class="stat-foot"><span>\${Object.keys(cu).length} \${L==='ar'?'عميل':'Customers'}</span></div></article>
          <article class="stat"><div class="stat-head"><span>\${L==='ar'?'إجمالي الأرباح':'Total Profit'}</span><span class="stat-icon"><i data-lucide="trending-up" width="16" height="16"></i></span></div><div class="stat-value">\${aFmt(tp)} <small>\${L==='ar'?'ج.م':'EGP'}</small></div><div class="stat-foot"><span>\${L==='ar'?'الهامش:':'Margin:'} \${(ts>0?tp/ts*100:0).toFixed(1)}%</span></div></article>
          <article class="stat"><div class="stat-head"><span>\${L==='ar'?'تحصيل الإكسسوارات':'Acc Collection'}</span><span class="stat-icon"><i data-lucide="headphones" width="16" height="16"></i></span></div><div class="stat-value">\${aFmt(accTot)} <small>\${L==='ar'?'ج.م':'EGP'}</small></div></article>
          <article class="stat"><div class="stat-head"><span>\${L==='ar'?'تحصيل الهاردوير':'HW Collection'}</span><span class="stat-icon"><i data-lucide="laptop" width="16" height="16"></i></span></div><div class="stat-value">\${aFmt(hwTot)} <small>\${L==='ar'?'ج.م':'EGP'}</small></div></article>
        </div>

        <div class="dashboard-grid">
          <section class="panel"><div class="panel-head"><div><h2 class="panel-title">\${L==='ar'?'إيقاع المبيعات':'Sales Rhythm'}</h2><p class="panel-sub">\${L==='ar'?'المبيعات اليومية':'Daily Sales'}</p></div></div><div class="chart-wrap"><canvas id="cD"></canvas></div></section>
          <section class="panel target-panel"><div class="target-top"><div><h2>\${L==='ar'?'تقدم التارجت':'Target Progress'}</h2><p>\${L==='ar'?'أداء الفريق':'Team Performance'}</p></div></div><div class="target-ring"><svg viewBox="0 0 160 160" aria-hidden="true"><circle class="ring-bg" cx="80" cy="80" r="66" fill="none" stroke-width="12"></circle><circle class="ring-value" cx="80" cy="80" r="66" fill="none" stroke-width="12" stroke-dasharray="414.7" stroke-dashoffset="\${414.7 - (Math.min(ap, 100) / 100 * 414.7)}"></circle></svg><div class="ring-content"><strong>\${ap.toFixed(0)}%</strong><span>\${L==='ar'?'من التارجت':'of Target'}</span></div></div><div class="target-numbers"><div class="target-number"><small>\${L==='ar'?'المحقق':'Achieved'}</small><strong>\${aFmt(ts)}</strong></div><div class="target-number"><small>\${L==='ar'?'المتبقي':'Remaining'}</small><strong>\${aFmt(Math.max(0, tt-ts))}</strong></div></div></section>
        </div>
        
        <div class="dashboard-grid" style="margin-top: 16px;">
          <section class="panel" style="width:100%;"><div class="panel-head"><div><h2 class="panel-title">\${L==='ar'?'المبيعات حسب الفئة':'Sales by Category'}</h2></div></div><div class="chart-wrap"><canvas id="cC"></canvas></div></section>
        </div>
`;

let newMainStr = mainStr.substring(0, startIndex) + "$('M').innerHTML = `" + newDashboard + mainStr.substring(endIndex);

// Add lucide.createIcons() at the end of rDash
let rDashEndIndex = newMainStr.indexOf("if (typeof ChartDataLabels !== 'undefined') {", startIndex);
// Find the end of rDash function by looking for the last closing brace before the next function
let insertIconsIndex = newMainStr.indexOf("}", newMainStr.indexOf("CH.c = new Chart", startIndex));
if(insertIconsIndex !== -1) {
    // try to insert after chart initialization
    let chartEnd = newMainStr.indexOf("});", newMainStr.indexOf("CH.c = new Chart", startIndex)) + 3;
    newMainStr = newMainStr.substring(0, chartEnd) + "\n    if(typeof lucide !== 'undefined') lucide.createIcons();\n" + newMainStr.substring(chartEnd);
}

fs.writeFileSync(mainPath, newMainStr);
console.log("main.js patched with new dashboard UI.");
