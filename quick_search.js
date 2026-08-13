// ============================================================
// quick_search.js — Sales Pro Global Quick Search (Ctrl+K)
// Opens a floating search modal on Ctrl+K or search button click.
// Searches across: customers, invoices, products, pages.
// Safe injection — no existing code modified.
// ============================================================

(function () {
    'use strict';

    // ─── Inject CSS ────────────────────────────────────────────────────────────
    let style = document.createElement('style');
    style.id = 'sp-qs-css';
    style.innerHTML = `
        #sp-qs-overlay {
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            display: flex; align-items: flex-start; justify-content: center;
            padding-top: clamp(60px, 12vh, 120px);
            opacity: 0; pointer-events: none;
            transition: opacity 0.2s;
        }
        #sp-qs-overlay.open { opacity: 1; pointer-events: all; }
        #sp-qs-box {
            width: min(600px, 92vw);
            background: var(--bg2, #1e293b);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 32px 80px rgba(0,0,0,0.6);
            overflow: hidden;
            transform: translateY(-16px) scale(0.97);
            transition: transform 0.25s cubic-bezier(.4,0,.2,1);
        }
        #sp-qs-overlay.open #sp-qs-box { transform: translateY(0) scale(1); }
        #sp-qs-input-wrap {
            display: flex; align-items: center; gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        #sp-qs-input {
            flex: 1; background: none; border: none; outline: none;
            font-size: 1.1rem; color: var(--tx1, #f1f5f9);
            font-family: inherit;
            caret-color: var(--am, #5046e5);
        }
        #sp-qs-input::placeholder { color: var(--tx3, #64748b); }
        #sp-qs-clear { background: none; border: none; cursor: pointer; color: var(--tx3, #64748b); font-size: 1.1rem; padding: 4px; border-radius: 6px; transition: color 0.15s; }
        #sp-qs-clear:hover { color: var(--tx1, #f1f5f9); }
        #sp-qs-results {
            max-height: 420px; overflow-y: auto;
        }
        #sp-qs-results::-webkit-scrollbar { width: 4px; }
        #sp-qs-results::-webkit-scrollbar-track { background: transparent; }
        #sp-qs-results::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .sp-qs-section-label {
            padding: 8px 20px 4px;
            font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1.5px;
            color: var(--tx3, #64748b); font-weight: 700;
        }
        .sp-qs-result {
            display: flex; align-items: center; gap: 14px;
            padding: 12px 20px; cursor: pointer;
            transition: background 0.12s; border-radius: 8px;
            margin: 0 8px 2px;
        }
        .sp-qs-result:hover, .sp-qs-result.selected {
            background: rgba(80,70,229,0.15);
        }
        .sp-qs-result-icon {
            width: 36px; height: 36px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.1rem; flex-shrink: 0;
        }
        .sp-qs-result-main { flex: 1; min-width: 0; }
        .sp-qs-result-title { font-weight: 600; font-size: 0.9rem; color: var(--tx1, #f1f5f9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-qs-result-sub { font-size: 0.75rem; color: var(--tx3, #64748b); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-qs-result-badge {
            font-size: 0.7rem; font-weight: 700; padding: 3px 8px;
            border-radius: 20px; flex-shrink: 0;
        }
        .sp-qs-empty {
            text-align: center; padding: 40px 20px;
            color: var(--tx3, #64748b); font-size: 0.9rem;
        }
        #sp-qs-footer {
            padding: 10px 20px;
            border-top: 1px solid rgba(255,255,255,0.06);
            display: flex; align-items: center; gap: 16px;
            font-size: 0.7rem; color: var(--tx3, #64748b);
        }
        .sp-qs-key {
            background: rgba(255,255,255,0.08); border-radius: 5px;
            padding: 2px 6px; font-size: 0.68rem; font-family: monospace;
            border: 1px solid rgba(255,255,255,0.12);
        }
        #sp-qs-search-btn {
            background: none; border: none; cursor: pointer;
            color: var(--tx2, #94a3b8); font-size: 1rem; padding: 4px 6px;
            border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; gap: 4px;
        }
        #sp-qs-search-btn:hover { background: rgba(255,255,255,0.08); color: var(--tx1,#f1f5f9); }
    `;
    document.head.appendChild(style);

    // ─── Build search data ─────────────────────────────────────────────────────
    function buildIndex() {
        let L = localStorage.getItem('sp_lang') || 'ar';
        let S_data = [];
        let T_data = [];
        try { S_data = JSON.parse(localStorage.getItem('salesData') || '[]'); } catch(e) {}
        try { T_data = JSON.parse(localStorage.getItem('targetData') || '[]'); } catch(e) {}

        let results = [];

        // Pages
        let pages = [
            { icon: '🏠', title: L === 'ar' ? 'لوحة التحكم' : 'Dashboard', page: 'dash', color: '#5046e5' },
            { icon: '💰', title: L === 'ar' ? 'المبيعات' : 'Sales', page: 'sales', color: '#10b981' },
            { icon: '🎯', title: L === 'ar' ? 'تارجت العملاء' : 'Targets', page: 'targets', color: '#f59e0b' },
            { icon: '🏪', title: L === 'ar' ? 'العملاء' : 'Customers', page: 'customers', color: '#3b82f6' },
            { icon: '📅', title: L === 'ar' ? 'سجل اليوم' : 'Daily Feed', page: 'today', color: '#8b5cf6' },
            { icon: '📋', title: L === 'ar' ? 'المهام' : 'To-Do', page: 'todo', color: '#06b6d4' },
            { icon: '🚗', title: L === 'ar' ? 'الزيارات' : 'Visits', page: 'visits', color: '#f97316' },
            { icon: '🤝', title: L === 'ar' ? 'محتملين' : 'Leads', page: 'leads', color: '#ec4899' },
            { icon: '🧠', title: L === 'ar' ? 'التحليلات' : 'Analytics', page: 'analytics', color: '#a78bfa' },
            { icon: '💵', title: L === 'ar' ? 'هامش الربح' : 'Profit', page: 'profit', color: '#34d399' },
            { icon: '⭐', title: L === 'ar' ? 'المميزين' : 'Key Accounts', page: 'keyacc', color: '#fbbf24' },
            { icon: '💤', title: L === 'ar' ? 'الخاملين' : 'Dormant', page: 'dormant', color: '#ef4444' },
            { icon: '🔔', title: L === 'ar' ? 'التنبيهات' : 'Alerts', page: 'alerts', color: '#f59e0b' },
            { icon: '⚙️', title: L === 'ar' ? 'الإعدادات' : 'Settings', page: 'settings', color: '#64748b' },
        ];
        pages.forEach(p => results.push({ type: 'page', ...p }));

        // Customers (unique from sales + targets)
        let customers = new Set();
        S_data.forEach(r => { if (r.Customer) customers.add(r.Customer); });
        T_data.forEach(r => { if (r.Customer) customers.add(r.Customer); });
        customers.forEach(c => {
            let sTotal = 0;
            S_data.filter(r => r.Customer === c).forEach(r => {
                sTotal += typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
            });
            results.push({ type: 'customer', icon: '🏪', title: c, sub: `${L === 'ar' ? 'إجمالي المبيعات:' : 'Total Sales:'} ${sTotal >= 1000 ? (sTotal/1000).toFixed(1)+'K' : Math.round(sTotal)}`, page: 'customers', color: '#3b82f6', value: sTotal });
        });

        // Products / Items (unique)
        let items = {};
        S_data.forEach(r => {
            let name = r['Item Description'] || r['Item Class Name'];
            if (name) {
                items[name] = (items[name] || 0) + (typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0));
            }
        });
        Object.entries(items).slice(0, 200).forEach(([name, val]) => {
            results.push({ type: 'product', icon: '📦', title: name, sub: `${L === 'ar' ? 'مبيعات:' : 'Sales:'} ${val >= 1000 ? (val/1000).toFixed(1)+'K' : Math.round(val)}`, page: 'sales', color: '#10b981', value: val });
        });

        return results;
    }

    // ─── Search Logic ──────────────────────────────────────────────────────────
    let allItems = [];
    let selectedIdx = 0;

    function doSearch(q) {
        if (!q || q.trim().length === 0) return getRecent();
        let lower = q.toLowerCase();
        return allItems
            .filter(r => r.title.toLowerCase().includes(lower) || (r.sub || '').toLowerCase().includes(lower))
            .sort((a, b) => {
                let aS = a.title.toLowerCase().startsWith(lower) ? 0 : 1;
                let bS = b.title.toLowerCase().startsWith(lower) ? 0 : 1;
                return aS - bS || (b.value || 0) - (a.value || 0);
            })
            .slice(0, 20);
    }

    function getRecent() {
        let L = localStorage.getItem('sp_lang') || 'ar';
        let pages = allItems.filter(r => r.type === 'page').slice(0, 6);
        let topCustomers = allItems.filter(r => r.type === 'customer').sort((a,b) => (b.value||0)-(a.value||0)).slice(0,4);
        return [...pages, ...topCustomers];
    }

    function highlight(text, q) {
        if (!q) return text;
        let idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text;
        return text.slice(0, idx) + `<mark style="background:rgba(80,70,229,0.4);color:inherit;border-radius:2px;">${text.slice(idx, idx + q.length)}</mark>` + text.slice(idx + q.length);
    }

    function renderResults(items, q) {
        let L = localStorage.getItem('sp_lang') || 'ar';
        let resultsEl = document.getElementById('sp-qs-results');
        if (!resultsEl) return;
        selectedIdx = 0;

        if (items.length === 0) {
            resultsEl.innerHTML = `<div class="sp-qs-empty">🔍 ${L === 'ar' ? 'لا توجد نتائج لـ' : 'No results for'} "${q}"</div>`;
            return;
        }

        let grouped = {};
        items.forEach(r => {
            if (!grouped[r.type]) grouped[r.type] = [];
            grouped[r.type].push(r);
        });

        let typeLabels = { page: L === 'ar' ? 'الصفحات' : 'Pages', customer: L === 'ar' ? 'العملاء' : 'Customers', product: L === 'ar' ? 'المنتجات' : 'Products' };
        let html = '';
        let itemIdx = 0;

        Object.entries(grouped).forEach(([type, group]) => {
            html += `<div class="sp-qs-section-label">${typeLabels[type] || type}</div>`;
            group.forEach(item => {
                let badge = type === 'page' ? `<span class="sp-qs-result-badge" style="background:${item.color}22;color:${item.color};">${L === 'ar' ? 'صفحة' : 'page'}</span>` :
                            type === 'customer' ? `<span class="sp-qs-result-badge" style="background:rgba(59,130,246,0.15);color:#3b82f6;">${L === 'ar' ? 'عميل' : 'customer'}</span>` :
                            `<span class="sp-qs-result-badge" style="background:rgba(16,185,129,0.15);color:#10b981;">${L === 'ar' ? 'منتج' : 'product'}</span>`;
                html += `
                    <div class="sp-qs-result${itemIdx === 0 ? ' selected' : ''}" data-idx="${itemIdx}" data-page="${item.page}" data-customer="${type === 'customer' ? item.title : ''}" onclick="spQsNavigate(this)">
                        <div class="sp-qs-result-icon" style="background:${item.color}22;">${item.icon}</div>
                        <div class="sp-qs-result-main">
                            <div class="sp-qs-result-title">${highlight(item.title, q)}</div>
                            ${item.sub ? `<div class="sp-qs-result-sub">${item.sub}</div>` : ''}
                        </div>
                        ${badge}
                    </div>`;
                itemIdx++;
            });
        });

        resultsEl.innerHTML = html;
    }

    // ─── Navigation ────────────────────────────────────────────────────────────
    window.spQsNavigate = function (el) {
        let page = el.getAttribute('data-page');
        let customer = el.getAttribute('data-customer');
        closeSearch();
        if (page) {
            if (typeof window.P !== 'undefined') window.P = page;
            if (typeof buildNav === 'function') buildNav();
            if (typeof render === 'function') render();
            // Special: if it's a customer search, try to open customer profile
            if (customer && typeof window.openCustomerProfile === 'function') {
                setTimeout(() => window.openCustomerProfile(customer), 300);
            }
        }
    };

    // ─── Keyboard navigation ───────────────────────────────────────────────────
    function moveSelection(dir) {
        let items = document.querySelectorAll('.sp-qs-result');
        if (!items.length) return;
        items[selectedIdx]?.classList.remove('selected');
        selectedIdx = Math.max(0, Math.min(items.length - 1, selectedIdx + dir));
        items[selectedIdx]?.classList.add('selected');
        items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
    }

    // ─── Open / Close ──────────────────────────────────────────────────────────
    function openSearch() {
        allItems = buildIndex();
        let overlay = document.getElementById('sp-qs-overlay');
        if (!overlay) return;
        overlay.classList.add('open');
        setTimeout(() => {
            let inp = document.getElementById('sp-qs-input');
            if (inp) { inp.focus(); inp.value = ''; }
            renderResults(getRecent(), '');
        }, 50);
    }

    function closeSearch() {
        let overlay = document.getElementById('sp-qs-overlay');
        if (overlay) overlay.classList.remove('open');
    }

    // ─── Build DOM ─────────────────────────────────────────────────────────────
    function buildSearchUI() {
        if (document.getElementById('sp-qs-overlay')) return;
        let L = localStorage.getItem('sp_lang') || 'ar';

        let overlay = document.createElement('div');
        overlay.id = 'sp-qs-overlay';
        overlay.innerHTML = `
            <div id="sp-qs-box">
                <div id="sp-qs-input-wrap">
                    <span style="font-size:1.1rem;color:var(--tx3,#64748b);">🔍</span>
                    <input id="sp-qs-input" type="text" placeholder="${L === 'ar' ? 'ابحث عن عميل، منتج، أو صفحة...' : 'Search customers, products, pages...'}" autocomplete="off" spellcheck="false">
                    <button id="sp-qs-clear" onclick="document.getElementById('sp-qs-input').value='';document.getElementById('sp-qs-input').dispatchEvent(new Event('input'));document.getElementById('sp-qs-input').focus();">✕</button>
                </div>
                <div id="sp-qs-results"></div>
                <div id="sp-qs-footer">
                    <span><span class="sp-qs-key">↑↓</span> ${L === 'ar' ? 'تنقل' : 'navigate'}</span>
                    <span><span class="sp-qs-key">Enter</span> ${L === 'ar' ? 'فتح' : 'open'}</span>
                    <span><span class="sp-qs-key">Esc</span> ${L === 'ar' ? 'إغلاق' : 'close'}</span>
                    <span style="margin-right:auto;"><span class="sp-qs-key">Ctrl</span> + <span class="sp-qs-key">K</span></span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });

        // Input events
        let inp = document.getElementById('sp-qs-input');
        let debounceTimer;
        inp.addEventListener('input', e => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                let q = e.target.value.trim();
                renderResults(doSearch(q), q);
            }, 120);
        });

        inp.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
            else if (e.key === 'Enter') {
                e.preventDefault();
                let selected = document.querySelector('.sp-qs-result.selected');
                if (selected) selected.click();
            }
            else if (e.key === 'Escape') closeSearch();
        });
    }

    // ─── Add search button to sidebar ─────────────────────────────────────────
    function addSearchBtn() {
        let sbt = document.querySelector('.sbt, .sbr');
        if (!sbt || document.getElementById('sp-qs-search-btn')) return;
        let L = localStorage.getItem('sp_lang') || 'ar';
        let btn = document.createElement('button');
        btn.id = 'sp-qs-search-btn';
        btn.title = L === 'ar' ? 'بحث سريع (Ctrl+K)' : 'Quick Search (Ctrl+K)';
        btn.innerHTML = `<span>🔍</span><span style="font-size:0.65rem;opacity:0.6;">Ctrl+K</span>`;
        btn.onclick = openSearch;

        // Insert into sidebar top area
        let sbTitleEl = document.querySelector('.sbt');
        if (sbTitleEl) sbTitleEl.appendChild(btn);
    }

    // ─── Keyboard shortcut ─────────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            let overlay = document.getElementById('sp-qs-overlay');
            if (overlay && overlay.classList.contains('open')) {
                closeSearch();
            } else {
                openSearch();
            }
        }
        if (e.key === 'Escape') {
            let overlay = document.getElementById('sp-qs-overlay');
            if (overlay && overlay.classList.contains('open')) closeSearch();
        }
    });

    // ─── Initialize ────────────────────────────────────────────────────────────
    function init() {
        buildSearchUI();
        addSearchBtn();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
    } else {
        setTimeout(init, 1000);
    }

    // Re-add search button on nav rebuild
    let _origBNQS = window.buildNav;
    window.buildNav = function () {
        if (_origBNQS) _origBNQS();
        setTimeout(addSearchBtn, 200);
    };

    window.spOpenSearch = openSearch;
    window.spCloseSearch = closeSearch;

})();
