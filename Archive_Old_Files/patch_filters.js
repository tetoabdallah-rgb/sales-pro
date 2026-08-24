const fs = require('fs');
let files = ['ui-components.js', 'index.html', 'index_bundle.html', 'live.html'];
for (let file of files) {
    if (!fs.existsSync(file)) continue;
    let c = fs.readFileSync(file, 'utf8');

const originalDateFilter = `    let dateFilterUI = \`
        <div style="display:flex;gap:10px;align-items:center;background:var(--bg3);padding:8px 16px;border-radius:12px;border:1px solid var(--bd);flex-wrap:wrap;">
            <button onclick="if(typeof sendDailyReportNow==='function')sendDailyReportNow(false);" class="btn" style="background:#10b981;color:#fff;font-weight:bold;padding:6px 12px;font-size:0.75rem;display:flex;align-items:center;gap:4px;cursor:pointer;" title="\${L==='ar'?'إرسال تقرير المبيعات والتحصيلات إلى إيميلك الآن':'Send Report to Email'}">📧 \${L==='ar'?'إرسال التقرير للإيميل':'Email Report'}</button>
            <span style="color:var(--bd);margin:0 4px;">|</span>
            <label style="font-size:0.7rem;font-weight:bold;">\${L==='ar'?TUI('From'):'From'}:</label>
            <input type="date" id="dfStart" class="sbox" style="padding:6px;width:130px;" value="\${globalDateRange.start||''}">
            <label style="font-size:0.7rem;font-weight:bold;">\${L==='ar'?TUI('To'):'To'}:</label>
            <input type="date" id="dfEnd" class="sbox" style="padding:6px;width:130px;" value="\${globalDateRange.end||''}">
            <button id="bDateClear" class="btn" style="padding:6px 10px;font-size:0.7rem;">❌</button>
        </div>
    \`;`;

const newDateFilter = `    // Calculate available reps and cats for the dropdowns
    let allReps = [...new Set(S.map(r => getRowVal(r, ['Sales Person', 'Rep', 'Salesman'])).filter(Boolean))].sort();
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
    \`;`;

// The old event handlers:
const oldEvents = `    // Attach date filter events
    ['dfStart', 'dfEnd'].forEach(id => {
        $(id).onchange = () => {
            globalDateRange.start = $('dfStart').value;
            globalDateRange.end = $('dfEnd').value;
            rDash(); // Re-render with new data
        };
    });
    $('bDateClear').onclick = () => {
        globalDateRange = { start: null, end: null };
        rDash();
    };`;

const newEvents = `    // Attach filter events
    ['dfStart', 'dfEnd'].forEach(id => {
        if($(id)) {
            $(id).onchange = () => {
                globalDateRange.start = $('dfStart').value;
                globalDateRange.end = $('dfEnd').value;
                rDash(); // Re-render with new data
            };
        }
    });
    if($('dfRep')) {
        $('dfRep').onchange = () => {
            globalRepFilter = $('dfRep').value;
            rDash();
        };
    }
    if($('dfCat')) {
        $('dfCat').onchange = () => {
            globalCatFilter = $('dfCat').value;
            rDash();
        };
    }
    if($('bDateClear')) {
        $('bDateClear').onclick = () => {
            globalDateRange = { start: null, end: null };
            globalRepFilter = '';
            globalCatFilter = '';
            rDash();
        };
    }
    if($('bPdfExport')) {
        $('bPdfExport').onclick = () => {
            if (typeof html2pdf !== 'undefined') {
                let el = $('M');
                let opt = {
                    margin: 0.2,
                    filename: 'Dashboard_Report.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
                };
                html2pdf().set(opt).from(el).save();
            } else {
                alert(L==='ar'?'مكتبة PDF غير محملة. يرجى تحديث الصفحة والمحاولة مرة أخرى.':'PDF library not loaded. Refresh and try again.');
            }
        };
    }`;

// Replace using regex or exact match
let modified = false;

// 1. We replace dateFilterUI definition by finding the start and end of it.
let uiStart = c.indexOf('    let dateFilterUI = `');
if (uiStart !== -1) {
    let uiEnd = c.indexOf('    `;', uiStart);
    if (uiEnd !== -1) {
        c = c.substring(0, uiStart) + newDateFilter + c.substring(uiEnd + 6);
        modified = true;
    }
}

// 2. We replace the event handlers block
let evStart = c.indexOf('    // Attach date filter events');
if (evStart !== -1) {
    let evEnd = c.indexOf('    // Charts', evStart);
    if (evEnd !== -1) {
        c = c.substring(0, evStart) + newEvents + '\\n\\n' + c.substring(evEnd);
        modified = true;
    }
}

if (modified) {
    fs.writeFileSync(file, c);
    console.log('Successfully patched ' + file + '!');
} else {
    console.log('Could not find patterns to replace in ' + file);
}
}
