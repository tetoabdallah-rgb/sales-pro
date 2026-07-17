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
    
    html += `<button class="btn" ${state.page === 1 ? 'disabled' : ''} onclick="pState['${stateKey}'].page--; ${onPageChange}()">??????</button>`;
    html += `<span style="font-size:0.75rem;font-weight:bold;align-self:center;">???? ${state.page} ?? ${totalPages}</span>`;
    html += `<button class="btn" ${state.page === totalPages ? 'disabled' : ''} onclick="pState['${stateKey}'].page++; ${onPageChange}()">??????</button>`;
    
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
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?'??':'From'}:</label>
            <input type="date" id="dfStart" class="sbox" style="padding:6px;width:130px;" value="${globalDateRange.start||''}">
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?'???':'To'}:</label>
            <input type="date" id="dfEnd" class="sbox" style="padding:6px;width:130px;" value="${globalDateRange.end||''}">
            <button id="bDateClear" class="btn" style="padding:6px 10px;font-size:0.7rem;">?</button>
        </div>
    `;
    
    $('M').innerHTML = `
        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dash}</span> ${t('dash')}</h1>
            ${dateFilterUI}
        </div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Sales'}</div><div class="vl">${aFmt(ts)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'?????':'Profit'}</div><div class="vl">${aFmt(tp)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(ts>0?tp/ts*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Target'}</div><div class="vl">${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Ach.'}</div><div class="vl">${aFmt(ap,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Cust.'}</div><div class="vl">${aFmt(Object.keys(cu).length)}</div></div>
        </div>
        <div class="rg">${ring(L==='ar'?'????????':'Sales', ap, tt)}${ring(L==='ar'?'?????':'Profit', pp, tpt)}</div>
        
        <div class="cg">
            <div class="cc"><h3>${L==='ar'?'????':'Daily'}</h3><div class="cw"><canvas id="cD"></canvas></div></div>
            <div class="cc"><h3>${L==='ar'?'??????':'Cats'}</h3><div class="cw"><canvas id="cC"></canvas></div></div>
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

    // Calculate Top 5 Selling Items
    let items = {};
    ds.forEach(r => {
        let iName = r['Item Description'] || 'Unknown';
        if(!items[iName]) items[iName] = {s:0, p:0, qty:0};
        items[iName].s += Number(r['Sales After Discount'])||0;
        items[iName].p += Number(r['Profit Margin'])||0;
        items[iName].qty += Number(r.Quantity)||0;
    });
    
    let topItemsArr = Object.entries(items).sort((a,b)=>b[1].s-a[1].s).slice(0, 5);
    
    let topItemsHtml = '';
    topItemsArr.forEach((arrItem, i) => {
        let n = arrItem[0], d = arrItem[1];
        let color = i===0 ? 'var(--p)' : i===1 ? '#2ecc71' : i===2 ? '#f39c12' : 'var(--tx2)';
        topItemsHtml += `
            <div class="card" style="flex:1; min-width:200px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?'??????':'Rank'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${n}">${n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'????????':'Sales'}</span>
                    <strong style="color:${color}; font-size:0.9rem;">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'??????':'Qty'}</span>
                    <strong style="font-size:0.9rem;">${fmt(d.qty)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'???????':'Profit'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(d.p)}</strong>
                </div>
            </div>
        `;
    });
    
    $('M').innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.sales}</span> ${t('sales')}</h1>
            <div style="margin-left:auto;display:flex;gap:10px;">
                <button id="bExSales" class="btn bg-g" style="color:#fff;border:none;"><span style="font-size:1rem;">?</span> Excel</button>
                <button onclick="window.print()" class="btn btn-p"><span style="width:20px;height:20px;display:inline-flex">${ICONS.sales}</span> Print</button>
            </div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? 5 ?????? ??????':'Top 5 Best-Sellers'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topItemsHtml}
        </div>

        <div class="tb">
            <div class="tbt">
                <h3>${L==='ar'?'???? ????????':'Sales Table'} (${fmt(ds.length)} ${L==='ar'?'???':'Records'})</h3>
                <input class="sbox" id="ss" placeholder="${L==='ar'?'???...':'Search...'}">
            </div>
            <div class="tbs">
                <table>
                    <thead><tr>
                        <th data-c="Date">Date ? </th><th data-c="Nbr"># ? </th><th data-c="Customer">Customer ? </th>
                        <th data-c="Region">Region ? </th><th data-c="Class">Class ? </th><th data-c="Product">Product ? </th>
                        <th data-c="Qty">Qty ? </th><th data-c="Sales">Sales ? </th><th data-c="Profit">Profit ? </th>
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
            <button id="bExTgt" class="btn bg-g" style="color:#fff;border:none;margin-left:auto;"><span style="font-size:1rem;">??</span> Excel</button>
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
            return `<tr><td>${r.Customer}</td><td>${fmt(tg)}</td><td>${fmt(a)}</td><td>${pc(p)}</td><td>${fmt(cSF(r.Customer,isAcc))}</td><td>${fmt(cPF(r.Customer,isAcc))}</td><td>${fmt(cSF(r.Customer,isHW))}</td><td>${fmt(cPF(r.Customer,isHW))}</td><td><span class="badge ${p>=100?'bg-g':p>=60?'bg-a':'bg-r'}">${p>=100?'?':p>=60?'??':'?'}</span></td></tr>`;
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
    let accS = 0, accP = 0, hwS = 0, hwP = 0;
    
    let defaultTT = 0, defaultTPT = 0;
    T.forEach(r => { defaultTT += Number(r.Target)||0; defaultTPT += Number(r['Profit Target'])||0; });
    
    // Total targets
    let savedTarget = localStorage.getItem('personal_target');
    let savedProfitTarget = localStorage.getItem('personal_profit_target');
    let tt = savedTarget !== null ? Number(savedTarget) : defaultTT;
    let tpt = savedProfitTarget !== null ? Number(savedProfitTarget) : defaultTPT;

    // Accessories Targets
    let savedAccTarget = localStorage.getItem('personal_acc_target');
    let savedAccProfitTarget = localStorage.getItem('personal_acc_profit_target');
    let att = savedAccTarget !== null ? Number(savedAccTarget) : 0;
    let atpt = savedAccProfitTarget !== null ? Number(savedAccProfitTarget) : 0;

    // Hardware Targets
    let savedHwTarget = localStorage.getItem('personal_hw_target');
    let savedHwProfitTarget = localStorage.getItem('personal_hw_profit_target');
    let htt = savedHwTarget !== null ? Number(savedHwTarget) : 0;
    let htpt = savedHwProfitTarget !== null ? Number(savedHwProfitTarget) : 0;
    
    myS.forEach(r => { 
        let s = Number(r['Sales After Discount'])||0;
        let p = Number(r['Profit Margin'])||0;
        ts += s; tp += p; 
        if (isAcc(r['Item Class Name'])) {
            accS += s; accP += p;
        } else {
            hwS += s; hwP += p;
        }
    });
    
    let ap = tt > 0 ? ts/tt*100 : 0, pp = tpt > 0 ? tp/tpt*100 : 0;
    let remS = Math.max(0, tt - ts);
    let remP = Math.max(0, tpt - tp);

    let aap = att > 0 ? accS/att*100 : 0, app = atpt > 0 ? accP/atpt*100 : 0;
    let aremS = Math.max(0, att - accS);
    let aremP = Math.max(0, atpt - accP);

    let hap = htt > 0 ? hwS/htt*100 : 0, hpp = htpt > 0 ? hwP/htpt*100 : 0;
    let hremS = Math.max(0, htt - hwS);
    let hremP = Math.max(0, htpt - hwP);

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
            <h3 style="margin-bottom:16px;">${L==='ar'?'??????? ??????? ??????':'Personal Target Settings'}</h3>
            <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
                <!-- Total -->
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?'?????? ???????':'Total Target'}</label>
                    <input type="number" id="inPTarget" value="${tt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?'?????? ???????':'Total Profit Target'}</label>
                    <input type="number" id="inPProfit" value="${tpt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <!-- Accessories -->
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?'????? ?????????':'Acc. Target'}</label>
                    <input type="number" id="inAccTarget" value="${att}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?'??? ?????????':'Acc. Profit'}</label>
                    <input type="number" id="inAccProfit" value="${atpt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <!-- Hardware -->
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?'????? ???????':'HW Target'}</label>
                    <input type="number" id="inHwTarget" value="${htt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?'??? ???????':'HW Profit'}</label>
                    <input type="number" id="inHwProfit" value="${htpt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="min-width:120px;">
                    <button id="bSaveTarget" class="btn btn-p" style="width:100%; padding:10px; height:42px;">${L==='ar'?'???':'Save'}</button>
                </div>
            </div>
        </div>

        <!-- TOTALS -->
        <h3 style="margin-bottom:12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? ????????':'Overall Summary'}</h3>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Sales'}</div><div class="vl">${aFmt(ts)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Target'}</div><div class="vl">${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Ach.'}</div><div class="vl">${aFmt(ap,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'??????? (??????)':'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(remS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'?????':'Profit'}</div><div class="vl">${aFmt(tp)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'????? ?????':'Target'}</div><div class="vl">${aFmt(tpt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(ts>0?tp/ts*100:0,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'??????? (?????)':'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(remP)}</div></div>
        </div>

        <!-- ACCESSORIES -->
        <h3 style="margin-bottom:12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px; margin-top:24px;">${L==='ar'?'???????????':'Accessories'}</h3>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Acc. Sales'}</div><div class="vl">${aFmt(accS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Target'}</div><div class="vl">${aFmt(att)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Ach.'}</div><div class="vl">${aFmt(aap,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'???????':'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(aremS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Acc. Profit'}</div><div class="vl">${aFmt(accP)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'????? ?????':'Target'}</div><div class="vl">${aFmt(atpt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(accS>0?accP/accS*100:0,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'???????':'Rem. Profit'}</div><div class="vl" style="color:var(--rd);">${aFmt(aremP)}</div></div>
        </div>

        <!-- HARDWARE -->
        <h3 style="margin-bottom:12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px; margin-top:24px;">${L==='ar'?'?????????':'Hardware'}</h3>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'????????':'HW Sales'}</div><div class="vl">${aFmt(hwS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Target'}</div><div class="vl">${aFmt(htt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Ach.'}</div><div class="vl">${aFmt(hap,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'???????':'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(hremS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'HW Profit'}</div><div class="vl">${aFmt(hwP)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'????? ?????':'Target'}</div><div class="vl">${aFmt(htpt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(hwS>0?hwP/hwS*100:0,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'???????':'Rem. Profit'}</div><div class="vl" style="color:var(--rd);">${aFmt(hremP)}</div></div>
        </div>

        <div class="rg">${ring(L==='ar'?'????????':'Sales', ap, tt)}${ring(L==='ar'?'?????':'Profit', pp, tpt)}</div>
        <div class="tb"><div class="tbt"><h3>${L==='ar'?'????':'Monthly'}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'?????':'Month'}</th><th>${L==='ar'?'????????':'Sales'}</th><th>${L==='ar'?'?????':'Profit'}</th><th>${L==='ar'?'??????':'Margin'}</th></tr></thead>
        <tbody>${months.map(m => `<tr><td>${m}</td><td>${fmt(monthly[m].s)}</td><td>${fmt(monthly[m].p)}</td><td><span class="badge ${monthly[m].s>0&&monthly[m].p/monthly[m].s*100>=5?'bg-g':'bg-a'}">${pc(monthly[m].s>0?monthly[m].p/monthly[m].s*100:0)}</span></td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    
    $('bSaveTarget').onclick = () => {
        localStorage.setItem('personal_target', $('inPTarget').value);
        localStorage.setItem('personal_profit_target', $('inPProfit').value);
        localStorage.setItem('personal_acc_target', $('inAccTarget').value);
        localStorage.setItem('personal_acc_profit_target', $('inAccProfit').value);
        localStorage.setItem('personal_hw_target', $('inHwTarget').value);
        localStorage.setItem('personal_hw_profit_target', $('inHwProfit').value);
        toast(L==='ar'?'?? ?????!':'Saved!');
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
    
    let topHtml = '';
    for(let i=0; i<Math.min(3, arr.length); i++) {
        let n = arr[i].n;
        let d = arr[i];
        let contrib = totS > 0 ? (d.s/totS)*100 : 0;
        let color = i===0 ? 'var(--p)' : i===1 ? '#2ecc71' : '#f39c12';
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?'??????':'Rank'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${n}">${n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?'????????':'Sales'}</span>
                    <strong style="color:${color};">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?'???????':'Profit'}</span>
                    <strong>${aFmt(d.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2);">${L==='ar'?'????????':'Contribution'}</span>
                    <span class="badge" style="background:${color}; color:white;">${pc(contrib)}</span>
                </div>
            </div>
        `;
    }
    
    $('M').innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.customers}</span> ${t('customers')}</h1>
            <button id="bExCust" class="btn bg-g" style="color:#fff;border:none;margin-left:auto;"><span style="font-size:1rem;">?</span> Excel</button>
        </div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Customers'}</div><div class="vl">${aFmt(arr.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Sales'}</div><div class="vl">${aFmt(totS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'?????':'Profit'}</div><div class="vl">${aFmt(totP)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(totS>0?totP/totS*100:0,true)}</div></div>
        </div>
        
        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? 3 ?????':'Top 3 Buyers'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml}
        </div>

        <div class="tb">
            <div class="tbt" style="display:flex; justify-content:space-between; align-items:center;">
                <h3>${L==='ar'?'?????? ???????':'Customers Details'}</h3>
                <input class="sbox" id="cusr" placeholder="${L==='ar'?'???...':'Search...'}">
            </div>
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
    $('M').innerHTML=`<div class="ph"><h1>${ICONS.reset} ${t('reset')}</h1></div><div class="card" style="text-align:center;"><p style="margin-bottom:16px;color:var(--tx2);">${L==='ar'?'????? ?? ???????? ???????? ??? ??????. ??? ?? ???? ??? ?????? ???????.':'This will clear all locally stored data. Cloud data is not affected.'}</p><button id="fRst" class="btn btn-p" style="background:var(--rd)">${L==='ar'?'??? ?? ????????':'Wipe All Local Data'}</button></div>`;
    $('fRst').onclick = () => {
        if(confirm(L==='ar'?'??????':'Are you sure?')) {
            localStorage.clear(); S=[]; T=[]; C=[]; D=[];
            toast(L==='ar'?'?? ?????':'Wiped');
            setTimeout(()=>location.reload(), 500);
        }
    };
}

// Brands
function rBrands() {
    let brands = {};
    let tsTotal = 0;
    S.forEach(r => {
        let b = r['Brand'] || r['Item Class Name'] || 'Other';
        if(!brands[b]) brands[b] = {s:0,p:0,qty:0};
        brands[b].s += Number(r['Sales After Discount'])||0;
        brands[b].p += Number(r['Profit Margin'])||0;
        brands[b].qty += Number(r.Quantity)||0;
        tsTotal += Number(r['Sales After Discount'])||0;
    });
    let arr = Object.entries(brands).sort((a,b)=>b[1].s-a[1].s);
    
    let topHtml = '';
    for(let i=0; i<Math.min(3, arr.length); i++) {
        let n = arr[i][0];
        let d = arr[i][1];
        let contrib = tsTotal > 0 ? (d.s/tsTotal)*100 : 0;
        let color = i===0 ? 'var(--p)' : i===1 ? '#2ecc71' : '#f39c12';
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?'??????':'Rank'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.4rem;">${n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?'????????':'Sales'}</span>
                    <strong style="color:${color};">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?'???????':'Profit'}</span>
                    <strong>${aFmt(d.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2);">${L==='ar'?'????????':'Contribution'}</span>
                    <span class="badge" style="background:${color}; color:white;">${pc(contrib)}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.brands}</span> ${t('brands')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'??? ?????????':'Brands'}</div><div class="vl">${aFmt(arr.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'?????? ????????':'Sales'}</div><div class="vl">${aFmt(tsTotal)}</div></div>
        </div>

        <!-- TOP 3 CARDS -->
        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? 3 ???????':'Top 3 Brands'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml}
        </div>

        <div class="tb">
            <div class="tbt" style="display:flex; justify-content:space-between; align-items:center;">
                <h3>${L==='ar'?'?????? ?????????':'Brands Details'}</h3>
                <input class="sbox" id="bsr" placeholder="${L==='ar'?'???...':'Search...'}">
            </div>
            <div class="tbs">
                <table>
                    <thead>
                        <tr>
                            <th>${L==='ar'?'???????':'Brand'}</th>
                            <th>${L==='ar'?'????????':'Sales'}</th>
                            <th>${L==='ar'?'?????':'Profit'}</th>
                            <th>${L==='ar'?'??????':'Margin'}</th>
                            <th>${L==='ar'?'??????':'Qty'}</th>
                            <th>${L==='ar'?'????????':'Contr. %'}</th>
                            <th>${L==='ar'?'????? ?????':'Avg Price'}</th>
                        </tr>
                    </thead>
                    <tbody id="brtb">
                        ${arr.map(([n,d])=>`<tr>
                            <td><strong>${n}</strong></td>
                            <td>${fmt(d.s)}</td>
                            <td>${fmt(d.p)}</td>
                            <td><span class="badge ${d.s>0&&d.p/d.s*100>=5?'bg-g':'bg-a'}">${pc(d.s>0?d.p/d.s*100:0)}</span></td>
                            <td>${fmt(d.qty)}</td>
                            <td>${pc(tsTotal>0?d.s/tsTotal*100:0)}</td>
                            <td>${fmt(d.qty>0?d.s/d.qty:0)}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    $('bsr').oninput = debounce(function() {
        let q = this.value.toLowerCase();
        $('brtb').innerHTML = arr.filter(([n])=>n.toLowerCase().includes(q)).map(([n,d])=>`<tr>
            <td><strong>${n}</strong></td>
            <td>${fmt(d.s)}</td>
            <td>${fmt(d.p)}</td>
            <td><span class="badge ${d.s>0&&d.p/d.s*100>=5?'bg-g':'bg-a'}">${pc(d.s>0?d.p/d.s*100:0)}</span></td>
            <td>${fmt(d.qty)}</td>
            <td>${pc(tsTotal>0?d.s/tsTotal*100:0)}</td>
            <td>${fmt(d.qty>0?d.s/d.qty:0)}</td>
        </tr>`).join('');
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
            <div class="cc"><h3>${L==='ar'?'???????? ???????':'Monthly Sales'}</h3><div class="cw"><canvas id="anM"></canvas></div></div>
            <div class="cc"><h3>${L==='ar'?'??????':'Categories'}</h3><div class="cw"><canvas id="anC"></canvas></div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;" class="rg-grid">
            <div class="card">
                <h3 style="margin-bottom:12px;">?? ${L==='ar'?'???????':'Regions'}</h3>
                ${topReg.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:0.8rem;"><span>${n}</span><strong>${fmt(v)}</strong></div>`).join('')}
            </div>
            <div class="card">
                <h3 style="margin-bottom:12px;">?? ${L==='ar'?'??????':'Top Categories'}</h3>
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
    
    let topHtml = '';
    let topProfit = [...arr].sort((a,b)=>b.p-a.p).slice(0, 3);
    for(let i=0; i<topProfit.length; i++) {
        let ka = topProfit[i];
        let color = i===0 ? 'var(--p)' : i===1 ? '#2ecc71' : '#f39c12';
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?'??????':'Rank'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${ka.n}">${ka.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'?????':'Profit'}</span>
                    <strong style="font-size:0.9rem; color:${color}">${aFmt(ka.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'????????':'Sales'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(ka.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'??????':'Margin'}</span>
                    <span class="badge ${ka.m>=10?'bg-g':ka.m>=5?'bg-a':'bg-r'}">${pc(ka.m)}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.profit}</span> ${t('profit')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'?????? ?????':'Total Profit'}</div><div class="vl">${aFmt(arr.reduce((s,x)=>s+x.p,0))}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'????? ??????':'Avg Margin'}</div><div class="vl">${aFmt(arr.length>0?arr.reduce((s,x)=>s+x.m,0)/arr.length:0,true)}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? 3 ????? ?????':'Top 3 Profitable'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?'?? ????':'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('profit')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'????????':'Sales'}</th><th>${L==='ar'?'?????':'Profit'}</th><th>${L==='ar'?'??????':'Margin'}</th></tr></thead>
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
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Sales'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'?????':'Profit'}</div><div class="vl">${aFmt(prof)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(tot>0?prof/tot*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Records'}</div><div class="vl">${aFmt(ds.length)}</div></div>
        </div>
        <div class="cg"><div class="cc"><h3>${L==='ar'?'??????':'Categories'}</h3><div class="cw"><canvas id="accC"></canvas></div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('accessories')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'?????':'Category'}</th><th>${L==='ar'?'????????':'Sales'}</th><th>%</th></tr></thead>
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
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Sales'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'?????':'Profit'}</div><div class="vl">${aFmt(prof)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(tot>0?prof/tot*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Records'}</div><div class="vl">${aFmt(ds.length)}</div></div>
        </div>
        <div class="cg"><div class="cc"><h3>${L==='ar'?'??????':'Categories'}</h3><div class="cw"><canvas id="hwC"></canvas></div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('hardware')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'?????':'Category'}</th><th>${L==='ar'?'????????':'Sales'}</th><th>%</th></tr></thead>
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
            <div class="ki"><div class="lb">${L==='ar'?'?????? ?????????':'Total Collections'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Records'}</div><div class="vl">${aFmt(C.length)}</div></div>
        </div>
        ${C.length>0 ? `<div class="tb"><div class="tbt"><h3>${t('collections')}</h3></div>
        <div class="tbs"><table><thead><tr>${Object.keys(C[0]||{}).slice(0,6).map(k=>`<th>${k}</th>`).join('')}</tr></thead>
        <tbody>${C.slice(0,100).map(r=>`<tr>${Object.keys(C[0]).slice(0,6).map(k=>`<td>${r[k]||''}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div></div>` : `<div class="card"><p style="color:var(--tx2);text-align:center;">${L==='ar'?'?? ???? ?????? ???????. ???? ??? ?? ???? ?????????.':'No collections data. Upload a file from the Files page.'}</p></div>`}
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

    let topHtml = '';
    for(let i=0; i<Math.min(3, keyAcc.length); i++) {
        let ka = keyAcc[i];
        let color = i===0 ? 'var(--p)' : i===1 ? '#2ecc71' : '#f39c12';
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?'???? ????':'VIP'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${ka.n}">${ka.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'????????':'Sales'}</span>
                    <strong style="font-size:0.9rem; color:${color}">${aFmt(ka.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'???????':'Profit'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(ka.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'??? ?????????':'Orders'}</span>
                    <span class="badge bg-g">${ka.o}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.keyacc}</span> ${t('keyacc')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'??????? ????????':'Key Accounts'}</div><div class="vl">${aFmt(keyAcc.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Contribution'}</div><div class="vl">${aFmt(totS>0?keyAcc.reduce((s,x)=>s+x.s,0)/totS*100:0,true)}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? 3 ????? ??????':'Top 3 VIPs'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?'?? ????':'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('keyacc')} ? ${L==='ar'?'80% ?? ????????':'80% of Sales'}</h3></div>
        <div class="tbs"><table><thead><tr><th>#</th><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'????????':'Sales'}</th><th>${L==='ar'?'?????':'Profit'}</th><th>${L==='ar'?'??????':'Margin'}</th><th>${L==='ar'?'?????????':'Orders'}</th></tr></thead>
        <tbody>${keyAcc.map((r,i)=>`<tr><td><span class="badge bg-g">${i+1}</span></td><td><strong>${r.n}</strong></td><td>${fmt(r.s)}</td><td>${fmt(r.p)}</td><td><span class="badge ${r.m>=5?'bg-g':r.m>=2?'bg-a':'bg-r'}">${pc(r.m)}</span></td><td>${r.o}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    initAnm && initAnm();
}

// Dormant Customers (no purchase in 60+ days)
function rDorm() {
    let cu = {};
    let maxDate = 0;
    
    S.forEach(r => {
        let dStr = pd(r['Order Date']);
        if(dStr) {
            let t = new Date(dStr).getTime();
            if(!isNaN(t) && t > maxDate) maxDate = t;
        }
    });
    
    let todayTime = maxDate > 0 ? maxDate : new Date().getTime();
    
    S.forEach(r => {
        let c = r.Customer || '';
        if(!c) return;
        let dStr = pd(r['Order Date']);
        let s = Number(r['Sales After Discount'])||0;
        
        if(!cu[c]) cu[c] = {last: dStr, s: 0};
        else if (dStr && dStr > cu[c].last) cu[c].last = dStr;
        
        cu[c].s += s;
    });

    let dormant = Object.entries(cu).map(([n, data]) => {
        let t = new Date(data.last).getTime();
        let days = !isNaN(t) ? Math.floor((todayTime - t) / 86400000) : -1;
        return {n, last: data.last, days, s: data.s};
    }).filter(r => r.days >= 60).sort((a,b) => b.s - a.s); 
    
    let topHtml = '';
    for(let i=0; i<Math.min(3, dormant.length); i++) {
        let d = dormant[i];
        let color = '#e74c3c'; 
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${d.n}">${d.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?'?????? ????????':'Total Sales'}</span>
                    <strong style="color:${color};">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2);">${L==='ar'?'????? ???':'Inactive for'}</span>
                    <span class="badge" style="background:${color}; color:white;">${d.days} ${L==='ar'?'???':'days'}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dormant}</span> ${t('dormant')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'?????? ????????':'Dormant Customers'}</div><div class="vl">${aFmt(dormant.length)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'?????? ?????? ??????':'Lost Sales Potential'}</div><div class="vl" style="color:var(--rd);">${aFmt(dormant.reduce((sum,r)=>sum+r.s,0))}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? ????? ???????':'Top Lost Accounts'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?'?? ????':'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('dormant')} - ${L==='ar'?'?? ????? ??? 60+ ???':'No purchase in 60+ days'}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'?????? ????????':'Total Sales'}</th><th>${L==='ar'?'??? ????':'Last Purchase'}</th><th>${L==='ar'?'???':'Days Ago'}</th><th>${L==='ar'?'??????':'Status'}</th></tr></thead>
        <tbody>${dormant.map(r=>`<tr><td><strong>${r.n}</strong></td><td>${fmt(r.s)}</td><td>${r.last}</td><td>${r.days}</td><td><span class="badge ${r.days>=120?'bg-r':'bg-a'}">${r.days>=120?(L==='ar'?'?????':'Lost'):(L==='ar'?'????':'Dormant')}</span></td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
}

// Prospects (customers in T but not in S)
function rPros() {
    let activeCustomers = new Set(S.map(r=>r.Customer||''));
    let prospects = T.filter(r=>!activeCustomers.has(r.Customer));
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.prospects}</span> ${t('prospects')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?'???????':'Prospects'}</div><div class="vl">${aFmt(prospects.length)}</div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('prospects')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'???????':'Target'}</th></tr></thead>
        <tbody>${prospects.map(r=>`<tr><td><strong>${r.Customer}</strong></td><td>${fmt(Number(r.Target)||0)}</td></tr>`).join('')}${prospects.length===0?`<tr><td colspan="2" style="text-align:center;color:var(--tx2)">${L==='ar'?'?? ????':'None'}</td></tr>`:''}</tbody>
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
    
    let topHtml = '';
    for(let i=0; i<Math.min(3, opps.length); i++) {
        let o = opps[i];
        let color = i===0 ? '#e74c3c' : i===1 ? '#e67e22' : '#f1c40f';
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?'??????':'Opportunity'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${o.n}">${o.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'????????':'Target'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(o.tg)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'??????':'Achieved'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(o.ach)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'?????? ???????':'Sales Gap'}</span>
                    <strong style="color:${color}; font-size:1rem;">${aFmt(o.gap)}</strong>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.potential}</span> ${t('potential')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'?????? ?????':'Total Opportunities'}</div><div class="vl">${aFmt(opps.length)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--p);"><div class="lb" style="color:var(--p);">${L==='ar'?'?????? ?????? ???????':'Total Gap Potential'}</div><div class="vl" style="color:var(--p);">${aFmt(opps.reduce((s,r)=>s+r.gap,0))}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? 3 ??? ?????':'Top 3 Opportunities'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?'?? ????':'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('potential')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'???????':'Target'}</th><th>${L==='ar'?'???????':'Achieved'}</th><th>%</th><th>${L==='ar'?'??????':'Gap'}</th></tr></thead>
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
        if(days >= 60) alerts.push({type:'warn', icon:'??', msg:`${n} ? ${L==='ar'?'?? ???? ???':'No purchase since'} ${days} ${L==='ar'?'???':'days'}`});
    });
    // Low target alerts
    let cuS = {};
    S.forEach(r => { let c=r.Customer||''; cuS[c]=(cuS[c]||0)+(Number(r['Sales After Discount'])||0); });
    T.forEach(r => {
        let tg=Number(r.Target)||0, ach=cuS[r.Customer]||0, pct=tg>0?ach/tg*100:0;
        if(pct<50 && tg>0) alerts.push({type:'danger', icon:'??', msg:`${r.Customer} ? ${L==='ar'?'???????':'Achievement'} ${pc(pct)}`});
    });
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.alerts}</span> ${t('alerts')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?'?????????':'Alerts'}</div><div class="vl">${aFmt(alerts.length)}</div></div></div>
        <div class="card">
            ${alerts.length===0?`<p style="text-align:center;color:var(--tx2);">? ${L==='ar'?'?? ???? ???????':'No alerts'}</p>`:alerts.map(a=>`<div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:var(--bg3);border-radius:8px;border-left:3px solid ${a.type==='danger'?'var(--rd)':'var(--am)'}"><span style="font-size:1.2rem;">${a.icon}</span><span style="font-size:0.85rem;">${a.msg}</span></div>`).join('')}
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
    arr.slice(0,5).forEach(r => insights.push({icon:'?',color:'var(--gn)',text:${r.n}:  }));
    arr.filter(r=>r.m<5&&r.s>10000).slice(0,3).forEach(r => insights.push({icon:'??',color:'var(--am)',text:${r.n}:  () — }));
    arr.filter(r=>{ let days=Math.floor((today-new Date(r.last))/86400000); return days>=45&&days<90; }).slice(0,3).forEach(r => insights.push({icon:'??',color:'var(--am)',text:${r.n}:   }));
    arr.filter(r=>r.accS===0&&r.hwS>0).slice(0,3).forEach(r => insights.push({icon:'??',color:'var(--am)',text:${r.n}: }));
    
    M.innerHTML = 
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">+ICONS.ai+</span> +t('ai')+</h1></div>
        <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:16px;">?? +(L==='ar'?'?????? ????':'Smart Insights')+</h3>
            +(insights.length===0?<p style="color:var(--tx2);text-align:center;">+(L==='ar'?'???? ??????? ?????? ??? ??????':'Upload your data to get AI insights')+</p>:insights.map(i=><div style="display:flex;gap:12px;padding:12px;margin-bottom:10px;background:var(--bg3);border-radius:10px;border-left:3px solid ;"><span style="font-size:1.3rem;"></span><span style="font-size:0.85rem;line-height:1.5;"></span></div>).join(''))+
        </div>
    ;
    initAnm && initAnm();
}

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
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Sales'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'?????':'Profit'}</div><div class="vl">${aFmt(prof)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(tot>0?prof/tot*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Records'}</div><div class="vl">${aFmt(ds.length)}</div></div>
        </div>
        <div class="cg"><div class="cc"><h3>${L==='ar'?'??????':'Categories'}</h3><div class="cw"><canvas id="accC"></canvas></div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('accessories')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'?????':'Category'}</th><th>${L==='ar'?'????????':'Sales'}</th><th>%</th></tr></thead>
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
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Sales'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'?????':'Profit'}</div><div class="vl">${aFmt(prof)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'??????':'Margin'}</div><div class="vl">${aFmt(tot>0?prof/tot*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Records'}</div><div class="vl">${aFmt(ds.length)}</div></div>
        </div>
        <div class="cg"><div class="cc"><h3>${L==='ar'?'??????':'Categories'}</h3><div class="cw"><canvas id="hwC"></canvas></div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('hardware')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'?????':'Category'}</th><th>${L==='ar'?'????????':'Sales'}</th><th>%</th></tr></thead>
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
            <div class="ki"><div class="lb">${L==='ar'?'?????? ?????????':'Total Collections'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'???????':'Records'}</div><div class="vl">${aFmt(C.length)}</div></div>
        </div>
        ${C.length>0 ? `<div class="tb"><div class="tbt"><h3>${t('collections')}</h3></div>
        <div class="tbs"><table><thead><tr>${Object.keys(C[0]||{}).slice(0,6).map(k=>`<th>${k}</th>`).join('')}</tr></thead>
        <tbody>${C.slice(0,100).map(r=>`<tr>${Object.keys(C[0]).slice(0,6).map(k=>`<td>${r[k]||''}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div></div>` : `<div class="card"><p style="color:var(--tx2);text-align:center;">${L==='ar'?'?? ???? ?????? ???????. ???? ??? ?? ???? ?????????.':'No collections data. Upload a file from the Files page.'}</p></div>`}
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

    let topHtml = '';
    for(let i=0; i<Math.min(3, keyAcc.length); i++) {
        let ka = keyAcc[i];
        let color = i===0 ? 'var(--p)' : i===1 ? '#2ecc71' : '#f39c12';
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?'???? ????':'VIP'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${ka.n}">${ka.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'????????':'Sales'}</span>
                    <strong style="font-size:0.9rem; color:${color}">${aFmt(ka.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'???????':'Profit'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(ka.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'??? ?????????':'Orders'}</span>
                    <span class="badge bg-g">${ka.o}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.keyacc}</span> ${t('keyacc')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'??????? ????????':'Key Accounts'}</div><div class="vl">${aFmt(keyAcc.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'????????':'Contribution'}</div><div class="vl">${aFmt(totS>0?keyAcc.reduce((s,x)=>s+x.s,0)/totS*100:0,true)}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? 3 ????? ??????':'Top 3 VIPs'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?'?? ????':'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('keyacc')} ? ${L==='ar'?'80% ?? ????????':'80% of Sales'}</h3></div>
        <div class="tbs"><table><thead><tr><th>#</th><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'????????':'Sales'}</th><th>${L==='ar'?'?????':'Profit'}</th><th>${L==='ar'?'??????':'Margin'}</th><th>${L==='ar'?'?????????':'Orders'}</th></tr></thead>
        <tbody>${keyAcc.map((r,i)=>`<tr><td><span class="badge bg-g">${i+1}</span></td><td><strong>${r.n}</strong></td><td>${fmt(r.s)}</td><td>${fmt(r.p)}</td><td><span class="badge ${r.m>=5?'bg-g':r.m>=2?'bg-a':'bg-r'}">${pc(r.m)}</span></td><td>${r.o}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    initAnm && initAnm();
}

// Dormant Customers (no purchase in 60+ days)
function rDorm() {
    let cu = {};
    let maxDate = 0;
    
    S.forEach(r => {
        let dStr = pd(r['Order Date']);
        if(dStr) {
            let t = new Date(dStr).getTime();
            if(!isNaN(t) && t > maxDate) maxDate = t;
        }
    });
    
    let todayTime = maxDate > 0 ? maxDate : new Date().getTime();
    
    S.forEach(r => {
        let c = r.Customer || '';
        if(!c) return;
        let dStr = pd(r['Order Date']);
        let s = Number(r['Sales After Discount'])||0;
        
        if(!cu[c]) cu[c] = {last: dStr, s: 0};
        else if (dStr && dStr > cu[c].last) cu[c].last = dStr;
        
        cu[c].s += s;
    });

    let dormant = Object.entries(cu).map(([n, data]) => {
        let t = new Date(data.last).getTime();
        let days = !isNaN(t) ? Math.floor((todayTime - t) / 86400000) : -1;
        return {n, last: data.last, days, s: data.s};
    }).filter(r => r.days >= 60).sort((a,b) => b.s - a.s); 
    
    let topHtml = '';
    for(let i=0; i<Math.min(3, dormant.length); i++) {
        let d = dormant[i];
        let color = '#e74c3c'; 
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${d.n}">${d.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?'?????? ????????':'Total Sales'}</span>
                    <strong style="color:${color};">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2);">${L==='ar'?'????? ???':'Inactive for'}</span>
                    <span class="badge" style="background:${color}; color:white;">${d.days} ${L==='ar'?'???':'days'}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dormant}</span> ${t('dormant')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'?????? ????????':'Dormant Customers'}</div><div class="vl">${aFmt(dormant.length)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?'?????? ?????? ??????':'Lost Sales Potential'}</div><div class="vl" style="color:var(--rd);">${aFmt(dormant.reduce((sum,r)=>sum+r.s,0))}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? ????? ???????':'Top Lost Accounts'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?'?? ????':'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('dormant')} - ${L==='ar'?'?? ????? ??? 60+ ???':'No purchase in 60+ days'}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'?????? ????????':'Total Sales'}</th><th>${L==='ar'?'??? ????':'Last Purchase'}</th><th>${L==='ar'?'???':'Days Ago'}</th><th>${L==='ar'?'??????':'Status'}</th></tr></thead>
        <tbody>${dormant.map(r=>`<tr><td><strong>${r.n}</strong></td><td>${fmt(r.s)}</td><td>${r.last}</td><td>${r.days}</td><td><span class="badge ${r.days>=120?'bg-r':'bg-a'}">${r.days>=120?(L==='ar'?'?????':'Lost'):(L==='ar'?'????':'Dormant')}</span></td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
}

// Prospects (customers in T but not in S)
function rPros() {
    let activeCustomers = new Set(S.map(r=>r.Customer||''));
    let prospects = T.filter(r=>!activeCustomers.has(r.Customer));
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.prospects}</span> ${t('prospects')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?'???????':'Prospects'}</div><div class="vl">${aFmt(prospects.length)}</div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('prospects')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'???????':'Target'}</th></tr></thead>
        <tbody>${prospects.map(r=>`<tr><td><strong>${r.Customer}</strong></td><td>${fmt(Number(r.Target)||0)}</td></tr>`).join('')}${prospects.length===0?`<tr><td colspan="2" style="text-align:center;color:var(--tx2)">${L==='ar'?'?? ????':'None'}</td></tr>`:''}</tbody>
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
    
    let topHtml = '';
    for(let i=0; i<Math.min(3, opps.length); i++) {
        let o = opps[i];
        let color = i===0 ? '#e74c3c' : i===1 ? '#e67e22' : '#f1c40f';
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?'??????':'Opportunity'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${o.n}">${o.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'????????':'Target'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(o.tg)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'??????':'Achieved'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(o.ach)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?'?????? ???????':'Sales Gap'}</span>
                    <strong style="color:${color}; font-size:1rem;">${aFmt(o.gap)}</strong>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.potential}</span> ${t('potential')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?'?????? ?????':'Total Opportunities'}</div><div class="vl">${aFmt(opps.length)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--p);"><div class="lb" style="color:var(--p);">${L==='ar'?'?????? ?????? ???????':'Total Gap Potential'}</div><div class="vl" style="color:var(--p);">${aFmt(opps.reduce((s,r)=>s+r.gap,0))}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?'???? 3 ??? ?????':'Top 3 Opportunities'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?'?? ????':'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('potential')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?'??????':'Customer'}</th><th>${L==='ar'?'???????':'Target'}</th><th>${L==='ar'?'???????':'Achieved'}</th><th>%</th><th>${L==='ar'?'??????':'Gap'}</th></tr></thead>
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
        if(days >= 60) alerts.push({type:'warn', icon:'??', msg:`${n} ? ${L==='ar'?'?? ???? ???':'No purchase since'} ${days} ${L==='ar'?'???':'days'}`});
    });
    // Low target alerts
    let cuS = {};
    S.forEach(r => { let c=r.Customer||''; cuS[c]=(cuS[c]||0)+(Number(r['Sales After Discount'])||0); });
    T.forEach(r => {
        let tg=Number(r.Target)||0, ach=cuS[r.Customer]||0, pct=tg>0?ach/tg*100:0;
        if(pct<50 && tg>0) alerts.push({type:'danger', icon:'??', msg:`${r.Customer} ? ${L==='ar'?'???????':'Achievement'} ${pc(pct)}`});
    });
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.alerts}</span> ${t('alerts')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?'?????????':'Alerts'}</div><div class="vl">${aFmt(alerts.length)}</div></div></div>
        <div class="card">
            ${alerts.length===0?`<p style="text-align:center;color:var(--tx2);">? ${L==='ar'?'?? ???? ???????':'No alerts'}</p>`:alerts.map(a=>`<div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:var(--bg3);border-radius:8px;border-left:3px solid ${a.type==='danger'?'var(--rd)':'var(--am)'}"><span style="font-size:1.2rem;">${a.icon}</span><span style="font-size:0.85rem;">${a.msg}</span></div>`).join('')}
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
    arr.slice(0,5).forEach(r => insights.push({icon:'?',color:'var(--gn)',text:`${r.n}: ${L==='ar'?'???? ???? ???????':'Top customer with'} ${fmt(r.s)}`}));
    arr.filter(r=>r.m<5&&r.s>10000).slice(0,3).forEach(r => insights.push({icon:'??',color:'var(--am)',text:`${r.n}: ${L==='ar'?'???? ??? ?????':'Low margin'} (${pc(r.m)}) ? ${L==='ar'?'????? ?????? ?????':'Review pricing'}`}));
    arr.filter(r=>{ let days=Math.floor((today-new Date(r.last))/86400000); return days>=45&&days<90; }).slice(0,3).forEach(r => insights.push({icon:'??',color:'var(--am)',text:`${r.n}: ${L==='ar'?'????? ?????? ? ?? ???? ???':'Needs follow-up ? last purchase was'} ${Math.floor((today-new Date(r.last))/86400000)} ${L==='ar'?'???':'days ago'}`}));
    arr.filter(r=>r.accS===0&&r.hwS>0).slice(0,3).forEach(r => insights.push({icon:'??',color:'var(--am)',text:`${r.n}: ${L==='ar'?'?? ???? ????????? ? ???? ??? ??????':'No accessories ? upsell opportunity'}`}));
    
    let key = ld('sp_gemini_key') || '';
    window.aiChatHistory = window.aiChatHistory || [];

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.ai}</span> ${t('ai')}</h1></div>
        
        <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:16px;">?? ${L==='ar'?'?????? ???? ?????':'Quick Smart Insights'}</h3>
            ${insights.length===0?`<p style="color:var(--tx2);text-align:center;">${L==='ar'?'???? ??????? ?????? ??? ??????':'Upload your data to get AI insights'}</p>`:insights.map(i=>`<div style="display:flex;gap:12px;padding:12px;margin-bottom:10px;background:var(--bg3);border-radius:10px;border-left:3px solid ${i.color};"><span style="font-size:1.3rem;">${i.icon}</span><span style="font-size:0.85rem;line-height:1.5;">${i.text}</span></div>`).join('')}
        </div>

        <div class="card" style="display:flex; flex-direction:column; height:500px;">
            <h3 style="margin-bottom:16px;">? ${L==='ar'?'??????? ????? (AI Co-pilot)':'AI Co-pilot Chat'}</h3>
            ${!key ? `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                    <span style="font-size:3rem; margin-bottom:16px;">??</span>
                    <p style="color:var(--tx2); margin-bottom:16px;">${L==='ar'?'??? ????? ????? Gemini API ?? ????????? ?????? ???????? ??????.':'You must enter a Gemini API Key in settings to enable smart chat.'}</p>
                    <button class="btn btn-p" onclick="P='settings';buildNav();render();">${L==='ar'?'?????? ?????????':'Go to Settings'}</button>
                </div>
            ` : `
                <div id="aiChatBox" style="flex:1; overflow-y:auto; background:var(--bg2); border-radius:8px; padding:16px; margin-bottom:16px; display:flex; flex-direction:column; gap:12px;">
                    ${window.aiChatHistory.length===0 ? `
                        <div style="text-align:center; color:var(--tx2); margin:auto;">
                            <span style="font-size:2rem;">??</span><br>
                            ${L==='ar'?'????? ??! ????? ????? ?? ??? ?? ??????? ???????.':'Hello! Ask me anything about your sales and customers.'}
                        </div>
                    ` : window.aiChatHistory.map(msg => `
                        <div style="align-self:${msg.role==='user'?'flex-end':'flex-start'}; background:${msg.role==='user'?'var(--p)':'var(--bg3)'}; color:${msg.role==='user'?'#fff':'var(--tx1)'}; padding:10px 14px; border-radius:12px; max-width:85%; word-wrap:break-word; font-size:0.9rem; line-height:1.5;">
                            ${msg.text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}
                        </div>
                    `).join('')}
                </div>
                <div style="display:flex; gap:8px;">
                    <input id="aiInput" type="text" class="sbox" style="flex:1;" placeholder="${L==='ar'?'???? ??????? ?????...':'Ask the AI assistant...'}" onkeypress="if(event.key==='Enter') document.getElementById('aiSend').click()">
                    <button id="aiSend" class="btn btn-p" style="padding:0 24px;">${L==='ar'?'?????':'Send'}</button>
                </div>
            `}
        </div>
    `;

    if(key) {
        let chatBox = $('aiChatBox');
        if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;

        let sendBtn = $('aiSend');
        if(sendBtn) {
            sendBtn.onclick = async () => {
                let inp = $('aiInput');
                let txt = inp.value.trim();
                if(!txt) return;

                window.aiChatHistory.push({role:'user', text:txt});
                inp.value = '';
                inp.disabled = true;
                sendBtn.disabled = true;
                sendBtn.innerHTML = '?';
                rAI(); 

                let totalSales = ds.reduce((s,r)=>s+(Number(r['Sales After Discount'])||0), 0);
                let totalProfit = ds.reduce((s,r)=>s+(Number(r['Profit Margin'])||0), 0);
                let ctx = {
                    totalSales,
                    totalProfit,
                    top5Customers: arr.slice(0,5).map(x=>({name:x.n, sales:x.s, profit:x.p})),
                    totalCustomers: arr.length
                };
                
                let systemPrompt = `??? ????? ??? ?????? ????? ???????? "Sales Pro". ???? ?????? ${L==='ar'?'???????':'??????????'}.
???? ?????? ???????? ???????:
- ?????? ????????: ${ctx.totalSales}
- ?????? ???????: ${ctx.totalProfit}
- ??? ??????? ???????: ${ctx.totalCustomers}
- ???? 5 ????? ????????? ????????: ${JSON.stringify(ctx.top5Customers)}

??? ???? ?????? ???????? ?????? ????? ??? ??? ??????? ?????? ??? ???? ???????? ?? ???? ????????.`;

                let msgs = window.aiChatHistory.map(m => ({role: m.role==='user'?'user':'model', parts: [{text: m.text}]}));
                if(msgs.length > 0) {
                    msgs[0].parts[0].text = `[SYSTEM CONTEXT: ${systemPrompt}]\n\nUser: ` + msgs[0].parts[0].text;
                }
                
                try {
                    let reqBody = {
                        contents: msgs,
                        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
                    };
                    
                                        // 2. Try default stable aliases directly to bypass model deprecation errors
                    let fallbackModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-flash'];
                    let data = null;
                    let success = false;
                    for (let m of fallbackModels) {
                        try {
                            let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(reqBody)
                            });
                            data = await res.json();
                            if (!data.error) {
                                success = true;
                                break;
                            }
                        } catch(e) { continue; }
                    }
                    if(data.error) {
                        window.aiChatHistory.push({role:'model', text: 'Error: ' + data.error.message});
                    } else if(data.candidates && data.candidates.length > 0) {
                        let aiTxt = data.candidates[0].content.parts[0].text;
                        window.aiChatHistory.push({role:'model', text: aiTxt});
                    } else {
                        window.aiChatHistory.push({role:'model', text: 'No response received.'});
                    }
                } catch(e) {
                    window.aiChatHistory.push({role:'model', text: 'Network Error: ' + e.message});
                }
                rAI();
            };
        }
    }
    initAnm && initAnm();
}

// Account
function rAcct() {
    let user = (typeof currentUser !== 'undefined') ? currentUser : null;
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.account}</span> ${t('account')}</h1></div>
        <div class="card" style="text-align:center;">
            <div style="width:72px;height:72px;border-radius:50%;background:var(--am);color:#fff;font-size:2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">??</div>
            <h3>${user ? user.email : (L==='ar'?'??? ????':'Not logged in')}</h3>
            <p style="color:var(--tx2);font-size:0.8rem;margin:8px 0 20px;">${L==='ar'?'?????? ???':'Active User'}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${S.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?'??????':'Sales'}</div></div>
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${T.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?'?????':'Targets'}</div></div>
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${C.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?'???????':'Collections'}</div></div>
            </div>
            <button class="btn btn-p" onclick="P='settings';buildNav();render();" style="width:100%;margin-bottom:10px;">?? ${t('settings')}</button>
            <button class="btn" onclick="logout();" style="width:100%;background:var(--rd);color:#fff;border:none;">${t('logout')}</button>
        </div>
    `;
}

// Backup
function rBk() {
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.backup}</span> ${t('backup')}</h1></div>
        <div class="card">
            <h3 style="margin-bottom:12px;">?? ${L==='ar'?'????? ????????':'Export Data'}</h3>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button class="btn bg-g" id="bkSales" style="color:#fff;border:none;">?? ${L==='ar'?'????? ????????':'Export Sales'} (${S.length})</button>
                <button class="btn bg-g" id="bkTgt" style="color:#fff;border:none;">?? ${L==='ar'?'????? ???????':'Export Targets'} (${T.length})</button>
                <button class="btn bg-g" id="bkPay" style="color:#fff;border:none;">?? ${L==='ar'?'????? ?????????':'Export Collections'} (${C.length})</button>
            </div>
        </div>
    `;
    $('bkSales').onclick = () => S.length ? exportToExcel(S, 'Sales_Backup') : toast(L==='ar'?'?? ???? ??????':'No data');
    $('bkTgt').onclick   = () => T.length ? exportToExcel(T, 'Targets_Backup') : toast(L==='ar'?'?? ???? ??????':'No data');
    $('bkPay').onclick   = () => C.length ? exportToExcel(C, 'Collections_Backup') : toast(L==='ar'?'?? ???? ??????':'No data');
}




function rSetup() {
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.setup}</span> ${t('setup')}</h1></div>
        <div class="card">
            <h3 style="margin-bottom:12px;">${L==='ar'?'??? ????? Excel':'Upload Excel Files'}</h3>
            <p style="margin-bottom:16px;color:var(--tx2);font-size:0.85rem;">${L==='ar'?'???? ??? Excel ????? ????????? ???????? ?????????? ?????? ????????.':'Upload your Sales, Target and Collections Excel files to update the data.'}</p>
            <div style="background:var(--gn);color:#fff;padding:10px;border-radius:8px;margin-bottom:16px;font-size:0.9rem;display:flex;align-items:center;gap:8px;">
                ?? <strong>${L==='ar'?'????? ??????? ????':'Cloud Sync Active'}</strong>
            </div>
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fSales" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">?? ${L==='ar'?'??? ????????':'Sales File'}</label>
                    <input type="file" id="fSales" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${S.length} ${L==='ar'?'??? ????? ??????':'records currently loaded'}</p>
                </div>
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fTarget" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">?? ${L==='ar'?'??? ???????':'Target File'}</label>
                    <input type="file" id="fTarget" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${T.length} ${L==='ar'?'??? ????? ??????':'records currently loaded'}</p>
                </div>
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fPay" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">?? ${L==='ar'?'??? ?????????':'Collections File'}</label>
                    <input type="file" id="fPay" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${C.length} ${L==='ar'?'??? ????? ??????':'records currently loaded'}</p>
                </div>
            </div>
            <button id="bUpload" class="btn btn-p" style="margin-top:20px;width:100%;padding:12px;font-size:1.1rem;">?? ${L==='ar'?'??? ?????? ????????':'Upload & Update Data'}</button>
        </div>
    `;
    function parseFile(file, cb) {
        let reader = new FileReader();
        reader.onload = e => {
            try {
                let wb = XLSX.read(e.target.result, {type:'array'});
                let ws = wb.Sheets[wb.SheetNames[0]];
                cb(XLSX.utils.sheet_to_json(ws));
            } catch(err) { toast('? Error reading file'); }
        };
        reader.readAsArrayBuffer(file);
    }
    $('bUpload').onclick = () => {
        let done = 0, total = 0;
        let fS = $('fSales').files[0], fT = $('fTarget').files[0], fP = $('fPay').files[0];
        if(!fS && !fT && !fP) { toast(L==='ar'?'????? ??? ?????!':'Choose a file first!'); return; }
        if(fS) { total++; parseFile(fS, d => { S = d; sv('salesData', d); done++; if(done===total) { toast('? Done'); render(); } }); }
        if(fT) { total++; parseFile(fT, d => { T = d; sv('targetData', d); done++; if(done===total) { toast('? Done'); render(); } }); }
        if(fP) { total++; parseFile(fP, d => { C = d; sv('payData', d); done++; if(done===total) { toast('? Done'); render(); } }); }
    };
}










