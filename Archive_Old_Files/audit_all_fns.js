const fs = require('fs'), vm = require('vm');
let html = fs.readFileSync('index_restored.html', 'utf8');

// Let's check what functions are called in each r* function
let scripts = html.match(/<script([\s\S]*?)<\/script>/g) || [];
let fullJS = scripts.map(s => s.replace(/<script[^>]*>|<\/script>/g, '')).join('\n');

// Let's find all function names defined in fullJS
let defFns = new Set();
let matches = fullJS.matchAll(/function\s+([a-zA-Z0-9_]+)/g);
for (let m of matches) defFns.add(m[1]);
matches = fullJS.matchAll(/([a-zA-Z0-9_]+)\s*=\s*function/g);
for (let m of matches) defFns.add(m[1]);
matches = fullJS.matchAll(/([a-zA-Z0-9_]+)\s*=\s*\(/g);
for (let m of matches) defFns.add(m[1]);
matches = fullJS.matchAll(/window\.([a-zA-Z0-9_]+)\s*=/g);
for (let m of matches) defFns.add(m[1]);

// Standard browser/JS globals
let globals = new Set(['console', 'document', 'window', 'localStorage', 'navigator', 'location', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'alert', 'confirm', 'prompt', 'Math', 'Date', 'Number', 'String', 'Array', 'Object', 'Boolean', 'RegExp', 'JSON', 'Promise', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'firebase', 'Chart', 'ChartDataLabels', 'XLSX', 'gapi', 'google', 'gisLoaded', 'gapiLoaded']);

// Known global variables in app
let appGlobals = new Set(['L', 'P', 'S', 'T', 'C', 'D', 'accCats', 'hwCats', 'NAV', 'BNV', 'ICONS', 'db', 'auth', 'currentUser', '_cache', '_mtC', 'pStat', 'CH', 't', '$', 'ld', 'sv', 'fmt', 'aFmt', 'syncUI', 'toast', 'buildNav', 'render', 'init', 'initAnm', 'gdrive']);

console.log('Total defined functions:', defFns.size);

// Let's run each page with various global states (e.g. L='en', L='ar', empty data, full data)
let pages = ['dash', 'sales', 'targets', 'personal', 'customers', 'brands', 'analytics', 'potential', 'profit', 'accessories', 'hardware', 'collections', 'keyacc', 'dormant', 'prospects', 'alerts', 'ai', 'account', 'backup', 'setup', 'reset', 'settings'];

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
        store: {},
        getItem: function(k) { return this.store[k] || null; },
        setItem: function(k, v) { this.store[k] = String(v); }
    },
    navigator: { serviceWorker: { register: () => Promise.resolve() } },
    location: { href: '', reload: () => {} },
    alert: () => {}, confirm: () => true, prompt: () => '',
    console: { log: () => {}, warn: () => {}, error: (...args) => console.log('ERR:', ...args) },
    setTimeout: (cb) => { try { cb(); } catch(e) {} },
    clearTimeout: clearTimeout, setInterval: () => {}, clearInterval: clearInterval,
    Math: Math, Date: Date, Number: Number, String: String, Array: Array, Object: Object, Boolean: Boolean, RegExp: RegExp, JSON: JSON, Promise: Promise
};
ctx.window = ctx; ctx.document = ctx.document;
ctx.firebase = { apps: [], initializeApp: () => {}, firestore: () => ({ settings: () => {}, collection: () => ({ doc: () => ({ set: () => Promise.resolve(), get: () => Promise.resolve({ exists: false }), onSnapshot: (cb) => { cb({ exists: false }); } }) }) }), auth: () => ({ onAuthStateChanged: (cb) => cb({ uid: 't', email: 'test@example.com' }), signInWithEmailAndPassword: () => Promise.resolve() }) };
ctx.Chart = class { constructor() {} destroy() {} }; ctx.Chart.register = () => {}; ctx.ChartDataLabels = {};
ctx.XLSX = { utils: { book_new: () => {}, book_append_sheet: () => {}, json_to_sheet: () => {} }, writeFile: () => {} };
vm.createContext(ctx);

scripts.forEach(s => {
    let code = s.replace(/<script[^>]*>|<\/script>/g, '');
    if (code.trim() && !s.includes('src=')) {
        try { vm.runInContext(code, ctx); } catch(e) {}
    }
});

try { if (typeof ctx.init === 'function') ctx.init(); } catch(e) {}

console.log('--- TESTING ARABIC EMPTY ---');
pages.forEach(p => {
    try { ctx.P = p; ctx.render(); } catch(e) { console.log(`AR EMPTY FAIL [${p}]: ${e.message}`); }
});

console.log('--- TESTING ENGLISH EMPTY ---');
ctx.L = 'en';
pages.forEach(p => {
    try { ctx.P = p; ctx.render(); } catch(e) { console.log(`EN EMPTY FAIL [${p}]: ${e.message}`); }
});

console.log('--- TESTING ARABIC WITH DATA ---');
ctx.L = 'ar';
ctx.S = [{ id: 1, c: 'عميل 1', d: '2026-07-26', s: 15000, p: 3000, qty: 5, cat: 'اكسسوارات', item: 'صنف 1' }];
ctx.T = [{ id: 1, m: '2026-07', t: 100000, d: 30 }];
ctx.C = [{ id: 1, c: 'عميل 1', p: '01000000000', a: 'القاهرة', t: 'تاجر', st: 'نشط' }];
ctx.D = [{ id: 1, c: 'عميل 1', amt: 5000, d: '2026-07-20', st: 'مستحق' }];
pages.forEach(p => {
    try { ctx.P = p; ctx.render(); } catch(e) { console.log(`AR DATA FAIL [${p}]: ${e.message}`); }
});
