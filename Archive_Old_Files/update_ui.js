const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

// 1. Update the background logic in new_features.js
// Find the sp-bg creation block.
let bgRegex = /let bg = document\.createElement\('div'\);\s*bg\.id = 'sp-bg';[\s\S]*?document\.body\.appendChild\(bg\);/m;
let newBgCode = `let bg = document.createElement('div');
    bg.id = 'sp-bg';
    bg.style.cssText = \`
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: url('logo_2b.png') no-repeat center center;
        background-size: cover;
        opacity: 0.15;
        z-index: -1;
        pointer-events: none;
        transition: opacity 2s ease-out;
    \`;
    document.body.appendChild(bg);
    
    // Fade out after initial load
    setTimeout(() => { bg.style.opacity = '0.02'; }, 1500);

    // Fade in then out on navigation
    document.addEventListener('click', (e) => {
        if(e.target.closest('.ni, .bi, .btn')) {
            let b = document.getElementById('sp-bg');
            if(b) {
                b.style.transition = 'none';
                b.style.opacity = '0.15';
                setTimeout(() => {
                    b.style.transition = 'opacity 2s ease-out';
                    b.style.opacity = '0.02';
                }, 500);
            }
        }
    });`;

if (code.match(bgRegex)) {
    code = code.replace(bgRegex, newBgCode);
}

// 2. Update the Dashboard (rAn) logic
// Replace the entire window.rAn function again
let startIndex = code.indexOf('window.rAn = function() {');
let endIndex = code.indexOf('// 5. GPS Check-in for Visits');

let newDashboard = `window.rAn = function() {
    let ds = typeof getFilteredSales === 'function' ? getFilteredSales() : (typeof S !== 'undefined' ? S : []);
    
    // Function to calculate and render for a specific month
    let renderMonth = (year, month) => {
        let daysInMonth = new Date(year, month + 1, 0).getDate();
        let daysMap = {};
        for(let i=1; i<=daysInMonth; i++) daysMap[i] = 0;
        
        let dsTop = {};
        let dsClass = {'إكسسوارات':0, 'هاردوير':0, 'أخرى':0};
        let dsRegion = {};

        ds.forEach(r => {
            let val = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
            let rDateStr = typeof pd === 'function' ? pd(r['Order Date']) : r['Order Date']; 
            if(rDateStr) {
                let rDate = new Date(rDateStr);
                if(rDate.getMonth() === month && rDate.getFullYear() === year) {
                    daysMap[rDate.getDate()] += val;
                }
            }
            
            let c = r.Customer || 'Unknown';
            dsTop[c] = (dsTop[c] || 0) + val;
            
            let cls = r['Item Class Name'] || '';
            if(typeof isAcc === 'function' && isAcc(cls)) dsClass['إكسسوارات'] += val;
            else if(typeof isHW === 'function' && isHW(cls)) dsClass['هاردوير'] += val;
            else dsClass['أخرى'] += val;
            
            let reg = r['Customer Class'] || 'Unknown';
            dsRegion[reg] = (dsRegion[reg] || 0) + val;
        });
        return { daysMap, dsTop, dsClass, dsRegion };
    };

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let { daysMap, dsTop, dsClass, dsRegion } = renderMonth(currentYear, currentMonth);

    let topCats = Object.entries(dsTop).sort((a,b)=>b[1]-a[1]).slice(0,5);
    let classArr = Object.entries(dsClass).filter(x => x[1] > 0);
    let regArr = Object.entries(dsRegion).sort((a,b)=>b[1]-a[1]).slice(0,5);

    let m = document.getElementById('M');
    
    let monthVal = currentYear + '-' + String(currentMonth + 1).padStart(2, '0');

    m.innerHTML = '<div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">📊</span> إحصائيات المبيعات</h1></div>' +
        '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-top:20px;">' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">' +
        '<h3>📈 المبيعات اليومية</h3>' +
        '<input type="month" id="anMonthSel" value="' + monthVal + '" style="padding:6px; border-radius:6px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); font-family:Cairo;">' +
        '</div>' +
        '<div style="height:350px; width:100%;"><canvas id="premChart1"></canvas></div></div>' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">🏆 أفضل 5 عملاء (الإجمالي)</h3>' +
        '<div style="height:350px; width:100%;"><canvas id="premChart2"></canvas></div></div>' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">🎧 إكسسوارات مقابل هاردوير 📱</h3>' +
        '<div style="height:350px; width:100%;"><canvas id="premChart3"></canvas></div></div>' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">📍 مبيعات المناطق</h3>' +
        '<div style="height:350px; width:100%;"><canvas id="premChart4"></canvas></div></div>' +
        
        '</div>';

    setTimeout(() => {
        let ctx1 = document.getElementById('premChart1');
        let ctx2 = document.getElementById('premChart2');
        let ctx3 = document.getElementById('premChart3');
        let ctx4 = document.getElementById('premChart4');
        
        let colors = ['#0f9d58', '#4285F4', '#f4b400', '#db4437', '#9c27b0', '#00bcd4', '#ff9800'];
        
        let chart1;
        
        let labelConf = {
            color: '#fff',
            font: { weight: 'bold', size: 10, family: 'Cairo' },
            display: function(ctx) {
                let v = ctx.dataset.data[ctx.dataIndex];
                return v > 0 ? 'auto' : false;
            },
            formatter: function(v) {
                if (!v || v === 0) return '';
                if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                return v;
            }
        };

        if(ctx1) {
            chart1 = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: Object.keys(daysMap),
                    datasets: [{
                        label: 'المبيعات',
                        data: Object.values(daysMap),
                        backgroundColor: '#4285F4',
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: labelConf } }
            });
        }
        
        // Month Selector Event Listener
        let mSel = document.getElementById('anMonthSel');
        if(mSel && chart1) {
            mSel.addEventListener('change', (e) => {
                if(!e.target.value) return;
                let parts = e.target.value.split('-');
                let y = parseInt(parts[0]);
                let m = parseInt(parts[1]) - 1; // 0-indexed
                let { daysMap: newDaysMap } = renderMonth(y, m);
                chart1.data.labels = Object.keys(newDaysMap);
                chart1.data.datasets[0].data = Object.values(newDaysMap);
                chart1.update();
            });
        }

        if(ctx2) {
            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: topCats.map(x => x[0]),
                    datasets: [{
                        data: topCats.map(x => x[1]),
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: labelConf, legend: { position: 'right' } } }
            });
        }
        if(ctx3) {
            new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: classArr.map(x => x[0]),
                    datasets: [{
                        data: classArr.map(x => x[1]),
                        backgroundColor: ['#9c27b0', '#0f9d58', '#607d8b'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: labelConf, legend: { position: 'bottom' } } }
            });
        }
        if(ctx4) {
            new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: regArr.map(x => x[0]),
                    datasets: [{
                        data: regArr.map(x => x[1]),
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: labelConf, legend: { position: 'right' } } }
            });
        }
    }, 100);
};
`;

if(startIndex !== -1 && endIndex !== -1) {
    let before = code.substring(0, startIndex);
    let after = code.substring(endIndex);
    code = before + newDashboard + "\n\n" + after;
}

fs.writeFileSync('new_features.js', code, 'utf8');
console.log("UI updated!");
