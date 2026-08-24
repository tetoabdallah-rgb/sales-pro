const fs = require('fs'), vm = require('vm');
let html = fs.readFileSync('index.html', 'utf8');

let store = {
    salesData: JSON.stringify([
        { id: 1, c: 'عميل 1', d: '2026-07-26', s: 15000, p: 3000, qty: 5, cat: 'اكسسوارات', item: 'صنف 1' },
        { id: 2, c: 'عميل 2', d: '2026-07-25', s: 25000, p: 5000, qty: 10, cat: 'اجهزة', item: 'صنف 2' }
    ]),
    targetData: JSON.stringify([
        { id: 1, m: '2026-07', t: 100000, d: 30 }
    ]),
    payData: JSON.stringify([
        { id: 1, c: 'عميل 1', p: '01000000000', a: 'القاهرة', t: 'تاجر', st: 'نشط' }
    ]),
    duesData: JSON.stringify([
        { id: 1, c: 'عميل 1', amt: 5000, d: '2026-07-20', st: 'مستحق' }
    ]),
    accCats: JSON.stringify(['اكسسوارات', 'شواحن']),
    hwCats: JSON.stringify(['اجهزة', 'هواتف'])
};

let ctx = {
    window: { addEventListener: () => {} },
    document: {
        getElementById: (id) => ({
            id: id,
            classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
            style: {},
            appendChild: () => {},
            setAttribute: () => {},
            addEventListener: () => {},
            querySelector: () => ({ appendChild: () => {}, style: {}, classList: { add: ()=>{}, remove: ()=>{} } }),
            querySelectorAll: () => []
        }),
        createElement: (t) => ({
            tagName: t,
            style: {},
            classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
            appendChild: () => {},
            setAttribute: () => {},
            addEventListener: () => {}
        }),
        body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} } },
        documentElement: { setAttribute: () => {}, style: { setProperty: () => {} }, dir: 'rtl', lang: 'ar' },
        querySelector: () => ({ classList: { add: () => {}, remove: () => {} }, style: {}, appendChild: () => {} }),
        querySelectorAll: () => [],
        addEventListener: () => {}
    },
    localStorage: {
        store: store,
        getItem: function(k) { return this.store[k] || null; },
        setItem: function(k, v) { this.store[k] = String(v); }
    },
    navigator: { serviceWorker: { register: () => Promise.resolve() } },
    location: { href: '', reload: () => {} },
    alert: (msg) => console.log('ALERT:', msg),
    confirm: () => true,
    prompt: () => '',
    console: { log: () => {}, warn: () => {}, error: (...args) => console.log('ERR:', ...args) },
    setTimeout: (cb) => { try { cb(); } catch(e) { console.log('setTimeout error:', e.message); } },
    clearTimeout: clearTimeout,
    setInterval: () => {},
    clearInterval: clearInterval,
    Math: Math, Date: Date, Number: Number, String: String, Array: Array, Object: Object, Boolean: Boolean, RegExp: RegExp, JSON: JSON, Promise: Promise
};
ctx.window = ctx; ctx.document = ctx.document;
ctx.firebase = { apps: [], initializeApp: () => {}, firestore: () => ({ settings: () => {}, collection: () => ({ doc: () => ({ set: () => Promise.resolve(), get: () => Promise.resolve({ exists: false }), onSnapshot: (cb) => { cb({ exists: false }); } }) }) }), auth: () => ({ onAuthStateChanged: (cb) => cb({ uid: 't', email: 'test@example.com' }), signInWithEmailAndPassword: () => Promise.resolve() }) };
ctx.Chart = class { constructor() {} destroy() {} }; ctx.Chart.register = () => {}; ctx.ChartDataLabels = {};
ctx.XLSX = { utils: { book_new: () => {}, book_append_sheet: () => {}, json_to_sheet: () => {} }, writeFile: () => {} };
vm.createContext(ctx);

let regex = /<script([^>]*)>([\s\S]*?)<\/script>/gi, m;
while ((m = regex.exec(html)) !== null) {
    if (!m[2].trim() || m[1].includes('src=')) continue;
    try { vm.runInContext(m[2], ctx); } catch (e) {}
}

try { if (typeof ctx.init === 'function') ctx.init(); } catch(e) {}

let pages = ['dash', 'sales', 'targets', 'personal', 'customers', 'brands', 'analytics', 'potential', 'profit', 'accessories', 'hardware', 'collections', 'keyacc', 'dormant', 'prospects', 'alerts', 'ai', 'account', 'backup', 'setup', 'reset', 'settings'];
let failedPages = [];
pages.forEach(p => {
    try {
        ctx.P = p;
        ctx.render();
        console.log(`Page [${p}]: OK`);
    } catch(e) {
        console.log(`Page [${p}]: FAILED -> ${e.message}`);
        failedPages.push({page: p, error: e.message, stack: e.stack});
    }
});

console.log('Failed pages with data:', failedPages.length);
failedPages.forEach(f => console.log(f));
