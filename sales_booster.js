/**
 * ============================================================
 * sales_booster.js — Sales Pro Enterprise Growth Suite (v5.6)
 * Lightweight, Ultra-Responsive, Zero-Lag Architecture.
 * ============================================================
 */

(function () {
    'use strict';

    // ─── Fast Helpers ──────────────────────────────────────────────────────────
    const t = (ar, en) => (typeof L !== 'undefined' && L === 'en') ? en : ar;
    const fmtN = n => Number(n || 0).toLocaleString('en-US');
    const fmtP = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ' + t('ج.م', 'EGP');

    function getS() { return (typeof S !== 'undefined' && Array.isArray(S)) ? S : (JSON.parse(localStorage.getItem('salesData') || '[]')); }
    function getT() { return (typeof T !== 'undefined' && Array.isArray(T)) ? T : (JSON.parse(localStorage.getItem('targetData') || '[]')); }
    function getDues() { return (typeof D !== 'undefined' && Array.isArray(D)) ? D : (JSON.parse(localStorage.getItem('duesData') || '[]')); }
    function getStock() { try { return JSON.parse(localStorage.getItem('sp_stock_v1') || '[]'); } catch(e) { return []; } }
    function getObjections() { try { return JSON.parse(localStorage.getItem('sp_objections') || '[]'); } catch(e) { return []; } }

    function parseDateFast(v) {
        if (!v) return null;
        if (typeof v === 'number') return new Date(Math.round((v - 25569) * 86400 * 1000));
        if (typeof v === 'string') {
            let p = v.split(/[\/\-]/);
            if (p.length === 3) {
                let y = p[2].length === 2 ? '20' + p[2] : p[2];
                return new Date(`${y}-${('0'+p[1]).slice(-2)}-${('0'+p[0]).slice(-2)}`);
            }
        }
        let d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    function showToast(msg, type = 'info') {
        if (typeof window.toast === 'function') {
            window.toast(msg, type);
            return;
        }
        let tEl = document.getElementById('TT');
        if (!tEl) return;
        tEl.textContent = msg;
        tEl.className = 'toast show ' + type;
        setTimeout(() => { tEl.className = 'toast'; }, 3000);
    }

    // ─── Register Navigation & Direct Translations ─────────────────────────────
    function registerBoosterNav() {
        if (typeof I !== 'undefined') {
            I.upsell = { ar: 'محرك الفرص', en: 'Upsell & Bundles' };
            I.quotes = { ar: 'عروض الواتساب', en: 'WhatsApp Quotes' };
            I.rfm = { ar: 'تصنيف العملاء', en: 'RFM Segments' };
            I.commission = { ar: 'حاسبة العمولات', en: 'Commission Sim' };
            I.routes = { ar: 'مسارات الزيارات', en: 'Field Routes' };
            I.intel = { ar: 'استخبارات السوق', en: 'Market Intel' };
            I.leaderboard = { ar: 'لوحة الشرف', en: 'Leaderboard' };
        }

        if (typeof ICONS !== 'undefined') {
            ICONS.upsell = '🛍️';
            ICONS.quotes = '💬';
            ICONS.rfm = '👑';
            ICONS.commission = '🏆';
            ICONS.routes = '🗺️';
            ICONS.intel = '🛡️';
            ICONS.leaderboard = '🎮';
        }

        if (typeof NAV === 'undefined' || !Array.isArray(NAV)) return;

        const newTabs = [
            { p: 'upsell', ic: '🛍️' },
            { p: 'quotes', ic: '💬' },
            { p: 'rfm', ic: '👑' },
            { p: 'commission', ic: '🏆' },
            { p: 'routes', ic: '🗺️' },
            { p: 'intel', ic: '🛡️' },
            { p: 'leaderboard', ic: '🎮' }
        ];

        const hasSection = NAV.some(n => n.s && (n.s.ar === 'مضاعفة المبيعات 🔥' || n.s.en === 'Growth & Booster 🔥'));
        if (!hasSection) {
            const insertAt = NAV.length - 6;
            const sectionHeader = { s: { ar: 'مضاعفة المبيعات 🔥', en: 'Growth & Booster 🔥' } };
            const itemsToInsert = [sectionHeader];

            newTabs.forEach(tab => {
                if (!NAV.some(n => n.p === tab.p)) {
                    itemsToInsert.push(tab);
                }
            });

            NAV.splice(Math.max(1, insertAt), 0, ...itemsToInsert);
        }
    }

    // ─── Fast Asynchronous Badges ─────────────────────────────────────────────
    let _cachedDormant = null;
    let _cachedLowStock = null;

    function calcBadgesAsync() {
        setTimeout(() => {
            try {
                const sData = getS();
                const now = new Date();
                const custLastMap = {};
                const limit = Math.min(sData.length, 1000);
                for (let i = 0; i < limit; i++) {
                    const r = sData[i];
                    const name = r.customer || r['اسم العميل'] || r['العميل'] || r.Customer;
                    const dt = parseDateFast(r.date || r['التاريخ'] || r['Order Date']);
                    if (name && dt) {
                        if (!custLastMap[name] || dt > custLastMap[name]) custLastMap[name] = dt;
                    }
                }
                _cachedDormant = Object.values(custLastMap).filter(d => (now - d) / (1000 * 60 * 60 * 24) > 30).length;
                const stockData = getStock();
                _cachedLowStock = stockData.filter(p => p.qty != null && p.qty <= 5).length;
                renderBadgesDOM();
            } catch(e) {}
        }, 150);
    }

    function renderBadgesDOM() {
        const badgeMap = {
            'dormant': { count: _cachedDormant, cls: 'sp-badge-amber' },
            'stock': { count: _cachedLowStock, cls: 'sp-badge-danger' },
            'upsell': { count: 'HOT', cls: 'sp-badge-hot' },
            'rfm': { count: 'VIP', cls: 'sp-badge-success' },
            'routes': { count: 'GPS', cls: 'sp-badge-blue' }
        };

        document.querySelectorAll('.ni').forEach(el => {
            const p = el.getAttribute('data-p');
            if (badgeMap[p]) {
                let badge = el.querySelector('.sp-nav-badge');
                const val = badgeMap[p].count;
                if (val && (typeof val === 'string' || val > 0)) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'sp-nav-badge ' + badgeMap[p].cls;
                        el.appendChild(badge);
                    }
                    badge.textContent = typeof val === 'number' && val > 99 ? '99+' : val;
                }
            }
        });
    }

    // ─── TAB 1: UPSELL & SMART BUNDLES ENGINE ─────────────────────────────────
    window.rUpsell = function rUpsell() {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getS();
        const custProfiles = {};
        const limit = Math.min(S_data.length, 1500);

        for (let i = 0; i < limit; i++) {
            const r = S_data[i];
            const cust = r.customer || r['اسم العميل'] || r['العميل'] || r.Customer || t('عميل عام', 'General Client');
            const cat = String(r.category || r['الفئة'] || r['Item Class Name'] || '').toLowerCase();
            const val = parseFloat(r.amount || r['المبلغ'] || r['Sales Without Tax'] || 0) || 0;

            if (!custProfiles[cust]) custProfiles[cust] = { total: 0, hw: 0, acc: 0 };
            custProfiles[cust].total += val;
            if (cat.includes('hard') || cat.includes('موبايل') || cat.includes('هاتف') || cat.includes('phone')) {
                custProfiles[cust].hw += val;
            } else {
                custProfiles[cust].acc += val;
            }
        }

        const opportunityList = [];
        Object.keys(custProfiles).forEach(c => {
            const p = custProfiles[c];
            if (p.total > 4000) {
                if (p.hw > 0 && p.acc === 0) {
                    opportunityList.push({
                        customer: c,
                        title: t('فرصة إكسسوارات ذهبية', 'Accessories Opportunity'),
                        desc: t(`العميل اشترى أجهزة بقيمة ${fmtP(p.hw)} بدون إكسسوارات. اقترح بكج حماية وشواحن لرفع الربحية.`, `Client purchased ${fmtP(p.hw)} hardware without accessories.`),
                        tag: t('هامش ربح مرتفع', 'High Margin')
                    });
                } else if (p.acc > 0 && p.hw === 0) {
                    opportunityList.push({
                        customer: c,
                        title: t('فرصة ترقية هواتف وأجهزة', 'Hardware Upgrade'),
                        desc: t(`العميل عميل إكسسوارات نشط بقيمة ${fmtP(p.acc)}. اقترح عليه عرض كميات للأجهزة.`, `Active accessory client with ${fmtP(p.acc)}. Pitch phones!`),
                        tag: t('حجم فاتورة كبير', 'Large Basket')
                    });
                }
            }
        });

        const bundles = [
            {
                title: t('📦 بكج الحماية والشحن السريع', '📦 Fast Charging & Shield Bundle'),
                items: [t('5x شاحن سريع 20W', '5x Fast Charger 20W'), t('10x كابلات Type-C', '10x Type-C Cables'), t('10x لاصقة حماية', '10x Screen Protectors')],
                origPrice: 2400, dealPrice: 2150, discount: '10%'
            },
            {
                title: t('🎧 بكج الصوتيات المميز (الأكثر طلباً)', '🎧 Premium Audio Bundle'),
                items: [t('3x سماعة لاسلكية TWS', '3x Wireless TWS Earbuds'), t('2x مكبر صوت محمول', '2x Bluetooth Speakers'), t('5x سماعات سلكية', '5x Wired Earphones')],
                origPrice: 3800, dealPrice: 3390, discount: '11%'
            },
            {
                title: t('🚀 بكج تجهيز المحلات والمتاجر', '🚀 Store Best-Seller Pack'),
                items: [t('20x جرابات متنوعة', '20x Assorted Cases'), t('15x شواحن منزلية', '15x Wall Chargers'), t('20x كابلات شحن', '20x Multi-Cables')],
                origPrice: 5200, dealPrice: 4500, discount: '14%'
            }
        ];

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box">🛍️</div>
                <div>
                    <div class="booster-title">${t('محرك الفرص البيعية والـ Bundles', 'Smart Upsell & Bundles Engine')}</div>
                    <div class="booster-desc">${t('اقتراحات فورية لزيادة حجم الفاتورة وهامش ربح المندوب', 'Instant recommendations to maximize basket size')}</div>
                </div>
            </div>
            <button class="btn btn-p" onclick="P='quotes';if(typeof render==='function')render();if(typeof buildNav==='function')buildNav();" style="padding:9px 18px; border-radius:10px; font-weight:800;">
                💬 ${t('عرض سعر واتساب', 'WhatsApp Quote')}
            </button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:20px;">
            <div class="card" style="padding:16px; border-radius:14px;">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:700;">${t('الفرص المكتشفة', 'Opportunities')}</div>
                <div style="font-size:1.5rem; font-weight:900; color:#3b82f6; margin-top:2px;">${fmtN(opportunityList.length)} ${t('فرصة', 'Leads')}</div>
            </div>
            <div class="card" style="padding:16px; border-radius:14px;">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:700;">${t('زيادة الفاتورة المتوقعة', 'Expected Basket Lift')}</div>
                <div style="font-size:1.5rem; font-weight:900; color:#10b981; margin-top:2px;">+28.5%</div>
            </div>
            <div class="card" style="padding:16px; border-radius:14px;">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:700;">${t('البكجات الجاهزة', 'Ready Bundles')}</div>
                <div style="font-size:1.5rem; font-weight:900; color:#f59e0b; margin-top:2px;">${bundles.length} ${t('بكجات', 'Bundles')}</div>
            </div>
        </div>

        <div style="margin-bottom:28px;">
            <h3 style="font-size:1.1rem; font-weight:800; color:var(--tx1); margin-bottom:12px;">🎯 ${t('عملاء مؤهلون لعروض الـ Cross-Sell', 'Eligible Customers for Cross-Sell')}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px;">
                ${opportunityList.length ? opportunityList.slice(0, 6).map(op => `
                <div class="card" style="padding:16px; border-radius:14px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-weight:900; font-size:1rem; color:var(--tx1);">${op.customer}</span>
                            <span style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:6px; background:rgba(59,130,246,0.12); color:#3b82f6;">${op.tag}</span>
                        </div>
                        <div style="font-size:0.82rem; font-weight:700; color:#f59e0b; margin-bottom:4px;">✨ ${op.title}</div>
                        <p style="font-size:0.8rem; color:var(--tx2); line-height:1.45; margin-bottom:12px;">${op.desc}</p>
                    </div>
                    <button class="btn btn-p" onclick="window.quickPitchQuote('${encodeURIComponent(op.customer)}')" style="width:100%; padding:8px; border-radius:8px; font-weight:700; font-size:0.82rem;">
                        💬 ${t('إنشاء عرض واتساب', 'Create WA Quote')}
                    </button>
                </div>`).join('') : `<div class="card" style="grid-column:1/-1; padding:20px; text-align:center; color:var(--tx3); font-weight:700;">✅ ${t('توزيع المبيعات متناسق تماماً', 'All accounts balanced')}</div>`}
            </div>
        </div>

        <div>
            <h3 style="font-size:1.1rem; font-weight:800; color:var(--tx1); margin-bottom:12px;">🎁 ${t('البكجات الترويجية الجاهزة للمشاركة', 'Smart Bundles')}</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
                ${bundles.map(b => `
                <div class="card" style="padding:18px; border-radius:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-weight:900; font-size:1rem; color:var(--tx1);">${b.title}</span>
                        <span style="background:#10b981; color:#fff; font-size:0.72rem; font-weight:800; padding:2px 6px; border-radius:6px;">${b.discount}</span>
                    </div>
                    <ul style="list-style:none; padding:0; margin:0 0 14px 0; font-size:0.82rem; color:var(--tx2); display:flex; flex-direction:column; gap:4px;">
                        ${b.items.map(it => `<li>✅ ${it}</li>`).join('')}
                    </ul>
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:10px; border-top:1px solid var(--bd); margin-bottom:12px;">
                        <div>
                            <div style="font-size:0.72rem; color:var(--tx3); text-decoration:line-through;">${fmtP(b.origPrice)}</div>
                            <div style="font-size:1.25rem; font-weight:900; color:#10b981;">${fmtP(b.dealPrice)}</div>
                        </div>
                    </div>
                    <button class="btn btn-p" onclick="window.sendBundleWhatsApp('${encodeURIComponent(b.title)}', ${b.dealPrice}, '${encodeURIComponent(b.items.join(' + '))}')" style="width:100%; padding:9px; border-radius:8px; font-weight:800; font-size:0.85rem; background:#25d366; color:#111b21; border:none;">
                        💬 ${t('مشاركة عبر WhatsApp', 'Share on WhatsApp')}
                    </button>
                </div>`).join('')}
            </div>
        </div>
        `;
    };

    window.quickPitchQuote = function(custNameEnc) {
        const custName = decodeURIComponent(custNameEnc);
        if (typeof P !== 'undefined') P = 'quotes';
        if (typeof window.rQuotes === 'function') window.rQuotes(custName);
        if (typeof buildNav === 'function') buildNav();
    };

    window.sendBundleWhatsApp = function(titleEnc, price, itemsEnc) {
        const title = decodeURIComponent(titleEnc);
        const items = decodeURIComponent(itemsEnc);
        const text = `🔥 *عرض خاص من Sales Pro* 🔥\n\n*${title}*\n\n📦 *المحتويات:*\n${items.split(' + ').map(i => '• ' + i).join('\n')}\n\n💰 *السعر المخفض:* ${price.toLocaleString('en-US')} ج.م فقط!\n\n_للطلب أو الحجز يرجى الرد على الرسالة._ ✨`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    // ─── TAB 2: INSTANT WHATSAPP QUOTES ───────────────────────────────────────
    window.rQuotes = function rQuotes(preCustomer = '') {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getS();
        const customerSet = new Set();
        const limit = Math.min(S_data.length, 500);
        for (let i = 0; i < limit; i++) {
            const name = S_data[i].customer || S_data[i]['اسم العميل'] || S_data[i]['العميل'] || S_data[i].Customer;
            if (name) customerSet.add(name);
        }
        const customers = Array.from(customerSet).sort();

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box" style="background:#25d366;">💬</div>
                <div>
                    <div class="booster-title">${t('عروض الأسعار وفواتير WhatsApp', 'WhatsApp Quotations & Messaging')}</div>
                    <div class="booster-desc">${t('أنشئ عرض سعر في 30 ثانية وشاركه مباشرة مع العميل', 'Generate and send quotes in 30 seconds')}</div>
                </div>
            </div>
        </div>

        <div class="quote-builder-grid">
            <div class="card" style="padding:18px; border-radius:16px;">
                <h3 style="font-size:1rem; font-weight:800; margin-bottom:14px;">📝 ${t('بيانات عرض السعر', 'Quote Details')}</h3>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('العميل المستهدف', 'Customer')}</label>
                    <input type="text" id="quoteCustName" list="quoteCustList" placeholder="${t('اسم العميل...', 'Customer name...')}" value="${preCustomer}" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem;">
                    <datalist id="quoteCustList">
                        ${customers.map(c => `<option value="${c}">`).join('')}
                    </datalist>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('رقم الهاتف (اختياري للفتح المباشر)', 'Phone (Optional)')}</label>
                    <input type="tel" id="quoteCustPhone" placeholder="010XXXXXXXX" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem;">
                </div>

                <div style="margin-bottom:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <label style="font-size:0.75rem; font-weight:700; color:var(--tx3);">${t('الأصناف', 'Items')}</label>
                        <button type="button" class="btn btn-p" id="btnAddQuoteRow" style="padding:3px 8px; font-size:0.72rem; border-radius:6px;">+ ${t('إضافة صنف', 'Add')}</button>
                    </div>
                    <div id="quoteRowsContainer" style="display:flex; flex-direction:column; gap:6px;"></div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
                    <div>
                        <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('خصم %', 'Discount %')}</label>
                        <input type="number" id="quoteDiscount" min="0" max="100" value="0" style="width:100%; padding:8px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem;">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('الصلاحية', 'Validity')}</label>
                        <select id="quoteValidity" style="width:100%; padding:8px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem;">
                            <option value="3">3 ${t('أيام', 'Days')}</option>
                            <option value="7" selected>7 ${t('أيام', 'Days')}</option>
                            <option value="15">15 ${t('يوم', 'Days')}</option>
                        </select>
                    </div>
                </div>

                <div style="padding:10px; border-radius:10px; background:var(--bg3); border:1px dashed var(--bd);">
                    <div style="font-size:0.75rem; font-weight:800; color:#f59e0b; margin-bottom:6px;">⚡ ${t('قوالب رسائل جاهزة', 'Instant Templates')}</div>
                    <div style="display:flex; flex-wrap:wrap; gap:5px;">
                        <button type="button" class="btn btn-ghost" onclick="window.applyWaTemplate('payment_reminder')" style="font-size:0.72rem; padding:4px 8px; border-radius:6px;">💳 ${t('تذكير سداد', 'Payment')}</button>
                        <button type="button" class="btn btn-ghost" onclick="window.applyWaTemplate('new_stock')" style="font-size:0.72rem; padding:4px 8px; border-radius:6px;">📦 ${t('بضاعة جديدة', 'New Stock')}</button>
                        <button type="button" class="btn btn-ghost" onclick="window.applyWaTemplate('win_back')" style="font-size:0.72rem; padding:4px 8px; border-radius:6px;">🎁 ${t('عرض راكدين', 'Win-Back')}</button>
                    </div>
                </div>
            </div>

            <div>
                <div class="wa-preview-card">
                    <div style="display:flex; align-items:center; gap:8px; padding-bottom:10px; border-bottom:1px solid #202c33; margin-bottom:10px;">
                        <div style="width:32px; height:32px; border-radius:50%; background:#25d366; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:0.8rem;">SP</div>
                        <div>
                            <div style="font-weight:800; font-size:0.88rem;" id="waSimName">${preCustomer || t('عميل مميز', 'Valued Client')}</div>
                            <div style="font-size:0.68rem; color:#8696a0;">● ${t('متصل الآن (معاينة حية)', 'Online')}</div>
                        </div>
                    </div>

                    <div class="wa-bubble" id="waLiveBubble"></div>

                    <button type="button" class="wa-send-btn" id="btnSendRealWA">
                        <span>💬</span> ${t('إرسال عبر WhatsApp', 'Send on WhatsApp')}
                    </button>
                </div>
            </div>
        </div>
        `;

        let rows = [
            { name: t('شاحن سريع 20W', 'Fast Charger 20W'), qty: 5, price: 180 },
            { name: t('سماعة لاسلكية TWS', 'Wireless Earbuds'), qty: 3, price: 350 }
        ];

        function renderRows() {
            const c = document.getElementById('quoteRowsContainer');
            if (!c) return;
            c.innerHTML = rows.map((r, i) => `
            <div style="display:grid; grid-template-columns:1.5fr 60px 80px 24px; gap:6px; align-items:center;">
                <input type="text" class="q-name" data-idx="${i}" value="${r.name}" style="padding:6px 8px; border-radius:6px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); font-size:0.8rem;">
                <input type="number" class="q-qty" data-idx="${i}" value="${r.qty}" min="1" style="padding:6px; border-radius:6px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); font-size:0.8rem; text-align:center;">
                <input type="number" class="q-price" data-idx="${i}" value="${r.price}" min="0" style="padding:6px; border-radius:6px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); font-size:0.8rem; text-align:center;">
                <button type="button" data-del="${i}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.9rem;">✕</button>
            </div>`).join('');
            updatePreview();
        }

        function updatePreview() {
            const cust = document.getElementById('quoteCustName')?.value.trim() || t('عميلنا العزيز', 'Customer');
            const discount = parseFloat(document.getElementById('quoteDiscount')?.value || 0);
            const validity = document.getElementById('quoteValidity')?.value || 7;

            let subtotal = 0;
            let itemsText = '';
            rows.forEach((r, idx) => {
                const totalRow = (r.qty || 1) * (r.price || 0);
                subtotal += totalRow;
                itemsText += `${idx + 1}. *${r.name}*\n   الكمية: ${r.qty} | السعر: ${fmtN(r.price)} ج.م | الإجمالي: *${fmtN(totalRow)} ج.م*\n`;
            });

            const discountVal = (subtotal * discount) / 100;
            const netTotal = subtotal - discountVal;

            const text = `تحية طيبة يا أستاذ *${cust}* 🌹\nيسعدنا تقديم عرض الأسعار الخاص من *Sales Pro*:\n\n📋 *تفاصيل الطلبية:*\n${itemsText}\n━━━━━━━━━━━━━━━\n💵 *المجموع:* ${fmtN(subtotal)} ج.م\n${discount > 0 ? `🎁 *خصم خاص (${discount}%):* -${fmtN(discountVal)} ج.م\n` : ''}✨ *الصافي المطلوب:* *${fmtN(netTotal)} ج.م*\n━━━━━━━━━━━━━━━\n⏳ *العرض سارٍ لمدة ${validity} أيام.*\n\nللتأكيد، يرجى الرد على هذه الرسالة. شكراً لتعاملكم معنا! 🤝`;

            const bEl = document.getElementById('waLiveBubble');
            if (bEl) bEl.textContent = text;
            const sName = document.getElementById('waSimName');
            if (sName) sName.textContent = cust;
        }

        renderRows();

        document.getElementById('quoteCustName')?.addEventListener('input', updatePreview);
        document.getElementById('quoteDiscount')?.addEventListener('input', updatePreview);
        document.getElementById('quoteValidity')?.addEventListener('change', updatePreview);

        document.getElementById('btnAddQuoteRow')?.addEventListener('click', () => {
            rows.push({ name: '', qty: 1, price: 0 });
            renderRows();
        });

        document.getElementById('quoteRowsContainer')?.addEventListener('input', e => {
            const idx = e.target.dataset.idx;
            if (idx == null) return;
            if (e.target.classList.contains('q-name')) rows[idx].name = e.target.value;
            if (e.target.classList.contains('q-qty')) rows[idx].qty = parseInt(e.target.value) || 1;
            if (e.target.classList.contains('q-price')) rows[idx].price = parseFloat(e.target.value) || 0;
            updatePreview();
        });

        document.getElementById('quoteRowsContainer')?.addEventListener('click', e => {
            const del = e.target.dataset.del;
            if (del != null) {
                rows.splice(parseInt(del), 1);
                renderRows();
            }
        });

        document.getElementById('btnSendRealWA')?.addEventListener('click', () => {
            const text = document.getElementById('waLiveBubble')?.textContent || '';
            const rawPhone = document.getElementById('quoteCustPhone')?.value.trim().replace(/\D/g, '');
            let phoneParam = '';
            if (rawPhone) {
                let formatted = rawPhone;
                if (formatted.startsWith('01')) formatted = '20' + formatted.slice(1);
                phoneParam = `phone=${formatted}&`;
            }
            window.open(`https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(text)}`, '_blank');
            showToast(t('✅ تم فتح محادثة WhatsApp', '✅ WhatsApp Opened'), 'success');
        });
    };

    window.applyWaTemplate = function(tplKey) {
        const cust = document.getElementById('quoteCustName')?.value.trim() || t('عميلنا العزيز', 'Customer');
        let text = '';
        if (tplKey === 'payment_reminder') {
            text = `مساء الخير يا فندم أستاذ *${cust}* 🌸\nنود تذكير سيادتكم بموعد استحقاق الدفعة الحالية لتسوية الحساب.\nشاكرين دائماً حسن تعاونكم معنا في *Sales Pro*. 🙏`;
        } else if (tplKey === 'new_stock') {
            text = `أهلاً بك يا أستاذ *${cust}* 🎉\nوصلتنا تشكيلة جديدة ومميزة بأسعار خاصة جداً.\nيسعدنا إرسال قائمة الكتالوج لحضرتك فوراً! 📦✨`;
        } else if (tplKey === 'win_back') {
            text = `أستاذ *${cust}* الغالي وحشتنا طلتك! 🌟\nمحضرين لحضرتك خصم خاص 10% بونص على أول طلبية هذا الشهر.\nكلمنا الآن للاستفادة من العرض! 🎁`;
        }

        const bEl = document.getElementById('waLiveBubble');
        if (bEl) bEl.textContent = text;
        showToast(t('✅ تم تطبيق القالب', '✅ Template applied'), 'info');
    };

    // ─── TAB 3: RFM CUSTOMER SEGMENTATION ─────────────────────────────────────
    window.rRFM = function rRFM() {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getS();
        const now = new Date();
        const custMap = {};
        const limit = Math.min(S_data.length, 1500);

        for (let i = 0; i < limit; i++) {
            const r = S_data[i];
            const name = r.customer || r['اسم العميل'] || r['العميل'] || r.Customer || t('عميل عام', 'General Client');
            const dt = parseDateFast(r.date || r['التاريخ'] || r['Order Date']);
            const val = parseFloat(r.amount || r['المبلغ'] || r['Sales Without Tax'] || 0) || 0;

            if (!custMap[name]) custMap[name] = { name, count: 0, totalSpend: 0, lastDate: null };
            custMap[name].count += 1;
            custMap[name].totalSpend += val;
            if (dt && (!custMap[name].lastDate || dt > custMap[name].lastDate)) {
                custMap[name].lastDate = dt;
            }
        }

        const list = Object.values(custMap).map(c => {
            const recencyDays = c.lastDate ? Math.floor((now - c.lastDate) / (1000 * 60 * 60 * 24)) : 999;
            let segment = 'grow';
            if (recencyDays <= 20 && c.totalSpend > 20000) segment = 'vip';
            else if (recencyDays > 30 && c.totalSpend > 15000) segment = 'risk';
            else if (recencyDays <= 30 && c.totalSpend <= 15000) segment = 'grow';
            else segment = 'lost';
            return { ...c, recencyDays, segment };
        });

        const vips = list.filter(x => x.segment === 'vip');
        const risks = list.filter(x => x.segment === 'risk');
        const grows = list.filter(x => x.segment === 'grow');
        const losts = list.filter(x => x.segment === 'lost');

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box" style="background:#f59e0b;">👑</div>
                <div>
                    <div class="booster-title">${t('مصفوفة تصنيف العملاء (RFM)', 'RFM Customer Segmentation')}</div>
                    <div class="booster-desc">${t('تصنيف آلي لحداثة الشراء وتكرار الطلب والقيمة المالية', 'Recency, Frequency & Monetary segmentation')}</div>
                </div>
            </div>
        </div>

        <div class="rfm-grid" style="margin-bottom:20px;">
            <div class="rfm-card rfm-vip">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.3rem;">👑</span>
                    <span style="font-weight:900; font-size:1.2rem; color:#f59e0b;">${vips.length}</span>
                </div>
                <div style="font-weight:800; font-size:0.95rem; margin:6px 0 2px; color:var(--tx1);">VIP Champions</div>
                <div style="font-size:0.75rem; color:var(--tx3);">${t('أعلى مشتريات وشراء مستمر', 'Top spenders')}</div>
            </div>

            <div class="rfm-card rfm-risk">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.3rem;">⚠️</span>
                    <span style="font-weight:900; font-size:1.2rem; color:#ef4444;">${risks.length}</span>
                </div>
                <div style="font-weight:800; font-size:0.95rem; margin:6px 0 2px; color:var(--tx1);">${t('في خطر الفقدان', 'At Risk')}</div>
                <div style="font-size:0.75rem; color:var(--tx3);">${t('عملاء كبار توقفوا فجأة', 'High value inactive')}</div>
            </div>

            <div class="rfm-card rfm-grow">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.3rem;">🌟</span>
                    <span style="font-weight:900; font-size:1.2rem; color:#10b981;">${grows.length}</span>
                </div>
                <div style="font-weight:800; font-size:0.95rem; margin:6px 0 2px; color:var(--tx1);">${t('واعدون ونمو', 'Promising')}</div>
                <div style="font-size:0.75rem; color:var(--tx3);">${t('طلبيات منتظمة ومتصاعدة', 'Regular buyers')}</div>
            </div>

            <div class="rfm-card rfm-lost">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.3rem;">💤</span>
                    <span style="font-weight:900; font-size:1.2rem; color:#64748b;">${losts.length}</span>
                </div>
                <div style="font-weight:800; font-size:0.95rem; margin:6px 0 2px; color:var(--tx1);">${t('راكدون', 'Dormant')}</div>
                <div style="font-size:0.75rem; color:var(--tx3);">${t('يحتاجون عروض استرداد', 'Win-back candidates')}</div>
            </div>
        </div>

        <div class="card" style="padding:16px; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
                <h3 style="font-size:1rem; font-weight:800; color:var(--tx1);">${t('قائمة العملاء', 'Customer Segments')}</h3>
                <div class="booster-tabs" id="rfmFilterTabs">
                    <button class="booster-tab-btn active" data-filter="all">${t('الكل', 'All')} (${list.length})</button>
                    <button class="booster-tab-btn" data-filter="vip">👑 VIP (${vips.length})</button>
                    <button class="booster-tab-btn" data-filter="risk">⚠️ ${t('في خطر', 'At Risk')} (${risks.length})</button>
                    <button class="booster-tab-btn" data-filter="grow">🌟 ${t('واعد', 'Promising')} (${grows.length})</button>
                    <button class="booster-tab-btn" data-filter="lost">💤 ${t('راكد', 'Dormant')} (${losts.length})</button>
                </div>
            </div>

            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                    <thead>
                        <tr style="border-bottom:1px solid var(--bd); text-align:right;">
                            <th style="padding:8px 10px; color:var(--tx3);">${t('العميل', 'Customer')}</th>
                            <th style="padding:8px 10px; color:var(--tx3);">${t('الشريحة', 'Segment')}</th>
                            <th style="padding:8px 10px; color:var(--tx3);">${t('المشتريات', 'Spend')}</th>
                            <th style="padding:8px 10px; color:var(--tx3);">${t('الطلبات', 'Orders')}</th>
                            <th style="padding:8px 10px; color:var(--tx3); text-align:center;">${t('إجراء', 'Action')}</th>
                        </tr>
                    </thead>
                    <tbody id="rfmTableBody"></tbody>
                </table>
            </div>
        </div>
        `;

        function renderRFM(filter = 'all') {
            const tb = document.getElementById('rfmTableBody');
            if (!tb) return;
            const filtered = filter === 'all' ? list : list.filter(x => x.segment === filter);
            const badgeCls = { vip: '#f59e0b', risk: '#ef4444', grow: '#10b981', lost: '#94a3b8' };

            tb.innerHTML = filtered.slice(0, 30).map(c => `
            <tr style="border-bottom:1px solid var(--bd);">
                <td style="padding:10px; font-weight:800; color:var(--tx1);">${c.name}</td>
                <td style="padding:10px;"><span style="color:${badgeCls[c.segment]}; font-weight:800;">${c.segment.toUpperCase()}</span></td>
                <td style="padding:10px; font-weight:800; color:#10b981;">${fmtP(c.totalSpend)}</td>
                <td style="padding:10px; color:var(--tx2);">${c.count}</td>
                <td style="padding:10px; text-align:center;">
                    <button class="btn btn-p" onclick="window.quickPitchQuote('${encodeURIComponent(c.name)}')" style="padding:4px 10px; font-size:0.72rem; border-radius:6px;">
                        💬 ${t('عرض', 'Quote')}
                    </button>
                </td>
            </tr>`).join('');
        }

        renderRFM();

        document.getElementById('rfmFilterTabs')?.addEventListener('click', e => {
            const btn = e.target.closest('.booster-tab-btn');
            if (!btn) return;
            document.querySelectorAll('#rfmFilterTabs .booster-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderRFM(btn.dataset.filter);
        });
    };

    // ─── TAB 4: COMMISSION SIMULATOR ──────────────────────────────────────────
    window.rCommission = function rCommission() {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getS();
        const T_data = getT();
        
        let currentSales = 0;
        const sLimit = Math.min(S_data.length, 1000);
        for (let i = 0; i < sLimit; i++) {
            currentSales += parseFloat(S_data[i].amount || S_data[i]['Sales Without Tax'] || 0) || 0;
        }
        if (!currentSales) currentSales = 75000;

        let currentTarget = 0;
        const tLimit = Math.min(T_data.length, 500);
        for (let i = 0; i < tLimit; i++) {
            currentTarget += parseFloat(T_data[i].target || T_data[i].Target || 0) || 0;
        }
        if (!currentTarget) currentTarget = 100000;

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box" style="background:#10b981;">🏆</div>
                <div>
                    <div class="booster-title">${t('محاكي العمولات ومكافآت التارجت', 'Commission & Bonus Simulator')}</div>
                    <div class="booster-desc">${t('محاكاة فورية للأرباح والعمولات المتوقعة', 'Real-time projected earnings')}</div>
                </div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:18px;">
            <div class="card" style="padding:18px; border-radius:16px;">
                <h3 style="font-size:1rem; font-weight:800; margin-bottom:14px;">🎛️ ${t('حرك المؤشرات لمحاكاة أرباحك', 'Adjust Sliders')}</h3>

                <div class="sim-slider-wrap">
                    <div class="sim-slider-hdr">
                        <span style="font-size:0.8rem; font-weight:700; color:var(--tx2);">${t('المبيعات المتوقعة', 'Projected Sales')}</span>
                        <span style="font-size:1rem; font-weight:900; color:#3b82f6;" id="simValSales">${fmtP(currentSales)}</span>
                    </div>
                    <input type="range" class="sim-range" id="simRangeSales" min="0" max="${Math.max(250000, currentTarget * 2)}" step="5000" value="${currentSales}">
                </div>

                <div class="sim-slider-wrap">
                    <div class="sim-slider-hdr">
                        <span style="font-size:0.8rem; font-weight:700; color:var(--tx2);">${t('المستهدف (التارجت)', 'Target')}</span>
                        <span style="font-size:1rem; font-weight:900; color:#f59e0b;" id="simValTarget">${fmtP(currentTarget)}</span>
                    </div>
                    <input type="range" class="sim-range" id="simRangeTarget" min="20000" max="300000" step="5000" value="${currentTarget}">
                </div>

                <div class="sim-slider-wrap">
                    <div class="sim-slider-hdr">
                        <span style="font-size:0.8rem; font-weight:700; color:var(--tx2);">${t('مبيعات إكسسوارات (بونص إضافي)', 'Accessories Bonus')}</span>
                        <span style="font-size:1rem; font-weight:900; color:#10b981;" id="simValAcc">15,000 ج.م</span>
                    </div>
                    <input type="range" class="sim-range" id="simRangeAcc" min="0" max="50000" step="1000" value="15000">
                </div>
            </div>

            <div class="card" style="padding:18px; border-radius:16px; border:1px solid rgba(59,130,246,0.3);">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:800;">${t('إجمالي العمولة المتوقعة', 'Estimated Commission')}</div>
                <div style="font-size:2rem; font-weight:900; color:#10b981; margin:6px 0;" id="simTotalCommission">—</div>
                <div id="simTierBadge" style="display:inline-block; padding:4px 10px; border-radius:8px; font-weight:900; font-size:0.82rem; margin-bottom:14px;">—</div>

                <div style="display:flex; flex-direction:column; gap:6px; padding-top:10px; border-top:1px solid var(--bd); font-size:0.8rem;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--tx3);">${t('نسبة التحقيق:', 'Achieved:')}</span>
                        <span style="font-weight:900; color:var(--tx1);" id="simPct">—</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--tx3);">${t('العمولة الأساسية:', 'Base:')}</span>
                        <span style="font-weight:800; color:#3b82f6;" id="simBaseComm">—</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--tx3);">${t('بونص الإكسسوارات:', 'Bonus:')}</span>
                        <span style="font-weight:800; color:#10b981;" id="simBonusAcc">—</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        function recalc() {
            const sales = parseFloat(document.getElementById('simRangeSales')?.value || 0);
            const target = parseFloat(document.getElementById('simRangeTarget')?.value || 1);
            const acc = parseFloat(document.getElementById('simRangeAcc')?.value || 0);

            document.getElementById('simValSales').textContent = fmtP(sales);
            document.getElementById('simValTarget').textContent = fmtP(target);
            document.getElementById('simValAcc').textContent = fmtP(acc);

            const pct = Math.round((sales / target) * 100);
            document.getElementById('simPct').textContent = pct + '%';

            let baseRate = 0.015;
            let tierText = '';
            let tierBg = '';

            if (pct < 80) {
                baseRate = 0.01;
                tierText = '🥉 Bronze (<80%)';
                tierBg = 'background:#94a3b8; color:#fff;';
            } else if (pct < 100) {
                baseRate = 0.015;
                tierText = '🥈 Silver (80-99%)';
                tierBg = 'background:#3b82f6; color:#fff;';
            } else if (pct < 125) {
                baseRate = 0.025;
                tierText = '🥇 Gold (100-124%)';
                tierBg = 'background:#f59e0b; color:#fff;';
            } else {
                baseRate = 0.035;
                tierText = '💎 Diamond Elite (125%+)';
                tierBg = 'background:#10b981; color:#fff;';
            }

            const baseComm = sales * baseRate;
            const accBonus = acc * 0.05;
            const total = baseComm + accBonus;

            document.getElementById('simBaseComm').textContent = fmtP(baseComm);
            document.getElementById('simBonusAcc').textContent = fmtP(accBonus);
            document.getElementById('simTotalCommission').textContent = fmtP(total);

            const b = document.getElementById('simTierBadge');
            if (b) {
                b.textContent = tierText;
                b.style.cssText = tierBg + ' display:inline-block; padding:4px 10px; border-radius:8px; font-weight:900; font-size:0.82rem; margin-bottom:14px;';
            }
        }

        recalc();
        document.getElementById('simRangeSales')?.addEventListener('input', recalc);
        document.getElementById('simRangeTarget')?.addEventListener('input', recalc);
        document.getElementById('simRangeAcc')?.addEventListener('input', recalc);
    };

    // ─── TAB 5: SMART FIELD ROUTES & MAP ASSISTANT ────────────────────────────
    window.rRoutes = function rRoutes() {
        const M = document.getElementById('M');
        if (!M) return;

        const T_data = getT();
        const dues_data = getDues();

        const areaMap = {};
        const custSet = new Set();

        const addCust = (name, area, phone, debt = 0) => {
            if (!name || custSet.has(name)) return;
            custSet.add(name);
            const a = area || t('المنطقة الرئيسية', 'Main Area');
            if (!areaMap[a]) areaMap[a] = [];
            areaMap[a].push({ name, area: a, phone, debt });
        };

        const tLimit = Math.min(T_data.length, 500);
        for (let i = 0; i < tLimit; i++) {
            const r = T_data[i];
            const name = r.Customer || r['Customer Name'] || r['اسم العميل'];
            const area = r['Customer Class'] || r.Area || r['المنطقة'] || r.address || '';
            const phone = r.Phone || r['رقم الموبايل'] || '';
            addCust(name, area, phone);
        }

        const dLimit = Math.min(dues_data.length, 500);
        for (let i = 0; i < dLimit; i++) {
            const r = dues_data[i];
            const name = r.Name || r['Customer Name'] || r['العميل'];
            const area = r.CustClass || r['Customer Class'] || r['المنطقة'] || '';
            const phone = r.Phone || r.Customer || '';
            const debt = Number(r.Balance || 0);
            addCust(name, area, phone, debt);
        }

        const areas = Object.keys(areaMap);
        if (!areas.length) areas.push(t('جميع العملاء', 'All Clients'));

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box" style="background:#3b82f6;">🗺️</div>
                <div>
                    <div class="booster-title">${t('مسارات الزيارات الميدانية والـ GPS', 'Smart Field Routes & Geofencing')}</div>
                    <div class="booster-desc">${t('تنظيم خطوط السير اليومية والاتجاهات وتسجيل الوصول بضغطة زر', 'Daily beat plans, navigation & instant GPS check-in')}</div>
                </div>
            </div>
            <button class="btn btn-p" onclick="window.captureGPSForVisit()" style="padding:9px 16px; border-radius:10px; font-weight:800; background:#10b981; border:none;">
                📍 ${t('تسجيل وصول GPS', 'GPS Check-In')}
            </button>
        </div>

        <div style="display:flex; gap:8px; margin-bottom:16px; overflow-x:auto;" id="routeAreaTabs">
            ${areas.map((a, i) => `<button class="booster-tab-btn ${i===0?'active':''}" data-area="${a}">📍 ${a} (${areaMap[a]?.length || 0})</button>`).join('')}
        </div>

        <div class="card" style="padding:16px; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <h3 style="font-size:1rem; font-weight:800;" id="routeTitle">${areas[0]}</h3>
                <span style="font-size:0.75rem; color:var(--tx3);">${t('رتب زياراتك واضغط للتوجيه المباشر', 'Turn-by-turn navigation')}</span>
            </div>
            <div id="routeClientsList" style="display:flex; flex-direction:column; gap:8px;"></div>
        </div>
        `;

        function renderAreaList(areaName) {
            const list = areaMap[areaName] || [];
            const c = document.getElementById('routeClientsList');
            if (!c) return;

            c.innerHTML = list.slice(0, 35).map((cl, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--bg3); border-radius:10px; border:1px solid var(--bd); flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="width:24px; height:24px; border-radius:50%; background:#3b82f6; color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800;">${idx+1}</span>
                    <div>
                        <div style="font-weight:800; font-size:0.9rem; color:var(--tx1);">${cl.name}</div>
                        <div style="font-size:0.72rem; color:var(--tx3);">${cl.debt > 0 ? `<span style="color:#ef4444; font-weight:700;">مديونية: ${fmtP(cl.debt)}</span>` : t('مديونية صفرية ✅', 'Zero Debt')}</div>
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-ghost" onclick="window.openDirections('${encodeURIComponent(cl.name)}')" style="padding:5px 10px; font-size:0.75rem; border-radius:6px;">
                        🗺️ ${t('خريطة', 'Map')}
                    </button>
                    ${cl.phone ? `<a href="https://wa.me/2${cl.phone.replace(/\\D/g,'')}" target="_blank" class="btn" style="padding:5px 10px; font-size:0.75rem; background:#25d366; color:#fff; border-radius:6px; text-decoration:none;">💬</a>` : ''}
                    <button class="btn btn-p" onclick="window.quickPitchQuote('${encodeURIComponent(cl.name)}')" style="padding:5px 10px; font-size:0.75rem; border-radius:6px;">
                        🛒 ${t('عرض', 'Quote')}
                    </button>
                </div>
            </div>`).join('');
        }

        if (areas[0]) renderAreaList(areas[0]);

        document.getElementById('routeAreaTabs')?.addEventListener('click', e => {
            const btn = e.target.closest('.booster-tab-btn');
            if (!btn) return;
            document.querySelectorAll('#routeAreaTabs .booster-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const a = btn.dataset.area;
            document.getElementById('routeTitle').textContent = a;
            renderAreaList(a);
        });
    };

    // ─── TAB 6: MARKET INTEL & OBJECTIONS RADAR ───────────────────────────────
    window.rIntel = function rIntel() {
        const M = document.getElementById('M');
        if (!M) return;

        const objList = getObjections();
        const total = objList.length;

        const reasonsMap = {};
        objList.forEach(o => {
            const r = o.reason || 'price_high';
            reasonsMap[r] = (reasonsMap[r] || 0) + 1;
        });

        const reasonLabels = {
            price_high: t('السعر أعلى من المنافس', 'Price Higher Than Competitor'),
            no_credit: t('عدم توفر تسهيلات سداد', 'No Credit/Terms'),
            out_of_stock: t('نقص في الكمية/الصنف', 'Item Out of Stock'),
            competitor_bonus: t('المنافس يقدم بونص مجاني', 'Competitor Bonus'),
            slow_stock: t('ركود بضاعة سابقة لدى المحل', 'Slow Inventory'),
            other: t('أسباب أخرى', 'Other')
        };

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box" style="background:#ef4444;">🛡️</div>
                <div>
                    <div class="booster-title">${t('استخبارات السوق وسجل الاعتراضات', 'Market Intel & Objections Radar')}</div>
                    <div class="booster-desc">${t('تحليل أسباب ضياع الصفقات وأسعار المنافسين في السوق', 'Analyze lost deals & competitor pricing intelligence')}</div>
                </div>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-p" onclick="window.openObjectionLogger('')" style="padding:9px 16px; border-radius:10px; font-weight:800; background:#2563eb; border:none; cursor:pointer;">
                    + ${t('تسجيل اعتراض / منافس', 'Log Objection')}
                </button>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:20px;">
            <div class="card" style="padding:16px; border-radius:14px;">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:700;">${t('إجمالي الحالات المسجلة', 'Logged Objections')}</div>
                <div style="font-size:1.5rem; font-weight:900; color:#ef4444; margin-top:2px;">${total} ${t('حالة', 'Records')}</div>
            </div>
            <div class="card" style="padding:16px; border-radius:14px;">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:700;">${t('أكثر سبب متكرر', 'Top Reason')}</div>
                <div style="font-size:1rem; font-weight:900; color:var(--tx1); margin-top:4px;">${total ? (reasonLabels[Object.keys(reasonsMap).sort((a,b)=>reasonsMap[b]-reasonsMap[a])[0]] || '—') : '—'}</div>
            </div>
        </div>

        <div class="card" style="padding:18px; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
                <h3 style="font-size:1rem; font-weight:800;">📋 ${t('سجل تفاصيل الاعتراضات والمنافسين', 'Objections & Competitor Details')}</h3>
                ${total === 0 ? `<button class="btn btn-ghost" onclick="window.addSampleObjections()" style="font-size:0.75rem; padding:4px 10px; border-radius:6px;">⚡ ${t('إضافة نماذج تجريبية', 'Add Samples')}</button>` : ''}
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                    <thead>
                        <tr style="border-bottom:1px solid var(--bd); text-align:right;">
                            <th style="padding:8px 10px; color:var(--tx3);">${t('العميل', 'Customer')}</th>
                            <th style="padding:8px 10px; color:var(--tx3);">${t('السبب الرئيسي', 'Reason')}</th>
                            <th style="padding:8px 10px; color:var(--tx3);">${t('المنافس', 'Competitor')}</th>
                            <th style="padding:8px 10px; color:var(--tx3);">${t('سعر المنافس', 'Price')}</th>
                            <th style="padding:8px 10px; color:var(--tx3);">${t('ملاحظات', 'Notes')}</th>
                            <th style="padding:8px 10px; color:var(--tx3); text-align:center;">${t('حذف', 'Action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${objList.length ? objList.map(o => `
                        <tr style="border-bottom:1px solid var(--bd);">
                            <td style="padding:10px; font-weight:800; color:var(--tx1);">${o.customer || '—'}</td>
                            <td style="padding:10px;"><span style="color:#ef4444; font-weight:700;">${reasonLabels[o.reason] || o.reason}</span></td>
                            <td style="padding:10px; color:var(--tx2);">${o.competitor || '—'}</td>
                            <td style="padding:10px; font-weight:800; color:#3b82f6;">${o.compPrice ? fmtP(o.compPrice) : '—'}</td>
                            <td style="padding:10px; color:var(--tx3); font-size:0.78rem;">${o.notes || '—'}</td>
                            <td style="padding:10px; text-align:center;">
                                <button onclick="window.deleteObjection(${o.id})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:0.85rem;" title="${t('حذف', 'Delete')}">🗑️</button>
                            </td>
                        </tr>`).join('') : `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--tx3); font-weight:700;">${t('لا توجد اعتراضات مسجلة بعد — اضغط "+ تسجيل اعتراض / منافس" لإضافة أول حالة.', 'No objections logged yet — click "+ Log Objection" to record one.')}</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    };

    window.addSampleObjections = function() {
        const samples = [
            { id: Date.now() + 1, customer: 'محل الأمانة للموبايل', reason: 'price_high', competitor: 'شركة النور', compPrice: 165, notes: 'سعر الشاحن لديهم أقل بـ 15 جنيه', date: new Date().toISOString() },
            { id: Date.now() + 2, customer: 'سنتر الأهرام', reason: 'competitor_bonus', competitor: 'الوكيل الدولي', compPrice: 320, notes: 'عرض 10+1 مجاناً على السماعات', date: new Date().toISOString() },
            { id: Date.now() + 3, customer: 'مؤسسة البركة', reason: 'no_credit', competitor: 'الموزع المعتمد', compPrice: 0, notes: 'طلب سداد بعد 45 يوماً', date: new Date().toISOString() }
        ];
        localStorage.setItem('sp_objections', JSON.stringify(samples));
        showToast(t('✅ تمت إضافة نماذج تجريبية', '✅ Samples added'), 'success');
        if (typeof window.rIntel === 'function') window.rIntel();
    };

    window.deleteObjection = function(id) {
        let list = getObjections().filter(x => x.id !== id);
        localStorage.setItem('sp_objections', JSON.stringify(list));
        showToast(t('🗑️ تم الحذف', '🗑️ Deleted'), 'warning');
        if (typeof window.rIntel === 'function') window.rIntel();
    };

    // ─── TAB 7: LEADERBOARD & SALES REP CHALLENGES ────────────────────────────
    window.rLeaderboard = function rLeaderboard() {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getS();
        const T_data = getT();
        
        let totalSales = 0;
        const sLimit = Math.min(S_data.length, 1000);
        for (let i = 0; i < sLimit; i++) {
            totalSales += parseFloat(S_data[i].amount || S_data[i]['Sales Without Tax'] || 0) || 0;
        }
        if (!totalSales) totalSales = 75000;

        let totalTarget = 0;
        const tLimit = Math.min(T_data.length, 500);
        for (let i = 0; i < tLimit; i++) {
            totalTarget += parseFloat(T_data[i].target || T_data[i].Target || 0) || 0;
        }
        if (!totalTarget) totalTarget = 100000;

        const targetPct = Math.round((totalSales / totalTarget) * 100);

        const badges = [
            { icon: '👑', title: t('بطل التارجت', 'Target Champion'), desc: t('تحقيق أكثر من 100% من الهدف الشهري', 'Hit 100%+ monthly target'), unlocked: targetPct >= 100 },
            { icon: '🎧', title: t('صائد الإكسسوارات', 'Accessory Master'), desc: t('مبيعات إكسسوارات تتجاوز 25,000 ج.م', 'Sold 25K+ EGP accessories'), unlocked: totalSales > 40000 },
            { icon: '⚡', title: t('المحصل السريع', 'Fast Collector'), desc: t('تحصيل المديونيات في أقل من 30 يوم', 'Collected dues within 30 days'), unlocked: true },
            { icon: '🎁', title: t('بطل استرداد الراكدين', 'Win-Back Hero'), desc: t('إعادة تنشيط 5 عملاء خاملين', 'Reactivated 5 dormant accounts'), unlocked: false }
        ];

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box" style="background:#8b5cf6;">🎮</div>
                <div>
                    <div class="booster-title">${t('لوحة الشرف وتحديات المبيعات', 'Sales Leaderboard & Badges')}</div>
                    <div class="booster-desc">${t('الأوسمة التحفيزية وتحديات الأداء لتحقيق أعلى المكافآت', 'Gamified badges & target acceleration')}</div>
                </div>
            </div>
        </div>

        <div class="card" style="padding:20px; border-radius:16px; margin-bottom:20px; background:linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.08) 100%);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div>
                    <div style="font-size:0.8rem; color:var(--tx3); font-weight:700;">${t('المستوى الحالي للمندوب', 'Current Rep Level')}</div>
                    <div style="font-size:1.6rem; font-weight:900; color:#8b5cf6;">⚡ Master Sales Rep (Level 4)</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.8rem; color:var(--tx3); font-weight:700;">${t('نسبة التارجت', 'Target Hit')}</div>
                    <div style="font-size:1.6rem; font-weight:900; color:#10b981;">${targetPct}%</div>
                </div>
            </div>
        </div>

        <h3 style="font-size:1.1rem; font-weight:800; color:var(--tx1); margin-bottom:12px;">🏆 ${t('أوسمة الإنجاز والبطولات', 'Achievement Badges')}</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px;">
            ${badges.map(b => `
            <div class="card" style="padding:16px; border-radius:14px; opacity:${b.unlocked ? '1' : '0.5'}; border:1px solid ${b.unlocked ? '#8b5cf6' : 'var(--bd)'};">
                <div style="font-size:2rem; margin-bottom:6px;">${b.icon}</div>
                <div style="font-weight:900; font-size:0.95rem; color:var(--tx1);">${b.title}</div>
                <div style="font-size:0.78rem; color:var(--tx3); margin:4px 0 10px;">${b.desc}</div>
                <span style="font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:6px; background:${b.unlocked ? '#10b981' : '#64748b'}; color:#fff;">
                    ${b.unlocked ? t('مكتمل ✅', 'Unlocked') : t('قيد التحدي 🔒', 'Locked')}
                </span>
            </div>`).join('')}
        </div>
        `;
    };

    // ─── GPS, VOICE & MODALS ──────────────────────────────────────────────────
    window.captureGPSForVisit = function() {
        if (!navigator.geolocation) {
            showToast(t('❌ المتصفح لا يدعم GPS', '❌ Geolocation not supported'), 'error');
            return;
        }
        showToast(t('📍 جاري تحديد الموقع الجغرافي...', '📍 Capturing GPS...'), 'info');
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                const noteInput = document.querySelector('input[placeholder*="ملاحظات"], textarea[placeholder*="ملاحظات"], #inVN, #inCN');
                if (noteInput) {
                    noteInput.value = (noteInput.value ? noteInput.value + ' ' : '') + `[📍 وصول: ${lat},${lng}]`;
                }
                showToast(t(`✅ تم تسجيل الموقع: (${lat}, ${lng})`, `✅ GPS Logged: (${lat}, ${lng})`), 'success');
            },
            () => showToast(t('⚠️ تعذر الوصول للـ GPS', '⚠️ GPS Denied'), 'error'),
            { enableHighAccuracy: true, timeout: 6000 }
        );
    };

    window.openDirections = function(destName) {
        if (!destName) return;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destName)}`, '_blank');
    };

    window.openObjectionLogger = function(customerName = '') {
        let modal = document.getElementById('spObjectionModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'spObjectionModal';
            modal.className = 'sp-modal-overlay';
            modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:none;align-items:center;justify-content:center;padding:16px;';
            modal.innerHTML = `
                <div class="sp-modal-content" style="background:var(--bg2,#1e293b);border:1px solid var(--bd,rgba(255,255,255,0.12));border-radius:18px;max-width:480px;width:100%;padding:22px;position:relative;color:var(--tx1,#fff);box-shadow:0 25px 60px rgba(0,0,0,0.5);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="font-size:1.1rem; font-weight:800; color:#ef4444; margin:0;">🛡️ ${t('تسجيل اعتراض / أسعار المنافس', 'Log Market Intel')}</h3>
                        <button onclick="window.closeObjectionModal()" style="background:none;border:none;color:var(--tx2,#94a3b8);font-size:1.3rem;cursor:pointer;padding:4px 8px;">✕</button>
                    </div>

                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('العميل', 'Customer')}</label>
                        <input type="text" id="objCust" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem;" value="${customerName}" placeholder="${t('اسم العميل...', 'Customer name...')}">
                    </div>

                    <div style="margin-bottom:12px;">
                        <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('السبب الرئيسي لعدم الشراء', 'Primary Reason')}</label>
                        <select id="objReason" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem;">
                            <option value="price_high">${t('السعر أعلى من المنافس في السوق', 'Price is higher than competitor')}</option>
                            <option value="no_credit">${t('طلب تسهيلات دفع أو آجل', 'Payment terms requested')}</option>
                            <option value="out_of_stock">${t('عدم توفر كمية أو صنف معين', 'Out of stock')}</option>
                            <option value="competitor_bonus">${t('المنافس يقدم بونص أو بضاعة مجانية', 'Competitor bonus')}</option>
                            <option value="slow_stock">${t('المحل لديه ركود في بضاعة قديمة', 'Slow stock')}</option>
                            <option value="other">${t('سبب آخر', 'Other')}</option>
                        </select>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('اسم المنافس', 'Competitor')}</label>
                            <input type="text" id="objComp" placeholder="${t('اسم الشركة أو التاجر', 'Company X')}" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('سعر المنافس (ج.م)', 'Price')}</label>
                            <input type="number" id="objPrice" placeholder="0" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem;">
                        </div>
                    </div>

                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:0.75rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('ملاحظات المندوب الميدانية', 'Notes')}</label>
                        <textarea id="objNotes" rows="2" placeholder="${t('تفاصيل العرض، كود الصنف، إلخ...', 'Details...')}" style="width:100%; padding:9px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.85rem; font-family:inherit;"></textarea>
                    </div>

                    <button class="btn btn-p" id="btnSaveObj" style="width:100%; padding:11px; border-radius:10px; font-weight:800; font-size:0.95rem; background:#ef4444; color:#fff; border:none; cursor:pointer;">
                        💾 ${t('حفظ في تقرير السوق', 'Save Market Intel')}
                    </button>
                </div>
            `;
            document.body.appendChild(modal);

            modal.addEventListener('click', e => {
                if (e.target === modal) window.closeObjectionModal();
            });

            document.getElementById('btnSaveObj')?.addEventListener('click', () => {
                const rec = {
                    id: Date.now(),
                    customer: document.getElementById('objCust')?.value.trim() || customerName || t('عميل عام', 'General Client'),
                    reason: document.getElementById('objReason')?.value || 'price_high',
                    competitor: document.getElementById('objComp')?.value.trim() || '—',
                    compPrice: parseFloat(document.getElementById('objPrice')?.value || 0),
                    notes: document.getElementById('objNotes')?.value.trim() || '—',
                    date: new Date().toISOString()
                };

                const existing = getObjections();
                existing.unshift(rec);
                localStorage.setItem('sp_objections', JSON.stringify(existing));

                window.closeObjectionModal();
                showToast(t('✅ تم حفظ الاعتراض بنجاح في تقرير السوق', '✅ Objection saved to Market Intel'), 'success');
                if (typeof P !== 'undefined' && P === 'intel' && typeof window.rIntel === 'function') window.rIntel();
            });
        }

        if (document.getElementById('objCust')) document.getElementById('objCust').value = customerName;
        modal.style.display = 'flex';
        modal.classList.add('on', 'open');
    };

    window.closeObjectionModal = function() {
        const m = document.getElementById('spObjectionModal');
        if (m) {
            m.style.display = 'none';
            m.classList.remove('on', 'open');
        }
    };

    // ─── FAB INJECTION ────────────────────────────────────────────────────────
    function injectFAB() {
        if (document.getElementById('spGlobalFAB')) return;

        const fab = document.createElement('div');
        fab.id = 'spGlobalFAB';
        fab.className = 'sp-fab-container';
        fab.innerHTML = `
            <button class="sp-fab-main" id="spFabBtn" title="${t('إجراءات سريعة', 'Quick Actions')}">＋</button>
            <div class="sp-fab-menu">
                <div class="sp-fab-item" id="fabActionQuote"><span class="sp-fab-icon">💬</span><span>${t('عرض سعر واتساب', 'Quote')}</span></div>
                <div class="sp-fab-item" id="fabActionRoutes"><span class="sp-fab-icon">🗺️</span><span>${t('مسار الزيارات', 'Routes')}</span></div>
                <div class="sp-fab-item" id="fabActionSale"><span class="sp-fab-icon">🛒</span><span>${t('تسجيل بيعة', 'Sale')}</span></div>
                <div class="sp-fab-item" id="fabActionVisit"><span class="sp-fab-icon">🚗</span><span>${t('تسجيل زيارة', 'Visit')}</span></div>
                <div class="sp-fab-item" id="fabActionStock"><span class="sp-fab-icon">📦</span><span>${t('فحص المخزون', 'Stock')}</span></div>
            </div>
        `;
        document.body.appendChild(fab);

        document.getElementById('spFabBtn')?.addEventListener('click', e => {
            e.stopPropagation();
            fab.classList.toggle('active');
        });

        document.addEventListener('click', e => {
            if (!fab.contains(e.target)) fab.classList.remove('active');
        });

        const navTo = page => {
            fab.classList.remove('active');
            P = page;
            if (typeof render === 'function') render();
            if (typeof buildNav === 'function') buildNav();
        };

        document.getElementById('fabActionQuote')?.addEventListener('click', () => navTo('quotes'));
        document.getElementById('fabActionRoutes')?.addEventListener('click', () => navTo('routes'));
        document.getElementById('fabActionSale')?.addEventListener('click', () => navTo('sales'));
        document.getElementById('fabActionVisit')?.addEventListener('click', () => navTo('visits'));
        document.getElementById('fabActionStock')?.addEventListener('click', () => navTo('stock'));
    }

    // ─── INITIALIZATION & HOOKS ────────────────────────────────────────────────
    function initBooster() {
        registerBoosterNav();
        injectFAB();
        calcBadgesAsync();

        // High-Speed Direct Render Hook
        const origRender = window.render;
        window.render = function () {
            if (typeof P !== 'undefined') {
                if (P === 'upsell' && typeof window.rUpsell === 'function') { window.rUpsell(); return; }
                if (P === 'quotes' && typeof window.rQuotes === 'function') { window.rQuotes(); return; }
                if (P === 'rfm' && typeof window.rRFM === 'function') { window.rRFM(); return; }
                if (P === 'commission' && typeof window.rCommission === 'function') { window.rCommission(); return; }
                if (P === 'routes' && typeof window.rRoutes === 'function') { window.rRoutes(); return; }
                if (P === 'intel' && typeof window.rIntel === 'function') { window.rIntel(); return; }
                if (P === 'leaderboard' && typeof window.rLeaderboard === 'function') { window.rLeaderboard(); return; }
            }

            if (typeof origRender === 'function') origRender();
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBooster);
    } else {
        initBooster();
    }
})();
