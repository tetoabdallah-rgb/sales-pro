/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  STOCK COMMAND CENTER — Sales Pro Enterprise v4.0   ║
 * ║  Fully Mapped to Excel Structure (3 Prices, 2 Qtys) ║
 * ╚══════════════════════════════════════════════════════╝
 */
(function () {
'use strict';

/* ══════════════════════════════════════════════════════════
   STORAGE
══════════════════════════════════════════════════════════ */
const STOCK_KEY    = 'sp_stock_v1';
const CATS_KEY     = 'sp_stock_cats_v1';
const SETTINGS_KEY = 'sp_stock_settings_v1';

const loadStock    = () => { try { return JSON.parse(localStorage.getItem(STOCK_KEY)) || []; } catch(e) { return []; } };
const saveStock    = d  => localStorage.setItem(STOCK_KEY, JSON.stringify(d));
const loadCats     = () => { try { const s = JSON.parse(localStorage.getItem(CATS_KEY)); return s && s.length ? s : ['إلكترونيات','أجهزة','ملابس','أخرى']; } catch(e) { return ['إلكترونيات','أجهزة','ملابس','أخرى']; } };
const saveCats     = d  => localStorage.setItem(CATS_KEY, JSON.stringify(d));
const loadSettings = () => { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch(e) { return {}; } };
const saveSettings = d  => localStorage.setItem(SETTINGS_KEY, JSON.stringify(d));

/* ══════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════ */
let stockData      = loadStock();
let stockCats      = loadCats();
let settings       = loadSettings();
let stockFilter    = '';
let stockCatFilter = 'all';
let stockSort      = settings.lastSort || 'import';
let currentView    = settings.lastView || 'list';
let editingId      = null;
let selectedIds    = new Set();
let lowThreshold   = settings.lowThreshold || 10;

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const fmtPrice = n => (!n && n !== 0) ? '—' :
    Number(n).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ج.م';

const fmtNum = n => Number(n || 0).toLocaleString('ar-EG');

// Alert logic based on 'Available' quantity
const qtyState = q => (q === null || q === undefined) ? 'unset' : q <= 0 ? 'out' : q <= lowThreshold ? 'low' : 'ok';

const qtyBadge = (avail, onHand) => {
    const s = qtyState(avail);
    const styles = { unset:'background:#374151;color:#9ca3af;', out:'background:#fee2e2;color:#991b1b;', low:'background:#fef3c7;color:#92400e;', ok:'background:#d1fae5;color:#065f46;' };
    const labels = { unset:'— غير محدد', out:'🚫 نفد المتاح', low:'⚠️ متاح: ' + avail, ok:'✅ متاح: ' + fmtNum(avail) };
    const hTxt = onHand != null ? ` | فعلي: ${onHand}` : '';
    return '<span class="qty-badge" style="' + styles[s] + '" title="متاح: ' + (avail||0) + ' / فعلي: ' + (onHand||0) + '">' + labels[s] + hTxt + '</span>';
};

function getFilteredStock() {
    let d = [...stockData];
    if (stockCatFilter !== 'all') d = d.filter(p => p.category === stockCatFilter || p.brand === stockCatFilter);
    if (stockFilter.trim()) {
        const q = stockFilter.trim().toLowerCase();
        d = d.filter(p => (p.name||'').toLowerCase().includes(q) || (p.code||'').toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q));
    }
    switch (stockSort) {
        case 'import':      d.sort((a, b) => (a.importOrder ?? 9999) - (b.importOrder ?? 9999)); break;
        case 'price_asc':   d.sort((a, b) => (a.price||0) - (b.price||0)); break;
        case 'price_desc':  d.sort((a, b) => (b.price||0) - (a.price||0)); break;
        case 'qty_asc':     d.sort((a, b) => (a.qty ?? 9999) - (b.qty ?? 9999)); break;
        case 'qty_desc':    d.sort((a, b) => (b.qty ?? -1) - (a.qty ?? -1)); break;
        case 'name':        d.sort((a, b) => (a.name||'').localeCompare(b.name||'', 'ar')); break;
        case 'brand':       d.sort((a, b) => (a.brand||'').localeCompare(b.brand||'', 'ar')); break;
        case 'low_first': {
            const order = { out:0, low:1, unset:2, ok:3 };
            d.sort((a, b) => (order[qtyState(a.qty)]||0) - (order[qtyState(b.qty)]||0));
            break;
        }
    }
    return d;
}

function getStats() {
    const total    = stockData.length;
    const withQty  = stockData.filter(p => p.qty !== null && p.qty !== undefined);
    const totalVal = withQty.reduce((s, p) => s + (p.price||0) * (p.qty||0), 0);
    const outStock = stockData.filter(p => p.qty <= 0).length;
    const lowStock = stockData.filter(p => p.qty > 0 && p.qty <= lowThreshold).length;
    const unset    = stockData.filter(p => p.qty === null || p.qty === undefined).length;
    const brands   = new Set(stockData.map(p => p.brand || p.category).filter(Boolean)).size;
    return { total, totalVal, outStock, lowStock, unset, brands };
}

/* ══════════════════════════════════════════════════════════
   MAIN RENDER
══════════════════════════════════════════════════════════ */
window.rStock = function rStock() {
    const M = document.getElementById('M');
    if (!M) return;

    const filtered = getFilteredStock();
    const st = getStats();
    const criticals = stockData
        .filter(p => p.qty <= 0 || (p.qty > 0 && p.qty <= lowThreshold))
        .sort((a, b) => (a.qty||0) - (b.qty||0))
        .slice(0, 12);
    const allBrands = [...new Set(stockData.map(p => p.brand || p.category).filter(Boolean))].sort();

    M.innerHTML = `
<style>
.stk-page{display:flex;flex-direction:column;gap:20px;}
.stk-topbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.stk-brand-wrap{display:flex;align-items:center;gap:14px;}
.stk-logo{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:0 4px 16px rgba(99,102,241,.4);flex-shrink:0;}
.stk-title{font-size:1.5rem;font-weight:900;color:var(--tx1);letter-spacing:-.03em;line-height:1;}
.stk-subtitle{font-size:.78rem;color:var(--tx3);margin-top:3px;}
.stk-actions{display:flex;gap:8px;flex-wrap:wrap;}
.sbtn{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:12px;font-size:.84rem;font-weight:700;cursor:pointer;border:none;transition:all .18s;font-family:inherit;white-space:nowrap;}
.sbtn:hover{transform:translateY(-1px);}
.sbtn-primary{background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#fff;box-shadow:0 4px 12px rgba(79,70,229,.35);}
.sbtn-danger{background:linear-gradient(135deg,#dc2626,#e11d48);color:#fff;}
.sbtn-ghost{background:var(--bg3);color:var(--tx2);border:1px solid var(--bd);}
.sbtn-ghost:hover{border-color:#4f46e5;color:#4f46e5;background:var(--bg4);}
.sbtn-pdf{background:linear-gradient(135deg,#dc2626,#f97316);color:#fff;}
.sbtn-excel{background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;}
.sbtn-sm{padding:8px 13px;font-size:.78rem;border-radius:9px;}

.stk-kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;}
.kpi-card{background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:5px;position:relative;overflow:hidden;transition:.2s;}
.kpi-card::before{content:'';position:absolute;top:0;right:0;width:3px;height:100%;}
.kpi-blue::before{background:#3b82f6;} .kpi-blue .kpi-val{color:#3b82f6;}
.kpi-green::before{background:#10b981;} .kpi-green .kpi-val{color:#10b981;}
.kpi-amber::before{background:#f59e0b;} .kpi-amber .kpi-val{color:#f59e0b;}
.kpi-red::before{background:#ef4444;} .kpi-red .kpi-val{color:#ef4444;}
.kpi-purple::before{background:#8b5cf6;} .kpi-purple .kpi-val{color:#8b5cf6;}
.kpi-gray::before{background:#6b7280;} .kpi-gray .kpi-val{color:#6b7280;}
.kpi-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.1);}
.kpi-icon{font-size:1.2rem;}
.kpi-label{font-size:.7rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;}
.kpi-val{font-size:1.5rem;font-weight:900;letter-spacing:-.02em;line-height:1;}
.kpi-sub{font-size:.7rem;color:var(--tx3);}

.stk-alert-banner{background:linear-gradient(135deg,rgba(220,38,38,.07),rgba(251,146,60,.05));border:1px solid rgba(220,38,38,.22);border-radius:16px;padding:16px 20px;}
.stk-alert-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.stk-alert-title{font-size:.88rem;font-weight:800;color:#ef4444;display:flex;align-items:center;gap:8px;}
.stk-alert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;}
.alert-chip{display:flex;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--bd);border-radius:10px;padding:8px 12px;cursor:pointer;transition:.15s;}
.alert-chip:hover{border-color:#4f46e5;}
.alert-chip-img{width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0;}
.alert-chip-ph{width:36px;height:36px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}
.alert-chip-info{flex:1;min-width:0;}
.alert-chip-code{font-size:.68rem;color:var(--tx3);font-weight:700;}
.alert-chip-name{font-size:.78rem;font-weight:700;color:var(--tx1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.alert-chip-qty{font-size:.7rem;font-weight:800;padding:2px 8px;border-radius:6px;white-space:nowrap;}
.chip-out{background:#fee2e2;color:#991b1b;}
.chip-low{background:#fef3c7;color:#92400e;}

.stk-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:12px 16px;}
.stk-sw{flex:1;min-width:180px;position:relative;}
.stk-sw input{width:100%;padding:9px 13px 9px 36px;border-radius:9px;border:1px solid var(--bd);background:var(--bg3);color:var(--tx1);font-size:.86rem;font-family:inherit;box-sizing:border-box;transition:.2s;}
.stk-sw input:focus{outline:none;border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.12);}
.stk-si{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:var(--tx3);font-size:.9rem;pointer-events:none;}
.stk-sel{padding:9px 11px;border-radius:9px;border:1px solid var(--bd);background:var(--bg3);color:var(--tx1);font-size:.82rem;font-family:inherit;cursor:pointer;}
.stk-sel:focus{outline:none;border-color:#4f46e5;}
.vbtns{display:flex;gap:3px;}
.vbtn{width:34px;height:34px;border-radius:8px;border:1px solid var(--bd);background:var(--bg3);color:var(--tx3);cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:.15s;}
.vbtn.on{background:#4f46e5;color:#fff;border-color:#4f46e5;}
.stk-cnt{font-size:.8rem;color:var(--tx3);font-weight:600;white-space:nowrap;}

.stk-sec-lbl{font-size:.7rem;font-weight:800;color:var(--tx3);text-transform:uppercase;letter-spacing:.1em;padding:4px 0 8px;border-bottom:1px solid var(--bd);margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;}
.stk-sec-cnt{background:var(--bg3);padding:2px 10px;border-radius:20px;font-size:.7rem;}

.stk-list{display:flex;flex-direction:column;gap:5px;}
.stk-row{display:grid;grid-template-columns:24px 48px 1fr 180px 110px 100px 80px;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--bd);border-radius:11px;padding:9px 13px;transition:.15s;}
.stk-row:hover{border-color:#4f46e5;box-shadow:0 2px 10px rgba(0,0,0,.07);}
.stk-row.selected{border-color:#4f46e5;background:rgba(79,70,229,.04);}
.stk-row.row-out{border-right:3px solid #ef4444;}
.stk-row.row-low{border-right:3px solid #f59e0b;}
.stk-ck{width:20px;height:20px;border-radius:5px;border:2px solid var(--bd);background:var(--bg3);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:.15s;font-size:.7rem;color:transparent;}
.stk-row.selected .stk-ck{background:#4f46e5;border-color:#4f46e5;color:#fff;}
.stk-ri{width:42px;height:42px;border-radius:9px;object-fit:cover;flex-shrink:0;background:var(--bg3);}
.stk-riph{width:42px;height:42px;border-radius:9px;background:linear-gradient(135deg,var(--bg3),var(--bg4));display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;}
.stk-inf{min-width:0;}
.stk-icode{font-size:.65rem;color:var(--tx3);font-weight:700;text-transform:uppercase;letter-spacing:.05em;}
.stk-iname{font-size:.86rem;font-weight:700;color:var(--tx1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.stk-ibrand{font-size:.7rem;color:#4f46e5;font-weight:600;}

.stk-prices-box{display:flex;flex-direction:column;gap:3px;text-align:right;}
.sp-tier{display:flex;justify-content:space-between;font-size:.75rem;align-items:center;background:var(--bg3);padding:2px 6px;border-radius:5px;}
.sp-tier-l{color:var(--tx3);font-weight:600;font-size:.65rem;}
.sp-tier-v{color:var(--tx1);font-weight:800;}
.sp-tu .sp-tier-v{color:#15803d;} .sp-td .sp-tier-v{color:#1e40af;} .sp-tb .sp-tier-v{color:#b45309;}

.qty-badge{font-size:.7rem;font-weight:800;padding:4px 9px;border-radius:7px;white-space:nowrap;display:inline-flex;align-items:center;gap:3px;}
.qty-editor{display:flex;align-items:center;gap:3px;justify-content:flex-end;}
.qbtn{width:25px;height:25px;border-radius:6px;border:1px solid var(--bd);background:var(--bg3);color:var(--tx1);cursor:pointer;font-size:.85rem;font-weight:700;display:flex;align-items:center;justify-content:center;transition:.1s;flex-shrink:0;}
.qbtn:hover{background:#4f46e5;color:#fff;border-color:#4f46e5;}
.qinp{width:48px;text-align:center;padding:4px 5px;border-radius:6px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx1);font-size:.8rem;font-weight:700;font-family:inherit;}
.qinp:focus{outline:none;border-color:#4f46e5;}
.stk-acts{display:flex;gap:4px;justify-content:flex-end;}
.abt{width:28px;height:28px;border-radius:7px;border:none;cursor:pointer;font-size:.78rem;display:flex;align-items:center;justify-content:center;transition:.12s;background:var(--bg3);color:var(--tx2);}
.abt:hover{background:#4f46e5;color:#fff;}
.abt-del:hover{background:#ef4444 !important;}

.stk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:13px;}
.stk-gc{background:var(--bg2);border:1px solid var(--bd);border-radius:15px;overflow:hidden;transition:.2s;position:relative;cursor:pointer;}
.stk-gc:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.12);border-color:#4f46e5;}
.stk-gc.selected{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.18);}
.stk-gc.g-out{border-top:3px solid #ef4444;}
.stk-gc.g-low{border-top:3px solid #f59e0b;}
.gc-sel{position:absolute;top:7px;right:7px;width:21px;height:21px;border-radius:5px;border:2px solid rgba(255,255,255,.5);background:rgba(0,0,0,.2);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.68rem;color:transparent;transition:.15s;}
.stk-gc.selected .gc-sel{background:#4f46e5;border-color:#4f46e5;color:#fff;}
.gc-acts{position:absolute;top:7px;left:7px;display:flex;gap:4px;opacity:0;transition:.15s;}
.stk-gc:hover .gc-acts{opacity:1;}
.gc-img{width:100%;aspect-ratio:1;object-fit:cover;display:block;}
.gc-ph{width:100%;aspect-ratio:1;background:linear-gradient(135deg,var(--bg3),var(--bg4));display:flex;align-items:center;justify-content:center;font-size:2.8rem;}
.gc-body{padding:12px;}
.gc-code{font-size:.65rem;color:var(--tx3);font-weight:700;text-transform:uppercase;letter-spacing:.05em;}
.gc-name{font-size:.88rem;font-weight:800;color:var(--tx1);line-height:1.3;margin:3px 0 4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.gc-brand{font-size:.7rem;color:#4f46e5;font-weight:600;margin-bottom:7px;}

.gc-ptiers{display:flex;flex-direction:column;gap:3px;margin:8px 0;}
.gc-ptier{display:flex;justify-content:space-between;background:var(--bg3);border-radius:6px;padding:3px 8px;align-items:center;}
.gc-pt-l{font-size:.65rem;color:var(--tx3);font-weight:700;}
.gc-pt-v{font-size:.8rem;font-weight:800;color:var(--tx1);}
.gc-tu .gc-pt-v{color:#15803d;} .gc-td .gc-pt-v{color:#1e40af;} .gc-tb .gc-pt-v{color:#b45309;}

.gc-foot{display:flex;align-items:center;justify-content:space-between;gap:5px;padding-top:9px;border-top:1px solid var(--bd);}
.gc-pr{font-size:.92rem;font-weight:900;color:var(--tx1);}
.gc-qw{display:flex;align-items:center;gap:2px;}
.gc-qbtn{width:20px;height:20px;border-radius:5px;border:1px solid var(--bd);background:var(--bg3);color:var(--tx1);cursor:pointer;font-size:.78rem;display:flex;align-items:center;justify-content:center;transition:.1s;}
.gc-qbtn:hover{background:#4f46e5;color:#fff;border-color:#4f46e5;}
.gc-qv{font-size:.78rem;font-weight:800;min-width:26px;text-align:center;color:var(--tx1);}

.stk-bulk{position:sticky;bottom:70px;left:0;right:0;margin:0 auto;max-width:500px;background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#fff;border-radius:16px;padding:13px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 8px 28px rgba(79,70,229,.4);transition:all .3s;transform:translateY(24px);opacity:0;pointer-events:none;z-index:100;}
.stk-bulk.on{transform:translateY(0);opacity:1;pointer-events:all;}
.stk-empty{text-align:center;padding:80px 24px;}
.stk-empty-icon{font-size:4rem;margin-bottom:16px;opacity:.6;}

.stk-ov{position:fixed;inset:0;background:rgba(0,0,0,.58);backdrop-filter:blur(8px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .25s;pointer-events:none;}
.stk-ov.on{opacity:1;pointer-events:all;}
.stk-m{background:var(--bg1);border:1px solid var(--bd);border-radius:22px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.28);transform:scale(.95) translateY(20px);transition:transform .3s;}
.stk-ov.on .stk-m{transform:scale(1) translateY(0);}
.stk-mh{padding:20px 24px 15px;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between;}
.stk-mt{font-size:1.05rem;font-weight:800;color:var(--tx1);}
.stk-mc{width:31px;height:31px;border-radius:8px;border:none;background:var(--bg3);color:var(--tx2);cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:.15s;}
.stk-mc:hover{background:#ef4444;color:#fff;}
.stk-mb{padding:20px 24px;}
.stk-mf{padding:15px 24px;border-top:1px solid var(--bd);display:flex;gap:10px;justify-content:flex-end;}
.stk-fg2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.stk-fg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.stk-full{grid-column:1/-1;}
.sfg label{display:block;font-size:.76rem;font-weight:700;color:var(--tx3);margin-bottom:5px;}
.sfg input,.sfg select,.sfg textarea{width:100%;padding:9px 12px;border-radius:9px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx1);font-size:.86rem;font-family:inherit;transition:.2s;box-sizing:border-box;}
.sfg input:focus,.sfg select:focus,.sfg textarea:focus{outline:none;border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.1);}
.sfg textarea{resize:vertical;min-height:68px;}

.iup-area{border:2px dashed var(--bd);border-radius:12px;cursor:pointer;overflow:hidden;transition:.2s;background:var(--bg2);position:relative;}
.iup-area:hover{border-color:#4f46e5;}
.iup-area.has-img{border-style:solid;padding:0;}
.iup-ph{padding:24px;text-align:center;}
.iup-icon{font-size:1.8rem;margin-bottom:6px;}
.iup-txt{font-size:.8rem;color:var(--tx3);}
.iup-prev{width:100%;max-height:190px;object-fit:cover;display:none;border-radius:10px;}
.iup-rm{position:absolute;top:8px;left:8px;background:#ef4444;color:#fff;border:none;border-radius:7px;padding:4px 9px;font-size:.7rem;cursor:pointer;font-weight:700;font-family:inherit;}

.xl-drop{border:2px dashed var(--bd);border-radius:14px;padding:28px;text-align:center;cursor:pointer;transition:.2s;background:var(--bg2);margin-bottom:14px;}
.xl-drop:hover,.xl-drop.over{border-color:#16a34a;background:rgba(22,163,74,.04);}
.xl-map{background:var(--bg2);border:1px solid var(--bd);border-radius:11px;padding:13px;font-size:.78rem;margin-bottom:13px;}
.xl-mg{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:7px;}
.xl-mi{display:flex;align-items:center;gap:5px;color:var(--tx2);}
.xl-modes{display:flex;gap:9px;margin-bottom:13px;}
.xl-mc{flex:1;display:flex;align-items:center;gap:9px;border:2px solid var(--bd);border-radius:11px;padding:11px;cursor:pointer;transition:.2s;}
.xl-mc:hover,.xl-mc.on{border-color:#4f46e5;background:rgba(79,70,229,.04);}
.xl-pt{width:100%;border-collapse:collapse;font-size:.74rem;}
.xl-pt th{padding:7px 9px;text-align:right;background:var(--bg3);border-bottom:1px solid var(--bd);font-weight:700;color:var(--tx2);}
.xl-pt td{padding:7px 9px;border-bottom:1px solid var(--bd);color:var(--tx1);}
.xl-pb{height:6px;background:var(--bg3);border-radius:99px;overflow:hidden;}
.xl-pf{height:100%;background:linear-gradient(90deg,#16a34a,#4ade80);border-radius:99px;transition:width .3s;}

.thr-row{display:flex;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:10px 16px;}
.thr-lbl{font-size:.82rem;color:var(--tx2);font-weight:600;flex:1;}
.thr-inp{width:58px;text-align:center;padding:6px;border-radius:8px;border:1px solid var(--bd);background:var(--bg3);color:var(--tx1);font-size:.88rem;font-weight:700;font-family:inherit;}

.pdf-opt{display:flex;align-items:center;gap:12px;border:2px solid var(--bd);border-radius:12px;padding:13px;cursor:pointer;transition:.2s;margin-bottom:9px;}
.pdf-opt:hover,.pdf-opt.on{border-color:#4f46e5;background:rgba(79,70,229,.04);}
.pdf-opt-icon{font-size:1.7rem;}

@media(max-width:800px){.stk-kpis{grid-template-columns:repeat(3,1fr);}.stk-row{grid-template-columns:22px 38px 1fr auto auto;}.stk-prices-box,.stk-acts{display:none;}.stk-title{font-size:1.15rem;}}
@media(max-width:440px){.stk-kpis{grid-template-columns:repeat(2,1fr);}}
</style>

<div class="stk-page">

<div class="stk-topbar">
  <div class="stk-brand-wrap">
    <div class="stk-logo">📦</div>
    <div>
      <div class="stk-title">مركز إدارة المخزون</div>
      <div class="stk-subtitle">Stock Command Center — ${fmtNum(st.total)} منتج · ${st.brands} براند</div>
    </div>
  </div>
  <div class="stk-actions">
    <button class="sbtn sbtn-ghost sbtn-sm" id="stkCatsBtn">🗂️ الفئات</button>
    <button class="sbtn sbtn-excel sbtn-sm" id="stkXlBtn">📥 استيراد Excel</button>
    <button class="sbtn sbtn-pdf sbtn-sm" id="stkPdfBtn">📄 كتالوج PDF</button>
    <button class="sbtn sbtn-primary" id="stkAddBtn">＋ منتج جديد</button>
  </div>
</div>

<div class="stk-kpis">
  <div class="kpi-card kpi-blue"><div class="kpi-icon">📦</div><div class="kpi-label">إجمالي المنتجات</div><div class="kpi-val">${fmtNum(st.total)}</div><div class="kpi-sub">${st.brands} براند</div></div>
  <div class="kpi-card kpi-green"><div class="kpi-icon">💰</div><div class="kpi-label">قيمة المتاح</div><div class="kpi-val" style="font-size:1.05rem;">${fmtPrice(st.totalVal)}</div><div class="kpi-sub">بأسعار المستخدم للمتاح</div></div>
  <div class="kpi-card kpi-amber"><div class="kpi-icon">⚠️</div><div class="kpi-label">متاح منخفض</div><div class="kpi-val">${fmtNum(st.lowStock)}</div><div class="kpi-sub">أقل من ${lowThreshold} متاح</div></div>
  <div class="kpi-card kpi-red"><div class="kpi-icon">🚫</div><div class="kpi-label">نفد المتاح</div><div class="kpi-val">${fmtNum(st.outStock)}</div><div class="kpi-sub">يحتاج إعادة طلب</div></div>
  <div class="kpi-card kpi-purple"><div class="kpi-icon">📋</div><div class="kpi-label">لم تحدد كمية</div><div class="kpi-val">${fmtNum(st.unset)}</div><div class="kpi-sub">انتظار التحديث</div></div>
  <div class="kpi-card kpi-gray"><div class="kpi-icon">🎯</div><div class="kpi-label">حد التنبيه</div><div class="kpi-val">${lowThreshold}</div><div class="kpi-sub">قطعة متاحة</div></div>
</div>

<div class="thr-row">
  <div class="thr-lbl">🎯 حد تنبيه المخزون المنخفض (Available) — التنبيه عند أقل من:</div>
  <input class="thr-inp" type="number" id="stkThrInp" value="${lowThreshold}" min="1" max="500">
  <span style="font-size:.8rem;color:var(--tx3);">قطعة</span>
  <button class="sbtn sbtn-ghost sbtn-sm" id="stkThrSave">حفظ</button>
</div>

${criticals.length ? `
<div class="stk-alert-banner">
  <div class="stk-alert-hdr">
    <div class="stk-alert-title">🔔 تنبيه عاجل — ${criticals.length} منتج المتاح منها نفد أو قارب على الانتهاء</div>
    <button class="sbtn sbtn-ghost sbtn-sm" id="stkShowLowBtn">عرض الكل (${st.outStock + st.lowStock})</button>
  </div>
  <div class="stk-alert-grid">
    ${criticals.map(p => `
    <div class="alert-chip" data-edit="${p.id}">
      ${p.image ? `<img class="alert-chip-img" src="${p.image}" alt="">` : `<div class="alert-chip-ph">📦</div>`}
      <div class="alert-chip-info">
        <div class="alert-chip-code">${p.code || ''}</div>
        <div class="alert-chip-name">${p.name}</div>
      </div>
      <span class="alert-chip-qty ${p.qty <= 0 ? 'chip-out' : 'chip-low'}">متاح: ${p.qty <= 0 ? 'نفد' : p.qty}</span>
    </div>`).join('')}
  </div>
</div>` : ''}

<div class="stk-toolbar">
  <div class="stk-sw">
    <span class="stk-si">🔍</span>
    <input type="text" id="stkSearch" placeholder="ابحث بالاسم، الكود، البراند..." value="${stockFilter}">
  </div>
  <select class="stk-sel" id="stkCatSel">
    <option value="all">كل الفئات والبراندات</option>
    ${allBrands.map(b => `<option value="${b}" ${stockCatFilter===b?'selected':''}>${b}</option>`).join('')}
  </select>
  <select class="stk-sel" id="stkSortSel">
    <option value="import"     ${stockSort==='import'    ?'selected':''}>📊 ترتيب الإكسل</option>
    <option value="name"       ${stockSort==='name'      ?'selected':''}>🔤 الاسم أ–ي</option>
    <option value="brand"      ${stockSort==='brand'     ?'selected':''}>🏷️ البراند</option>
    <option value="price_asc"  ${stockSort==='price_asc' ?'selected':''}>💰 سعر يوزر: الأقل</option>
    <option value="price_desc" ${stockSort==='price_desc'?'selected':''}>💰 سعر يوزر: الأعلى</option>
    <option value="low_first"  ${stockSort==='low_first' ?'selected':''}>⚠️ المنخفض أولاً</option>
    <option value="qty_asc"    ${stockSort==='qty_asc'   ?'selected':''}>📉 المتاح: الأقل</option>
    <option value="qty_desc"   ${stockSort==='qty_desc'  ?'selected':''}>📈 المتاح: الأكثر</option>
  </select>
  <div class="vbtns">
    <button class="vbtn ${currentView==='list'?'on':''}" id="vList">☰</button>
    <button class="vbtn ${currentView==='grid'?'on':''}" id="vGrid">⊞</button>
  </div>
  <span class="stk-cnt">${filtered.length} منتج</span>
</div>

<div id="stkProducts">${renderProducts(filtered)}</div>

<div class="stk-bulk" id="stkBulk">
  <span style="font-weight:700;font-size:.9rem;" id="stkBulkCnt">0 محدد</span>
  <div style="display:flex;gap:7px;">
    <button class="sbtn sbtn-pdf sbtn-sm" id="bkPdf">📄 PDF للمحدد</button>
    <button class="sbtn sbtn-danger sbtn-sm" id="bkDel">🗑️ حذف</button>
    <button class="sbtn sbtn-ghost sbtn-sm" id="bkClr">✕</button>
  </div>
</div>
</div>

<!-- ADD/EDIT -->
<div class="stk-ov" id="stkModal">
  <div class="stk-m">
    <div class="stk-mh"><div class="stk-mt" id="stkMTitle">منتج جديد</div><button class="stk-mc" id="stkMClose">✕</button></div>
    <div class="stk-mb">
      <input type="file" id="stkImgFile" accept="image/*" style="display:none;">
      <div class="stk-full" style="margin-bottom:14px;">
        <label style="font-size:.76rem;font-weight:700;color:var(--tx3);display:block;margin-bottom:5px;">صورة المنتج</label>
        <div class="iup-area" id="stkImgArea">
          <div class="iup-ph" id="stkImgPh"><div class="iup-icon">🖼️</div><div class="iup-txt">اضغط لرفع صورة</div></div>
          <img id="stkImgPrev" class="iup-prev" alt="">
          <button class="iup-rm" id="stkImgRm" style="display:none;">✕ إزالة</button>
        </div>
      </div>
      <div class="stk-fg2">
        <div class="sfg"><label>اسم المنتج *</label><input type="text" id="mfName" placeholder="اسم المنتج"></div>
        <div class="sfg"><label>الكود</label><input type="text" id="mfCode" placeholder="مثل: MO-33-B"></div>
        <div class="sfg"><label>البراند</label><input type="text" id="mfBrand" placeholder="مثل: Logitech"></div>
        <div class="sfg"><label>الفئة (Item Class)</label><select id="mfCat">${stockCats.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
      </div>
      <div class="stk-fg3" style="margin-top:12px;">
        <div class="sfg"><label>سعر User</label><input type="number" id="mfPrice" placeholder="0" min="0" step="0.01"></div>
        <div class="sfg"><label>سعر Dealer</label><input type="number" id="mfCost" placeholder="0" min="0" step="0.01"></div>
        <div class="sfg"><label>Best Price</label><input type="number" id="mfBest" placeholder="0" min="0" step="0.01"></div>
      </div>
      <div class="stk-fg2" style="margin-top:12px;">
        <div class="sfg"><label>الكمية الفعلية (On Hand)</label><input type="number" id="mfQtyOnHand" placeholder="-" min="0" step="1"></div>
        <div class="sfg"><label>الكمية المتاحة (Available)</label><input type="number" id="mfQty" placeholder="-" min="0" step="1"></div>
        <div class="sfg stk-full"><label>الوصف</label><textarea id="mfDesc" placeholder="وصف المنتج..."></textarea></div>
      </div>
    </div>
    <div class="stk-mf">
      <button class="sbtn sbtn-ghost" id="stkMCancel">إلغاء</button>
      <button class="sbtn sbtn-primary" id="stkMSave">💾 حفظ</button>
    </div>
  </div>
</div>

<!-- PDF -->
<div class="stk-ov" id="pdfModal">
  <div class="stk-m" style="max-width:420px;">
    <div class="stk-mh"><div class="stk-mt">📄 تصدير كتالوج PDF</div><button class="stk-mc" id="pdfMClose">✕</button></div>
    <div class="stk-mb">
      <div class="pdf-opt on" data-opt="all"><div class="pdf-opt-icon">📦</div><div><div style="font-weight:800;font-size:.9rem;color:var(--tx1);">كل المنتجات</div><div style="font-size:.76rem;color:var(--tx3);">${fmtNum(stockData.length)} منتج</div></div></div>
      <div class="pdf-opt" data-opt="filtered"><div class="pdf-opt-icon">🔍</div><div><div style="font-weight:800;font-size:.9rem;color:var(--tx1);">المفلتر الحالي</div><div style="font-size:.76rem;color:var(--tx3);">${fmtNum(filtered.length)} منتج</div></div></div>
      <div class="pdf-opt ${selectedIds.size===0?'':'on'}" data-opt="selected" style="${selectedIds.size===0?'opacity:.4;pointer-events:none;':''}"><div class="pdf-opt-icon">✅</div><div><div style="font-weight:800;font-size:.9rem;color:var(--tx1);">المحدد فقط</div><div style="font-size:.76rem;color:var(--tx3);">${selectedIds.size} منتج</div></div></div>
      <div class="sfg" style="margin-top:14px;"><label style="font-size:.76rem;font-weight:700;color:var(--tx3);display:block;margin-bottom:5px;">اسم الشركة في الكتالوج</label><input type="text" id="pdfCompany" value="${localStorage.getItem('sp_company_name')||'Sales Pro'}" style="width:100%;padding:9px 12px;border-radius:9px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx1);font-family:inherit;box-sizing:border-box;"></div>
    </div>
    <div class="stk-mf">
      <button class="sbtn sbtn-ghost" id="pdfMCancel">إلغاء</button>
      <button class="sbtn sbtn-pdf" id="pdfMGen">📄 توليد الكتالوج</button>
    </div>
  </div>
</div>

<!-- EXCEL -->
<div class="stk-ov" id="xlModal">
  <div class="stk-m" style="max-width:560px;">
    <div class="stk-mh"><div class="stk-mt">📥 استيراد من Excel</div><button class="stk-mc" id="xlMClose">✕</button></div>
    <div class="stk-mb">
      <input type="file" id="xlFileInp" accept=".xlsx,.xls,.csv" style="display:none;">
      <div class="xl-drop" id="xlDrop">
        <div id="xlDC">
          <div style="font-size:2rem;margin-bottom:9px;pointer-events:none;">📊</div>
          <div style="font-weight:800;font-size:.92rem;color:var(--tx1);margin-bottom:6px;pointer-events:none;">اسحب ملف Excel هنا</div>
          <div style="font-size:.78rem;color:var(--tx3);margin-bottom:13px;pointer-events:none;">.xlsx / .xls / .csv</div>
          <button class="sbtn sbtn-excel sbtn-sm" onclick="document.getElementById('xlFileInp').click();event.stopPropagation();">📂 اختار الملف</button>
        </div>
        <div id="xlCC" style="display:none;pointer-events:none;">
          <div style="font-size:1.8rem;margin-bottom:7px;">✅</div>
          <div id="xlFN" style="font-weight:800;color:#16a34a;font-size:.88rem;"></div>
          <div id="xlRC" style="font-size:.78rem;color:var(--tx3);margin-top:3px;"></div>
          <button class="sbtn sbtn-ghost sbtn-sm" style="margin-top:9px;pointer-events:all;" onclick="document.getElementById('xlFileInp').click();event.stopPropagation();">🔄 تغيير</button>
        </div>
      </div>
      <div class="xl-map">
        <div style="font-weight:800;font-size:.8rem;color:var(--tx1);">🗂️ سيتم قراءة الأعمدة بالترتيب التالي:</div>
        <div class="xl-mg">
          <div class="xl-mi">1️⃣ الكود</div><div class="xl-mi">2️⃣ الوصف</div>
          <div class="xl-mi">3️⃣ Qty On Hand</div><div class="xl-mi">4️⃣ Available Qty</div>
          <div class="xl-mi">5️⃣ User Price</div><div class="xl-mi">6️⃣ Dealer Price</div>
          <div class="xl-mi">7️⃣ Best Price</div><div class="xl-mi">8️⃣ Brand</div>
          <div class="xl-mi stk-full">9️⃣ Item Class</div>
        </div>
      </div>
      <div class="xl-modes">
        <label class="xl-mc on" id="xlMR"><input type="radio" name="xlMode" value="replace" checked style="accent-color:#4f46e5;"><div><div style="font-weight:800;font-size:.84rem;color:var(--tx1);">استبدال الكل</div><div style="font-size:.7rem;color:var(--tx3);">مسح وإعادة الاستيراد</div></div></label>
        <label class="xl-mc" id="xlMM"><input type="radio" name="xlMode" value="merge" style="accent-color:#4f46e5;"><div><div style="font-weight:800;font-size:.84rem;color:var(--tx1);">دمج وتحديث</div><div style="font-size:.7rem;color:var(--tx3);">تحديث بنفس الكود</div></div></label>
      </div>
      <div id="xlPS" style="display:none;">
        <div style="font-size:.78rem;font-weight:700;color:var(--tx2);margin-bottom:7px;">معاينة أول 5 منتجات:</div>
        <div style="overflow-x:auto;border:1px solid var(--bd);border-radius:9px;"><table class="xl-pt"><thead><tr><th>الكود</th><th>الاسم</th><th>المتاح</th><th>يوزر</th><th>ديلر</th><th>Best</th></tr></thead><tbody id="xlPB"></tbody></table></div>
      </div>
      <div id="xlPW" style="display:none;margin-top:13px;">
        <div style="font-size:.78rem;color:var(--tx2);margin-bottom:5px;" id="xlPT">جاري الاستيراد...</div>
        <div class="xl-pb"><div class="xl-pf" id="xlPF" style="width:0%"></div></div>
      </div>
    </div>
    <div class="stk-mf">
      <button class="sbtn sbtn-ghost" id="xlMCancel">إلغاء</button>
      <button class="sbtn sbtn-excel" id="xlMOK" disabled style="opacity:.45;">📥 استيراد</button>
    </div>
  </div>
</div>

<!-- CATS -->
<div class="stk-ov" id="catsModal">
  <div class="stk-m" style="max-width:360px;">
    <div class="stk-mh"><div class="stk-mt">🗂️ إدارة الفئات</div><button class="stk-mc" id="catsMC">✕</button></div>
    <div class="stk-mb" id="catsMB">${renderCatsBody()}</div>
  </div>
</div>
`;

    attachEvents();
};

/* ══════════════════════════════════════════════════════════
   RENDER PRODUCTS
══════════════════════════════════════════════════════════ */
function renderProducts(items) {
    if (!items.length) return `<div class="stk-empty"><div class="stk-empty-icon">📭</div><div style="font-weight:700;font-size:1.05rem;color:var(--tx2);">لا توجد منتجات</div></div>`;
    return currentView === 'grid' ? renderGrid(items) : renderList(items);
}

function renderList(items) {
    const groups = {}; const groupOrder = [];
    items.forEach(p => {
        const k = p.brand || p.category || 'أخرى';
        if (!groups[k]) { groups[k] = []; groupOrder.push(k); }
        groups[k].push(p);
    });
    let html = '<div class="stk-list">';
    groupOrder.forEach(brand => {
        const prods = groups[brand];
        html += `<div class="stk-sec-lbl"><span>🏷️ ${brand}</span><span class="stk-sec-cnt">${prods.length} منتج</span></div>`;
        prods.forEach(p => {
            const qs  = qtyState(p.qty);
            const rc  = qs==='out'?'row-out':qs==='low'?'row-low':'';
            const qv  = (p.qty===null||p.qty===undefined) ? '' : p.qty;
            html += `
<div class="stk-row ${selectedIds.has(p.id)?'selected':''} ${rc}" data-id="${p.id}">
  <div class="stk-ck" data-select="${p.id}">✓</div>
  ${p.image?`<img class="stk-ri" src="${p.image}" alt="" loading="lazy">`:`<div class="stk-riph">📦</div>`}
  <div class="stk-inf">
    <div class="stk-icode">${p.code||''} ${p.itemClass?`<span style="color:var(--tx3);">· ${p.itemClass}</span>`:''}</div>
    <div class="stk-iname">${p.name}</div>
    <div class="stk-ibrand">${p.brand||''}</div>
  </div>
  <div class="stk-prices-box">
    <div class="sp-tier sp-tu"><span class="sp-tier-l">يوزر</span><span class="sp-tier-v">${fmtPrice(p.price)}</span></div>
    <div class="sp-tier sp-td"><span class="sp-tier-l">ديلر</span><span class="sp-tier-v">${fmtPrice(p.cost)}</span></div>
    <div class="sp-tier sp-tb"><span class="sp-tier-l">Best</span><span class="sp-tier-v">${fmtPrice(p.bestPrice)}</span></div>
  </div>
  <div>${qtyBadge(p.qty, p.qtyOnHand)}</div>
  <div class="qty-editor" title="تعديل المتاح (Available)">
    <button class="qbtn" data-qminus="${p.id}">−</button>
    <input class="qinp" type="number" value="${qv}" min="0" placeholder="—" data-qinput="${p.id}">
    <button class="qbtn" data-qplus="${p.id}">+</button>
  </div>
  <div class="stk-acts">
    <button class="abt" data-edit="${p.id}" title="تعديل">✏️</button>
    <button class="abt abt-del" data-del="${p.id}" title="حذف">🗑️</button>
  </div>
</div>`;
        });
    });
    return html + '</div>';
}

function renderGrid(items) {
    return `<div class="stk-grid">${items.map(p => {
        const qs = qtyState(p.qty);
        const gc = qs==='out'?'g-out':qs==='low'?'g-low':'';
        return `
<div class="stk-gc ${selectedIds.has(p.id)?'selected':''} ${gc}" data-id="${p.id}">
  <div class="gc-sel" data-select="${p.id}">✓</div>
  <div class="gc-acts">
    <button class="abt" data-edit="${p.id}" style="opacity:1;background:rgba(255,255,255,.9);color:#111;">✏️</button>
    <button class="abt abt-del" data-del="${p.id}" style="opacity:1;background:rgba(255,255,255,.9);color:#ef4444;">🗑️</button>
  </div>
  ${p.image?`<img class="gc-img" src="${p.image}" alt="" loading="lazy">`:`<div class="gc-ph">📦</div>`}
  <div class="gc-body">
    <div class="gc-code">${p.code||''}</div>
    <div class="gc-name">${p.name}</div>
    <div class="gc-brand">${p.brand||p.category||''}</div>
    ${qtyBadge(p.qty, p.qtyOnHand)}
    <div class="gc-ptiers">
      <div class="gc-ptier gc-tu"><span class="gc-pt-l">User Price</span><span class="gc-pt-v">${fmtPrice(p.price)}</span></div>
      <div class="gc-ptier gc-td"><span class="gc-pt-l">Dealer Price</span><span class="gc-pt-v">${fmtPrice(p.cost)}</span></div>
      <div class="gc-ptier gc-tb"><span class="gc-pt-l">Best Price</span><span class="gc-pt-v">${fmtPrice(p.bestPrice)}</span></div>
    </div>
    <div class="gc-foot" title="تعديل المتاح">
      <div class="gc-qw" style="width:100%;justify-content:center;">
        <button class="gc-qbtn" data-qminus="${p.id}">−</button>
        <span class="gc-qv">${p.qty!=null?p.qty:'?'}</span>
        <button class="gc-qbtn" data-qplus="${p.id}">+</button>
      </div>
    </div>
  </div>
</div>`;
    }).join('')}</div>`;
}

function renderCatsBody() {
    return `
<div style="display:flex;gap:8px;margin-bottom:13px;">
  <input type="text" id="newCatInp" placeholder="اسم الفئة الجديدة" style="flex:1;padding:8px 12px;border-radius:9px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx1);font-family:inherit;font-size:.86rem;">
  <button class="sbtn sbtn-primary sbtn-sm" id="addCatBtn">+ إضافة</button>
</div>
${stockCats.map((c,i)=>`
<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid var(--bd);border-radius:9px;padding:9px 13px;margin-bottom:6px;">
  <span style="font-weight:600;color:var(--tx1);">🏷️ ${c}</span>
  ${stockCats.length>1?`<button data-delcat="${i}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1rem;">🗑️</button>`:''}
</div>`).join('')}`;
}

/* ══════════════════════════════════════════════════════════
   RE-RENDER
══════════════════════════════════════════════════════════ */
function reRender() {
    const c = document.getElementById('stkProducts');
    if (c) c.innerHTML = renderProducts(getFilteredStock());
    const ce = document.querySelector('.stk-cnt');
    if (ce) ce.textContent = getFilteredStock().length + ' منتج';
    updateBulk();
}
function updateBulk() {
    const b = document.getElementById('stkBulk');
    const e = document.getElementById('stkBulkCnt');
    if (!b) return;
    if (selectedIds.size > 0) { b.classList.add('on'); if(e) e.textContent = selectedIds.size + ' محدد'; }
    else b.classList.remove('on');
}

/* ══════════════════════════════════════════════════════════
   QTY
══════════════════════════════════════════════════════════ */
function setQty(id, val) {
    const i = stockData.findIndex(p => p.id === id); if(i===-1) return;
    stockData[i].qty = val; stockData[i].updatedAt = new Date().toISOString();
    saveStock(stockData); reRender();
}
function adjQty(id, d) {
    const i = stockData.findIndex(p => p.id === id); if(i===-1) return;
    const cur = stockData[i].qty ?? 0;
    setQty(id, Math.max(0, cur + d));
}

/* ══════════════════════════════════════════════════════════
   IMAGE
══════════════════════════════════════════════════════════ */
function fileToB64(f) { return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsDataURL(f);}); }
async function resizeB64(b64,mw=600,mh=600,q=.82){return new Promise(res=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height;if(w>mw||h>mh){const r=Math.min(mw/w,mh/h);w=Math.round(w*r);h=Math.round(h*r);}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',q));};img.src=b64;});}

/* ══════════════════════════════════════════════════════════
   EVENTS
══════════════════════════════════════════════════════════ */
function attachEvents() {
    // toolbar
    document.getElementById('stkSearch')?.addEventListener('input', e => { stockFilter=e.target.value; reRender(); });
    document.getElementById('stkCatSel')?.addEventListener('change', e => { stockCatFilter=e.target.value; reRender(); });
    document.getElementById('stkSortSel')?.addEventListener('change', e => { stockSort=e.target.value; settings.lastSort=stockSort; saveSettings(settings); reRender(); });
    document.getElementById('vList')?.addEventListener('click', () => { currentView='list'; settings.lastView='list'; saveSettings(settings); document.getElementById('vList').classList.add('on'); document.getElementById('vGrid').classList.remove('on'); reRender(); });
    document.getElementById('vGrid')?.addEventListener('click', () => { currentView='grid'; settings.lastView='grid'; saveSettings(settings); document.getElementById('vGrid').classList.add('on'); document.getElementById('vList').classList.remove('on'); reRender(); });

    // threshold
    document.getElementById('stkThrSave')?.addEventListener('click', () => {
        const v = parseInt(document.getElementById('stkThrInp')?.value)||10;
        lowThreshold = Math.max(1,v); settings.lowThreshold=lowThreshold; saveSettings(settings);
        showToast('✅ حد التنبيه: '+lowThreshold+' قطعة','success'); window.rStock();
    });
    document.getElementById('stkShowLowBtn')?.addEventListener('click', () => {
        stockSort='low_first'; stockCatFilter='all'; stockFilter='';
        document.getElementById('stkSortSel').value='low_first'; reRender();
    });

    // products delegation
    document.getElementById('stkProducts')?.addEventListener('click', e => {
        const ed=e.target.closest('[data-edit]'); const dl=e.target.closest('[data-del]');
        const sl=e.target.closest('[data-select]'); const qp=e.target.closest('[data-qplus]'); const qm=e.target.closest('[data-qminus]');
        if(ed){openModal(ed.dataset.edit);return;} if(dl){confDel(dl.dataset.del);return;}
        if(sl){toggleSel(sl.dataset.select);return;} if(qp){adjQty(qp.dataset.qplus,+1);return;} if(qm){adjQty(qm.dataset.qminus,-1);return;}
    });
    document.getElementById('stkProducts')?.addEventListener('change', e => {
        const qi=e.target.closest('[data-qinput]');
        if(qi){const v=e.target.value.trim();setQty(qi.dataset.qinput,v===''?null:Math.max(0,parseInt(v)||0));}
    });
    document.querySelectorAll('.alert-chip[data-edit]').forEach(c=>c.addEventListener('click',()=>openModal(c.dataset.edit)));

    // buttons
    document.getElementById('stkAddBtn')?.addEventListener('click', ()=>openModal());
    document.getElementById('stkCatsBtn')?.addEventListener('click', ()=>document.getElementById('catsModal').classList.add('on'));
    document.getElementById('catsMC')?.addEventListener('click', ()=>document.getElementById('catsModal').classList.remove('on'));
    document.getElementById('catsModal')?.addEventListener('click', e=>{if(e.target.id==='catsModal')e.target.classList.remove('on');});
    document.getElementById('catsMB')?.addEventListener('click', e=>{
        if(e.target.id==='addCatBtn'){const v=document.getElementById('newCatInp')?.value.trim();if(!v||stockCats.includes(v))return;stockCats.push(v);saveCats(stockCats);document.getElementById('catsMB').innerHTML=renderCatsBody();}
        const dc=e.target.closest('[data-delcat]');if(dc){stockCats.splice(parseInt(dc.dataset.delcat),1);saveCats(stockCats);document.getElementById('catsMB').innerHTML=renderCatsBody();}
    });

    // bulk
    document.getElementById('bkDel')?.addEventListener('click', ()=>{if(!selectedIds.size)return;if(confirm('حذف '+selectedIds.size+' منتج؟')){stockData=stockData.filter(p=>!selectedIds.has(p.id));saveStock(stockData);selectedIds.clear();window.rStock();showToast('✅ تم الحذف','success');}});
    document.getElementById('bkPdf')?.addEventListener('click', ()=>{const items=stockData.filter(p=>selectedIds.has(p.id));if(items.length)generatePDF(items,localStorage.getItem('sp_company_name')||'Sales Pro');});
    document.getElementById('bkClr')?.addEventListener('click', ()=>{selectedIds.clear();updateBulk();reRender();});

    // PDF modal
    document.getElementById('stkPdfBtn')?.addEventListener('click', ()=>document.getElementById('pdfModal').classList.add('on'));
    ['pdfMClose','pdfMCancel'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>document.getElementById('pdfModal').classList.remove('on')));
    document.getElementById('pdfModal')?.addEventListener('click',e=>{if(e.target.id==='pdfModal')e.target.classList.remove('on');});
    document.querySelectorAll('.pdf-opt').forEach(o=>o.addEventListener('click',()=>{document.querySelectorAll('.pdf-opt').forEach(x=>x.classList.remove('on'));o.classList.add('on');}));
    document.getElementById('pdfMGen')?.addEventListener('click', ()=>{
        const opt=document.querySelector('.pdf-opt.on')?.dataset.opt||'all';
        const co=document.getElementById('pdfCompany')?.value||'Sales Pro';
        localStorage.setItem('sp_company_name',co);
        const items=opt==='all'?stockData:opt==='filtered'?getFilteredStock():stockData.filter(p=>selectedIds.has(p.id));
        document.getElementById('pdfModal').classList.remove('on');
        generatePDF(items,co);
    });

    // Excel modal
    let parsedRows=[];
    document.getElementById('stkXlBtn')?.addEventListener('click',()=>{
        parsedRows=[];
        document.getElementById('xlFileInp').value='';
        document.getElementById('xlDC').style.display='block';
        document.getElementById('xlCC').style.display='none';
        document.getElementById('xlPS').style.display='none';
        document.getElementById('xlPW').style.display='none';
        const cb=document.getElementById('xlMOK');if(cb){cb.disabled=true;cb.style.opacity='.45';}
        document.getElementById('xlModal').classList.add('on');
    });
    ['xlMClose','xlMCancel'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>document.getElementById('xlModal').classList.remove('on')));
    document.getElementById('xlModal')?.addEventListener('click',e=>{if(e.target.id==='xlModal')e.target.classList.remove('on');});
    document.querySelectorAll('.xl-mc').forEach(c=>c.addEventListener('click',()=>{document.querySelectorAll('.xl-mc').forEach(x=>x.classList.remove('on'));c.classList.add('on');}));

    const xlDrop=document.getElementById('xlDrop');
    if(xlDrop){
        xlDrop.addEventListener('click',e=>{if(!e.target.closest('button'))document.getElementById('xlFileInp')?.click();});
        xlDrop.addEventListener('dragover',e=>{e.preventDefault();xlDrop.classList.add('over');});
        xlDrop.addEventListener('dragleave',()=>xlDrop.classList.remove('over'));
        xlDrop.addEventListener('drop',e=>{e.preventDefault();xlDrop.classList.remove('over');const f=e.dataTransfer.files[0];if(f)handleXL(f);});
    }
    document.getElementById('xlFileInp')?.addEventListener('change',e=>{const f=e.target.files[0];if(f)handleXL(f);});

    function handleXL(file){
        if(typeof XLSX==='undefined'){showToast('❌ مكتبة Excel غير محملة','error');return;}
        const r=new FileReader();
        r.onload=ev=>{
            try{
                const wb=XLSX.read(new Uint8Array(ev.target.result),{type:'array'});
                const ws=wb.Sheets[wb.SheetNames[0]];
                const raw=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
                parsedRows=[];
                for(let i=1;i<raw.length;i++){
                    const rx=raw[i];
                    if(!rx[0]&&!rx[1])continue;
                    
                    // Exact Mapping based on User's Sheet
                    const code = String(rx[0]||'').trim();
                    const name = String(rx[1]||'').trim();
                    const qtyOnHand = rx[2] !== '' ? parseInt(rx[2]) : null;
                    const qty = rx[3] !== '' ? parseInt(rx[3]) : null;
                    const price = parseFloat(String(rx[4]||'0').replace(/,/g,''))||0;
                    const cost = parseFloat(String(rx[5]||'0').replace(/,/g,''))||0;
                    const bestPrice = parseFloat(String(rx[6]||'0').replace(/,/g,''))||0;
                    const brand = String(rx[7]||'').trim();
                    const itemClass = String(rx[8]||'').trim();

                    parsedRows.push({
                        id:uid(), importOrder:i-1,
                        code, name, price, cost, bestPrice,
                        brand, category:itemClass, itemClass, description:name,
                        qtyOnHand, qty, image:null,
                        createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
                    });
                }
                document.getElementById('xlDC').style.display='none';
                document.getElementById('xlCC').style.display='block';
                document.getElementById('xlFN').textContent='📄 '+file.name;
                document.getElementById('xlRC').textContent=fmtNum(parsedRows.length)+' منتج جاهز للاستيراد';
                document.getElementById('xlPB').innerHTML=parsedRows.slice(0,5).map(p=>`<tr><td>${p.code}</td><td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</td><td>${p.qty!=null?p.qty:'-'}</td><td>${fmtPrice(p.price)}</td><td>${fmtPrice(p.cost)}</td><td>${fmtPrice(p.bestPrice)}</td></tr>`).join('');
                document.getElementById('xlPS').style.display='block';
                const cb=document.getElementById('xlMOK');if(cb){cb.disabled=false;cb.style.opacity='1';}
                const brands=[...new Set(parsedRows.map(p=>p.brand).filter(Boolean))];
                brands.forEach(b=>{if(!stockCats.includes(b))stockCats.push(b);});saveCats(stockCats);
            }catch(err){showToast('❌ خطأ: '+err.message,'error');console.error(err);}
        };
        r.readAsArrayBuffer(file);
    }

    document.getElementById('xlMOK')?.addEventListener('click',async()=>{
        if(!parsedRows.length)return;
        const mode=document.querySelector('input[name="xlMode"]:checked')?.value||'replace';
        const pw=document.getElementById('xlPW');const pf=document.getElementById('xlPF');const pt=document.getElementById('xlPT');const cb=document.getElementById('xlMOK');
        if(pw)pw.style.display='block';if(cb){cb.disabled=true;cb.style.opacity='.45';}
        if(mode==='replace'){stockData=parsedRows;if(pf)pf.style.width='100%';}
        else{parsedRows.forEach((np,idx)=>{const ei=stockData.findIndex(p=>p.code&&p.code===np.code);if(ei!==-1){const ex=stockData[ei];stockData[ei]={...np,id:ex.id,image:ex.image,createdAt:ex.createdAt};}else stockData.push(np);if(pf)pf.style.width=Math.round(((idx+1)/parsedRows.length)*100)+'%';});}
        if(pt)pt.textContent='تم! جاري الحفظ...';
        saveStock(stockData);
        await new Promise(res=>setTimeout(res,500));
        document.getElementById('xlModal').classList.remove('on');
        showToast('✅ تم استيراد '+fmtNum(parsedRows.length)+' منتج!','success');
        parsedRows=[];window.rStock();
    });

    // Add/Edit modal
    let curImg=null;
    document.getElementById('stkMClose')?.addEventListener('click',closeModal);
    document.getElementById('stkMCancel')?.addEventListener('click',closeModal);
    document.getElementById('stkModal')?.addEventListener('click',e=>{if(e.target.id==='stkModal')closeModal();});

    const imgFile=document.getElementById('stkImgFile');
    const imgArea=document.getElementById('stkImgArea');
    const imgPh=document.getElementById('stkImgPh');
    const imgPrev=document.getElementById('stkImgPrev');
    const imgRm=document.getElementById('stkImgRm');

    imgArea?.addEventListener('click',e=>{if(!e.target.closest('button'))imgFile?.click();});
    imgFile?.addEventListener('change',async e=>{
        const f=e.target.files[0];if(!f)return;
        if(f.size>5*1024*1024){showToast('❌ أكبر من 5MB','error');return;}
        try{let b=await fileToB64(f);b=await resizeB64(b);curImg=b;imgPrev.src=b;imgPrev.style.display='block';imgPh.style.display='none';imgRm.style.display='block';imgArea.classList.add('has-img');}
        catch{showToast('❌ خطأ في الصورة','error');}
    });
    imgRm?.addEventListener('click',e=>{e.stopPropagation();curImg=null;imgPrev.src='';imgPrev.style.display='none';imgPh.style.display='block';imgRm.style.display='none';imgArea.classList.remove('has-img');if(imgFile)imgFile.value='';});

    document.getElementById('stkMSave')?.addEventListener('click',()=>{
        const name=document.getElementById('mfName')?.value.trim();
        if(!name){showToast('❌ أدخل اسم المنتج','error');return;}
        const qv=document.getElementById('mfQty')?.value.trim();
        const qh=document.getElementById('mfQtyOnHand')?.value.trim();
        const product={
            id:editingId||uid(),
            importOrder:editingId?(stockData.find(p=>p.id===editingId)?.importOrder??stockData.length):stockData.length,
            name,
            code:document.getElementById('mfCode')?.value.trim()||'',
            brand:document.getElementById('mfBrand')?.value.trim()||'',
            category:document.getElementById('mfCat')?.value||'',
            itemClass:document.getElementById('mfCat')?.value||'',
            price:parseFloat(document.getElementById('mfPrice')?.value)||0,
            cost:parseFloat(document.getElementById('mfCost')?.value)||0,
            bestPrice:parseFloat(document.getElementById('mfBest')?.value)||0,
            qtyOnHand:qh===''?null:Math.max(0,parseInt(qh)||0),
            qty:qv===''?null:Math.max(0,parseInt(qv)||0),
            description:document.getElementById('mfDesc')?.value.trim()||'',
            image:curImg,
            updatedAt:new Date().toISOString()
        };
        if(editingId){const i=stockData.findIndex(p=>p.id===editingId);if(i!==-1)stockData[i]={...stockData[i],...product,image:curImg??stockData[i].image};showToast('✅ تم التحديث','success');}
        else{product.createdAt=product.updatedAt;stockData.unshift(product);showToast('✅ تم الإضافة','success');}
        saveStock(stockData);closeModal();window.rStock();
    });

    function openModal(id){
        editingId=id||null;curImg=null;
        document.getElementById('stkModal').classList.add('on');
        document.getElementById('stkMTitle').textContent=id?'✏️ تعديل المنتج':'＋ منتج جديد';
        ['mfName','mfCode','mfBrand','mfPrice','mfCost','mfBest','mfQty','mfQtyOnHand','mfDesc'].forEach(fid=>{const el=document.getElementById(fid);if(el)el.value='';});
        if(imgPrev){imgPrev.src='';imgPrev.style.display='none';}
        if(imgPh)imgPh.style.display='block';
        if(imgRm)imgRm.style.display='none';
        if(imgArea)imgArea.classList.remove('has-img');
        if(imgFile)imgFile.value='';
        if(id){
            const p=stockData.find(x=>x.id===id);if(!p)return;
            document.getElementById('mfName').value=p.name||'';
            document.getElementById('mfCode').value=p.code||'';
            document.getElementById('mfBrand').value=p.brand||'';
            document.getElementById('mfPrice').value=p.price||'';
            document.getElementById('mfCost').value=p.cost||'';
            document.getElementById('mfBest').value=p.bestPrice||'';
            document.getElementById('mfQty').value=p.qty!=null?p.qty:'';
            document.getElementById('mfQtyOnHand').value=p.qtyOnHand!=null?p.qtyOnHand:'';
            document.getElementById('mfDesc').value=p.description||'';
            const cs=document.getElementById('mfCat');if(cs)[...cs.options].forEach(o=>o.selected=o.value===p.category);
            if(p.image){curImg=p.image;imgPrev.src=p.image;imgPrev.style.display='block';imgPh.style.display='none';imgRm.style.display='block';imgArea.classList.add('has-img');}
        }
    }
    function closeModal(){document.getElementById('stkModal').classList.remove('on');editingId=null;}
}

function toggleSel(id){if(selectedIds.has(id))selectedIds.delete(id);else selectedIds.add(id);updateBulk();reRender();}
function confDel(id){const p=stockData.find(x=>x.id===id);if(!p)return;if(confirm('حذف "'+p.name+'"؟')){stockData=stockData.filter(x=>x.id!==id);saveStock(stockData);selectedIds.delete(id);window.rStock();showToast('✅ تم الحذف','success');}}

function showToast(msg,type){if(typeof window.toast==='function'){window.toast(msg,type);return;}const t=document.getElementById('TT');if(!t)return;t.textContent=msg;t.className='toast show';setTimeout(()=>t.className='toast',3000);}

/* ══════════════════════════════════════════════════════════
   PDF CATALOG — ENTERPRISE (3 PRICES)
══════════════════════════════════════════════════════════ */
async function generatePDF(items, company) {
    if(!items?.length){showToast('❌ لا توجد منتجات','error');return;}
    showToast('⏳ جاري إنشاء الكتالوج...','info');
    const date=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
    const grouped={};const go=[];
    items.forEach(p=>{const k=p.brand||p.category||'أخرى';if(!grouped[k]){grouped[k]=[];go.push(k);}grouped[k].push(p);});

    const sections=go.map(brand=>{
        const prods=grouped[brand];
        return `<div class="pdf-section">
<div class="pdf-bh"><div class="pdf-bn">${brand}</div><div class="pdf-bc">${prods.length} منتج</div></div>
<div class="pdf-grid">${prods.map(p=>`
<div class="pdf-card">
  ${p.image?`<img src="${p.image}" alt="${p.name}" class="pdf-img">`:'<div class="pdf-img-ph">📦</div>'}
  <div class="pdf-cb">
    ${p.code?`<div class="pdf-code">${p.code}</div>`:''}
    <div class="pdf-name">${p.name}</div>
    ${p.itemClass?`<div class="pdf-cls">${p.itemClass}</div>`:''}
    <div class="pdf-prices">
      <div class="pdf-pu"><span>User</span>${fmtPrice(p.price)}</div>
      <div class="pdf-pd"><span>Dealer</span>${fmtPrice(p.cost)}</div>
      <div class="pdf-pb"><span>Best</span>${fmtPrice(p.bestPrice)}</div>
    </div>
    <div style="display:flex;gap:5px;align-items:center;margin-top:6px;">
        ${p.qty!=null?`<div class="pdf-qty ${p.qty<=0?'pqo':p.qty<=lowThreshold?'pql':'pqk'}">${p.qty<=0?'نفد المتاح':'متاح: '+p.qty}</div>`:''}
        ${p.qtyOnHand!=null?`<div class="pdf-qty-oh">فعلي: ${p.qtyOnHand}</div>`:''}
    </div>
  </div>
</div>`).join('')}</div></div>`;
    }).join('');

    const html=`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Tajawal',sans-serif;background:#f8fafc;color:#0f172a;direction:rtl;}
.pdf-cover{background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:60px 52px;}
.pdf-co{font-size:1.5rem;font-weight:900;margin-bottom:6px;}.pdf-dt{font-size:.8rem;opacity:.6;margin-bottom:28px;}
.pdf-h1{font-size:2.6rem;font-weight:900;line-height:1.15;margin-bottom:24px;}.pdf-h1 span{color:#818cf8;}
.pdf-sum{display:flex;gap:28px;}.pdf-si{text-align:center;}.pdf-sv{font-size:1.5rem;font-weight:900;}.pdf-sl{font-size:.68rem;opacity:.6;margin-top:2px;}
.pdf-content{padding:36px 48px;}
.pdf-toc{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:28px;}
.pdf-toc-t{font-size:.75rem;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;}
.pdf-toc-g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.pdf-toc-i{font-size:.76rem;color:#334155;display:flex;align-items:center;gap:7px;}
.pdf-toc-d{width:7px;height:7px;border-radius:50%;background:#4f46e5;flex-shrink:0;}
.pdf-section{margin-bottom:36px;page-break-inside:avoid;}
.pdf-bh{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:linear-gradient(135deg,#1e293b,#334155);color:#fff;border-radius:10px 10px 0 0;}
.pdf-bn{font-size:1rem;font-weight:900;}.pdf-bc{font-size:.75rem;opacity:.7;background:rgba(255,255,255,.12);padding:2px 10px;border-radius:10px;}
.pdf-grid{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;}
.pdf-card{border-left:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;background:#fff;page-break-inside:avoid;}
.pdf-card:nth-child(3n+1){border-left:none;}
.pdf-img{width:100%;aspect-ratio:1;object-fit:cover;display:block;}.pdf-img-ph{width:100%;aspect-ratio:1;background:linear-gradient(135deg,#f1f5f9,#e2e8f0);display:flex;align-items:center;justify-content:center;font-size:2.2rem;}
.pdf-cb{padding:11px 13px;}
.pdf-code{font-size:.62rem;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px;}
.pdf-name{font-size:.8rem;font-weight:800;color:#0f172a;line-height:1.3;margin-bottom:3px;}
.pdf-cls{font-size:.65rem;color:#94a3b8;margin-bottom:7px;}
.pdf-prices{display:flex;gap:4px;}
.pdf-pu,.pdf-pd,.pdf-pb{flex:1;border-radius:6px;padding:5px;text-align:center;}
.pdf-pu span,.pdf-pd span,.pdf-pb span{display:block;font-size:.55rem;font-weight:800;margin-bottom:1px;text-transform:uppercase;}
.pdf-pu{background:#f0fdf4;color:#15803d;font-size:.7rem;font-weight:900;} .pdf-pu span{color:#16a34a;}
.pdf-pd{background:#eff6ff;color:#1d4ed8;font-size:.7rem;font-weight:800;} .pdf-pd span{color:#3b82f6;}
.pdf-pb{background:#fffbeb;color:#b45309;font-size:.7rem;font-weight:800;} .pdf-pb span{color:#f59e0b;}
.pdf-qty{font-size:.65rem;font-weight:800;padding:2px 8px;border-radius:5px;display:inline-block;}
.pdf-qty-oh{font-size:.6rem;font-weight:700;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:5px;}
.pqk{background:#d1fae5;color:#065f46;}.pql{background:#fef3c7;color:#92400e;}.pqo{background:#fee2e2;color:#991b1b;}
.pdf-footer{background:#0f172a;color:#fff;padding:18px 48px;display:flex;justify-content:space-between;align-items:center;}
.pdf-fc{font-size:.82rem;font-weight:800;}.pdf-fm{font-size:.72rem;opacity:.5;}
@media print{.pdf-card,.pdf-section{page-break-inside:avoid;}}
</style></head><body>
<div class="pdf-cover">
  <div class="pdf-co">${company}</div>
  <div class="pdf-dt">كتالوج المنتجات الرسمي</div>
  <div class="pdf-h1">قائمة الأسعار<br><span>والمنتجات المتاحة</span></div>
  <div class="pdf-sum">
    <div class="pdf-si"><div class="pdf-sv">${fmtNum(items.length)}</div><div class="pdf-sl">منتج</div></div>
    <div class="pdf-si"><div class="pdf-sv">${go.length}</div><div class="pdf-sl">براند</div></div>
    <div class="pdf-si"><div class="pdf-sv">${date}</div><div class="pdf-sl">تاريخ الإصدار</div></div>
  </div>
</div>
<div class="pdf-content">
  <div class="pdf-toc">
    <div class="pdf-toc-t">محتويات الكتالوج</div>
    <div class="pdf-toc-g">${go.map(b=>`<div class="pdf-toc-i"><div class="pdf-toc-d"></div><span>${b} (${grouped[b].length})</span></div>`).join('')}</div>
  </div>
  ${sections}
</div>
<div class="pdf-footer"><div class="pdf-fc">${company}</div><div class="pdf-fm">جميع الأسعار بالجنيه المصري · ${date}</div></div>
</body></html>`;

    if(typeof html2pdf!=='undefined'){
        const div=document.createElement('div');div.innerHTML=html;div.style.cssText='position:fixed;top:-9999px;left:-9999px;width:1060px;direction:rtl;';document.body.appendChild(div);
        try{await html2pdf().set({margin:[0,0,0,0],filename:company+'-catalog-'+Date.now()+'.pdf',image:{type:'jpeg',quality:.92},html2canvas:{scale:2,useCORS:true,allowTaint:true,logging:false},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['avoid-all','css']}}).from(div.firstElementChild).save();showToast('✅ تم توليد الكتالوج!','success');}
        catch(e){showToast('❌ خطأ في PDF','error');console.error(e);}
        finally{document.body.removeChild(div);}
    }else{const w=window.open('','_blank');w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),1000);showToast('✅ فتح نافذة الطباعة','success');}
}

})();
