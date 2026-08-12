
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
    Chart.defaults.set('plugins.datalabels', {
        color: '#fff',
        font: {
            weight: 'bold',
            size: 10
        },
        formatter: function(value, context) {
            if (value === 0) return '';
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
        },
        display: function(context) {
            let val = context.dataset.data[context.dataIndex];
            if (val <= 0) return false;
            let type = context.chart.config.type;
            if (type === 'doughnut' || type === 'pie') {
                let meta = context.chart.getDatasetMeta(context.datasetIndex);
                if (meta && meta.total > 0) {
                    if ((val / meta.total) < 0.04) return false;
                }
            }
            return 'auto';
        },
        anchor: function(context) {
            let type = context.chart.config.type;
            if (type === 'bar' || type === 'line') return 'end';
            return 'center';
        },
        align: function(context) {
            let type = context.chart.config.type;
            if (type === 'bar') return 'end';
            if (type === 'line') return 'top';
            return 'center';
        },
        offset: function(context) {
            let type = context.chart.config.type;
            return (type === 'bar' || type === 'line') ? 4 : 0;
        },
        clamp: true
    });
}




window.exportTableToPDF = function(tableId, title) {
    if(typeof pdfMake === 'undefined') {
        if(typeof toast === 'function') toast(L==='ar'?'??????? ???????? ??? ??????':'PDF library not loaded', 'error');
        return;
    }
    try {
        let table = document.getElementById(tableId);
        if(!table) return;
        
        let body = [];
        // headers
        let headRow = [];
        table.querySelectorAll('th').forEach(th => {
            headRow.push({ text: th.innerText, bold: true, fillColor: '#f0f2f5' });
        });
        body.push(headRow);
        
        // rows
        table.querySelectorAll('tbody tr').forEach(tr => {
            let row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.innerText);
            });
            body.push(row);
        });
        
        let docDefinition = {
            content: [
                { text: title, style: 'header', alignment: 'center', margin: [0,0,0,20] },
                {
                    table: {
                        headerRows: 1,
                        body: body
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true }
            },
            defaultStyle: {
                font: 'Roboto' // Note: pdfmake default font Roboto does not support Arabic well without custom VFS, but for English numbers/basic text it works. For full Arabic, a custom VFS is needed, but this is a solid start without breaking anything.
            }
        };
        pdfMake.createPdf(docDefinition).download(title + '.pdf');
        if(typeof toast === 'function') toast(L==='ar'?'?? ?????? PDF ?????!':'PDF Exported!', 'success');
    } catch(e) {
        console.error(e);
        if(typeof toast === 'function') toast('Error: ' + e.message, 'error');
    }
};


window.sanitize = function(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, match => {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[match];
    });
};
// js/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyAxXU5MePdVP1OcOyzitl0Jy5jMGrWtTSE",
    authDomain: "salesproapp-ba56b.firebaseapp.com",
    projectId: "salesproapp-ba56b",
    storageBucket: "salesproapp-ba56b.firebasestorage.app",
    messagingSenderId: "954558106678",
    appId: "1:954558106678:web:666ce1e645b3c9bbe01c97",
    measurementId: "G-FPFPWB7VV5"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Force long-polling to bypass strict Antiviruses or Firewalls that block WebSockets
db.settings({
    experimentalForceLongPolling: true,
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

firebase.firestore().enablePersistence().catch(err => {
    console.warn("Firestore offline persistence error:", err);
});

const auth = firebase.auth();
let currentUser = null;




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
if (L === 'en') {
    document.body.classList.add('en');
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
}
let P = 'dash'; // Current Page
let _cache = { salesData: S, targetData: T, accCats: accCats, hwCats: hwCats, payData: C, duesData: D };
let _chkC = {};
let _mtC = {};
let globalDateRange = { start: null, end: null }; // Global Date Filter

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
// Robust row value getter - matches column by name (case insensitive, ignores spaces)
function getRowVal(row, possibleNames) {
    let keys = Object.keys(row);
    let k = keys.find(k => possibleNames.some(p => k.toLowerCase().replace(/\s+/g, '') === p.toLowerCase().replace(/\s+/g, '')));
    if (k) {
        let v = row[k];
        if (typeof v === 'string') return Number(v.replace(/,/g, '')) || 0;
        return Number(v) || 0;
    }
    return 0;
}

// Get sales value - works with OLD format (Sales After Discount) AND NEW format (Sales Without Tax)
function getSalesVal(row) {
    return getRowVal(row, ['Sales After Discount', 'Sales Without Tax', 'Sales', 'Amount', 'المبيعات', 'المبيعات بعد الخصم', 'الصافي', 'صافي المبيعات', 'قيمة المبيعات']);
}

// Get profit value
function getProfitVal(row) {
    return getRowVal(row, ['Profit Margin', 'Profit', 'الربح', 'هامش الربح', 'ربح']);
}

// Get payment amount from Collections sheet
function getPayVal(row) {
    return getRowVal(row, ['Amount', 'Collection']);
}

// Get Payment Ref type from Collections sheet: returns 'acc', 'hw', or ''
function getPayRef(row) {
    let ref = (row['Payment Ref.'] || row['Payment Ref'] || row['PaymentRef'] || '').toString().trim().toLowerCase();
    if (ref.startsWith('acc')) return 'acc';
    if (ref.startsWith('hw'))  return 'hw';
    return '';
}




// js/auth.js
window.syncUI = window.syncUI || function(status) {
    console.log('[Cloud Sync]: ' + status);
    let el = document.getElementById('SYNC_STATUS') || document.getElementById('cloud_status');
    if (el) {
        if (status === 'syncing') el.innerHTML = '🔄 ' + (typeof L !== 'undefined' && L === 'ar' ? 'جاري المزامنة...' : 'Syncing...');
        else if (status === 'done') el.innerHTML = '☁️ ' + (typeof L !== 'undefined' && L === 'ar' ? 'متزامن مع السحابة' : 'Cloud Synced');
        else if (status === 'error') el.innerHTML = '❌ ' + (typeof L !== 'undefined' && L === 'ar' ? 'خطأ في المزامنة' : 'Sync Error');
    }
};

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        $('AUTH').classList.add('hidden');
        let over = document.getElementById('osStartupOverlay');
        if (over && !window.osShownAfterAuth) {
            window.osShownAfterAuth = true;
            over.style.display = 'flex';
            over.style.opacity = '1';
            over.style.transform = 'scale(1)';
            let prog = document.getElementById('osStartProgress');
            let stat = document.getElementById('osStartStatus');
            if(prog) prog.style.width = '30%';
            if(stat) stat.textContent = 'جاري تسجيل الدخول ومزامنة بياناتك...';
            setTimeout(() => {
                if(prog) prog.style.width = '70%';
                if(stat) stat.textContent = 'تجهيز واجهة المبيعات والأيقونات الذكية (3D)...';
            }, 500);
            setTimeout(() => {
                if(prog) prog.style.width = '100%';
                if(stat) stat.textContent = '✅ مرحباً بك في واجهة المبيعات الملكية!';
            }, 1000);
            setTimeout(() => {
                over.style.opacity = '0';
                over.style.transform = 'scale(1.08)';
                setTimeout(() => { over.style.display = 'none'; }, 600);
            }, 1400);
        }
        $('APP').classList.remove('hidden');
        $('APP').style.display = 'flex';
        if($('todoFloatBtn')) $('todoFloatBtn').style.display = 'flex';
        
        const ADMIN_EMAILS = ['tetoabdallah@gmail.com'];
        window.isAppAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
        
        function loadOwnDoc() {
            syncUI('syncing');
            // Using onSnapshot for real-time updates!
            db.collection('users').doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    let d = doc.data();
                    _mtC = d;
                    if (d['accCats'] && d['accCats'].length > 0) accCats = d['accCats'];
                    if (d['hwCats'] && d['hwCats'].length > 0) hwCats = d['hwCats'];
                    for(let k in d){
                        if (d[k] && (Array.isArray(d[k]) ? d[k].length > 0 : true)) {
                            _cache[k] = d[k];
                            try{ localStorage.setItem(k, JSON.stringify(d[k])); }catch(e){}
                        }
                    }
                    if (d['salesData'] && d['salesData'].length > 0) S = d['salesData'];
                    if (d['targetData'] && d['targetData'].length > 0) T = d['targetData'];
                    if (d['payData'] && d['payData'].length > 0) C = d['payData'];
                    if (d['duesData'] && d['duesData'].length > 0) D = d['duesData'];
                    syncUI('done');
                } else {
                    let md = { accCats: ld('accCats')||[], hwCats: ld('hwCats')||[] };
                    db.collection('users').doc(user.uid).set(md);
                }
            }, err => {
                syncUI('error'); console.error('Sync Error: ' + err.message);
            });
            
            
        }
        
        if (window.isAppAdmin) {
            let _admUsers = {};
            let _admChkC = {};
            let _unsubs = {};
            
            function asmAdmin() {
                let comb = { salesData:[], targetData:[], accCats:[], hwCats:[], payData:[], duesData:[] };
                for(let u in _admUsers) {
                    let d = _admUsers[u];
                    if(d.accCats && comb.accCats.length === 0) comb.accCats = d.accCats;
                    if(d.hwCats && comb.hwCats.length === 0) comb.hwCats = d.hwCats;
                    
                    ['salesData','targetData','payData','duesData'].forEach(k => {
                        let ct = d[k+'_meta'];
                        if(ct !== undefined) {
                            let uAsm = [];
                            let cmp = true;
                            for(let i=0; i<ct; i++) {
                                let chkKey = u+'_'+k+'_'+i;
                                if(_admChkC[chkKey]) uAsm = uAsm.concat(_admChkC[chkKey]);
                                else { cmp = false; break; }
                            }
                            if(cmp && uAsm.length > 0) {
                                uAsm.forEach(item => { if(typeof item === 'object') item._uid = u; });
                                comb[k] = comb[k].concat(uAsm);
                            }
                        } else if(d[k] && Array.isArray(d[k])) {
                            let arr = d[k];
                            arr.forEach(item => { if(typeof item === 'object') item._uid = u; });
                            comb[k] = comb[k].concat(arr);
                        }
                    });
                }
                for(let k in comb){
                    if (comb[k] && comb[k].length > 0) {
                        _cache[k] = comb[k];
                        try{ localStorage.setItem(k, JSON.stringify(comb[k])); }catch(e){}
                    }
                }
                if (_cache['salesData'] && _cache['salesData'].length > 0) S = _cache['salesData']; else S = S || [];
                if (_cache['targetData'] && _cache['targetData'].length > 0) T = _cache['targetData']; else T = T || [];
                if (_cache['accCats'] && _cache['accCats'].length > 0) accCats = _cache['accCats']; else accCats = accCats || [];
                if (_cache['hwCats'] && _cache['hwCats'].length > 0) hwCats = _cache['hwCats']; else hwCats = hwCats || [];
                if (_cache['payData'] && _cache['payData'].length > 0) C = _cache['payData']; else C = C || [];
                if (_cache['duesData'] && _cache['duesData'].length > 0) D = _cache['duesData']; else D = D || [];
                if(typeof render === 'function') render();
                syncUI('done');
            }
            
            db.collection('users').onSnapshot(snap => {
                syncUI('syncing');
                snap.forEach(doc => {
                    _admUsers[doc.id] = doc.data();
                    if(!_unsubs[doc.id]) {
                        _unsubs[doc.id] = db.collection('users').doc(doc.id).collection('chunks').onSnapshot(csnap => {
                            csnap.docChanges().forEach(change => {
                                let chkKey = doc.id + '_' + change.doc.id;
                                if(change.type === "added" || change.type === "modified") _admChkC[chkKey] = change.doc.data().data;
                                if(change.type === "removed") delete _admChkC[chkKey];
                            });
                            asmAdmin();
                        });
                    }
                });
                asmAdmin();
            }, err => {
                console.warn('Admin read failed', err);
                loadOwnDoc();
            });
        } else {
            loadOwnDoc();
        }
        
        // Auto-restore from cloud if local data is completely empty
        if ((!S || S.length === 0) && (!T || T.length === 0) && (!C || C.length === 0)) {
            console.log('Local data is empty, attempting auto-restore from cloud...');
            db.collection('users').doc(user.uid).get().then(async doc => {
                if (doc.exists && doc.data().backup_chunks) {
                    let d = doc.data();
                    let fullStr = "";
                    let numChunks = d.backup_chunks || 1;
                    for(let i=0; i<numChunks; i++){
                        let c = await db.collection('users').doc(user.uid).collection('chunks').doc('backup_chunk_'+i).get();
                        if(c.exists) fullStr += c.data().data;
                    }
                    if (fullStr) {
                        let p = JSON.parse(fullStr);
                        let changed = false;
                        if (p.salesData && p.salesData.length > 0)  { S = p.salesData;  sv('salesData',  S); changed = true; }
                        if (p.targetData && p.targetData.length > 0){ T = p.targetData; sv('targetData', T); changed = true; }
                        if (p.payData && p.payData.length > 0)      { C = p.payData;    sv('payData',    C); changed = true; }
                        if (p.duesData)     { D = p.duesData;   sv('duesData',   D); }
                        if (p.accCats)      { accCats = p.accCats; sv('accCats', accCats); }
                        if (p.hwCats)       { hwCats = p.hwCats;   sv('hwCats', hwCats); }
                        
                        if (changed) {
                            if (typeof toast === 'function') toast(L === 'ar' ? '✅ تم استرجاع بيانات السحابة تلقائياً' : '✅ Cloud data auto-restored', 'success');
                            setTimeout(() => { window.location.reload(); }, 1500);
                        }
                    }
                }
            }).catch(err => console.error('Auto-restore failed:', err));
        }
        
        if(typeof init === 'function') init();
    } else {
        currentUser = null;
        $('AUTH').classList.remove('hidden');
        $('APP').classList.add('hidden');
        $('APP').style.display = 'none';
        if($('todoFloatBtn')) $('todoFloatBtn').style.display = 'none';
        if($('todoDrawer')) $('todoDrawer').style.display = 'none';
        if($('todoOverlay')) $('todoOverlay').style.display = 'none';
    }
});

if ($('bLog')) {
    $('bLog').onclick = () => {
        let e = $('inE').value.trim(), p = $('inP').value.trim();
        if(!e || !p) { $('aErr').textContent = 'يرجى إدخال البيانات'; return; }
        
        $('bLog').textContent = 'جاري التحميل...';
        auth.signInWithEmailAndPassword(e, p).catch(err => {
            let code = err.code || '';
            let msg = err.message || '';
            if(code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials' || code === 'auth/wrong-password' || msg.includes('INVALID_LOGIN_CREDENTIALS')){
                auth.createUserWithEmailAndPassword(e, p).catch(err2 => {
                    let code2 = err2.code || '';
                    let msg2 = err2.message || '';
                    if (code2 === 'auth/email-already-in-use' || msg2.includes('EMAIL_EXISTS')) {
                        $('aErr').textContent = 'كلمة المرور غير صحيحة، أو الحساب موجود بالفعل.';
                    } else if (code2 === 'auth/weak-password' || msg2.includes('WEAK_PASSWORD')) {
                        $('aErr').textContent = 'كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.';
                    } else {
                        $('aErr').textContent = msg2.includes('{') ? 'حدث خطأ أثناء إنشاء الحساب، تأكد من صحة البيانات.' : msg2;
                    }
                    $('bLog').textContent = 'دخول / حساب جديد';
                });
            } else {
                $('aErr').textContent = msg.includes('{') ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : msg;
                $('bLog').textContent = 'دخول / حساب جديد';
            }
        });
    };
}

if ($('bLogG')) {
    $('bLogG').onclick = () => {
        let provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(err => {
            $('aErr').textContent = err.message;
        });
    };
}

// Global logout
window.logout = function() {
    auth.signOut();
};




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
    
    $('M').innerHTML = `
        <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px; margin-bottom: 24px;">
            <h1 style="display:flex;align-items:center;gap:12px; margin:0;"><i data-lucide="layout-dashboard" style="width:28px;height:28px;"></i> ${t('dash')}</h1>
            ${dateFilterUI}
        </div>
        <div class="stats">
          <article class="stat"><div class="stat-head"><span>${L==='ar'?'إجمالي المبيعات':'Total Sales'}</span><span class="stat-icon"><i data-lucide="wallet-cards" width="16" height="16"></i></span></div><div class="stat-value">${aFmt(ts)} <small>${L==='ar'?'ج.م':'EGP'}</small></div><div class="stat-foot"><span>${Object.keys(cu).length} ${L==='ar'?'عميل':'Customers'}</span></div></article>
          <article class="stat"><div class="stat-head"><span>${L==='ar'?'إجمالي الأرباح':'Total Profit'}</span><span class="stat-icon"><i data-lucide="trending-up" width="16" height="16"></i></span></div><div class="stat-value">${aFmt(tp)} <small>${L==='ar'?'ج.م':'EGP'}</small></div><div class="stat-foot"><span>${L==='ar'?'الهامش:':'Margin:'} ${(ts>0?tp/ts*100:0).toFixed(1)}%</span></div></article>
          <article class="stat"><div class="stat-head"><span>${L==='ar'?'تحصيل الإكسسوارات':'Acc Collection'}</span><span class="stat-icon"><i data-lucide="headphones" width="16" height="16"></i></span></div><div class="stat-value">${aFmt(accTot)} <small>${L==='ar'?'ج.م':'EGP'}</small></div></article>
          <article class="stat"><div class="stat-head"><span>${L==='ar'?'تحصيل الهاردوير':'HW Collection'}</span><span class="stat-icon"><i data-lucide="laptop" width="16" height="16"></i></span></div><div class="stat-value">${aFmt(hwTot)} <small>${L==='ar'?'ج.م':'EGP'}</small></div></article>
        </div>

        <div class="dashboard-grid">
          <section class="panel"><div class="panel-head"><div><h2 class="panel-title">${L==='ar'?'إيقاع المبيعات':'Sales Rhythm'}</h2><p class="panel-sub">${L==='ar'?'المبيعات اليومية':'Daily Sales'}</p></div></div><div class="chart-wrap"><canvas id="cD"></canvas></div></section>
          <section class="panel target-panel"><div class="target-top"><div><h2>${L==='ar'?'تقدم التارجت':'Target Progress'}</h2><p>${L==='ar'?'أداء الفريق':'Team Performance'}</p></div></div><div class="target-ring"><svg viewBox="0 0 160 160" aria-hidden="true"><circle class="ring-bg" cx="80" cy="80" r="66" fill="none" stroke-width="12"></circle><circle class="ring-value" cx="80" cy="80" r="66" fill="none" stroke-width="12" stroke-dasharray="414.7" stroke-dashoffset="${414.7 - (Math.min(ap, 100) / 100 * 414.7)}"></circle></svg><div class="ring-content"><strong>${ap.toFixed(0)}%</strong><span>${L==='ar'?'من التارجت':'of Target'}</span></div></div><div class="target-numbers"><div class="target-number"><small>${L==='ar'?'المحقق':'Achieved'}</small><strong>${aFmt(ts)}</strong></div><div class="target-number"><small>${L==='ar'?'المتبقي':'Remaining'}</small><strong>${aFmt(Math.max(0, tt-ts))}</strong></div></div></section>
        </div>
        
        <div class="dashboard-grid" style="margin-top: 16px;">
          <section class="panel" style="width:100%;"><div class="panel-head"><div><h2 class="panel-title">${L==='ar'?'المبيعات حسب الفئة':'Sales by Category'}</h2></div></div><div class="chart-wrap"><canvas id="cC"></canvas></div></section>
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
                        font: { weight: 'bold', size: 14, family: 'Cairo' },
                        textStrokeColor: 'rgba(0,0,0,0.5)',
                        textStrokeWidth: 3,
                        display: function(ctx) {
                            let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                            let v = dataset.data[ctx.dataIndex];
                            if (!v || v <= 0) return false;
                            if (ctx.chart.config.type === 'doughnut' || ctx.chart.config.type === 'pie') {
                                let total = dataset.data.reduce((a, b) => a + b, 0);
                                if ((v / total) < 0.05) return false;
                            }
                            return 'auto';
                        },
                        formatter: function(v) {
                            if (!v || v === 0) return '';
                            if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                            if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                            return v;
                        }
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
                        font: { weight: 'bold', size: 14, family: 'Cairo' },
                        textStrokeColor: 'rgba(0,0,0,0.5)',
                        textStrokeWidth: 3,
                        display: function(ctx) {
                            let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                            let v = dataset.data[ctx.dataIndex];
                            if (!v || v <= 0) return false;
                            if (ctx.chart.config.type === 'doughnut' || ctx.chart.config.type === 'pie') {
                                let total = dataset.data.reduce((a, b) => a + b, 0);
                                if ((v / total) < 0.05) return false;
                            }
                            return 'auto';
                        },
                        formatter: function(v) {
                            if (!v || v === 0) return '';
                            if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                            if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                            return v;
                        }
                    }}}
        });
    if(typeof lucide !== 'undefined') lucide.createIcons();

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
window.editCustomerTarget = function(name) {
    let idx = name ? T.findIndex(x => x.Customer === name) : -1;
    let r = idx !== -1 ? T[idx] : { Customer: '', phone: '', address: '', hwTarget: 0, accTarget: 0, Target: 0 };
    let m = document.createElement('div');
    m.id = 'custModal';
    m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;';
    m.innerHTML = `
        <div style="background:var(--bg); padding:25px; border-radius:12px; width:90%; max-width:400px; box-shadow:0 10px 30px rgba(0,0,0,0.5); border:1px solid var(--bd);">
            <h3 style="margin-top:0;">${idx===-1 ? (L==='ar'?'إضافة عميل وتارجت':'Add Customer') : (L==='ar'?'تعديل العميل':'Edit Customer')}</h3>
            <label style="display:block;margin-top:10px;font-size:0.9rem;">${L==='ar'?'اسم العميل':'Customer Name'}</label>
            <input id="cmName" value="${r.Customer}" class="sbox" style="width:100%;margin-bottom:10px;box-sizing:border-box;" ${idx!==-1?'readonly':''}>
            <label style="display:block;font-size:0.9rem;">${L==='ar'?'رقم الهاتف':'Phone'}</label>
            <input id="cmPhone" value="${r.phone||''}" class="sbox" style="width:100%;margin-bottom:10px;box-sizing:border-box;">
            <label style="display:block;font-size:0.9rem;">${L==='ar'?'العنوان':'Address'}</label>
            <input id="cmAddr" value="${r.address||''}" class="sbox" style="width:100%;margin-bottom:10px;box-sizing:border-box;">
            <label style="display:block;font-size:0.9rem;">${L==='ar'?'تارجت الهاردوير':'HW Target'}</label>
            <input type="number" id="cmHW" value="${r.hwTarget||0}" class="sbox" style="width:100%;margin-bottom:10px;box-sizing:border-box;">
            <label style="display:block;font-size:0.9rem;">${L==='ar'?'تارجت الإكسسوارات':'Acc Target'}</label>
            <input type="number" id="cmAcc" value="${r.accTarget||0}" class="sbox" style="width:100%;margin-bottom:20px;box-sizing:border-box;">
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn" style="background:var(--bd);color:var(--tx);" onclick="document.body.removeChild(document.getElementById('custModal'))">${L==='ar'?'إلغاء':'Cancel'}</button>
                <button class="btn btn-p" onclick="saveCustomerTarget('${idx!==-1 ? name.replace(/'/g, "\\'") : ''}')">${L==='ar'?'حفظ':'Save'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(m);
};

window.saveCustomerTarget = function(origName) {
    let name = document.getElementById('cmName').value.trim();
    if(!name) { alert(L==='ar'?'اسم العميل مطلوب':'Name required'); return; }
    let hw = Number(document.getElementById('cmHW').value)||0;
    let acc = Number(document.getElementById('cmAcc').value)||0;
    let total = hw + acc;
    
    let newData = {
        Customer: name,
        phone: document.getElementById('cmPhone').value.trim(),
        address: document.getElementById('cmAddr').value.trim(),
        hwTarget: hw,
        accTarget: acc,
        Target: total
    };
    
    if(!origName) {
        let exist = T.findIndex(x => x.Customer.toLowerCase() === name.toLowerCase());
        if(exist !== -1) { alert(L==='ar'?'العميل موجود مسبقاً':'Customer already exists'); return; }
        T.push(newData);
    } else {
        let idx = T.findIndex(x => x.Customer === origName);
        if(idx !== -1) T[idx] = { ...T[idx], ...newData };
    }
    
    sv('targetData', T);
    document.body.removeChild(document.getElementById('custModal'));
    rTgt();
    if(typeof window.cloudAutoSave === 'function') window.cloudAutoSave('تحديث تارجت عميل');
};

window.importCustomerTargets = function() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = function(e) {
        let file = e.target.files[0];
        if (!file) return;
        let reader = new FileReader();
        reader.onload = function(evt) {
            try {
                let data = new Uint8Array(evt.target.result);
                let workbook = XLSX.read(data, {type: 'array'});
                let firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                let rows = XLSX.utils.sheet_to_json(firstSheet);
                let added = 0;
                rows.forEach(r => {
                    let name = r.Customer || r['اسم العميل'] || r['Customer Name'] || r['العميل'];
                    if (name) {
                        name = name.toString().trim();
                        let existing = T.find(t => t.Customer && t.Customer.toLowerCase() === name.toLowerCase());
                        
                        let target = Number(r.Target || r['Target (Total)'] || r['Total Target'] || r['إجمالي التارجت'] || r['التارجت'] || 0);
                        let hw = Number(r.HW_Target || r['HW Target'] || r['تارجت هاردوير'] || r['هاردوير'] || 0);
                        let acc = Number(r.Acc_Target || r['Acc Target'] || r['تارجت اكسسوارات'] || r['اكسسوارات'] || 0);
                        
                        if (target === 0 && (hw > 0 || acc > 0)) {
                            target = hw + acc;
                        }
                        
                        let phone = r.Phone || r.phone || r['التليفون'] || r['رقم الهاتف'] || '';
                        let addr = r.Address || r.address || r['العنوان'] || '';

                        if (existing) {
                            if(phone) existing.phone = phone;
                            if(addr) existing.address = addr;
                            existing.Target = target;
                            existing.hwTarget = hw;
                            existing.accTarget = acc;
                        } else {
                            T.push({
                                Customer: name,
                                phone: phone,
                                address: addr,
                                Target: target,
                                hwTarget: hw,
                                accTarget: acc
                            });
                        }
                        added++;
                    }
                });
                if (added > 0) {
                    sv('targetData', T);
                    if (typeof toast === 'function') toast(L === 'ar' ? `تم استيراد/تحديث ${added} عميل بنجاح` : `Imported/Updated ${added} customers successfully`, 'success');
                    rTgt();
                    if(typeof window.cloudAutoSave === 'function') window.cloudAutoSave('استيراد تارجت عملاء');
                } else {
                    if (typeof toast === 'function') toast(L === 'ar' ? 'لم يتم العثور على بيانات صالحة في الملف' : 'No valid data found in file', 'error');
                }
            } catch(ex) {
                console.error(ex);
                if (typeof toast === 'function') toast(L === 'ar' ? 'خطأ أثناء قراءة الملف' : 'Error reading file', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    };
    input.click();
};

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

    let tt=0, ta=0, hwt=0, acct=0, hwa=0, acca=0;
    T.forEach(r => { 
        tt += Number(r.Target)||0; 
        ta += cS(r.Customer); 
        hwt += Number(r.hwTarget)||0;
        acct += Number(r.accTarget)||0;
        hwa += cSF(r.Customer, isHW);
        acca += cSF(r.Customer, isAcc);
    });
    $('M').innerHTML = `
        <div class="ph" style="display:flex;align-items:center;gap:12px; flex-wrap:wrap;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.targets}</span> ${t('targets')}"</h1>
            <div style="margin-left:auto; display:flex; gap:10px;">
                <button onclick="window.editCustomerTarget('')" class="btn btn-p" style="font-weight:bold;">+ ${L==='ar'?'إضافة عميل':'Add Customer'}</button>
                <button onclick="window.importCustomerTargets()" class="btn bg-g" style="color:#fff;border:none;background:#2196F3;"><span style="font-size:1rem;">&#x1F4E4;</span> Import</button>
                <button id="bExTgt" class="btn bg-g" style="color:#fff;border:none;"><span style="font-size:1rem;">&#x1F4E5;</span> Excel</button>
            </div>
        </div>
        <div class="kg" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));">
            <div class="ki"><div class="lb">${L==='ar'?'إجمالي التارجت':'Total Target'}</div><div class="vl" style="font-size:1.3rem;">${aFmt(tt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'إجمالي المحقق':'Total Achieved'}</div><div class="vl" style="font-size:1.3rem;">${aFmt(ta)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'نسبة الكلي':'Total %'}</div><div class="vl" style="font-size:1.3rem;color:var(--ac);">${aFmt(tt>0?ta/tt*100:0,true)}</div></div>
            
            <div class="ki" style="border-left: 3px solid #ff9800;"><div class="lb">${L==='ar'?'تارجت هاردوير':'HW Target'}</div><div class="vl" style="font-size:1.3rem;">${aFmt(hwt)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'محقق هاردوير':'HW Achieved'}</div><div class="vl" style="font-size:1.3rem;">${aFmt(hwa)}</div></div>
            <div class="ki"><div class="lb">% HW</div><div class="vl" style="font-size:1.3rem;color:#ff9800;">${aFmt(hwt>0?hwa/hwt*100:0,true)}</div></div>
            
            <div class="ki" style="border-left: 3px solid #4caf50;"><div class="lb">${L==='ar'?'تارجت إكسسوار':'Acc Target'}</div><div class="vl" style="font-size:1.3rem;">${aFmt(acct)}</div></div>
            <div class="ki"><div class="lb">${L==='ar'?'محقق إكسسوار':'Acc Achieved'}</div><div class="vl" style="font-size:1.3rem;">${aFmt(acca)}</div></div>
            <div class="ki"><div class="lb">% Acc</div><div class="vl" style="font-size:1.3rem;color:#4caf50;">${aFmt(acct>0?acca/acct*100:0,true)}</div></div>
        </div>
        <div class="tb">
            <div class="tbt"><h3>Targets</h3><input class="sbox" id="tsr" placeholder="..."></div>
            <div class="tbs"><table><thead><tr><th>Customer / Contact</th><th>Target (Total)</th><th>Achieved</th><th>%</th><th>HW Tgt</th><th>HW Ach</th><th>Acc Tgt</th><th>Acc Ach</th><th>Act</th></tr></thead><tbody id="ttb"></tbody></table></div>
        </div>
    `;
    
    $('bExTgt').onclick = () => exportToExcel(T.map(r => ({ Customer: r.Customer, Phone: r.phone||'', Address: r.address||'', Target: Number(r.Target)||0, Achieved: cS(r.Customer), HW_Target: r.hwTarget||0, HW_Achieved: cSF(r.Customer,isHW), Acc_Target: r.accTarget||0, Acc_Achieved: cSF(r.Customer,isAcc) })), 'Targets_Report');

    function fTg(d){
        $('ttb').innerHTML = d.map(r => {
            let tg = Number(r.Target)||0, a = cS(r.Customer), p = tg>0 ? a/tg*100 : 0;
            let hwT = Number(r.hwTarget)||0, hwA = cSF(r.Customer,isHW);
            let accT = Number(r.accTarget)||0, accA = cSF(r.Customer,isAcc);
            
            let contactHTML = '';
            if(r.phone || r.address) {
                contactHTML = `<div style="font-size:0.8rem; color:var(--tx2); margin-top:4px;">&#x1F4DE; ${r.phone||'-'} <br/>&#x1F4CD; ${r.address||'-'}</div>`;
            }
            
            return `<tr>
                <td><strong>${r.Customer}</strong>${contactHTML}</td>
                <td><strong>${fmt(tg)}</strong></td>
                <td><strong>${fmt(a)}</strong></td>
                <td><span class="badge ${p>=100?'bg-g':p>=60?'bg-a':'bg-r'}">${pc(p)}</span></td>
                <td><span style="color:var(--tx2);">${fmt(hwT)}</span></td>
                <td>${fmt(hwA)}</td>
                <td><span style="color:var(--tx2);">${fmt(accT)}</span></td>
                <td>${fmt(accA)}</td>
                <td>
                    <button onclick="window.editCustomerTarget('${r.Customer.replace(/'/g, "\\'")}')" class="btn" style="padding:4px 8px; font-size:0.8rem; background:var(--bg3); border:1px solid var(--bd);">
                        ${L==='ar'?'تعديل':'Edit'}
                    </button>
                </td>
            </tr>`;
        }).join('');
    }
    fTg(T);
    
    $('tsr').oninput = debounce(e => {
        let v = e.target.value.toLowerCase();
        fTg(v ? T.filter(r => (r.Customer||'').toLowerCase().includes(v) || (r.phone||'').toLowerCase().includes(v) || (r.address||'').toLowerCase().includes(v)) : T);
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

        <div class="rg">${ring(L==='ar'?TUI('Sales'):'Sales', ap, ts)}${ring(L==='ar'?TUI('Profit'):'Profit', pp, tp)}</div>
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
            <div class="tbs"><table><thead><tr><th>Customer</th><th>Region</th><th>Orders</th><th>Sales</th><th>Acc</th><th>HW</th><th>Profit</th><th>Margin</th><th>Target</th><th>Ach.</th><th>Last</th><th>الإجراءات</th></tr></thead><tbody id="cutb"></tbody></table></div>
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
        
        $('cutb').innerHTML = paged.map(r => {
            let phone = window.T && window.T.find(t => t.Customer === r.n) ? window.T.find(t => t.Customer === r.n).Phone : '';
            return `<tr><td><strong>${r.n}</strong> ${r.tierBadge||''}</td><td>${r.rg}</td><td>${r.o}</td><td>${fmt(r.s)}</td><td>${fmt(r.accS)}</td><td>${fmt(r.hwS)}</td><td>${fmt(r.p)}</td><td><span class="badge ${r.m>=5?'bg-g':r.m>=2?'bg-a':'bg-r'}">${pc(r.m)}</span></td><td>${fmt(r.tg)}</td><td>${r.tg>0?`<span class="badge ${r.ach>=100?'bg-g':r.ach>=60?'bg-a':'bg-r'}">${pc(r.ach)}</span>`:'-'}</td><td>${r.l}</td><td>
                <div style="display:flex;gap:5px;">
                    <button class="btn" style="background:#25D366; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem;" onclick="let p=prompt('رقم هاتف ${r.n}:', '${phone||''}'); if(p) window.open('https://wa.me/2'+p.replace(/\\D/g,'')+'?text='+encodeURIComponent('أهلاً بك أستاذ ${r.n.replace(/'/g, "\\'")}') ,'_blank')">WA</button>
                    <button class="btn" style="background:var(--p); color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem;" onclick="window.generateQuote('${r.n.replace(/'/g, "\\'")}')">PDF</button>
                </div>
            </td></tr>`;
        }).join('');
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
    let monthly = {}, cats = {}, regions = {}, items = {};
    ds.forEach(r => {
        let d = pd(r['Order Date']); if(!d) return;
        let m = d.slice(0,7);
        let s = getSalesVal(r);
        if(!monthly[m]) monthly[m] = {s:0,p:0};
        monthly[m].s += s;
        monthly[m].p += getProfitVal(r);
        let c = r['Item Class Name']||'Other';
        cats[c] = (cats[c]||0) + s;
        let rg = r['Customer Class']||'Other';
        regions[rg] = (regions[rg]||0) + s;
        let itm = r['Item Description']||'غير محدد';
        items[itm] = (items[itm]||0) + s;
    });
    let months = Object.keys(monthly).sort();
    let topCats = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,8);
    let topReg = Object.entries(regions).sort((a,b)=>b[1]-a[1]);
    let allItems = Object.entries(items).sort((a,b)=>b[1]-a[1]);
    let topItems = allItems.slice(0,10);
    let bottomItems = allItems.slice(-10).reverse();

    $('M').innerHTML = `
        <div class="ph"><h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.analytics}</span> ${t('analytics')}</h1></div>
        <div class="cg">
            <div class="cc"><h3>${L==='ar'?TUI('Monthly Sales'):'Monthly Sales'}</h3><div class="cw"><canvas id="anM"></canvas></div></div>
            <div class="cc"><h3>${L==='ar'?TUI('Categories'):'Categories'}</h3><div class="cw"><canvas id="anC"></canvas></div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;" class="rg-grid">
            <div class="card">
                <h3 style="margin-bottom:12px; color:var(--tx1);">${L==='ar'?TUI('Regions'):'Regions'}</h3>
                ${topReg.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);font-size:0.85rem; color:var(--tx1);"><span style="color:var(--tx1);">${n}</span><strong style="color:var(--tx1);">${fmt(v)}</strong></div>`).join('')}
            </div>
            <div class="card">
                <h3 style="margin-bottom:12px; color:var(--tx1);">${L==='ar'?TUI('Top Categories'):'Top Categories'}</h3>
                ${topCats.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);font-size:0.85rem; color:var(--tx1);"><span style="color:var(--tx1);">${n}</span><strong style="color:var(--tx1);">${fmt(v)}</strong></div>`).join('')}
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
            <div class="card" style="border-top:4px solid var(--gn);">
                <h3 style="margin-bottom:12px; color:var(--tx1);">${L==='ar'?'أفضل 10 أصناف مبيعاً':'Top 10 Items'}</h3>
                ${topItems.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);font-size:0.85rem; color:var(--tx1);"><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:10px; color:var(--tx1);" title="${n}">${n}</span><strong style="color:var(--gn);">${fmt(v)}</strong></div>`).join('')}
            </div>
            <div class="card" style="border-top:4px solid var(--rd);">
                <h3 style="margin-bottom:12px; color:var(--tx1);">${L==='ar'?'أقل 10 أصناف مبيعاً':'Bottom 10 Items'}</h3>
                ${bottomItems.map(([n,v])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);font-size:0.85rem; color:var(--tx1);"><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:10px; color:var(--tx1);" title="${n}">${n}</span><strong style="color:var(--rd);">${fmt(v)}</strong></div>`).join('')}
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
                        font: { weight: 'bold', size: 14, family: 'Cairo' },
                        textStrokeColor: 'rgba(0,0,0,0.5)',
                        textStrokeWidth: 3,
                        display: function(ctx) {
                            let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                            let v = dataset.data[ctx.dataIndex];
                            if (!v || v <= 0) return false;
                            if (ctx.chart.config.type === 'doughnut' || ctx.chart.config.type === 'pie') {
                                let total = dataset.data.reduce((a, b) => a + b, 0);
                                if ((v / total) < 0.05) return false;
                            }
                            return 'auto';
                        },
                        formatter: function(v) {
                            if (!v || v === 0) return '';
                            if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                            if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                            return v;
                        }
                    }}}
        });
    }
    let ctxC = $('anC');
    if(ctxC && topCats.length) {
        CH.anC = new Chart(ctxC, {
            type:'doughnut', data:{labels:topCats.map(x=>x[0]), datasets:[{data:topCats.map(x=>x[1]),backgroundColor:CL,borderWidth:0}]},
            options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:8}}}, datalabels: {
                        color: '#fff',
                        font: { weight: 'bold', size: 14, family: 'Cairo' },
                        textStrokeColor: 'rgba(0,0,0,0.5)',
                        textStrokeWidth: 3,
                        display: function(ctx) {
                            let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                            let v = dataset.data[ctx.dataIndex];
                            if (!v || v <= 0) return false;
                            if (ctx.chart.config.type === 'doughnut' || ctx.chart.config.type === 'pie') {
                                let total = dataset.data.reduce((a, b) => a + b, 0);
                                if ((v / total) < 0.05) return false;
                            }
                            return 'auto';
                        },
                        formatter: function(v) {
                            if (!v || v === 0) return '';
                            if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                            if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                            return v;
                        }
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
                        font: { weight: 'bold', size: 14, family: 'Cairo' },
                        textStrokeColor: 'rgba(0,0,0,0.5)',
                        textStrokeWidth: 3,
                        display: function(ctx) {
                            let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                            let v = dataset.data[ctx.dataIndex];
                            if (!v || v <= 0) return false;
                            if (ctx.chart.config.type === 'doughnut' || ctx.chart.config.type === 'pie') {
                                let total = dataset.data.reduce((a, b) => a + b, 0);
                                if ((v / total) < 0.05) return false;
                            }
                            return 'auto';
                        },
                        formatter: function(v) {
                            if (!v || v === 0) return '';
                            if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                            if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                            return v;
                        }
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
                        font: { weight: 'bold', size: 14, family: 'Cairo' },
                        textStrokeColor: 'rgba(0,0,0,0.5)',
                        textStrokeWidth: 3,
                        display: function(ctx) {
                            let dataset = ctx.chart.data.datasets[ctx.datasetIndex];
                            let v = dataset.data[ctx.dataIndex];
                            if (!v || v <= 0) return false;
                            if (ctx.chart.config.type === 'doughnut' || ctx.chart.config.type === 'pie') {
                                let total = dataset.data.reduce((a, b) => a + b, 0);
                                if ((v / total) < 0.05) return false;
                            }
                            return 'auto';
                        },
                        formatter: function(v) {
                            if (!v || v === 0) return '';
                            if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                            if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                            return v;
                        }
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
// Prospects (CRM Kanban)
function rPros() {
    let activeCustomers = new Set(S.map(r=>r.Customer||''));
    let unpurchasedTargets = T.filter(r=>!activeCustomers.has(r.Customer));
    let ld = [];
    try { ld = JSON.parse(localStorage.getItem('leadsData') || '[]'); } catch(err){}
    
    let added = false;
    unpurchasedTargets.forEach(r => {
        if(!ld.find(x => x.name === r.Customer)) {
            ld.push({ id: Date.now() + Math.random(), name: r.Customer, phone: '', branch: 'من التارجت', status: 'Targeted', note: 'المستهدف: ' + r.Target });
            added = true;
        }
    });
    if(added) localStorage.setItem('leadsData', JSON.stringify(ld));

    let stages = [
        { id: 'Targeted', name: L==='ar'?'الاستهداف':'Targeted', color: '#607d8b' },
        { id: 'Contacted', name: L==='ar'?'تم التواصل':'Contacted', color: '#ff9800' },
        { id: 'Visited', name: L==='ar'?'تمت الزيارة':'Visited', color: '#2196f3' },
        { id: 'Won', name: L==='ar'?'تمت البيعة':'Won', color: '#4caf50' }
    ];

    window.changeLeadStatus = function(id, newStatus) {
        let lds = JSON.parse(localStorage.getItem('leadsData') || '[]');
        let idx = lds.findIndex(x => x.id == id);
        if(idx > -1) { lds[idx].status = newStatus; localStorage.setItem('leadsData', JSON.stringify(lds)); rPros(); }
    };
    window.addLead = function() {
        let n = prompt(L==='ar'?'اسم العميل المحتمل:':'Lead Name:'); if(!n) return;
        let p = prompt(L==='ar'?'رقم الهاتف:':'Phone:');
        let lds = JSON.parse(localStorage.getItem('leadsData') || '[]');
        lds.push({ id: Date.now(), name: n, phone: p||'', branch: 'إضافة يدوية', status: 'Targeted', note: '' });
        localStorage.setItem('leadsData', JSON.stringify(lds)); rPros();
    };
    window.waLead = function(phone, name) {
        if(!phone) { alert(L==='ar'?'لا يوجد رقم هاتف مسجل لهذا العميل':'No phone recorded'); return; }
        let msg = L==='ar'? `أهلاً بك أستاذ ${name}، معك مندوب المبيعات لتقديم عروض حصرية.` : `Hello ${name}, presenting exclusive offers.`;
        window.open(`https://wa.me/2${phone.replace(/\\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
    };
    window.delLead = function(id) {
        if(confirm(L==='ar'?'تأكيد الحذف؟':'Confirm Delete?')) {
            let lds = JSON.parse(localStorage.getItem('leadsData') || '[]');
            lds = lds.filter(x => x.id != id);
            localStorage.setItem('leadsData', JSON.stringify(lds)); rPros();
        }
    };

    let colsHTML = stages.map(st => {
        let items = ld.filter(x => x.status === st.id);
        let itemsHTML = items.map(x => `
            <div class="card" style="padding:15px; margin-bottom:10px; border-right: 4px solid ${st.color}; background: var(--bg2);">
                <div style="font-weight:bold; font-size:1.1rem; margin-bottom:5px;">${x.name}</div>
                <div style="color:var(--tx2); font-size:0.9rem; margin-bottom:10px;">${x.phone||'---'} | ${x.branch||''}</div>
                ${x.note ? `<div style="font-size:0.85rem; color:var(--tx3); margin-bottom:10px;">${x.note}</div>` : ''}
                <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px;">
                    <select onchange="changeLeadStatus(${x.id}, this.value)" style="padding:4px; border-radius:4px; border:1px solid var(--bd); background:var(--bg); color:var(--tx); flex:1;">
                        ${stages.map(s => `<option value="${s.id}" ${s.id===x.status?'selected':''}>${s.name}</option>`).join('')}
                    </select>
                </div>
                <div style="display:flex; gap:5px; flex-wrap:wrap;"></div>
            </div>
        `).join('');
        return `
            <div style="flex: 1; min-width: 0; background: var(--bg); border-radius:12px; padding:15px; border:1px solid var(--bd); box-shadow: var(--sh);">
                <h3 style="margin-bottom:15px; color:${st.color}; border-bottom:2px solid ${st.color}; padding-bottom:5px; font-size:1rem;">${st.name} (${items.length})</h3>
                <div style="min-height: 400px; display:flex; flex-direction:column; gap:10px;">${itemsHTML}</div>
            </div>
        `;
    }).join('');

    window.openRouteOptimizer = function() {
        let lds = JSON.parse(localStorage.getItem('leadsData') || '[]');
        let targets = lds.filter(x => x.status === 'Targeted' || x.status === 'Contacted');
        if (targets.length === 0) {
            alert(L==='ar'?'لا يوجد عملاء محتملين في مرحلة الاستهداف أو التواصل.':'No prospects in Targeted or Contacted stages.');
            return;
        }
        let url = "https://www.google.com/maps/dir/";
        let count = 0;
        targets.forEach(t => {
            if (count < 9) { // Google maps URL supports around 9-10 waypoints
                if(t.lat && t.lon) { url += `${t.lat},${t.lon}/`; count++; }
                else if (t.branch) { url += `${encodeURIComponent(t.branch + ' ' + t.name)}/`; count++; }
            }
        });
        window.open(url, '_blank');
    };

    window.openBulkWA = function() {
        let lds = JSON.parse(localStorage.getItem('leadsData') || '[]');
        let targets = lds.filter(x => (x.status === 'Targeted' || x.status === 'Contacted') && x.phone);
        if (targets.length === 0) {
            alert(L==='ar'?'لا يوجد عملاء محتملين بأرقام هواتف لعمل حملة.':'No prospects with phone numbers available.');
            return;
        }
        let msg = prompt(L==='ar'?'اكتب الرسالة الجماعية التي سيتم إرسالها للعملاء:':'Type the bulk message for the leads:');
        if(!msg) return;
        
        let sent = 0;
        targets.forEach(t => {
            if(sent < 10) { // Limit to 10 at once to avoid browser popup blocks
                let m = msg.replace('{name}', t.name);
                window.open(`https://wa.me/2${t.phone.replace(/\D/g,'')}?text=${encodeURIComponent(m)}`, '_blank');
                sent++;
            }
        });
        alert(L==='ar'?`تم فتح محادثات واتساب لـ ${sent} عميل.`:`Opened WhatsApp chats for ${sent} leads.`);
    };

    $('M').innerHTML = `
        <div class="ph" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.prospects}</span> ${L==='ar'?'نظام إدارة المحتملين (CRM)':'Leads CRM'}</h1>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button onclick="window.openRouteOptimizer()" class="btn" style="background:#2196f3; color:#fff; padding:8px 16px; font-weight:bold;" title="${L==='ar'?'تخطيط مسار الزيارات لليوم':'Plan route'}">📍 ${L==='ar'?'مسار الزيارات':'Route Plan'}</button>
                <button onclick="window.openBulkWA()" class="btn" style="background:#25D366; color:#fff; padding:8px 16px; font-weight:bold;" title="${L==='ar'?'إرسال واتساب جماعي':'Bulk WhatsApp'}">💬 ${L==='ar'?'حملة واتساب':'Bulk WA'}</button>
                <button onclick="window.openGizaSearch()" class="btn" style="background:#ff9800; color:#fff; padding:8px 16px; font-weight:bold; display:flex; align-items:center; gap:5px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> 
                    ${L==='ar'?'البحث الذكي بالجيزة':'Smart Search in Giza'}
                </button>
                <button onclick="window.addLead()" class="btn" style="background:var(--ac); color:#fff; padding:8px 16px;">+ ${L==='ar'?'إضافة عميل':'Add Lead'}</button>
            </div>
        </div>
        <div style="display:flex; gap:15px; padding-bottom:20px; margin-top:20px; width:100%; box-sizing: border-box;">
            ${colsHTML}
        </div>
    `;
}

// Map Search API Injection
window.openGizaSearch = function() {
    if(document.getElementById('gizaModal')) return;
    let m = document.createElement('div');
    m.id = 'gizaModal';
    m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);';
    m.innerHTML = `
        <div style="background:var(--bg); padding:30px; border-radius:15px; width:90%; max-width:550px; box-shadow:0 15px 40px rgba(0,0,0,0.5); border:1px solid var(--bd); position:relative; overflow:hidden;">
            <div style="position:absolute; top:-20px; right:-20px; background:var(--ac); width:100px; height:100px; border-radius:50%; opacity:0.1;"></div>
            <h2 style="margin-top:0; color:var(--tx); display:flex; align-items:center; gap:10px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#ff9800;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${L==='ar'?'بحث عن عملاء جدد - الجيزة':'Find New Leads - Giza Governorate'}
            </h2>
            <p style="color:var(--tx2); margin-bottom:20px; font-size:15px;">${L==='ar'?'اختر نشاط العملاء للبحث عنهم في جميع مناطق الجيزة وضواحيها (أكتوبر، زايد، الهرم، المهندسين.. الخ):':'Select business type to search across all Giza and its suburbs:'}</p>
            
            <label style="display:block; margin-bottom:8px; color:var(--tx); font-weight:bold;">${L==='ar'?'نوع النشاط (الفئة المستهدفة):':'Business Category:'}</label>
            <select id="gizaCategory" style="width:100%; padding:12px; margin-bottom:20px; border-radius:8px; border:2px solid var(--bd); background:var(--bg2); color:var(--tx); font-size:16px; outline:none; cursor:pointer;">
                <option value='["amenity"="pharmacy"]'>صيدليات (Pharmacies)</option>
                <option value='["shop"~"supermarket|convenience"]'>سوبر ماركت (Supermarkets)</option>
                <option value='["amenity"~"restaurant|cafe|fast_food"]'>مطاعم وكافيهات (Restaurants & Cafes)</option>
                <option value='["shop"~"clothes|boutique|shoes"]'>ملابس وأحذية (Clothing & Shoes)</option>
                <option value='["shop"~"electronics|mobile_phone"]'>موبايلات وإلكترونيات (Electronics)</option>
                <option value='["amenity"~"clinic|hospital"]'>عيادات ومستشفيات (Clinics & Hospitals)</option>
                <option value='["shop"~"hairdresser|beauty"]'>صالونات تجميل (Beauty & Salons)</option>
                <option value='["shop"~"bakery|pastry"]'>مخابز وحلويات (Bakeries)</option>
                <option value='["amenity"="bank"]'>بنوك وخدمات مالية (Banks)</option>
                <option value='["shop"~"hardware|doityourself"]'>أدوات منزلية وخردوات (Hardware & Home)</option>
            </select>
            
            <div id="gizaLoading" style="display:none; color:var(--ac); margin-bottom:20px; font-weight:bold; text-align:center; padding:15px; background:rgba(33, 150, 243, 0.1); border-radius:8px; border:1px dashed var(--ac);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin" style="margin-bottom:-6px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg><br/>
                ${L==='ar'?'جاري مسح الخريطة واستخراج بيانات العملاء، يرجى الانتظار (قد يستغرق بضع ثوانٍ)...':'Scanning map and extracting leads data, please wait...'}
            </div>
            
            <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:10px;">
                <button onclick="document.body.removeChild(document.getElementById('gizaModal'))" class="btn" style="background:var(--bd); color:var(--tx); padding:10px 20px; border-radius:8px;">${L==='ar'?'إلغاء':'Cancel'}</button>
                <button onclick="window.fetchGizaLeads()" id="gizaSearchBtn" class="btn" style="background:#ff9800; color:#fff; padding:10px 20px; font-weight:bold; border-radius:8px; box-shadow:0 4px 10px rgba(255, 152, 0, 0.3);">${L==='ar'?'بحث وإضافة للسيستم':'Search & Add to CRM'}</button>
            </div>
        </div>
    `;
    
    // Add spin css if not exists
    if(!document.getElementById('gizaStyles')) {
        let st = document.createElement('style');
        st.id = 'gizaStyles';
        st.innerHTML = `@keyframes spin { 100% { transform:rotate(360deg); } } .spin { animation:spin 1s linear infinite; }`;
        document.head.appendChild(st);
    }
    document.body.appendChild(m);
};

window.fetchGizaLeads = async function() {
    let cat = document.getElementById('gizaCategory').value;
    document.getElementById('gizaLoading').style.display = 'block';
    document.getElementById('gizaSearchBtn').disabled = true;
    document.getElementById('gizaSearchBtn').style.opacity = '0.6';
    
    // Overpass API Query for Giza Governorate using Bounding Box (Giza, 6th of October, Sheikh Zayed, Haram, etc.)
    let query = `[out:json][timeout:25];
nwr${cat}(29.80,30.80,30.15,31.25);
out center 150;`; 
    
    try {
        let res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(query)
        });
        
        if(!res.ok) throw new Error('API Error');
        let data = await res.json();
        
        if(data && data.elements && data.elements.length > 0) {
            let lds = JSON.parse(localStorage.getItem('leadsData') || '[]');
            let addedCount = 0;
            
            data.elements.forEach(el => {
                let name = el.tags.name || el.tags['name:ar'] || el.tags['name:en'] || (L==='ar'?'موقع تجاري - الجيزة':'Commercial Place - Giza');
                // Ensure no duplicates by name (case-insensitive trim)
                let nm = name.trim().toLowerCase();
                if(!lds.find(x => x.name && x.name.trim().toLowerCase() === nm)) {
                    let city = el.tags['addr:city'] || el.tags['addr:suburb'] || '';
                    let street = el.tags['addr:street'] || '';
                    let fullBranch = 'الجيزة';
                    if(city) fullBranch += ' - ' + city;
                    if(street) fullBranch += ' (' + street + ')';
                    
                    lds.push({ 
                        id: Date.now() + Math.random(), 
                        name: name, 
                        phone: el.tags.phone || el.tags['contact:phone'] || el.tags['contact:mobile'] || '', 
                        branch: fullBranch, 
                        status: 'Targeted', 
                        lat: el.center ? el.center.lat : el.lat,
                        lon: el.center ? el.center.lon : el.lon,
                        note: (L==='ar'?'المصدر: بحث الخرائط الذكي':'Source: Smart Map Search') 
                    });
                    addedCount++;
                }
            });
            
            if(addedCount > 0) {
                localStorage.setItem('leadsData', JSON.stringify(lds));
                if(typeof rPros === 'function') rPros();
                alert(L==='ar'? `نجاح! تم العثور على ${addedCount} عميل جديد في الجيزة وتم إضافتهم لقائمة المحتملين.` : `Success! Found and added ${addedCount} new leads in Giza.`);
            } else {
                alert(L==='ar'? 'لم يتم إضافة أي عملاء جدد (العملاء الموجودين في هذه المنطقة مسجلين لديك مسبقاً).' : 'No new leads added (they already exist in your system).');
            }
        } else {
            alert(L==='ar'? 'عفواً، لم يتم العثور على أي بيانات مطابقة في خريطة الجيزة حالياً.' : 'Sorry, no matching places found in Giza currently.');
        }
    } catch(e) {
        console.error(e);
        // Fallback bounding box for Giza if area query fails
        alert(L==='ar'? 'حدث خطأ أثناء الاتصال بالخريطة، يرجى التأكد من اتصال الإنترنت أو المحاولة لاحقاً.' : 'Map connection error, please try again.');
    }
    
    let m = document.getElementById('gizaModal');
    if(m) document.body.removeChild(m);
};

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
            ${alerts.length===0?`<p style="text-align:center;color:var(--tx2);">? ${L==='ar'?TUI('No alerts'):'No alerts'}</p>`:alerts.map(a=>`<div style="display:flex;align-items:center;gap:12px;padding:14px;margin-bottom:10px;background:var(--bg2);border-radius:10px;border-left:4px solid ${a.type==='danger'?'var(--rd)':'var(--am)'}; box-shadow:var(--sh); color:var(--tx1); font-weight:600;"><span style="font-size:1.3rem;">${a.icon}</span><span style="font-size:0.95rem;">${a.msg}</span></div>`).join('')}
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
            <h3 style="margin-bottom:16px; color:var(--tx1);">${L==='ar'?TUI('Quick Smart Insights'):'Quick Smart Insights'}</h3>
            ${insights.length===0?`<p style="color:var(--tx2);text-align:center;">${L==='ar'?TUI('Upload your data to get AI insights'):'Upload your data to get AI insights'}</p>`:insights.map(i=>`<div style="display:flex;gap:12px;padding:14px;margin-bottom:10px;background:var(--bg2);border-radius:10px;border-left:4px solid ${i.color}; box-shadow:var(--sh); color:var(--tx1); font-weight:600;"><span style="font-size:1.3rem;">${i.icon}</span><span style="font-size:0.95rem;line-height:1.5;">${i.text}</span></div>`).join('')}
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
                <h3 style="margin-bottom:12px;text-align:center;">النسخ الاحتياطي السحابي ☁️</h3>
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
                <button class="btn" id="bRestoreDrive" style="width:100%; justify-content:center; background:#4285F4; color:white; border:none; margin-top:10px;">
                    استرجاع بواسطة (Google Drive) ⬇️
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
                toast(L==='ar' ? '✅ تم تحديث البيانات بنجاح!' : '✅ Data Updated!');
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
        // Show loader
        let loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = '<div class="loader-content"><div class="loader-icon">📊</div><div class="loader-text">' + (typeof L !== 'undefined' && L==='ar'?'جاري معالجة البيانات...':'Processing Data...') + '</div></div>';
        document.body.appendChild(loader);

        let reader = new FileReader();
        reader.onload = e => {
            // Use setTimeout to yield to the UI thread so the loader renders
            setTimeout(() => {
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
                } catch(err) { 
                    if(typeof toast === 'function') toast(typeof L !== 'undefined' && L==='ar' ? 'خطأ في قراءة الملف' : 'Error reading file', 'error'); 
                } finally {
                    loader.classList.add('fade-out');
                    setTimeout(() => loader.remove(), 500);
                }
            }, 50);
        };
        reader.readAsArrayBuffer(file);
    }
    $('bUpload').onclick = () => {
        let done = 0, total = 0;
        let fS = $('fSales').files[0], fT = $('fTarget').files[0], fP = $('fPay').files[0];
        if(!fS && !fT && !fP) { toast(L==='ar'?TUI('Choose a file first!'):'Choose a file first!'); return; }
        let onAllDone = () => {
            toast(L==='ar' ? '✅ تم تحديث البيانات بنجاح!' : '✅ Data Updated!');
            render();
            if (typeof window.cloudAutoSave === 'function') {
                window.cloudAutoSave(L==='ar' ? 'رفع ملفات' : 'File Upload');
            }
        };
        if(fS) { total++; parseFile(fS, d => { S = d; sv('salesData', d); done++; if(done===total) onAllDone(); }); }
        if(fT) { total++; parseFile(fT, d => { 
            let norm = d.map(r => {
                let Customer = r.Customer || r['العميل'] || r['Customer Name'] || r['اسم العميل'] || r['الاسم'];
                let Target = r.Target || r['التارجت'] || r['Total Target'] || r['تارجت'] || 0;
                let phone = r.Phone || r['رقم الموبايل'] || r['موبايل'] || r['رقم الهاتف'] || r['Mobile'] || r.phone || '';
                let address = r.Address || r['العنوان'] || r['عنوان'] || r.address || '';
                let hwTarget = r['Target HW'] || r['تارجت هاردوير'] || r['Hardware Target'] || r.hwTarget || 0;
                let accTarget = r['Target Acc'] || r['تارجت اكسسوارات'] || r['Accessories Target'] || r['تارجت اكسسوار'] || r.accTarget || 0;
                if(!Target && (hwTarget || accTarget)) Target = Number(hwTarget||0) + Number(accTarget||0);
                return { ...r, Customer, Target: Number(Target)||0, phone, address, hwTarget: Number(hwTarget)||0, accTarget: Number(accTarget)||0 };
            }).filter(r => r.Customer);
            T = norm; sv('targetData', norm); done++; if(done===total) onAllDone(); 
        }); }
        if(fP) { total++; parseFile(fP, d => { C = d; sv('payData', d); done++; if(done===total) onAllDone(); }, 'Payment Ref'); }
    };

    
    $('bSaveCats').onclick = () => {
        let vals = $('inAccCats').value.split(',').map(s => s.trim()).filter(s => s);
        if(vals.length > 0) {
            accCats = vals;
            sv('accCats', accCats);
            toast(L==='ar' ? '✅ تم تحديث البيانات بنجاح!' : '✅ Data Updated!');
            render();
        } else {
            toast(L==='ar'?'لا يمكن ترك الفئات فارغة!':'Categories cannot be empty!');
        }
    };
}
















/* ==========================================================================
   ENTERPRISE V8 CRASH-PROOF ENHANCEMENTS (SAFE STATIC HELPERS)
   ========================================================================== */

// 1. Full-Page Kanban Tasks Board (Enterprise V8 - Drag & Drop)
window.rTodo = function() {
    let todos = [];
    try { 
        let raw = localStorage.getItem('sp_todos');
        if (raw) todos = JSON.parse(raw);
    } catch(e) {}
    if (!Array.isArray(todos)) todos = [];
    
    // Migrate old format (done: boolean) to new format (status: 'todo' | 'in_progress' | 'done')
    let migrated = false;
    todos = todos.map(t => {
        if (t && typeof t.done !== 'undefined') {
            migrated = true;
            let status = t.done ? 'done' : 'todo';
            return { text: t.text, status: status };
        }
        return t;
    });
    if (migrated) localStorage.setItem('sp_todos', JSON.stringify(todos));

    let html = `<div class="ph">
        <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">${ICONS.todo || '📋'}</span> ${t('todo')}</h1>
    </div>
    
    <div class="card" style="margin:0 auto 24px;padding:28px;background:var(--bg2);border-radius:16px;box-shadow:0 6px 16px rgba(0,0,0,0.06);border:1px solid var(--bd);">
        <div style="display:flex;gap:12px;">
            <input type="text" id="newTodoInput" class="inp" placeholder="${L==='ar'?'أدخل مهمة جديدة هنا...':'Enter new task here...'}" style="flex:1;padding:14px 18px;font-size:1.05rem;border-radius:12px;border:1px solid var(--bd);background:var(--bg1);color:var(--tx1);" onkeydown="if(event.key==='Enter') addTodoItem()">
            <button class="btn btn-p" onclick="addTodoItem()" style="padding:0 28px;font-size:1.05rem;font-weight:bold;border-radius:12px;display:flex;align-items:center;gap:8px;background:var(--ac);color:#fff;cursor:pointer;">
                <span style="font-size:1.4rem;">+</span> ${L==='ar'?'إضافة':'Add'}
            </button>
        </div>
    </div>`;

    // Render Kanban Board
    html += `<div class="kanban-board">`;
    
    const cols = [
        { id: 'todo', titleAr: 'قيد الانتظار', titleEn: 'To Do', color: 'var(--am)' },
        { id: 'in_progress', titleAr: 'قيد التنفيذ', titleEn: 'In Progress', color: 'var(--ac)' },
        { id: 'done', titleAr: 'مكتملة', titleEn: 'Done', color: 'var(--gn)' }
    ];

    cols.forEach(col => {
        let colTasks = todos.map((t, idx) => ({...t, origIdx: idx})).filter(t => t.status === col.id);
        
        html += `
        <div class="kanban-col">
            <div class="kanban-col-header">
                <span style="display:flex;align-items:center;gap:8px;">
                    <span style="width:12px;height:12px;border-radius:50%;background:${col.color};"></span>
                    ${L==='ar' ? col.titleAr : col.titleEn}
                </span>
                <span class="kanban-count">${colTasks.length}</span>
            </div>
            <div class="kanban-dropzone" id="dz-${col.id}" ondragover="kbDragOver(event)" ondragleave="kbDragLeave(event)" ondrop="kbDrop(event, '${col.id}')">
        `;
        
        if (colTasks.length === 0) {
            html += `<div style="text-align:center;color:var(--tx2);padding:20px 0;font-size:0.9rem;opacity:0.6;">${L==='ar'?'اسحب المهام هنا':'Drop tasks here'}</div>`;
        }

        colTasks.forEach(task => {
            html += `
            <div class="kanban-card" draggable="true" ondragstart="kbDragStart(event, ${task.origIdx})" id="task-${task.origIdx}">
                <div class="kanban-card-text">${task.text}</div>
                <div class="kanban-card-actions">
                    <button class="kanban-btn" onclick="deleteTodoItem(${task.origIdx})" title="${L==='ar'?'حذف':'Delete'}">🗑️</button>
                </div>
            </div>
            `;
        });
        
        html += `</div></div>`;
    });

    html += `</div>`;
    
    let elM = $('M');
    if (elM) elM.innerHTML = html;
};

// Kanban Drag and Drop Logic
window.kbDragStart = function(ev, idx) {
    ev.dataTransfer.setData('text/plain', idx);
    setTimeout(() => {
        document.getElementById('task-' + idx).classList.add('dragging');
    }, 0);
};
window.kbDragOver = function(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add('drag-over');
};
window.kbDragLeave = function(ev) {
    ev.currentTarget.classList.remove('drag-over');
};
window.kbDrop = function(ev, newStatus) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    let idx = ev.dataTransfer.getData('text/plain');
    if(idx !== '') {
        updateTodoStatus(parseInt(idx, 10), newStatus);
    }
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
    if(!input || !input.value.trim()) {
        if(typeof toast==='function') toast(L==='ar'?'الرجاء إدخال اسم المهمة':'Please enter a task name', 'error');
        return;
    }
    let todos = [];
    try { 
        let raw = localStorage.getItem('sp_todos');
        if (raw) todos = JSON.parse(raw);
    } catch(e) {}
    if (!Array.isArray(todos)) todos = [];
    
    todos.push({ text: input.value.trim(), status: 'todo' });
    localStorage.setItem('sp_todos', JSON.stringify(todos));
    input.value = '';
    
    if (typeof rTodo === 'function') rTodo();
    else if (typeof initTodoUI === 'function') initTodoUI();
    
    if(typeof toast==='function') toast(L==='ar'?'تمت إضافة المهمة بنجاح':'Task added', 'success');
};

window.deleteTodoItem = function(idx) {
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    todos.splice(idx, 1);
    localStorage.setItem('sp_todos', JSON.stringify(todos));
    if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
    else initTodoUI();
    if(typeof toast==='function') toast(L==='ar'?'تم حذف المهمة':'Task deleted', 'warning');
};

window.updateTodoStatus = function(idx, newStatus) {
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    if(todos[idx]) {
        todos[idx].status = newStatus;
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

        if(P === 'sales' || P === 'customers' || P === 'collections') {
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




// js/settings.js

function rSettings() {
    $('M').innerHTML = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;">
                <span style="width:32px;height:32px;display:flex;">⚙️</span> ${t('settings')}
            </h1>
            <p>${L==='ar'?'تخصيص ألوان التطبيق، والواجهة، وإعدادات المزامنة':'Customize app colors, interface, and sync settings'}</p>
        </div>
        
        <div class="card" style="margin-bottom:20px;">
            <h3>🎨 ${L==='ar'?'اللون الأساسي':'Primary Color'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'اختر اللون الذي يناسب ذوقك':'Choose the color that fits you'}</p>
            
            <div style="display:flex;gap:12px;flex-wrap:wrap;" id="colorPicker">
                ${CL.map((color, i) => `
                    <div class="color-btn" data-color="${color}" style="width:40px;height:40px;border-radius:50%;background-color:${color};cursor:pointer;border:2px solid ${ld('sp_primary')===color?'var(--tx1)':'transparent'};transition:all 0.2s;"></div>
                `).join('')}
            </div>
        </div>
        
                <div class="card" style="margin-bottom:20px;">
            <h3>Aa ${L==='ar'?'الخطوط والمظهر':'Typography & Appearance'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'تغيير حجم ونوع الخط في التطبيق':'Change app font size and family'}</p>
            <div style="display:flex;gap:15px;flex-wrap:wrap;">
                <div style="flex:1;min-width:200px;">
                    <label style="display:block;margin-bottom:5px;font-size:0.9rem;">${L==='ar'?'حجم الخط':'Font Size'}</label>
                    <select onchange="if(window.setAppFontSize) window.setAppFontSize(this.value);" class="sbox" style="width:100%;padding:10px;">
                        <option value="0" ${localStorage.getItem('sp_font_size')==='0'?'selected':''}>${L==='ar'?'عادي (15px)':'Normal (15px)'}</option>
                        <option value="1" ${localStorage.getItem('sp_font_size')==='1'?'selected':''}>${L==='ar'?'متوسط (16px)':'Medium (16px)'}</option>
                        <option value="2" ${localStorage.getItem('sp_font_size')==='2'?'selected':''}>${L==='ar'?'كبير (18px)':'Large (18px)'}</option>
                        <option value="3" ${localStorage.getItem('sp_font_size')==='3'?'selected':''}>${L==='ar'?'ضخم (20px)':'Huge (20px)'}</option>
                    </select>
                </div>
                <div style="flex:1;min-width:200px;">
                    <label style="display:block;margin-bottom:5px;font-size:0.9rem;">${L==='ar'?'نوع الخط':'Font Family'}</label>
                    <select onchange="if(window.setAppFontFamily) window.setAppFontFamily(this.value);" class="sbox" style="width:100%;padding:10px;">
                        <option value="Tajawal" ${localStorage.getItem('sp_font_family')==='Tajawal'?'selected':''}>Tajawal</option>
                        <option value="Cairo" ${localStorage.getItem('sp_font_family')==='Cairo'?'selected':''}>Cairo</option>
                        <option value="Almarai" ${localStorage.getItem('sp_font_family')==='Almarai'?'selected':''}>Almarai</option>
                        <option value="Outfit" ${localStorage.getItem('sp_font_family')==='Outfit'?'selected':''}>Outfit</option>
                    </select>
                </div>
            </div>
        </div>

<div class="card" style="margin-bottom:20px;">
            <h3>☁️ ${L==='ar'?'النسخ الاحتياطي السحابي (Google Drive)':'Cloud Sync (Google Drive)'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'حفظ البيانات واسترجاعها مباشرة من حسابك في جوجل درايف.':'Backup and restore data directly from your Google Drive.'}</p>
            
            <div style="background:var(--bg3);padding:10px;border-radius:8px;margin-bottom:15px;">
                <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:10px;">${L==='ar'?'تحتاج إلى إدخال مفاتيح Google API لكي تعمل المزامنة:':'You must enter Google API keys for sync to work:'}</p>
                <input type="text" id="gdriveClientId" placeholder="Google Client ID" class="sbox" style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('gdrive_client_id') || ''}">
                <input type="text" id="gdriveApiKey" placeholder="Google API Key" class="sbox" style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('gdrive_api_key') || ''}">
                <button class="btn btn-p" onclick="saveDriveKeys()" style="width:100%;">${L==='ar'?'حفظ مفاتيح جوجل':'Save Google Keys'}</button>
            </div>

            <div id="driveStatus" style="font-size:0.85rem;color:var(--tx2);margin-bottom:16px;padding:10px;background:var(--bg3);border-radius:8px;">⏳ ${L==='ar'?'جاري التحقق...':'Checking...'}</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn btn-p" onclick="backupToGoogleDrive()" style="flex:1;min-width:140px;background:var(--ok);">
                    ☁️ ${L==='ar'?'حفظ في درايف':'Save to Drive'}
                </button>
                <button class="btn" onclick="restoreFromGoogleDrive()" style="flex:1;min-width:140px;background:var(--bg3);">
                    📂 ${L==='ar'?'استرجاع من درايف':'Restore from Drive'}
                </button>
            </div>
        </div>

        <div class="card" style="margin-bottom:20px;">
            <h3>🤖 ${L==='ar'?'إعدادات المساعد الذكي (Gemini AI)':'Gemini AI Settings'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'أدخل مفتاح Gemini API لتفعيل المساعد الذكي':'Enter Gemini API key to enable smart assistant'}</p>
            <div class="fg">
                <input type="text" id="geminiApiKey" placeholder="${L==='ar'?'Gemini API Key':'Gemini API Key'}" class="sbox" style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('gemini_api_key') || ''}">
            </div>
            <button class="btn btn-p" onclick="saveGeminiKey()">${L==='ar'?'حفظ المفتاح':'Save Key'}</button>
        </div>
        
        <div class="card" style="margin-bottom:20px; border-top: 4px solid #10b981;">
            <h3 style="display:flex;align-items:center;gap:8px;">📧 ${L==='ar'?'التقرير اليومي التلقائي للإيميل (المبيعات والتحصيلات والعملاء)':'Automated Daily Email Report'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">
                ${L==='ar'?'إرسال ملخص يومي تلقائي إلى بريدك الإلكتروني بكل ما حدث في النظام من مبيعات، تحصيل، وأداء العملاء دون أي عناء أو تدخل يدوي.':'Automatically send a daily summary to your email with all sales, collections, and customer activity.'}
            </p>
            
            <div style="background:var(--bg3);padding:14px;border-radius:10px;margin-bottom:15px;border:1px solid var(--bd);">
                <div style="margin-bottom:12px;">
                    <label style="font-size:0.85rem;font-weight:bold;display:block;margin-bottom:6px;">${L==='ar'?'البريد الإلكتروني المستلم (الخاص بك):':'Recipient Email Address:'}</label>
                    <input type="email" id="repEmailInput" placeholder="name@example.com" class="sbox" style="width:100%;padding:10px;border-radius:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_report_email') || (typeof currentUser !== 'undefined' && currentUser ? currentUser.email : '')}">
                </div>
                
                <div style="margin-bottom:12px;">
                    <label style="font-size:0.85rem;font-weight:bold;display:flex;align-items:center;gap:8px;cursor:pointer;">
                        <input type="checkbox" id="repAutoChk" style="width:18px;height:18px;" ${localStorage.getItem('sp_report_auto') !== 'false' ? 'checked' : ''}>
                        <span>${L==='ar'?'تفعيل الإرسال التلقائي يومياً عند فتح التطبيق في الخلفية':'Enable automatic daily send when opening app'}</span>
                    </label>
                    <p style="font-size:0.75rem;color:var(--tx2);margin-top:4px;padding-right:26px;">
                        ${L==='ar'?'سيقوم التطبيق بالتحقق مرة واحدة يومياً عند فتحه أو تشغيله وإرسال تقرير المبيعات والتحصيلات تلقائياً في الخلفية بكل أمان.':'The app will check once a day when opened and automatically send sales and collections report in the background.'}
                    </p>
                </div>
                
                <div style="margin-bottom:12px;">
                    <label style="font-size:0.85rem;font-weight:bold;display:block;margin-bottom:6px;">${L==='ar'?'خدمة الإرسال (Sending Service):':'Sending Service:'}</label>
                    <select id="repServiceSel" class="sbox" style="width:100%;padding:8px;border-radius:8px;" onchange="toggleEmailServiceFields()">
                        <option value="formsubmit" ${(localStorage.getItem('sp_report_service')||'formsubmit')==='formsubmit'?'selected':''}>FormSubmit.co (${L==='ar'?'الأسهل - إرسال مباشر ومجاني دون إعدادات':'Easiest - Free, No API keys needed'})</option>
                        <option value="emailjs" ${(localStorage.getItem('sp_report_service')||'formsubmit')==='emailjs'?'selected':''}>EmailJS (${L==='ar'?'احترافي - يتطلب حساب في emailjs.com':'Professional - Requires EmailJS account'})</option>
                        <option value="webhook" ${(localStorage.getItem('sp_report_service')||'formsubmit')==='webhook'?'selected':''}>Custom Webhook / Google Script (${L==='ar'?'رابط ويب هوك مخصص':'Custom Webhook URL'})</option>
                    </select>
                </div>

                <div id="emailjsFields" style="display:${(localStorage.getItem('sp_report_service')||'formsubmit')==='emailjs'?'block':'none'};background:var(--bg);padding:10px;border-radius:8px;margin-bottom:12px;border:1px dashed var(--bd);">
                    <p style="font-size:0.75rem;color:var(--tx2);margin-bottom:8px;">${L==='ar'?'أدخل بيانات حسابك في EmailJS:':'Enter your EmailJS credentials:'}</p>
                    <input type="text" id="ejsServiceId" placeholder="Service ID (e.g., service_xxx)" class="sbox" style="width:100%;margin-bottom:8px;padding:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_emailjs_service_id')||''}">
                    <input type="text" id="ejsTemplateId" placeholder="Template ID (e.g., template_xxx)" class="sbox" style="width:100%;margin-bottom:8px;padding:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_emailjs_template_id')||''}">
                    <input type="text" id="ejsPublicKey" placeholder="Public Key / User ID (e.g., xxxxxxxx)" class="sbox" style="width:100%;padding:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_emailjs_public_key')||''}">
                </div>

                <div id="webhookFields" style="display:${(localStorage.getItem('sp_report_service')||'formsubmit')==='webhook'?'block':'none'};background:var(--bg);padding:10px;border-radius:8px;margin-bottom:12px;border:1px dashed var(--bd);">
                    <p style="font-size:0.75rem;color:var(--tx2);margin-bottom:8px;">${L==='ar'?'رابط الويب هوك أو Google Apps Script:':'Webhook or Google Apps Script URL:'}</p>
                    <input type="text" id="repWebhookUrl" placeholder="https://script.google.com/macros/s/..." class="sbox" style="width:100%;padding:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_webhook_url')||''}">
                </div>

                <button class="btn btn-p" onclick="saveEmailReportSettings()" style="width:100%;padding:10px;font-weight:bold;">
                    💾 ${L==='ar'?'حفظ إعدادات التقرير اليومي':'Save Report Settings'}
                </button>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn btn-p" onclick="sendDailyReportNow(false)" style="flex:1;min-width:180px;background:#10b981;color:#fff;font-weight:bold;padding:12px;">
                    🚀 ${L==='ar'?'إرسال تقرير المبيعات والتحصيلات الآن (فوري)':'Send Sales & Collections Report Now'}
                </button>
                <button class="btn" onclick="previewDailyReportModal()" style="flex:1;min-width:140px;background:var(--bg3);padding:12px;">
                    👁️ ${L==='ar'?'معاينة محتوى التقرير':'Preview Report Content'}
                </button>
            </div>
            <div id="emailSendStatus" style="margin-top:12px;font-size:0.85rem;font-weight:bold;text-align:center;"></div>
        </div>

        <div class="card">
            <h3>👤 ${L==='ar'?'الملف الشخصي':'Profile'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${typeof currentUser !== 'undefined' && currentUser ? currentUser.email : 'Not logged in'}</p>
            <button class="btn btn-p" onclick="logout()" style="background:var(--rd)">${t('logout')}</button>
        </div>
    `;

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.onclick = () => {
            let col = btn.getAttribute('data-color');
            sv('sp_primary', col);
            document.documentElement.style.setProperty('--am', col);
            document.querySelectorAll('.color-btn').forEach(b => b.style.border = '2px solid transparent');
            btn.style.border = '2px solid var(--tx1)';
        };
    });

    // Load cloud backup info
    if (typeof window.getCloudInfo === 'function') {
        window.getCloudInfo().then(info => {
            let ds = document.getElementById('driveStatus');
            if (!ds) return;
            if (!info) {
                ds.innerHTML = L==='ar' ? '⚠️ لم تقم بعمل مزامنة في جوجل درايف مؤخراً.' : '⚠️ No recent Google Drive sync.';
                return;
            }
            ds.innerHTML = `✅ <strong>${L==='ar'?'آخر مزامنة:':'Last sync:'}</strong> ${info.lastUpdated}
                &nbsp;|&nbsp; 📊 ${L==='ar'?'المبيعات:':'Sales:'} ${info.salesCount}
                &nbsp;|&nbsp; 💰 ${L==='ar'?'التحصيلات:':'Collections:'} ${info.payCount}`;
        });
    }
}

window.saveDriveKeys = function() {
    const cId = document.getElementById('gdriveClientId').value.trim();
    const aKey = document.getElementById('gdriveApiKey').value.trim();
    if (cId && aKey) {
        localStorage.setItem('gdrive_client_id', cId);
        localStorage.setItem('gdrive_api_key', aKey);
        if(typeof toast === 'function') toast(L==='ar'?'✅ تم حفظ مفاتيح جوجل درايف بنجاح.':'Google Drive keys saved', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } else {
        if(typeof toast === 'function') toast(L==='ar'?'❌ يرجى إدخال المفتاحين (Client ID و API Key)':'Please enter both keys', 'error');
    }
};

window.saveGeminiKey = function() {
    const gKey = document.getElementById('geminiApiKey').value.trim();
    if (gKey) {
        localStorage.setItem('gemini_api_key', gKey);
        if(typeof toast === 'function') toast(L==='ar'?'تم حفظ مفتاح Gemini بنجاح':'Gemini key saved', 'success');
    } else {
        if(typeof toast === 'function') toast(L==='ar'?'يرجى إدخال المفتاح أولاً':'Please enter the key', 'error');
    }
};

window.toggleEmailServiceFields = function() {
    let sel = document.getElementById('repServiceSel');
    let ejs = document.getElementById('emailjsFields');
    let webh = document.getElementById('webhookFields');
    if (ejs) ejs.style.display = sel && sel.value === 'emailjs' ? 'block' : 'none';
    if (webh) webh.style.display = sel && sel.value === 'webhook' ? 'block' : 'none';
};

window.saveEmailReportSettings = function() {
    let email = (document.getElementById('repEmailInput') ? document.getElementById('repEmailInput').value.trim() : '');
    let auto = (document.getElementById('repAutoChk') ? document.getElementById('repAutoChk').checked : true);
    let service = (document.getElementById('repServiceSel') ? document.getElementById('repServiceSel').value : 'formsubmit');
    
    if (!email) {
        if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '❌ يرجى إدخال البريد الإلكتروني أولاً' : 'Please enter an email address', 'error');
        return;
    }
    
    localStorage.setItem('sp_report_email', email);
    localStorage.setItem('sp_report_auto', auto ? 'true' : 'false');
    localStorage.setItem('sp_report_service', service);
    
    if (service === 'emailjs') {
        let sid = document.getElementById('ejsServiceId') ? document.getElementById('ejsServiceId').value.trim() : '';
        let tid = document.getElementById('ejsTemplateId') ? document.getElementById('ejsTemplateId').value.trim() : '';
        let pkey = document.getElementById('ejsPublicKey') ? document.getElementById('ejsPublicKey').value.trim() : '';
        localStorage.setItem('sp_emailjs_service_id', sid);
        localStorage.setItem('sp_emailjs_template_id', tid);
        localStorage.setItem('sp_emailjs_public_key', pkey);
    } else if (service === 'webhook') {
        let wurl = document.getElementById('repWebhookUrl') ? document.getElementById('repWebhookUrl').value.trim() : '';
        localStorage.setItem('sp_webhook_url', wurl);
    }
    
    if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '✅ تم حفظ إعدادات التقرير اليومي بنجاح' : 'Report settings saved successfully', 'success');
};

window.generateDailyReportData = function() {
    try {
        let sList = typeof window.S !== 'undefined' ? window.S : (typeof ld === 'function' ? ld('salesData') || [] : []);
        let cList = typeof window.C !== 'undefined' ? window.C : (typeof ld === 'function' ? ld('payData') || [] : []);
        let tList = typeof window.T !== 'undefined' ? window.T : (typeof ld === 'function' ? ld('targetData') || [] : []);
        
        let allDates = [];
        sList.forEach(r => {
            let d = typeof pd === 'function' ? pd(r['Order Date'] || r['Invoice Date']) : null;
            if (d && d.length === 10) allDates.push(d);
        });
        cList.forEach(r => {
            let d = typeof pd === 'function' ? pd(r['Date'] || r['Payment Date'] || r['Collection Date'] || r['Order Date']) : null;
            if (d && d.length === 10) allDates.push(d);
        });
        allDates.sort();
        
        let todayStr = new Date().toISOString().slice(0, 10);
        let latestDateStr = allDates.length > 0 ? allDates[allDates.length - 1] : todayStr;
        
        let totSales = 0, totProfit = 0, totTarget = 0, totColl = 0, accColl = 0, hwColl = 0;
        let custMap = {}, itemMap = {};
        
        sList.forEach(r => {
            let sv = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales After Discount'] || r['Amount'] || 0);
            let pv = typeof getProfitVal === 'function' ? getProfitVal(r) : Number(r['Profit'] || 0);
            totSales += sv;
            totProfit += pv;
            
            let c = r.Customer || r['Customer Name'] || 'عميل غير محدد';
            if (!custMap[c]) custMap[c] = 0;
            custMap[c] += sv;
            
            let itm = r['Item Description'] || 'صنف غير محدد';
            if (!itemMap[itm]) itemMap[itm] = 0;
            itemMap[itm] += sv;
        });
        
        tList.forEach(r => { totTarget += Number(r.Target) || 0; });
        
        cList.forEach(r => {
            let cv = typeof getPayVal === 'function' ? getPayVal(r) : Number(r['Amount'] || r['Collection'] || 0);
            totColl += cv;
            let ref = (r['Payment Ref.'] || r['Payment Ref'] || '').toString().trim().toLowerCase();
            let cat = r['Item Class Name'] || r['Category'] || '';
            if (ref.startsWith('acc') || (typeof isAcc === 'function' && isAcc(cat))) accColl += cv;
            else hwColl += cv;
        });
        
        let marginPct = totSales > 0 ? (totProfit / totSales * 100) : 0;
        let achPct = totTarget > 0 ? (totSales / totTarget * 100) : 0;
        
        // Activity for latest recorded date
        let daySales = 0, dayProfit = 0, dayActiveCusts = {};
        sList.forEach(r => {
            let d = typeof pd === 'function' ? pd(r['Order Date'] || r['Invoice Date']) : null;
            if (d === latestDateStr) {
                daySales += (typeof getSalesVal === 'function' ? getSalesVal(r) : 0);
                dayProfit += (typeof getProfitVal === 'function' ? getProfitVal(r) : 0);
                if (r.Customer) dayActiveCusts[r.Customer] = 1;
            }
        });
        let dayColl = 0;
        cList.forEach(r => {
            let d = typeof pd === 'function' ? pd(r['Date'] || r['Payment Date'] || r['Collection Date'] || r['Order Date']) : null;
            if (d === latestDateStr) {
                dayColl += (typeof getPayVal === 'function' ? getPayVal(r) : Number(r['Amount'] || 0));
                if (r['Customer Name'] || r['Customer']) dayActiveCusts[r['Customer Name'] || r['Customer']] = 1;
            }
        });
        
        let topCusts = Object.entries(custMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
        let topCustsText = topCusts.map((c, i) => `${i+1}. ${c[0]} (${typeof fmt==='function'?fmt(c[1]):c[1]} ج.م)`).join(' | ') || 'لا يوجد';
        
        let topItems = Object.entries(itemMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
        let topItemsText = topItems.map((it, i) => `${i+1}. ${it[0]} (${typeof fmt==='function'?fmt(it[1]):it[1]} ج.م)`).join(' | ') || 'لا يوجد';
        
        let recentColls = cList.slice(0, 5).map(r => `${r['Customer Name']||r['Customer']||'عميل'}: ${typeof fmt==='function'?fmt(typeof getPayVal==='function'?getPayVal(r):r['Amount']||0):0} ج.م`).join(' | ') || 'لا يوجد';
        let totalCustomersCount = Object.keys(custMap).length;
        let dayActiveCustCount = Object.keys(dayActiveCusts).length;
        
        return {
            todayStr, latestDateStr, totSales, totProfit, totTarget, totColl, accColl, hwColl,
            marginPct, achPct, daySales, dayProfit, dayColl, dayActiveCustCount,
            totalCustomersCount, topCustsText, topItemsText, recentCollsText: recentColls,
            topCusts, topItems, recentCollsArr: cList.slice(0, 5)
        };
    } catch(e) {
        console.error('Error generating report data:', e);
        return {
            todayStr: new Date().toISOString().slice(0,10), latestDateStr: 'N/A',
            totSales: 0, totProfit: 0, totTarget: 0, totColl: 0, accColl: 0, hwColl: 0,
            marginPct: 0, achPct: 0, daySales: 0, dayProfit: 0, dayColl: 0, dayActiveCustCount: 0,
            totalCustomersCount: 0, topCustsText: 'لا يوجد', topItemsText: 'لا يوجد', recentCollsText: 'لا يوجد',
            topCusts: [], topItems: [], recentCollsArr: []
        };
    }
};

window.sendDailyReportNow = function(isAuto = false) {
    try {
        let repEmail = localStorage.getItem('sp_report_email') || (typeof currentUser !== 'undefined' && currentUser ? currentUser.email : '');
        if (!repEmail) {
            if (!isAuto) {
                if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '❌ يرجى إدخال إيميل استلام التقارير في صفحة الإعدادات أولاً' : 'Please enter recipient email in Settings first', 'error');
                if (typeof P !== 'undefined' && P !== 'settings') {
                    if (confirm(typeof L !== 'undefined' && L === 'ar' ? 'لم تقم بإدخال بريدك الإلكتروني لاستلام التقرير اليومي. هل تود الانتقال لصفحة الإعدادات الآن؟' : 'No email set for daily reports. Go to Settings now?')) {
                        P = 'settings';
                        if (typeof buildNav === 'function') buildNav();
                        if (typeof render === 'function') render();
                    }
                }
            }
            return;
        }

        let statusEl = document.getElementById('emailSendStatus');
        if (!isAuto && statusEl) {
            statusEl.innerHTML = `<span style="color:var(--am);">⏳ ${typeof L !== 'undefined' && L === 'ar' ? 'جاري إعداد وإرسال التقرير اليومي إلى' : 'Sending daily report to'} ${repEmail}...</span>`;
        }
        if (!isAuto && typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '⏳ جاري إرسال التقرير إلى بريدك...' : 'Sending report...', 'info');

        let data = window.generateDailyReportData();
        let service = localStorage.getItem('sp_report_service') || 'formsubmit';
        
        let subject = `📊 تقرير Sales Pro اليومي الشامل - ${data.todayStr}`;
        let fFunc = typeof fmt === 'function' ? fmt : (n) => n;
        let pFunc = typeof pc === 'function' ? pc : (n) => n + '%';
        
        let payload = {
            "_subject": subject,
            "_template": "table",
            "📅 تاريخ التقرير": data.todayStr,
            "🕒 أحدث نشاط مسجل في النظام": data.latestDateStr,
            "💰 إجمالي المبيعات الشامل": `${fFunc(data.totSales)} ج.م`,
            "💵 إجمالي الأرباح": `${fFunc(data.totProfit)} ج.م (هامش ربح: ${pFunc(data.marginPct)})`,
            "🎯 التارجت الإجمالي ونسبة التحقيق": `${fFunc(data.totTarget)} ج.م (${pFunc(data.achPct)})`,
            "🪙 إجمالي التحصيلات": `${fFunc(data.totColl)} ج.م (إكسسوارات: ${fFunc(data.accColl)} | هاردوير: ${fFunc(data.hwColl)})`,
            "👥 عدد العملاء الإجمالي": `${data.totalCustomersCount} عميل (نشط في آخر نشاط: ${data.dayActiveCustCount})`,
            "📈 مبيعات اليوم / النشاط الأخير": `${fFunc(data.daySales)} ج.م (أرباح: ${fFunc(data.dayProfit)} ج.م)`,
            "💵 تحصيلات اليوم / النشاط الأخير": `${fFunc(data.dayColl)} ج.م`,
            "🏆 أفضل العملاء مبيعاً": data.topCustsText,
            "📦 أكثر الأصناف مبيعاً": data.topItemsText,
            "💰 أحدث عمليات التحصيل": data.recentCollsText,
            "ℹ️ نظام الإرسال": "تم إنشاء وإرسال هذا التقرير تلقائياً من تطبيق Sales Pro Enterprise"
        };

        if (service === 'formsubmit') {
            fetch('https://formsubmit.co/ajax/' + encodeURIComponent(repEmail), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(resData => {
                console.log('[Daily Report Sent]:', resData);
                localStorage.setItem('sp_report_last_sent_date', data.todayStr);
                if (!isAuto) {
                    if (statusEl) statusEl.innerHTML = `<span style="color:var(--ok);">✅ ${typeof L !== 'undefined' && L === 'ar' ? 'تم إرسال التقرير بنجاح إلى' : 'Report sent successfully to'} <strong>${repEmail}</strong>! <br><small style="color:var(--tx2);">(ملاحظة: إذا كان هذا أول إرسال، يرجى فحص صندوق الوارد أو Spam وتفعيل الرابط المرسل من FormSubmit مرة واحدة)</small></span>`;
                    if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '✅ تم إرسال التقرير بنجاح إلى إيميلك' : 'Report sent successfully', 'success');
                } else {
                    if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '📧 تم إرسال تقرير المبيعات والتحصيلات اليومي إلى إيميلك' : 'Automated daily report sent to email', 'success');
                }
            })
            .catch(err => {
                console.error('[Daily Report Error]:', err);
                if (!isAuto) {
                    if (statusEl) statusEl.innerHTML = `<span style="color:var(--rd);">❌ ${typeof L !== 'undefined' && L === 'ar' ? 'حدث خطأ أثناء الإرسال:' : 'Error sending report:'} ${err.message}</span>`;
                    if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '❌ حدث خطأ في إرسال التقرير' : 'Error sending report', 'error');
                }
            });
        } else if (service === 'emailjs') {
            let sid = localStorage.getItem('sp_emailjs_service_id');
            let tid = localStorage.getItem('sp_emailjs_template_id');
            let pkey = localStorage.getItem('sp_emailjs_public_key');
            if (!sid || !tid || !pkey) {
                if (!isAuto && typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '❌ يرجى إدخال بيانات EmailJS في الإعدادات' : 'Please enter EmailJS credentials in Settings', 'error');
                return;
            }
            fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: sid,
                    template_id: tid,
                    user_id: pkey,
                    template_params: {
                        to_email: repEmail,
                        subject: subject,
                        report_date: data.todayStr,
                        latest_date: data.latestDateStr,
                        total_sales: fFunc(data.totSales),
                        total_profit: fFunc(data.totProfit),
                        margin_pct: pFunc(data.marginPct),
                        target_achieved: pFunc(data.achPct),
                        total_collections: fFunc(data.totColl),
                        active_customers: data.dayActiveCustCount,
                        top_customers: data.topCustsText,
                        top_items: data.topItemsText,
                        message: `تقرير Sales Pro لليوم ${data.todayStr}: إجمالي المبيعات ${fFunc(data.totSales)} ج.م | إجمالي التحصيلات ${fFunc(data.totColl)} ج.م | تحقيق التارجت ${pFunc(data.achPct)}`
                    }
                })
            })
            .then(res => {
                if (!res.ok) throw new Error('EmailJS HTTP status ' + res.status);
                localStorage.setItem('sp_report_last_sent_date', data.todayStr);
                if (!isAuto) {
                    if (statusEl) statusEl.innerHTML = `<span style="color:var(--ok);">✅ تم إرسال التقرير بنجاح عبر EmailJS إلى ${repEmail}</span>`;
                    if (typeof toast === 'function') toast('✅ تم إرسال التقرير عبر EmailJS بنجاح', 'success');
                } else {
                    if (typeof toast === 'function') toast('📧 تم إرسال التقرير التلقائي عبر EmailJS', 'success');
                }
            })
            .catch(err => {
                console.error('[EmailJS Error]:', err);
                if (!isAuto && typeof toast === 'function') toast('❌ خطأ في إرسال EmailJS: ' + err.message, 'error');
            });
        } else if (service === 'webhook') {
            let wurl = localStorage.getItem('sp_webhook_url');
            if (!wurl) {
                if (!isAuto && typeof toast === 'function') toast('❌ يرجى إدخال رابط الويب هوك في الإعدادات', 'error');
                return;
            }
            fetch(wurl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ email: repEmail, reportData: data, timestamp: new Date().toISOString() })
            })
            .then(res => {
                localStorage.setItem('sp_report_last_sent_date', data.todayStr);
                if (!isAuto) {
                    if (statusEl) statusEl.innerHTML = `<span style="color:var(--ok);">✅ تم إرسال التقرير بنجاح عبر الويب هوك</span>`;
                    if (typeof toast === 'function') toast('✅ تم إرسال التقرير عبر الويب هوك بنجاح', 'success');
                }
            })
            .catch(err => {
                console.error('[Webhook Error]:', err);
                if (!isAuto && typeof toast === 'function') toast('❌ خطأ في إرسال الويب هوك', 'error');
            });
        }
    } catch(err) {
        console.error('[sendDailyReportNow Exception]:', err);
    }
};

window.previewDailyReportModal = function() {
    let data = window.generateDailyReportData();
    let fFunc = typeof fmt === 'function' ? fmt : (n) => n;
    let pFunc = typeof pc === 'function' ? pc : (n) => n + '%';
    
    let topCustRows = (data.topCusts || []).map((c, i) => `<tr><td style="padding:6px;border-bottom:1px solid #334155;">#${i+1}</td><td style="padding:6px;border-bottom:1px solid #334155;">${c[0]}</td><td style="padding:6px;border-bottom:1px solid #334155;color:#60a5fa;font-weight:bold;">${fFunc(c[1])} ج.م</td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center;padding:10px;">لا يوجد بيانات</td></tr>';
    let topItemRows = (data.topItems || []).map((it, i) => `<tr><td style="padding:6px;border-bottom:1px solid #334155;">#${i+1}</td><td style="padding:6px;border-bottom:1px solid #334155;">${it[0]}</td><td style="padding:6px;border-bottom:1px solid #334155;color:#34d399;font-weight:bold;">${fFunc(it[1])} ج.م</td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center;padding:10px;">لا يوجد بيانات</td></tr>';
    
    let htmlContent = `
    <div id="REP_MODAL" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;">
        <div style="background:#0f172a;color:#f8fafc;width:100%;max-width:650px;max-height:90vh;border-radius:16px;border:1px solid #334155;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5);direction:rtl;text-align:right;">
            <div style="padding:16px 20px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center;background:#1e293b;">
                <h3 style="margin:0;font-size:1.1rem;color:#60a5fa;display:flex;align-items:center;gap:8px;">👁️ معاينة التقرير اليومي الشامل</h3>
                <button onclick="closePreviewReportModal()" style="background:transparent;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer;">✖</button>
            </div>
            <div style="padding:20px;overflow-y:auto;flex:1;font-size:0.9rem;">
                <div style="background:#1e293b;padding:12px 16px;border-radius:10px;margin-bottom:16px;border-right:4px solid #3b82f6;">
                    <strong>📅 تاريخ اليوم:</strong> ${data.todayStr} | <strong>🕒 أحدث نشاط مسجل:</strong> ${data.latestDateStr}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                    <div style="background:#1e293b;padding:12px;border-radius:10px;border:1px solid #334155;text-align:center;">
                        <span style="font-size:0.75rem;color:#94a3b8;">💰 إجمالي المبيعات الشامل</span>
                        <div style="font-size:1.3rem;font-weight:bold;color:#60a5fa;margin-top:4px;">${fFunc(data.totSales)} ج.م</div>
                        <span style="font-size:0.75rem;color:#cbd5e1;">نشاط اليوم/الأخير: ${fFunc(data.daySales)} ج.م</span>
                    </div>
                    <div style="background:#1e293b;padding:12px;border-radius:10px;border:1px solid #334155;text-align:center;">
                        <span style="font-size:0.75rem;color:#94a3b8;">💵 إجمالي الأرباح</span>
                        <div style="font-size:1.3rem;font-weight:bold;color:#34d399;margin-top:4px;">${fFunc(data.totProfit)} ج.م</div>
                        <span style="font-size:0.75rem;color:#cbd5e1;">هامش: ${pFunc(data.marginPct)}</span>
                    </div>
                    <div style="background:#1e293b;padding:12px;border-radius:10px;border:1px solid #334155;text-align:center;">
                        <span style="font-size:0.75rem;color:#94a3b8;">🎯 التارجت ونسبة التحقيق</span>
                        <div style="font-size:1.3rem;font-weight:bold;color:#fbbf24;margin-top:4px;">${pFunc(data.achPct)}</div>
                        <span style="font-size:0.75rem;color:#cbd5e1;">الهدف: ${fFunc(data.totTarget)} ج.م</span>
                    </div>
                    <div style="background:#1e293b;padding:12px;border-radius:10px;border:1px solid #334155;text-align:center;">
                        <span style="font-size:0.75rem;color:#94a3b8;">🪙 إجمالي التحصيلات</span>
                        <div style="font-size:1.3rem;font-weight:bold;color:#a78bfa;margin-top:4px;">${fFunc(data.totColl)} ج.م</div>
                        <span style="font-size:0.75rem;color:#cbd5e1;">إكسسوار: ${fFunc(data.accColl)} | هارد: ${fFunc(data.hwColl)}</span>
                    </div>
                </div>
                <div style="background:#1e293b;padding:14px;border-radius:10px;margin-bottom:14px;border:1px solid #334155;">
                    <h4 style="margin:0 0 10px;color:#f8fafc;font-size:0.95rem;border-bottom:1px solid #334155;padding-bottom:6px;">🏆 أفضل العملاء مبيعاً</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
                        <tr style="color:#94a3b8;text-align:right;"><th style="padding:6px;">#</th><th style="padding:6px;">العميل</th><th style="padding:6px;">المبيعات</th></tr>
                        ${topCustRows}
                    </table>
                </div>
                <div style="background:#1e293b;padding:14px;border-radius:10px;border:1px solid #334155;">
                    <h4 style="margin:0 0 10px;color:#f8fafc;font-size:0.95rem;border-bottom:1px solid #334155;padding-bottom:6px;">📦 أكثر الأصناف مبيعاً</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
                        <tr style="color:#94a3b8;text-align:right;"><th style="padding:6px;">#</th><th style="padding:6px;">الصنف</th><th style="padding:6px;">المبيعات</th></tr>
                        ${topItemRows}
                    </table>
                </div>
            </div>
            <div style="padding:14px 20px;border-top:1px solid #334155;background:#1e293b;display:flex;gap:10px;justify-content:flex-end;">
                <button onclick="closePreviewReportModal(); sendDailyReportNow(false);" class="btn btn-p" style="background:#10b981;color:#fff;padding:8px 16px;font-weight:bold;">🚀 إرسال للإيميل الآن</button>
                <button onclick="closePreviewReportModal()" class="btn" style="background:#334155;color:#f8fafc;padding:8px 16px;">✖ إغلاق</button>
            </div>
        </div>
    </div>`;
    
    let el = document.createElement('div');
    el.innerHTML = htmlContent;
    document.body.appendChild(el.firstElementChild);
};

window.closePreviewReportModal = function() {
    let m = document.getElementById('REP_MODAL');
    if (m) m.remove();
};

window.checkAndSendDailyReport = function() {
    try {
        let isAuto = localStorage.getItem('sp_report_auto') !== 'false';
        if (!isAuto) return;
        
        let repEmail = localStorage.getItem('sp_report_email') || (typeof currentUser !== 'undefined' && currentUser ? currentUser.email : '');
        if (!repEmail) return;
        
        let todayStr = new Date().toISOString().slice(0, 10);
        let lastSent = localStorage.getItem('sp_report_last_sent_date');
        
        if (lastSent === todayStr) {
            console.log('[Daily Report]: Already sent for today (' + todayStr + ')');
            return;
        }
        
        console.log('[Daily Report]: Automatic trigger checking in for today (' + todayStr + ')...');
        // Small check to avoid sending if sales list is empty or still initializing
        let sList = typeof S !== 'undefined' ? S : JSON.parse(localStorage.getItem('salesData')||'[]');
        let cList = typeof C !== 'undefined' ? C : JSON.parse(localStorage.getItem('payData')||'[]');
        if (sList.length === 0 && cList.length === 0) {
            console.log('[Daily Report]: Waiting for data before sending...');
            return;
        }
        
        window.sendDailyReportNow(true);
    } catch(err) {
        console.error('[checkAndSendDailyReport Error]:', err);
    }
};

window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof checkAndSendDailyReport === 'function') {
            checkAndSendDailyReport();
        }
    }, 4500);
});





// js/app.js

const NAV = [
    {s:{ar:'الأساسية',en:'Core'}},
    {p:'dash',ic:'📊'},{p:'analytics',ic:'📈'},{p:'prospects',ic:'🔍'},{p:'sales',ic:'🧾'},{p:'targets',ic:'🎯'},{p:'personal',ic:'🤝'},
    {p:'customers',ic:'🏢'},{p:'todo',ic:'📋'},{p:'brands',ic:'📦'},
    {s:{ar:'الأقسام',en:'Depts'}},
    {p:'accessories',ic:'🎧'},{p:'hardware',ic:'📱'},{p:'collections',ic:'💸'},
    {s:{ar:'متقدم',en:'Advanced'}},
    {p:'potential',ic:'🚀'},{p:'profit',ic:'💰'},
    {p:'keyacc',ic:'👑'},{p:'dormant',ic:'😴'},
    {s:{ar:'ذكي',en:'Smart'}},
    {p:'ai',ic:'🤖'},{p:'alerts',ic:'🔔'},
    {s:{ar:'النظام',en:'System'}},
    {p:'account',ic:'👤'},{p:'backup',ic:'💾'},{p:'setup',ic:'📁'},{p:'reset',ic:'🔄'},
    {p:'settings',ic:'⚙️'}
];

const BNV = ['dash','customers','todo','analytics','settings'];

const F_URL = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/';
const getImg = (name) => `<img src="${F_URL}${name}" style="width:28px;height:28px;vertical-align:middle;object-fit:contain;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.22));">`;

const ICONS = {
    dash: getImg('Bar%20chart/3D/bar_chart_3d.png'),
    sales: getImg('Receipt/3D/receipt_3d.png'),
    targets: getImg('Bullseye/3D/bullseye_3d.png'),
    personal: getImg('Handshake/3D/handshake_3d.png'),
    customers: getImg('Department%20store/3D/department_store_3d.png'),
    todo: getImg('Clipboard/3D/clipboard_3d.png'),
    brands: getImg('Package/3D/package_3d.png'),
    accessories: getImg('Headphone/3D/headphone_3d.png'),
    hardware: getImg('Mobile%20phone/3D/mobile_phone_3d.png'),
    analytics: getImg('Chart%20increasing/3D/chart_increasing_3d.png'),
    potential: getImg('Rocket/3D/rocket_3d.png'),
    profit: getImg('Money%20bag/3D/money_bag_3d.png'),
    keyacc: getImg('Crown/3D/crown_3d.png'),
    dormant: getImg('Sleeping%20face/3D/sleeping_face_3d.png'),
    prospects: getImg('Magnifying%20glass%20tilted%20left/3D/magnifying_glass_tilted_left_3d.png'),
    ai: getImg('Robot/3D/robot_3d.png'),
    alerts: getImg('Bell/3D/bell_3d.png'),
    account: getImg('Bust%20in%20silhouette/3D/bust_in_silhouette_3d.png'),
    backup: getImg('Floppy%20disk/3D/floppy_disk_3d.png'),
    setup: getImg('File%20folder/3D/file_folder_3d.png'),
    reset: getImg('Wastebasket/3D/wastebasket_3d.png'),
    settings: getImg('Gear/3D/gear_3d.png'),
    collections: getImg('Money%20with%20wings/3D/money_with_wings_3d.png')
};

function buildNav() {
    let h = '';
    NAV.forEach(x => {
        if(x.s) h += `<div class="ns">${x.s[L]}</div>`;
        else h += `<div class="ni${x.p===P?' on':''}" data-p="${x.p}"><span class="ic">${ICONS[x.p]||x.ic}</span><span>${t(x.p)}</span></div>`;
    });
    let elNV = $('NV');
    if(elNV) elNV.innerHTML = h;

    let b = '';
    BNV.forEach(p => {
        let x = NAV.find(n => n.p === p) || {ic: ICONS[p]};
        b += `<div class="bi${p===P?' on':''}" data-p="${p}"><span class="bic">${ICONS[p]||x.ic}</span><span>${t(p)}</span></div>`;
    });
    let elBN = $('BN');
    if(elBN) elBN.innerHTML = b;
}

document.addEventListener('click', e => {
    let el = e.target.closest('.ni, .bi');
    if(!el) return;
    let p = el.getAttribute('data-p');
    if(!p) return;
    P = p;
    buildNav();
    render();
});

if ($('bTh')) {
    $('bTh').onclick = () => {
        let dk = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', dk ? '' : 'dark');
        $('bTh').textContent = dk ? '🌙' : '☀️';
        sv('sp_theme', dk ? '' : 'dark');
    };
}

if ($('bLn')) {
    $('bLn').onclick = () => {
        L = L === 'ar' ? 'en' : 'ar';
        document.body.classList.toggle('en', L === 'en');
        document.documentElement.dir = L === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = L;
        $('bLn').textContent = L === 'ar' ? 'EN' : 'عربي';
        $('bOt').textContent = t('logout');
        sv('sp_lang', L);
        buildNav();
        render();
    };
}

function init() {
    let th = ld('sp_theme');
    if (th === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if($('bTh')) $('bTh').textContent = '☀️';
    }
    
    let col = ld('sp_primary');
    if (col) {
        document.documentElement.style.setProperty('--am', col);
    }
    
    let ln = ld('sp_lang');
    if (ln === 'en' && L !== 'en') {
        L = 'en';
        document.body.classList.add('en');
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
        if($('bLn')) $('bLn').textContent = 'عربي';
        if($('bOt')) $('bOt').textContent = 'Logout';
    }
    
    S = ld('salesData') || [];
    T = ld('targetData') || [];
    accCats = ld('accCats') || [];
    hwCats = ld('hwCats') || [];
    C = ld('payData') || [];
    D = ld('duesData') || [];
    
    buildNav();
    render();
    setTimeout(function() {
        if (typeof window.checkAndSendDailyReport === 'function') window.checkAndSendDailyReport();
    }, 4000);
}

function initAnm() {
    document.querySelectorAll('.anm').forEach(el => {
        let e = Number(el.getAttribute('data-v')), d = 1000, st = null;
        let r = t => {
            if(!st) st = t;
            let p = Math.min((t - st) / d, 1);
            el.textContent = el.getAttribute('data-p') ? pc(p * e) : fmt(Math.floor(p * e));
            if(p < 1) requestAnimationFrame(r);
            else el.textContent = el.getAttribute('data-p') ? pc(e) : fmt(e);
        };
        requestAnimationFrame(r);
    });
}

function render() {
    let fn = {
        dash: rDash, sales: rSales, targets: rTgt, personal: rPers,
        customers: rCust, todo: rTodo, brands: rBrands, analytics: rAn, potential: rPot,
        profit: rProfit, accessories: rAcc, hardware: rHW, collections: rCollections,
        keyacc: rKey, dormant: rDorm, prospects: rPros, alerts: rAl, ai: rAI,
        account: rAcct, backup: rBk, setup: rSetup, reset: rReset, settings: rSettings
    };
    if (fn[P]) fn[P]();
    initAnm();
    if (typeof window.enhanceUI === 'function') setTimeout(window.enhanceUI, 50);
}

window.TUI = function(enStr) {
  const map = {
    'Export Data': '\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A',
    'Export Sales': '\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A',
    'Export Targets': '\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0627\u062A',
    'Export Collections': '\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u062D\u0635\u064A\u0644\u0627\u062A',
    'Prev': '\u0627\u0644\u0633\u0627\u0628\u0642',
    'Next': '\u0627\u0644\u062A\u0627\u0644\u064A',
    'No data': '\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A',
    'Upload Excel Files': '\u0631\u0641\u0639 \u0645\u0644\u0641\u0627\u062A \u0625\u0643\u0633\u064A\u0644',
    'Upload your Sales, Target and Collections Excel files to update the data.': '\u0642\u0645 \u0628\u0631\u0641\u0639 \u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u0627\u062A \u0644\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.',
    'Cloud Sync Active': '\u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0633\u062D\u0627\u0628\u064A\u0629 \u0646\u0634\u0637\u0629',
    'Sales File': '\u0645\u0644\u0641 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A',
    'Target File': '\u0645\u0644\u0641 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641',
    'Collections File': '\u0645\u0644\u0641 \u0627\u0644\u062A\u062D\u0635\u064A\u0644\u0627\u062A',
    'records currently loaded': '\u0633\u062C\u0644 \u0645\u062D\u0645\u0644 \u062D\u0627\u0644\u064A\u0627\u064B',
    'Upload & Update Data': '\u0631\u0641\u0639 \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A',
    'Choose a file first!': '\u0627\u062E\u062A\u0631 \u0645\u0644\u0641\u0627\u064B \u0623\u0648\u0644\u0627\u064B!',
    'Error reading file': '\u062E\u0637\u0623 \u0641\u064A \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0644\u0641',
    'Done': '\u062A\u0645 \u0628\u0646\u062C\u0627\u062D',
    'Active User': '\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0646\u0634\u0637',
    'Sales': '\u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A',
    'Targets': '\u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0627\u062A',
    'Collections': '\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u0627\u062A',
    'Not logged in': '\u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0627\u0644\u062F\u062E\u0648\u0644'
  };
  return map[enStr] || enStr;
};
window.toast = function(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:10px;z-index:9999;pointer-events:none;';
        document.body.appendChild(container);
    }
    
    let t = document.createElement('div');
    t.className = 'toast show ' + type;
    t.textContent = msg;
    t.style.cssText = 'background:var(--bg4);color:var(--tx1);padding:12px 24px;border-radius:12px;box-shadow:var(--sh-lg);backdrop-filter:var(--glass);border:1px solid var(--bd);opacity:0;transform:translateY(20px);transition:all 0.4s ease-out;';
    
    if (type === 'error') t.style.borderLeft = '4px solid var(--rd)';
    else if (type === 'success') t.style.borderLeft = '4px solid var(--gn)';
    else if (type === 'warning') t.style.borderLeft = '4px solid var(--am)';
    else t.style.borderLeft = '4px solid var(--ac)';

    container.appendChild(t);
    
    // Animate in
    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-20px)';
        setTimeout(() => t.remove(), 400);
    }, 3000);
};
// js/gdrive.js - Full Google Drive API Integration

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

let tokenClient;
let gapiInited = false;
let gisInited = false;

window.gapiLoaded = function() {
    if (typeof gapi !== 'undefined' && !gapi.client) {
        gapi.load('client', initializeGapiClient);
    } else if (typeof gapi !== 'undefined' && gapi.client) {
        initializeGapiClient();
    }
};

async function initializeGapiClient() {
    try {
        const API_KEY = localStorage.getItem('gdrive_api_key');
        if (!API_KEY) return;
        
        // Ensure gapi.client is loaded
        if (typeof gapi !== 'undefined' && !gapi.client) {
            await new Promise((resolve) => gapi.load('client', resolve));
        }

        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
    } catch (err) {
        console.warn("Error initializing GAPI client: ", err);
        throw err;
    }
}

window.gisLoaded = function() {
    const CLIENT_ID = localStorage.getItem('gdrive_client_id');
    if (!CLIENT_ID) return;
    if (typeof google === 'undefined' || !google.accounts) return;
    
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', 
    });
    gisInited = true;
};

// Auto-run if script tags loaded before this script
if (typeof gapi !== 'undefined') window.gapiLoaded();
if (typeof google !== 'undefined') window.gisLoaded();

let isInitializing = false;

async function requireAuth(callback) {
    const CLIENT_ID = localStorage.getItem('gdrive_client_id');
    const API_KEY = localStorage.getItem('gdrive_api_key');
    
    if (!CLIENT_ID || !API_KEY) {
        if(typeof toast === 'function') toast(L==='ar'?'يجب إدخال Google Client ID و API Key في الإعدادات':'Please enter Google Client ID and API Key in Settings', 'error');
        return;
    }

    if (isInitializing) {
        setTimeout(() => requireAuth(callback), 500);
        return;
    }

    isInitializing = true;
    try {
        if (!gapiInited) await initializeGapiClient();
        if (!gisInited) window.gisLoaded();
    } catch(e) {
        console.error(e);
    }
    isInitializing = false;

    if (!gapiInited || !gisInited) {
        if(typeof toast === 'function') toast(L==='ar'?'فشل الاتصال بخوادم جوجل. تأكد من صحة المفاتيح.':'Failed to connect to Google. Check keys.', 'error');
        return;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            if(typeof toast === 'function') toast(L==='ar'?'خطأ في تسجيل الدخول لجوجل':'Google Login Error', 'error');
            console.error(resp);
            return;
        }
        callback();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

window.backupToGoogleDrive = function() {
    requireAuth(async () => {
        if(typeof toast === 'function') toast(L==='ar'?'جاري الحفظ في جوجل درايف...':'Saving to Google Drive...', 'info');
        
        let ds = document.getElementById('driveStatus');
        if(ds) ds.innerHTML = `<span style="color:blue">${L==='ar'?'جاري الرفع...':'Uploading...'}</span>`;

        let dump = {
            salesData:  S        || [],
            targetData: T        || [],
            accCats:    accCats  || [],
            hwCats:     hwCats   || [],
            payData:    C        || [],
            duesData:   D        || [],
            lastUpdated: new Date().toISOString()
        };
        const fileContent = JSON.stringify(dump);
        const file = new Blob([fileContent], { type: 'application/json' });
        const metadata = {
            'name': `SalesPro_Backup.json`,
            'mimeType': 'application/json'
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        try {
            // First check if file already exists to overwrite it
            let existingFileId = null;
            const search = await gapi.client.drive.files.list({
                q: "name='SalesPro_Backup.json' and trashed=false",
                spaces: 'drive',
                fields: 'files(id, name)'
            });
            if (search.result.files && search.result.files.length > 0) {
                existingFileId = search.result.files[0].id;
            }

            let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            let method = 'POST';
            if (existingFileId) {
                url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
                method = 'PATCH';
            }

            const res = await fetch(url, {
                method: method,
                headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
                body: form
            });
            
            const data = await res.json();
            if (data.id) {
                let tme = new Date().toLocaleString(L === 'ar' ? 'ar-EG' : 'en-US');
                localStorage.setItem('last_gdrive_sync', tme);
                if(typeof toast === 'function') toast(L==='ar'?'✅ تم الحفظ في جوجل درايف!':'✅ Saved to Google Drive!', 'success');
                if(ds) ds.innerHTML = `✅ <strong>${L==='ar'?'آخر مزامنة:':'Last sync:'}</strong> ${tme}`;
            } else {
                throw new Error("Invalid response from Google Drive");
            }
        } catch (err) {
            console.error("Upload error", err);
            if(ds) ds.innerHTML = `<span style="color:red">Upload Error</span>`;
            if(typeof toast === 'function') toast(L==='ar'?'❌ فشل الحفظ في السحابة':'❌ Cloud save failed', 'error');
        }
    });
};

window.restoreFromGoogleDrive = function() {
    if (!confirm(L === 'ar' ? 'تحذير: سيتم استبدال البيانات الحالية بالنسخة الموجودة في جوجل درايف. متأكد؟' : 'Warning: Current data will be replaced with Google Drive backup. Sure?')) return;
    
    requireAuth(async () => {
        if(typeof toast === 'function') toast(L==='ar'?'جاري البحث عن النسخة...':'Searching for backup...', 'info');
        let ds = document.getElementById('driveStatus');
        if(ds) ds.innerHTML = `<span style="color:blue">${L==='ar'?'جاري التنزيل...':'Downloading...'}</span>`;

        try {
            const search = await gapi.client.drive.files.list({
                q: "name='SalesPro_Backup.json' and trashed=false",
                spaces: 'drive',
                fields: 'files(id, name, modifiedTime)',
                orderBy: 'modifiedTime desc'
            });

            if (!search.result.files || search.result.files.length === 0) {
                if(typeof toast === 'function') toast(L==='ar'?'❌ لا يوجد نسخة احتياطية في جوجل درايف!':'❌ No backup found in Google Drive!', 'error');
                if(ds) ds.innerHTML = `<span style="color:red">No backup found!</span>`;
                return;
            }

            const fileId = search.result.files[0].id;
            
            // Download file content
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token })
            });
            
            const content = await res.text();
            let p = JSON.parse(content);
            
            if (p.salesData)  { S       = p.salesData;  sv('salesData',  S); }
            if (p.targetData) { T       = p.targetData; sv('targetData', T); }
            if (p.accCats)    { accCats = p.accCats;    sv('accCats',    accCats); }
            if (p.hwCats)     { hwCats  = p.hwCats;     sv('hwCats',     hwCats); }
            if (p.payData)    { C       = p.payData;    sv('payData',    C); }
            if (p.duesData)   { D       = p.duesData;   sv('duesData',   D); }

            let tme = new Date(search.result.files[0].modifiedTime).toLocaleString(L === 'ar' ? 'ar-EG' : 'en-US');
            localStorage.setItem('last_gdrive_sync', tme);

            if (typeof toast === 'function') toast(L === 'ar' ? '✅ تم الاسترجاع بنجاح!' : '✅ Restored successfully!', 'success');
            if(ds) ds.innerHTML = `✅ <strong>${L==='ar'?'تم الاسترجاع!':'Restored!'}</strong>`;
            
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            console.error("Restore error", err);
            if(ds) ds.innerHTML = `<span style="color:red">Restore Error</span>`;
            if(typeof toast === 'function') toast(L==='ar'?'❌ فشل استرجاع البيانات':'❌ Restore failed', 'error');
        }
    });
};

window.saveToFirebaseCloud = async function() {
    if (typeof currentUser === 'undefined' || !currentUser || typeof db === 'undefined' || !db) return;
    try {
        let dump = {
            salesData:  typeof S !== 'undefined' ? (S || []) : [],
            targetData: typeof T !== 'undefined' ? (T || []) : [],
            accCats:    typeof accCats !== 'undefined' ? (accCats || []) : [],
            hwCats:     typeof hwCats !== 'undefined' ? (hwCats || []) : [],
            payData:    typeof C !== 'undefined' ? (C || []) : [],
            duesData:   typeof D !== 'undefined' ? (D || []) : [],
            lastUpdated: new Date().toISOString(),
            savedBy: currentUser.email || currentUser.uid
        };
        
        let str = JSON.stringify(dump);
        const chunkSize = 800000;
        let numChunks = Math.ceil(str.length / chunkSize);
        
        await db.collection('users').doc(currentUser.uid).set({
            backup_chunks: numChunks,
            backup_timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            backup_lastUpdated: dump.lastUpdated,
            backup_savedBy: dump.savedBy
        }, { merge: true });
        
        for(let i=0; i<numChunks; i++){
            let part = str.slice(i*chunkSize, (i+1)*chunkSize);
            await db.collection('users').doc(currentUser.uid).collection('chunks').doc('backup_chunk_'+i).set({ data: part });
        }
        console.log("✅ Silent Firebase cloud backup complete!");
    } catch(e) {
        console.error("Firebase backup error:", e);
    }
};

window.cloudAutoSave = function() {
    if (typeof window.saveToFirebaseCloud === 'function') {
        window.saveToFirebaseCloud();
    }
    if (typeof window.backupToGoogleDrive === 'function') {
        if (window.gapi && gapi.client && gapi.client.getToken() !== null) {
            window.backupToGoogleDrive();
        }
    }
};

// Automatic backup to Google Drive every 15 minutes (900,000 ms)
setInterval(() => {
    console.log("🕒 Running 15-minute automatic backup to Google Drive...");
    if (typeof window.backupToGoogleDrive === 'function') {
        if (window.gapi && gapi.client && gapi.client.getToken() !== null) {
            window.backupToGoogleDrive();
        } else if (typeof window.syncUI === 'function') {
            console.log("Google Drive token not active in background; synced with Firebase Cloud.");
        }
    }
}, 15 * 60 * 1000);


window.getCloudInfo = async function() {
    let lastS = localStorage.getItem('last_gdrive_sync');
    if(!lastS) return null;
    return {
        lastUpdated: lastS,
        salesCount: (S || []).length,
        payCount: (C || []).length
    };
};




  window.addEventListener('load', function() {
    try {
      if(typeof init === 'function') init();
    } catch(e) {
      alert('Error during init: ' + e.message + '\n' + e.stack);
    }
    setTimeout(function() {
      var loader = document.getElementById('LOADER');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(function() { loader.style.display = 'none'; }, 500);
      }
    }, 800);
  });



window.exportToPDF = function(data, filename) {
    if(typeof pdfMake === 'undefined') {
        if(typeof toast === 'function') toast(typeof L !== 'undefined' && L==='ar' ? 'مكتبة PDF لم يتم تحميلها' : 'PDF library not loaded', 'error');
        return;
    }
    if(!data || data.length === 0) {
        if(typeof toast === 'function') toast(typeof L !== 'undefined' && L==='ar' ? 'لا توجد بيانات للتصدير' : 'No data to export', 'error');
        return;
    }
    
    try {
        let body = [];
        // Extract headers from the first object
        let headers = Object.keys(data[0]);
        let headRow = headers.map(h => ({ text: h, bold: true, fillColor: '#f0f2f5' }));
        body.push(headRow);
        
        // Extract rows
        data.forEach(rowObj => {
            let row = headers.map(h => String(rowObj[h] || ''));
            body.push(row);
        });
        
        let docDefinition = {
            content: [
                { text: filename, style: 'header', alignment: 'center', margin: [0,0,0,20] },
                {
                    table: {
                        headerRows: 1,
                        body: body
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };
        pdfMake.createPdf(docDefinition).download(filename + '.pdf');
        if(typeof toast === 'function') toast(typeof L !== 'undefined' && L==='ar' ? 'تم التصدير PDF' : 'PDF Exported!', 'success');
    } catch(e) {
        console.error(e);
        if(typeof toast === 'function') toast('Error: ' + e.message, 'error');
    }
};

// Automatically find Excel buttons and inject PDF buttons next to them
window.addEventListener('load', () => {
    setTimeout(() => {
        // Find buttons that call exportToExcel
        const excelBtns = document.querySelectorAll('button');
        excelBtns.forEach(btn => {
            if (btn.innerText && btn.innerText.toLowerCase().includes('excel') && btn.onclick && btn.onclick.toString().includes('exportToExcel')) {
                // Check if we already added a PDF button
                if (btn.nextElementSibling && btn.nextElementSibling.innerText.includes('PDF')) return;
                
                let pdfBtn = document.createElement('button');
                pdfBtn.className = btn.className;
                pdfBtn.style.cssText = btn.style.cssText;
                // Change color to red
                pdfBtn.style.background = 'var(--rdl)';
                pdfBtn.style.color = 'var(--rd)';
                pdfBtn.style.borderColor = 'var(--rd)';
                pdfBtn.innerHTML = btn.innerHTML.replace(/Excel/i, 'PDF').replace('?','?').replace('&#x1F4E5;','&#x1F4E5;'); // Replace icon if any
                
                // Copy onclick but replace exportToExcel with exportToPDF
                let clickCode = btn.onclick.toString();
                // Extract body of the function
                clickCode = clickCode.substring(clickCode.indexOf('{') + 1, clickCode.lastIndexOf('}'));
                if(!clickCode) {
                    // Arrow function fallback
                    let arrowIdx = btn.onclick.toString().indexOf('=>');
                    if(arrowIdx > -1) clickCode = btn.onclick.toString().substring(arrowIdx + 2);
                }
                
                if(clickCode) {
                    clickCode = clickCode.replace(/exportToExcel/g, 'exportToPDF');
                    pdfBtn.onclick = new Function('event', clickCode);
                    
                    // Insert after Excel button
                    btn.parentNode.insertBefore(pdfBtn, btn.nextSibling);
                }
            }
        });
    }, 1500); // Wait for DOM and initial renders
});



if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then(reg => {
      console.log('SW registered!', reg);
    }).catch(err => console.log('SW registration failed', err));
  });
}




﻿window.generateQuote = function(customerName) {
    let items = JSON.parse(localStorage.getItem('draft_quote') || '[]');
    if(items.length === 0) items = [{desc:'',qty:1,price:0}];
    let modal = document.createElement('div');
    modal.className = 'sp-modal-overlay';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
    
    let renderItems = () => items.map((it, i) => `
        <div style="display:flex;gap:10px;margin-bottom:10px;">
            <input type="text" value="${it.desc}" onchange="window.updateQItem(${i},'desc',this.value)" style="flex:2;padding:8px;" class="sbox" placeholder="الصنف / البيان">
            <input type="number" value="${it.qty}" onchange="window.updateQItem(${i},'qty',this.value)" style="flex:1;padding:8px;" class="sbox" placeholder="الكمية">
            <input type="number" value="${it.price}" onchange="window.updateQItem(${i},'price',this.value)" style="flex:1;padding:8px;" class="sbox" placeholder="السعر">
            <button onclick="window.delQItem(${i})" class="btn" style="background:#f44336;color:white;padding:8px;">X</button>
        </div>
    `).join('');

    window.updateQItem = (i, field, val) => { items[i][field] = val; localStorage.setItem('draft_quote', JSON.stringify(items)); };
    window.addQItem = () => { items.push({desc:'',qty:1,price:0}); document.getElementById('qItemsList').innerHTML = renderItems(); };
    window.delQItem = (i) => { items.splice(i,1); localStorage.setItem('draft_quote', JSON.stringify(items)); document.getElementById('qItemsList').innerHTML = renderItems(); };
    window.closeQModal = () => { if(modal && modal.parentNode) modal.parentNode.removeChild(modal); };
    
    window.printQuote = () => {
        let total = items.reduce((s, it) => s + (it.qty * it.price), 0);
        let printWin = window.open('', '', 'width=800,height=900');
        printWin.document.write(`
            <html dir="rtl"><head><title>عرض سعر - ${customerName}</title>
            
            </head><body>
                <div class="header">
                    <div><h1>عرض سعر</h1><p>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p></div>
                    <div style="text-align:left;"><h3>العميل / ${customerName}</h3><p>عناية السيد المحترم</p></div>
                </div>
                <table>
                    <thead><tr><th>م.</th><th>الصنف / البيان</th><th>الكمية</th><th>السعر (ج.م)</th><th>الإجمالي (ج.م)</th></tr></thead>
                    <tbody>
                        ${items.map((it,idx) => `<tr><td>${idx+1}</td><td>${it.desc}</td><td>${it.qty}</td><td>${fmt(it.price)}</td><td>${fmt(it.qty * it.price)}</td></tr>`).join('')}
                    </tbody>
                </table>
                <div class="total">الإجمالي الكلي: ${fmt(total)} ج.م</div>
                <div class="footer">شكراً لتعاملكم معنا. نتمنى لكم يوماً سعيداً.</div>
            </body></html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => { printWin.print(); printWin.close(); }, 500);
    };

    modal.innerHTML = `
        <div style="background:var(--bg);padding:20px;border-radius:12px;width:90%;max-width:600px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            <button onclick="window.closeQModal()" style="position:absolute;top:10px;left:10px;background:none;border:none;font-size:1.5rem;color:var(--tx);cursor:pointer;z-index:9999;">&times;</button>
            <h2 style="margin-bottom:20px;color:var(--p);">إنشاء عرض سعر / ${customerName}</h2>
            <div id="qItemsList" style="margin-bottom:20px;">${renderItems()}</div>
            <button onclick="window.addQItem()" class="btn" style="background:var(--bg2);color:var(--tx);width:100%;margin-bottom:20px;padding:10px;">+ إضافة صنف</button>
            <button onclick="window.printQuote()" class="btn" style="background:var(--p);color:white;width:100%;padding:12px;font-size:1.1rem;font-weight:bold;">طباعة وتحميل عرض السعر (PDF)</button>
        </div>
    `;
    document.body.appendChild(modal);
};
