$html = Get-Content -Raw -Encoding UTF8 -Path "index_restored.html"

$sbb_old = @'
      <div class="sbb">
        <button id="bTh" title="Theme">&#x1F317;</button>
        <button id="bLn" title="Language">EN</button>
        <button id="bOt" title="Logout">&#x062E;&#x0631;&#x0648;&#x062C;</button>
      </div>
'@

$sbb_new = @'
      <div class="sbb">
        <button id="bAlBell" title="Alerts" onclick="P='alerts';if(typeof buildNav==='function')buildNav();render();" style="position:relative;">&#x1F514;<span id="alBadge" style="display:none;position:absolute;top:-5px;right:-5px;background:var(--rd);color:#fff;border-radius:50%;padding:2px 5px;font-size:0.5rem;font-weight:bold;">0</span></button>
        <button id="bTh" title="Theme">&#x1F317;</button>
        <button id="bLn" title="Language">EN</button>
        <button id="bOt" title="Logout">&#x062E;&#x0631;&#x0648;&#x062C;</button>
      </div>
'@

$html = $html.Replace($sbb_old.TrimEnd(), $sbb_new.TrimEnd())

$df_old = @'
    let dateFilterUI = `
        <div style="display:flex;gap:10px;align-items:center;background:var(--bg3);padding:8px 16px;border-radius:12px;border:1px solid var(--bd);">
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?TUI('From'):'From'}:</label>
            <input type="date" id="dfStart" class="sbox" style="padding:6px;width:130px;" value="${globalDateRange.start||''}">
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?TUI('To'):'To'}:</label>
            <input type="date" id="dfEnd" class="sbox" style="padding:6px;width:130px;" value="${globalDateRange.end||''}">
            <button id="bDateClear" class="btn" style="padding:6px 10px;font-size:0.7rem;">&#x2716;</button>
        </div>
    `;
'@

$df_new = @'
    let dateFilterUI = `
        <div style="display:flex;gap:10px;align-items:center;background:var(--bg3);padding:8px 16px;border-radius:12px;border:1px solid var(--bd);flex-wrap:wrap;">
            <div id="quickFilters" style="display:flex;gap:5px;align-items:center;">
                <button id="bQF_today" class="btn" style="padding:4px 8px;font-size:0.6rem;">${L==='ar'?'اليوم':'Today'}</button>
                <button id="bQF_week" class="btn" style="padding:4px 8px;font-size:0.6rem;">${L==='ar'?'هذا الأسبوع':'This Wk'}</button>
                <button id="bQF_month" class="btn" style="padding:4px 8px;font-size:0.6rem;">${L==='ar'?'هذا الشهر':'This Mo'}</button>
            </div>
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?TUI('From'):'From'}:</label>
            <input type="date" id="dfStart" class="sbox" style="padding:6px;width:130px;" value="${globalDateRange.start||''}">
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?TUI('To'):'To'}:</label>
            <input type="date" id="dfEnd" class="sbox" style="padding:6px;width:130px;" value="${globalDateRange.end||''}">
            <button id="bDateClear" class="btn" style="padding:6px 10px;font-size:0.7rem;" title="${L==='ar'?'مسح الفلتر':'Clear'}">&#x2716;</button>
        </div>
    `;
'@

$html = $html.Replace($df_old.TrimEnd(), $df_new.TrimEnd())

$sd_old = @'
    $('bDateClear').onclick = () => {
        globalDateRange = { start: null, end: null };
        rDash();
    };
'@

$sd_new = @'
    $('bDateClear').onclick = () => {
        globalDateRange = { start: null, end: null };
        rDash();
    };

    const setDates = (daysAgo) => {
        const end = new Date();
        const start = new Date();
        if(daysAgo !== 0 && daysAgo !== 'month_start') start.setDate(end.getDate() - daysAgo);
        const yE=end.getFullYear(), mE=String(end.getMonth()+1).padStart(2,'0'), dE=String(end.getDate()).padStart(2,'0');
        const yS=start.getFullYear(), mS=String(start.getMonth()+1).padStart(2,'0'), dS=String(start.getDate()).padStart(2,'0');
        globalDateRange.end = `${yE}-${mE}-${dE}`;
        if(daysAgo === 'month_start') {
            globalDateRange.start = `${yE}-${mE}-01`;
        } else {
            globalDateRange.start = `${yS}-${mS}-${dS}`;
        }
        rDash();
    };
    if($('bQF_today')) $('bQF_today').onclick = () => setDates(0);
    if($('bQF_week')) $('bQF_week').onclick = () => setDates(7);
    if($('bQF_month')) $('bQF_month').onclick = () => setDates('month_start');
'@

$html = $html.Replace($sd_old.TrimEnd(), $sd_new.TrimEnd())

$rb_old = @'
function render() {
    let fn = {
        dash: rDash, sales: rSales, targets: rTgt, personal: rPers,
        customers: rCust, brands: rBrands, analytics: rAn, potential: rPot,
        profit: rProfit, accessories: rAcc, hardware: rHW, collections: rCollections,
        keyacc: rKey, dormant: rDorm, prospects: rPros, alerts: rAl, ai: rAI,
        account: rAcct, backup: rBk, setup: rSetup, reset: rReset, settings: rSettings
    };
    if (fn[P]) fn[P]();
    initAnm();
}
'@

$rb_new = @'
function updateAlertBadge() {
    if(!$('alBadge')) return;
    let alertsCount = 0;
    let today = new Date();
    let cu = {};
    if(typeof S !== 'undefined' && S) {
        S.forEach(r => { let c=r.Customer||''; let d=pd(r['Order Date']); if(!cu[c]||d>cu[c]) cu[c]=d; });
        Object.entries(cu).forEach(([n,last]) => {
            let days = Math.floor((today - new Date(last)) / 86400000);
            if(days >= 60) alertsCount++;
        });
        let cuS = {};
        S.forEach(r => { let c=r.Customer||''; cuS[c]=(cuS[c]||0)+(getRowVal(r, ['Sales After Discount', 'Sales', 'Amount'])); });
        if(typeof T !== 'undefined' && T) {
            T.forEach(r => {
                let tg=Number(r.Target)||0, ach=cuS[r.Customer]||0, pct=tg>0?ach/tg*100:0;
                if(pct<50 && tg>0) alertsCount++;
            });
        }
    }
    if(alertsCount > 0) {
        $('alBadge').style.display = 'block';
        $('alBadge').textContent = alertsCount;
    } else {
        $('alBadge').style.display = 'none';
    }
}

function render() {
    let fn = {
        dash: rDash, sales: rSales, targets: rTgt, personal: rPers,
        customers: rCust, brands: rBrands, analytics: rAn, potential: rPot,
        profit: rProfit, accessories: rAcc, hardware: rHW, collections: rCollections,
        keyacc: rKey, dormant: rDorm, prospects: rPros, alerts: rAl, ai: rAI,
        account: rAcct, backup: rBk, setup: rSetup, reset: rReset, settings: rSettings
    };
    if (fn[P]) fn[P]();
    initAnm();
    updateAlertBadge();
}
'@

$html = $html.Replace($rb_old.TrimEnd(), $rb_new.TrimEnd())

[System.IO.File]::WriteAllText((Join-Path $PWD "index.html"), $html, [System.Text.Encoding]::UTF8)
Write-Host "Successfully restored and injected code."
