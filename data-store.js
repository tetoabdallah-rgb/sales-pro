// js/data-store.js

// Global State
let S = []; // Sales
let T = []; // Targets
let accCats = []; // Accessories Categories
let hwCats = []; // Hardware Categories
let C = []; // Collections/PayData
let D = []; // Dues
let CH = {}; // Chart Instances
let L = localStorage.getItem('sp_lang') || 'ar'; // Language
let P = 'dash'; // Current Page
let _cache = {};
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

function debounce(fn, ms) {
    let timer;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, arguments), ms || 250);
    };
}

function syncUI(st) {
    let el = $('syncST');
    if(!el) {
        el = document.createElement('div');
        el.id = 'syncST';
        el.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9999;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:bold;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:none;transition:all 0.3s;';
        document.body.appendChild(el);
    }
    if (st === 'syncing') {
        el.style.background = 'var(--am)';
        el.innerHTML = '☁️ ' + (L === 'ar' ? 'جاري المزامنة...' : 'Syncing...');
        el.style.display = 'block';
    } else if (st === 'done') {
        el.style.background = 'var(--gn)';
        el.innerHTML = '✅ ' + (L === 'ar' ? 'تم التحديث' : 'Synced');
        setTimeout(() => el.style.display = 'none', 2500);
    } else if (st === 'error') {
        el.style.background = 'var(--rd)';
        el.innerHTML = '❌ ' + (L === 'ar' ? 'خطأ بالاتصال' : 'Error');
    }
}

function sv(k, v) {
    _cache[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){}
    if (!currentUser) return;
    
    syncUI('syncing');
    if (Array.isArray(v) && ['salesData','targetData','payData','duesData'].includes(k)) {
        try {
            let g = {};
            for(let i=0; i<v.length; i++){
                let u = v[i]._uid || currentUser.uid;
                if(!g[u]) g[u] = [];
                let c = JSON.parse(JSON.stringify(v[i]));
                delete c._uid;
                g[u].push(c);
            }
            let proms = [];
            for(let u in g) {
                let arr = g[u];
                let cSz = 100;
                let chks = [];
                for(let i=0; i<arr.length; i+=cSz) chks.push(arr.slice(i, i+cSz));
                
                let batch = db.batch();
                let mRef = db.collection('users').doc(u);
                batch.set(mRef, { [k+'_meta']: chks.length }, {merge: true});
                
                let coll = mRef.collection('chunks');
                for(let i=0; i<chks.length; i++){
                    batch.set(coll.doc(k+'_'+i), { data: chks[i] });
                }
                proms.push(batch.commit());
            }
            Promise.all(proms).then(() => syncUI('done')).catch(e => {
                syncUI('error'); console.error(e);
            });
        } catch(ex){ syncUI('error'); console.error(ex); }
    } else {
        db.collection('users').doc(currentUser.uid).set({ [k]: JSON.parse(JSON.stringify(v)) }, {merge: true})
        .then(() => syncUI('done')).catch(e => { syncUI('error'); console.error(e); });
    }
}

function ld(k) {
    if (_cache[k] !== undefined) return _cache[k];
    try { let d = localStorage.getItem(k); return d ? JSON.parse(d) : null; } catch(e){ return null; }
}

function toast(m) {
    let el = $('TT');
    if(!el) return;
    el.textContent = m;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
}

function pd(d) {
    if (d instanceof Date) return d.toISOString().split('T')[0];
    if (typeof d === 'string') return d.split('T')[0];
    if (typeof d === 'number') return new Date((d - 25569) * 86400000).toISOString().split('T')[0];
    return '';
}

function cS(n) { return S.filter(r => r.Customer === n).reduce((sum, r) => sum + (Number(r['Sales After Discount'])||0), 0); }
function cP(n) { return S.filter(r => r.Customer === n).reduce((sum, r) => sum + (Number(r['Profit Margin'])||0), 0); }
function cO(n) { let o={}; S.forEach(r => { if(r.Customer === n) o[r['Order Nbr']]=1; }); return Object.keys(o).length; }
function cSF(n, fn) { return S.filter(r => r.Customer === n && fn(r['Item Class Name'])).reduce((sum, r) => sum + (Number(r['Sales After Discount'])||0), 0); }
function cPF(n, fn) { return S.filter(r => r.Customer === n && fn(r['Item Class Name'])).reduce((sum, r) => sum + (Number(r['Profit Margin'])||0), 0); }

function dc(k) { if(CH[k]){ CH[k].destroy(); delete CH[k]; } }

function ring(ti, pct, tot) {
    let c = 251.2, off = c - (Math.min(pct, 100) / 100 * c);
    let col = pct >= 100 ? 'var(--gn)' : pct >= 70 ? 'var(--am)' : 'var(--rd)';
    return `<div class="rc2"><h4>${ti}</h4><div class="rw2"><svg viewBox="0 0 88 88"><circle class="trk" cx="44" cy="44" r="40"/><circle class="fl" cx="44" cy="44" r="40" stroke="${col}" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg><div class="rce"><div class="p">${pct.toFixed(0)}%</div><div class="s">${fmt(tot)}</div></div></div></div>`;
}

function chkAsm() {
    ['salesData','targetData','payData','duesData'].forEach(k => {
        let ct = _mtC[k+'_meta'];
        if(ct !== undefined) {
            let asm = [];
            let cmp = true;
            for(let i=0; i<ct; i++) {
                if(_chkC[k+'_'+i]) asm = asm.concat(_chkC[k+'_'+i]);
                else { cmp = false; break; }
            }
            if(cmp && asm.length > 0) {
                _cache[k] = asm;
                if(k === 'salesData') S = asm;
                else if(k === 'targetData') T = asm;
                else if(k === 'payData') C = asm;
                else if(k === 'duesData') D = asm;
                try { localStorage.setItem(k, JSON.stringify(asm)); } catch(e){}
            }
        }
    });
    if (typeof render === 'function') render();
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
