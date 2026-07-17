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

// 4. Personal Target
function rPers() {
    let myEmail = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : '';
    let myS = S, ts = 0, tp = 0;
    let savedTarget = localStorage.getItem('personal_target');
    let savedProfitTarget = localStorage.getItem('personal_profit_target');
    
    let defaultTT = 0, defaultTPT = 0;
    T.forEach(r => { defaultTT += Number(r.Target)||0; defaultTPT += Number(r['Profit Target'])||0; });
    
    let tt = savedTarget !== null ? Number(savedTarget) : defaultTT;
    let tpt = savedProfitTarget !== null ? Number(savedProfitTarget) : defaultTPT;
    
    myS.forEach(r => { ts += Number(r['Sales After Discount'])||0; tp += Number(r['Profit Margin'])||0; });
    
    let ap = tt > 0 ? ts/tt*100 : 0, pp = tpt > 0 ? tp/tpt*100 : 0;
    let remS = Math.max(0, tt - ts);
    let remP = Math.max(0, tpt - tp);

    // Monthly breakdown
    let monthly = {};
    myS.forEach(r => {
        let d = pd(r['Order Date']); if(!d) return;
        let m = d.slice(0,7);
        if(!monthly[m]) monthly[m] = {s:0,p:0};
        monthly[m].s += Number(r['Sales After Discount'])||0;
        monthly[m].p += Number(r['Profit Margin'])||0;
    });
    let months = Object.keys(monthly).sort();

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.personal}</span> ${t('personal')}</h1></div>
        
        <div class="card" style="margin-bottom:24px; padding:20px; border-left:4px solid var(--p);">
            <h3 style="margin-bottom:16px;">${L==='ar'?'إعدادات التارجت الشخصي':'Personal Target Settings'}</h3>
            <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
                <div style="flex:1; min-width:200px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?'تارجت المبيعات':'Sales Target'}</label>
                    <input type="number" id="inPTarget" value="${tt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="flex:1; min-width:200px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?'تارجت الأرباح':'Profit Target'}</label>
                    <input type="number" id="inPProfit" value="${tpt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="min-width:120px;">
                    <button id="bSaveTarget" class="btn btn-p" style="width:100%; padding:10px; height:42px;">${L==='ar'?'حفظ':'Save'}</button>
                </div>
            </div>
        </div>

        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'المبيعات':'Sales'}</div><div class="vl">${aFmt(ts)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'التارجت':'Target'}</div><div class="vl">${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'التحقيق':'Ach.'}</div><div class="vl">${aFmt(ap,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'المتبقي (مبيعات)':'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(remS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الربح':'Profit'}</div><div class="vl">${aFmt(tp)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'تارجت الربح':'Target'}</div><div class="vl">${aFmt(tpt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'النسبة':'Margin'}</div><div class="vl">${aFmt(ts>0?tp/ts*100:0,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'المتبقي (أرباح)':'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(remP)}</div></div>
        </div>
        <div class="rg">${ring(L==='ar'?'المبيعات':'Sales', ap, tt)}${ring(L==='ar'?'الربح':'Profit', pp, tpt)}</div>
        <div class="tb"><div class="tbt"><h3>${L==='ar'?'شهري':'Monthly'}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'الشهر':'Month'}</th><th>${L==='ar'?'المبيعات':'Sales'}</th><th>${L==='ar'?'الربح':'Profit'}</th><th>${L==='ar'?'النسبة':'Margin'}</th></tr></thead>
        <tbody>${months.map(m => `<tr><td>${m}</td><td>${fmt(monthly[m].s)}</td><td>${fmt(monthly[m].p)}</td><td><span class="badge ${monthly[m].s>0&&monthly[m].p/monthly[m].s*100>=5?'bg-g':'bg-a'}">${pc(monthly[m].s>0?monthly[m].p/monthly[m].s*100:0)}</span></td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    
    $('bSaveTarget').onclick = () => {
        localStorage.setItem('personal_target', $('inPTarget').value);
        localStorage.setItem('personal_profit_target', $('inPProfit').value);
        toast(L==='ar'?'تم الحفظ!':'Saved!');
        rPers();
    };
    initAnm && initAnm();
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
function rReset() {
    $('M').innerHTML=`<div class="ph"><h1>${ICONS.reset} ${t('reset')}</h1></div><div class="card" style="text-align:center;"><p style="margin-bottom:16px;color:var(--tx2);">${L==='ar'?'هتمسح كل البيانات المحفوظة على الجهاز. هذا لا يؤثر على بيانات السحابة.':'This will clear all locally stored data. Cloud data is not affected.'}</p><button id="fRst" class="btn btn-p" style="background:var(--rd)">${L==='ar'?'مسح كل البيانات':'Wipe All Local Data'}</button></div>`;
    $('fRst').onclick = () => {
        if(confirm(L==='ar'?'متأكد؟':'Are you sure?')) {
            localStorage.clear(); S=[]; T=[]; C=[]; D=[];
            toast(L==='ar'?'تم المسح':'Wiped');
            setTimeout(()=>location.reload(), 500);
        }
    };
}

// Brands
function rBrands() {
    let brands = {};
    S.forEach(r => {
        let b = r['Brand'] || r['Item Class Name'] || 'Other';
        if(!brands[b]) brands[b] = {s:0,p:0,qty:0};
        brands[b].s += Number(r['Sales After Discount'])||0;
        brands[b].p += Number(r['Profit Margin'])||0;
        brands[b].qty += Number(r.Quantity)||0;
    });
    let arr = Object.entries(brands).sort((a,b)=>b[1].s-a[1].s);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.brands}</span> ${t('brands')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'البراندات':'Brands'}</div><div class="vl">${aFmt(arr.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'المبيعات':'Sales'}</div><div class="vl">${aFmt(arr.reduce((s,x)=>s+x[1].s,0))}</div></div>
        </div>
        <div class="tb"><div class="tbt"><h3>${t('brands')}</h3><input class="sbox" id="bsr" placeholder="..."></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'البراند':'Brand'}</th><th>${L==='ar'?'المبيعات':'Sales'}</th><th>${L==='ar'?'الربح':'Profit'}</th><th>${L==='ar'?'الهامش':'Margin'}</th><th>${L==='ar'?'الكمية':'Qty'}</th></tr></thead>
        <tbody id="brtb">${arr.map(([n,d])=>`<tr><td><strong>${n}</strong></td><td>${fmt(d.s)}</td><td>${fmt(d.p)}</td><td><span class="badge ${d.s>0&&d.p/d.s*100>=5?'bg-g':'bg-a'}">${pc(d.s>0?d.p/d.s*100:0)}</span></td><td>${fmt(d.qty)}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    $('bsr').oninput = debounce(function() {
        let q = this.value.toLowerCase();
        $('brtb').innerHTML = arr.filter(([n])=>n.toLowerCase().includes(q)).map(([n,d])=>`<tr><td><strong>${n}</strong></td><td>${fmt(d.s)}</td><td>${fmt(d.p)}</td><td><span class="badge ${d.s>0&&d.p/d.s*100>=5?'bg-g':'bg-a'}">${pc(d.s>0?d.p/d.s*100:0)}</span></td><td>${fmt(d.qty)}</td></tr>`).join('');
    }, 200);
    initAnm && initAnm();
}

// Analytics
function rAn() {
    let ds = getFilteredSales();
    let monthly = {}, cats = {}, regions = {};
    ds.forEach(r => {
        let d = pd(r['Order Date']); if(!d) return;
        let m = d.slice(0,7);
        if(!monthly[m]) monthly[m] = {s:0,p:0};
        monthly[m].s += Number(r['Sales After Discount'])||0;
        monthly[m].p += Number(r['Profit Margin'])||0;
        let c = r['Item Class Name']||'Other';
        cats[c] = (cats[c]||0) + (Number(r['Sales After Discount'])||0);
        let rg = r['Customer Class']||'Other';
        regions[rg] = (regions[rg]||0) + (Number(r['Sales After Discount'])||0);
    });
    let months = Object.keys(monthly).sort();
    let topCats = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,8);
    let topReg = Object.entries(regions).sort((a,b)=>b[1]-a[1]);

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.analytics}</span> ${t('analytics')}</h1></div>
        <div class="cg">
            <div class="cc"><h3>${L==='ar'?'المبيعات الشهرية':'Monthly Sales'}</h3><div class="cw"><canvas id="anM"></canvas></div></div>
            <div class="cc"><h3>${L==='ar'?'الفئات':'Categories'}</h3><div class="cw"><canvas id="anC"></canvas></div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;" class="rg-grid">
            <div class="card">
                <h3 style="margin-bottom:12px;">📍 ${L==='ar'?'المناطق':'Regions'}</h3>
                ${topReg.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:0.8rem;"><span>${n}</span><strong>${fmt(v)}</strong></div>`).join('')}
            </div>
            <div class="card">
                <h3 style="margin-bottom:12px;">📦 ${L==='ar'?'الفئات':'Top Categories'}</h3>
                ${topCats.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:0.8rem;"><span>${n}</span><strong>${fmt(v)}</strong></div>`).join('')}
            </div>
        </div>
    `;
    dc('anM'); dc('anC');
    let ctxM = $('anM');
    if(ctxM && months.length) {
        CH.anM = new Chart(ctxM, {
            type:'line', data:{labels:months.map(x=>x.slice(5)), datasets:[{label:'Sales',data:months.map(m=>monthly[m].s),borderColor:'#5046e5',backgroundColor:'rgba(80,70,229,.1)',fill:true,tension:0.4},{label:'Profit',data:months.map(m=>monthly[m].p),borderColor:'#0fa87e',backgroundColor:'rgba(15,168,126,.1)',fill:true,tension:0.4}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}}}
        });
    }
    let ctxC = $('anC');
    if(ctxC && topCats.length) {
        CH.anC = new Chart(ctxC, {
            type:'doughnut', data:{labels:topCats.map(x=>x[0]), datasets:[{data:topCats.map(x=>x[1]),backgroundColor:CL,borderWidth:0}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:8}}}}}
        });
    }
    initAnm && initAnm();
}

// Profit Margin
function rProfit() {
    let ds = getFilteredSales();
    let cu = {};
    ds.forEach(r => {
        let c = r.Customer||'';
        if(!cu[c]) cu[c] = {s:0,p:0};
        cu[c].s += Number(r['Sales After Discount'])||0;
        cu[c].p += Number(r['Profit Margin'])||0;
    });
    let arr = Object.entries(cu).map(([n,d])=>({n,s:d.s,p:d.p,m:d.s>0?d.p/d.s*100:0})).sort((a,b)=>b.m-a.m);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.profit}</span> ${t('profit')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'إجمالي الربح':'Total Profit'}</div><div class="vl">${aFmt(arr.reduce((s,x)=>s+x.p,0))}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'متوسط الهامش':'Avg Margin'}</div><div class="vl">${aFmt(arr.length>0?arr.reduce((s,x)=>s+x.m,0)/arr.length:0,true)}</div></div>
        </div>
        <div class="tb"><div class="tbt"><h3>${t('profit')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'العميل':'Customer'}</th><th>${L==='ar'?'المبيعات':'Sales'}</th><th>${L==='ar'?'الربح':'Profit'}</th><th>${L==='ar'?'الهامش':'Margin'}</th></tr></thead>
        <tbody>${arr.map(r=>`<tr><td><strong>${r.n}</strong></td><td>${fmt(r.s)}</td><td>${fmt(r.p)}</td><td><span class="badge ${r.m>=10?'bg-g':r.m>=5?'bg-a':'bg-r'}">${pc(r.m)}</span></td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    initAnm && initAnm();
}

// Accessories
function rAcc() {
    let ds = getFilteredSales().filter(r => isAcc(r['Item Class Name']));
    let tot = ds.reduce((s,r)=>s+(Number(r['Sales After Discount'])||0),0);
    let prof = ds.reduce((s,r)=>s+(Number(r['Profit Margin'])||0),0);
    let cats = {};
    ds.forEach(r => { let c=r['Item Class Name']||'Other'; cats[c]=(cats[c]||0)+(Number(r['Sales After Discount'])||0); });
    let catArr = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.accessories}</span> ${t('accessories')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'المبيعات':'Sales'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الربح':'Profit'}</div><div class="vl">${aFmt(prof)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الهامش':'Margin'}</div><div class="vl">${aFmt(tot>0?prof/tot*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'السجلات':'Records'}</div><div class="vl">${aFmt(ds.length)}</div></div>
        </div>
        <div class="cg"><div class="cc"><h3>${L==='ar'?'الفئات':'Categories'}</h3><div class="cw"><canvas id="accC"></canvas></div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('accessories')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'الفئة':'Category'}</th><th>${L==='ar'?'المبيعات':'Sales'}</th><th>%</th></tr></thead>
        <tbody>${catArr.map(([n,v])=>`<tr><td>${n}</td><td>${fmt(v)}</td><td>${pc(tot>0?v/tot*100:0)}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    dc('accC');
    let ctx = $('accC');
    if(ctx && catArr.length) { CH.accC = new Chart(ctx, {type:'doughnut',data:{labels:catArr.map(x=>x[0]),datasets:[{data:catArr.map(x=>x[1]),backgroundColor:CL,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:8}}}}}}); }
    initAnm && initAnm();
}

// Hardware
function rHW() {
    let ds = getFilteredSales().filter(r => isHW(r['Item Class Name']));
    let tot = ds.reduce((s,r)=>s+(Number(r['Sales After Discount'])||0),0);
    let prof = ds.reduce((s,r)=>s+(Number(r['Profit Margin'])||0),0);
    let cats = {};
    ds.forEach(r => { let c=r['Item Class Name']||'Other'; cats[c]=(cats[c]||0)+(Number(r['Sales After Discount'])||0); });
    let catArr = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.hardware}</span> ${t('hardware')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'المبيعات':'Sales'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الربح':'Profit'}</div><div class="vl">${aFmt(prof)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الهامش':'Margin'}</div><div class="vl">${aFmt(tot>0?prof/tot*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'السجلات':'Records'}</div><div class="vl">${aFmt(ds.length)}</div></div>
        </div>
        <div class="cg"><div class="cc"><h3>${L==='ar'?'الفئات':'Categories'}</h3><div class="cw"><canvas id="hwC"></canvas></div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('hardware')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'الفئة':'Category'}</th><th>${L==='ar'?'المبيعات':'Sales'}</th><th>%</th></tr></thead>
        <tbody>${catArr.map(([n,v])=>`<tr><td>${n}</td><td>${fmt(v)}</td><td>${pc(tot>0?v/tot*100:0)}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    dc('hwC');
    let ctx = $('hwC');
    if(ctx && catArr.length) { CH.hwC = new Chart(ctx, {type:'doughnut',data:{labels:catArr.map(x=>x[0]),datasets:[{data:catArr.map(x=>x[1]),backgroundColor:CL,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:8}}}}}}); }
    initAnm && initAnm();
}

// Collections
function rCollections() {
    let tot = C.reduce((s,r)=>s+(Number(r['Amount']||r['amount']||r['Collection']||0)),0);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.collections}</span> ${t('collections')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'إجمالي التحصيلات':'Total Collections'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'السجلات':'Records'}</div><div class="vl">${aFmt(C.length)}</div></div>
        </div>
        ${C.length>0 ? `<div class="tb"><div class="tbt"><h3>${t('collections')}</h3></div>
        <div class="tbs"><table><thead><tr>${Object.keys(C[0]||{}).slice(0,6).map(k=>`<th>${k}</th>`).join('')}</tr></thead>
        <tbody>${C.slice(0,100).map(r=>`<tr>${Object.keys(C[0]).slice(0,6).map(k=>`<td>${r[k]||''}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div></div>` : `<div class="card"><p style="color:var(--tx2);text-align:center;">${L==='ar'?'لا توجد بيانات تحصيلات. ارفع ملف من صفحة الإعدادات.':'No collections data. Upload a file from the Files page.'}</p></div>`}
    `;
    initAnm && initAnm();
}

// Key Accounts (top 20% customers)
function rKey() {
    let cu = {};
    S.forEach(r => {
        let c = r.Customer||'';
        if(!cu[c]) cu[c] = {s:0,p:0,o:{}};
        cu[c].s += Number(r['Sales After Discount'])||0;
        cu[c].p += Number(r['Profit Margin'])||0;
        cu[c].o[r['Order Nbr']] = 1;
    });
    let arr = Object.entries(cu).map(([n,d])=>({n,s:d.s,p:d.p,o:Object.keys(d.o).length,m:d.s>0?d.p/d.s*100:0})).sort((a,b)=>b.s-a.s);
    let totS = arr.reduce((s,x)=>s+x.s,0);
    let cumS = 0, keyAcc = [];
    for(let r of arr) { cumS+=r.s; keyAcc.push(r); if(cumS/totS>=0.8) break; }
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.keyacc}</span> ${t('keyacc')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'العملاء المميزون':'Key Accounts'}</div><div class="vl">${aFmt(keyAcc.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'مساهمتهم':'Contribution'}</div><div class="vl">${aFmt(totS>0?keyAcc.reduce((s,x)=>s+x.s,0)/totS*100:0,true)}</div></div>
        </div>
        <div class="tb"><div class="tbt"><h3>${t('keyacc')} — ${L==='ar'?'80% من المبيعات':'80% of Sales'}</h3></div>
        <div class="tbs"><table><thead><tr><th>#</th><th>${L==='ar'?'العميل':'Customer'}</th><th>${L==='ar'?'المبيعات':'Sales'}</th><th>${L==='ar'?'الربح':'Profit'}</th><th>${L==='ar'?'الهامش':'Margin'}</th><th>${L==='ar'?'الأوردرات':'Orders'}</th></tr></thead>
        <tbody>${keyAcc.map((r,i)=>`<tr><td><span class="badge bg-g">${i+1}</span></td><td><strong>${r.n}</strong></td><td>${fmt(r.s)}</td><td>${fmt(r.p)}</td><td><span class="badge ${r.m>=5?'bg-g':r.m>=2?'bg-a':'bg-r'}">${pc(r.m)}</span></td><td>${r.o}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    initAnm && initAnm();
}

// Dormant Customers (no purchase in 60+ days)
function rDorm() {
    let today = new Date();
    let cu = {};
    S.forEach(r => {
        let c = r.Customer||''; let d = pd(r['Order Date']);
        if(!cu[c] || d > cu[c]) cu[c] = d;
    });
    let dormant = Object.entries(cu).map(([n,last]) => {
        let days = Math.floor((today - new Date(last)) / 86400000);
        return {n, last, days};
    }).filter(r=>r.days>=60).sort((a,b)=>b.days-a.days);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dormant}</span> ${t('dormant')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?'عملاء خاملون':'Dormant Customers'}</div><div class="vl">${aFmt(dormant.length)}</div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('dormant')} — ${L==='ar'?'لم يشتروا منذ 60+ يوم':'No purchase in 60+ days'}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'العميل':'Customer'}</th><th>${L==='ar'?'آخر شراء':'Last Purchase'}</th><th>${L==='ar'?'الأيام':'Days Ago'}</th><th>${L==='ar'?'الحالة':'Status'}</th></tr></thead>
        <tbody>${dormant.map(r=>`<tr><td><strong>${r.n}</strong></td><td>${r.last}</td><td>${r.days}</td><td><span class="badge ${r.days>=120?'bg-r':'bg-a'}">${r.days>=120?(L==='ar'?'غائب':'Lost'):(L==='ar'?'خامل':'Dormant')}</span></td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
}

// Prospects (customers in T but not in S)
function rPros() {
    let activeCustomers = new Set(S.map(r=>r.Customer||''));
    let prospects = T.filter(r=>!activeCustomers.has(r.Customer));
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.prospects}</span> ${t('prospects')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?'محتملون':'Prospects'}</div><div class="vl">${aFmt(prospects.length)}</div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('prospects')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'العميل':'Customer'}</th><th>${L==='ar'?'التارجت':'Target'}</th></tr></thead>
        <tbody>${prospects.map(r=>`<tr><td><strong>${r.Customer}</strong></td><td>${fmt(Number(r.Target)||0)}</td></tr>`).join('')}${prospects.length===0?`<tr><td colspan="2" style="text-align:center;color:var(--tx2)">${L==='ar'?'لا يوجد':'None'}</td></tr>`:''}</tbody>
        </table></div></div>
    `;
}

// Opportunities (customers below 50% of target)
function rPot() {
    let cu = {};
    S.forEach(r => { let c=r.Customer||''; cu[c]=(cu[c]||0)+(Number(r['Sales After Discount'])||0); });
    let opps = T.map(r => {
        let tg = Number(r.Target)||0, ach = cu[r.Customer]||0, pct = tg>0?ach/tg*100:0;
        return {n:r.Customer, tg, ach, pct, gap: tg-ach};
    }).filter(r=>r.pct<80 && r.tg>0).sort((a,b)=>b.gap-a.gap);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.potential}</span> ${t('potential')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'فرص':'Opportunities'}</div><div class="vl">${aFmt(opps.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'الفجوة':'Total Gap'}</div><div class="vl">${aFmt(opps.reduce((s,r)=>s+r.gap,0))}</div></div>
        </div>
        <div class="tb"><div class="tbt"><h3>${t('potential')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'العميل':'Customer'}</th><th>${L==='ar'?'التارجت':'Target'}</th><th>${L==='ar'?'التحقيق':'Achieved'}</th><th>%</th><th>${L==='ar'?'الفجوة':'Gap'}</th></tr></thead>
        <tbody>${opps.map(r=>`<tr><td><strong>${r.n}</strong></td><td>${fmt(r.tg)}</td><td>${fmt(r.ach)}</td><td><span class="badge ${r.pct>=60?'bg-a':'bg-r'}">${pc(r.pct)}</span></td><td style="color:var(--rd);font-weight:bold;">${fmt(r.gap)}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
}

// Alerts
function rAl() {
    let today = new Date();
    let alerts = [];
    // Dormant alerts
    let cu = {};
    S.forEach(r => { let c=r.Customer||''; let d=pd(r['Order Date']); if(!cu[c]||d>cu[c]) cu[c]=d; });
    Object.entries(cu).forEach(([n,last]) => {
        let days = Math.floor((today - new Date(last)) / 86400000);
        if(days >= 60) alerts.push({type:'warn', icon:'💤', msg:`${n} — ${L==='ar'?'لم يشتر منذ':'No purchase since'} ${days} ${L==='ar'?'يوم':'days'}`});
    });
    // Low target alerts
    let cuS = {};
    S.forEach(r => { let c=r.Customer||''; cuS[c]=(cuS[c]||0)+(Number(r['Sales After Discount'])||0); });
    T.forEach(r => {
        let tg=Number(r.Target)||0, ach=cuS[r.Customer]||0, pct=tg>0?ach/tg*100:0;
        if(pct<50 && tg>0) alerts.push({type:'danger', icon:'⚠️', msg:`${r.Customer} — ${L==='ar'?'التحقيق':'Achievement'} ${pc(pct)}`});
    });
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.alerts}</span> ${t('alerts')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?'التنبيهات':'Alerts'}</div><div class="vl">${aFmt(alerts.length)}</div></div></div>
        <div class="card">
            ${alerts.length===0?`<p style="text-align:center;color:var(--tx2);">✅ ${L==='ar'?'لا توجد تنبيهات':'No alerts'}</p>`:alerts.map(a=>`<div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:var(--bg3);border-radius:8px;border-left:3px solid ${a.type==='danger'?'var(--rd)':'var(--am)'}"><span style="font-size:1.2rem;">${a.icon}</span><span style="font-size:0.85rem;">${a.msg}</span></div>`).join('')}
        </div>
    `;
}

// AI Recommendations
function rAI() {
    let ds = getFilteredSales();
    let cu = {};
    ds.forEach(r => {
        let c=r.Customer||'';
        if(!cu[c]) cu[c] = {s:0,p:0,o:{},last:'',accS:0,hwS:0};
        cu[c].s += Number(r['Sales After Discount'])||0;
        cu[c].p += Number(r['Profit Margin'])||0;
        cu[c].o[r['Order Nbr']]=1;
        let d=pd(r['Order Date']); if(d>cu[c].last) cu[c].last=d;
        if(isAcc(r['Item Class Name'])) cu[c].accS+=Number(r['Sales After Discount'])||0;
        else if(isHW(r['Item Class Name'])) cu[c].hwS+=Number(r['Sales After Discount'])||0;
    });
    let insights = [];
    let arr = Object.entries(cu).map(([n,d])=>({n,...d,o:Object.keys(d.o).length,m:d.s>0?d.p/d.s*100:0})).sort((a,b)=>b.s-a.s);
    let today = new Date();
    arr.slice(0,5).forEach(r => insights.push({icon:'⭐',color:'var(--gn)',text:`${r.n}: ${L==='ar'?'أفضل عميل بمبيعات':'Top customer with'} ${fmt(r.s)}`}));
    arr.filter(r=>r.m<5&&r.s>10000).slice(0,3).forEach(r => insights.push({icon:'💡',color:'var(--am)',text:`${r.n}: ${L==='ar'?'هامش ربح منخفض':'Low margin'} (${pc(r.m)}) — ${L==='ar'?'يحتاج مراجعة أسعار':'Review pricing'}`}));
    arr.filter(r=>{ let days=Math.floor((today-new Date(r.last))/86400000); return days>=45&&days<90; }).slice(0,3).forEach(r => insights.push({icon:'🔔',color:'var(--am)',text:`${r.n}: ${L==='ar'?'يحتاج متابعة — لم يشتر منذ':'Needs follow-up — last purchase was'} ${Math.floor((today-new Date(r.last))/86400000)} ${L==='ar'?'يوم':'days ago'}`}));
    arr.filter(r=>r.accS===0&&r.hwS>0).slice(0,3).forEach(r => insights.push({icon:'🎯',color:'var(--am)',text:`${r.n}: ${L==='ar'?'لم يشتر أكسسوارات — فرصة بيع إضافية':'No accessories — upsell opportunity'}`}));
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.ai}</span> ${t('ai')}</h1></div>
        <div class="card">
            <h3 style="margin-bottom:16px;">🤖 ${L==='ar'?'توصيات ذكية بناءً على بياناتك':'Smart Insights Based on Your Data'}</h3>
            ${insights.length===0?`<p style="color:var(--tx2);text-align:center;">${L==='ar'?'ارفع بياناتك للحصول على توصيات':'Upload your data to get AI insights'}</p>`:insights.map(i=>`<div style="display:flex;gap:12px;padding:12px;margin-bottom:10px;background:var(--bg3);border-radius:10px;border-left:3px solid ${i.color};"><span style="font-size:1.3rem;">${i.icon}</span><span style="font-size:0.85rem;line-height:1.5;">${i.text}</span></div>`).join('')}
        </div>
    `;
}

// Account
function rAcct() {
    let user = (typeof currentUser !== 'undefined') ? currentUser : null;
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.account}</span> ${t('account')}</h1></div>
        <div class="card" style="text-align:center;">
            <div style="width:72px;height:72px;border-radius:50%;background:var(--am);color:#fff;font-size:2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">👤</div>
            <h3>${user ? user.email : (L==='ar'?'غير متصل':'Not logged in')}</h3>
            <p style="color:var(--tx2);font-size:0.8rem;margin:8px 0 20px;">${L==='ar'?'مستخدم نشط':'Active User'}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${S.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?'مبيعات':'Sales'}</div></div>
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${T.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?'تارجت':'Targets'}</div></div>
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${C.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?'تحصيلات':'Collections'}</div></div>
            </div>
            <button class="btn btn-p" onclick="P='settings';buildNav();render();" style="width:100%;margin-bottom:10px;">⚙️ ${t('settings')}</button>
            <button class="btn" onclick="logout();" style="width:100%;background:var(--rd);color:#fff;border:none;">${t('logout')}</button>
        </div>
    `;
}

// Backup
function rBk() {
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.backup}</span> ${t('backup')}</h1></div>
        <div class="card">
            <h3 style="margin-bottom:12px;">⬇️ ${L==='ar'?'تصدير البيانات':'Export Data'}</h3>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button class="btn bg-g" id="bkSales" style="color:#fff;border:none;">📊 ${L==='ar'?'تصدير المبيعات':'Export Sales'} (${S.length})</button>
                <button class="btn bg-g" id="bkTgt" style="color:#fff;border:none;">🎯 ${L==='ar'?'تصدير التارجت':'Export Targets'} (${T.length})</button>
                <button class="btn bg-g" id="bkPay" style="color:#fff;border:none;">💰 ${L==='ar'?'تصدير التحصيلات':'Export Collections'} (${C.length})</button>
            </div>
        </div>
    `;
    $('bkSales').onclick = () => S.length ? exportToExcel(S, 'Sales_Backup') : toast(L==='ar'?'لا توجد بيانات':'No data');
    $('bkTgt').onclick   = () => T.length ? exportToExcel(T, 'Targets_Backup') : toast(L==='ar'?'لا توجد بيانات':'No data');
    $('bkPay').onclick   = () => C.length ? exportToExcel(C, 'Collections_Backup') : toast(L==='ar'?'لا توجد بيانات':'No data');
}




function rSetup() {
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.setup}</span> ${t('setup')}</h1></div>
        <div class="card">
            <h3 style="margin-bottom:12px;">${L==='ar'?'رفع ملفات Excel':'Upload Excel Files'}</h3>
            <p style="margin-bottom:16px;color:var(--tx2);font-size:0.85rem;">${L==='ar'?'ارفع ملف Excel الخاص بالمبيعات والتارجت والتحصيلات لتحديث البيانات.':'Upload your Sales, Target and Collections Excel files to update the data.'}</p>
            <div style="background:var(--gn);color:#fff;padding:10px;border-radius:8px;margin-bottom:16px;font-size:0.9rem;display:flex;align-items:center;gap:8px;">
                ☁️ <strong>${L==='ar'?'الرفع السحابي مفعل':'Cloud Sync Active'}</strong>
            </div>
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fSales" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">📊 ${L==='ar'?'ملف المبيعات':'Sales File'}</label>
                    <input type="file" id="fSales" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${S.length} ${L==='ar'?'سجل محمّل حالياً':'records currently loaded'}</p>
                </div>
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fTarget" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">🎯 ${L==='ar'?'ملف التارجت':'Target File'}</label>
                    <input type="file" id="fTarget" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${T.length} ${L==='ar'?'سجل محمّل حالياً':'records currently loaded'}</p>
                </div>
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fPay" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">💰 ${L==='ar'?'ملف التحصيلات':'Collections File'}</label>
                    <input type="file" id="fPay" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${C.length} ${L==='ar'?'سجل محمّل حالياً':'records currently loaded'}</p>
                </div>
            </div>
            <button id="bUpload" class="btn btn-p" style="margin-top:20px;width:100%;padding:12px;font-size:1.1rem;">⬆️ ${L==='ar'?'رفع وتحديث البيانات':'Upload & Update Data'}</button>
        </div>
    `;
    function parseFile(file, cb) {
        let reader = new FileReader();
        reader.onload = e => {
            try {
                let wb = XLSX.read(e.target.result, {type:'array'});
                let ws = wb.Sheets[wb.SheetNames[0]];
                cb(XLSX.utils.sheet_to_json(ws));
            } catch(err) { toast('❌ Error reading file'); }
        };
        reader.readAsArrayBuffer(file);
    }
    $('bUpload').onclick = () => {
        let done = 0, total = 0;
        let fS = $('fSales').files[0], fT = $('fTarget').files[0], fP = $('fPay').files[0];
        if(!fS && !fT && !fP) { toast(L==='ar'?'اختار ملف الأول!':'Choose a file first!'); return; }
        if(fS) { total++; parseFile(fS, d => { S = d; sv('salesData', d); done++; if(done===total) { toast('✅ Done'); render(); } }); }
        if(fT) { total++; parseFile(fT, d => { T = d; sv('targetData', d); done++; if(done===total) { toast('✅ Done'); render(); } }); }
        if(fP) { total++; parseFile(fP, d => { C = d; sv('payData', d); done++; if(done===total) { toast('✅ Done'); render(); } }); }
    };
}
