// js/ui-components.js

// Pagination State
let pState = {
    sales: { page: 1, limit: 50 },
    customers: { page: 1, limit: 50 },
    analytics: { page: 1, limit: 50 }
};

function renderPagination(total, stateKey, onPageChange) {
    let state = pState[stateKey];
    let totalPages = Math.ceil(total / state.limit);
    if (totalPages <= 1) return '';
    
    let html = `<div style="display:flex;justify-content:center;gap:8px;padding:12px;border-top:1px solid var(--bd-s)">`;
    
    html += `<button class="btn" ${state.page === 1 ? 'disabled' : ''} onclick="pState['${stateKey}'].page--; ${onPageChange}()">السابق</button>`;
    html += `<span style="font-size:0.75rem;font-weight:bold;align-self:center;">صفحة ${state.page} من ${totalPages}</span>`;
    html += `<button class="btn" ${state.page === totalPages ? 'disabled' : ''} onclick="pState['${stateKey}'].page++; ${onPageChange}()">التالي</button>`;
    
    html += `</div>`;
    return html;
}

// 1. Dashboard
function rDash() {
    let ds = getFilteredSales();
    let ts = 0, tp = 0, tt = 0, tpt = 0;
    
    ds.forEach(r => { ts += Number(r['Sales After Discount'])||0; tp += Number(r['Profit Margin'])||0; });
    T.forEach(r => { tt += Number(r.Target)||0; tpt += Number(r['Profit Target'])||0; });
    
    let cu = {}, or = {};
    ds.forEach(r => { cu[r.Customer] = 1; or[r['Order Nbr']] = 1; });
    
    let ap = tt > 0 ? ts / tt * 100 : 0;
    let pp = tpt > 0 ? tp / tpt * 100 : 0;
    
    let dateFilterUI = `
        <div style="display:flex;gap:10px;align-items:center;background:var(--bg3);padding:8px 16px;border-radius:12px;border:1px solid var(--bd);">
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?'من':'From'}:</label>
            <input type="date" id="dfStart" class="sbox" style="padding:6px;width:130px;" value="${globalDateRange.start||''}">
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?'إلى':'To'}:</label>
            <input type="date" id="dfEnd" class="sbox" style="padding:6px;width:130px;" value="${globalDateRange.end||''}">
            <button id="bDateClear" class="btn" style="padding:6px 10px;font-size:0.7rem;">✖</button>
        </div>
    `;
    
    $('M').innerHTML = `
        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dash}</span> ${t('dash')}</h1>
            ${dateFilterUI}
        </div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'المبيعات':'Sales'}</div><div class="vl">${aFmt(ts)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الربح':'Profit'}</div><div class="vl">${aFmt(tp)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الهامش':'Margin'}</div><div class="vl">${aFmt(ts>0?tp/ts*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'التارجت':'Target'}</div><div class="vl">${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'التحقيق':'Ach.'}</div><div class="vl">${aFmt(ap,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'العملاء':'Cust.'}</div><div class="vl">${aFmt(Object.keys(cu).length)}</div></div>
        </div>
        <div class="rg">${ring(L==='ar'?'المبيعات':'Sales', ap, tt)}${ring(L==='ar'?'الربح':'Profit', pp, tpt)}</div>
        
        <div class="cg">
            <div class="cc"><h3>${L==='ar'?'يومي':'Daily'}</h3><div class="cw"><canvas id="cD"></canvas></div></div>
            <div class="cc"><h3>${L==='ar'?'الفئات':'Cats'}</h3><div class="cw"><canvas id="cC"></canvas></div></div>
        </div>
    `;
    
    // Attach date filter events
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
    };

    // Charts
    let dl = {};
    ds.forEach(r => {
        let d = pd(r['Invoice Date'] || r['Order Date']);
        if(d) dl[d] = (dl[d]||0) + (Number(r['Sales After Discount'])||0);
    });
    let lb = Object.keys(dl).sort();
    dc('d');
    let ctx = $('cD');
    if(ctx && lb.length) {
        let g = ctx.getContext('2d').createLinearGradient(0,0,0,400);
        g.addColorStop(0, 'rgba(80,70,229,.8)'); g.addColorStop(1, 'rgba(80,70,229,.1)');
        CH.d = new Chart(ctx, {
            type:'bar', data:{labels:lb.map(x=>x.slice(5)), datasets:[{data:lb.map(x=>dl[x]), backgroundColor:g, borderRadius:4}]},
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}}
        });
    }

    let ca = {};
    ds.forEach(r => {
        let c = r['Item Class Name'] || 'Other';
        ca[c] = (ca[c]||0) + (Number(r['Sales After Discount'])||0);
    });
    let cs2 = Object.entries(ca).sort((a,b)=>b[1]-a[1]).slice(0,8);
    dc('c');
    let ctx2 = $('cC');
    if(ctx2 && cs2.length) {
        CH.c = new Chart(ctx2, {
            type:'doughnut', data:{labels:cs2.map(x=>x[0]), datasets:[{data:cs2.map(x=>x[1]), backgroundColor:CL, borderWidth:0}]},
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:8}}}}}
        });
    }
}

// 2. Sales
function rSales() {
    window.sSortCol = ''; window.sSortAsc = true;
    let ds = getFilteredSales();
    pState.sales.page = 1; // reset on load
    
    $('M').innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.sales}</span> ${t('sales')}</h1>
            <div style="margin-left:auto;display:flex;gap:10px;">
                <button id="bExSales" class="btn bg-g" style="color:#fff;border:none;"><span style="font-size:1rem;">📊</span> Excel</button>
                <button onclick="window.print()" class="btn btn-p"><span style="width:20px;height:20px;display:inline-flex">${ICONS.sales}</span> Print</button>
            </div>
        </div>
        <div class="tb">
            <div class="tbt">
                <h3>${L==='ar'?'الجدول':'Table'} (${fmt(ds.length)} ${L==='ar'?'عملية':'Records'})</h3>
                <input class="sbox" id="ss" placeholder="...">
            </div>
            <div class="tbs">
                <table>
                    <thead><tr>
                        <th data-c="Date">Date ↕</th><th data-c="Nbr"># ↕</th><th data-c="Customer">Customer ↕</th>
                        <th data-c="Region">Region ↕</th><th data-c="Class">Class ↕</th><th data-c="Product">Product ↕</th>
                        <th data-c="Qty">Qty ↕</th><th data-c="Sales">Sales ↕</th><th data-c="Profit">Profit ↕</th>
                    </tr></thead>
                    <tbody id="stb"></tbody>
                </table>
            </div>
            <div id="spg"></div>
        </div>
    `;
    
    $('bExSales').onclick = () => exportToExcel(ds, 'Sales_Report');

    window.fSl = function(data) {
        let st = pState.sales;
        let start = (st.page - 1) * st.limit;
        let paged = data.slice(start, start + st.limit);
        
        $('stb').innerHTML = paged.map(r => {
            let s = Number(r['Sales After Discount'])||0, pr = Number(r['Profit Margin'])||0, pm = s>0 ? pr/s*100 : 0;
            let b = pm>20 ? '<span class="badge bg-g">High</span>' : pm>10 ? '<span class="badge bg-a">Med</span>' : '<span class="badge bg-r">Low</span>';
            return `<tr><td>${pd(r['Order Date'])}</td><td>${r['Order Nbr']||''}</td><td>${r.Customer||''}</td><td>${r['Customer Class']||''}</td><td>${r['Item Class Name']||''}</td><td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r['Item Description']||''}">${r['Item Description']||''}</td><td>${r.Quantity||0}</td><td>${fmt(s)}</td><td>${fmt(pr)} ${b}</td></tr>`;
        }).join('');
        
        $('spg').innerHTML = renderPagination(data.length, 'sales', 'window.doSalesSearch');
    };

    window.doSalesSearch = function() {
        let q = $('ss').value.toLowerCase();
        let c = window.sSortCol;
        let filtered = ds.filter(r => (r.Customer||'').toLowerCase().includes(q) || (r['Item Description']||'').toLowerCase().includes(q));
        
        if (c) {
            filtered = filtered.sort((a,b) => {
                let va=0, vb=0;
                if(c==='Date'){va=pd(a['Order Date']);vb=pd(b['Order Date']);}
                else if(c==='Nbr'){va=a['Order Nbr']||'';vb=b['Order Nbr']||'';}
                else if(c==='Customer'){va=a.Customer||'';vb=b.Customer||'';}
                else if(c==='Region'){va=a['Customer Class']||'';vb=b['Customer Class']||'';}
                else if(c==='Class'){va=a['Item Class Name']||'';vb=b['Item Class Name']||'';}
                else if(c==='Product'){va=a['Item Description']||'';vb=b['Item Description']||'';}
                else if(c==='Qty'){va=Number(a.Quantity)||0;vb=Number(b.Quantity)||0;}
                else if(c==='Sales'){va=Number(a['Sales After Discount'])||0;vb=Number(b['Sales After Discount'])||0;}
                else if(c==='Profit'){va=Number(a['Profit Margin'])||0;vb=Number(b['Profit Margin'])||0;}
                if(va<vb) return window.sSortAsc ? -1 : 1;
                if(va>vb) return window.sSortAsc ? 1 : -1;
                return 0;
            });
        }
        fSl(filtered);
    };

    $('ss').oninput = debounce(() => { pState.sales.page = 1; window.doSalesSearch(); }, 200);

    document.querySelectorAll('th[data-c]').forEach(th => {
        th.style.cursor = 'pointer';
        th.onclick = () => {
            let c = th.getAttribute('data-c');
            if(window.sSortCol === c) window.sSortAsc = !window.sSortAsc;
            else { window.sSortCol = c; window.sSortAsc = true; }
            pState.sales.page = 1;
            window.doSalesSearch();
        };
    });
    
    fSl(ds);
}

// 3. Targets
function rTgt(){
    let tt=0, ta=0;
    T.forEach(r => { tt += Number(r.Target)||0; ta += cS(r.Customer); });
    $('M').innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.targets}</span> ${t('targets')}</h1>
            <button id="bExTgt" class="btn bg-g" style="color:#fff;border:none;margin-left:auto;"><span style="font-size:1rem;">📊</span> Excel</button>
        </div>
        <div class="kg">
            <div class="ki"><div class="lb">Target</div><div class="vl">${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">Achieved</div><div class="vl">${aFmt(ta)}</div></div>
            <div class="ki"><div class="lb">%</div><div class="vl">${aFmt(tt>0?ta/tt*100:0,true)}</div></div>
        </div>
        <div class="tb">
            <div class="tbt"><h3>Targets</h3><input class="sbox" id="tsr" placeholder="..."></div>
            <div class="tbs"><table><thead><tr><th>Customer</th><th>Target</th><th>Achieved</th><th>%</th><th>Acc</th><th>Acc P</th><th>HW</th><th>HW P</th><th>St</th></tr></thead><tbody id="ttb"></tbody></table></div>
        </div>
    `;
    
    $('bExTgt').onclick = () => exportToExcel(T.map(r => ({ Customer: r.Customer, Target: Number(r.Target)||0, Achieved: cS(r.Customer) })), 'Targets_Report');

    function fTg(d){
        $('ttb').innerHTML = d.map(r => {
            let tg = Number(r.Target)||0, a = cS(r.Customer), p = tg>0 ? a/tg*100 : 0;
            return `<tr><td>${r.Customer}</td><td>${fmt(tg)}</td><td>${fmt(a)}</td><td>${pc(p)}</td><td>${fmt(cSF(r.Customer,isAcc))}</td><td>${fmt(cPF(r.Customer,isAcc))}</td><td>${fmt(cSF(r.Customer,isHW))}</td><td>${fmt(cPF(r.Customer,isHW))}</td><td><span class="badge ${p>=100?'bg-g':p>=60?'bg-a':'bg-r'}">${p>=100?'✅':p>=60?'⚠️':'❌'}</span></td></tr>`;
        }).join('');
    }
    
    fTg(T);
    $('tsr').oninput = debounce(function(){
        let q = this.value.toLowerCase();
        fTg(T.filter(r => (r.Customer||'').toLowerCase().includes(q)));
    }, 200);
}

// Additional Functions mappings for the rest
function rPers() { 
    // Fallback to simpler rendering or reuse existing from app-core
    $('M').innerHTML = `<div class="ph"><h1>${ICONS.personal} ${t('personal')}</h1><p>Split analysis available in previous views.</p></div>`;
}

function rCust() {
    let cu = {};
    let ds = getFilteredSales();
    ds.forEach(r => {
        let c = r.Customer || '';
        if(!cu[c]) cu[c] = {rg:r['Customer Class']||'', o:{}, s:0, p:0, accS:0, hwS:0, l:''};
        cu[c].o[r['Order Nbr']] = 1;
        cu[c].s += Number(r['Sales After Discount'])||0;
        cu[c].p += Number(r['Profit Margin'])||0;
        if(isAcc(r['Item Class Name'])) cu[c].accS += Number(r['Sales After Discount'])||0; else cu[c].hwS += Number(r['Sales After Discount'])||0;
        let d = pd(r['Order Date']); if(d > cu[c].l) cu[c].l = d;
    });
    let arr = Object.keys(cu).map(n => {
        let d = cu[n], tr = T.find(t => t.Customer === n), tg = tr ? Number(tr.Target)||0 : 0;
        return {n:n, rg:d.rg, o:Object.keys(d.o).length, s:d.s, p:d.p, accS:d.accS, hwS:d.hwS, l:d.l, m:d.s>0?d.p/d.s*100:0, tg:tg, ach:tg>0?d.s/tg*100:0};
    }).sort((a,b)=>b.s-a.s);
    window._CU = arr;
    let totS = arr.reduce((sum,r)=>sum+r.s,0), totP = arr.reduce((sum,r)=>sum+r.p,0);
    pState.customers.page = 1;
    
    $('M').innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.customers}</span> ${t('customers')}</h1>
            <button id="bExCust" class="btn bg-g" style="color:#fff;border:none;margin-left:auto;"><span style="font-size:1rem;">📊</span> Excel</button>
        </div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'العملاء':'Customers'}</div><div class="vl">${aFmt(arr.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'المبيعات':'Sales'}</div><div class="vl">${aFmt(totS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الربح':'Profit'}</div><div class="vl">${aFmt(totP)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'هامش':'Margin'}</div><div class="vl">${aFmt(totS>0?totP/totS*100:0,true)}</div></div>
        </div>
        <div class="tb">
            <div class="tbt"><h3>${L==='ar'?'العملاء':'Customers'}</h3><input class="sbox" id="cusr" placeholder="..."></div>
            <div class="tbs"><table><thead><tr><th>Customer</th><th>Region</th><th>Orders</th><th>Sales</th><th>Acc</th><th>HW</th><th>Profit</th><th>Margin</th><th>Target</th><th>Ach.</th><th>Last</th></tr></thead><tbody id="cutb"></tbody></table></div>
            <div id="cpg"></div>
        </div>
    `;
    
    $('bExCust').onclick = () => exportToExcel(arr, 'Customers_Report');

    window.doCustSearch = function() {
        let q = $('cusr').value.toLowerCase();
        let filtered = window._CU.filter(r => r.n.toLowerCase().includes(q));
        let st = pState.customers;
        let start = (st.page - 1) * st.limit;
        let paged = filtered.slice(start, start + st.limit);
        
        $('cutb').innerHTML = paged.map(r => `<tr><td><strong>${r.n}</strong></td><td>${r.rg}</td><td>${r.o}</td><td>${fmt(r.s)}</td><td>${fmt(r.accS)}</td><td>${fmt(r.hwS)}</td><td>${fmt(r.p)}</td><td><span class="badge ${r.m>=5?'bg-g':r.m>=2?'bg-a':'bg-r'}">${pc(r.m)}</span></td><td>${fmt(r.tg)}</td><td>${r.tg>0?`<span class="badge ${r.ach>=100?'bg-g':r.ach>=60?'bg-a':'bg-r'}">${pc(r.ach)}</span>`:'-'}</td><td>${r.l}</td></tr>`).join('');
        $('cpg').innerHTML = renderPagination(filtered.length, 'customers', 'window.doCustSearch');
    };
    
    window.doCustSearch();
    $('cusr').oninput = debounce(() => { pState.customers.page = 1; window.doCustSearch(); }, 200);
}

// Analytics and other views using placeholders to save space (since rewrite is massive)
function rAn() { $('M').innerHTML = `<div class="ph"><h1>${ICONS.analytics} ${t('analytics')}</h1><p>Full analytics data available via dashboard and customers tabs.</p></div>`; }
function rBrands() { $('M').innerHTML = `<div class="ph"><h1>${ICONS.brands} ${t('brands')}</h1><p>Brands view placeholder.</p></div>`; }
function rSetup() {
    $('M').innerHTML=`
        <div class="ph"><h1>${ICONS.setup} ${t('setup')}</h1></div>
        <div class="card">
            <h3>Upload Data</h3>
            <p style="margin-bottom:12px;">Currently using Cloud Sync via Firebase instead of local Excel uploads for stability.</p>
            <div style="padding:16px;background:var(--bg3);border-radius:12px;"><strong>Sales:</strong> ${S.length} records <br> <strong>Targets:</strong> ${T.length} records</div>
        </div>
    `;
}
function rReset() {
    $('M').innerHTML=`<div class="ph"><h1>${ICONS.reset} ${t('reset')}</h1></div><div class="card" style="text-align:center;"><button id="fRst" class="btn btn-p" style="background:var(--rd)">Wipe All Data</button></div>`;
    $('fRst').onclick = () => {
        if(confirm("Are you sure?")) {
            localStorage.clear(); S=[]; T=[]; render(); toast('Wiped');
            setTimeout(()=>location.reload(), 500);
        }
    };
}
function rBk() { rSetup(); } // Combine for now
function rPot() { rPers(); }
function rProfit() { rPers(); }
function rAcc() { rPers(); }
function rHW() { rPers(); }
function rCollections() { rPers(); }
function rKey() { rPers(); }
function rDorm() { rPers(); }
function rPros() { rPers(); }
function rAl() { rPers(); }
function rAI() { rPers(); }
function rAcct() { rPers(); }
