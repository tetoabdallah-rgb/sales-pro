const fs = require('fs'), vm = require('vm');
let html = fs.readFileSync('index.html', 'utf8');

let ctx = {
    window: { addEventListener: () => {} },
    document: {
        getElementById: (id) => ({
            id: id,
            classList: { add: () => {}, remove: () => {}, contains: () => false },
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
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            appendChild: () => {},
            setAttribute: () => {},
            addEventListener: () => {}
        }),
        body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } },
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
    alert: (msg) => console.log('ALERT:', msg),
    confirm: () => true,
    prompt: () => '',
    console: console,
    setTimeout: (cb) => { try { cb(); } catch(e) { console.log('setTimeout error:', e.message, e.stack); } },
    clearTimeout: clearTimeout,
    setInterval: () => {},
    clearInterval: clearInterval,
    Math: Math, Date: Date, Number: Number, String: String, Array: Array, Object: Object, Boolean: Boolean, RegExp: RegExp, JSON: JSON, Promise: Promise
};
ctx.window = ctx; ctx.document = ctx.document;
ctx.firebase = { apps: [], initializeApp: () => {}, firestore: () => ({ settings: () => {}, collection: () => ({ doc: () => ({ set: () => Promise.resolve(), get: () => Promise.resolve({ exists: false }), onSnapshot: (cb) => { cb({ exists: false }); } }) }) }), auth: () => ({ onAuthStateChanged: (cb) => cb({ uid: 't', email: 'test@example.com' }), signInWithEmailAndPassword: () => Promise.resolve() }) };
ctx.Chart = class { constructor() {} }; ctx.Chart.register = () => {}; ctx.ChartDataLabels = {};
ctx.XLSX = { utils: { book_new: () => {}, book_append_sheet: () => {}, json_to_sheet: () => {} }, writeFile: () => {} };
vm.createContext(ctx);

let regex = /<script([^>]*)>([\s\S]*?)<\/script>/gi, m;
while ((m = regex.exec(html)) !== null) {
    if (!m[2].trim() || m[1].includes('src=')) continue;
    try {
        vm.runInContext(m[2], ctx);
    } catch (e) {
        console.log('SCRIPT EXEC ERROR:', e.message, e.stack);
    }
}

try {
    if (typeof ctx.init === 'function') ctx.init();
    console.log('INIT OK!');
} catch(e) {
    console.log('INIT ERROR:', e.message, e.stack);
}

try {
    if (typeof ctx.render === 'function') ctx.render();
    console.log('RENDER OK!');
} catch(e) {
    console.log('RENDER ERROR:', e.message, e.stack);
}
