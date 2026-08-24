const fs = require('fs');
const vm = require('vm');

const contextObj = {
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Promise: Promise,
    Object: Object,
    Array: Array,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Math: Math,
    JSON: JSON,
    RegExp: RegExp,
    Error: Error,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
    atob: (str) => Buffer.from(str, 'base64').toString('binary'),
    process: { env: {} }
};

contextObj.window = contextObj;
contextObj.global = contextObj;
contextObj.self = contextObj;
contextObj.top = contextObj;

let loadListeners = [];
contextObj.addEventListener = (ev, cb) => { if(ev === 'load' || ev === 'DOMContentLoaded') loadListeners.push(cb); };
contextObj.removeEventListener = () => {};

let mockElements = {};
function getElem(id) {
    if (!mockElements[id]) {
        mockElements[id] = {
            id: id,
            innerHTML: '',
            value: '',
            style: {},
            classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{}, contains: ()=>false },
            appendChild: ()=>{},
            removeChild: ()=>{},
            querySelector: () => null,
            querySelectorAll: () => [],
            parentNode: { insertBefore: ()=>{}, removeChild: ()=>{} },
            addEventListener: ()=>{},
            getAttribute: () => null,
            setAttribute: () => {},
            click: ()=>{}
        };
    }
    return mockElements[id];
}

contextObj.document = {
    addEventListener: contextObj.addEventListener,
    getElementById: getElem,
    createElement: (tag) => ({
        tag: tag,
        style: {},
        classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{}, contains: ()=>false },
        appendChild: ()=>{},
        removeChild: ()=>{},
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: ()=>{},
        getAttribute: () => null,
        setAttribute: () => {},
        getContext: () => ({})
    }),
    body: { appendChild: ()=>{}, removeChild: ()=>{}, classList: { add: ()=>{}, remove: ()=>{} } },
    head: { appendChild: ()=>{} },
    querySelector: () => null,
    querySelectorAll: () => []
};

contextObj.$ = getElem;
contextObj.localStorage = {
    _data: {},
    getItem: (k) => contextObj.localStorage._data[k] || null,
    setItem: (k, v) => { contextObj.localStorage._data[k] = String(v); },
    removeItem: (k) => { delete contextObj.localStorage._data[k]; }
};
contextObj.navigator = { serviceWorker: { register: () => Promise.resolve() }, userAgent: 'Mozilla/5.0' };
contextObj.location = { href: 'https://tetoabdallah-rgb.github.io/sales-pro/index.html', reload: ()=>{} };
contextObj.alert = (m) => console.log('[ALERT]:', m);
contextObj.confirm = () => true;
contextObj.prompt = () => '';

contextObj.firebase = {
    apps: [],
    initializeApp: () => {},
    firestore: () => ({
        settings: () => {},
        collection: () => ({ doc: () => ({ set: ()=>Promise.resolve(), get: ()=>Promise.resolve({exists:false}), collection: ()=>({ doc: ()=>({ set: ()=>Promise.resolve() }) }) }) })
    }),
    auth: () => ({
        onAuthStateChanged: (cb) => {
            setTimeout(() => cb({ uid: 'test_user', email: 'test@example.com' }), 50);
        },
        signInWithEmailAndPassword: () => Promise.resolve(),
        signOut: () => Promise.resolve()
    })
};

contextObj.Chart = class Chart { constructor() {} };
contextObj.Chart.register = () => {};
contextObj.ChartDataLabels = {};

vm.createContext(contextObj);

const html = fs.readFileSync('index.html', 'utf8');
const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;

while ((match = regex.exec(html)) !== null) {
    i++;
    let js = match[1];
    if (!js.trim() || match[0].includes('src=')) continue;
    try {
        console.log(`Running script block #${i}...`);
        vm.runInContext(js, contextObj, { filename: `script_${i}.js` });
    } catch (err) {
        console.error(`\n>>> RUNTIME ERROR in script block #${i} <<<`);
        console.error(err);
        process.exit(1);
    }
}

console.log("\nAll script blocks executed!");
console.log(`Triggering ${loadListeners.length} window load listeners...`);
loadListeners.forEach((cb, idx) => {
    try {
        console.log(`Running load listener #${idx + 1}...`);
        cb();
    } catch (err) {
        console.error(`\n>>> RUNTIME ERROR in load listener #${idx + 1} <<<`);
        console.error(err);
    }
});
