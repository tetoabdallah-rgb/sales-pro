const fs = require('fs');
let code = fs.readFileSync('new_features.js', 'utf8');

// We need to replace the entire window.rAn block.
let newDashboard = `
window.rAn = function() {
    let ds = typeof getFilteredSales === 'function' ? getFilteredSales() : S;
    
    // Monthly calculation (Current Month)
    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let daysMap = {};
    for(let i=1; i<=daysInMonth; i++) {
        daysMap[i] = 0;
    }

    let dsTop = {};
    let dsClass = {'إكسسوارات':0, 'هاردوير':0, 'أخرى':0};
    let dsRegion = {};

    ds.forEach(r => {
        let val = typeof getSalesVal === 'function' ? getSalesVal(r) : 0;
        
        // Month Data
        let rDateStr = typeof pd === 'function' ? pd(r['Order Date']) : r['Order Date']; 
        if(rDateStr) {
            let rDate = new Date(rDateStr);
            if(rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear) {
                let day = rDate.getDate();
                daysMap[day] += val;
            }
        }
        
        // Top Customers
        let c = r.Customer || 'Unknown';
        dsTop[c] = (dsTop[c] || 0) + val;
        
        // Classes (Acc vs HW)
        let cls = r['Item Class Name'] || '';
        if(typeof isAcc === 'function' && isAcc(cls)) dsClass['إكسسوارات'] += val;
        else if(typeof isHW === 'function' && isHW(cls)) dsClass['هاردوير'] += val;
        else dsClass['أخرى'] += val;
        
        // Regions
        let reg = r['Customer Class'] || 'Unknown';
        dsRegion[reg] = (dsRegion[reg] || 0) + val;
    });

    let topCats = Object.entries(dsTop).sort((a,b)=>b[1]-a[1]).slice(0,5);
    let classArr = Object.entries(dsClass).filter(x => x[1] > 0);
    let regArr = Object.entries(dsRegion).sort((a,b)=>b[1]-a[1]).slice(0,5);

    let m = document.getElementById('M');
    m.innerHTML = '<div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">📊</span> إحصائيات الشهر الحالي</h1></div>' +
        '<div style="display:flex; flex-direction:column; gap: 20px; margin-top:20px;">' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">📈 المبيعات اليومية (شهر ' + (currentMonth+1) + ')</h3>' +
        '<div style="height:350px; width:100%;"><canvas id="premChart1"></canvas></div></div>' +
        
        '<div class="card" style="padding:20px; width:100%;">' +
        '<h3 style="margin-bottom:15px; border-bottom:1px solid var(--bd); padding-bottom:10px;">🏆 أفضل 5 عملاء (Top 5)</h3>' +
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
        
        if(ctx1) {
            new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: Object.keys(daysMap), // 1 to 31
                    datasets: [{
                        label: 'المبيعات',
                        data: Object.values(daysMap),
                        backgroundColor: '#4285F4',
                        borderRadius: 4
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
                        backgroundColor: colors,
                        borderWidth: 0
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false }, legend: { position: 'right' } } }
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
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false }, legend: { position: 'bottom' } } }
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
                options: { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false }, legend: { position: 'right' } } }
            });
        }
    }, 100);
};
`;

let startIndex = code.indexOf('window.rAn = function() {');
let endIndex = code.indexOf('// 5. GPS Check-in for Visits');

if(startIndex !== -1 && endIndex !== -1) {
    let before = code.substring(0, startIndex);
    let after = code.substring(endIndex);
    fs.writeFileSync('new_features.js', before + newDashboard + "\n" + after, 'utf8');
    console.log("Dashboard updated!");
} else {
    console.log("Could not find boundaries for rAn.");
}
