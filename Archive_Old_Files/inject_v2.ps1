$html = Get-Content -Raw -Encoding UTF8 -Path "index.html"

# 1. Add html2pdf to HEAD
$head_old = "</title>"
$head_new = "</title>`n    <script src=`"https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js`"></script>"
$html = $html.Replace($head_old, $head_new)

# 2. Add PDF Button and Trend logic in rDash
$dash_ph_old = @'
        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dash}</span> ${t('dash')}</h1>
            ${dateFilterUI}
        </div>
'@

$dash_ph_new = @'
        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
            <div style="display:flex;align-items:center;gap:12px;">
                <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dash}</span> ${t('dash')}</h1>
                <button id="bPdfExport" class="btn" style="padding:4px 8px;font-size:0.7rem;" title="${L==='ar'?'تصدير PDF':'Export PDF'}">&#x1F4C4; PDF</button>
            </div>
            ${dateFilterUI}
        </div>
'@
$html = $html.Replace($dash_ph_old.TrimEnd(), $dash_ph_new.TrimEnd())

# 2b. Add Period Comparison to rDash
$calc_old = @'
    let ts = 0, tp = 0, tt = 0, tpt = 0;
    
    ds.forEach(r => { ts += getRowVal(r, ['Sales After Discount', 'Sales', 'Amount']); tp += getRowVal(r, ['Profit Margin', 'Profit']); });
'@

$calc_new = @'
    let ts = 0, tp = 0, tt = 0, tpt = 0;
    ds.forEach(r => { ts += getRowVal(r, ['Sales After Discount', 'Sales', 'Amount']); tp += getRowVal(r, ['Profit Margin', 'Profit']); });

    // Period Comparison
    let prevSales = 0;
    if(S && S.length > 0) {
        if (globalDateRange.start && globalDateRange.end) {
            let sDate = new Date(globalDateRange.start);
            let eDate = new Date(globalDateRange.end);
            let diff = eDate - sDate;
            let pEnd = new Date(sDate.getTime() - 86400000);
            let pStart = new Date(pEnd.getTime() - diff);
            let pStartStr = `${pStart.getFullYear()}-${String(pStart.getMonth()+1).padStart(2,'0')}-${String(pStart.getDate()).padStart(2,'0')}`;
            let pEndStr = `${pEnd.getFullYear()}-${String(pEnd.getMonth()+1).padStart(2,'0')}-${String(pEnd.getDate()).padStart(2,'0')}`;
            S.forEach(r => {
                let d = pd(r['Order Date']);
                if(d && d >= pStartStr && d <= pEndStr) prevSales += getRowVal(r, ['Sales After Discount', 'Sales', 'Amount']);
            });
        } else {
            let now = new Date();
            let pEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            let pStart = new Date(pEnd.getFullYear(), pEnd.getMonth(), 1);
            let pStartStr = `${pStart.getFullYear()}-${String(pStart.getMonth()+1).padStart(2,'0')}-${String(pStart.getDate()).padStart(2,'0')}`;
            let pEndStr = `${pEnd.getFullYear()}-${String(pEnd.getMonth()+1).padStart(2,'0')}-${String(pEnd.getDate()).padStart(2,'0')}`;
            S.forEach(r => {
                let d = pd(r['Order Date']);
                if(d && d >= pStartStr && d <= pEndStr) prevSales += getRowVal(r, ['Sales After Discount', 'Sales', 'Amount']);
            });
        }
    }
    let trendHtml = '';
    if (ts > 0 && prevSales > 0) {
        let diffPct = ((ts - prevSales) / prevSales) * 100;
        let c = diffPct >= 0 ? 'var(--gr)' : 'var(--rd)';
        let a = diffPct >= 0 ? '&#x25B2;' : '&#x25BC;';
        trendHtml = `<span style="color:${c};font-size:0.6rem;margin-left:5px;background:var(--bg3);padding:2px 4px;border-radius:4px;">${a} ${Math.abs(diffPct).toFixed(1)}%</span>`;
    }
'@
$html = $html.Replace($calc_old.TrimEnd(), $calc_new.TrimEnd())

$sales_ui_old = @'
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">${aFmt(ts)}</div></div>
'@
$sales_ui_new = @'
        <div class="kg">
            <div class="ki"><div class="lb" style="display:flex;align-items:center;">${L==='ar'?TUI('Sales'):'Sales'}${trendHtml}</div><div class="vl">${aFmt(ts)}</div></div>
'@
$html = $html.Replace($sales_ui_old.TrimEnd(), $sales_ui_new.TrimEnd())


# 2c. Add PDF Button logic in rDash
$pdf_logic_old = @'
    $('bDateClear').onclick = () => {
'@
$pdf_logic_new = @'
    if($('bPdfExport')) $('bPdfExport').onclick = () => {
        let element = $('M');
        html2pdf().set({
            margin: 10,
            filename: 'Sales_Dashboard.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        }).from(element).save();
    };

    $('bDateClear').onclick = () => {
'@
$html = $html.Replace($pdf_logic_old.TrimEnd(), $pdf_logic_new.TrimEnd())

# 3. Currency global and formatter
$var_old = @'
let THEME = localStorage.getItem('SalesPro_Theme') || 'dark';
let L = localStorage.getItem('SalesPro_Lang') || 'en';
let P = 'dash';
'@
$var_new = @'
let THEME = localStorage.getItem('SalesPro_Theme') || 'dark';
let L = localStorage.getItem('SalesPro_Lang') || 'en';
let CURR = localStorage.getItem('SalesPro_Currency') || '';
let P = 'dash';
'@
$html = $html.Replace($var_old.TrimEnd(), $var_new.TrimEnd())

$fmt_old = @'
function fmt(n) { return (n == null || isNaN(n)) ? '0' : Number(n).toLocaleString('en-US', {maximumFractionDigits: 0}); }
function pc(n) { return (n == null || isNaN(n)) ? '0%' : Number(n).toFixed(1) + '%'; }
function aFmt(n, isPc) { return `<span class="anm" data-v="${n}"${isPc ? ' data-p="1"' : ''}>${isPc ? '0%' : '0'}</span>`; }
'@
$fmt_new = @'
function fmt(n) { 
    let f = (n == null || isNaN(n)) ? '0' : Number(n).toLocaleString('en-US', {maximumFractionDigits: 0}); 
    return CURR ? f + ' ' + CURR : f;
}
function pc(n) { return (n == null || isNaN(n)) ? '0%' : Number(n).toFixed(1) + '%'; }
function aFmt(n, isPc, isCurr=true) { 
    let c = (isCurr && !isPc && CURR) ? ` ${CURR}` : '';
    return `<span class="anm" data-v="${n}"${isPc ? ' data-p="1"' : ''}${c ? ` data-c="${c}"` : ''}>${isPc ? '0%' : '0'+c}</span>`; 
}
'@
$html = $html.Replace($fmt_old.TrimEnd(), $fmt_new.TrimEnd())

$initAnm_old = @'
            el.textContent = el.getAttribute('data-p') ? pc(p * e) : fmt(Math.floor(p * e));
            if(p < 1) requestAnimationFrame(r);
            else el.textContent = el.getAttribute('data-p') ? pc(e) : fmt(e);
'@
$initAnm_new = @'
            let cStr = el.getAttribute('data-c') || '';
            let val = el.getAttribute('data-p') ? pc(p * e) : fmt(Math.floor(p * e));
            if(!el.getAttribute('data-p') && CURR) val = val.replace(CURR, '').trim() + ' ' + CURR;
            el.textContent = val;
            if(p < 1) requestAnimationFrame(r);
            else {
                let finalVal = el.getAttribute('data-p') ? pc(e) : fmt(e);
                if(!el.getAttribute('data-p') && CURR) finalVal = finalVal.replace(CURR, '').trim() + ' ' + CURR;
                el.textContent = finalVal;
            }
'@
$html = $html.Replace($initAnm_old.TrimEnd(), $initAnm_new.TrimEnd())

$settings_old = "<h3>🎨 `${L==='ar'?'اللون الأساسي':'Primary Color'}</h3>"
$settings_new = @'
        <div class="card" style="margin-bottom:20px;">
            <h3>💰 ${L==='ar'?'العملة':'Currency'}</h3>
            <div style="display:flex;gap:12px;margin-bottom:12px;">
                <select id="currSelect" class="sbox" style="width:200px;padding:8px;">
                    <option value="" ${CURR===''?'selected':''}>${L==='ar'?'بدون عملة':'None'}</option>
                    <option value="EGP" ${CURR==='EGP'?'selected':''}>EGP (جنيه)</option>
                    <option value="SAR" ${CURR==='SAR'?'selected':''}>SAR (ريال)</option>
                    <option value="AED" ${CURR==='AED'?'selected':''}>AED (درهم)</option>
                    <option value="$" ${CURR==='$'?'selected':''}>$ (USD)</option>
                    <option value="€" ${CURR==='€'?'selected':''}>€ (EUR)</option>
                </select>
                <button class="btn" onclick="localStorage.setItem('SalesPro_Currency', $('currSelect').value); CURR=$('currSelect').value; render();">${L==='ar'?'حفظ':'Save'}</button>
            </div>
        </div>
        
        <h3>🎨 ${L==='ar'?'اللون الأساسي':'Primary Color'}</h3>
'@
$html = $html.Replace($settings_old, $settings_new)

# 4. Add manifest linking and service worker logic
$manifest_old = @'
</head>
'@
$manifest_new = @'
    <link rel="manifest" href="manifest.json">
</head>
'@
$html = $html.Replace($manifest_old.TrimEnd(), $manifest_new.TrimEnd())

$sw_old = @'
</body>
'@
$sw_new = @'
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(registration => console.log('SW registered'))
        .catch(err => console.log('SW registration failed: ', err));
    });
  }
</script>
</body>
'@
$html = $html.Replace($sw_old.TrimEnd(), $sw_new.TrimEnd())

[System.IO.File]::WriteAllText((Join-Path $PWD "index.html"), $html, [System.Text.Encoding]::UTF8)
Write-Host "Injection Complete"
