const fs = require('fs');

global.window = global;
global.addEventListener = (ev, cb) => {};
global.removeEventListener = (ev, cb) => {};
global.document = {
    addEventListener: (event, cb) => {},
    getElementById: (id) => {
        if(!global._mockElements[id]) {
            global._mockElements[id] = {
                id: id,
                innerHTML: '',
                value: '',
                style: {},
                classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{} },
                appendChild: ()=>{},
                querySelector: () => null,
                querySelectorAll: () => [],
                parentNode: { insertBefore: ()=>{} },
                addEventListener: ()=>{},
                getAttribute: () => null,
                setAttribute: () => {}
            };
        }
        return global._mockElements[id];
    },
    createElement: (tag) => ({
        tag: tag,
        style: {},
        classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{} },
        appendChild: ()=>{},
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener: ()=>{},
        getAttribute: () => null,
        setAttribute: () => {}
    }),
    body: {
        appendChild: ()=>{}
    }
};
global._mockElements = {};
global.localStorage = {
    _data: {},
    getItem: (k) => global.localStorage._data[k] || null,
    setItem: (k, v) => { global.localStorage._data[k] = String(v); },
    removeItem: (k) => { delete global.localStorage._data[k]; }
};
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.location = { href: '', reload: ()=>{} };
global.alert = (m) => console.log('ALERT:', m);
global.confirm = () => true;
global.prompt = () => '';

global.firebase = {
    apps: [],
    initializeApp: () => {},
    firestore: () => ({
        settings: () => {},
        collection: () => ({ doc: () => ({ set: ()=>Promise.resolve(), get: ()=>Promise.resolve({exists:false}) }) })
    }),
    auth: () => ({
        onAuthStateChanged: () => {},
        signInWithEmailAndPassword: () => Promise.resolve()
    })
};
global.gapi = { client: { init: ()=>Promise.resolve(), getToken: ()=>({access_token:'test'}), drive: { files: { list: ()=>Promise.resolve({result:{files:[]}}) } } } };
global.google = { accounts: { oauth2: { initTokenClient: () => ({ requestAccessToken: ()=>{} }) } } };

const html = fs.readFileSync('index.html', 'utf8');
const regex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while((match = regex.exec(html)) !== null) {
    count++;
    let code = match[1];
    if(!code.trim() || match[0].includes('src=')) continue;
    try {
        console.log(`Executing script block #${count}...`);
        const fn = new Function(code);
        fn();
    } catch(err) {
        console.error(`RUNTIME ERROR in script block #${count}:`, err);
        process.exit(1);
    }
}

console.log("All script blocks executed without throwing top-level errors.");
try {
    console.log("Testing init()...");
    if(typeof window.init === 'function') window.init();
    console.log("init() succeeded.");
} catch(err) {
    console.error("RUNTIME ERROR in init():", err);
}

try {
    console.log("Testing render()...");
    if(typeof window.render === 'function') window.render();
    console.log("render() succeeded.");
} catch(err) {
    console.error("RUNTIME ERROR in render():", err);
}
