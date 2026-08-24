
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
    
    html += `<button class="btn" ${state.page === 1 ? 'disabled' : ''} onclick="pState['${stateKey}'].page--; ${onPageChange}()">&#x2B05;&#xFE0F;</button>`;
    html += `<span style="font-size:0.75rem;font-weight:bold;align-self:center;">&#x1F4C4; ${state.page} ${totalPages}</span>`;
    html += `<button class="btn" ${state.page === totalPages ? 'disabled' : ''} onclick="pState['${stateKey}'].page++; ${onPageChange}()">&#x27A1;&#xFE0F;</button>`;
    
    html += `</div>`;
    return html;
}

// 1. Dashboard
function rDash() {
    let ds = getFilteredSales();
    let ts = 0, tp = 0, tt = 0, tpt = 0;
    
    ds.forEach(r => { ts += getSalesVal(r); tp += getProfitVal(r); });
    T.forEach(r => { tt += Number(r.Target)||0; tpt += Number(r['Profit Target'])||0; });
    
    let cu = {}, or = {};
    ds.forEach(r => { cu[r.Customer] = 1; or[r['Order Nbr']] = 1; });
    
    let ap = tt > 0 ? ts / tt * 100 : 0;
    let pp = tpt > 0 ? tp / tpt * 100 : 0;
    
    let accTot = 0, hwTot = 0;
    if (typeof C !== 'undefined' && C.length > 0) {
        let cAccMap = {}, cHWMap = {};
        if (!(C[0]['Item Class Name'] || C[0]['Item Group'] || C[0]['category'] || C[0]['Category'] || C[0]['acc - hw'])) {
            if (typeof S !== 'undefined') {
                S.forEach(s => {
                    let c = s['Customer'];
                    if(c) {
                        let v = Number(s['Sales Without Tax'] || 0);
                        if(typeof isAcc==='function' && isAcc(s['Item Class Name'])) cAccMap[c] = (cAccMap[c]||0) + v;
                        if(typeof isHW==='function' && isHW(s['Item Class Name'])) cHWMap[c] = (cHWMap[c]||0) + v;
                    }
                });
            }
        }
        C.forEach(r => {
            let keys = Object.keys(r);
            let getVal = (possibleNames) => {
                let k = keys.find(k => possibleNames.some(pn => k.toLowerCase().replace(/\s+/g, '') === pn.toLowerCase().replace(/\s+/g, '')));
                return k ? r[k] : undefined;
            };
            
            let rawVal = getVal(['Amount', 'Collection']) || 0;
            let val = Number(rawVal.toString().replace(/,/g, '')) || 0;
            let cat = getVal(['Item Class Name', 'Item Group', 'Category']);
            let ahRaw = getVal(['acc-hw', 'acchw', 'acc - hw']);
            let ah = ahRaw ? ahRaw.toString().trim().toLowerCase() : '';
            let cName = getVal(['Customer Name', 'Customer']) || '';
            
            let payRef = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();
            if (payRef.startsWith('acc')) {
                accTot += val;
            } else if (payRef.startsWith('hw')) {
                hwTot += val;
            } else if (ah.includes('acc') || ah.includes('اكسسوار')) {
                accTot += val;
            } else if (ah.includes('hw') || ah.includes('هاردوير') || ah.includes('هارد')) {
                hwTot += val;
            } else if (cat) {
                if (typeof isAcc==='function' && isAcc(cat)) accTot += val;
                else if (typeof isHW==='function' && isHW(cat)) hwTot += val;
            } else {
                let a = cAccMap[cName]||0;
                let h = cHWMap[cName]||0;
                if (a > 0 || h > 0) {
                    if (a >= h) accTot += val;
                    else hwTot += val;
                } else {
                    accTot += val; 
                }
            }
        });
    }
    
    // Calculate available reps and cats for the dropdowns
    let allReps = [...new Set(S.map(r => getRowVal(r, ['Sales Person', 'Rep', 'Salesman'])).filter(Boolean))].sort();
    let allCats = [...new Set(S.map(r => getRowVal(r, ['Item Class Name', 'Category', 'category'])).filter(Boolean))].sort();
    
    let repOptions = `<option value="">${L==='ar'?'كل المناديب':'All Reps'}</option>` + allReps.map(r => `<option value="${r}" ${globalRepFilter===r?'selected':''}>${r}</option>`).join('');
    let catOptions = `<option value="">${L==='ar'?'كل الفئات':'All Categories'}</option>` + allCats.map(c => `<option value="${c}" ${globalCatFilter===c?'selected':''}>${c}</option>`).join('');

    let dateFilterUI = `
        <div style="display:flex;gap:10px;align-items:center;background:var(--bg3);padding:8px 16px;border-radius:12px;border:1px solid var(--bd);flex-wrap:wrap;">
            <button onclick="if(typeof sendDailyReportNow==='function')sendDailyReportNow(false);" class="btn" style="background:#10b981;color:#fff;font-weight:bold;padding:6px 12px;font-size:0.75rem;display:flex;align-items:center;gap:4px;cursor:pointer;" title="${L==='ar'?'إرسال تقرير المبيعات والتحصيلات إلى إيميلك الآن':'Send Report to Email'}">📧 ${L==='ar'?'إرسال التقرير للإيميل':'Email Report'}</button>
            <span style="color:var(--bd);margin:0 4px;">|</span>
            <select id="dfRep" class="sbox" style="padding:6px;width:130px;font-size:0.7rem;">${repOptions}</select>
            <select id="dfCat" class="sbox" style="padding:6px;width:130px;font-size:0.7rem;">${catOptions}</select>
            <span style="color:var(--bd);margin:0 4px;">|</span>
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?TUI('From'):'From'}:</label>
            <input type="date" id="dfStart" class="sbox" style="padding:6px;width:120px;" value="${globalDateRange.start||''}">
            <label style="font-size:0.7rem;font-weight:bold;">${L==='ar'?TUI('To'):'To'}:</label>
            <input type="date" id="dfEnd" class="sbox" style="padding:6px;width:120px;" value="${globalDateRange.end||''}">
            <button id="bDateClear" class="btn" style="padding:6px 10px;font-size:0.7rem;" title="${L==='ar'?'مسح الفلاتر':'Clear Filters'}">❌</button>
            <span style="color:var(--bd);margin:0 4px;">|</span>
            <button id="bPdfExport" class="btn" style="background:#ef4444;color:#fff;font-weight:bold;padding:6px 12px;font-size:0.75rem;display:flex;align-items:center;gap:4px;cursor:pointer;" title="${L==='ar'?'تصدير PDF':'Export PDF'}">📄 PDF</button>
        </div>
    `;
    
        let maxD = 0; ds.forEach(r => { let d = new Date(pd(r['Order Date'])).getTime(); if(!isNaN(d) && d>maxD) maxD=d; });
    let cuD = {}; ds.forEach(r => { let cust = r.Customer; if(!cust) return; let d = pd(r['Order Date']); if(!cuD[cust] || d > cuD[cust]) cuD[cust]=d; });
    let dormantCount = 0; let ttD = maxD>0?maxD:new Date().getTime();
    Object.values(cuD).forEach(v => { let t = new Date(v).getTime(); if(!isNaN(t) && Math.floor((ttD-t)/86400000)>=60) dormantCount++; });

    let dormantCard = `
    <div class="card" style="margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:linear-gradient(to right, rgba(231,76,60,0.05), transparent); border-left:4px solid var(--rd); box-shadow:0 4px 12px rgba(0,0,0,0.05);" onclick="nav('dormant')">
        <div style="display:flex; align-items:center; gap:16px;">
            <div style="font-size:2rem; width:50px; height:50px; background:var(--rd); color:white; border-radius:12px; display:flex; align-items:center; justify-content:center;">${ICONS.dormant}</div>
            <div>
                <h3 style="margin:0 0 4px; color:var(--tx1);">${L==='ar'?'العملاء الخاملين':'Dormant Customers'}</h3>
                <div style="color:var(--tx2); font-size:0.9rem;">${L==='ar'?'إضغط هنا لمشاهدة قائمة العملاء المنقطعين منذ 60 يوم':'Click to view customers with no orders in 60+ days'}</div>
            </div>
        </div>
        <div style="font-size:1.8rem; font-weight:900; color:var(--rd);">${dormantCount}</div>
    </div>`;
    .innerHTML = `
        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dash}</span> ${t('dash')}</h1>
            ${dateFilterUI}
        </div>
        ${dormantCard}
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">${aFmt(ts)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Profit'):'Profit'}</div><div class="vl">${aFmt(tp)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Margin'):'Margin'}</div><div class="vl">${aFmt(ts>0?tp/ts*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Target'):'Target'}</div><div class="vl">${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Ach.'):'Ach.'}</div><div class="vl">${aFmt(ap,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Cust.'):'Cust.'}</div><div class="vl">${aFmt(Object.keys(cu).length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'تحصيل إكسسوارات':'Acc Coll.'}</div><div class="vl">${aFmt(accTot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'تحصيل هاردوير':'HW Coll.'}</div><div class="vl">${aFmt(hwTot)}</div></div>
        </div>
        <div class="rg">${ring(L==='ar'?TUI('Sales'):'Sales', ap, ts)}${ring(L==='ar'?TUI('Profit'):'Profit', pp, tp)}</div>
        
        <div class="cg">
            <div class="cc"><h3>${L==='ar'?TUI('Daily'):'Daily'}</h3><div class="cw"><canvas id="cD"></canvas></div></div>
            <div class="cc"><h3>${L==='ar'?TUI('Cats'):'Cats'}</h3><div class="cw"><canvas id="cC"></canvas></div></div>
        </div>
    `;
    
    // Attach filter events
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
    }

    // Charts
    let dl = {};
    ds.forEach(r => {
        let d = pd(r['Invoice Date'] || r['Order Date']);
        if(d) dl[d] = (dl[d]||0) + (getSalesVal(r));
    });
    let lb = Object.keys(dl).sort();
    dc('d');
    let ctx = $('cD');
    if(ctx && lb.length) {
        let g = ctx.getContext('2d').createLinearGradient(0,0,0,400);
        g.addColorStop(0, 'rgba(80,70,229,.8)'); g.addColorStop(1, 'rgba(80,70,229,.1)');
        CH.d = new Chart(ctx, {
            type:'bar', data:{labels:lb.map(x=>x.slice(5)), datasets:[{data:lb.map(x=>dl[x]), backgroundColor:g, borderRadius:4}]},
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(v) {
                        if (v === 0) return '';
                        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                        if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                        return v;
                    },
                    display: function(ctx) {
                        let val = ctx.dataset.data[ctx.dataIndex];
                        if (val <= 0) return false;
                        let type = ctx.chart.config.type;
                        if (type === 'doughnut' || type === 'pie') {
                            let meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                            if (meta && meta.total > 0 && (val / meta.total) < 0.04) return false;
                        }
                        return 'auto';
                    },
                    anchor: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 'end' : 'center'; },
                    align: function(ctx) { return ctx.chart.config.type === 'bar' ? 'end' : (ctx.chart.config.type === 'line' ? 'top' : 'center'); },
                    offset: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 4 : 0; },
                    clamp: true
                }}}
        });
    }

    let ca = {};
    ds.forEach(r => {
        let c = r['Item Class Name'] || 'Other';
        ca[c] = (ca[c]||0) + (getSalesVal(r));
    });
    let cs2 = Object.entries(ca).sort((a,b)=>b[1]-a[1]).slice(0,8);
    dc('c');
    let ctx2 = $('cC');
    if(ctx2 && cs2.length) {
        CH.c = new Chart(ctx2, {
            type:'doughnut', data:{labels:cs2.map(x=>x[0]), datasets:[{data:cs2.map(x=>x[1]), backgroundColor:CL, borderWidth:0}]},
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:8}}}, datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(v) {
                        if (v === 0) return '';
                        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                        if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                        return v;
                    },
                    display: function(ctx) {
                        let val = ctx.dataset.data[ctx.dataIndex];
                        if (val <= 0) return false;
                        let type = ctx.chart.config.type;
                        if (type === 'doughnut' || type === 'pie') {
                            let meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                            if (meta && meta.total > 0 && (val / meta.total) < 0.04) return false;
                        }
                        return 'auto';
                    },
                    anchor: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 'end' : 'center'; },
                    align: function(ctx) { return ctx.chart.config.type === 'bar' ? 'end' : (ctx.chart.config.type === 'line' ? 'top' : 'center'); },
                    offset: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 4 : 0; },
                    clamp: true
                }}}
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
        items[iName].s += getSalesVal(r);
        items[iName].p += getProfitVal(r);
        items[iName].qty += Number(r.Quantity)||0;
    });
    
    let topItemsArr = Object.entries(items).sort((a,b)=>b[1].s-a[1].s).slice(0, 5);
    
    let topItemsHtml = '';
    topItemsArr.forEach((arrItem, i) => {
        let n = arrItem[0], d = arrItem[1];
        let color = i===0 ? 'var(--p)' : i===1 ? '#2ecc71' : i===2 ? '#f39c12' : 'var(--tx2)';
        topItemsHtml += `
            <div class="card" style="flex:1; min-width:200px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?TUI('Rank'):'Rank'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${n}">${n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Sales'):'Sales'}</span>
                    <strong style="color:${color}; font-size:0.9rem;">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Qty'):'Qty'}</span>
                    <strong style="font-size:0.9rem;">${fmt(d.qty)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Profit'):'Profit'}</span>
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

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?TUI('Top 5 Best-Sellers'):'Top 5 Best-Sellers'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topItemsHtml}
        </div>

        <div class="tb">
            <div class="tbt">
                <h3>${L==='ar'?TUI('Sales Table'):'Sales Table'} (${fmt(ds.length)} ${L==='ar'?TUI('Records'):'Records'})</h3>
                <input class="sbox" id="ss" placeholder="${L==='ar'?TUI('Search...'):'Search...'}">
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
            let s = getSalesVal(r), pr = getProfitVal(r), pm = s>0 ? pr/s*100 : 0;
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
function rTgt() {
    let sData = typeof getFilteredSales === 'function' ? getFilteredSales() : S;
    let sMap = {}, accSMap = {}, hwSMap = {};
    let pMap = {}, accPMap = {}, hwPMap = {};
    sData.forEach(r => {
        let c = r.Customer;
        if(!c) return;
        let s = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
        let p = typeof getProfitVal === 'function' ? getProfitVal(r) : 0;
        let isA = isAcc(r['Item Class Name']);
        let isH = isHW(r['Item Class Name']);
        sMap[c] = (sMap[c] || 0) + s;
        pMap[c] = (pMap[c] || 0) + p;
        if (isA) { accSMap[c] = (accSMap[c] || 0) + s; accPMap[c] = (accPMap[c] || 0) + p; }
        if (isH) { hwSMap[c] = (hwSMap[c] || 0) + s; hwPMap[c] = (hwPMap[c] || 0) + p; }
    });
    let cS = (c) => sMap[c] || 0;
    let cSF = (c, f) => f === isAcc ? (accSMap[c] || 0) : (hwSMap[c] || 0);
    let cPF = (c, f) => f === isAcc ? (accPMap[c] || 0) : (hwPMap[c] || 0);

    let tt=0, ta=0;
    T.forEach(r => { tt += Number(r.Target)||0; ta += cS(r.Customer); });
    $('M').innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.targets}</span> ${t('targets')}"</h1>
            <button id="bExTgt" class="btn bg-g" style="color:#fff;border:none;margin-left:auto;"><span style="font-size:1rem;">&#x1F4E5;</span> Excel</button>
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
            return `<tr><td>${r.Customer}</td><td>${fmt(tg)}</td><td>${fmt(a)}</td><td>${pc(p)}</td><td>${fmt(cSF(r.Customer,isAcc))}</td><td>${fmt(cPF(r.Customer,isAcc))}</td><td>${fmt(cSF(r.Customer,isHW))}</td><td>${fmt(cPF(r.Customer,isHW))}</td><td><span class="badge ${p>=100?'bg-g':p>=60?'bg-a':'bg-r'}">${p>=100?'&#x2B50;':p>=60?'&#x1F44D;':'&#x1F44E;'}</span></td></tr>`;
        }).join('');
    }
    fTg(T);
    
    $('tsr').oninput = debounce(e => {
        let v = e.target.value.toLowerCase();
        fTg(v ? T.filter(r => (r.Customer||'').toLowerCase().includes(v)) : T);
    });
    initAnm && initAnm();
}
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
        let s = getSalesVal(r);
        let p = getProfitVal(r);
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
        monthly[m].s += getSalesVal(r);
        monthly[m].p += getProfitVal(r);
    });
    let months = Object.keys(monthly).sort();

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.personal}</span> ${t('personal')}</h1></div>
        
        <div class="card" style="margin-bottom:24px; padding:20px; border-left:4px solid var(--p);">
            <h3 style="margin-bottom:16px;">${L==='ar'?TUI('Personal Target Settings'):'Personal Target Settings'}</h3>
            <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
                <!-- Total -->
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?TUI('Total Target'):'Total Target'}</label>
                    <input type="number" id="inPTarget" value="${tt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?TUI('Total Profit Target'):'Total Profit Target'}</label>
                    <input type="number" id="inPProfit" value="${tpt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <!-- Accessories -->
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?TUI('Acc. Target'):'Acc. Target'}</label>
                    <input type="number" id="inAccTarget" value="${att}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?TUI('Acc. Profit'):'Acc. Profit'}</label>
                    <input type="number" id="inAccProfit" value="${atpt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <!-- Hardware -->
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?TUI('HW Target'):'HW Target'}</label>
                    <input type="number" id="inHwTarget" value="${htt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="flex:1; min-width:150px;">
                    <label style="font-size:0.85rem; font-weight:bold; color:var(--tx2); margin-bottom:6px; display:block;">${L==='ar'?TUI('HW Profit'):'HW Profit'}</label>
                    <input type="number" id="inHwProfit" value="${htpt}" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-size:1rem;">
                </div>
                <div style="min-width:120px;">
                    <button id="bSaveTarget" class="btn btn-p" style="width:100%; padding:10px; height:42px;">${L==='ar'?TUI('Save'):'Save'}</button>
                </div>
            </div>
        </div>

        <!-- TOTALS -->
        <h3 style="margin-bottom:12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?TUI('Overall Summary'):'Overall Summary'}</h3>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">${aFmt(ts)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Target'):'Target'}</div><div class="vl">${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Ach.'):'Ach.'}</div><div class="vl">${aFmt(ap,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?TUI('Remaining'):'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(remS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Profit'):'Profit'}</div><div class="vl">${aFmt(tp)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Target'):'Target'}</div><div class="vl">${aFmt(tpt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Margin'):'Margin'}</div><div class="vl">${aFmt(ts>0?tp/ts*100:0,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?TUI('Remaining'):'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(remP)}</div></div>
        </div>

        <!-- ACCESSORIES -->
        <h3 style="margin-bottom:12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px; margin-top:24px;">${L==='ar'?TUI('Accessories'):'Accessories'}</h3>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Acc. Sales'):'Acc. Sales'}</div><div class="vl">${aFmt(accS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Target'):'Target'}</div><div class="vl">${aFmt(att)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Ach.'):'Ach.'}</div><div class="vl">${aFmt(aap,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?TUI('Remaining'):'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(aremS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Acc. Profit'):'Acc. Profit'}</div><div class="vl">${aFmt(accP)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Target'):'Target'}</div><div class="vl">${aFmt(atpt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Margin'):'Margin'}</div><div class="vl">${aFmt(accS>0?accP/accS*100:0,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?TUI('Rem. Profit'):'Rem. Profit'}</div><div class="vl" style="color:var(--rd);">${aFmt(aremP)}</div></div>
        </div>

        <!-- HARDWARE -->
        <h3 style="margin-bottom:12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px; margin-top:24px;">${L==='ar'?TUI('Hardware'):'Hardware'}</h3>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('HW Sales'):'HW Sales'}</div><div class="vl">${aFmt(hwS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Target'):'Target'}</div><div class="vl">${aFmt(htt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Ach.'):'Ach.'}</div><div class="vl">${aFmt(hap,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?TUI('Remaining'):'Remaining'}</div><div class="vl" style="color:var(--rd);">${aFmt(hremS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('HW Profit'):'HW Profit'}</div><div class="vl">${aFmt(hwP)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Target'):'Target'}</div><div class="vl">${aFmt(htpt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Margin'):'Margin'}</div><div class="vl">${aFmt(hwS>0?hwP/hwS*100:0,true)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?TUI('Rem. Profit'):'Rem. Profit'}</div><div class="vl" style="color:var(--rd);">${aFmt(hremP)}</div></div>
        </div>

        <div class="rg">${ring(L==='ar'?TUI('Sales'):'Sales', ap, ts)}${ring(L==='ar'?TUI('Profit'):'Profit', pp, tp)}]
        <div class="tb"><div class="tbt"><h3>${L==='ar'?TUI('Monthly'):'Monthly'}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?TUI('Month'):'Month'}</th><th>${L==='ar'?TUI('Sales'):'Sales'}</th><th>${L==='ar'?TUI('Profit'):'Profit'}</th><th>${L==='ar'?TUI('Margin'):'Margin'}</th></tr></thead>
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
        toast(L==='ar'?TUI('Saved!'):'Saved!');
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
        cu[c].s += getSalesVal(r);
        cu[c].p += getProfitVal(r);
        if(isAcc(r['Item Class Name'])) cu[c].accS += getSalesVal(r); else cu[c].hwS += getSalesVal(r);
        let d = pd(r['Order Date']); if(d > cu[c].l) cu[c].l = d;
    });
    let arr = Object.keys(cu).map(n => {
        let d = cu[n], tr = T.find(t => t.Customer === n), tg = tr ? Number(tr.Target)||0 : 0;
        return {n:n, rg:d.rg, o:Object.keys(d.o).length, s:d.s, p:d.p, accS:d.accS, hwS:d.hwS, l:d.l, m:d.s>0?d.p/d.s*100:0, tg:tg, ach:tg>0?d.s/tg*100:0};
    }).sort((a,b)=>b.s-a.s);
    let len = arr.length;
    let vipCount = Math.max(1, Math.floor(len * 0.20));
    let silverCount = Math.floor(len * 0.30);
    arr.forEach((item, idx) => {
        if (idx < vipCount) {
            item.tier = 'VIP';
            item.tierBadge = `<span style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:bold;margin-left:6px;display:inline-flex;align-items:center;gap:3px;" title="VIP / الفئة الذهبية">👑 VIP</span>`;
        } else if (idx < vipCount + silverCount) {
            item.tier = 'Silver';
            item.tierBadge = `<span style="background:linear-gradient(135deg,#64748b,#475569);color:#fff;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:bold;margin-left:6px;display:inline-flex;align-items:center;gap:3px;" title="Silver / الفئة الفضية">⭐ Silver</span>`;
        } else {
            item.tier = 'Bronze';
            item.tierBadge = `<span style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:bold;margin-left:6px;display:inline-flex;align-items:center;gap:3px;" title="Bronze / الفئة البرونزية">🔹 Bronze</span>`;
        }
    });
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
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?TUI('Rank'):'Rank'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${n}">${n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?TUI('Sales'):'Sales'}</span>
                    <strong style="color:${color};">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?TUI('Profit'):'Profit'}</span>
                    <strong>${aFmt(d.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2);">${L==='ar'?TUI('Contribution'):'Contribution'}</span>
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
            <div class="ki"><div class="lb">${L==='ar'?TUI('Customers'):'Customers'}</div><div class="vl">${aFmt(arr.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">${aFmt(totS)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Profit'):'Profit'}</div><div class="vl">${aFmt(totP)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Margin'):'Margin'}</div><div class="vl">${aFmt(totS>0?totP/totS*100:0,true)}</div></div>
        </div>
        
        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?TUI('Top 3 Buyers'):'Top 3 Buyers'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml}
        </div>

        <div class="tb">
            <div class="tbt" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <h3>${L==='ar'?TUI('Customers Details'):'Customers Details'}</h3>
                <div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn tier-btn" id="tAll" onclick="setCustTierFilter('ALL')" style="padding:4px 10px; border-radius:14px; font-size:0.8rem; border:1px solid var(--bd); background:var(--p); color:#fff; cursor:pointer;">${L==='ar'?'الكل':'All'}</button>
                    <button class="btn tier-btn" id="tVIP" onclick="setCustTierFilter('VIP')" style="padding:4px 10px; border-radius:14px; font-size:0.8rem; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); cursor:pointer;">👑 VIP</button>
                    <button class="btn tier-btn" id="tSilver" onclick="setCustTierFilter('Silver')" style="padding:4px 10px; border-radius:14px; font-size:0.8rem; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); cursor:pointer;">⭐ Silver</button>
                    <button class="btn tier-btn" id="tBronze" onclick="setCustTierFilter('Bronze')" style="padding:4px 10px; border-radius:14px; font-size:0.8rem; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); cursor:pointer;">🔹 Bronze</button>
                </div>
                <input class="sbox" id="cusr" placeholder="${L==='ar'?TUI('Search...'):'Search...'}">
            </div>
            <div class="tbs"><table><thead><tr><th>Customer</th><th>Region</th><th>Orders</th><th>Sales</th><th>Acc</th><th>HW</th><th>Profit</th><th>Margin</th><th>Target</th><th>Ach.</th><th>Last</th></tr></thead><tbody id="cutb"></tbody></table></div>
            <div id="cpg"></div>
        </div>
    `;
    
    $('bExCust').onclick = () => exportToExcel(arr, 'Customers_Report');

    window._custTierFilter = window._custTierFilter || 'ALL';
    window.setCustTierFilter = function(t) {
        window._custTierFilter = t;
        ['tAll', 'tVIP', 'tSilver', 'tBronze'].forEach(id => {
            let el = $(id);
            if (el) {
                if ((id==='tAll' && t==='ALL') || (id==='tVIP' && t==='VIP') || (id==='tSilver' && t==='Silver') || (id==='tBronze' && t==='Bronze')) {
                    el.style.background = 'var(--p)';
                    el.style.color = '#fff';
                } else {
                    el.style.background = 'var(--bg2)';
                    el.style.color = 'var(--tx1)';
                }
            }
        });
        pState.customers.page = 1;
        window.doCustSearch();
    };

    window.doCustSearch = function() {
        let q = $('cusr').value.toLowerCase();
        let filtered = window._CU.filter(r => {
            let matchesName = r.n.toLowerCase().includes(q);
            let matchesTier = window._custTierFilter === 'ALL' || r.tier === window._custTierFilter;
            return matchesName && matchesTier;
        });
        let st = pState.customers;
        let start = (st.page - 1) * st.limit;
        let paged = filtered.slice(start, start + st.limit);
        
        $('cutb').innerHTML = paged.map(r => `<tr><td><strong>${r.n}</strong> ${r.tierBadge||''}</td><td>${r.rg}</td><td>${r.o}</td><td>${fmt(r.s)}</td><td>${fmt(r.accS)}</td><td>${fmt(r.hwS)}</td><td>${fmt(r.p)}</td><td><span class="badge ${r.m>=5?'bg-g':r.m>=2?'bg-a':'bg-r'}">${pc(r.m)}</span></td><td>${fmt(r.tg)}</td><td>${r.tg>0?`<span class="badge ${r.ach>=100?'bg-g':r.ach>=60?'bg-a':'bg-r'}">${pc(r.ach)}</span>`:'-'}</td><td>${r.l}</td></tr>`).join('');
        $('cpg').innerHTML = renderPagination(filtered.length, 'customers', 'window.doCustSearch');
    };
    
    window.setCustTierFilter(window._custTierFilter);
    $('cusr').oninput = debounce(() => { pState.customers.page = 1; window.doCustSearch(); }, 200);
}
function rReset() {
    $('M').innerHTML=`<div class="ph"><h1>${ICONS.reset} ${t('reset')}</h1></div><div class="card" style="text-align:center;"><p style="margin-bottom:16px;color:var(--tx2);">${L==='ar'?TUI('This will clear all locally stored data. Cloud data is not affected.'):'This will clear all locally stored data. Cloud data is not affected.'}</p><button id="fRst" class="btn btn-p" style="background:var(--rd)">${L==='ar'?TUI('Wipe All Local Data'):'Wipe All Local Data'}</button></div>`;
    $('fRst').onclick = () => {
        if(confirm(L==='ar'?TUI('Are you sure?'):'Are you sure?')) {
            localStorage.clear(); S=[]; T=[]; C=[]; D=[];
            toast(L==='ar'?TUI('Wiped'):'Wiped');
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
        brands[b].s += getSalesVal(r);
        brands[b].p += getProfitVal(r);
        brands[b].qty += Number(r.Quantity)||0;
        tsTotal += getSalesVal(r);
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
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?TUI('Rank'):'Rank'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.4rem;">${n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?TUI('Sales'):'Sales'}</span>
                    <strong style="color:${color};">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:var(--tx2);">${L==='ar'?TUI('Profit'):'Profit'}</span>
                    <strong>${aFmt(d.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2);">${L==='ar'?TUI('Contribution'):'Contribution'}</span>
                    <span class="badge" style="background:${color}; color:white;">${pc(contrib)}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.brands}</span> ${t('brands')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Brands'):'Brands'}</div><div class="vl">${aFmt(arr.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">${aFmt(tsTotal)}</div></div>
        </div>

        <!-- TOP 3 CARDS -->
        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?TUI('Top 3 Brands'):'Top 3 Brands'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml}
        </div>

        <div class="tb">
            <div class="tbt" style="display:flex; justify-content:space-between; align-items:center;">
                <h3>${L==='ar'?TUI('Brands Details'):'Brands Details'}</h3>
                <input class="sbox" id="bsr" placeholder="${L==='ar'?TUI('Search...'):'Search...'}">
            </div>
            <div class="tbs">
                <table>
                    <thead>
                        <tr>
                            <th>${L==='ar'?TUI('Brand'):'Brand'}</th>
                            <th>${L==='ar'?TUI('Sales'):'Sales'}</th>
                            <th>${L==='ar'?TUI('Profit'):'Profit'}</th>
                            <th>${L==='ar'?TUI('Margin'):'Margin'}</th>
                            <th>${L==='ar'?TUI('Qty'):'Qty'}</th>
                            <th>${L==='ar'?TUI('Contr. %'):'Contr. %'}</th>
                            <th>${L==='ar'?TUI('Avg Price'):'Avg Price'}</th>
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
        monthly[m].s += getSalesVal(r);
        monthly[m].p += getProfitVal(r);
        let c = r['Item Class Name']||'Other';
        cats[c] = (cats[c]||0) + (getSalesVal(r));
        let rg = r['Customer Class']||'Other';
        regions[rg] = (regions[rg]||0) + (getSalesVal(r));
    });
    let months = Object.keys(monthly).sort();
    let topCats = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,8);
    let topReg = Object.entries(regions).sort((a,b)=>b[1]-a[1]);

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.analytics}</span> ${t('analytics')}</h1></div>
        <div class="cg">
            <div class="cc"><h3>${L==='ar'?TUI('Monthly Sales'):'Monthly Sales'}</h3><div class="cw"><canvas id="anM"></canvas></div></div>
            <div class="cc"><h3>${L==='ar'?TUI('Categories'):'Categories'}</h3><div class="cw"><canvas id="anC"></canvas></div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;" class="rg-grid">
            <div class="card">
                <h3 style="margin-bottom:12px;">${L==='ar'?TUI('Regions'):'Regions'}</h3>
                ${topReg.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:0.8rem;"><span>${n}</span><strong>${fmt(v)}</strong></div>`).join('')}
            </div>
            <div class="card">
                <h3 style="margin-bottom:12px;">${L==='ar'?TUI('Top Categories'):'Top Categories'}</h3>
                ${topCats.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:0.8rem;"><span>${n}</span><strong>${fmt(v)}</strong></div>`).join('')}
            </div>
        </div>
    `;
    dc('anM'); dc('anC');
    let ctxM = $('anM');
    if(ctxM && months.length) {
        CH.anM = new Chart(ctxM, {
            type:'line', data:{labels:months.map(x=>x.slice(5)), datasets:[{label:'Sales',data:months.map(m=>monthly[m].s),borderColor:'#5046e5',backgroundColor:'rgba(80,70,229,.1)',fill:true,tension:0.4},{label:'Profit',data:months.map(m=>monthly[m].p),borderColor:'#0fa87e',backgroundColor:'rgba(15,168,126,.1)',fill:true,tension:0.4}]},
            options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top'}, datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(v) {
                        if (v === 0) return '';
                        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                        if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                        return v;
                    },
                    display: function(ctx) {
                        let val = ctx.dataset.data[ctx.dataIndex];
                        if (val <= 0) return false;
                        let type = ctx.chart.config.type;
                        if (type === 'doughnut' || type === 'pie') {
                            let meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                            if (meta && meta.total > 0 && (val / meta.total) < 0.04) return false;
                        }
                        return 'auto';
                    },
                    anchor: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 'end' : 'center'; },
                    align: function(ctx) { return ctx.chart.config.type === 'bar' ? 'end' : (ctx.chart.config.type === 'line' ? 'top' : 'center'); },
                    offset: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 4 : 0; },
                    clamp: true
                }}}
        });
    }
    let ctxC = $('anC');
    if(ctxC && topCats.length) {
        CH.anC = new Chart(ctxC, {
            type:'doughnut', data:{labels:topCats.map(x=>x[0]), datasets:[{data:topCats.map(x=>x[1]),backgroundColor:CL,borderWidth:0}]},
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:8}}}, datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(v) {
                        if (v === 0) return '';
                        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                        if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                        return v;
                    },
                    display: function(ctx) {
                        let val = ctx.dataset.data[ctx.dataIndex];
                        if (val <= 0) return false;
                        let type = ctx.chart.config.type;
                        if (type === 'doughnut' || type === 'pie') {
                            let meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                            if (meta && meta.total > 0 && (val / meta.total) < 0.04) return false;
                        }
                        return 'auto';
                    },
                    anchor: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 'end' : 'center'; },
                    align: function(ctx) { return ctx.chart.config.type === 'bar' ? 'end' : (ctx.chart.config.type === 'line' ? 'top' : 'center'); },
                    offset: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 4 : 0; },
                    clamp: true
                }}}
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
        cu[c].s += getSalesVal(r);
        cu[c].p += getProfitVal(r);
    });
    let arr = Object.entries(cu).map(([n,d])=>({n,s:d.s,p:d.p,m:d.s>0?d.p/d.s*100:0})).sort((a,b)=>b.m-a.m);
    
    let topHtml = '';
    let topProfit = [...arr].sort((a,b)=>b.p-a.p).slice(0, 3);
    for(let i=0; i<topProfit.length; i++) {
        let ka = topProfit[i];
        let color = i===0 ? 'var(--p)' : i===1 ? '#2ecc71' : '#f39c12';
        topHtml += `
            <div class="card" style="flex:1; min-width:250px; border-top:4px solid ${color}; padding:16px;">
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?TUI('Rank'):'Rank'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${ka.n}">${ka.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Profit'):'Profit'}</span>
                    <strong style="font-size:0.9rem; color:${color}">${aFmt(ka.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Sales'):'Sales'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(ka.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Margin'):'Margin'}</span>
                    <span class="badge ${ka.m>=10?'bg-g':ka.m>=5?'bg-a':'bg-r'}">${pc(ka.m)}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.profit}</span> ${t('profit')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Total Profit'):'Total Profit'}</div><div class="vl">${aFmt(arr.reduce((s,x)=>s+x.p,0))}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Avg Margin'):'Avg Margin'}</div><div class="vl">${aFmt(arr.length>0?arr.reduce((s,x)=>s+x.m,0)/arr.length:0,true)}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?TUI('Top 3 Profitable'):'Top 3 Profitable'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?TUI('None'):'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('profit')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?TUI('Customer'):'Customer'}</th><th>${L==='ar'?TUI('Sales'):'Sales'}</th><th>${L==='ar'?TUI('Profit'):'Profit'}</th><th>${L==='ar'?TUI('Margin'):'Margin'}</th></tr></thead>
        <tbody>${arr.map(r=>`<tr><td><strong>${r.n}</strong></td><td>${fmt(r.s)}</td><td>${fmt(r.p)}</td><td><span class="badge ${r.m>=10?'bg-g':r.m>=5?'bg-a':'bg-r'}">${pc(r.m)}</span></td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    initAnm && initAnm();
}

// Accessories
function rAcc() {
    // Always use DEF_ACC as base; accCats overrides only if user saved custom ones
    let _accList = (accCats && accCats.length) ? accCats : DEF_ACC;
    let ds = getFilteredSales().filter(r => _accList.includes(r['Item Class Name']));
    let tot = ds.reduce((s,r)=>s+(getSalesVal(r)),0);
    let prof = ds.reduce((s,r)=>s+(getProfitVal(r)),0);
    let cats = {};
    ds.forEach(r => { let c=r['Item Class Name']||'Other'; cats[c]=(cats[c]||0)+(getSalesVal(r)); });
    let catArr = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.accessories}</span> ${t('accessories')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Profit'):'Profit'}</div><div class="vl">${aFmt(prof)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Margin'):'Margin'}</div><div class="vl">${aFmt(tot>0?prof/tot*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Records'):'Records'}</div><div class="vl">${aFmt(ds.length)}</div></div>
        </div>
        <div class="cg"><div class="cc"><h3>${L==='ar'?TUI('Categories'):'Categories'}</h3><div class="cw"><canvas id="accC"></canvas></div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('accessories')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?TUI('Category'):'Category'}</th><th>${L==='ar'?TUI('Sales'):'Sales'}</th><th>%</th></tr></thead>
        <tbody>${catArr.map(([n,v])=>`<tr><td>${n}</td><td>${fmt(v)}</td><td>${pc(tot>0?v/tot*100:0)}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    dc('accC');
    let ctx = $('accC');
    if(ctx && catArr.length) { CH.accC = new Chart(ctx, {type:'doughnut',data:{labels:catArr.map(x=>x[0]),datasets:[{data:catArr.map(x=>x[1]),backgroundColor:CL,borderWidth:0}]},options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:8}}}, datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(v) {
                        if (v === 0) return '';
                        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                        if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                        return v;
                    },
                    display: function(ctx) {
                        let val = ctx.dataset.data[ctx.dataIndex];
                        if (val <= 0) return false;
                        let type = ctx.chart.config.type;
                        if (type === 'doughnut' || type === 'pie') {
                            let meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                            if (meta && meta.total > 0 && (val / meta.total) < 0.04) return false;
                        }
                        return 'auto';
                    },
                    anchor: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 'end' : 'center'; },
                    align: function(ctx) { return ctx.chart.config.type === 'bar' ? 'end' : (ctx.chart.config.type === 'line' ? 'top' : 'center'); },
                    offset: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 4 : 0; },
                    clamp: true
                }}}}); }
    initAnm && initAnm();
}

// Hardware
function rHW() {
    let ds = getFilteredSales().filter(r => isHW(r['Item Class Name']));
    let tot = ds.reduce((s,r)=>s+(getSalesVal(r)),0);
    let prof = ds.reduce((s,r)=>s+(getProfitVal(r)),0);
    let cats = {};
    ds.forEach(r => { let c=r['Item Class Name']||'Other'; cats[c]=(cats[c]||0)+(getSalesVal(r)); });
    let catArr = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.hardware}</span> ${t('hardware')}</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Sales'):'Sales'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Profit'):'Profit'}</div><div class="vl">${aFmt(prof)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Margin'):'Margin'}</div><div class="vl">${aFmt(tot>0?prof/tot*100:0,true)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Records'):'Records'}</div><div class="vl">${aFmt(ds.length)}</div></div>
        </div>
        <div class="cg"><div class="cc"><h3>${L==='ar'?TUI('Categories'):'Categories'}</h3><div class="cw"><canvas id="hwC"></canvas></div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('hardware')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?TUI('Category'):'Category'}</th><th>${L==='ar'?TUI('Sales'):'Sales'}</th><th>%</th></tr></thead>
        <tbody>${catArr.map(([n,v])=>`<tr><td>${n}</td><td>${fmt(v)}</td><td>${pc(tot>0?v/tot*100:0)}</td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
    dc('hwC');
    let ctx = $('hwC');
    if(ctx && catArr.length) { CH.hwC = new Chart(ctx, {type:'doughnut',data:{labels:catArr.map(x=>x[0]),datasets:[{data:catArr.map(x=>x[1]),backgroundColor:CL,borderWidth:0}]},options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:8}}}, datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(v) {
                        if (v === 0) return '';
                        if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                        if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                        return v;
                    },
                    display: function(ctx) {
                        let val = ctx.dataset.data[ctx.dataIndex];
                        if (val <= 0) return false;
                        let type = ctx.chart.config.type;
                        if (type === 'doughnut' || type === 'pie') {
                            let meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
                            if (meta && meta.total > 0 && (val / meta.total) < 0.04) return false;
                        }
                        return 'auto';
                    },
                    anchor: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 'end' : 'center'; },
                    align: function(ctx) { return ctx.chart.config.type === 'bar' ? 'end' : (ctx.chart.config.type === 'line' ? 'top' : 'center'); },
                    offset: function(ctx) { return (ctx.chart.config.type === 'bar' || ctx.chart.config.type === 'line') ? 4 : 0; },
                    clamp: true
                }}}}); }
    initAnm && initAnm();
}

// Collections
function rCollections() {
    let tot = 0, accTot = 0, hwTot = 0;
    let cAccMap = {}, cHWMap = {};
    if (C.length > 0 && !(C[0]['Item Class Name'] || C[0]['Item Group'] || C[0]['category'] || C[0]['Category'] || C[0]['acc - hw'])) {
        S.forEach(s => {
            let c = s['Customer'];
            if(c) {
                let v = Number(s['Sales Without Tax'] || 0);
                if(isAcc(s['Item Class Name'])) cAccMap[c] = (cAccMap[c]||0) + v;
                if(isHW(s['Item Class Name'])) cHWMap[c] = (cHWMap[c]||0) + v;
            }
        });
    }

    C.forEach(r => {
        let keys = Object.keys(r);
        let getVal = (possibleNames) => {
            let k = keys.find(k => possibleNames.some(pn => k.toLowerCase().replace(/\s+/g, '') === pn.toLowerCase().replace(/\s+/g, '')));
            return k ? r[k] : undefined;
        };
        
        let rawVal = getVal(['Amount', 'Collection']) || 0;
        let val = Number(rawVal.toString().replace(/,/g, '')) || 0;
        let cat = getVal(['Item Class Name', 'Item Group', 'Category']);
        let ahRaw = getVal(['acc-hw', 'acchw', 'acc - hw']);
        let ah = ahRaw ? ahRaw.toString().trim().toLowerCase() : '';
        let cName = getVal(['Customer Name', 'Customer']) || '';
        
        tot += val;
          // Payment Ref. column takes priority: acc=accessories, hw=hardware
          let payRef = (r['Payment Ref.'] || r['Payment Ref'] || r['PaymentRef'] || '').toString().trim().toLowerCase();
          if (payRef.startsWith('acc')) {
              accTot += val;
          } else if (payRef.startsWith('hw')) {
              hwTot += val;
          } else if (ah.includes('acc') || ah.includes('اكسسوار')) {
            accTot += val;
        } else if (ah.includes('hw') || ah.includes('هاردوير') || ah.includes('هارد')) {
            hwTot += val;
        } else if (cat) {
            if (isAcc(cat)) accTot += val;
            else if (isHW(cat)) hwTot += val;
        } else if (cat) {
            if (isAcc(cat)) accTot += val;
            else if (isHW(cat)) hwTot += val;
        } else {
            let a = cAccMap[cName]||0;
            let h = cHWMap[cName]||0;
            if (a > 0 || h > 0) {
                if (a >= h) accTot += val;
                else hwTot += val;
            } else {
                accTot += val; 
            }
        }
    });

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.collections}</span> ${t('collections')}"</h1></div>
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Total Collections'):'Total Collections'}</div><div class="vl">${aFmt(tot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'إكسسوارات':'Accessories'}</div><div class="vl">${aFmt(accTot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'هاردوير':'Hardware'}</div><div class="vl">${aFmt(hwTot)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Records'):'Records'}</div><div class="vl">${aFmt(C.length)}</div></div>
        </div>
        ${C.length>0 ? `<div class="tb"><div class="tbt"><h3>${t('collections')}</h3></div>
        <div class="tbs"><table><thead><tr>${Object.keys(C[0]||{}).slice(0,6).map(k=>`<th>${k}</th>`).join('')}</tr></thead>
        <tbody>${C.slice(0,100).map(r=>`<tr>${Object.keys(C[0]).slice(0,6).map(k=>`<td>${r[k]||''}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div></div>` : `<div class="card"><p style="color:var(--tx2);text-align:center;">${L==='ar'?TUI('No collections data. Upload a file from the Files page.'):'No collections data. Upload a file from the Files page.'}</p></div>`}"
    `;
    initAnm && initAnm();
}
// Key Accounts (top 20% customers)
function rKey() {
    let cu = {};
    S.forEach(r => {
        let c = r.Customer||'';
        if(!cu[c]) cu[c] = {s:0,p:0,o:{}};
        cu[c].s += getSalesVal(r);
        cu[c].p += getProfitVal(r);
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
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?TUI('VIP'):'VIP'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${ka.n}">${ka.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Sales'):'Sales'}</span>
                    <strong style="font-size:0.9rem; color:${color}">${aFmt(ka.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Profit'):'Profit'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(ka.p)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Orders'):'Orders'}</span>
                    <span class="badge bg-g">${ka.o}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.keyacc}</span> ${t('keyacc')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Key Accounts'):'Key Accounts'}</div><div class="vl">${aFmt(keyAcc.length)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?TUI('Contribution'):'Contribution'}</div><div class="vl">${aFmt(totS>0?keyAcc.reduce((s,x)=>s+x.s,0)/totS*100:0,true)}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?TUI('Top 3 VIPs'):'Top 3 VIPs'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?TUI('None'):'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('keyacc')} ? ${L==='ar'?TUI('80% of Sales'):'80% of Sales'}</h3></div>
        <div class="tbs"><table><thead><tr><th>#</th><th>${L==='ar'?TUI('Customer'):'Customer'}</th><th>${L==='ar'?TUI('Sales'):'Sales'}</th><th>${L==='ar'?TUI('Profit'):'Profit'}</th><th>${L==='ar'?TUI('Margin'):'Margin'}</th><th>${L==='ar'?TUI('Orders'):'Orders'}</th></tr></thead>
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
        let s = getSalesVal(r);
        
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
                    <span style="color:var(--tx2);">${L==='ar'?TUI('Total Sales'):'Total Sales'}</span>
                    <strong style="color:${color};">${aFmt(d.s)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2);">${L==='ar'?TUI('Inactive for'):'Inactive for'}</span>
                    <span class="badge" style="background:${color}; color:white;">${d.days} ${L==='ar'?TUI('days'):'days'}</span>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.dormant}</span> ${t('dormant')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Dormant Customers'):'Dormant Customers'}</div><div class="vl">${aFmt(dormant.length)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--rd);"><div class="lb" style="color:var(--rd);">${L==='ar'?TUI('Lost Sales Potential'):'Lost Sales Potential'}</div><div class="vl" style="color:var(--rd);">${aFmt(dormant.reduce((sum,r)=>sum+r.s,0))}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?TUI('Top Lost Accounts'):'Top Lost Accounts'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?TUI('None'):'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('dormant')} - ${L==='ar'?TUI('No purchase in 60+ days'):'No purchase in 60+ days'}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?TUI('Customer'):'Customer'}</th><th>${L==='ar'?TUI('Total Sales'):'Total Sales'}</th><th>${L==='ar'?TUI('Last Purchase'):'Last Purchase'}</th><th>${L==='ar'?TUI('Days Ago'):'Days Ago'}</th><th>${L==='ar'?TUI('Status'):'Status'}</th></tr></thead>
        <tbody>${dormant.map(r=>`<tr><td><strong>${r.n}</strong></td><td>${fmt(r.s)}</td><td>${r.last}</td><td>${r.days}</td><td><span class="badge ${r.days>=120?'bg-r':'bg-a'}">${r.days>=120?(L==='ar'?TUI('Lost'):'Lost'):(L==='ar'?TUI('Dormant'):'Dormant')}</span></td></tr>`).join('')}</tbody>
        </table></div></div>
    `;
}

// Prospects (customers in T but not in S)
function rPros() {
    let activeCustomers = new Set(S.map(r=>r.Customer||''));
    let prospects = T.filter(r=>!activeCustomers.has(r.Customer));
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.prospects}</span> ${t('prospects')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?TUI('Prospects'):'Prospects'}</div><div class="vl">${aFmt(prospects.length)}</div></div></div>
        <div class="tb"><div class="tbt"><h3>${t('prospects')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?TUI('Customer'):'Customer'}</th><th>${L==='ar'?TUI('Target'):'Target'}</th></tr></thead>
        <tbody>${prospects.map(r=>`<tr><td><strong>${r.Customer}</strong></td><td>${fmt(Number(r.Target)||0)}</td></tr>`).join('')}${prospects.length===0?`<tr><td colspan="2" style="text-align:center;color:var(--tx2)">${L==='ar'?TUI('None'):'None'}</td></tr>`:''}</tbody>
        </table></div></div>
    `;
}

// Opportunities (customers below 50% of target)
function rPot() {
    let cu = {};
    S.forEach(r => { let c=r.Customer||''; cu[c]=(cu[c]||0)+(getSalesVal(r)); });
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
                <div style="font-size:0.8rem; color:var(--tx2); font-weight:bold;">${L==='ar'?TUI('Opportunity'):'Opportunity'} #${i+1}</div>
                <h3 style="margin:8px 0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${o.n}">${o.n}</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Target'):'Target'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(o.tg)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Achieved'):'Achieved'}</span>
                    <strong style="font-size:0.9rem;">${aFmt(o.ach)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--tx2); font-size:0.85rem;">${L==='ar'?TUI('Sales Gap'):'Sales Gap'}</span>
                    <strong style="color:${color}; font-size:1rem;">${aFmt(o.gap)}</strong>
                </div>
            </div>
        `;
    }

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.potential}</span> ${t('potential')}</h1></div>
        
        <div class="kg">
            <div class="ki"><div class="lb">${L==='ar'?TUI('Total Opportunities'):'Total Opportunities'}</div><div class="vl">${aFmt(opps.length)}</div></div>
            <div class="ki" style="background:var(--bg3); border:1px solid var(--p);"><div class="lb" style="color:var(--p);">${L==='ar'?TUI('Total Gap Potential'):'Total Gap Potential'}</div><div class="vl" style="color:var(--p);">${aFmt(opps.reduce((s,r)=>s+r.gap,0))}</div></div>
        </div>

        <h3 style="margin:20px 0 12px; color:var(--tx2); border-bottom:1px solid var(--bd); padding-bottom:8px;">${L==='ar'?TUI('Top 3 Opportunities'):'Top 3 Opportunities'}</h3>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
            ${topHtml || `<div style="color:var(--tx2); font-style:italic;">${L==='ar'?TUI('None'):'None'}</div>`}
        </div>

        <div class="tb"><div class="tbt"><h3>${t('potential')}</h3></div>
        <div class="tbs"><table><thead><tr><th>${L==='ar'?TUI('Customer'):'Customer'}</th><th>${L==='ar'?TUI('Target'):'Target'}</th><th>${L==='ar'?TUI('Achieved'):'Achieved'}</th><th>%</th><th>${L==='ar'?TUI('Gap'):'Gap'}</th></tr></thead>
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
        if(days >= 60) alerts.push({type:'warn', icon:'&#x26A0;&#xFE0F;', msg:`${n} ? ${L==='ar'?TUI('No purchase since'):'No purchase since'} ${days} ${L==='ar'?TUI('days'):'days'}`});
    });
    // Low target alerts
    let cuS = {};
    S.forEach(r => { let c=r.Customer||''; cuS[c]=(cuS[c]||0)+(getSalesVal(r)); });
    T.forEach(r => {
        let tg=Number(r.Target)||0, ach=cuS[r.Customer]||0, pct=tg>0?ach/tg*100:0;
        if(pct<50 && tg>0) alerts.push({type:'danger', icon:'&#x26A0;&#xFE0F;', msg:`${r.Customer} ? ${L==='ar'?TUI('Achievement'):'Achievement'} ${pc(pct)}`});
    });
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.alerts}</span> ${t('alerts')}</h1></div>
        <div class="kg"><div class="ki"><div class="lb">${L==='ar'?TUI('Alerts'):'Alerts'}</div><div class="vl">${aFmt(alerts.length)}</div></div></div>
        <div class="card">
            ${alerts.length===0?`<p style="text-align:center;color:var(--tx2);">? ${L==='ar'?TUI('No alerts'):'No alerts'}</p>`:alerts.map(a=>`<div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:var(--bg3);border-radius:8px;border-left:3px solid ${a.type==='danger'?'var(--rd)':'var(--am)'}"><span style="font-size:1.2rem;">${a.icon}</span><span style="font-size:0.85rem;">${a.msg}</span></div>`).join('')}
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
        cu[c].s += getSalesVal(r);
        cu[c].p += getProfitVal(r);
        cu[c].o[r['Order Nbr']]=1;
        let d=pd(r['Order Date']); if(d>cu[c].last) cu[c].last=d;
        if(isAcc(r['Item Class Name'])) cu[c].accS+=getSalesVal(r);
        else if(isHW(r['Item Class Name'])) cu[c].hwS+=getSalesVal(r);
    });
    let insights = [];
    let arr = Object.entries(cu).map(([n,d])=>({n,...d,o:Object.keys(d.o).length,m:d.s>0?d.p/d.s*100:0})).sort((a,b)=>b.s-a.s);
    let today = new Date();
    arr.slice(0,5).forEach(r => insights.push({icon:'?',color:'var(--gn)',text:`${r.n}: ${L==='ar'?TUI('Top customer with'):'Top customer with'} ${fmt(r.s)}`}));
    arr.filter(r=>r.m<5&&r.s>10000).slice(0,3).forEach(r => insights.push({icon:'&#x26A0;&#xFE0F;',color:'var(--am)',text:`${r.n}: ${L==='ar'?TUI('Low margin'):'Low margin'} (${pc(r.m)}) ? ${L==='ar'?TUI('Review pricing'):'Review pricing'}`}));
    arr.filter(r=>{ let days=Math.floor((today-new Date(r.last))/86400000); return days>=45&&days<90; }).slice(0,3).forEach(r => insights.push({icon:'&#x26A0;&#xFE0F;',color:'var(--am)',text:`${r.n}: ${L==='ar'?TUI('Needs follow-up ? last purchase was'):'Needs follow-up ? last purchase was'} ${Math.floor((today-new Date(r.last))/86400000)} ${L==='ar'?TUI('days ago'):'days ago'}`}));
    arr.filter(r=>r.accS===0&&r.hwS>0).slice(0,3).forEach(r => insights.push({icon:'&#x26A0;&#xFE0F;',color:'var(--am)',text:`${r.n}: ${L==='ar'?TUI('No accessories ? upsell opportunity'):'No accessories ? upsell opportunity'}`}));
    
    let key = ld('sp_gemini_key') || '';
    window.aiChatHistory = window.aiChatHistory || [];

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.ai}</span> ${t('ai')}</h1></div>
        
        <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:16px;">${L==='ar'?TUI('Quick Smart Insights'):'Quick Smart Insights'}</h3>
            ${insights.length===0?`<p style="color:var(--tx2);text-align:center;">${L==='ar'?TUI('Upload your data to get AI insights'):'Upload your data to get AI insights'}</p>`:insights.map(i=>`<div style="display:flex;gap:12px;padding:12px;margin-bottom:10px;background:var(--bg3);border-radius:10px;border-left:3px solid ${i.color};"><span style="font-size:1.3rem;">${i.icon}</span><span style="font-size:0.85rem;line-height:1.5;">${i.text}</span></div>`).join('')}
        </div>

        <div class="card" style="display:flex; flex-direction:column; height:500px;">
            <h3 style="margin-bottom:16px;">? ${L==='ar'?TUI('AI Co-pilot Chat'):'AI Co-pilot Chat'}</h3>
            ${!key ? `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                    <span style="font-size:3rem; margin-bottom:16px;">&#x1F4C8;</span>
                    <p style="color:var(--tx2); margin-bottom:16px;">${L==='ar'?TUI('You must enter a Gemini API Key in settings to enable smart chat.'):'You must enter a Gemini API Key in settings to enable smart chat.'}</p>
                    <button class="btn btn-p" onclick="P='settings';buildNav();render();">${L==='ar'?TUI('Go to Settings'):'Go to Settings'}</button>
                </div>
            ` : `
                <div id="aiChatBox" style="flex:1; overflow-y:auto; background:var(--bg2); border-radius:8px; padding:16px; margin-bottom:16px; display:flex; flex-direction:column; gap:12px;">
                    ${window.aiChatHistory.length===0 ? `
                        <div style="text-align:center; color:var(--tx2); margin:auto;">
                            <span style="font-size:2rem;">&#x1F4B0;</span><br>
                            ${L==='ar'?TUI('Hello! Ask me anything about your sales and customers.'):'Hello! Ask me anything about your sales and customers.'}
                        </div>
                    ` : window.aiChatHistory.map(msg => `
                        <div style="align-self:${msg.role==='user'?'flex-end':'flex-start'}; background:${msg.role==='user'?'var(--p)':'var(--bg3)'}; color:${msg.role==='user'?'#fff':'var(--tx1)'}; padding:10px 14px; border-radius:12px; max-width:85%; word-wrap:break-word; font-size:0.9rem; line-height:1.5;">
                            ${msg.text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}
                        </div>
                    `).join('')}
                </div>
                <div style="display:flex; gap:8px;">
                    <input id="aiInput" type="text" class="sbox" style="flex:1;" placeholder="${L==='ar'?TUI('Ask the AI assistant...'):'Ask the AI assistant...'}" onkeypress="if(event.key==='Enter') document.getElementById('aiSend').click()">
                    <button id="aiSend" class="btn btn-p" style="padding:0 24px;">${L==='ar'?TUI('Send'):'Send'}</button>
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

                let totalSales = ds.reduce((s,r)=>s+(getSalesVal(r)), 0);
                let totalProfit = ds.reduce((s,r)=>s+(getProfitVal(r)), 0);
                let ctx = {
                    totalSales,
                    totalProfit,
                    top5Customers: arr.slice(0,5).map(x=>({name:x.n, sales:x.s, profit:x.p})),
                    totalCustomers: arr.length
                };
                
                let systemPrompt = `You are a specialized Sales Analysis AI for "Sales Pro". Respond in ${L==='ar'?'Arabic':'English'}.
Analyze the following:
- Total Sales: ${ctx.totalSales}
- Total Profit: ${ctx.totalProfit}
- Total Customers: ${ctx.totalCustomers}
- Top 5 Customers: ${JSON.stringify(ctx.top5Customers)}
Provide business insights and actionable recommendations.`;

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
            <div style="width:72px;height:72px;border-radius:50%;background:var(--am);color:#fff;font-size:2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">&#x1F464;</div>
            <h3>${user ? user.email : (L==='ar'?TUI('Not logged in'):'Not logged in')}</h3>
            <p style="color:var(--tx2);font-size:0.8rem;margin:8px 0 20px;">${L==='ar'?TUI('Active User'):'Active User'}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${S.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?TUI('Sales'):'Sales'}</div></div>
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${T.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?TUI('Targets'):'Targets'}</div></div>
                <div style="background:var(--bg3);padding:12px;border-radius:10px;"><div style="font-size:1.4rem;font-weight:bold;">${C.length}</div><div style="font-size:0.75rem;color:var(--tx2);">${L==='ar'?TUI('Collections'):'Collections'}</div></div>
            </div>
            <button class="btn btn-p" onclick="P='settings';buildNav();render();" style="width:100%;margin-bottom:10px;">${t('settings')}</button>
            <button class="btn" onclick="logout();" style="width:100%;background:var(--rd);color:#fff;border:none;">${t('logout')}</button>
        </div>
    `;
}

// Backup
function rBk() {
    $('M').innerHTML = `;
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.backup}</span> ${t('backup')}</h1></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div class="card">
                <h3 style="margin-bottom:12px;text-align:center;">${L==='ar'?'تصدير للإكسيل':'Export to Excel'}</h3>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <button class="btn" id="bkSales" style="width:100%; justify-content:center;">${L==='ar'?'مبيعات':'Sales'} (${S.length})</button>
                    <button class="btn" id="bkTgt" style="width:100%; justify-content:center;">${L==='ar'?'تارجت':'Targets'} (${T.length})</button>
                    <button class="btn" id="bkPay" style="width:100%; justify-content:center;">${L==='ar'?'تحصيلات':'Collections'} (${C.length})</button>
                </div>
            </div>
            <div class="card">
                <h3 style="margin-bottom:12px;text-align:center;">النسخ الاحتياطي الشامل 💾</h3>
                <p style="text-align:center;color:var(--tx2);font-size:0.85rem;margin-bottom:15px;">
                    يقوم بتصدير كافة بيانات المبيعات والتارجت والتحصيلات في ملف واحد (JSON) لاسترجاعها لاحقاً.
                </p>
                <button class="btn btn-p" id="bDownJSON" style="width:100%; justify-content:center; margin-bottom:10px;">
                    تنزيل ملف النسخة الاحتياطية (JSON)
                </button>
                <label for="fUpJSON" class="btn" style="width:100%; justify-content:center; display:flex; margin-bottom:10px; cursor:pointer;">
                    استرجاع نسخة من ملف (JSON)
                </label>
                <input type="file" id="fUpJSON" accept=".json" style="display:none;">
                
                <button class="btn" id="bMailJSON" style="width:100%; justify-content:center; margin-bottom:10px; background:#ea4335; color:white; border:none;">
                    إرسال نسخة بالإيميل ✉️ (Gmail)
                </button>
                <button class="btn" id="bDriveJSON" style="width:100%; justify-content:center; background:#0f9d58; color:white; border:none;">
                    نسخ احتياطي إلى (Google Drive) ☁️
                </button>
                <div style="margin-top:12px;padding:10px 14px;background:rgba(15, 157, 88, 0.12);border:1px solid #0f9d58;border-radius:8px;font-size:0.85rem;color:#0f9d58;display:flex;align-items:center;gap:10px;line-height:1.4;">
                    <span style="font-size:1.2rem;">🕒</span>
                    <span>${L==='ar' ? 'النسخ الاحتياطي التلقائي إلى Google Drive فعال ويعمل في الخلفية كل 15 دقيقة (ربع ساعة).' : 'Automatic backup to Google Drive runs every 15 minutes in the background.'}</span>
                </div>
            </div>
        </div>
    `;
    $('bkSales').onclick = () => S.length ? exportToExcel(S, 'Sales_Backup') : toast(L==='ar'?'لا توجد بيانات':'No data');
    $('bkTgt').onclick   = () => T.length ? exportToExcel(T, 'Targets_Backup') : toast(L==='ar'?'لا توجد بيانات':'No data');
    $('bkPay').onclick   = () => C.length ? exportToExcel(C, 'Collections_Backup') : toast(L==='ar'?'لا توجد بيانات':'No data');
    $('bDownJSON').onclick = () => {
        let dump = { S, T, C, D, accCats, hwCats };
        let blob = new Blob([JSON.stringify(dump)], {type: "application/json"});
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `SalesPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        toast(L==='ar'?'تم تنزيل النسخة!':'Backup Downloaded!');
    };
    if($('bDriveJSON')) {
        $('bDriveJSON').onclick = () => {
            if(typeof window.backupToGoogleDrive === 'function') {
                window.backupToGoogleDrive();
            } else {
                toast(L==='ar'?'خدمة Google Drive غير متوفرة':'Google Drive service is not available', 'error');
            }
        };
    }
    if($('bMailJSON')) {
        $('bMailJSON').onclick = () => {
            $('bDownJSON').click();
            toast(L==='ar'?'سيفتح الإيميل.. قم بإرفاق الملف الذي تم تنزيله!':'Opening Email.. Attach the downloaded file!');
            setTimeout(() => {
                window.location.href = `mailto:?subject=${encodeURIComponent('SalesPro Data Backup')}&body=${encodeURIComponent(L==='ar'?'يرجى إيجاد ملف النسخة الاحتياطية (JSON) مرفقاً.':'Please find the JSON backup file attached.')}`;
            }, 2000);
        };
    }
    $('fUpJSON').onchange = (e) => {
        let f = e.target.files[0];
        if(!f) return;
        let reader = new FileReader();
        reader.onload = (ev) => {
            try {
                let d = JSON.parse(ev.target.result);
                if(d.S) { S = d.S; sv('salesData', S); }
                if(d.T) { T = d.T; sv('targetData', T); }
                if(d.C) { C = d.C; sv('payData', C); }
                if(d.D) { D = d.D; sv('duesData', D); }
                if(d.accCats) { accCats = d.accCats; sv('accCats', accCats); }
                if(d.hwCats) { hwCats = d.hwCats; sv('hwCats', hwCats); }
                toast(L==='ar'?'تمت الاستعادة بنجاح!':'Restored Successfully!');
                render();
            } catch(ex) {
                toast(L==='ar'?'ملف غير صالح!':'Invalid File!');
            }
        };
        reader.readAsText(f);
    };
}

function rSetup() {
    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.setup}</span> ${t('setup')}</h1></div>
        <div class="card">
            <h3 style="margin-bottom:12px;">${L==='ar'?TUI('Upload Excel Files'):'Upload Excel Files'}</h3>
            <p style="margin-bottom:16px;color:var(--tx2);font-size:0.85rem;">${L==='ar'?TUI('Upload your Sales, Target and Collections Excel files to update the data.'):'Upload your Sales, Target and Collections Excel files to update the data.'}</p>
            <div style="background:var(--gn);color:#fff;padding:10px;border-radius:8px;margin-bottom:16px;font-size:0.9rem;display:flex;align-items:center;gap:8px;">
                &#x2601;&#xFE0F; <strong>${L==='ar'?TUI('Cloud Sync Active'):'Cloud Sync Active'}</strong>
            </div>
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fSales" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">${L==='ar'?TUI('Sales File'):'Sales File'}</label>
                    <input type="file" id="fSales" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${S.length} ${L==='ar'?TUI('records currently loaded'):'records currently loaded'}</p>
                </div>
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fTarget" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">${L==='ar'?TUI('Target File'):'Target File'}</label>
                    <input type="file" id="fTarget" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${T.length} ${L==='ar'?TUI('records currently loaded'):'records currently loaded'}</p>
                </div>
                <div style="background:var(--bg3);padding:16px;border-radius:12px;border:1px solid var(--bd);">
                    <label for="fPay" style="font-size:1rem;font-weight:bold;display:block;margin-bottom:10px;cursor:pointer;">${L==='ar'?TUI('Collections File'):'Collections File'}</label>
                    <input type="file" id="fPay" accept=".xlsx,.xls,.csv" style="display:block;width:100%;padding:10px;background:var(--bg);border:1px dashed var(--am);border-radius:8px;cursor:pointer;">
                    <p style="font-size:0.8rem;color:var(--tx2);margin-top:8px;">${C.length} ${L==='ar'?TUI('records currently loaded'):'records currently loaded'}</p>
                </div>
            </div>
            <button id="bUpload" class="btn btn-p" style="margin-top:20px;width:100%;padding:12px;font-size:1.1rem;">${L==='ar'?TUI('Upload & Update Data'):'Upload & Update Data'}</button>
        </div>
        
        <div class="card" style="margin-top:20px;">
            <h3 style="margin-bottom:12px;">إدارة فئات الإكسسوارات (Accessories Categories)</h3>
            <p style="margin-bottom:16px;color:var(--tx2);font-size:0.85rem;">يمكنك تعديل أو إضافة الفئات التي يتم اعتبارها إكسسوارات، افصل بين كل فئة وأخرى بفاصلة (,)</p>
            <textarea id="inAccCats" rows="4" style="width:100%;padding:12px;background:var(--bg);color:var(--tx);border:1px solid var(--bd);border-radius:8px;resize:vertical;font-family:inherit;font-size:0.95rem;">${(accCats && accCats.length) ? accCats.join(', ') : (typeof DEF_ACC !== 'undefined' ? DEF_ACC.join(', ') : '')}</textarea>
            <button id="bSaveCats" class="btn btn-p" style="margin-top:16px;width:100%;padding:12px;font-size:1rem;">حفظ الفئات والتحديث / Save & Update</button>
        </div>
    `;
    function parseFile(file, cb, sheetName) {
        let reader = new FileReader();
        reader.onload = e => {
            try {
                let wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
                let ws;
                if (sheetName) {
                    let sName = wb.SheetNames.find(s => s.trim().toLowerCase() === sheetName.trim().toLowerCase());
                    ws = sName ? wb.Sheets[sName] : wb.Sheets[wb.SheetNames[0]];
                } else {
                    ws = wb.Sheets[wb.SheetNames[0]];
                }
                cb(XLSX.utils.sheet_to_json(ws));
            } catch(err) { toast(L==='ar'?TUI('? Error reading file'):'? Error reading file'); }
        };
        reader.readAsArrayBuffer(file);
    }
    $('bUpload').onclick = () => {
        let done = 0, total = 0;
        let fS = $('fSales').files[0], fT = $('fTarget').files[0], fP = $('fPay').files[0];
        if(!fS && !fT && !fP) { toast(L==='ar'?TUI('Choose a file first!'):'Choose a file first!'); return; }
        let onAllDone = () => {
            toast(L==='ar' ? '✅ تم تحديث البيانات!' : '✅ Data Updated!');
            render();
            if (typeof window.cloudAutoSave === 'function') {
                window.cloudAutoSave(L==='ar' ? 'رفع ملفات' : 'File Upload');
            }
        };
        if(fS) { total++; parseFile(fS, d => { S = d; sv('salesData', d); done++; if(done===total) onAllDone(); }); }
        if(fT) { total++; parseFile(fT, d => { T = d; sv('targetData', d); done++; if(done===total) onAllDone(); }); }
        if(fP) { total++; parseFile(fP, d => { C = d; sv('payData', d); done++; if(done===total) onAllDone(); }, 'Payment Ref'); }
    };

    
    $('bSaveCats').onclick = () => {
        let vals = $('inAccCats').value.split(',').map(s => s.trim()).filter(s => s);
        if(vals.length > 0) {
            accCats = vals;
            sv('accCats', accCats);
            toast(L==='ar'?'تم حفظ فئات الإكسسوارات بنجاح!':'Categories Saved!');
            render();
        } else {
            toast(L==='ar'?'لا يمكن ترك الفئات فارغة!':'Categories cannot be empty!');
        }
    };
}
















/* ==========================================================================
   ENTERPRISE V8 CRASH-PROOF ENHANCEMENTS (SAFE STATIC HELPERS)
   ========================================================================== */

// 1. Full-Page To-Do / Tasks Tab (Enterprise V8)
window.rTodo = function() {
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    
    let html = `<div class="ph">
        <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.todo || '📋'}</span> ${t('todo')}</h1>
    </div>
    
    <div class="card" style="max-width:850px;margin:0 auto 24px;padding:28px;background:var(--bg2);border-radius:16px;box-shadow:0 6px 16px rgba(0,0,0,0.06);border:1px solid var(--bd);">
        <div style="display:flex;gap:12px;margin-bottom:28px;">
            <input type="text" id="newTodoInput" class="inp" placeholder="${L==='ar'?'أدخل مهمة جديدة هنا (مثال: متابعة تحصيل العميل إسلام)...':'Enter new task here...'}" style="flex:1;padding:14px 18px;font-size:1.05rem;border-radius:12px;border:1px solid var(--bd);background:var(--bg1);color:var(--tx1);" onkeydown="if(event.key==='Enter') addTodoItem()">
            <button class="btn btn-p" onclick="addTodoItem()" style="padding:0 28px;font-size:1.05rem;font-weight:bold;border-radius:12px;display:flex;align-items:center;gap:8px;background:var(--ac);color:#fff;cursor:pointer;">
                <span style="font-size:1.4rem;">+</span> ${L==='ar'?'إضافة مهمة':'Add Task'}
            </button>
        </div>
        
        <div id="todoListContainer" style="display:flex;flex-direction:column;gap:14px;">`;
        
    if(todos.length === 0) {
        html += `<div style="text-align:center;padding:56px 20px;background:var(--bg1);border-radius:14px;border:1px dashed var(--bd-s);">
            <div style="font-size:3.5rem;margin-bottom:14px;">🎉</div>
            <h3 style="margin:0;color:var(--tx1);font-size:1.3rem;">${L==='ar'?'لا توجد مهام معلقة حالياً!':'No pending tasks right now!'}</h3>
            <p style="color:var(--tx2);margin-top:8px;font-size:1rem;">${L==='ar'?'أضف مهامك اليومية ومتابعات العملاء والتحصيلات لتنظيم وقتك بكفاءة.':'Add your daily tasks, customer follow-ups and collections.'}</p>
        </div>`;
    } else {
        let pending = todos.filter(t => !t.done).length;
        let completed = todos.filter(t => t.done).length;
        
        html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 6px;font-size:0.95rem;color:var(--tx2);font-weight:600;">
            <span>${L==='ar'?'المهام المتبقية:':'Pending tasks:'} <strong style="color:var(--ac);font-size:1.1rem;">${pending}</strong></span>
            <span>${L==='ar'?'المكتملة:':'Completed:'} <strong style="color:#10b981;font-size:1.1rem;">${completed}</strong></span>
        </div>`;
        
        todos.forEach((item, idx) => {
            html += `<div class="todo-item ${item.done ? 'done' : ''}" style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;background:var(--bg1);border:1px solid var(--bd-s);border-radius:14px;transition:all 0.2s;box-shadow:0 2px 6px rgba(0,0,0,0.02);">
                <div style="display:flex;align-items:center;gap:16px;cursor:pointer;flex:1;" onclick="toggleTodoStatus(${idx})">
                    <input type="checkbox" ${item.done ? 'checked' : ''} style="cursor:pointer;width:22px;height:22px;accent-color:var(--ac);" onclick="event.stopPropagation(); toggleTodoStatus(${idx});">
                    <span style="font-size:1.1rem;font-weight:600;color:var(--tx1);text-decoration:${item.done ? 'line-through' : 'none'};opacity:${item.done ? '0.5' : '1'};">${item.text}</span>
                </div>
                <button onclick="deleteTodoItem(${idx})" style="background:transparent;border:none;cursor:pointer;color:#ef4444;font-size:1.4rem;padding:6px 12px;border-radius:8px;transition:background 0.2s;" title="${L==='ar'?'حذف المهمة':'Delete'}" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='transparent'">🗑️</button>
            </div>`;
        });
    }
    
    html += `</div>
    </div>`;
    
    let elM = $('M');
    if (elM) elM.innerHTML = html;
};

window.initTodoUI = function() {
    if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
};

window.toggleTodoDrawer = function() {
    if (typeof rPage === 'function') rPage('todo');
    else if (typeof P !== 'undefined') { P = 'todo'; if(typeof buildNav==='function') buildNav(); if(typeof render==='function') render(); }
};

window.addTodoItem = function() {
    let input = document.getElementById('newTodoInput');
    if(!input || !input.value.trim()) return;
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    todos.push({ text: input.value.trim(), done: false });
    localStorage.setItem('sp_todos', JSON.stringify(todos));
    input.value = '';
    if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
    else initTodoUI();
    if(typeof toast==='function') toast(L==='ar'?'تمت إضافة المهمة بنجاح':'Task added');
};

window.deleteTodoItem = function(idx) {
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    todos.splice(idx, 1);
    localStorage.setItem('sp_todos', JSON.stringify(todos));
    if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
    else initTodoUI();
};

window.toggleTodoStatus = function(idx) {
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    if(todos[idx]) {
        todos[idx].done = !todos[idx].done;
        localStorage.setItem('sp_todos', JSON.stringify(todos));
        if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
        else initTodoUI();
    }
};

// 2. Print Official Receipt / Invoice
window.printReceipt = function(customerName, amount, dateStr, typeStr) {
    let modal = document.getElementById('printInvoiceModal');
    let content = document.getElementById('printModalContent');
    if(!modal || !content) return;
    let invNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    let today = dateStr || new Date().toISOString().split('T')[0];
    content.innerHTML = '<div style="text-align:center;border-bottom:2px dashed var(--bd);padding-bottom:15px;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:var(--tx1);font-weight:800;font-size:1.6rem;">🏢 Sales Pro Enterprise</h2>' +
        '<p style="margin:4px 0 0;color:var(--tx2);font-size:0.95rem;">إيصال معاملة مبيعات / تحصيل رسمي وثابت</p>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:15px;font-size:0.95rem;color:var(--tx1);">' +
        '<div><strong>رقم الإيصال:</strong> ' + invNum + '</div>' +
        '<div><strong>التاريخ:</strong> ' + today + '</div>' +
        '</div>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:0.95rem;">' +
        '<tr style="background:var(--bg3);border-bottom:1px solid var(--bd);">' +
        '<th style="padding:10px;text-align:right;border:1px solid var(--bd);">البيان / العميل</th>' +
        '<th style="padding:10px;text-align:left;border:1px solid var(--bd);">القيمة (ج.م)</th>' +
        '</tr>' +
        '<tr>' +
        '<td style="padding:12px;border:1px solid var(--bd);color:var(--tx1);"><strong>' + (customerName || 'عميل عام') + '</strong><br><span style="font-size:0.85rem;color:var(--tx2);">' + (typeStr || 'معاملة مبيعات') + '</span></td>' +
        '<td style="padding:12px;text-align:left;border:1px solid var(--bd);font-weight:bold;font-size:1.2rem;color:#10b981;">' + (typeof fmt==='function'?fmt(amount):amount) + ' ج.م</td>' +
        '</tr>' +
        '</table>' +
        '<div style="text-align:center;margin-top:30px;color:var(--tx2);font-size:0.85rem;border-top:1px solid var(--bd);padding-top:15px;">' +
        'تم إصدار هذا الإيصال إلكترونياً عبر نظام Sales Pro CRM، ولا يحتاج إلى ختم أو توقيع يدوي.' +
        '</div>' +
        '<div class="no-print" style="margin-top:25px;display:flex;gap:12px;justify-content:center;">' +
        '<button onclick="window.print();" class="btn btn-p" style="padding:10px 24px;font-size:1rem;background:#10b981;color:#fff;border:none;">🖨️ طباعة فورية</button>' +
        '<button onclick="document.getElementById(\'printInvoiceModal\').style.display=\'none\';" class="btn" style="padding:10px 24px;font-size:1rem;background:var(--bg3);color:var(--tx1);border:1px solid var(--bd);">إغلاق</button>' +
        '</div>';
    modal.style.display = 'flex';
};

// 3. Excel Import Helper
window.importFromExcel = function(targetType) {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .csv';
    input.onchange = function(e) {
        let file = e.target.files[0];
        if(!file) return;
        if(typeof XLSX === 'undefined') {
            alert('XLSX library not loaded yet!');
            return;
        }
        let reader = new FileReader();
        reader.onload = function(evt) {
            try {
                let data = new Uint8Array(evt.target.result);
                let workbook = XLSX.read(data, {type: 'array'});
                let firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                let jsonData = XLSX.utils.sheet_to_json(firstSheet);
                if(!jsonData || jsonData.length === 0) {
                    if(typeof toast==='function') toast(L==='ar'?'الملف فارغ أو غير صالح':'Empty file', 'error');
                    return;
                }
                if(targetType === 'leads' || targetType === 'prospects') {
                    let ld = []; try { ld = JSON.parse(localStorage.getItem('leadsData') || '[]'); } catch(err){}
                    jsonData.forEach(row => {
                        ld.push({
                            id: Date.now() + Math.random(),
                            name: row['Customer Name'] || row['Name'] || row['الاسم'] || row['اسم العميل'] || 'عميل مستورد',
                            phone: row['Phone'] || row['Mobile'] || row['رقم الهاتف'] || row['التليفون'] || '',
                            branch: row['Branch'] || row['الفرع'] || 'حدائق القبة',
                            status: row['Status'] || row['الحالة'] || 'Warm',
                            note: row['Note'] || row['ملاحظات'] || 'تم الاستيراد من الإكسل'
                        });
                    });
                    localStorage.setItem('leadsData', JSON.stringify(ld));
                    if(typeof toast==='function') toast(L==='ar'? 'تم استيراد ' + jsonData.length + ' عميل محتمل بنجاح!' : 'Imported ' + jsonData.length + ' leads!', 'success');
                    if(typeof render==='function') render();
                } else if(targetType === 'customers' || targetType === 'sales') {
                    let count = 0;
                    jsonData.forEach(row => {
                        let cName = row['Customer Name'] || row['Customer'] || row['اسم العميل'] || row['العميل'];
                        if(cName && !window.C.find(c => (c.name||'').toLowerCase() === cName.toLowerCase())) {
                            window.C.push({
                                id: Date.now() + Math.random(),
                                name: cName,
                                phone: row['Phone'] || row['Mobile'] || row['رقم الهاتف'] || '',
                                branch: row['Branch'] || row['الفرع'] || 'حدائق القبة',
                                type: row['Type'] || row['النوع'] || 'تجزئة'
                            });
                            count++;
                        }
                    });
                    sv('custData', window.C);
                    if(typeof toast==='function') toast(L==='ar'? 'تمت إضافة ' + count + ' عميل جديد بنجاح!' : 'Added ' + count + ' customers!', 'success');
                    if(typeof render==='function') render();
                } else {
                    if(typeof toast==='function') toast(L==='ar'?'تم تحليل الملف بنجاح':'File parsed successfully', 'success');
                }
            } catch(err) {
                if(typeof toast==='function') toast(L==='ar'?'حدث خطأ في قراءة ملف الإكسل':'Error reading excel', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    input.click();
};

// 4. Global Search Helper
window.initGlobalSearch = function() {
    let input = document.getElementById('globalSearchInput');
    let resBox = document.getElementById('globalSearchResults');
    let clearBtn = document.getElementById('clearGlobalSearch');
    if(!input || !resBox) return;

    input.oninput = function() {
        let q = this.value.trim().toLowerCase();
        if(!q) {
            resBox.style.display = 'none';
            if(clearBtn) clearBtn.style.display = 'none';
            return;
        }
        if(clearBtn) clearBtn.style.display = 'inline';

        let matches = [];
        (window.S || []).forEach(s => {
            let c = (s.Customer || '').toLowerCase();
            let i = (s['Item Description'] || '').toLowerCase();
            if(c.includes(q) || i.includes(q)) {
                matches.push({ title: s.Customer || 'عميل', sub: s['Item Description'] || '', type: 'مبيعات', p: 'sales' });
            }
        });
        (window.C || []).forEach(c => {
            let n = (c.name || '').toLowerCase();
            let ph = (c.phone || '').toLowerCase();
            if(n.includes(q) || ph.includes(q)) {
                matches.push({ title: c.name || 'عميل', sub: c.phone || '', type: 'عميل', p: 'customers' });
            }
        });

        if(matches.length === 0) {
            resBox.innerHTML = '<div style="padding:12px;text-align:center;color:var(--tx2);">' + (L === 'ar' ? 'لا توجد نتائج مطابقة' : 'No results found') + '</div>';
        } else {
            let h = '';
            matches.slice(0, 8).forEach(m => {
                h += '<div onclick="P=\'' + m.p + '\';if(typeof buildNav===\'function\')buildNav();if(typeof render===\'function\')render();document.getElementById(\'globalSearchResults\').style.display=\'none\';document.getElementById(\'globalSearchInput\').value=\'\';" style="padding:10px 14px;border-bottom:1px solid var(--bd);cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:background 0.2s;">' +
                    '<div><strong style="font-size:0.95rem;display:block;color:var(--tx1);">' + m.title + '</strong><span style="font-size:0.8rem;color:var(--tx2);">' + m.sub + '</span></div>' +
                    '<span class="badge" style="font-size:0.75rem;padding:4px 8px;background:var(--acl);color:var(--ac);border-radius:6px;">' + m.type + '</span>' +
                    '</div>';
            });
            resBox.innerHTML = h;
        }
        resBox.style.display = 'block';
    };

    if(clearBtn) {
        clearBtn.onclick = function() {
            input.value = '';
            resBox.style.display = 'none';
            this.style.display = 'none';
        };
    }
};

// 5. Safe UI Enhancer Hook
window.enhanceUI = function() {
    try {
        initGlobalSearch();
        let ph = document.querySelector('#M .ph');
        if(ph && !document.getElementById('btnExcelImport') && (P==='sales'||P==='leads'||P==='prospects'||P==='customers')) {
            let btn = document.createElement('button');
            btn.id = 'btnExcelImport';
            btn.className = 'btn';
            btn.style.cssText = 'background:#10b981;color:#fff;display:flex;align-items:center;gap:6px;font-size:0.85rem;padding:6px 14px;border-radius:10px;border:none;cursor:pointer;margin-left:auto;box-shadow:0 4px 10px rgba(16, 185, 129, 0.3);';
            btn.innerHTML = '📥 ' + (L === 'ar' ? 'استيراد من Excel' : 'Import Excel');
            btn.onclick = () => { if(typeof window.importFromExcel === 'function') importFromExcel(P); };
            ph.appendChild(btn);
        }

        if(P === 'sales' || P === 'customers' || P === 'collections' || P === 'dormant') {
            document.querySelectorAll('#M table tbody tr').forEach(tr => {
                let tds = tr.querySelectorAll('td');
                if(tds.length >= 2 && !tr.querySelector('.btn-print-icon')) {
                    let cName = tds[0] ? tds[0].innerText.trim() : 'العميل';
                    let amtStr = tds[tds.length - 1] ? tds[tds.length - 1].innerText.replace(/[^0-9.]/g,'') : '0';
                    let btn = document.createElement('a');
                    btn.className = 'btn-print-icon';
                    btn.href = 'javascript:void(0)';
                    btn.innerHTML = '🖨️';
                    btn.title = L === 'ar' ? 'طباعة إيصال رسمي' : 'Print Receipt';
                    btn.style.cssText = 'margin-left:8px;font-size:1.1rem;text-decoration:none;cursor:pointer;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.15));';
                    btn.onclick = (e) => { e.stopPropagation(); if(typeof window.printReceipt === 'function') printReceipt(cName, Number(amtStr), new Date().toISOString().split('T')[0], 'فاتورة مبيعات/حساب'); };
                    if(tds[0]) tds[0].appendChild(btn);
                }
            });
        }

        if(P === 'leads' || P === 'prospects') {
            document.querySelectorAll('#M table tbody tr').forEach(tr => {
                let tds = tr.querySelectorAll('td');
                if(tds.length >= 3 && !tr.querySelector('.wa-injected')) {
                    let name = tds[0] ? tds[0].innerText.trim() : '';
                    let phone = tds[2] ? tds[2].innerText.trim() : '';
                    if(phone && phone !== '' && !phone.includes('wa-injected')) {
                        let span = document.createElement('span');
                        span.className = 'wa-injected';
                        let cleanName = name.replace(/'/g, "\'");
                        let cleanPhone = phone.replace(/[^0-9]/g, '');
                        span.innerHTML = '<a href="https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent('مرحباً بك ' + name) + '" target="_blank" style="margin-left:8px;text-decoration:none;font-size:1.2rem;filter:drop-shadow(0 2px 4px rgba(37,211,102,0.4));" title="مراسلة عبر واتساب">🟢</a>';
                        if(tds[2]) tds[2].appendChild(span);
                    }
                }
            });
        }

        if((P === 'dashboard' || P === 'analytics') && !document.getElementById('branchPerfChartCard')) {
            let qobbahSales = 0, luxorSales = 0, tot = 0;
            (window.S || []).forEach(s => {
                let val = Number(s['Sales Without Tax'] || 0);
                tot += val;
                let c = (s.Customer || '').toLowerCase();
                let ref = (s['Payment Ref.'] || '').toLowerCase();
                if(c.includes('أقصر') || c.includes('اقصر') || c.includes('luxor') || ref.includes('أقصر') || ref.includes('luxor')) {
                    luxorSales += val;
                } else {
                    qobbahSales += val;
                }
            });
            let qPct = tot > 0 ? Math.round((qobbahSales/tot)*100) : 50;
            let lPct = tot > 0 ? Math.round((luxorSales/tot)*100) : 50;

            let card = document.createElement('div');
            card.id = 'branchPerfChartCard';
            card.className = 'card';
            card.style.cssText = 'margin-top:20px;padding:20px;border-left:5px solid #10b981;';
            card.innerHTML = '<h3 style="margin:0 0 14px 0;display:flex;align-items:center;gap:10px;font-size:1.1rem;">📊 ' + (L === 'ar' ? 'مقارنة أداء المبيعات بين الفروع (تحليل تنفيذي)' : 'Branch Sales Performance') + '</h3>' +
                '<div style="margin-bottom:14px;">' +
                '<div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:6px;">' +
                '<span>🏢 ' + (L === 'ar' ? 'فرع حدائق القبة والعملاء العامين' : 'Hadayek El-Qobbah & General') + '</span>' +
                '<strong style="color:#10b981;">' + (typeof fmt==='function'?fmt(qobbahSales):qobbahSales) + ' ج.م (' + qPct + '%)</strong>' +
                '</div>' +
                '<div style="background:var(--bg3);height:14px;border-radius:7px;overflow:hidden;border:1px solid var(--bd);">' +
                '<div style="background:linear-gradient(90deg, #3b82f6, #10b981);width:' + qPct + '%;height:100%;transition:width 1s;"></div>' +
                '</div>' +
                '</div>' +
                '<div>' +
                '<div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:6px;">' +
                '<span>🏛️ ' + (L === 'ar' ? 'فرع الأقصر وعملائه' : 'Luxor Branch') + '</span>' +
                '<strong style="color:#ef4444;">' + (typeof fmt==='function'?fmt(luxorSales):luxorSales) + ' ج.م (' + lPct + '%)</strong>' +
                '</div>' +
                '<div style="background:var(--bg3);height:14px;border-radius:7px;overflow:hidden;border:1px solid var(--bd);">' +
                '<div style="background:linear-gradient(90deg, #ef4444, #f59e0b);width:' + lPct + '%;height:100%;transition:width 1s;"></div>' +
                '</div>' +
                '</div>';
            let m = document.getElementById('M');
            if(m) m.appendChild(card);
        }
    } catch(e) {
        console.warn('enhanceUI error:', e);
    }
};

