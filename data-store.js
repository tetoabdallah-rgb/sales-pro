// js/data-store.js

// Global State
window.syncUI = window.syncUI || function(status) {
    console.log('[Cloud Sync]: ' + status);
    let el = document.getElementById('SYNC_STATUS') || document.getElementById('cloud_status');
    if (el) {
        if (status === 'syncing') el.innerHTML = '🔄 ' + (typeof L !== 'undefined' && L === 'ar' ? 'جاري المزامنة...' : 'Syncing...');
        else if (status === 'done') el.innerHTML = '☁️ ' + (typeof L !== 'undefined' && L === 'ar' ? 'متزامن مع السحابة' : 'Cloud Synced');
        else if (status === 'error') el.innerHTML = '❌ ' + (typeof L !== 'undefined' && L === 'ar' ? 'خطأ في المزامنة' : 'Sync Error');
    }
};

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
window.L = L;
var P = 'dash'; // Current Page
window.P = P;
var _cache = { salesData: S, targetData: T, accCats: accCats, hwCats: hwCats, payData: C, duesData: D };
var _chkC = {};
var _mtC = {};
var globalDateRange = { start: null, end: null }; // Global Date Filter
var globalRepFilter = ''; // Global Sales Rep Filter
var globalCatFilter = ''; // Global Category Filter
window.globalDateRange = globalDateRange;
window.globalRepFilter = globalRepFilter;
window.globalCatFilter = globalCatFilter;

const DEF_ACC = ['Mobile Accessories','Mobile Power','Accessories Commission','Laptop Accessories','TWS Earbuds','Headphone','Keyboard','Wearables','Imported Bags','Factory Bags','Mouse','Gaming Accessories','A/V Accessories'];
const DEF_HW = ['Mobile Devices','Gaming Devices','TVs','Laptops'];
const CL = ['#5046e5','#0fa87e','#2b8dea','#e5930f','#e5484d','#8b5cf6','#06b6d4','#f59e0b'];

function isAcc(c) { return accCats.length ? accCats.includes(c) : DEF_ACC.includes(c); }
function isHW(c) { return hwCats.length ? hwCats.includes(c) : DEF_HW.includes(c); }

const I = {
    collections:{ar:'التحصيلات',en:'Collections'},dash:{ar:'لوحة التحكم',en:'Dashboard'},
    sales:{ar:'المبيعات',en:'Sales'},targets:{ar:'تارجت العميل',en:'Targets'},
    personal:{ar:'التارجت الشخصي',en:'Personal'},customers:{ar:'العملاء',en:'Customers'},
    todo:{ar:'مفكرة المهام',en:'To-Do Tasks'},brands:{ar:'البراندات',en:'Brands'},analytics:{ar:'تحليلات',en:'Analytics'},
    potential:{ar:'فرص التحقيق',en:'Opportunities'},profit:{ar:'هامش الربح',en:'Profit'},
    accessories:{ar:'الأكسسوارات',en:'Accessories'},hardware:{ar:'الهاردوير',en:'Hardware'},
    stock:{ar:'المخزون',en:'Stock'},
    keyacc:{ar:'المميزين',en:'Key Accounts'},dormant:{ar:'الخاملين',en:'Dormant'},
    prospects:{ar:'محتملين',en:'Prospects'},aging:{ar:'أعمار الديون',en:'Aging Debt'},alerts:{ar:'التنبيهات',en:'Alerts'},
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



function ld(k) {
    if (typeof _cache !== 'undefined' && _cache[k] !== undefined) return _cache[k];
    try {
        let v = localStorage.getItem(k);
        if (v !== null) {
            try {
                v = JSON.parse(v);
            } catch(e) {}
            if (typeof _cache !== 'undefined') _cache[k] = v;
            return v;
        }
    } catch(e) {}
    return null;
}

let _autoSaveTimer = null;
function sv(k, v) {
    if (typeof _cache !== 'undefined') _cache[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){}
    if (typeof window !== 'undefined' && typeof window.cloudAutoSave === 'function') {
        clearTimeout(_autoSaveTimer);
        _autoSaveTimer = setTimeout(() => {
            window.cloudAutoSave();
        }, 3000);
    }
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

// Robust row value getter - matches column by name (case insensitive, ignores spaces)
function getRowVal(row, possibleNames) {
    if (!row || typeof row !== 'object') return 0;
    let keys = Object.keys(row);
    let k = keys.find(k => possibleNames.some(p => k.toLowerCase().replace(/\s+/g, '') === p.toLowerCase().replace(/\s+/g, '')));
    if (k != null) {
        let v = row[k];
        if (typeof v === 'string') return Number(v.replace(/,/g, '').trim()) || 0;
        return Number(v) || 0;
    }
    return 0;
}

// Robust row string getter
function getRowStr(row, possibleNames) {
    if (!row || typeof row !== 'object') return '';
    let keys = Object.keys(row);
    let k = keys.find(k => possibleNames.some(p => k.toLowerCase().replace(/\s+/g, '') === p.toLowerCase().replace(/\s+/g, '')));
    if (k != null && row[k] != null) {
        return row[k].toString().trim();
    }
    return '';
}

// Get customer name from any row format
function getCustName(row) {
    return getRowStr(row, ['Customer Name', 'Customer', 'Cust', 'العميل', 'اسم العميل', 'Customer_Name']);
}

// Get date string (YYYY-MM-DD) from any row format
function getDateVal(row) {
    let raw = getRowStr(row, ['Invoice Date', 'Order Date', 'Date', 'تاريخ الفاتورة', 'تاريخ الطلب', 'التاريخ', 'Inv Date']);
    if (!raw && row) {
        raw = row['Invoice Date'] || row['Order Date'] || row['Date'] || row['تاريخ الفاتورة'] || row['التاريخ'];
    }
    return pd(raw);
}

// Get sales value - works with all English and Arabic variants
function getSalesVal(row) {
    return getRowVal(row, [
        'Sales Without Tax', 'Sales After Discount', 'Sales', 'Amount', 'Total Sales', 
        'Net Sales', 'المبيعات', 'صافي المبيعات', 'المبلغ', 'القيمة', 'إجمالي المبيعات'
    ]);
}

// Get profit value - with smart fallback: Direct Profit -> Margin % -> Sales - Cost
function getProfitVal(row) {
    if (!row) return 0;
    // 1. Direct profit columns
    let p = getRowVal(row, [
        'Profit Margin', 'Profit', 'Gross Profit', 'Net Profit', 'Total Profit', 
        'Profit Value', 'Profit Amount', 'الربح', 'صافي الربح', 'هامش الربح', 'مبلغ الربح', 'قيمة الربح'
    ]);
    if (p !== 0) return p;

    let sales = getSalesVal(row);

    // 2. Margin % fallback
    let marginPct = getRowVal(row, ['Margin %', 'Profit %', 'نسبة الربح', 'نسبة الهامش', 'هامش الربح %']);
    if (marginPct !== 0 && sales > 0) {
        if (marginPct > 1) marginPct = marginPct / 100;
        return sales * marginPct;
    }

    // 3. Cost fallback: Profit = Sales - Cost
    let cost = getRowVal(row, ['Cost', 'Total Cost', 'Cost Price', 'التكلفة', 'إجمالي التكلفة', 'سعر التكلفة']);
    if (cost > 0 && sales > 0) {
        return sales - cost;
    }

    return 0;
}

// Get payment amount from Collections sheet
function getPayVal(row) {
    return getRowVal(row, ['Amount', 'Collection', 'التحصيل', 'المبلغ المحصل', 'المبلغ']);
}

// Get Payment Ref type from Collections sheet: returns 'acc', 'hw', or ''
function getPayRef(row) {
    let ref = (row['Payment Ref.'] || row['Payment Ref'] || row['PaymentRef'] || row['القسم'] || '').toString().trim().toLowerCase();
    if (ref.startsWith('acc') || ref.includes('إكسسوار') || ref.includes('اكسسوار')) return 'acc';
    if (ref.startsWith('hw') || ref.includes('هاردوير') || ref.includes('اجهزة'))  return 'hw';
    return '';
}

// Data filtering by date, rep, category
function getFilteredSales() {
    if (!globalDateRange.start && !globalDateRange.end && !globalRepFilter && !globalCatFilter) return S;
    return S.filter(r => {
        let pass = true;
        
        // Date filter
        if (globalDateRange.start || globalDateRange.end) {
            let d = getDateVal(r);
            if (!d) pass = false;
            else {
                if (globalDateRange.start && d < globalDateRange.start) pass = false;
                if (globalDateRange.end && d > globalDateRange.end) pass = false;
            }
        }
        
        // Rep filter
        if (pass && globalRepFilter) {
            let rep = getRowStr(r, ['Sales Person', 'Rep', 'Salesman', 'المندوب', 'مندوب المبيعات']);
            if (rep !== globalRepFilter) pass = false;
        }
        
        // Category filter
        if (pass && globalCatFilter) {
            let cat = getRowStr(r, ['Item Class Name', 'Category', 'category', 'الفئة', 'القسم']);
            if (cat !== globalCatFilter) pass = false;
        }
        
        return pass;
    });
}


function dc(k) { if(CH[k]) { CH[k].destroy(); delete CH[k]; } }
