const fs = require('fs'), vm = require('vm');
let html = fs.readFileSync('index_restored.html', 'utf8');

// Let's inject syncUI definition into the HTML right before </head> or at top of script 9
let syncDef = `
window.syncUI = window.syncUI || function(status) {
    console.log('[Cloud Sync]: ' + status);
    let el = document.getElementById('SYNC_STATUS') || document.getElementById('cloud_status');
    if (el) {
        if (status === 'syncing') { el.innerHTML = '🔄'; el.style.color = '#f39c12'; }
        else if (status === 'error') { el.innerHTML = '⚠️'; el.style.color = '#e74c3c'; }
        else if (status === 'done') { el.innerHTML = '☁️'; el.style.color = '#2ecc71'; }
    }
};
`;

let scripts = html.match(/<script([\s\S]*?)<\/script>/g) || [];

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

vm.runInContext(syncDef, ctx);

let scriptErrors = 0;
scripts.forEach((s, idx) => {
    let code = s.replace(/<script[^>]*>|<\/script>/g, '');
    if (code.trim() && !s.includes('src=')) {
        try {
            vm.runInContext(code, ctx);
            console.log(`Script ${idx} loaded OK.`);
        } catch(e) {
            console.log(`Script ${idx} ERROR:`, e.message);
            scriptErrors++;
        }
    }
});

console.log('Total script errors with syncUI defined:', scriptErrors);
