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

const F_URL = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/';
const getImg = (name) => `<img src="${F_URL}${name}" style="width:1.4em;height:1.4em;vertical-align:middle;object-fit:contain;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.15));">`;

const ICONS = {
    dash: getImg('Bar%20chart/3D/bar_chart_3d.png'),
    sales: getImg('Chart%20increasing/3D/chart_increasing_3d.png'),
    targets: getImg('Bullseye/3D/bullseye_3d.png'),
    personal: getImg('Man%20office%20worker/3D/man_office_worker_3d.png'),
    customers: getImg('Busts%20in%20silhouette/3D/busts_in_silhouette_3d.png'),
    brands: getImg('Label/3D/label_3d.png'),
    accessories: getImg('Headphone/3D/headphone_3d.png'),
    hardware: getImg('Laptop/3D/laptop_3d.png'),
    analytics: getImg('Chart%20decreasing/3D/chart_decreasing_3d.png'),
    potential: getImg('Star/3D/star_3d.png'),
    profit: getImg('Money%20bag/3D/money_bag_3d.png'),
    keyacc: getImg('Crown/3D/crown_3d.png'),
    dormant: getImg('Sleeping%20face/3D/sleeping_face_3d.png'),
    prospects: getImg('Magnifying%20glass%20tilted%20right/3D/magnifying_glass_tilted_right_3d.png'),
    ai: getImg('Robot/3D/robot_3d.png'),
    alerts: getImg('Bell/3D/bell_3d.png'),
    account: getImg('Bust%20in%20silhouette/3D/bust_in_silhouette_3d.png'),
    backup: getImg('Floppy%20disk/3D/floppy_disk_3d.png'),
    setup: getImg('Gear/3D/gear_3d.png'),
    reset: getImg('Wastebasket/3D/wastebasket_3d.png'),
    settings: getImg('Artist%20palette/3D/artist_palette_3d.png'),
    collections: getImg('Coin/3D/coin_3d.png')
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
