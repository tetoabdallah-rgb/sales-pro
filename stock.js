/**
 * Stock / Inventory Management Module
 * Sales Pro Enterprise - stock.js
 * Features: Add/Edit/Delete products with images, categories, search/filter, PDF catalog export
 */

(function() {
'use strict';

/* ─── Storage helpers ───────────────────────────────────── */
const STOCK_KEY = 'sp_stock_v1';
const CATS_KEY  = 'sp_stock_cats_v1';

function loadStock() {
    try { return JSON.parse(localStorage.getItem(STOCK_KEY)) || []; }
    catch(e) { return []; }
}
function saveStock(data) {
    localStorage.setItem(STOCK_KEY, JSON.stringify(data));
}
function loadCats() {
    try {
        const saved = JSON.parse(localStorage.getItem(CATS_KEY));
        return saved && saved.length ? saved : ['إلكترونيات','ملابس','غذاء وشراب','أجهزة منزلية','مستحضرات','أثاث','أخرى'];
    }
    catch(e) { return ['إلكترونيات','ملابس','غذاء وشراب','أجهزة منزلية','مستحضرات','أثاث','أخرى']; }
}
function saveCats(data) { localStorage.setItem(CATS_KEY, JSON.stringify(data)); }

/* ─── State ─────────────────────────────────────────────── */
let stockData  = loadStock();
let stockCats  = loadCats();
let stockFilter  = '';
let stockCatFilter = 'all';
let stockSort    = 'name';
let editingId    = null;
let selectedIds  = new Set();
let currentView  = 'grid'; // grid | list

/* ─── Unique ID ─────────────────────────────────────────── */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ─── Image helpers ─────────────────────────────────────── */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function resizeImage(base64, maxW = 600, maxH = 600, quality = 0.8) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > maxW || h > maxH) {
                const ratio = Math.min(maxW / w, maxH / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = base64;
    });
}

/* ─── Currency formatter ────────────────────────────────── */
function fmtPrice(n) {
    if (!n && n !== 0) return '-';
    return Number(n).toLocaleString('ar-EG', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ج.م';
}

/* ─── Filter & Sort ─────────────────────────────────────── */
function getFilteredStock() {
    let d = [...stockData];
    if (stockCatFilter !== 'all') d = d.filter(p => p.category === stockCatFilter);
    if (stockFilter.trim()) {
        const q = stockFilter.trim().toLowerCase();
        d = d.filter(p =>
            (p.name||'').toLowerCase().includes(q) ||
            (p.code||'').toLowerCase().includes(q) ||
            (p.description||'').toLowerCase().includes(q)
        );
    }
    d.sort((a, b) => {
        switch(stockSort) {
            case 'price_asc':  return (a.price||0) - (b.price||0);
            case 'price_desc': return (b.price||0) - (a.price||0);
            case 'qty_asc':    return (a.qty||0) - (b.qty||0);
            case 'qty_desc':   return (b.qty||0) - (a.qty||0);
            case 'name':
            default:           return (a.name||'').localeCompare(b.name||'', 'ar');
        }
    });
    return d;
}

/* ─── Main Render ───────────────────────────────────────── */
window.rStock = function rStock() {
    const M = document.getElementById('M');
    if (!M) return;

    const filtered = getFilteredStock();
    const totalProducts = stockData.length;
    const totalValue    = stockData.reduce((s, p) => s + (p.price||0) * (p.qty||0), 0);
    const lowStock      = stockData.filter(p => (p.qty||0) <= 5 && (p.qty||0) > 0).length;
    const outOfStock    = stockData.filter(p => (p.qty||0) === 0).length;

    M.innerHTML = `
    <style>
    /* ── Stock Module Styles ── */
    .stock-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
    .stock-title  { font-size:1.6rem; font-weight:800; color:var(--tx1); display:flex; align-items:center; gap:10px; }
    .stock-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .btn-stock { display:inline-flex; align-items:center; gap:7px; padding:10px 18px; border-radius:12px; font-size:0.88rem; font-weight:700; cursor:pointer; border:none; transition:all .2s; font-family:inherit; }
    .btn-stock-primary { background:var(--ac); color:#fff; }
    .btn-stock-primary:hover { filter:brightness(1.12); transform:translateY(-1px); }
    .btn-stock-outline { background:transparent; color:var(--ac); border:2px solid var(--ac); }
    .btn-stock-outline:hover { background:var(--ac); color:#fff; transform:translateY(-1px); }
    .btn-stock-danger  { background:var(--rd,#ef4444); color:#fff; }
    .btn-stock-danger:hover { filter:brightness(1.1); }
    .btn-stock-gray    { background:var(--bg3); color:var(--tx2); border:1px solid var(--bd); }
    .btn-stock-gray:hover { background:var(--bg4); }
    .btn-stock-pdf     { background:linear-gradient(135deg,#e11d48,#f97316); color:#fff; }
    .btn-stock-pdf:hover { filter:brightness(1.1); transform:translateY(-1px); }

    /* Stats row */
    .stock-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
    .stock-stat-card { background:var(--bg2); border:1px solid var(--bd); border-radius:16px; padding:16px 20px; display:flex; flex-direction:column; gap:4px; transition:all .2s; }
    .stock-stat-card:hover { transform:translateY(-2px); box-shadow:var(--sh-lg); }
    .stock-stat-label { font-size:0.78rem; color:var(--tx3); font-weight:600; text-transform:uppercase; letter-spacing:.04em; }
    .stock-stat-value { font-size:1.6rem; font-weight:800; color:var(--tx1); }
    .stock-stat-icon  { font-size:1.4rem; margin-bottom:4px; }
    .stat-warning .stock-stat-value { color:#f59e0b; }
    .stat-danger  .stock-stat-value { color:#ef4444; }
    .stat-success .stock-stat-value { color:#10b981; }

    /* Search & Filter bar */
    .stock-filter-bar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; background:var(--bg2); border:1px solid var(--bd); border-radius:16px; padding:12px 16px; }
    .stock-search-wrap { flex:1; min-width:200px; position:relative; }
    .stock-search-wrap input { width:100%; padding:9px 14px 9px 38px; border-radius:10px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.9rem; font-family:inherit; transition:.2s; }
    .stock-search-wrap input:focus { outline:none; border-color:var(--ac); box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 15%,transparent); }
    .stock-search-icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--tx3); pointer-events:none; font-size:1rem; }
    .stock-filter-bar select { padding:9px 14px; border-radius:10px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.88rem; font-family:inherit; cursor:pointer; }
    .stock-filter-bar select:focus { outline:none; border-color:var(--ac); }
    .view-toggle { display:flex; gap:4px; }
    .view-btn { padding:8px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx3); cursor:pointer; font-size:1rem; transition:.2s; }
    .view-btn.active { background:var(--ac); color:#fff; border-color:var(--ac); }

    /* Grid view */
    .stock-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
    .stock-card { background:var(--bg2); border:1px solid var(--bd); border-radius:18px; overflow:hidden; cursor:pointer; transition:all .22s cubic-bezier(.4,0,.2,1); position:relative; }
    .stock-card:hover { transform:translateY(-4px); box-shadow:0 12px 36px rgba(0,0,0,.13); border-color:var(--ac); }
    .stock-card.selected { border-color:var(--ac); box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 25%,transparent); }
    .stock-card-img { width:100%; aspect-ratio:1; object-fit:cover; background:var(--bg3); display:block; }
    .stock-card-img-placeholder { width:100%; aspect-ratio:1; background:linear-gradient(135deg,var(--bg3),var(--bg4)); display:flex; align-items:center; justify-content:center; font-size:3rem; }
    .stock-card-body { padding:14px; }
    .stock-card-code { font-size:0.7rem; color:var(--tx3); font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:4px; }
    .stock-card-name { font-size:0.98rem; font-weight:700; color:var(--tx1); margin-bottom:4px; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .stock-card-cat  { display:inline-block; background:color-mix(in srgb,var(--ac) 12%,transparent); color:var(--ac); font-size:0.72rem; font-weight:700; padding:2px 10px; border-radius:20px; margin-bottom:8px; }
    .stock-card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:10px; padding-top:10px; border-top:1px solid var(--bd); }
    .stock-card-price { font-size:1.05rem; font-weight:800; color:var(--ac); }
    .stock-card-qty   { font-size:0.8rem; font-weight:700; padding:3px 10px; border-radius:20px; }
    .qty-ok      { background:#d1fae5; color:#065f46; }
    .qty-low     { background:#fef3c7; color:#92400e; }
    .qty-out     { background:#fee2e2; color:#991b1b; }
    .stock-card-actions { position:absolute; top:8px; left:8px; display:flex; gap:6px; opacity:0; transition:.2s; }
    .stock-card:hover .stock-card-actions { opacity:1; }
    .card-act-btn { width:30px; height:30px; border-radius:8px; border:none; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px); transition:.15s; }
    .card-act-edit   { background:rgba(255,255,255,.88); color:#1a1a1a; }
    .card-act-edit:hover { background:#1a1a1a; color:#fff; }
    .card-act-delete { background:rgba(255,255,255,.88); color:#ef4444; }
    .card-act-delete:hover { background:#ef4444; color:#fff; }
    .card-select-check { position:absolute; top:8px; right:8px; width:22px; height:22px; border-radius:6px; border:2px solid rgba(255,255,255,.6); background:rgba(255,255,255,.2); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; font-size:0.8rem; color:transparent; }
    .stock-card.selected .card-select-check { background:var(--ac); border-color:var(--ac); color:#fff; }

    /* List view */
    .stock-list { display:flex; flex-direction:column; gap:10px; }
    .stock-list-item { background:var(--bg2); border:1px solid var(--bd); border-radius:14px; display:flex; align-items:center; gap:14px; padding:12px 16px; transition:all .2s; cursor:pointer; }
    .stock-list-item:hover { border-color:var(--ac); transform:translateX(-2px); }
    .stock-list-item.selected { border-color:var(--ac); background:color-mix(in srgb,var(--ac) 5%,var(--bg2)); }
    .list-item-img { width:60px; height:60px; border-radius:10px; object-fit:cover; background:var(--bg3); flex-shrink:0; }
    .list-item-img-ph { width:60px; height:60px; border-radius:10px; background:var(--bg3); display:flex; align-items:center; justify-content:center; font-size:1.8rem; flex-shrink:0; }
    .list-item-info { flex:1; min-width:0; }
    .list-item-code { font-size:0.72rem; color:var(--tx3); font-weight:700; }
    .list-item-name { font-size:0.95rem; font-weight:700; color:var(--tx1); }
    .list-item-cat  { font-size:0.78rem; color:var(--ac); }
    .list-item-desc { font-size:0.8rem; color:var(--tx3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:300px; }
    .list-item-price { font-size:1rem; font-weight:800; color:var(--ac); white-space:nowrap; }
    .list-item-qty   { font-size:0.8rem; font-weight:700; padding:3px 12px; border-radius:20px; white-space:nowrap; }
    .list-item-btns  { display:flex; gap:6px; }

    /* Modal */
    .stock-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(6px); z-index:9000; display:flex; align-items:center; justify-content:center; padding:16px; opacity:0; transition:opacity .25s; pointer-events:none; }
    .stock-modal-overlay.active { opacity:1; pointer-events:all; }
    .stock-modal { background:var(--bg1); border:1px solid var(--bd); border-radius:22px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,.22); transform:scale(.96) translateY(20px); transition:transform .3s cubic-bezier(.4,0,.2,1); }
    .stock-modal-overlay.active .stock-modal { transform:scale(1) translateY(0); }
    .stock-modal-header { padding:22px 24px 16px; border-bottom:1px solid var(--bd); display:flex; align-items:center; justify-content:space-between; }
    .stock-modal-title { font-size:1.15rem; font-weight:800; color:var(--tx1); }
    .stock-modal-close { width:32px; height:32px; border-radius:8px; border:none; background:var(--bg3); color:var(--tx2); cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
    .stock-modal-body  { padding:24px; }
    .stock-form-grid   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .stock-form-full   { grid-column:1/-1; }
    .stock-fg label    { display:block; font-size:0.82rem; font-weight:700; color:var(--tx2); margin-bottom:6px; }
    .stock-fg input, .stock-fg select, .stock-fg textarea { width:100%; padding:11px 14px; border-radius:10px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); font-size:0.9rem; font-family:inherit; transition:.2s; box-sizing:border-box; }
    .stock-fg input:focus, .stock-fg select:focus, .stock-fg textarea:focus { outline:none; border-color:var(--ac); box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 15%,transparent); }
    .stock-fg textarea { resize:vertical; min-height:80px; }
    .stock-img-upload-area { border:2px dashed var(--bd); border-radius:14px; padding:28px; text-align:center; cursor:pointer; transition:.2s; background:var(--bg2); position:relative; }
    .stock-img-upload-area:hover { border-color:var(--ac); background:color-mix(in srgb,var(--ac) 5%,var(--bg2)); }
    .stock-img-upload-area.has-img { padding:0; overflow:hidden; border-style:solid; }
    .stock-img-preview { width:100%; max-height:220px; object-fit:cover; display:block; border-radius:12px; }
    .stock-img-upload-icon { font-size:2.2rem; margin-bottom:8px; }
    .stock-img-upload-text { font-size:0.88rem; color:var(--tx3); }
    .stock-img-remove { position:absolute; top:8px; left:8px; background:#ef4444; color:#fff; border:none; border-radius:8px; padding:4px 10px; font-size:0.75rem; cursor:pointer; font-weight:700; }
    .stock-modal-footer { padding:16px 24px; border-top:1px solid var(--bd); display:flex; justify-content:flex-end; gap:10px; }

    /* PDF Modal */
    .pdf-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(8px); z-index:9100; display:flex; align-items:center; justify-content:center; padding:16px; opacity:0; transition:opacity .25s; pointer-events:none; }
    .pdf-modal-overlay.active { opacity:1; pointer-events:all; }
    .pdf-modal { background:var(--bg1); border:1px solid var(--bd); border-radius:22px; width:100%; max-width:480px; box-shadow:0 24px 80px rgba(0,0,0,.25); transform:scale(.96); transition:transform .3s; }
    .pdf-modal-overlay.active .pdf-modal { transform:scale(1); }
    .pdf-modal-header { padding:22px 24px 16px; border-bottom:1px solid var(--bd); display:flex; align-items:center; justify-content:space-between; }
    .pdf-modal-body   { padding:24px; display:flex; flex-direction:column; gap:16px; }
    .pdf-option-card  { border:2px solid var(--bd); border-radius:14px; padding:16px; cursor:pointer; transition:.2s; display:flex; align-items:center; gap:14px; }
    .pdf-option-card:hover { border-color:var(--ac); background:color-mix(in srgb,var(--ac) 5%,transparent); }
    .pdf-option-card.selected { border-color:var(--ac); background:color-mix(in srgb,var(--ac) 8%,transparent); }
    .pdf-option-icon { font-size:2rem; }
    .pdf-option-title { font-weight:800; font-size:0.95rem; color:var(--tx1); }
    .pdf-option-desc  { font-size:0.8rem; color:var(--tx3); margin-top:2px; }
    .pdf-modal-footer { padding:16px 24px; border-top:1px solid var(--bd); display:flex; gap:10px; justify-content:flex-end; }

    /* Empty state */
    .stock-empty { text-align:center; padding:80px 24px; color:var(--tx3); }
    .stock-empty-icon { font-size:4rem; margin-bottom:16px; }
    .stock-empty-title { font-size:1.2rem; font-weight:700; color:var(--tx2); margin-bottom:8px; }

    /* Bulk bar */
    .stock-bulk-bar { position:sticky; bottom:70px; left:0; right:0; margin:16px auto 0; max-width:480px; background:var(--ac); color:#fff; border-radius:16px; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; box-shadow:0 8px 32px rgba(0,0,0,.25); transition:all .3s; transform:translateY(20px); opacity:0; pointer-events:none; z-index:100; }
    .stock-bulk-bar.visible { transform:translateY(0); opacity:1; pointer-events:all; }
    .bulk-info { font-weight:700; font-size:0.9rem; }
    .bulk-actions { display:flex; gap:8px; }

    /* responsive */
    @media(max-width:600px) {
        .stock-stats { grid-template-columns:repeat(2,1fr); }
        .stock-form-grid { grid-template-columns:1fr; }
        .stock-header { flex-direction:column; align-items:flex-start; }
        .stock-grid { grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); }
    }
    </style>

    <!-- Header -->
    <div class="stock-header">
        <div class="stock-title">📦 إدارة المخزون</div>
        <div class="stock-actions">
            <button class="btn-stock btn-stock-gray" id="stockManageCatsBtn">🗂️ الفئات</button>
            <button class="btn-stock btn-stock-outline" id="stockExcelImportBtn">📥 رفع Excel</button>
            <button class="btn-stock btn-stock-pdf" id="stockPdfBtn">📄 تصدير PDF</button>
            <button class="btn-stock btn-stock-primary" id="stockAddBtn">+ إضافة منتج</button>
        </div>
    </div>

    <!-- Stats -->
    <div class="stock-stats">
        <div class="stock-stat-card stat-success">
            <div class="stock-stat-icon">📦</div>
            <div class="stock-stat-label">إجمالي المنتجات</div>
            <div class="stock-stat-value">${totalProducts}</div>
        </div>
        <div class="stock-stat-card">
            <div class="stock-stat-icon">💰</div>
            <div class="stock-stat-label">قيمة المخزون</div>
            <div class="stock-stat-value" style="font-size:1.1rem;">${fmtPrice(totalValue)}</div>
        </div>
        <div class="stock-stat-card stat-warning">
            <div class="stock-stat-icon">⚠️</div>
            <div class="stock-stat-label">مخزون منخفض</div>
            <div class="stock-stat-value">${lowStock}</div>
        </div>
        <div class="stock-stat-card stat-danger">
            <div class="stock-stat-icon">🚫</div>
            <div class="stock-stat-label">نفد المخزون</div>
            <div class="stock-stat-value">${outOfStock}</div>
        </div>
    </div>

    <!-- Filter Bar -->
    <div class="stock-filter-bar">
        <div class="stock-search-wrap">
            <span class="stock-search-icon">🔍</span>
            <input type="text" id="stockSearchInput" placeholder="ابحث باسم المنتج أو الكود..." value="${stockFilter}">
        </div>
        <select id="stockCatSelect">
            <option value="all">كل الفئات</option>
            ${stockCats.map(c => `<option value="${c}" ${stockCatFilter===c?'selected':''}>${c}</option>`).join('')}
        </select>
        <select id="stockSortSelect">
            <option value="name"      ${stockSort==='name'?'selected':''}>الاسم أ-ي</option>
            <option value="price_asc" ${stockSort==='price_asc'?'selected':''}>السعر: الأقل</option>
            <option value="price_desc"${stockSort==='price_desc'?'selected':''}>السعر: الأعلى</option>
            <option value="qty_asc"   ${stockSort==='qty_asc'?'selected':''}>الكمية: الأقل</option>
            <option value="qty_desc"  ${stockSort==='qty_desc'?'selected':''}>الكمية: الأكثر</option>
        </select>
        <div class="view-toggle">
            <button class="view-btn ${currentView==='grid'?'active':''}" id="viewGridBtn" title="عرض شبكي">⊞</button>
            <button class="view-btn ${currentView==='list'?'active':''}" id="viewListBtn" title="عرض قائمة">☰</button>
        </div>
    </div>

    <!-- Products -->
    <div id="stockProductsContainer">
        ${renderProducts(filtered)}
    </div>

    <!-- Bulk Action Bar -->
    <div class="stock-bulk-bar" id="stockBulkBar">
        <span class="bulk-info" id="bulkCount">0 منتج محدد</span>
        <div class="bulk-actions">
            <button class="btn-stock btn-stock-pdf" id="bulkPdfBtn" style="padding:8px 14px;font-size:0.8rem;">📄 PDF للمحدد</button>
            <button class="btn-stock btn-stock-danger" id="bulkDeleteBtn" style="padding:8px 14px;font-size:0.8rem;">🗑️ حذف المحدد</button>
            <button class="btn-stock btn-stock-gray" id="bulkClearBtn" style="padding:8px 14px;font-size:0.8rem;">✕ إلغاء</button>
        </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="stock-modal-overlay" id="stockModal">
        <div class="stock-modal">
            <div class="stock-modal-header">
                <div class="stock-modal-title" id="stockModalTitle">إضافة منتج جديد</div>
                <button class="stock-modal-close" id="stockModalClose">✕</button>
            </div>
            <div class="stock-modal-body">
                <!-- Image Upload -->
                <div class="stock-fg stock-form-full" style="margin-bottom:16px;">
                    <label>صورة المنتج</label>
                    <div class="stock-img-upload-area" id="imgUploadArea">
                        <input type="file" id="stockImgInput" accept="image/*" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;">
                        <div id="imgPlaceholder">
                            <div class="stock-img-upload-icon">🖼️</div>
                            <div class="stock-img-upload-text">اضغط لرفع صورة<br><small>JPG, PNG, WebP — بحد أقصى 5 ميجا</small></div>
                        </div>
                        <img id="imgPreview" class="stock-img-preview" style="display:none;" alt="preview">
                        <button class="stock-img-remove" id="imgRemoveBtn" style="display:none;">✕ إزالة</button>
                    </div>
                </div>

                <div class="stock-form-grid">
                    <div class="stock-fg">
                        <label>اسم المنتج *</label>
                        <input type="text" id="sfName" placeholder="مثل: iPhone 15 Pro">
                    </div>
                    <div class="stock-fg">
                        <label>كود المنتج</label>
                        <input type="text" id="sfCode" placeholder="مثل: IPH-15P">
                    </div>
                    <div class="stock-fg">
                        <label>الفئة</label>
                        <select id="sfCat">
                            ${stockCats.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="stock-fg">
                        <label>السعر (ج.م)</label>
                        <input type="number" id="sfPrice" placeholder="0.00" min="0" step="0.01">
                    </div>
                    <div class="stock-fg">
                        <label>الكمية المتاحة</label>
                        <input type="number" id="sfQty" placeholder="0" min="0" step="1">
                    </div>
                    <div class="stock-fg">
                        <label>سعر التكلفة (ج.م) — اختياري</label>
                        <input type="number" id="sfCost" placeholder="0.00" min="0" step="0.01">
                    </div>
                    <div class="stock-fg stock-form-full">
                        <label>الوصف / الملاحظات</label>
                        <textarea id="sfDesc" placeholder="أدخل وصفاً للمنتج أو أي ملاحظات..."></textarea>
                    </div>
                </div>
            </div>
            <div class="stock-modal-footer">
                <button class="btn-stock btn-stock-gray" id="stockModalCancel">إلغاء</button>
                <button class="btn-stock btn-stock-primary" id="stockModalSave">💾 حفظ المنتج</button>
            </div>
        </div>
    </div>

    <!-- PDF Options Modal -->
    <div class="pdf-modal-overlay" id="pdfModal">
        <div class="pdf-modal">
            <div class="pdf-modal-header">
                <div class="stock-modal-title">📄 تصدير كتالوج PDF</div>
                <button class="stock-modal-close" id="pdfModalClose">✕</button>
            </div>
            <div class="pdf-modal-body">
                <div class="pdf-option-card selected" id="pdfOptAll" data-opt="all">
                    <div class="pdf-option-icon">📦</div>
                    <div>
                        <div class="pdf-option-title">كل المنتجات</div>
                        <div class="pdf-option-desc">تصدير كتالوج كامل بكل منتجات المخزون (${totalProducts} منتج)</div>
                    </div>
                </div>
                <div class="pdf-option-card" id="pdfOptFiltered" data-opt="filtered">
                    <div class="pdf-option-icon">🔍</div>
                    <div>
                        <div class="pdf-option-title">المنتجات المفلترة</div>
                        <div class="pdf-option-desc">تصدير النتائج الحالية فقط (${filtered.length} منتج)</div>
                    </div>
                </div>
                <div class="pdf-option-card" id="pdfOptSelected" data-opt="selected" style="${selectedIds.size===0?'opacity:.4;pointer-events:none;':''}">
                    <div class="pdf-option-icon">✅</div>
                    <div>
                        <div class="pdf-option-title">المنتجات المحددة</div>
                        <div class="pdf-option-desc">تصدير المنتجات المحددة فقط (${selectedIds.size} محدد)</div>
                    </div>
                </div>
                <div class="stock-fg">
                    <label style="font-size:.82rem;font-weight:700;color:var(--tx2);display:block;margin-bottom:6px;">اسم الشركة في الكتالوج</label>
                    <input type="text" id="pdfCompanyName" value="${localStorage.getItem('sp_company_name')||'Sales Pro'}" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx1);font-size:.9rem;font-family:inherit;box-sizing:border-box;">
                </div>
            </div>
            <div class="pdf-modal-footer">
                <button class="btn-stock btn-stock-gray" id="pdfModalCancel">إلغاء</button>
                <button class="btn-stock btn-stock-pdf" id="pdfModalGenerate">📄 توليد الكتالوج</button>
            </div>
        </div>
    </div>

    <!-- Categories Modal -->
    <div class="stock-modal-overlay" id="catsModal">
        <div class="stock-modal" style="max-width:400px;">
            <div class="stock-modal-header">
                <div class="stock-modal-title">🗂️ إدارة الفئات</div>
                <button class="stock-modal-close" id="catsModalClose">✕</button>
            </div>
            <div class="stock-modal-body" id="catsModalBody">
                ${renderCatsModalBody()}
            </div>
        </div>
    </div>

    <!-- Excel Import Modal -->
    <div class="stock-modal-overlay" id="excelImportModal">
        <div class="stock-modal" style="max-width:580px;">
            <div class="stock-modal-header">
                <div class="stock-modal-title">📥 استيراد من Excel</div>
                <button class="stock-modal-close" id="excelImportClose">✕</button>
            </div>
            <div class="stock-modal-body">

                <!-- Drop Zone -->
                <div id="excelDropZone" style="border:2px dashed var(--bd);border-radius:16px;padding:36px;text-align:center;cursor:pointer;transition:.2s;background:var(--bg2);position:relative;margin-bottom:16px;">
                    <input type="file" id="excelFileInput" accept=".xlsx,.xls,.csv" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;">
                    <div id="excelDropContent">
                        <div style="font-size:2.5rem;margin-bottom:10px;">📊</div>
                        <div style="font-weight:800;font-size:1rem;color:var(--tx1);margin-bottom:6px;">اسحب ملف Excel هنا أو اضغط للاختيار</div>
                        <div style="font-size:0.82rem;color:var(--tx3);">.xlsx / .xls / .csv — نفس هيكل الشيت (كود، وصف، سعر مستخدم، سعر ديلر، براند، فئة)</div>
                    </div>
                    <div id="excelFileChosen" style="display:none;">
                        <div style="font-size:2rem;margin-bottom:8px;">✅</div>
                        <div id="excelFileName" style="font-weight:800;color:var(--ac);font-size:0.95rem;"></div>
                        <div id="excelRowCount" style="font-size:0.82rem;color:var(--tx3);margin-top:4px;"></div>
                    </div>
                </div>

                <!-- Column mapping legend -->
                <div style="background:var(--bg2);border:1px solid var(--bd);border-radius:12px;padding:14px;margin-bottom:16px;font-size:0.82rem;">
                    <div style="font-weight:800;color:var(--tx1);margin-bottom:8px;">🗂️ تعيين الأعمدة المتوقع:</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;color:var(--tx2);">
                        <span>📌 العمود 1 → كود المنتج</span>
                        <span>📝 العمود 2 → الاسم / الوصف</span>
                        <span>💰 العمود 3 → سعر المستخدم</span>
                        <span>🤝 العمود 4 → سعر الديلر (التكلفة)</span>
                        <span>🏷️ العمود 5 → البراند (الفئة)</span>
                        <span>📂 العمود 6 → تصنيف المنتج</span>
                    </div>
                </div>

                <!-- Import Mode -->
                <div style="margin-bottom:16px;">
                    <div style="font-size:0.82rem;font-weight:700;color:var(--tx2);margin-bottom:8px;">طريقة الاستيراد:</div>
                    <div style="display:flex;gap:10px;">
                        <label style="flex:1;display:flex;align-items:center;gap:8px;background:var(--bg2);border:2px solid var(--bd);border-radius:10px;padding:12px 14px;cursor:pointer;transition:.2s;" id="importModeReplaceLabel">
                            <input type="radio" name="importMode" value="replace" checked style="accent-color:var(--ac);">
                            <div>
                                <div style="font-weight:700;font-size:.88rem;color:var(--tx1);">استبدال الكل</div>
                                <div style="font-size:.75rem;color:var(--tx3);">مسح المخزون الحالي وإستيراد الجديد</div>
                            </div>
                        </label>
                        <label style="flex:1;display:flex;align-items:center;gap:8px;background:var(--bg2);border:2px solid var(--bd);border-radius:10px;padding:12px 14px;cursor:pointer;transition:.2s;" id="importModeMergeLabel">
                            <input type="radio" name="importMode" value="merge" style="accent-color:var(--ac);">
                            <div>
                                <div style="font-weight:700;font-size:.88rem;color:var(--tx1);">دمج / تحديث</div>
                                <div style="font-size:.75rem;color:var(--tx3);">إضافة للمخزون الحالي (تحديث بنفس الكود)</div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Preview -->
                <div id="excelPreviewSection" style="display:none;">
                    <div style="font-size:0.82rem;font-weight:700;color:var(--tx2);margin-bottom:8px;">معاينة أول 5 صفوف:</div>
                    <div style="overflow-x:auto;border:1px solid var(--bd);border-radius:10px;">
                        <table id="excelPreviewTable" style="width:100%;border-collapse:collapse;font-size:0.78rem;">
                            <thead style="background:var(--bg3);">
                                <tr>
                                    <th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--bd);white-space:nowrap;">الكود</th>
                                    <th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--bd);">الاسم</th>
                                    <th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--bd);white-space:nowrap;">سعر المستخدم</th>
                                    <th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--bd);white-space:nowrap;">سعر الديلر</th>
                                    <th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--bd);white-space:nowrap;">البراند</th>
                                    <th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--bd);">الفئة</th>
                                </tr>
                            </thead>
                            <tbody id="excelPreviewBody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Progress bar -->
                <div id="excelProgressWrap" style="display:none;margin-top:16px;">
                    <div style="font-size:0.82rem;color:var(--tx2);margin-bottom:6px;" id="excelProgressText">جاري الاستيراد...</div>
                    <div style="background:var(--bg3);border-radius:999px;height:8px;overflow:hidden;">
                        <div id="excelProgressBar" style="height:100%;background:var(--ac);width:0%;transition:width .3s;border-radius:999px;"></div>
                    </div>
                </div>
            </div>
            <div class="stock-modal-footer">
                <button class="btn-stock btn-stock-gray" id="excelImportCancel">إلغاء</button>
                <button class="btn-stock btn-stock-primary" id="excelImportConfirm" disabled style="opacity:.5;">📥 استيراد المنتجات</button>
            </div>
        </div>
    </div>
    `;


    attachStockEvents();
};

/* ─── Render Products ───────────────────────────────────── */
function renderProducts(items) {
    if (!items.length) {
        return `<div class="stock-empty">
            <div class="stock-empty-icon">📭</div>
            <div class="stock-empty-title">لا توجد منتجات</div>
            <div>ابدأ بإضافة منتجات للمخزون</div>
        </div>`;
    }
    if (currentView === 'list') return renderListView(items);
    return renderGridView(items);
}

function qtyClass(qty) {
    if (qty === 0) return 'qty-out';
    if (qty <= 5)  return 'qty-low';
    return 'qty-ok';
}
function qtyLabel(qty) {
    if (qty === 0) return 'نفد';
    if (qty <= 5)  return `${qty} متبقي`;
    return `${qty} قطعة`;
}

function renderGridView(items) {
    return `<div class="stock-grid">${items.map(p => `
        <div class="stock-card ${selectedIds.has(p.id)?'selected':''}" data-id="${p.id}">
            <div class="card-select-check" data-select="${p.id}">✓</div>
            <div class="stock-card-actions">
                <button class="card-act-btn card-act-edit"   data-edit="${p.id}" title="تعديل">✏️</button>
                <button class="card-act-btn card-act-delete" data-del="${p.id}"  title="حذف">🗑️</button>
            </div>
            ${p.image
                ? `<img class="stock-card-img" src="${p.image}" alt="${p.name}" loading="lazy">`
                : `<div class="stock-card-img-placeholder">📦</div>`
            }
            <div class="stock-card-body">
                ${p.code ? `<div class="stock-card-code">${p.code}</div>` : ''}
                <div class="stock-card-name">${p.name}</div>
                ${p.category ? `<span class="stock-card-cat">${p.category}</span>` : ''}
                <div class="stock-card-footer">
                    <div class="stock-card-price">${fmtPrice(p.price)}</div>
                    <span class="stock-card-qty ${qtyClass(p.qty||0)}">${qtyLabel(p.qty||0)}</span>
                </div>
            </div>
        </div>`).join('')}
    </div>`;
}

function renderListView(items) {
    return `<div class="stock-list">${items.map(p => `
        <div class="stock-list-item ${selectedIds.has(p.id)?'selected':''}" data-id="${p.id}">
            <div class="card-select-check" style="position:static;flex-shrink:0;" data-select="${p.id}">✓</div>
            ${p.image
                ? `<img class="list-item-img" src="${p.image}" alt="${p.name}" loading="lazy">`
                : `<div class="list-item-img-ph">📦</div>`
            }
            <div class="list-item-info">
                <div class="list-item-code">${p.code||''}</div>
                <div class="list-item-name">${p.name}</div>
                <div class="list-item-cat">${p.category||''}</div>
                ${p.description ? `<div class="list-item-desc">${p.description}</div>` : ''}
            </div>
            <div class="list-item-price">${fmtPrice(p.price)}</div>
            <span class="list-item-qty ${qtyClass(p.qty||0)}">${qtyLabel(p.qty||0)}</span>
            <div class="list-item-btns">
                <button class="card-act-btn card-act-edit" data-edit="${p.id}" style="opacity:1;">✏️</button>
                <button class="card-act-btn card-act-delete" data-del="${p.id}" style="opacity:1;">🗑️</button>
            </div>
        </div>`).join('')}
    </div>`;
}

/* ─── Categories modal body ─────────────────────────────── */
function renderCatsModalBody() {
    return `
        <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input type="text" id="newCatInput" placeholder="اسم الفئة الجديدة" style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid var(--bd);background:var(--bg2);color:var(--tx1);font-family:inherit;">
            <button class="btn-stock btn-stock-primary" id="addCatBtn" style="white-space:nowrap;">+ إضافة</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${stockCats.map((c,i) => `
                <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid var(--bd);border-radius:10px;padding:10px 14px;">
                    <span style="font-weight:600;color:var(--tx1);">🏷️ ${c}</span>
                    ${stockCats.length > 1 ? `<button data-delcat="${i}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1.1rem;">🗑️</button>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

/* ─── Event Listeners ───────────────────────────────────── */
function attachStockEvents() {
    let currentImageB64 = null;

    /* Search */
    const si = document.getElementById('stockSearchInput');
    if (si) si.addEventListener('input', e => { stockFilter = e.target.value; reRenderProducts(); });

    /* Cat filter */
    const cs = document.getElementById('stockCatSelect');
    if (cs) cs.addEventListener('change', e => { stockCatFilter = e.target.value; reRenderProducts(); });

    /* Sort */
    const ss = document.getElementById('stockSortSelect');
    if (ss) ss.addEventListener('change', e => { stockSort = e.target.value; reRenderProducts(); });

    /* View toggle */
    document.getElementById('viewGridBtn')?.addEventListener('click', () => { currentView = 'grid'; reRenderProducts(); document.getElementById('viewGridBtn').classList.add('active'); document.getElementById('viewListBtn').classList.remove('active'); });
    document.getElementById('viewListBtn')?.addEventListener('click', () => { currentView = 'list'; reRenderProducts(); document.getElementById('viewListBtn').classList.add('active'); document.getElementById('viewGridBtn').classList.remove('active'); });

    /* Add btn */
    document.getElementById('stockAddBtn')?.addEventListener('click', () => openModal());

    /* Modal close */
    document.getElementById('stockModalClose')?.addEventListener('click', closeModal);
    document.getElementById('stockModalCancel')?.addEventListener('click', closeModal);
    document.getElementById('stockModal')?.addEventListener('click', e => { if (e.target.id === 'stockModal') closeModal(); });

    /* Image upload */
    const imgInput  = document.getElementById('stockImgInput');
    const imgPreview = document.getElementById('imgPreview');
    const imgArea   = document.getElementById('imgUploadArea');
    const imgPh     = document.getElementById('imgPlaceholder');
    const imgRemBtn = document.getElementById('imgRemoveBtn');

    if (imgInput) {
        imgInput.addEventListener('change', async e => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) { showToast('❌ حجم الصورة يجب أن يكون أقل من 5 ميجا', 'error'); return; }
            try {
                let b64 = await fileToBase64(file);
                b64 = await resizeImage(b64);
                currentImageB64 = b64;
                imgPreview.src = b64;
                imgPreview.style.display = 'block';
                imgPh.style.display = 'none';
                imgRemBtn.style.display = 'block';
                imgArea.classList.add('has-img');
            } catch(err) { showToast('❌ خطأ في رفع الصورة', 'error'); }
        });
    }
    if (imgRemBtn) {
        imgRemBtn.addEventListener('click', e => {
            e.stopPropagation();
            currentImageB64 = null;
            imgPreview.style.display = 'none';
            imgPreview.src = '';
            imgPh.style.display = 'block';
            imgRemBtn.style.display = 'none';
            imgArea.classList.remove('has-img');
            if (imgInput) imgInput.value = '';
        });
    }

    /* Save product */
    document.getElementById('stockModalSave')?.addEventListener('click', () => {
        const name = document.getElementById('sfName')?.value.trim();
        if (!name) { showToast('❌ أدخل اسم المنتج', 'error'); return; }
        const product = {
            id:          editingId || uid(),
            name,
            code:        document.getElementById('sfCode')?.value.trim()  || '',
            category:    document.getElementById('sfCat')?.value          || '',
            price:       parseFloat(document.getElementById('sfPrice')?.value) || 0,
            qty:         parseInt(document.getElementById('sfQty')?.value)    || 0,
            cost:        parseFloat(document.getElementById('sfCost')?.value)  || 0,
            description: document.getElementById('sfDesc')?.value.trim()  || '',
            image:       currentImageB64,
            updatedAt:   new Date().toISOString()
        };

        if (editingId) {
            const idx = stockData.findIndex(p => p.id === editingId);
            if (idx !== -1) stockData[idx] = product;
            showToast('✅ تم تحديث المنتج', 'success');
        } else {
            product.createdAt = product.updatedAt;
            stockData.unshift(product);
            showToast('✅ تم إضافة المنتج', 'success');
        }
        saveStock(stockData);
        closeModal();
        window.rStock();
    });

    /* Product area delegation (edit, delete, select) */
    document.getElementById('stockProductsContainer')?.addEventListener('click', e => {
        const editBtn = e.target.closest('[data-edit]');
        const delBtn  = e.target.closest('[data-del]');
        const selBtn  = e.target.closest('[data-select]');

        if (editBtn) { openModal(editBtn.dataset.edit); return; }
        if (delBtn)  { confirmDelete(delBtn.dataset.del); return; }
        if (selBtn)  { toggleSelect(selBtn.dataset.select); return; }
    });

    /* PDF btn */
    document.getElementById('stockPdfBtn')?.addEventListener('click', () => openPdfModal());

    /* PDF Modal */
    document.getElementById('pdfModalClose')?.addEventListener('click', closePdfModal);
    document.getElementById('pdfModalCancel')?.addEventListener('click', closePdfModal);
    document.getElementById('pdfModal')?.addEventListener('click', e => { if(e.target.id==='pdfModal') closePdfModal(); });

    document.querySelectorAll('.pdf-option-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.pdf-option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    document.getElementById('pdfModalGenerate')?.addEventListener('click', () => {
        const opt = document.querySelector('.pdf-option-card.selected')?.dataset.opt || 'all';
        const company = document.getElementById('pdfCompanyName')?.value || 'Sales Pro';
        localStorage.setItem('sp_company_name', company);
        let items;
        if (opt === 'all')      items = stockData;
        else if (opt === 'filtered') items = getFilteredStock();
        else items = stockData.filter(p => selectedIds.has(p.id));
        closePdfModal();
        generateCatalogPDF(items, company);
    });

    /* Bulk bar */
    document.getElementById('bulkDeleteBtn')?.addEventListener('click', () => {
        if (!selectedIds.size) return;
        if (confirm(`هل تريد حذف ${selectedIds.size} منتج؟`)) {
            stockData = stockData.filter(p => !selectedIds.has(p.id));
            saveStock(stockData);
            selectedIds.clear();
            window.rStock();
            showToast('✅ تم الحذف', 'success');
        }
    });
    document.getElementById('bulkPdfBtn')?.addEventListener('click', () => {
        const items = stockData.filter(p => selectedIds.has(p.id));
        if (!items.length) return;
        generateCatalogPDF(items, localStorage.getItem('sp_company_name') || 'Sales Pro');
    });
    document.getElementById('bulkClearBtn')?.addEventListener('click', () => {
        selectedIds.clear(); updateBulkBar(); reRenderProducts();
    });

    /* Categories modal */
    document.getElementById('stockManageCatsBtn')?.addEventListener('click', () => {
        document.getElementById('catsModal')?.classList.add('active');
    });
    document.getElementById('catsModalClose')?.addEventListener('click', () => {
        document.getElementById('catsModal')?.classList.remove('active');
    });
    document.getElementById('catsModal')?.addEventListener('click', e => {
        if (e.target.id === 'catsModal') document.getElementById('catsModal')?.classList.remove('active');
    });

    /* Cat modal events (delegated via body since re-rendered) */
    document.getElementById('catsModalBody')?.addEventListener('click', e => {
        if (e.target.id === 'addCatBtn') {
            const val = document.getElementById('newCatInput')?.value.trim();
            if (!val || stockCats.includes(val)) return;
            stockCats.push(val);
            saveCats(stockCats);
            document.getElementById('catsModalBody').innerHTML = renderCatsModalBody();
            reAttachCatBodyEvents();
        }
        const delCatBtn = e.target.closest('[data-delcat]');
        if (delCatBtn) {
            const idx = parseInt(delCatBtn.dataset.delcat);
            stockCats.splice(idx, 1);
            saveCats(stockCats);
            document.getElementById('catsModalBody').innerHTML = renderCatsModalBody();
            reAttachCatBodyEvents();
        }
    });

    /* ── open modal helpers ── */
    function openModal(id) {
        editingId = id || null;
        currentImageB64 = null;
        const modal = document.getElementById('stockModal');
        const title = document.getElementById('stockModalTitle');
        if (!modal) return;
        if (id) {
            const p = stockData.find(x => x.id === id);
            if (!p) return;
            title.textContent = '✏️ تعديل المنتج';
            document.getElementById('sfName').value  = p.name  || '';
            document.getElementById('sfCode').value  = p.code  || '';
            document.getElementById('sfPrice').value = p.price || '';
            document.getElementById('sfQty').value   = p.qty   || '';
            document.getElementById('sfCost').value  = p.cost  || '';
            document.getElementById('sfDesc').value  = p.description || '';
            // Set category
            const catSel = document.getElementById('sfCat');
            if (catSel) { [...catSel.options].forEach(o => { o.selected = o.value === p.category; }); }
            // Set image
            if (p.image) {
                currentImageB64 = p.image;
                imgPreview.src = p.image;
                imgPreview.style.display = 'block';
                imgPh.style.display = 'none';
                imgRemBtn.style.display = 'block';
                imgArea.classList.add('has-img');
            } else {
                clearImgUI();
            }
        } else {
            title.textContent = '+ إضافة منتج جديد';
            ['sfName','sfCode','sfPrice','sfQty','sfCost','sfDesc'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            clearImgUI();
        }
        modal.classList.add('active');

        function clearImgUI() {
            currentImageB64 = null;
            if(imgPreview) { imgPreview.style.display='none'; imgPreview.src=''; }
            if(imgPh) imgPh.style.display='block';
            if(imgRemBtn) imgRemBtn.style.display='none';
            if(imgArea) imgArea.classList.remove('has-img');
            if(imgInput) imgInput.value='';
        }
    }

    function closeModal() {
        document.getElementById('stockModal')?.classList.remove('active');
        editingId = null;
    }

    function openPdfModal() {
        document.getElementById('pdfModal')?.classList.add('active');
    }
    function closePdfModal() {
        document.getElementById('pdfModal')?.classList.remove('active');
    }

    /* ── Excel Import ── */
    let parsedExcelRows = [];

    document.getElementById('stockExcelImportBtn')?.addEventListener('click', () => {
        parsedExcelRows = [];
        // Reset modal UI
        const fi = document.getElementById('excelFileInput');
        if (fi) fi.value = '';
        const dc = document.getElementById('excelDropContent');
        const fc = document.getElementById('excelFileChosen');
        if (dc) dc.style.display = 'block';
        if (fc) fc.style.display = 'none';
        const ps = document.getElementById('excelPreviewSection');
        if (ps) ps.style.display = 'none';
        const pw = document.getElementById('excelProgressWrap');
        if (pw) pw.style.display = 'none';
        const confirmBtn = document.getElementById('excelImportConfirm');
        if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.style.opacity = '.5'; }
        document.getElementById('excelImportModal')?.classList.add('active');
    });

    document.getElementById('excelImportClose')?.addEventListener('click', () => {
        document.getElementById('excelImportModal')?.classList.remove('active');
    });
    document.getElementById('excelImportCancel')?.addEventListener('click', () => {
        document.getElementById('excelImportModal')?.classList.remove('active');
    });
    document.getElementById('excelImportModal')?.addEventListener('click', e => {
        if (e.target.id === 'excelImportModal') document.getElementById('excelImportModal')?.classList.remove('active');
    });

    // Drag & drop highlight
    const dz = document.getElementById('excelDropZone');
    if (dz) {
        dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = 'var(--ac)'; dz.style.background = 'color-mix(in srgb,var(--ac) 5%,var(--bg2))'; });
        dz.addEventListener('dragleave', () => { dz.style.borderColor = 'var(--bd)'; dz.style.background = 'var(--bg2)'; });
        dz.addEventListener('drop', e => {
            e.preventDefault();
            dz.style.borderColor = 'var(--bd)'; dz.style.background = 'var(--bg2)';
            const file = e.dataTransfer.files[0];
            if (file) handleExcelFile(file);
        });
    }

    document.getElementById('excelFileInput')?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) handleExcelFile(file);
    });

    function handleExcelFile(file) {
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xlsx','xls','csv'].includes(ext)) {
            showToast('❌ الملف يجب يكون .xlsx أو .xls أو .csv', 'error');
            return;
        }

        // Check if XLSX library loaded
        if (typeof XLSX === 'undefined') {
            showToast('❌ مكتبة قراءة Excel غير محملة. تأكد من الاتصال بالإنترنت', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = new Uint8Array(ev.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellText: true, cellDates: false });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                // Read as array of arrays, skip header row (row 1)
                const rawRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

                // Skip row 0 (header)
                parsedExcelRows = [];
                for (let i = 1; i < rawRows.length; i++) {
                    const r = rawRows[i];
                    // Skip empty rows
                    if (!r[1] && !r[0]) continue;
                    parsedExcelRows.push({
                        code:        String(r[0] || '').trim(),
                        name:        String(r[1] || '').trim(),
                        price:       parseFloat(String(r[2] || '0').replace(/,/g,'')) || 0,
                        cost:        parseFloat(String(r[3] || '0').replace(/,/g,'')) || 0,
                        category:    String(r[4] || '').trim(),
                        description: String(r[5] || '').trim(),
                        qty:         0,
                        image:       null,
                        id:          uid(),
                        createdAt:   new Date().toISOString(),
                        updatedAt:   new Date().toISOString()
                    });
                }

                // Show chosen state
                document.getElementById('excelDropContent').style.display = 'none';
                document.getElementById('excelFileChosen').style.display = 'block';
                document.getElementById('excelFileName').textContent = '📄 ' + file.name;
                document.getElementById('excelRowCount').textContent = parsedExcelRows.length + ' منتج جاهز للاستيراد';

                // Preview first 5 rows
                const tbody = document.getElementById('excelPreviewBody');
                if (tbody) {
                    tbody.innerHTML = parsedExcelRows.slice(0, 5).map(p => `
                        <tr style="border-bottom:1px solid var(--bd);">
                            <td style="padding:7px 10px;color:var(--tx3);white-space:nowrap;">${p.code}</td>
                            <td style="padding:7px 10px;color:var(--tx1);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</td>
                            <td style="padding:7px 10px;color:var(--ac);white-space:nowrap;">${fmtPrice(p.price)}</td>
                            <td style="padding:7px 10px;color:var(--tx2);white-space:nowrap;">${fmtPrice(p.cost)}</td>
                            <td style="padding:7px 10px;color:var(--tx2);white-space:nowrap;">${p.category}</td>
                            <td style="padding:7px 10px;color:var(--tx3);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.description}</td>
                        </tr>
                    `).join('');
                }
                document.getElementById('excelPreviewSection').style.display = 'block';

                // Enable confirm button
                const confirmBtn = document.getElementById('excelImportConfirm');
                if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.style.opacity = '1'; }

                // Auto-add new brands as categories
                const newCats = [...new Set(parsedExcelRows.map(p => p.category).filter(Boolean))];
                newCats.forEach(c => { if (!stockCats.includes(c)) stockCats.push(c); });
                saveCats(stockCats);

            } catch(err) {
                showToast('❌ خطأ في قراءة الملف: ' + err.message, 'error');
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    document.getElementById('excelImportConfirm')?.addEventListener('click', async () => {
        if (!parsedExcelRows.length) return;

        const mode = document.querySelector('input[name="importMode"]:checked')?.value || 'replace';
        const pw   = document.getElementById('excelProgressWrap');
        const pb   = document.getElementById('excelProgressBar');
        const pt   = document.getElementById('excelProgressText');
        const confirmBtn = document.getElementById('excelImportConfirm');

        if (pw) pw.style.display = 'block';
        if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.style.opacity = '.5'; }

        if (mode === 'replace') {
            // Replace all
            stockData = parsedExcelRows;
        } else {
            // Merge: update by code, add new
            parsedExcelRows.forEach((newP, idx) => {
                const existIdx = stockData.findIndex(p => p.code && p.code === newP.code);
                if (existIdx !== -1) {
                    // Keep existing image & qty, update prices and info
                    const existing = stockData[existIdx];
                    stockData[existIdx] = { ...newP, id: existing.id, image: existing.image, qty: existing.qty, createdAt: existing.createdAt };
                } else {
                    stockData.push(newP);
                }
                // Animate progress
                if (pb) pb.style.width = Math.round(((idx+1)/parsedExcelRows.length)*100) + '%';
            });
        }

        if (pb) pb.style.width = '100%';
        if (pt) pt.textContent = 'تم! جاري الحفظ...';

        saveStock(stockData);

        await new Promise(r => setTimeout(r, 600));
        document.getElementById('excelImportModal')?.classList.remove('active');
        showToast(`✅ تم استيراد ${parsedExcelRows.length} منتج بنجاح!`, 'success');
        parsedExcelRows = [];
        window.rStock();
    });
}


function reAttachCatBodyEvents() {
    document.getElementById('catsModalBody')?.addEventListener('click', e => {
        if (e.target.id === 'addCatBtn') {
            const val = document.getElementById('newCatInput')?.value.trim();
            if (!val || stockCats.includes(val)) return;
            stockCats.push(val);
            saveCats(stockCats);
            document.getElementById('catsModalBody').innerHTML = renderCatsModalBody();
            reAttachCatBodyEvents();
        }
        const delCatBtn = e.target.closest('[data-delcat]');
        if (delCatBtn) {
            const idx = parseInt(delCatBtn.dataset.delcat);
            stockCats.splice(idx, 1);
            saveCats(stockCats);
            document.getElementById('catsModalBody').innerHTML = renderCatsModalBody();
            reAttachCatBodyEvents();
        }
    });
}

/* ─── Select / Bulk ─────────────────────────────────────── */
function toggleSelect(id) {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    updateBulkBar();
    reRenderProducts();
}
function updateBulkBar() {
    const bar = document.getElementById('stockBulkBar');
    const cnt = document.getElementById('bulkCount');
    if (!bar) return;
    if (selectedIds.size > 0) {
        bar.classList.add('visible');
        if (cnt) cnt.textContent = `${selectedIds.size} منتج محدد`;
    } else {
        bar.classList.remove('visible');
    }
}

/* ─── Re-render only the products grid ─────────────────── */
function reRenderProducts() {
    const c = document.getElementById('stockProductsContainer');
    if (!c) return;
    const filtered = getFilteredStock();
    c.innerHTML = renderProducts(filtered);
    updateBulkBar();
}

/* ─── Confirm Delete ────────────────────────────────────── */
function confirmDelete(id) {
    const p = stockData.find(x => x.id === id);
    if (!p) return;
    if (confirm(`هل تريد حذف "${p.name}"؟ لا يمكن التراجع.`)) {
        stockData = stockData.filter(x => x.id !== id);
        saveStock(stockData);
        selectedIds.delete(id);
        window.rStock();
        showToast('✅ تم الحذف', 'success');
    }
}

/* ─── Toast ─────────────────────────────────────────────── */
function showToast(msg, type) {
    if (typeof window.toast === 'function') { window.toast(msg, type); return; }
    const t = document.getElementById('TT');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show';
    setTimeout(() => { t.className = 'toast'; }, 3000);
}

/* ─── PDF Catalog Generation ────────────────────────────── */
async function generateCatalogPDF(items, companyName) {
    if (!items || !items.length) { showToast('❌ لا توجد منتجات للتصدير', 'error'); return; }
    showToast('⏳ جاري إنشاء الكتالوج...', 'info');

    // Build HTML for the catalog
    const date = new Date().toLocaleDateString('ar-EG', {year:'numeric',month:'long',day:'numeric'});

    const productCards = items.map(p => `
        <div class="cat-card">
            ${p.image ? `<img src="${p.image}" alt="${p.name}" class="cat-img">` : '<div class="cat-img-ph">📦</div>'}
            <div class="cat-body">
                ${p.code ? `<div class="cat-code">كود: ${p.code}</div>` : ''}
                <div class="cat-name">${p.name}</div>
                ${p.category ? `<div class="cat-cat">${p.category}</div>` : ''}
                ${p.description ? `<div class="cat-desc">${p.description}</div>` : ''}
                <div class="cat-footer">
                    <div class="cat-price">${fmtPrice(p.price)}</div>
                    <div class="cat-qty ${qtyClass(p.qty||0)}">${qtyLabel(p.qty||0)}</div>
                </div>
            </div>
        </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Tajawal',sans-serif; background:#fff; color:#1a1a1a; direction:rtl; }

  .pdf-cover { background:linear-gradient(135deg,#1a1a1a 0%,#374151 100%); color:#fff; padding:60px 48px 50px; margin-bottom:0; }
  .pdf-cover-brand { font-size:2.4rem; font-weight:800; letter-spacing:-.02em; margin-bottom:8px; }
  .pdf-cover-sub { font-size:1rem; opacity:.7; margin-bottom:32px; }
  .pdf-cover-title { font-size:3rem; font-weight:800; line-height:1.2; margin-bottom:12px; }
  .pdf-cover-meta { font-size:.9rem; opacity:.6; }
  .pdf-cover-badge { display:inline-block; background:rgba(255,255,255,.15); backdrop-filter:blur(8px); padding:6px 18px; border-radius:20px; font-size:.85rem; margin-bottom:24px; }

  .pdf-content { padding:40px 48px; }
  .pdf-section-title { font-size:1.4rem; font-weight:800; margin-bottom:24px; padding-bottom:12px; border-bottom:3px solid #1a1a1a; }

  .cat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .cat-card { border:1px solid #e5e7eb; border-radius:16px; overflow:hidden; break-inside:avoid; page-break-inside:avoid; }
  .cat-img { width:100%; aspect-ratio:1; object-fit:cover; display:block; background:#f9fafb; }
  .cat-img-ph { width:100%; aspect-ratio:1; background:linear-gradient(135deg,#f3f4f6,#e5e7eb); display:flex; align-items:center; justify-content:center; font-size:3rem; }
  .cat-body { padding:14px; }
  .cat-code { font-size:.7rem; color:#9ca3af; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
  .cat-name { font-size:.95rem; font-weight:800; color:#111827; margin-bottom:4px; line-height:1.35; }
  .cat-cat  { font-size:.75rem; background:#f3f4f6; color:#374151; padding:2px 10px; border-radius:12px; display:inline-block; margin-bottom:6px; }
  .cat-desc { font-size:.78rem; color:#6b7280; margin-bottom:8px; line-height:1.5; max-height:60px; overflow:hidden; }
  .cat-footer { display:flex; align-items:center; justify-content:space-between; padding-top:10px; border-top:1px solid #f3f4f6; }
  .cat-price { font-size:1rem; font-weight:800; color:#1a1a1a; }
  .qty-ok   { color:#065f46; background:#d1fae5; }
  .qty-low  { color:#92400e; background:#fef3c7; }
  .qty-out  { color:#991b1b; background:#fee2e2; }
  .cat-qty  { font-size:.75rem; font-weight:700; padding:3px 10px; border-radius:12px; }

  .pdf-footer { margin-top:40px; padding:20px 48px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#f9fafb; }
  .pdf-footer-left { font-size:.82rem; color:#6b7280; }
  .pdf-footer-right { font-size:.82rem; color:#6b7280; }

  @media print {
    .cat-grid { grid-template-columns:repeat(3,1fr); }
    .cat-card { page-break-inside:avoid; }
  }
</style>
</head>
<body>
  <div class="pdf-cover">
    <div class="pdf-cover-brand">${companyName}</div>
    <div class="pdf-cover-sub">كتالوج المنتجات الرسمي</div>
    <div class="pdf-cover-badge">📦 ${items.length} منتج</div>
    <div class="pdf-cover-title">كتالوج<br>المنتجات</div>
    <div class="pdf-cover-meta">تاريخ الإصدار: ${date}</div>
  </div>
  <div class="pdf-content">
    <div class="pdf-section-title">قائمة المنتجات</div>
    <div class="cat-grid">${productCards}</div>
  </div>
  <div class="pdf-footer">
    <div class="pdf-footer-left">${companyName} — جميع الحقوق محفوظة © ${new Date().getFullYear()}</div>
    <div class="pdf-footer-right">تاريخ الطباعة: ${date}</div>
  </div>
</body>
</html>`;

    // Use html2pdf.js
    if (typeof html2pdf !== 'undefined') {
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1050px;direction:rtl;';
        document.body.appendChild(container);

        const opt = {
            margin:       [0, 0, 0, 0],
            filename:     `${companyName}-catalog-${Date.now()}.pdf`,
            image:        { type:'jpeg', quality:0.92 },
            html2canvas:  { scale:2, useCORS:true, allowTaint:true, logging:false },
            jsPDF:        { unit:'mm', format:'a4', orientation:'portrait' },
            pagebreak:    { mode:['avoid-all','css'], before:'.page-break' }
        };

        try {
            await html2pdf().set(opt).from(container.firstElementChild).save();
            showToast('✅ تم توليد الكتالوج بنجاح!', 'success');
        } catch(err) {
            console.error('PDF error:', err);
            showToast('❌ خطأ في توليد PDF', 'error');
        } finally {
            document.body.removeChild(container);
        }
    } else {
        // Fallback: open in new window for printing
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 1000);
        showToast('✅ فتح نافذة الطباعة', 'success');
    }
}

})(); // end IIFE
