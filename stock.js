/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  STOCK COMMAND CENTER — Sales Pro Enterprise v4.5   ║
 * ║  Ultra-Clean Luxury UI • Full Localization • 3-Tier  ║
 * ╚══════════════════════════════════════════════════════╝
 */
(function () {
'use strict';

/* ══════════════════════════════════════════════════════════
   STORAGE & STATE
══════════════════════════════════════════════════════════ */
const t = (ar, en) => (typeof L !== 'undefined' && L === 'en') ? en : ar;
const STOCK_KEY    = 'sp_stock_v1';
const CATS_KEY     = 'sp_stock_cats_v1';
const SETTINGS_KEY = 'sp_stock_settings_v1';

const loadStock    = () => { try { return JSON.parse(localStorage.getItem(STOCK_KEY)) || []; } catch(e) { return []; } };
const saveStock    = d  => localStorage.setItem(STOCK_KEY, JSON.stringify(d));
const loadCats     = () => { try { const s = JSON.parse(localStorage.getItem(CATS_KEY)); return s && s.length ? s : [t('إلكترونيات','Electronics'),t('أجهزة','Appliances'),t('ملابس','Clothing'),t('أخرى','Other')]; } catch(e) { return [t('إلكترونيات','Electronics'),t('أجهزة','Appliances'),t('ملابس','Clothing'),t('أخرى','Other')]; } };
const saveCats     = d  => localStorage.setItem(CATS_KEY, JSON.stringify(d));
const loadSettings = () => { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch(e) { return {}; } };
const saveSettings = d  => localStorage.setItem(SETTINGS_KEY, JSON.stringify(d));

let stockData      = loadStock();
let stockCats      = loadCats();
let settings       = loadSettings();
let stockFilter    = '';
let stockCatFilter = 'all';
let stockSort      = settings.lastSort || 'import';
let currentView    = settings.lastView || 'list';
let editingId      = null;
let selectedIds    = new Set();
let lowThreshold   = Number(settings.lowThreshold) || 10;
let showAlerts     = settings.showAlerts !== false;

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ══════════════════════════════════════════════════════════
   HELPERS & FORMATTING (Standardized Western Numerals)
══════════════════════════════════════════════════════════ */
const fmtPrice = n => (!n && n !== 0) ? '—' :
    Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + t('ج.م','EGP');

const fmtNum = n => Number(n || 0).toLocaleString('en-US');

const qtyState = q => (q === null || q === undefined) ? 'unset' : q <= 0 ? 'out' : q <= lowThreshold ? 'low' : 'ok';

const qtyBadge = (avail, onHand) => {
    const s = qtyState(avail);
    const styles = { 
        unset: 'background:rgba(148,163,184,0.12);color:#94a3b8;border:1px solid rgba(148,163,184,0.2);', 
        out:   'background:rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25);', 
        low:   'background:rgba(245,158,11,0.12);color:#f59e0b;border:1px solid rgba(245,158,11,0.25);', 
        ok:    'background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.25);' 
    };
    const labels = { 
        unset: t('— غير محدد','— Unset'), 
        out:   t('🚫 نفد المتاح','🚫 Out of Stock'), 
        low:   t('⚠️ متاح: ','⚠️ Avail: ') + fmtNum(avail), 
        ok:    t('✅ متاح: ','✅ Avail: ') + fmtNum(avail) 
    };
    const hTxt = onHand != null ? t(` · فعلي: ${fmtNum(onHand)}`,` · On Hand: ${fmtNum(onHand)}`) : '';
    return `<span class="qty-badge" style="${styles[s]}" title="${t('متاح: ','Avail: ')}${avail||0}${t(' / فعلي: ',' / On Hand: ')}${onHand||0}">${labels[s]}${hTxt}</span>`;
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
        .sort((a, b) => (a.qty||0) - (b.qty||0));
    const allBrands = [...new Set(stockData.map(p => p.brand || p.category).filter(Boolean))].sort();

    M.innerHTML = `
<style>
.stk-page { display: flex; flex-direction: column; gap: 18px; font-family: inherit; width: 100%; max-width: 100%; box-sizing: border-box; }
.stk-topbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; width: 100%; box-sizing: border-box; }
.stk-brand-wrap { display: flex; align-items: center; gap: 14px; }
.stk-logo { width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg,#3b82f6,#6366f1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 18px rgba(59,130,246,0.35); flex-shrink: 0; }
.stk-title { font-size: 1.45rem; font-weight: 900; color: var(--tx1,#f8fafc); letter-spacing: -0.02em; line-height: 1.2; }
.stk-subtitle { font-size: 0.8rem; color: var(--tx3,#94a3b8); margin-top: 3px; font-weight: 500; }
.stk-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

.sbtn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 15px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.18s cubic-bezier(0.4,0,0.2,1); font-family: inherit; white-space: nowrap; }
.sbtn:hover { transform: translateY(-1px); }
.sbtn:active { transform: translateY(0); }
.sbtn-primary { background: linear-gradient(135deg,#3b82f6,#2563eb); color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.35); }
.sbtn-danger { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }
.sbtn-danger:hover { background: #ef4444; color: #fff; }
.sbtn-ghost { background: var(--bg2,#1e293b); color: var(--tx2,#cbd5e1); border: 1px solid var(--bd,rgba(255,255,255,0.08)); }
.sbtn-ghost:hover { border-color: #3b82f6; color: #3b82f6; background: var(--bg3,#0f172a); }
.sbtn-pdf { background: linear-gradient(135deg,#f97316,#ea580c); color: #fff; box-shadow: 0 4px 14px rgba(234,88,12,0.3); }
.sbtn-excel { background: linear-gradient(135deg,#10b981,#059669); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,0.3); }
.sbtn-sm { padding: 7px 12px; font-size: 0.76rem; border-radius: 8px; }

.stk-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; width: 100%; box-sizing: border-box; }
.kpi-card { background: var(--bg2,#1e293b); border: 1px solid var(--bd,rgba(255,255,255,0.08)); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; position: relative; overflow: hidden; transition: all 0.2s; }
.kpi-card::before { content: ''; position: absolute; top: 0; right: 0; width: 3px; height: 100%; }
.kpi-blue::before { background: #3b82f6; } .kpi-blue .kpi-val { color: #3b82f6; }
.kpi-green::before { background: #10b981; } .kpi-green .kpi-val { color: #10b981; }
.kpi-amber::before { background: #f59e0b; } .kpi-amber .kpi-val { color: #f59e0b; }
.kpi-red::before { background: #ef4444; } .kpi-red .kpi-val { color: #ef4444; }
.kpi-purple::before { background: #8b5cf6; } .kpi-purple .kpi-val { color: #8b5cf6; }
.kpi-gray::before { background: #64748b; } .kpi-gray .kpi-val { color: #94a3b8; }
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); border-color: rgba(255,255,255,0.16); }
.kpi-icon { font-size: 1.15rem; }
.kpi-label { font-size: 0.68rem; font-weight: 700; color: var(--tx3,#94a3b8); text-transform: uppercase; letter-spacing: 0.05em; }
.kpi-val { font-size: 1.45rem; font-weight: 900; letter-spacing: -0.02em; line-height: 1.1; font-family: inherit; }
.kpi-sub { font-size: 0.68rem; color: var(--tx3,#94a3b8); }

.kpi-stepper { display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; }
.kpi-st-btn { width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--bd,rgba(255,255,255,0.1)); background: var(--bg3,#0f172a); color: var(--tx1,#f8fafc); font-size: 0.85rem; font-weight: 800; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.12s; }
.kpi-st-btn:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; }

.stk-alert-box { background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.04)); border: 1px solid rgba(239,68,68,0.25); border-radius: 14px; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; width: 100%; box-sizing: border-box; }
.stk-alert-hdr { display: flex; align-items: center; justify-content: space-between; }
.stk-alert-title { font-size: 0.84rem; font-weight: 800; color: #ef4444; display: flex; align-items: center; gap: 8px; }
.stk-alert-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; width: 100%; }
.alert-chip { display: flex; align-items: center; gap: 8px; background: var(--bg2,#1e293b); border: 1px solid var(--bd,rgba(255,255,255,0.08)); border-radius: 9px; padding: 6px 10px; cursor: pointer; transition: 0.15s; flex-shrink: 0; min-width: 180px; max-width: 240px; }
.alert-chip:hover { border-color: #3b82f6; transform: translateY(-1px); }
.alert-chip-img { width: 30px; height: 30px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.alert-chip-ph { width: 30px; height: 30px; border-radius: 6px; background: var(--bg3,#0f172a); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
.alert-chip-info { flex: 1; min-width: 0; }
.alert-chip-code { font-size: 0.62rem; color: var(--tx3,#94a3b8); font-weight: 700; }
.alert-chip-name { font-size: 0.72rem; font-weight: 700; color: var(--tx1,#f8fafc); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.alert-chip-qty { font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 5px; white-space: nowrap; }
.chip-out { background: rgba(239,68,68,0.2); color: #ef4444; }
.chip-low { background: rgba(245,158,11,0.2); color: #f59e0b; }

.stk-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; background: var(--bg2,#1e293b); border: 1px solid var(--bd,rgba(255,255,255,0.08)); border-radius: 14px; padding: 10px 14px; width: 100%; box-sizing: border-box; }
.stk-sw { flex: 1; min-width: 200px; position: relative; }
.stk-sw input { width: 100%; padding: 8px 36px 8px 12px; border-radius: 8px; border: 1px solid var(--bd,rgba(255,255,255,0.08)); background: var(--bg3,#0f172a); color: var(--tx1,#f8fafc); font-size: 0.82rem; font-family: inherit; box-sizing: border-box; transition: 0.2s; }
body.en .stk-sw input { padding: 8px 12px 8px 36px; }
.stk-sw input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.stk-si { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: var(--tx3,#94a3b8); font-size: 0.85rem; pointer-events: none; }
body.en .stk-si { right: auto; left: 11px; }
.stk-sel { padding: 8px 11px; border-radius: 8px; border: 1px solid var(--bd,rgba(255,255,255,0.08)); background: var(--bg3,#0f172a); color: var(--tx1,#f8fafc); font-size: 0.8rem; font-family: inherit; cursor: pointer; }
.stk-sel:focus { outline: none; border-color: #3b82f6; }
.vbtns { display: flex; gap: 3px; }
.vbtn { width: 32px; height: 32px; border-radius: 7px; border: 1px solid var(--bd,rgba(255,255,255,0.08)); background: var(--bg3,#0f172a); color: var(--tx3,#94a3b8); cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: 0.15s; }
.vbtn.on { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.stk-cnt { font-size: 0.78rem; color: var(--tx3,#94a3b8); font-weight: 700; white-space: nowrap; background: var(--bg3,#0f172a); padding: 5px 10px; border-radius: 7px; }

.stk-sec-lbl { font-size: 0.7rem; font-weight: 800; color: var(--tx3,#94a3b8); text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 0; border-bottom: 1px solid var(--bd,rgba(255,255,255,0.08)); margin: 12px 0 8px; display: flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box; }
.stk-sec-cnt { background: var(--bg3,#0f172a); padding: 2px 8px; border-radius: 12px; font-size: 0.68rem; }

.stk-list { display: flex; flex-direction: column; gap: 6px; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.stk-row { display: grid; grid-template-columns: 24px 44px 1fr 180px 140px 100px 70px; min-width: 680px; align-items: center; gap: 10px; background: var(--bg2,#1e293b); border: 1px solid var(--bd,rgba(255,255,255,0.08)); border-radius: 10px; padding: 10px 14px; transition: 0.15s; }
.stk-row:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.stk-row.selected { border-color: #3b82f6; background: rgba(59,130,246,0.06); }
.stk-row.row-out { border-right: 3px solid #ef4444; }
.stk-row.row-low { border-right: 3px solid #f59e0b; }
body.en .stk-row.row-out { border-right: 1px solid var(--bd); border-left: 3px solid #ef4444; }
body.en .stk-row.row-low { border-right: 1px solid var(--bd); border-left: 3px solid #f59e0b; }
.stk-ck { width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid var(--bd,rgba(255,255,255,0.2)); background: var(--bg3,#0f172a); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: 0.15s; font-size: 0.65rem; color: transparent; }
.stk-row.selected .stk-ck { background: #3b82f6; border-color: #3b82f6; color: #fff; }
.stk-ri { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: var(--bg3,#0f172a); }
.stk-riph { width: 38px; height: 38px; border-radius: 8px; background: var(--bg3,#0f172a); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.stk-inf { min-width: 0; }
.stk-icode { font-size: 0.62rem; color: var(--tx3,#94a3b8); font-weight: 700; letter-spacing: 0.04em; }
.stk-iname { font-size: 0.82rem; font-weight: 700; color: var(--tx1,#f8fafc); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stk-ibrand { font-size: 0.68rem; color: #3b82f6; font-weight: 600; }

.stk-prices-box { display: flex; flex-direction: column; gap: 2px; }
.sp-tier { display: flex; justify-content: space-between; font-size: 0.72rem; align-items: center; background: var(--bg3,#0f172a); padding: 2px 6px; border-radius: 4px; }
.sp-tier-l { color: var(--tx3,#94a3b8); font-weight: 700; font-size: 0.62rem; }
.sp-tier-v { font-weight: 800; }
.sp-tu .sp-tier-v { color: #10b981; } .sp-td .sp-tier-v { color: #3b82f6; } .sp-tb .sp-tier-v { color: #f59e0b; }

.qty-badge { font-size: 0.68rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; white-space: nowrap; display: inline-flex; align-items: center; gap: 3px; }
.qty-editor { display: flex; align-items: center; gap: 2px; justify-content: flex-end; }
.qbtn { width: 24px; height: 24px; border-radius: 5px; border: 1px solid var(--bd,rgba(255,255,255,0.08)); background: var(--bg3,#0f172a); color: var(--tx1,#f8fafc); cursor: pointer; font-size: 0.82rem; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: 0.1s; }
.qbtn:hover { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.qinp { width: 44px; text-align: center; padding: 3px 4px; border-radius: 5px; border: 1px solid var(--bd,rgba(255,255,255,0.08)); background: var(--bg2,#1e293b); color: var(--tx1,#f8fafc); font-size: 0.78rem; font-weight: 800; font-family: inherit; }
.qinp:focus { outline: none; border-color: #3b82f6; }

.stk-acts { display: flex; gap: 4px; justify-content: flex-end; }
.abt { width: 26px; height: 26px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; transition: 0.12s; background: var(--bg3,#0f172a); color: var(--tx2,#cbd5e1); }
.abt:hover { background: #3b82f6; color: #fff; }
.abt-del:hover { background: #ef4444 !important; color: #fff; }

.stk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; width: 100%; box-sizing: border-box; }
.stk-gc { background: var(--bg2,#1e293b); border: 1px solid var(--bd,rgba(255,255,255,0.08)); border-radius: 14px; overflow: hidden; transition: 0.2s; position: relative; }
.stk-gc:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.16); border-color: #3b82f6; }
.stk-gc.selected { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.3); }
.stk-gc.g-out { border-top: 3px solid #ef4444; }
.stk-gc.g-low { border-top: 3px solid #f59e0b; }
.gc-sel { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; border-radius: 5px; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(0,0,0,0.3); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.65rem; color: transparent; }
.stk-gc.selected .gc-sel { background: #3b82f6; border-color: #3b82f6; color: #fff; }
.gc-acts { position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; opacity: 0; transition: 0.15s; }
.stk-gc:hover .gc-acts { opacity: 1; }
.gc-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.gc-ph { width: 100%; aspect-ratio: 1; background: var(--bg3,#0f172a); display: flex; align-items: center; justify-content: center; font-size: 2.4rem; }
.gc-body { padding: 10px 12px; }
.gc-code { font-size: 0.62rem; color: var(--tx3,#94a3b8); font-weight: 700; }
.gc-name { font-size: 0.82rem; font-weight: 800; color: var(--tx1,#f8fafc); line-height: 1.25; margin: 2px 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.gc-brand { font-size: 0.68rem; color: #3b82f6; font-weight: 600; margin-bottom: 6px; }
.gc-ptiers { display: flex; flex-direction: column; gap: 2px; margin: 6px 0; }
.gc-ptier { display: flex; justify-content: space-between; background: var(--bg3,#0f172a); border-radius: 4px; padding: 2px 6px; align-items: center; }
.gc-pt-l { font-size: 0.62rem; color: var(--tx3,#94a3b8); font-weight: 700; }
.gc-pt-v { font-size: 0.74rem; font-weight: 800; }
.gc-tu .gc-pt-v { color: #10b981; } .gc-td .gc-pt-v { color: #3b82f6; } .gc-tb .gc-pt-v { color: #f59e0b; }
.gc-foot { display: flex; align-items: center; justify-content: space-between; gap: 4px; padding-top: 8px; border-top: 1px solid var(--bd,rgba(255,255,255,0.08)); }
.gc-qw { display: flex; align-items: center; gap: 2px; width: 100%; justify-content: center; }
.gc-qbtn { width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--bd,rgba(255,255,255,0.08)); background: var(--bg3,#0f172a); color: var(--tx1,#f8fafc); cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; }
.gc-qbtn:hover { background: #3b82f6; color: #fff; }
.gc-qv { font-size: 0.76rem; font-weight: 800; min-width: 24px; text-align: center; color: var(--tx1,#f8fafc); }

.stk-bulk { position: sticky; bottom: 60px; left: 0; right: 0; margin: 0 auto; max-width: 460px; background: linear-gradient(135deg,#2563eb,#4f46e5); color: #fff; border-radius: 14px; padding: 10px 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 8px 24px rgba(37,99,235,0.4); transition: all 0.3s; transform: translateY(24px); opacity: 0; pointer-events: none; z-index: 100; }
.stk-bulk.on { transform: translateY(0); opacity: 1; pointer-events: all; }
.stk-empty { text-align: center; padding: 60px 20px; }
.stk-empty-icon { font-size: 3.5rem; margin-bottom: 12px; opacity: 0.6; }

.stk-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0; transition: opacity 0.25s; pointer-events: none; }
.stk-ov.on { opacity: 1; pointer-events: all; }
.stk-m { background: var(--bg1,#0f172a); border: 1px solid var(--bd,rgba(255,255,255,0.12)); border-radius: 18px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.4); transform: scale(0.96); transition: transform 0.25s; }
.stk-ov.on .stk-m { transform: scale(1); }
.stk-mh { padding: 16px 20px; border-bottom: 1px solid var(--bd,rgba(255,255,255,0.08)); display: flex; align-items: center; justify-content: space-between; }
.stk-mt { font-size: 1rem; font-weight: 800; color: var(--tx1,#f8fafc); }
.stk-mc { width: 28px; height: 28px; border-radius: 6px; border: none; background: var(--bg3,#0f172a); color: var(--tx2,#cbd5e1); cursor: pointer; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; }
.stk-mc:hover { background: #ef4444; color: #fff; }
.stk-mb { padding: 18px 20px; }
.stk-mf { padding: 12px 20px; border-top: 1px solid var(--bd,rgba(255,255,255,0.08)); display: flex; gap: 8px; justify-content: flex-end; }
.stk-fg2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.stk-fg3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.stk-full { grid-column: 1 / -1; }
.sfg label { display: block; font-size: 0.74rem; font-weight: 700; color: var(--tx3,#94a3b8); margin-bottom: 4px; }
.sfg input, .sfg select, .sfg textarea { width: 100%; padding: 8px 11px; border-radius: 8px; border: 1px solid var(--bd,rgba(255,255,255,0.08)); background: var(--bg2,#1e293b); color: var(--tx1,#f8fafc); font-size: 0.82rem; font-family: inherit; transition: 0.2s; box-sizing: border-box; }
.sfg input:focus, .sfg select:focus, .sfg textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
.sfg textarea { resize: vertical; min-height: 60px; }

.iup-area { border: 2px dashed var(--bd,rgba(255,255,255,0.12)); border-radius: 10px; cursor: pointer; overflow: hidden; transition: 0.2s; background: var(--bg2,#1e293b); position: relative; }
.iup-area:hover { border-color: #3b82f6; }
.iup-area.has-img { border-style: solid; }
.iup-ph { padding: 18px; text-align: center; }
.iup-icon { font-size: 1.6rem; margin-bottom: 4px; }
.iup-txt { font-size: 0.78rem; color: var(--tx3,#94a3b8); }
.iup-prev { width: 100%; max-height: 160px; object-fit: cover; display: none; }
.iup-rm { position: absolute; top: 6px; left: 6px; background: #ef4444; color: #fff; border: none; border-radius: 6px; padding: 3px 8px; font-size: 0.68rem; cursor: pointer; font-weight: 700; }

.xl-drop { border: 2px dashed var(--bd,rgba(255,255,255,0.12)); border-radius: 12px; padding: 22px; text-align: center; cursor: pointer; transition: 0.2s; background: var(--bg2,#1e293b); margin-bottom: 12px; }
.xl-drop:hover, .xl-drop.over { border-color: #10b981; background: rgba(16,185,129,0.05); }
.xl-map { background: var(--bg2,#1e293b); border: 1px solid var(--bd,rgba(255,255,255,0.08)); border-radius: 10px; padding: 12px; font-size: 0.76rem; margin-bottom: 12px; }
.xl-mg { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px; }
.xl-mi { display: flex; align-items: center; gap: 4px; color: var(--tx2,#cbd5e1); font-size: 0.72rem; }
.xl-modes { display: flex; gap: 8px; margin-bottom: 12px; }
.xl-mc { flex: 1; display: flex; align-items: center; gap: 8px; border: 1.5px solid var(--bd,rgba(255,255,255,0.08)); border-radius: 10px; padding: 9px; cursor: pointer; transition: 0.2s; }
.xl-mc:hover, .xl-mc.on { border-color: #3b82f6; background: rgba(59,130,246,0.06); }
.xl-pt { width: 100%; border-collapse: collapse; font-size: 0.72rem; }
.xl-pt th { padding: 6px 8px; text-align: right; background: var(--bg3,#0f172a); border-bottom: 1px solid var(--bd,rgba(255,255,255,0.08)); font-weight: 700; color: var(--tx2,#cbd5e1); }
.xl-pt td { padding: 6px 8px; border-bottom: 1px solid var(--bd,rgba(255,255,255,0.08)); color: var(--tx1,#f8fafc); }
.xl-pb { height: 5px; background: var(--bg3,#0f172a); border-radius: 99px; overflow: hidden; }
.xl-pf { height: 100%; background: linear-gradient(90deg,#10b981,#34d399); border-radius: 99px; transition: width 0.3s; }

.pdf-opt { display: flex; align-items: center; gap: 10px; border: 1.5px solid var(--bd,rgba(255,255,255,0.08)); border-radius: 10px; padding: 10px 12px; cursor: pointer; transition: 0.2s; margin-bottom: 8px; }
.pdf-opt:hover, .pdf-opt.on { border-color: #3b82f6; background: rgba(59,130,246,0.06); }
.pdf-opt-icon { font-size: 1.5rem; }

@media (max-width: 900px) {
  .stk-kpis { grid-template-columns: repeat(3, 1fr); }
  .stk-row { grid-template-columns: 20px 36px 1fr auto auto; }
  .stk-prices-box, .stk-acts { display: none; }
}
@media (max-width: 500px) {
  .stk-kpis { grid-template-columns: repeat(2, 1fr); }
  .stk-topbar { flex-direction: column; align-items: flex-start; }
}
</style>

<div class="stk-page">

<!-- TOPBAR -->
<div class="stk-topbar">
  <div class="stk-brand-wrap">
    <div class="stk-logo">📦</div>
    <div>
      <div class="stk-title">${t('مركز إدارة المخزون','Stock Command Center')}</div>
      <div class="stk-subtitle">${t('نظام إدارة المخزون والتسعير — ','Inventory & Pricing System — ')}${fmtNum(st.total)} ${t('منتج · ','Items · ')}${st.brands} ${t('براند','Brands')}</div>
    </div>
  </div>
  <div class="stk-actions">
    <button class="sbtn sbtn-primary" id="stkAddBtn">＋ ${t('منتج جديد','New Item')}</button>
    <button class="sbtn sbtn-excel sbtn-sm" id="stkXlBtn">📥 ${t('استيراد Excel','Import Excel')}</button>
    <button class="sbtn sbtn-pdf sbtn-sm" id="stkPdfBtn">📄 ${t('كتالوج PDF','PDF Catalog')}</button>
    <button class="sbtn sbtn-ghost sbtn-sm" id="stkCatsBtn">🗂️ ${t('الفئات','Categories')}</button>
    <button class="sbtn sbtn-danger sbtn-sm" id="stkClearAllBtn">🗑️ ${t('مسح المخزن','Clear Stock')}</button>
  </div>
</div>

<!-- KPIS -->
<div class="stk-kpis">
  <div class="kpi-card kpi-blue">
    <div class="kpi-icon">📦</div>
    <div class="kpi-label">${t('إجمالي المنتجات','Total Items')}</div>
    <div class="kpi-val">${fmtNum(st.total)}</div>
    <div class="kpi-sub">${st.brands} ${t('براند مسجل','Brands')}</div>
  </div>
  <div class="kpi-card kpi-green">
    <div class="kpi-icon">💰</div>
    <div class="kpi-label">${t('قيمة المتاح','Available Value')}</div>
    <div class="kpi-val" style="font-size:1.15rem;">${fmtPrice(st.totalVal)}</div>
    <div class="kpi-sub">${t('بأسعار اليوزر للمتاح','At User Prices')}</div>
  </div>
  <div class="kpi-card kpi-amber">
    <div class="kpi-icon">⚠️</div>
    <div class="kpi-label">${t('متاح منخفض','Low Stock')}</div>
    <div class="kpi-val">${fmtNum(st.lowStock)}</div>
    <div class="kpi-sub">${t('أقل من','Below')} ${lowThreshold} ${t('متاح','avail')}</div>
  </div>
  <div class="kpi-card kpi-red">
    <div class="kpi-icon">🚫</div>
    <div class="kpi-label">${t('نفد المتاح','Out of Stock')}</div>
    <div class="kpi-val">${fmtNum(st.outStock)}</div>
    <div class="kpi-sub">${t('يحتاج إعادة طلب','Needs Reorder')}</div>
  </div>
  <div class="kpi-card kpi-purple">
    <div class="kpi-icon">📋</div>
    <div class="kpi-label">${t('لم تحدد كمية','Qty Unset')}</div>
    <div class="kpi-val">${fmtNum(st.unset)}</div>
    <div class="kpi-sub">${t('انتظار التحديث','Awaiting Update')}</div>
  </div>
  <div class="kpi-card kpi-gray" id="stkThrCard" title="${t('انقر لضبط حد التنبيه','Click to adjust threshold')}">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div class="kpi-icon">🎯</div>
      <div class="kpi-stepper">
        <button class="kpi-st-btn" id="stkThrMinus" title="-">−</button>
        <button class="kpi-st-btn" id="stkThrPlus" title="+">+</button>
      </div>
    </div>
    <div class="kpi-label">${t('حد التنبيه','Alert Threshold')}</div>
    <div class="kpi-val" style="font-size:1.25rem;">${lowThreshold} <span style="font-size:0.7rem;color:var(--tx3);font-weight:600;">${t('قطع','pcs')}</span></div>
    <div class="kpi-sub">${t('تنبيه عند أقل من هذا العدد','Alert when below')}</div>
  </div>
</div>

<!-- URGENT ALERTS (COMPACT & SLEEK) -->
${criticals.length && showAlerts ? `
<div class="stk-alert-box">
  <div class="stk-alert-hdr">
    <div class="stk-alert-title">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;box-shadow:0 0 8px #ef4444;"></span>
      ${t('تنبيه المخزون — ','Stock Alert — ')}${criticals.length} ${t('منتج بحاجة لمتابعة الكمية','items need attention')}
    </div>
    <div style="display:flex;gap:6px;">
      <button class="sbtn sbtn-ghost sbtn-sm" id="stkShowLowBtn">${t('تصفية في الجدول','Filter in list')} (${st.outStock + st.lowStock})</button>
      <button class="sbtn sbtn-ghost sbtn-sm" id="stkHideAlertsBtn" title="${t('إخفاء مؤقت','Hide')}">✕</button>
    </div>
  </div>
  <div class="stk-alert-scroll">
    ${criticals.map(p => `
    <div class="alert-chip" data-edit="${p.id}">
      ${p.image ? `<img class="alert-chip-img" src="${p.image}" alt="">` : `<div class="alert-chip-ph">📦</div>`}
      <div class="alert-chip-info">
        <div class="alert-chip-code">${p.code || '—'}</div>
        <div class="alert-chip-name">${p.name}</div>
      </div>
      <span class="alert-chip-qty ${p.qty <= 0 ? 'chip-out' : 'chip-low'}">${p.qty <= 0 ? t('نفد','Out') : t('متاح: ','Avail: ') + fmtNum(p.qty)}</span>
    </div>`).join('')}
  </div>
</div>` : ''}

<!-- TOOLBAR -->
<div class="stk-toolbar">
  <div class="stk-sw">
    <span class="stk-si">🔍</span>
    <input type="text" id="stkSearch" placeholder="${t('ابحث بالاسم، الكود، البراند...','Search by name, code, brand...')}" value="${stockFilter}">
  </div>
  <select class="stk-sel" id="stkCatSel">
    <option value="all">${t('كل الفئات والبراندات','All Categories & Brands')}</option>
    ${allBrands.map(b => `<option value="${b}" ${stockCatFilter===b?'selected':''}>${b}</option>`).join('')}
  </select>
  <select class="stk-sel" id="stkSortSel">
    <option value="import"     ${stockSort==='import'    ?'selected':''}>📊 ${t('ترتيب الإكسل','Excel Order')}</option>
    <option value="name"       ${stockSort==='name'      ?'selected':''}>🔤 ${t('الاسم أ–ي','Name A-Z')}</option>
    <option value="brand"      ${stockSort==='brand'     ?'selected':''}>🏷️ ${t('البراند','Brand')}</option>
    <option value="price_asc"  ${stockSort==='price_asc' ?'selected':''}>💰 ${t('سعر يوزر: الأقل','User Price: Low')}</option>
    <option value="price_desc" ${stockSort==='price_desc'?'selected':''}>💰 ${t('سعر يوزر: الأعلى','User Price: High')}</option>
    <option value="low_first"  ${stockSort==='low_first' ?'selected':''}>⚠️ ${t('المنخفض أولاً','Low Stock First')}</option>
    <option value="qty_asc"    ${stockSort==='qty_asc'   ?'selected':''}>📉 ${t('المتاح: الأقل','Avail: Low')}</option>
    <option value="qty_desc"   ${stockSort==='qty_desc'  ?'selected':''}>📈 ${t('المتاح: الأكثر','Avail: High')}</option>
  </select>
  <div class="vbtns">
    <button class="vbtn ${currentView==='list'?'on':''}" id="vList" title="${t('عرض قائمة','List View')}">☰</button>
    <button class="vbtn ${currentView==='grid'?'on':''}" id="vGrid" title="${t('عرض شبكة','Grid View')}">⊞</button>
  </div>
  <span class="stk-cnt">${fmtNum(filtered.length)} ${t('منتج','Items')}</span>
</div>

<!-- PRODUCTS CONTAINER -->
<div id="stkProducts">${renderProducts(filtered)}</div>

<!-- BULK BAR -->
<div class="stk-bulk" id="stkBulk">
  <span style="font-weight:700;font-size:0.85rem;" id="stkBulkCnt">0 ${t('محدد','Selected')}</span>
  <div style="display:flex;gap:6px;">
    <button class="sbtn sbtn-pdf sbtn-sm" id="bkPdf">📄 ${t('PDF للمحدد','PDF for Selected')}</button>
    <button class="sbtn sbtn-danger sbtn-sm" id="bkDel" style="background:#ef4444;color:#fff;">🗑️ ${t('حذف','Delete')}</button>
    <button class="sbtn sbtn-ghost sbtn-sm" id="bkClr">✕</button>
  </div>
</div>
</div>

<!-- ADD/EDIT MODAL -->
<div class="stk-ov" id="stkModal">
  <div class="stk-m">
    <div class="stk-mh"><div class="stk-mt" id="stkMTitle">${t('منتج جديد','New Item')}</div><button class="stk-mc" id="stkMClose">✕</button></div>
    <div class="stk-mb">
      <input type="file" id="stkImgFile" accept="image/*" style="display:none;">
      <div class="stk-full" style="margin-bottom:12px;">
        <label style="font-size:0.74rem;font-weight:700;color:var(--tx3);display:block;margin-bottom:4px;">${t('صورة المنتج','Product Image')}</label>
        <div class="iup-area" id="stkImgArea">
          <div class="iup-ph" id="stkImgPh"><div class="iup-icon">🖼️</div><div class="iup-txt">${t('اضغط لرفع صورة','Click to upload image')}</div></div>
          <img id="stkImgPrev" class="iup-prev" alt="">
          <button class="iup-rm" id="stkImgRm" style="display:none;">✕ ${t('إزالة','Remove')}</button>
        </div>
      </div>
      <div class="stk-fg2">
        <div class="sfg"><label>${t('اسم المنتج *','Item Name *')}</label><input type="text" id="mfName" placeholder="${t('اسم المنتج','Item Name')}"></div>
        <div class="sfg"><label>${t('الكود','Code')}</label><input type="text" id="mfCode" placeholder="مثل: BG-04-U"></div>
        <div class="sfg"><label>${t('البراند','Brand')}</label><input type="text" id="mfBrand" placeholder="مثل: L\'AVVENTO"></div>
        <div class="sfg"><label>${t('الفئة (Item Class)','Category (Item Class)')}</label><select id="mfCat">${stockCats.map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div>
      </div>
      <div class="stk-fg3" style="margin-top:10px;">
        <div class="sfg"><label>${t('سعر User','User Price')}</label><input type="number" id="mfPrice" placeholder="0" min="0" step="0.01"></div>
        <div class="sfg"><label>${t('سعر Dealer','Dealer Price')}</label><input type="number" id="mfCost" placeholder="0" min="0" step="0.01"></div>
        <div class="sfg"><label>Best Price</label><input type="number" id="mfBest" placeholder="0" min="0" step="0.01"></div>
      </div>
      <div class="stk-fg2" style="margin-top:10px;">
        <div class="sfg"><label>${t('الكمية الفعلية (On Hand)','Qty On Hand')}</label><input type="number" id="mfQtyOnHand" placeholder="-" min="0" step="1"></div>
        <div class="sfg"><label>${t('الكمية المتاحة (Available)','Available Qty')}</label><input type="number" id="mfQty" placeholder="-" min="0" step="1"></div>
        <div class="sfg stk-full"><label>${t('الوصف','Description')}</label><textarea id="mfDesc" placeholder="${t('وصف المنتج...','Item description...')}"></textarea></div>
      </div>
    </div>
    <div class="stk-mf">
      <button class="sbtn sbtn-ghost" id="stkMCancel">${t('إلغاء','Cancel')}</button>
      <button class="sbtn sbtn-primary" id="stkMSave">💾 ${t('حفظ','Save')}</button>
    </div>
  </div>
</div>

<!-- PDF MODAL -->
<div class="stk-ov" id="pdfModal">
  <div class="stk-m" style="max-width:420px;">
    <div class="stk-mh"><div class="stk-mt">📄 ${t('تصدير كتالوج PDF','Export PDF Catalog')}</div><button class="stk-mc" id="pdfMClose">✕</button></div>
    <div class="stk-mb">
      <div class="pdf-opt on" data-opt="all"><div class="pdf-opt-icon">📦</div><div><div style="font-weight:800;font-size:0.88rem;color:var(--tx1);">${t('كل المنتجات','All Items')}</div><div style="font-size:0.74rem;color:var(--tx3);">${fmtNum(stockData.length)} ${t('منتج','Items')}</div></div></div>
      <div class="pdf-opt" data-opt="filtered"><div class="pdf-opt-icon">🔍</div><div><div style="font-weight:800;font-size:0.88rem;color:var(--tx1);">${t('المفلتر الحالي','Currently Filtered')}</div><div style="font-size:0.74rem;color:var(--tx3);">${fmtNum(filtered.length)} ${t('منتج','Items')}</div></div></div>
      <div class="pdf-opt ${selectedIds.size===0?'':'on'}" data-opt="selected" style="${selectedIds.size===0?'opacity:0.4;pointer-events:none;':''}"><div class="pdf-opt-icon">✅</div><div><div style="font-weight:800;font-size:0.88rem;color:var(--tx1);">${t('المحدد فقط','Selected Only')}</div><div style="font-size:0.74rem;color:var(--tx3);">${selectedIds.size} ${t('منتج','Items')}</div></div></div>
      <div class="sfg" style="margin-top:12px;"><label style="font-size:0.74rem;font-weight:700;color:var(--tx3);display:block;margin-bottom:4px;">${t('اسم الشركة في الكتالوج','Company Name in Catalog')}</label><input type="text" id="pdfCompany" value="${localStorage.getItem('sp_company_name')||'Sales Pro'}"></div>
    </div>
    <div class="stk-mf">
      <button class="sbtn sbtn-ghost" id="pdfMCancel">${t('إلغاء','Cancel')}</button>
      <button class="sbtn sbtn-pdf" id="pdfMGen">📄 ${t('توليد الكتالوج','Generate Catalog')}</button>
    </div>
  </div>
</div>

<!-- EXCEL MODAL -->
<div class="stk-ov" id="xlModal">
  <div class="stk-m" style="max-width:540px;">
    <div class="stk-mh"><div class="stk-mt">📥 ${t('استيراد من Excel','Import from Excel')}</div><button class="stk-mc" id="xlMClose">✕</button></div>
    <div class="stk-mb">
      <input type="file" id="xlFileInp" accept=".xlsx,.xls,.csv" style="display:none;">
      <div class="xl-drop" id="xlDrop">
        <div id="xlDC">
          <div style="font-size:1.8rem;margin-bottom:6px;pointer-events:none;">📊</div>
          <div style="font-weight:800;font-size:0.88rem;color:var(--tx1);margin-bottom:4px;pointer-events:none;">${t('اسحب ملف Excel هنا','Drag Excel file here')}</div>
          <div style="font-size:0.74rem;color:var(--tx3);margin-bottom:10px;pointer-events:none;">.xlsx / .xls / .csv</div>
          <button class="sbtn sbtn-excel sbtn-sm" onclick="document.getElementById('xlFileInp').click();event.stopPropagation();">📂 ${t('اختار الملف','Choose File')}</button>
        </div>
        <div id="xlCC" style="display:none;pointer-events:none;">
          <div style="font-size:1.6rem;margin-bottom:4px;">✅</div>
          <div id="xlFN" style="font-weight:800;color:#10b981;font-size:0.84rem;"></div>
          <div id="xlRC" style="font-size:0.74rem;color:var(--tx3);margin-top:2px;"></div>
          <button class="sbtn sbtn-ghost sbtn-sm" style="margin-top:8px;pointer-events:all;" onclick="document.getElementById('xlFileInp').click();event.stopPropagation();">🔄 ${t('تغيير','Change')}</button>
        </div>
      </div>
      <div class="xl-map">
        <div style="font-weight:800;font-size:0.76rem;color:var(--tx1);">🗂️ ${t('سيتم قراءة الأعمدة بالترتيب التالي:','Columns will be read in this order:')}</div>
        <div class="xl-mg">
          <div class="xl-mi">1️⃣ ${t('الكود','Code')}</div><div class="xl-mi">2️⃣ ${t('الوصف','Description')}</div>
          <div class="xl-mi">3️⃣ Qty On Hand</div><div class="xl-mi">4️⃣ Available Qty</div>
          <div class="xl-mi">5️⃣ User Price</div><div class="xl-mi">6️⃣ Dealer Price</div>
          <div class="xl-mi">7️⃣ Best Price</div><div class="xl-mi">8️⃣ Brand</div>
          <div class="xl-mi stk-full">9️⃣ Item Class</div>
        </div>
      </div>
      <div class="xl-modes">
        <label class="xl-mc on" id="xlMR"><input type="radio" name="xlMode" value="replace" checked style="accent-color:#3b82f6;"><div><div style="font-weight:800;font-size:0.82rem;color:var(--tx1);">${t('استبدال الكل','Replace All')}</div><div style="font-size:0.68rem;color:var(--tx3);">${t('مسح وإعادة الاستيراد','Clear and re-import')}</div></div></label>
        <label class="xl-mc" id="xlMM"><input type="radio" name="xlMode" value="merge" style="accent-color:#3b82f6;"><div><div style="font-weight:800;font-size:0.82rem;color:var(--tx1);">${t('دمج وتحديث','Merge & Update')}</div><div style="font-size:0.68rem;color:var(--tx3);">${t('تحديث بنفس الكود','Update by code')}</div></div></label>
      </div>
      <div id="xlPS" style="display:none;">
        <div style="font-size:0.74rem;font-weight:700;color:var(--tx2);margin-bottom:6px;">${t('معاينة أول 5 منتجات:','Preview first 5 items:')}</div>
        <div style="overflow-x:auto;border:1px solid var(--bd);border-radius:8px;"><table class="xl-pt"><thead><tr><th>${t('الكود','Code')}</th><th>${t('الاسم','Name')}</th><th>${t('المتاح','Avail')}</th><th>${t('يوزر','User')}</th><th>${t('ديلر','Dealer')}</th><th>Best</th></tr></thead><tbody id="xlPB"></tbody></table></div>
      </div>
      <div id="xlPW" style="display:none;margin-top:10px;">
        <div style="font-size:0.74rem;color:var(--tx2);margin-bottom:4px;" id="xlPT">${t('جاري الاستيراد...','Importing...')}</div>
        <div class="xl-pb"><div class="xl-pf" id="xlPF" style="width:0%"></div></div>
      </div>
    </div>
    <div class="stk-mf">
      <button class="sbtn sbtn-ghost" id="xlMCancel">${t('إلغاء','Cancel')}</button>
      <button class="sbtn sbtn-excel" id="xlMOK" disabled style="opacity:0.45;">📥 ${t('استيراد','Import')}</button>
    </div>
  </div>
</div>

<!-- CATS MODAL -->
<div class="stk-ov" id="catsModal">
  <div class="stk-m" style="max-width:360px;">
    <div class="stk-mh"><div class="stk-mt">🗂️ ${t('إدارة الفئات','Manage Categories')}</div><button class="stk-mc" id="catsMC">✕</button></div>
    <div class="stk-mb" id="catsMB">${renderCatsBody()}</div>
  </div>
</div>
`;

    attachEvents();
};

/* ══════════════════════════════════════════════════════════
   RENDER PRODUCTS (LIST & GRID)
══════════════════════════════════════════════════════════ */
function renderProducts(items) {
    if (!items.length) return `<div class="stk-empty"><div class="stk-empty-icon">📭</div><div style="font-weight:700;font-size:0.95rem;color:var(--tx2);">${t('لا توجد منتجات مطابقة','No items found')}</div></div>`;
    return currentView === 'grid' ? renderGrid(items) : renderList(items);
}

function renderList(items) {
    const groups = {}; const groupOrder = [];
    items.forEach(p => {
        const k = p.brand || p.category || t('أخرى','Other');
        if (!groups[k]) { groups[k] = []; groupOrder.push(k); }
        groups[k].push(p);
    });
    let html = '<div class="stk-list">';
    groupOrder.forEach(brand => {
        const prods = groups[brand];
        html += `<div class="stk-sec-lbl"><span>🏷️ ${brand}</span><span class="stk-sec-cnt">${fmtNum(prods.length)} ${t('منتج','Items')}</span></div>`;
        prods.forEach(p => {
            const qs  = qtyState(p.qty);
            const rc  = qs==='out'?'row-out':qs==='low'?'row-low':'';
            const qv  = (p.qty===null||p.qty===undefined) ? '' : p.qty;
            html += `
<div class="stk-row ${selectedIds.has(p.id)?'selected':''} ${rc}" data-id="${p.id}">
  <div class="stk-ck" data-select="${p.id}">✓</div>
  ${p.image?`<img class="stk-ri" src="${p.image}" alt="" loading="lazy">`:`<div class="stk-riph">📦</div>`}
  <div class="stk-inf">
    <div class="stk-icode">${p.code||'—'} ${p.itemClass?`<span style="color:var(--tx3);">· ${p.itemClass}</span>`:''}</div>
    <div class="stk-iname">${p.name}</div>
    <div class="stk-ibrand">${p.brand||''}</div>
  </div>
  <div class="stk-prices-box">
    <div class="sp-tier sp-tu"><span class="sp-tier-l">${t('يوزر','User')}</span><span class="sp-tier-v">${fmtPrice(p.price)}</span></div>
    <div class="sp-tier sp-td"><span class="sp-tier-l">${t('ديلر','Dealer')}</span><span class="sp-tier-v">${fmtPrice(p.cost)}</span></div>
    <div class="sp-tier sp-tb"><span class="sp-tier-l">Best</span><span class="sp-tier-v">${fmtPrice(p.bestPrice)}</span></div>
  </div>
  <div>${qtyBadge(p.qty, p.qtyOnHand)}</div>
  <div class="qty-editor" title="${t('تعديل المتاح','Edit Available')}">
    <button class="qbtn" data-qminus="${p.id}">−</button>
    <input class="qinp" type="number" value="${qv}" min="0" placeholder="—" data-qinput="${p.id}">
    <button class="qbtn" data-qplus="${p.id}">+</button>
  </div>
  <div class="stk-acts">
    <button class="abt" data-edit="${p.id}" title="${t('تعديل','Edit')}">✏️</button>
    <button class="abt abt-del" data-del="${p.id}" title="${t('حذف','Delete')}">🗑️</button>
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
    <div class="gc-code">${p.code||'—'}</div>
    <div class="gc-name">${p.name}</div>
    <div class="gc-brand">${p.brand||p.category||''}</div>
    ${qtyBadge(p.qty, p.qtyOnHand)}
    <div class="gc-ptiers">
      <div class="gc-ptier gc-tu"><span class="gc-pt-l">${t('يوزر','User')}</span><span class="gc-pt-v">${fmtPrice(p.price)}</span></div>
      <div class="gc-ptier gc-td"><span class="gc-pt-l">${t('ديلر','Dealer')}</span><span class="gc-pt-v">${fmtPrice(p.cost)}</span></div>
      <div class="gc-ptier gc-tb"><span class="gc-pt-l">Best</span><span class="gc-pt-v">${fmtPrice(p.bestPrice)}</span></div>
    </div>
    <div class="gc-foot" title="${t('تعديل المتاح','Edit Available')}">
      <div class="gc-qw">
        <button class="gc-qbtn" data-qminus="${p.id}">−</button>
        <span class="gc-qv">${p.qty!=null?fmtNum(p.qty):'—'}</span>
        <button class="gc-qbtn" data-qplus="${p.id}">+</button>
      </div>
    </div>
  </div>
</div>`;
    }).join('')}</div>`;
}

function renderCatsBody() {
    return `
<div style="display:flex;gap:6px;margin-bottom:10px;">
  <input type="text" id="newCatInp" placeholder="${t('اسم الفئة الجديدة','New Category Name')}" style="flex:1;padding:7px 10px;border-radius:8px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx1);font-family:inherit;font-size:0.8rem;">
  <button class="sbtn sbtn-primary sbtn-sm" id="addCatBtn">+ ${t('إضافة','Add')}</button>
</div>
${stockCats.map((c,i)=>`
<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid var(--bd);border-radius:8px;padding:8px 10px;margin-bottom:5px;">
  <span style="font-weight:600;font-size:0.8rem;color:var(--tx1);">🏷️ ${c}</span>
  ${stockCats.length>1?`<button data-delcat="${i}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.9rem;">🗑️</button>`:''}
</div>`).join('')}`;
}

/* ══════════════════════════════════════════════════════════
   RE-RENDER & EVENTS
══════════════════════════════════════════════════════════ */
function reRender() {
    const c = document.getElementById('stkProducts');
    if (c) c.innerHTML = renderProducts(getFilteredStock());
    const ce = document.querySelector('.stk-cnt');
    if (ce) ce.textContent = fmtNum(getFilteredStock().length) + ' ' + t('منتج','Items');
    updateBulk();
}
function updateBulk() {
    const b = document.getElementById('stkBulk');
    const e = document.getElementById('stkBulkCnt');
    if (!b) return;
    if (selectedIds.size > 0) { b.classList.add('on'); if(e) e.textContent = selectedIds.size + ' ' + t('محدد','Selected'); }
    else b.classList.remove('on');
}

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

function fileToB64(f) { return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsDataURL(f);}); }
async function resizeB64(b64,mw=600,mh=600,q=.82){return new Promise(res=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height;if(w>mw||h>mh){const r=Math.min(mw/w,mh/h);w=Math.round(w*r);h=Math.round(h*r);}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',q));};img.src=b64;});}

function attachEvents() {
    // Toolbar search & filters
    document.getElementById('stkSearch')?.addEventListener('input', e => { stockFilter=e.target.value; reRender(); });
    document.getElementById('stkCatSel')?.addEventListener('change', e => { stockCatFilter=e.target.value; reRender(); });
    document.getElementById('stkSortSel')?.addEventListener('change', e => { stockSort=e.target.value; settings.lastSort=stockSort; saveSettings(settings); reRender(); });
    document.getElementById('vList')?.addEventListener('click', () => { currentView='list'; settings.lastView='list'; saveSettings(settings); document.getElementById('vList').classList.add('on'); document.getElementById('vGrid').classList.remove('on'); reRender(); });
    document.getElementById('vGrid')?.addEventListener('click', () => { currentView='grid'; settings.lastView='grid'; saveSettings(settings); document.getElementById('vGrid').classList.add('on'); document.getElementById('vList').classList.remove('on'); reRender(); });

    // Threshold adjust
    document.getElementById('stkThrMinus')?.addEventListener('click', (e) => {
        e.stopPropagation();
        lowThreshold = Math.max(1, lowThreshold - 1);
        settings.lowThreshold = lowThreshold; saveSettings(settings);
        window.rStock();
    });
    document.getElementById('stkThrPlus')?.addEventListener('click', (e) => {
        e.stopPropagation();
        lowThreshold = lowThreshold + 1;
        settings.lowThreshold = lowThreshold; saveSettings(settings);
        window.rStock();
    });

    // Alert banner actions
    document.getElementById('stkShowLowBtn')?.addEventListener('click', () => {
        stockSort='low_first'; stockCatFilter='all'; stockFilter='';
        document.getElementById('stkSortSel').value='low_first'; reRender();
    });
    document.getElementById('stkHideAlertsBtn')?.addEventListener('click', () => {
        showAlerts = false;
        settings.showAlerts = false;
        saveSettings(settings);
        window.rStock();
    });

    // Clear entire stock
    document.getElementById('stkClearAllBtn')?.addEventListener('click', () => {
        if (!stockData.length) return showToast(t('❌ المخزن فارغ بالفعل','❌ Stock is already empty'), 'error');
        if (confirm(t('هل أنت متأكد من مسح جميع المنتجات في المخزن نهائياً؟', 'Are you sure you want to permanently clear all stock items?'))) {
            stockData = [];
            saveStock(stockData);
            selectedIds.clear();
            window.rStock();
            showToast(t('✅ تم مسح المخزن بالكامل بنجاح', '✅ Entire stock cleared successfully'), 'success');
        }
    });

    // Modals
    document.getElementById('stkAddBtn')?.addEventListener('click', () => openModal());
    document.getElementById('stkMClose')?.addEventListener('click', closeModal);
    document.getElementById('stkMCancel')?.addEventListener('click', closeModal);
    document.getElementById('stkModal')?.addEventListener('click', e => { if(e.target.id==='stkModal') closeModal(); });

    document.getElementById('stkCatsBtn')?.addEventListener('click', () => document.getElementById('catsModal')?.classList.add('on'));
    document.getElementById('catsMC')?.addEventListener('click', () => document.getElementById('catsModal')?.classList.remove('on'));
    document.getElementById('catsModal')?.addEventListener('click', e => { if(e.target.id==='catsModal') document.getElementById('catsModal').classList.remove('on'); });

    document.getElementById('stkPdfBtn')?.addEventListener('click', () => document.getElementById('pdfModal')?.classList.add('on'));
    document.getElementById('pdfMClose')?.addEventListener('click', () => document.getElementById('pdfModal')?.classList.remove('on'));
    document.getElementById('pdfMCancel')?.addEventListener('click', () => document.getElementById('pdfModal')?.classList.remove('on'));
    document.getElementById('pdfModal')?.addEventListener('click', e => { if(e.target.id==='pdfModal') document.getElementById('pdfModal').classList.remove('on'); });

    document.getElementById('stkXlBtn')?.addEventListener('click', () => document.getElementById('xlModal')?.classList.add('on'));
    document.getElementById('xlMClose')?.addEventListener('click', () => document.getElementById('xlModal')?.classList.remove('on'));
    document.getElementById('xlMCancel')?.addEventListener('click', () => document.getElementById('xlModal')?.classList.remove('on'));
    document.getElementById('xlModal')?.addEventListener('click', e => { if(e.target.id==='xlModal') document.getElementById('xlModal').classList.remove('on'); });

    // Bulk actions
    document.getElementById('bkClr')?.addEventListener('click', () => { selectedIds.clear(); updateBulk(); reRender(); });
    document.getElementById('bkDel')?.addEventListener('click', () => {
        if(!selectedIds.size) return;
        if(confirm(t('حذف ','Delete ')+selectedIds.size+t(' منتج؟',' items?'))){
            stockData = stockData.filter(p => !selectedIds.has(p.id));
            saveStock(stockData);
            selectedIds.clear();
            window.rStock();
            showToast(t('✅ تم الحذف','✅ Deleted'),'success');
        }
    });
    document.getElementById('bkPdf')?.addEventListener('click', () => {
        const sel = stockData.filter(p => selectedIds.has(p.id));
        const co  = localStorage.getItem('sp_company_name') || 'Sales Pro';
        generatePDF(sel, co);
    });

    // Delegated clicks inside products container
    const c = document.getElementById('stkProducts');
    if (c) {
        c.addEventListener('click', e => {
            const selEl = e.target.closest('[data-select]');
            if (selEl) { e.stopPropagation(); toggleSel(selEl.dataset.select); return; }
            const qm = e.target.closest('[data-qminus]');
            if (qm) { e.stopPropagation(); adjQty(qm.dataset.qminus, -1); return; }
            const qp = e.target.closest('[data-qplus]');
            if (qp) { e.stopPropagation(); adjQty(qp.dataset.qplus, 1); return; }
            const ed = e.target.closest('[data-edit]');
            if (ed) { e.stopPropagation(); openModal(ed.dataset.edit); return; }
            const dl = e.target.closest('[data-del]');
            if (dl) { e.stopPropagation(); confDel(dl.dataset.del); return; }
        });
        c.addEventListener('change', e => {
            const inp = e.target.closest('[data-qinput]');
            if (inp) { const v = parseInt(inp.value); setQty(inp.dataset.qinput, isNaN(v)?null:Math.max(0,v)); }
        });
    }

    // Delegated alert chip clicks
    document.querySelector('.stk-alert-scroll')?.addEventListener('click', e => {
        const chip = e.target.closest('[data-edit]');
        if (chip) openModal(chip.dataset.edit);
    });

    // Categories add / delete
    document.getElementById('addCatBtn')?.addEventListener('click', () => {
        const inp = document.getElementById('newCatInp');
        const v = inp?.value.trim();
        if (v && !stockCats.includes(v)) {
            stockCats.push(v); saveCats(stockCats);
            document.getElementById('catsMB').innerHTML = renderCatsBody();
            inp.value = '';
            showToast(t('✅ تمت إضافة الفئة','✅ Category Added'),'success');
        }
    });
    document.getElementById('catsMB')?.addEventListener('click', e => {
        const b = e.target.closest('[data-delcat]');
        if (b) {
            const idx = parseInt(b.dataset.delcat);
            stockCats.splice(idx, 1); saveCats(stockCats);
            document.getElementById('catsMB').innerHTML = renderCatsBody();
            showToast(t('✅ تم حذف الفئة','✅ Category Deleted'),'success');
        }
    });

    // PDF Modal Export
    document.querySelectorAll('.pdf-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.pdf-opt').forEach(o => o.classList.remove('on'));
            opt.classList.add('on');
        });
    });
    document.getElementById('pdfMGen')?.addEventListener('click', () => {
        const mode = document.querySelector('.pdf-opt.on')?.dataset.opt || 'all';
        const co = document.getElementById('pdfCompany')?.value.trim() || 'Sales Pro';
        let items = stockData;
        if (mode === 'filtered') items = getFilteredStock();
        else if (mode === 'selected') items = stockData.filter(p => selectedIds.has(p.id));
        document.getElementById('pdfModal')?.classList.remove('on');
        generatePDF(items, co);
    });

    // Excel Import
    setupExcelImport();

    // Modal Image & Save
    setupModalEvents();
}

function setupExcelImport() {
    let parsedRows = [];
    const inp   = document.getElementById('xlFileInp');
    const drop  = document.getElementById('xlDrop');
    const btnOK = document.getElementById('xlMOK');

    if (inp) inp.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
    if (drop) {
        drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
        drop.addEventListener('dragleave', () => drop.classList.remove('over'));
        drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    }

    document.querySelectorAll('#xlMR, #xlMM').forEach(l => {
        l.addEventListener('click', () => {
            document.querySelectorAll('.xl-mc').forEach(x => x.classList.remove('on'));
            l.classList.add('on');
        });
    });

    function handleFile(file) {
        if (typeof XLSX === 'undefined') { showToast(t('❌ مكتبة Excel غير محملة','❌ Excel library not loaded'),'error'); return; }
        const r = new FileReader();
        r.onload = e => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                if (raw.length < 2) { showToast(t('❌ الملف فارغ','❌ File is empty'),'error'); return; }

                let startRow = 1;
                const r0 = raw[0].map(c => String(c).toLowerCase().trim());
                if (!r0.some(c => c.includes('code') || c.includes('item') || c.includes('description') || c.includes('price') || c.includes('كود') || c.includes('صنف'))) {
                    startRow = 0;
                }

                parsedRows = [];
                for (let i = startRow; i < raw.length; i++) {
                    const row = raw[i];
                    if (!row || !row.some(c => c !== '')) continue;

                    const code        = String(row[0] || '').trim();
                    const name        = String(row[1] || '').trim() || code;
                    const qtyOnHand   = (row[2] !== '' && !isNaN(Number(row[2]))) ? Number(row[2]) : null;
                    const qtyAvail    = (row[3] !== '' && !isNaN(Number(row[3]))) ? Number(row[3]) : null;
                    const priceUser   = (row[4] !== '' && !isNaN(Number(row[4]))) ? Number(row[4]) : 0;
                    const priceDealer = (row[5] !== '' && !isNaN(Number(row[5]))) ? Number(row[5]) : 0;
                    const priceBest   = (row[6] !== '' && !isNaN(Number(row[6]))) ? Number(row[6]) : 0;
                    const brand       = String(row[7] || '').trim() || t('عام','General');
                    const itemClass   = String(row[8] || '').trim();

                    if (code || name) {
                        parsedRows.push({
                            id: uid(), code, name,
                            qtyOnHand, qty: qtyAvail,
                            price: priceUser, cost: priceDealer, bestPrice: priceBest,
                            brand, category: itemClass || brand, itemClass,
                            importOrder: i,
                            updatedAt: new Date().toISOString()
                        });
                    }
                }

                if (!parsedRows.length) { showToast(t('❌ لم يتم العثور على بيانات صالحة','❌ No valid data found'),'error'); return; }

                document.getElementById('xlDC').style.display = 'none';
                document.getElementById('xlCC').style.display = 'block';
                document.getElementById('xlFN').textContent = '📄 ' + file.name;
                document.getElementById('xlRC').textContent = fmtNum(parsedRows.length) + ' ' + t('منتج جاهز للاستيراد','items ready');

                const tb = document.getElementById('xlPB');
                tb.innerHTML = parsedRows.slice(0, 5).map(p => `
                    <tr>
                        <td><b>${p.code || '—'}</b></td>
                        <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</td>
                        <td><span style="color:#10b981;font-weight:800;">${p.qty!=null?fmtNum(p.qty):'—'}</span></td>
                        <td>${fmtPrice(p.price)}</td>
                        <td>${fmtPrice(p.cost)}</td>
                        <td>${fmtPrice(p.bestPrice)}</td>
                    </tr>
                `).join('');
                document.getElementById('xlPS').style.display = 'block';

                btnOK.disabled = false;
                btnOK.style.opacity = '1';
                showToast(t('✅ تم قراءة ','✅ Parsed ')+fmtNum(parsedRows.length)+t(' منتج',' items'),'success');
            } catch (err) {
                showToast(t('❌ خطأ في قراءة الملف: ','❌ File error: ')+err.message,'error');
            }
        };
        r.readAsBinaryString(file);
    }

    btnOK?.addEventListener('click', async () => {
        if (!parsedRows.length) return;
        const mode = document.querySelector('input[name="xlMode"]:checked')?.value || 'replace';
        const pw = document.getElementById('xlPW'); const pf = document.getElementById('xlPF');
        pw.style.display = 'block'; pf.style.width = '70%';

        if (mode === 'replace') {
            stockData = parsedRows;
        } else {
            const map = new Map(stockData.map(p => [(p.code||p.name).toLowerCase(), p]));
            parsedRows.forEach(p => {
                const k = (p.code||p.name).toLowerCase();
                if (map.has(k)) {
                    const ex = map.get(k);
                    Object.assign(ex, p, { id: ex.id, image: ex.image || p.image });
                } else {
                    stockData.push(p);
                }
            });
        }

        const newCats = [...new Set(stockData.map(p => p.category || p.itemClass).filter(Boolean))];
        if (newCats.length) { stockCats = [...new Set([...stockCats, ...newCats])]; saveCats(stockCats); }

        saveStock(stockData);
        pf.style.width = '100%';
        await new Promise(r => setTimeout(r, 200));

        document.getElementById('xlModal')?.classList.remove('on');
        pw.style.display = 'none'; pf.style.width = '0%';
        window.rStock();
        showToast(t('✅ تم استيراد ','✅ Imported ')+fmtNum(parsedRows.length)+t(' منتج بنجاح!',' items successfully!'),'success');
    });
}

function setupModalEvents() {
    let curImg = null;
    const imgInp  = document.getElementById('stkImgFile');
    const imgArea = document.getElementById('stkImgArea');
    const imgPrev = document.getElementById('stkImgPrev');
    const imgPh   = document.getElementById('stkImgPh');
    const imgRm   = document.getElementById('stkImgRm');

    if (imgArea) imgArea.onclick = () => imgInp?.click();
    if (imgInp) imgInp.onchange = async e => {
        const f = e.target.files[0]; if(!f) return;
        if(f.size > 5*1024*1024) { showToast(t('❌ حجم الصورة أكبر من 5MB','❌ Image > 5MB'),'error'); return; }
        try {
            const b64 = await fileToB64(f);
            curImg = await resizeB64(b64, 500, 500, 0.85);
            imgPrev.src = curImg; imgPrev.style.display = 'block'; imgPh.style.display = 'none'; imgRm.style.display = 'block';
            imgArea.classList.add('has-img');
        } catch { showToast(t('❌ خطأ في معالجة الصورة','❌ Image Error'),'error'); }
    };
    if (imgRm) imgRm.onclick = e => {
        e.stopPropagation(); curImg = null; imgInp.value = '';
        imgPrev.style.display = 'none'; imgPh.style.display = 'block'; imgRm.style.display = 'none';
        imgArea.classList.remove('has-img');
    };

    document.getElementById('stkMSave')?.addEventListener('click', () => {
        const name = document.getElementById('mfName')?.value.trim();
        if (!name) { showToast(t('❌ يرجى كتابة اسم المنتج','❌ Enter item name'),'error'); return; }

        const product = {
            id: editingId || uid(),
            name,
            code:        document.getElementById('mfCode')?.value.trim() || '',
            brand:       document.getElementById('mfBrand')?.value.trim() || '',
            category:    document.getElementById('mfCat')?.value || '',
            price:       parseFloat(document.getElementById('mfPrice')?.value) || 0,
            cost:        parseFloat(document.getElementById('mfCost')?.value) || 0,
            bestPrice:   parseFloat(document.getElementById('mfBest')?.value) || 0,
            qtyOnHand:   document.getElementById('mfQtyOnHand')?.value !== '' ? parseInt(document.getElementById('mfQtyOnHand')?.value) : null,
            qty:         document.getElementById('mfQty')?.value !== '' ? parseInt(document.getElementById('mfQty')?.value) : null,
            desc:        document.getElementById('mfDesc')?.value.trim() || '',
            image:       curImg,
            updatedAt:   new Date().toISOString()
        };

        if (editingId) {
            const i = stockData.findIndex(p => p.id === editingId);
            if (i !== -1) stockData[i] = { ...stockData[i], ...product, image: curImg ?? stockData[i].image };
            showToast(t('✅ تم تعديل المنتج','✅ Item Updated'),'success');
        } else {
            product.createdAt = product.updatedAt;
            stockData.unshift(product);
            showToast(t('✅ تمت إضافة المنتج','✅ Item Added'),'success');
        }

        saveStock(stockData);
        closeModal();
        window.rStock();
    });
}

let curImg = null;
function openModal(id = null) {
    editingId = id;
    const titleEl = document.getElementById('stkMTitle');
    if (titleEl) titleEl.textContent = id ? t('✏️ تعديل منتج','✏️ Edit Item') : t('＋ منتج جديد','＋ New Item');
    document.getElementById('stkModal')?.classList.add('on');
    curImg = null;
    const imgPrev = document.getElementById('stkImgPrev');
    const imgPh   = document.getElementById('stkImgPh');
    const imgRm   = document.getElementById('stkImgRm');
    const imgArea = document.getElementById('stkImgArea');
    if (imgPrev) imgPrev.style.display = 'none';
    if (imgPh) imgPh.style.display = 'block';
    if (imgRm) imgRm.style.display = 'none';
    if (imgArea) imgArea.classList.remove('has-img');

    if (id) {
        const p = stockData.find(x => x.id === id); if(!p) return;
        if (document.getElementById('mfName')) document.getElementById('mfName').value = p.name || '';
        if (document.getElementById('mfCode')) document.getElementById('mfCode').value = p.code || '';
        if (document.getElementById('mfBrand')) document.getElementById('mfBrand').value = p.brand || '';
        if (document.getElementById('mfCat')) document.getElementById('mfCat').value = p.category || '';
        if (document.getElementById('mfPrice')) document.getElementById('mfPrice').value = p.price || '';
        if (document.getElementById('mfCost')) document.getElementById('mfCost').value = p.cost || '';
        if (document.getElementById('mfBest')) document.getElementById('mfBest').value = p.bestPrice || '';
        if (document.getElementById('mfQtyOnHand')) document.getElementById('mfQtyOnHand').value = p.qtyOnHand != null ? p.qtyOnHand : '';
        if (document.getElementById('mfQty')) document.getElementById('mfQty').value = p.qty != null ? p.qty : '';
        if (document.getElementById('mfDesc')) document.getElementById('mfDesc').value = p.desc || '';
        if (p.image) {
            curImg = p.image;
            if (imgPrev) { imgPrev.src = p.image; imgPrev.style.display = 'block'; }
            if (imgPh) imgPh.style.display = 'none';
            if (imgRm) imgRm.style.display = 'block';
            if (imgArea) imgArea.classList.add('has-img');
        }
    } else {
        if (document.getElementById('mfName')) document.getElementById('mfName').value = '';
        if (document.getElementById('mfCode')) document.getElementById('mfCode').value = '';
        if (document.getElementById('mfBrand')) document.getElementById('mfBrand').value = '';
        if (document.getElementById('mfPrice')) document.getElementById('mfPrice').value = '';
        if (document.getElementById('mfCost')) document.getElementById('mfCost').value = '';
        if (document.getElementById('mfBest')) document.getElementById('mfBest').value = '';
        if (document.getElementById('mfQtyOnHand')) document.getElementById('mfQtyOnHand').value = '';
        if (document.getElementById('mfQty')) document.getElementById('mfQty').value = '';
        if (document.getElementById('mfDesc')) document.getElementById('mfDesc').value = '';
    }
}

function closeModal() {
    document.getElementById('stkModal')?.classList.remove('on');
    editingId = null;
}

window.openModal = openModal;
window.closeModal = closeModal;

function toggleSel(id) {
    if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
    updateBulk(); reRender();
}
function confDel(id) {
    const p = stockData.find(x => x.id === id); if(!p) return;
    if (confirm(t('حذف "','Delete "')+p.name+t('"؟','"?'))) {
        stockData = stockData.filter(x => x.id !== id);
        saveStock(stockData);
        selectedIds.delete(id);
        window.rStock();
        showToast(t('✅ تم الحذف','✅ Deleted'),'success');
    }
}

function showToast(msg, type) {
    if (typeof window.toast === 'function') { window.toast(msg, type); return; }
    const t = document.getElementById('TT'); if(!t) return;
    t.textContent = msg; t.className = 'toast show';
    setTimeout(() => t.className = 'toast', 3000);
}

/* ══════════════════════════════════════════════════════════
   PDF CATALOG EXPORT (ENTERPRISE 3-TIER)
══════════════════════════════════════════════════════════ */
async function generatePDF(items, company) {
    if (!items?.length) { showToast(t('❌ لا توجد منتجات','❌ No Items'),'error'); return; }
    showToast(t('⏳ جاري إنشاء الكتالوج...','⏳ Generating Catalog...'),'info');
    const date = new Date().toLocaleDateString(t('ar-EG','en-US'), { year:'numeric', month:'long', day:'numeric' });
    const grouped = {}; const go = [];
    items.forEach(p => { const k = p.brand || p.category || t('أخرى','Other'); if(!grouped[k]){grouped[k]=[]; go.push(k);} grouped[k].push(p); });

    const sections = go.map(brand => {
        const prods = grouped[brand];
        return `<div class="pdf-section">
<div class="pdf-bh"><div class="pdf-bn">${brand}</div><div class="pdf-bc">${fmtNum(prods.length)} ${t('منتج','Items')}</div></div>
<div class="pdf-grid">${prods.map(p => `
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
        ${p.qty!=null?`<div class="pdf-qty ${p.qty<=0?'pqo':p.qty<=lowThreshold?'pql':'pqk'}">${p.qty<=0?t('نفد المتاح','Out of Stock'):t('متاح: ','Avail: ')+fmtNum(p.qty)}</div>`:''}
        ${p.qtyOnHand!=null?`<div class="pdf-qty-oh">${t('فعلي: ','On Hand: ')}${fmtNum(p.qtyOnHand)}</div>`:''}
    </div>
  </div>
</div>`).join('')}</div></div>`;
    }).join('');

    const html = `
<div id="pdf-wrapper" dir="${t('rtl','ltr')}" style="font-family:'Tajawal',sans-serif;background:#f8fafc;color:#0f172a;">
<style>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
#pdf-wrapper{direction:${t('rtl','ltr')};font-family:'Tajawal',sans-serif;background:#f8fafc;color:#0f172a;}
.pdf-cover{background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:50px 45px;}
.pdf-co{font-size:1.4rem;font-weight:900;margin-bottom:6px;}.pdf-dt{font-size:0.8rem;opacity:0.6;margin-bottom:24px;}
.pdf-h1{font-size:2.4rem;font-weight:900;line-height:1.15;margin-bottom:20px;}.pdf-h1 span{color:#818cf8;}
.pdf-sum{display:flex;gap:24px;}.pdf-si{text-align:center;}.pdf-sv{font-size:1.4rem;font-weight:900;}.pdf-sl{font-size:0.68rem;opacity:0.6;margin-top:2px;}
.pdf-content{padding:30px 40px;}
.pdf-toc{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:24px;}
.pdf-toc-t{font-size:0.72rem;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;}
.pdf-toc-g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.pdf-toc-i{font-size:0.74rem;color:#334155;display:flex;align-items:center;gap:6px;}
.pdf-toc-d{width:6px;height:6px;border-radius:50%;background:#3b82f6;flex-shrink:0;}
.pdf-section{margin-bottom:30px;page-break-inside:avoid;}
.pdf-bh{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:linear-gradient(135deg,#1e293b,#334155);color:#fff;border-radius:8px 8px 0 0;}
.pdf-bn{font-size:0.95rem;font-weight:900;}.pdf-bc{font-size:0.72rem;opacity:0.8;background:rgba(255,255,255,0.15);padding:2px 8px;border-radius:8px;}
.pdf-grid{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;}
.pdf-card{border-left:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;background:#fff;page-break-inside:avoid;}
.pdf-card:nth-child(3n+1){border-left:none;}
.pdf-img{width:100%;aspect-ratio:1;object-fit:cover;display:block;}
.pdf-img-ph{width:100%;aspect-ratio:1;background:linear-gradient(135deg,#f1f5f9,#e2e8f0);display:flex;align-items:center;justify-content:center;font-size:2rem;}
.pdf-cb{padding:10px 12px;}
.pdf-code{font-size:0.6rem;color:#94a3b8;font-weight:700;letter-spacing:0.05em;margin-bottom:2px;}
.pdf-name{font-size:0.76rem;font-weight:800;color:#0f172a;line-height:1.25;margin-bottom:4px;}
.pdf-cls{font-size:0.62rem;color:#94a3b8;margin-bottom:6px;}
.pdf-prices{display:flex;gap:3px;}
.pdf-pu,.pdf-pd,.pdf-pb{flex:1;border-radius:5px;padding:4px;text-align:center;}
.pdf-pu span,.pdf-pd span,.pdf-pb span{display:block;font-size:0.52rem;font-weight:800;margin-bottom:1px;text-transform:uppercase;}
.pdf-pu{background:#f0fdf4;color:#15803d;font-size:0.68rem;font-weight:900;} .pdf-pu span{color:#16a34a;}
.pdf-pd{background:#eff6ff;color:#1d4ed8;font-size:0.68rem;font-weight:800;} .pdf-pd span{color:#3b82f6;}
.pdf-pb{background:#fffbeb;color:#b45309;font-size:0.68rem;font-weight:800;} .pdf-pb span{color:#f59e0b;}
.pdf-qty{font-size:0.62rem;font-weight:800;padding:2px 6px;border-radius:4px;display:inline-block;}
.pdf-qty-oh{font-size:0.58rem;font-weight:700;color:#64748b;background:#f1f5f9;padding:2px 5px;border-radius:4px;}
.pqk{background:#d1fae5;color:#065f46;}.pql{background:#fef3c7;color:#92400e;}.pqo{background:#fee2e2;color:#991b1b;}
.pdf-footer{background:#0f172a;color:#fff;padding:16px 40px;display:flex;justify-content:space-between;align-items:center;}
.pdf-fc{font-size:0.8rem;font-weight:800;}.pdf-fm{font-size:0.7rem;opacity:0.6;}
@media print{.pdf-card,.pdf-section{page-break-inside:avoid;}}
</style>
<div class="pdf-cover">
  <div class="pdf-co">${company}</div>
  <div class="pdf-dt">${t('كتالوج المنتجات الرسمي','Official Product Catalog')}</div>
  <div class="pdf-h1">${t('قائمة الأسعار','Price List')}<br><span>${t('والمنتجات المتاحة','And Available Items')}</span></div>
  <div class="pdf-sum">
    <div class="pdf-si"><div class="pdf-sv">${fmtNum(items.length)}</div><div class="pdf-sl">${t('منتج','Items')}</div></div>
    <div class="pdf-si"><div class="pdf-sv">${go.length}</div><div class="pdf-sl">${t('براند','Brands')}</div></div>
    <div class="pdf-si"><div class="pdf-sv">${date}</div><div class="pdf-sl">${t('تاريخ الإصدار','Release Date')}</div></div>
  </div>
</div>
<div class="pdf-content">
  <div class="pdf-toc">
    <div class="pdf-toc-t">${t('محتويات الكتالوج','Catalog Contents')}</div>
    <div class="pdf-toc-g">${go.map(b=>`<div class="pdf-toc-i"><div class="pdf-toc-d"></div><span>${b} (${fmtNum(grouped[b].length)})</span></div>`).join('')}</div>
  </div>
  ${sections}
</div>
<div class="pdf-footer"><div class="pdf-fc">${company}</div><div class="pdf-fm">${t('جميع الأسعار بالجنيه المصري','All prices in EGP')} · ${date}</div></div>
</div>`;

    if (typeof html2pdf !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = html;
        div.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:1060px;direction:${t('rtl','ltr')};`;
        document.body.appendChild(div);
        try {
            await html2pdf().set({
                margin: [0,0,0,0],
                filename: company.replace(/\s+/g,'_') + '-Catalog-' + Date.now() + '.pdf',
                image: { type:'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
                jsPDF: { unit:'mm', format:'a4', orientation:'portrait' },
                pagebreak: { mode:['avoid-all','css'] }
            }).from(div.firstElementChild).save();
            showToast(t('✅ تم توليد الكتالوج بنجاح!','✅ Catalog Generated!'),'success');
        } catch(e) {
            showToast(t('❌ خطأ في توليد PDF','❌ PDF Error'),'error');
            console.error(e);
        } finally {
            document.body.removeChild(div);
        }
    } else {
        const w = window.open('','_blank');
        w.document.write(`<!DOCTYPE html><html><head><title>${company} Catalog</title></head><body>${html}</body></html>`);
        w.document.close(); w.focus();
        setTimeout(() => w.print(), 1000);
        showToast(t('✅ تم فتح نافذة الطباعة','✅ Opened Print Dialog'),'success');
    }
}

})();
