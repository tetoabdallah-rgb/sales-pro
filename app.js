// js/app.js

const NAV = [
    {s:{ar:'الأساسية',en:'Core'}},
    {p:'dash',ic:'🏠'},{p:'sales',ic:'💰'},{p:'targets',ic:'🎯'},{p:'personal',ic:'👤'},
    {p:'customers',ic:'🏪'},{p:'brands',ic:'📦'},
    {s:{ar:'الأقسام',en:'Depts'}},
    {p:'accessories',ic:'🎧'},{p:'hardware',ic:'📱'},{p:'collections',ic:'💰'},
    {s:{ar:'متقدم',en:'Advanced'}},
    {p:'analytics',ic:'🧠'},{p:'potential',ic:'🚀'},{p:'profit',ic:'💵'},
    {p:'keyacc',ic:'⭐'},{p:'dormant',ic:'💤'},{p:'prospects',ic:'🔍'},
    {s:{ar:'ذكي',en:'Smart'}},
    {p:'ai',ic:'🤖'},{p:'alerts',ic:'🔔'},
    {s:{ar:'النظام',en:'System'}},
    {p:'account',ic:'👤'},{p:'backup',ic:'💾'},{p:'setup',ic:'📂'},{p:'reset',ic:'🗑️'},
    {p:'settings',ic:'⚙️'}
];

const BNV = ['dash','customers','brands','analytics','settings'];

const ICONS = {
    dash:'🏠', sales:'💰', targets:'🎯', personal:'👤', customers:'🏪', brands:'📦',
    accessories:'🎧', hardware:'📱', analytics:'🧠', potential:'🚀', profit:'💵',
    keyacc:'⭐', dormant:'💤', prospects:'🔍', ai:'🤖', alerts:'🔔', account:'👤',
    backup:'💾', setup:'📂', reset:'🗑️', settings:'⚙️'
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
        customers: rCust, brands: rBrands, analytics: rAn, potential: rPot,
        profit: rProfit, accessories: rAcc, hardware: rHW, collections: rCollections,
        keyacc: rKey, dormant: rDorm, prospects: rPros, alerts: rAl, ai: rAI,
        account: rAcct, backup: rBk, setup: rSetup, reset: rReset, settings: rSettings
    };
    if (fn[P]) fn[P]();
    initAnm();
}
