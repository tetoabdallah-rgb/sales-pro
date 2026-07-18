const ld = k => { let v = localStorage.getItem(k); if(!v) return null; try { return JSON.parse(v); } catch(e) { return v; } };
// Global State
const sv = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const ld = k => { let v = localStorage.getItem(k); if(!v) return null; try { return JSON.parse(v); } catch(e) { return v; } };
function loadLS(k) { try { let d = localStorage.getItem(k); return d ? JSON.parse(d) : []; } catch(e){ return []; } }
let S = loadLS('salesData'); // Sales
let T = loadLS('targetData'); // Targets
let accCats = loadLS('accCats'); // Accessories Categories
let hwCats = loadLS('hwCats'); // Hardware Categories
let C = loadLS('payData'); // Collections/PayData
let D = loadLS('duesData'); // Dues
let CH = {}; // Chart Instances
let L = localStorage.getItem('sp_lang') || 'ar';
L = L.replace(/"/g, ''); // Strip quotes if JSON stringified
if (L !== 'ar' && L !== 'en') L = 'ar';
let P = 'dash'; // Current Page
let _cache = { salesData: S, targetData: T, accCats: accCats, hwCats: hwCats, payData: C, duesData: D };
let _chkC = {};
let _mtC = {};
let globalDateRange = { start: null, end: null }; // Global Date Filter

const DEF_ACC = ['Mobile Accessories','Mobile Power','Accessories Commission','Laptop Accessories','TWS Earbuds','Headphone','Keyboard','Wearables','Imported Bags','Factory Bags','Mouse','Gaming Accessories'];
const DEF_HW = ['Mobile Devices','Gaming Devices','TVs','Laptops'];
const CL = ['#5046e5','#0fa87e','#2b8dea','#e5930f','#e5484d','#8b5cf6','#06b6d4','#f59e0b'];

function isAcc(c) { return accCats.length ? accCats.includes(c) : DEF_ACC.includes(c); }
function isHW(c) { return hwCats.length ? hwCats.includes(c) : DEF_HW.includes(c); }

const I = {
    collections:{ar:'التحصيلات',en:'Collections'},dash:{ar:'لوحة التحكم',en:'Dashboard'},
    sales:{ar:'المبيعات',en:'Sales'},targets:{ar:'تارجت العميل',en:'Targets'},
    personal:{ar:'التارجت الشخصي',en:'Personal'},customers:{ar:'العملاء',en:'Customers'},
    brands:{ar:'البراندات',en:'Brands'},analytics:{ar:'تحليلات',en:'Analytics'},
    potential:{ar:'فرص التحقيق',en:'Opportunities'},profit:{ar:'هامش الربح',en:'Profit'},
    accessories:{ar:'الأكسسوارات',en:'Accessories'},hardware:{ar:'الهاردوير',en:'Hardware'},
    keyacc:{ar:'المميزين',en:'Key Accounts'},dormant:{ar:'الخاملين',en:'Dormant'},
    prospects:{ar:'محتملين',en:'Prospects'},alerts:{ar:'التنبيهات',en:'Alerts'},
    ai:{ar:'توصيات AI',en:'AI'},account:{ar:'الحساب',en:'Account'},
    backup:{ar:'نسخ احتياطي',en:'Backup'},setup:{ar:'رفع الملفات',en:'Files'},
    logout:{ar:'خروج',en:'Logout'},reset:{ar:'مسح البيانات',en:'Reset App'},
    settings:{ar:'الإعدادات',en:'Settings'}
};

function t(k) { return I[k] ? I[k][L] : k; }
function $(id) { return document.getElementById(id); }
function fmt(n) { return (n == null || isNaN(n)) ? '0' : Number(n).toLocaleString('en-US', {maximumFractionDigits: 0}); }
function pc(n) { return (n == null || isNaN(n)) ? '0%' : Number(n).toFixed(1) + '%'; }
function aFmt(n, isPc) { return `<span class="anm" data-v="${n}"${isPc ? ' data-p="1"' : ''}>${isPc ? '0%' : '0'}</span>`; }
function pd(v) {
    if (!v) return '';
    if (typeof v === 'number') {
        let d = new Date(Math.round((v - 25569) * 86400 * 1000));
        let yy = d.getFullYear(), mm = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
        return `${yy}-${mm}-${dd}`;
    }
    let d = new Date(v);
    if (!isNaN(d.getTime())) {
        let yy = d.getFullYear(), mm = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
        return `${yy}-${mm}-${dd}`;
    }
    // Handle DD/MM/YYYY
    if (typeof v === 'string') {
        let p = v.split(/[\/\-]/);
        if (p.length === 3) {
            let y = p[2].length === 2 ? '20' + p[2] : p[2];
            return `${y}-${('0'+p[1]).slice(-2)}-${('0'+p[0]).slice(-2)}`;
        }
    }
    return '';
}

function debounce(fn, ms) {
    let timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, arguments), ms || 250);
    };
}



function sv(k, v) {
    _cache[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){}
}

function ring(ti, pct, tot) {
    let c = 251.2, off = c - (Math.min(pct, 100) / 100 * c);
    let col = pct >= 100 ? 'var(--gn)' : pct >= 70 ? 'var(--am)' : 'var(--rd)';
    return `<div class="rc2"><h4>${ti}</h4><div class="rw2"><svg viewBox="0 0 88 88"><circle class="trk" cx="44" cy="44" r="40"/><circle class="fl" cx="44" cy="44" r="40" stroke="${col}" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg><div class="rce"><div class="p">${pct.toFixed(0)}%</div><div class="s">${fmt(tot)}</div></div></div></div>`;
}



function exportToExcel(data, filename) {
    try {
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Data');
        XLSX.writeFile(wb, filename + '.xlsx');
        toast('✅ ' + (L === 'ar' ? 'تم التصدير' : 'Exported'));
    } catch(err) {
        console.error(err);
        toast('❌ Error');
    }
}

// Data filtering by date
function getFilteredSales() {
    if (!globalDateRange.start && !globalDateRange.end) return S;
    return S.filter(r => {
        let d = pd(r['Order Date']);
        if (!d) return false;
        let pass = true;
        if (globalDateRange.start && d < globalDateRange.start) pass = false;
        if (globalDateRange.end && d > globalDateRange.end) pass = false;
        return pass;
    });
}


function dc(k) { if(CH[k]) { CH[k].destroy(); delete CH[k]; } }
