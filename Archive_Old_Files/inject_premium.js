const fs = require('fs');

const premiumCode = `

// ==========================================
// PREMIUM FEATURES INJECTION
// ==========================================

// 1. WhatsApp Integration (Sales)
if (typeof window.fSl === 'function' && !window.whatsappInjected) {
    window.whatsappInjected = true;
    const originalFSl = window.fSl;
    window.fSl = function(data) {
        originalFSl(data);
        setTimeout(() => {
            let sth = document.querySelector('#stb')?.previousElementSibling; // thead
            if (sth) {
                let trh = sth.querySelector('tr');
                if (trh && !trh.querySelector('.wa-th')) {
                    trh.insertAdjacentHTML('beforeend', '<th class="wa-th">💬 واتساب</th>');
                }
            }
            let rows = document.querySelectorAll('#stb tr');
            let st = pState.sales;
            let start = (st.page - 1) * st.limit;
            rows.forEach((tr, idx) => {
                let r = data[start + idx];
                if(r && !tr.querySelector('.wa-btn')) {
                    let s = typeof getSalesVal === 'function' ? getSalesVal(r) : r['Sales After Discount'];
                    let msg = "مرحباً بك عميلنا المميز " + (r.Customer || '') + "، تم تسجيل فاتورة مبيعات لحسابكم بقيمة " + s + " بتاريخ " + (r['Order Date']||'') + ". شكراً لتعاملكم معنا!";
                    tr.insertAdjacentHTML('beforeend', '<td><button class="wa-btn" onclick="window.open(\\'https://wa.me/?text=' + encodeURIComponent(msg) + '\\')" style="background:transparent;border:none;font-size:1.2rem;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\\'scale(1.2)\\'" onmouseout="this.style.transform=\\'scale(1)\\'">💬</button></td>');
                }
            });
        }, 50);
    };
}

// 2. WhatsApp Integration (Collections)
const originalRCol = window.rCollections;
if (originalRCol && !window.waColInjected) {
    window.waColInjected = true;
    window.rCollections = function() {
        originalRCol();
        setTimeout(() => {
            let trh = document.querySelector('.tb table thead tr');
            if(trh && !trh.querySelector('.wa-th')) {
                trh.insertAdjacentHTML('beforeend', '<th class="wa-th">💬 واتساب</th>');
            }
            let rows = document.querySelectorAll('.tb table tbody tr');
            rows.forEach((tr, idx) => {
                let r = C[idx];
                if(r && !tr.querySelector('.wa-btn')) {
                    let keys = Object.keys(r);
                    let getVal = (possibleNames) => {
                        let k = keys.find(k => possibleNames.some(pn => k.toLowerCase().replace(/\\s+/g, '') === pn.toLowerCase().replace(/\\s+/g, '')));
                        return k ? r[k] : undefined;
                    };
                    let rawVal = getVal(['Amount', 'Collection']) || 0;
                    let cName = getVal(['Customer Name', 'Customer']) || '';
                    let d = getVal(['Date']) || '';
                    let msg = "مرحباً " + cName + "، تم استلام دفعة نقدية (تحصيل) بقيمة " + rawVal + " بتاريخ " + d + ". نشكركم لتعاونكم!";
                    tr.insertAdjacentHTML('beforeend', '<td><button class="wa-btn" onclick="window.open(\\'https://wa.me/?text=' + encodeURIComponent(msg) + '\\')" style="background:transparent;border:none;font-size:1.2rem;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\\'scale(1.2)\\'" onmouseout="this.style.transform=\\'scale(1)\\'">💬</button></td>');
                }
            });
        }, 100);
    };
}

// 3. Target Gamification (Confetti & Progress)
const originalRTgt = window.rTgt;
if (originalRTgt && !window.tgtGamInjected) {
    window.tgtGamInjected = true;
    window.rTgt = function() {
        originalRTgt();
        setTimeout(() => {
            let sData = typeof getFilteredSales === 'function' ? getFilteredSales() : S;
            let sMap = {}; sData.forEach(r => sMap[r.Customer||''] = (sMap[r.Customer||'']||0) + (typeof getSalesVal === 'function' ? getSalesVal(r) : 0));
            let tTot = 0, aTot = 0;
            T.forEach(r => {
                let val = Number(r.Target||r.target||0);
                let cName = r['Customer Name']||r['Customer']||'';
                tTot += val;
                aTot += (sMap[cName]||0);
            });
            let perc = tTot > 0 ? (aTot / tTot) * 100 : 0;
            
            let m = document.getElementById('M');
            if(!m) return;
            let pgHTML = '<div style="background:var(--bg3); border-radius:12px; padding:20px; margin:20px 0; border:1px solid var(--bd); position:relative; overflow:hidden;">' +
                         '<h3 style="margin-bottom:12px; text-align:center;">🏆 نسبة تحقيق التارجت الإجمالي 🏆</h3>' +
                         '<div style="background:var(--bg); border-radius:20px; height:24px; width:100%; overflow:hidden; box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">' +
                         '<div style="background:linear-gradient(90deg, #f5af19, #f12711); height:100%; width:' + Math.min(perc, 100) + '%; transition:width 1s; display:flex; align-items:center; justify-content:flex-end; padding-right:10px; color:white; font-weight:bold; font-size:0.8rem;">' +
                         perc.toFixed(1) + '%' +
                         '</div></div>';
                         
            if(perc >= 100) {
                pgHTML += '<div style="text-align:center; margin-top:10px; color:#2ecc71; font-weight:bold;">🎉 مبروك! لقد حققت التارجت المطلوب! 🎉</div>';
            } else {
                pgHTML += '<div style="text-align:center; margin-top:10px; color:var(--tx2); font-size:0.85rem;">متبقي ' + Math.max(0, tTot - aTot).toLocaleString() + ' للوصول للهدف 🚀</div>';
            }
            pgHTML += '</div>';
            
            let ph = m.querySelector('.ph');
            if (ph) {
                ph.insertAdjacentHTML('afterend', pgHTML);
            }
            
            if (perc >= 100 && typeof confetti === 'function') {
                confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
            }
        }, 100);
    };
}

// 4. Premium Analytics Dashboard
window.rAn = function() {
    let ds = typeof getFilteredSales === 'function' ? getFilteredSales() : S;
    let dsLast7 = [];
    let dsTop = {};
    
    // last 7 days calculation
    let today = new Date();
    today.setHours(0,0,0,0);
    let past7 = new Date(today);
    past7.setDate(today.getDate() - 7);
    
    let daysMap = {};
    for(let i=0; i<7; i++) {
        let d = new Date(today);
        d.setDate(today.getDate() - i);
        daysMap[d.toISOString().split('T')[0]] = 0;
    }

    ds.forEach(r => {
        let val = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
        let rDateStr = typeof pd === 'function' ? pd(r['Order Date']) : r['Order Date']; 
        if(rDateStr) {
            let rDate = new Date(rDateStr);
            if(rDate >= past7 && rDate <= today) {
                let iso = rDate.toISOString().split('T')[0];
                if(daysMap[iso] !== undefined) {
                    daysMap[iso] += val;
                }
            }
        }
        let c = r.Customer || 'Unknown';
        dsTop[c] = (dsTop[c] || 0) + val;
    });

    let topCats = Object.entries(dsTop).sort((a,b)=>b[1]-a[1]).slice(0,5);

    let m = document.getElementById('M');
    m.innerHTML = '<div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">📊</span> إحصائيات Premium</h1></div>' +
        '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top:20px;">' +
        '<div class="card" style="padding:20px; position:relative;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">📈 مبيعات آخر 7 أيام</h3>' +
        '<div style="height:250px; width:100%;"><canvas id="premChart1"></canvas></div></div>' +
        '<div class="card" style="padding:20px; position:relative;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">🏆 أفضل 5 عملاء (Top 5)</h3>' +
        '<div style="height:250px; width:100%;"><canvas id="premChart2"></canvas></div></div></div>';

    setTimeout(() => {
        let ctx1 = document.getElementById('premChart1');
        let ctx2 = document.getElementById('premChart2');
        if(ctx1) {
            let sortedDays = Object.keys(daysMap).sort();
            new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: sortedDays.map(d => d.slice(5)), // MM-DD
                    datasets: [{
                        label: 'المبيعات',
                        data: sortedDays.map(d => daysMap[d]),
                        backgroundColor: '#4285F4',
                        borderRadius: 6
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false } } }
            });
        }
        if(ctx2) {
            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: topCats.map(x => x[0]),
                    datasets: [{
                        data: topCats.map(x => x[1]),
                        backgroundColor: ['#0f9d58', '#4285F4', '#f4b400', '#db4437', '#9c27b0'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false }, legend: { position: 'right' } } }
            });
        }
    }, 100);
};

// 5. GPS Check-in for Visits
const originalRVisits = window.rVisits;
if (originalRVisits && !window.gpsInjected) {
    window.gpsInjected = true;
    window.rVisits = function() {
        originalRVisits();
        setTimeout(() => {
            let addBtn = document.querySelector('#M .card .btn-p');
            if (addBtn && addBtn.innerText.includes('تسجيل')) {
                addBtn.removeAttribute('onclick');
                addBtn.onclick = () => {
                    let c = document.getElementById('vCust').value;
                    let n = document.getElementById('vNotes').value;
                    if(!c) return typeof toast === 'function' ? toast('اختر العميل أولاً', 'error') : alert('اختر العميل');
                    
                    addBtn.innerText = 'جاري تحديد الموقع...';
                    addBtn.style.opacity = '0.5';
                    addBtn.disabled = true;

                    let saveWithLoc = (lat, lng) => {
                        let visits = JSON.parse(localStorage.getItem('sp_visits')||'[]');
                        visits.unshift({ c: c, n: n, d: new Date().toISOString(), lat: lat, lng: lng });
                        localStorage.setItem('sp_visits', JSON.stringify(visits));
                        if(typeof toast === 'function') toast('تم تسجيل الزيارة بنجاح', 'success');
                        window.rVisits();
                    };

                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            pos => saveWithLoc(pos.coords.latitude, pos.coords.longitude),
                            err => {
                                console.log(err);
                                if(typeof toast === 'function') toast('فشل تحديد الموقع، تم الحفظ بدون موقع', 'error');
                                saveWithLoc(null, null);
                            },
                            { timeout: 5000 }
                        );
                    } else {
                        saveWithLoc(null, null);
                    }
                };
            }
            let tbody = document.querySelector('.tb table tbody');
            if(tbody) {
                let visits = JSON.parse(localStorage.getItem('sp_visits')||'[]');
                let h = '';
                visits.forEach((v, i) => {
                    let d = new Date(v.d).toLocaleString('ar-EG');
                    let mapLink = (v.lat && v.lng) ? '<a href="https://maps.google.com/?q=' + v.lat + ',' + v.lng + '" target="_blank" class="badge bg-g" style="text-decoration:none; display:inline-block; padding:4px 8px;">🗺️ عرض الموقع</a>' : '<span style="color:var(--tx2);font-size:0.8rem;">لا يوجد موقع</span>';
                    h += '<tr><td>' + d + '</td><td>' + v.c + '</td><td>' + (v.n||'') + '</td><td>' + mapLink + '</td><td><button class="btn bg-r" style="padding:4px 8px;font-size:0.8rem;" onclick="deleteVisit(' + i + ')">حذف</button></td></tr>';
                });
                tbody.innerHTML = h;
                
                let trh = document.querySelector('.tb table thead tr');
                if (trh && !trh.innerHTML.includes('الموقع')) {
                    let lastTh = trh.lastElementChild;
                    trh.removeChild(lastTh);
                    trh.insertAdjacentHTML('beforeend', '<th>الموقع 🗺️</th><th>إجراء</th>');
                }
            }
        }, 100);
    };
    
    window.deleteVisit = function(i) {
        if(confirm('هل أنت متأكد من الحذف؟')) {
            let visits = JSON.parse(localStorage.getItem('sp_visits')||'[]');
            visits.splice(i, 1);
            localStorage.setItem('sp_visits', JSON.stringify(visits));
            window.rVisits();
        }
    };
}

`;

let code = fs.readFileSync('new_features.js', 'utf8');
if (!code.includes('PREMIUM FEATURES INJECTION')) {
    code += '\n' + premiumCode;
    fs.writeFileSync('new_features.js', code, 'utf8');
    console.log('Premium features injected into new_features.js');
} else {
    let idx = code.indexOf('// PREMIUM FEATURES INJECTION');
    idx = code.lastIndexOf('// ==========================================', idx);
    if(idx !== -1) {
        code = code.substring(0, idx) + '\n' + premiumCode;
        fs.writeFileSync('new_features.js', code, 'utf8');
        console.log('Premium features updated in new_features.js');
    }
}
