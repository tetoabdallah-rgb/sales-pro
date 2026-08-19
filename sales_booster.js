/**
 * ============================================================
 * sales_booster.js — Sales Pro Enterprise Growth & Sales Booster (v5.0)
 * Safe Modular Injection Pattern — 100% Non-Breaking.
 *
 * Modules included:
 *  1. Smart Cross-Sell & Upsell Engine (Tab: 'upsell')
 *  2. Instant WhatsApp Quotations & Templates (Tab: 'quotes')
 *  3. RFM Customer Segmentation Matrix (Tab: 'rfm')
 *  4. Commission & Incentive Simulator (Tab: 'commission')
 *  5. Global Floating Action Button (FAB) & Live Sidebar Badges
 * ============================================================
 */

(function () {
    'use strict';

    // ─── Helpers & Localization ───────────────────────────────────────────────
    const t = (ar, en) => (typeof L !== 'undefined' && L === 'en') ? en : ar;
    const fmtN = n => Number(n || 0).toLocaleString('en-US');
    const fmtP = n => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ' + t('ج.م', 'EGP');

    function getSales() { try { return JSON.parse(localStorage.getItem('salesData') || '[]'); } catch(e) { return []; } }
    function getTargets() { try { return JSON.parse(localStorage.getItem('targetData') || '[]'); } catch(e) { return []; } }
    function getCollections() { try { return JSON.parse(localStorage.getItem('payData') || '[]'); } catch(e) { return []; } }
    function getStock() { try { return JSON.parse(localStorage.getItem('sp_stock_v1') || '[]'); } catch(e) { return []; } }
    function getVisits() { try { return JSON.parse(localStorage.getItem('sp_visits') || '[]'); } catch(e) { return []; } }

    function parseDate(v) {
        if (!v) return null;
        if (typeof v === 'number') return new Date(Math.round((v - 25569) * 86400 * 1000));
        let d = new Date(v);
        if (!isNaN(d.getTime())) return d;
        if (typeof v === 'string') {
            let p = v.split(/[\/\-]/);
            if (p.length === 3) {
                let y = p[2].length === 2 ? '20' + p[2] : p[2];
                return new Date(`${y}-${('0'+p[1]).slice(-2)}-${('0'+p[0]).slice(-2)}`);
            }
        }
        return null;
    }

    function showToast(msg, type = 'info') {
        if (typeof window.toast === 'function') {
            window.toast(msg, type);
            return;
        }
        let t = document.getElementById('TT');
        if (!t) return;
        t.textContent = msg;
        t.className = 'toast show ' + type;
        setTimeout(() => { t.className = 'toast'; }, 3000);
    }

    // ─── Register Navigation Items Safely ──────────────────────────────────────
    function registerBoosterNav() {
        if (typeof NAV === 'undefined' || !Array.isArray(NAV)) return;

        const newTabs = [
            { p: 'upsell', ic: '🛍️', ar: 'محرك الفرص', en: 'Upsell & Bundles', section: 'growth' },
            { p: 'quotes', ic: '💬', ar: 'عروض الواتساب', en: 'WhatsApp Quotes', section: 'growth' },
            { p: 'rfm', ic: '👑', ar: 'تصنيف العملاء', en: 'RFM Segments', section: 'growth' },
            { p: 'commission', ic: '🏆', ar: 'حاسبة العمولات', en: 'Commission Sim', section: 'growth' }
        ];

        // Add Section Header if not already present
        const hasSection = NAV.some(n => n.s && (n.s.ar === 'مضاعفة المبيعات' || n.s.en === 'Growth'));
        if (!hasSection) {
            // Insert before 'Smart' or 'System'
            const smartIdx = NAV.findIndex(n => n.s && (n.s.ar === 'ذكي' || n.s.en === 'Smart'));
            const insertAt = smartIdx !== -1 ? smartIdx : NAV.length - 5;
            
            const sectionHeader = { s: { ar: 'مضاعفة المبيعات 🔥', en: 'Growth & Booster 🔥' } };
            const itemsToInsert = [sectionHeader];
            
            newTabs.forEach(tab => {
                if (!NAV.some(n => n.p === tab.p)) {
                    itemsToInsert.push({ p: tab.p, ic: tab.ic });
                }
            });

            NAV.splice(insertAt, 0, ...itemsToInsert);

            // Register translation hooks
            if (typeof window.TUI !== 'undefined') {
                const origTUI = window.TUI;
                window.TUI = function (str) {
                    if (str === 'upsell') return t('محرك الفرص والـ Bundles', 'Upsell & Bundles');
                    if (str === 'quotes') return t('عروض أسعار الواتساب', 'WhatsApp Quotes');
                    if (str === 'rfm') return t('تصنيف العملاء RFM', 'RFM Segments');
                    if (str === 'commission') return t('حاسبة العمولات والحوافز', 'Commission Sim');
                    return origTUI(str);
                };
            }
        }

        // Rebuild nav if function exists
        if (typeof buildNav === 'function') {
            buildNav();
        }
    }

    // ─── Update Live Badges on Sidebar ─────────────────────────────────────────
    function updateLiveBadges() {
        const S_data = getSales();
        const stock_data = getStock();
        const pay_data = getCollections();

        // 1. Calculate Dormant Count (Customers with no sales in > 30 days)
        const now = new Date();
        const custLastMap = {};
        S_data.forEach(r => {
            const name = r.customer || r['اسم العميل'] || r['العميل'] || r.client;
            const dt = parseDate(r.date || r['التاريخ'] || r['تاريخ الفاتورة']);
            if (name && dt) {
                if (!custLastMap[name] || dt > custLastMap[name]) custLastMap[name] = dt;
            }
        });
        const dormantCount = Object.values(custLastMap).filter(d => (now - d) / (1000 * 60 * 60 * 24) > 30).length;

        // 2. Low Stock Count
        const lowStockCount = stock_data.filter(p => p.qty != null && p.qty <= 5).length;

        // Apply badges to navigation DOM
        const badgeMap = {
            'dormant': { count: dormantCount, cls: 'sp-badge-amber' },
            'stock': { count: lowStockCount, cls: 'sp-badge-danger' },
            'upsell': { count: 'HOT', cls: 'sp-badge-hot' },
            'rfm': { count: 'VIP', cls: 'sp-badge-success' },
            'quotes': { count: '⚡', cls: 'sp-badge-blue' }
        };

        document.querySelectorAll('.ni').forEach(el => {
            const p = el.getAttribute('data-p');
            if (badgeMap[p]) {
                let badge = el.querySelector('.sp-nav-badge');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'sp-nav-badge ' + badgeMap[p].cls;
                    el.appendChild(badge);
                }
                const val = badgeMap[p].count;
                if (typeof val === 'number' && val > 0) {
                    badge.textContent = val > 99 ? '99+' : val;
                    badge.style.display = 'inline-block';
                } else if (typeof val === 'string') {
                    badge.textContent = val;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        });
    }

    // ─── TAB 1: UPSELL & SMART BUNDLES ENGINE ─────────────────────────────────
    window.rUpsell = function rUpsell() {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getSales();
        const stock_data = getStock();

        // 1. Analyze Category Gaps
        const custProfiles = {};
        S_data.forEach(r => {
            const cust = r.customer || r['اسم العميل'] || r['العميل'] || r.client || t('عميل عام', 'General Client');
            const cat = String(r.category || r['الفئة'] || r['القسم'] || r.itemClass || '').toLowerCase();
            const val = parseFloat(r.amount || r['المبلغ'] || r['الإجمالي'] || r.val || 0);

            if (!custProfiles[cust]) custProfiles[cust] = { total: 0, hardware: 0, accessories: 0, items: new Set() };
            custProfiles[cust].total += val;

            if (cat.includes('hard') || cat.includes('موبايل') || cat.includes('هاتف') || cat.includes('phone') || cat.includes('جهاز')) {
                custProfiles[cust].hardware += val;
            } else {
                custProfiles[cust].accessories += val;
            }
            const item = r.item || r['الصنف'] || r['المنتج'];
            if (item) custProfiles[cust].items.add(item);
        });

        const opportunityList = [];
        Object.keys(custProfiles).forEach(c => {
            const p = custProfiles[c];
            if (p.total > 5000) {
                if (p.hardware > 0 && p.accessories === 0) {
                    opportunityList.push({
                        customer: c,
                        type: 'need_acc',
                        title: t('فرصة إكسسوارات ذهبية', 'Golden Accessories Opportunity'),
                        desc: t(`العميل اشترى أجهزة بقيمة ${fmtP(p.hardware)} بدون إكسسوارات نهائياً! اعرض عليه بكج حماية وشواحن لرفع هامش الربح.`, `Client bought ${fmtP(p.hardware)} hardware without any accessories. Pitch a protective bundle!`),
                        actionText: t('إنشاء عرض إكسسوارات', 'Create Acc Quote'),
                        tag: t('هامش ربح مرتفع', 'High Margin')
                    });
                } else if (p.accessories > 0 && p.hardware === 0) {
                    opportunityList.push({
                        customer: c,
                        type: 'need_hw',
                        title: t('فرصة ترقية لأجهزة وهواتف', 'Hardware Upgrade Opportunity'),
                        desc: t(`العميل عميل إكسسوارات نشط بقيمة ${fmtP(p.accessories)}. اقترح عليه عرض كميات للأجهزة الأكثر مبيعاً.`, `Active accessory client with ${fmtP(p.accessories)}. Pitch top-selling phones!`),
                        actionText: t('عرض هواتف', 'Create Phone Quote'),
                        tag: t('حجم فاتورة كبير', 'Large Basket')
                    });
                }
            }
        });

        // 2. Pre-made Smart Bundles
        const bundles = [
            {
                id: 'bundle_1',
                title: t('📦 بكج الحماية والشحن السريع', '📦 Fast Charging & Shield Bundle'),
                items: [t('5x شاحن سريع 20W', '5x Fast Charger 20W'), t('10x كابلات Type-C مدرعة', '10x Braided Type-C'), t('10x لاصقة حماية شاشة', '10x Screen Protectors')],
                origPrice: 2400,
                dealPrice: 2150,
                discount: '10%',
                margin: '+35%'
            },
            {
                id: 'bundle_2',
                title: t('🎧 بكج الصوتيات المميز (الأكثر طلباً)', '🎧 Premium Audio Best Seller Bundle'),
                items: [t('3x سماعة بلوتوث لاسلكية TWS', '3x Wireless TWS Earbuds'), t('2x مكبر صوت محمول', '2x Bluetooth Speakers'), t('5x سماعات سلكية عالية النقاوة', '5x Wired Hi-Res Earphones')],
                origPrice: 3800,
                dealPrice: 3390,
                discount: '11%',
                margin: '+42%'
            },
            {
                id: 'bundle_3',
                title: t('🚀 بكج افتتاح وتجهيز المحلات', '🚀 Store Grand Opening Pack'),
                items: [t('20x جرابات متنوعة', '20x Assorted Cases'), t('15x شواحن منزلية وسيارات', '15x Wall & Car Chargers'), t('20x كابلات شحن متعددة', '20x Multi-Cables')],
                origPrice: 5200,
                dealPrice: 4500,
                discount: '14%',
                margin: '+38%'
            }
        ];

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box">🛍️</div>
                <div>
                    <div class="booster-title">${t('محرك الفرص البيعية والـ Bundles', 'Smart Upsell & Bundles Engine')}</div>
                    <div class="booster-desc">${t('اقتراحات ذكية فورية لزيادة حجم الفاتورة وهامش ربح المندوب مع كل عميل', 'Instant AI-driven opportunities to maximize ticket size & rep margins')}</div>
                </div>
            </div>
            <button class="btn btn-p" onclick="window.rQuotes()" style="padding:10px 20px; border-radius:12px; font-weight:800; display:flex; align-items:center; gap:8px;">
                <span>💬</span> ${t('إنشاء عرض سعر واتساب', 'Create WhatsApp Quote')}
            </button>
        </div>

        <!-- Metric Overview -->
        <div class="kg" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:24px;">
            <div class="card" style="padding:18px; border-radius:16px;">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:700;">${t('الفرص المكتشفة تلقائياً', 'Detected Opportunities')}</div>
                <div style="font-size:1.6rem; font-weight:900; color:#3b82f6; margin-top:4px;">${fmtN(opportunityList.length)} ${t('فرصة', 'Leads')}</div>
                <div class="sp-trend-badge sp-trend-up">⚡ ${t('فرص جاهزة للإغلاق', 'Ready to close')}</div>
            </div>
            <div class="card" style="padding:18px; border-radius:16px;">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:700;">${t('متوسط زيادة الفاتورة المقدرة', 'Est. Basket Lift')}</div>
                <div style="font-size:1.6rem; font-weight:900; color:#10b981; margin-top:4px;">+28.5%</div>
                <div class="sp-trend-badge sp-trend-up">📈 ${t('عند عرض البكجات', 'Via Bundle Offers')}</div>
            </div>
            <div class="card" style="padding:18px; border-radius:16px;">
                <div style="font-size:0.75rem; color:var(--tx3); font-weight:700;">${t('البكجات الترويجية الجاهزة', 'Pre-made Bundles')}</div>
                <div style="font-size:1.6rem; font-weight:900; color:#f59e0b; margin-top:4px;">${bundles.length} ${t('بكجات فعالة', 'Active Bundles')}</div>
                <div class="sp-trend-badge sp-trend-neutral">📦 ${t('أعلى هامش ربحي', 'Highest Margins')}</div>
            </div>
        </div>

        <!-- Section 1: Customer Category Gap Opportunities -->
        <div style="margin-bottom:32px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <h3 style="font-size:1.15rem; font-weight:800; color:var(--tx1); display:flex; align-items:center; gap:8px;">
                    <span>🎯</span> ${t('عملاء مؤهلون لعروض الـ Cross-Sell الفورية', 'Customers Eligible for Instant Cross-Sell')}
                </h3>
                <span style="font-size:0.8rem; color:var(--tx3);">${t('تحليل تلقائي لسجل المشتريات', 'Auto-analyzed from purchase history')}</span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:16px;">
                ${opportunityList.length ? opportunityList.slice(0, 9).map((op, idx) => `
                <div class="card" style="padding:18px; border-radius:16px; display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                            <span style="font-weight:900; font-size:1.05rem; color:var(--tx1);">${op.customer}</span>
                            <span style="font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:999px; background:rgba(59,130,246,0.12); color:#3b82f6; border:1px solid rgba(59,130,246,0.25);">${op.tag}</span>
                        </div>
                        <div style="font-size:0.85rem; font-weight:700; color:#f59e0b; margin-bottom:6px;">✨ ${op.title}</div>
                        <p style="font-size:0.82rem; color:var(--tx2); line-height:1.5; margin-bottom:14px;">${op.desc}</p>
                    </div>
                    <button class="btn btn-p" onclick="window.quickPitchQuote('${encodeURIComponent(op.customer)}', '${op.type}')" style="width:100%; padding:10px; border-radius:10px; font-weight:700; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <span>💬</span> ${op.actionText}
                    </button>
                </div>`).join('') : `
                <div class="card" style="grid-column:1/-1; padding:30px; text-align:center; color:var(--tx3);">
                    <div style="font-size:2rem; margin-bottom:8px;">🎉</div>
                    <div style="font-weight:800;">${t('توزيع المبيعات متوازن جداً لدى جميع العملاء!', 'Great job! Sales distribution is balanced across all clients!')}</div>
                </div>`}
            </div>
        </div>

        <!-- Section 2: Ready-to-Send Promotional Bundles -->
        <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <h3 style="font-size:1.15rem; font-weight:800; color:var(--tx1); display:flex; align-items:center; gap:8px;">
                    <span>🎁</span> ${t('البكجات الترويجية الجاهزة للمشاركة (Smart Bundles)', 'Ready-to-Share Smart Bundles')}
                </h3>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:18px;">
                ${bundles.map(b => `
                <div class="card" style="padding:20px; border-radius:18px; border:1.5px solid rgba(59,130,246,0.2); background:linear-gradient(180deg, var(--bg2) 0%, var(--bg3) 100%);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-weight:900; font-size:1.05rem; color:var(--tx1);">${b.title}</span>
                        <span style="background:#10b981; color:#fff; font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:8px;">${t('خصم', 'Save')} ${b.discount}</span>
                    </div>
                    
                    <ul style="list-style:none; padding:0; margin:0 0 16px 0; font-size:0.84rem; color:var(--tx2); display:flex; flex-direction:column; gap:6px;">
                        ${b.items.map(it => `<li style="display:flex; align-items:center; gap:6px;"><span>✅</span> <span>${it}</span></li>`).join('')}
                    </ul>

                    <div style="display:flex; justify-content:space-between; align-items:flex-end; padding-top:12px; border-top:1px solid var(--bd); margin-bottom:14px;">
                        <div>
                            <div style="font-size:0.75rem; color:var(--tx3); text-decoration:line-through;">${fmtP(b.origPrice)}</div>
                            <div style="font-size:1.35rem; font-weight:900; color:#10b981;">${fmtP(b.dealPrice)}</div>
                        </div>
                        <div style="text-align:right;">
                            <span style="font-size:0.72rem; color:var(--tx3);">${t('هامش المندوب', 'Rep Margin')}:</span>
                            <div style="font-weight:800; color:#3b82f6; font-size:0.9rem;">${b.margin}</div>
                        </div>
                    </div>

                    <button class="btn btn-p" onclick="window.sendBundleWhatsApp('${encodeURIComponent(b.title)}', ${b.dealPrice}, '${encodeURIComponent(b.items.join(' + '))}')" style="width:100%; padding:10px; border-radius:10px; font-weight:800; font-size:0.88rem; background:#25d366; color:#111b21; border:none; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span>💬</span> ${t('مشاركة البكج على WhatsApp', 'Share Bundle on WhatsApp')}
                    </button>
                </div>`).join('')}
            </div>
        </div>
        `;
    };

    window.quickPitchQuote = function(custNameEnc, type) {
        const custName = decodeURIComponent(custNameEnc);
        window.rQuotes(custName, type);
    };

    window.sendBundleWhatsApp = function(titleEnc, price, itemsEnc) {
        const title = decodeURIComponent(titleEnc);
        const items = decodeURIComponent(itemsEnc);
        const text = `🔥 *عرض خاص وحصري من Sales Pro* 🔥\n\n*${title}*\n\n📦 *المحتويات:*\n${items.split(' + ').map(i => '• ' + i).join('\n')}\n\n💰 *السعر المخفض لفترة محدودة:* ${price.toLocaleString('en-US')} ج.م فقط!\n\n_للطلب أو حجز الكمية يرجى تأكيد الرسالة._ ✨`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // ─── TAB 2: INSTANT WHATSAPP QUOTES & TEMPLATES ───────────────────────────
    window.rQuotes = function rQuotes(preCustomer = '', preType = '') {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getSales();
        const stock_data = getStock();

        // Extract unique customer names
        const customerSet = new Set();
        S_data.forEach(r => {
            const name = r.customer || r['اسم العميل'] || r['العميل'] || r.client;
            if (name) customerSet.add(name);
        });
        const customers = Array.from(customerSet).sort();

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box" style="background:linear-gradient(135deg, #25d366, #128c7e);">💬</div>
                <div>
                    <div class="booster-title">${t('عروض الأسعار ورسائل WhatsApp الفورية', 'Instant WhatsApp Quotations & Messaging')}</div>
                    <div class="booster-desc">${t('أنشئ عرض سعر احترافي في 30 ثانية وشاركه مع العميل بضغطة زر واحدة', 'Generate polished quotes in 30 seconds and send via WhatsApp with 1 click')}</div>
                </div>
            </div>
        </div>

        <div class="quote-builder-grid">
            <!-- Left: Builder Controls -->
            <div class="card" style="padding:22px; border-radius:20px;">
                <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:18px; display:flex; align-items:center; gap:8px;">
                    <span>📝</span> ${t('بيانات عرض السعر', 'Quotation Details')}
                </h3>

                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:6px;">${t('العميل المستهدف', 'Target Customer')}</label>
                    <input type="text" id="quoteCustName" list="quoteCustList" placeholder="${t('اكتب أو اختر اسم العميل...', 'Select or type customer name...')}" value="${preCustomer}" style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-family:inherit; font-size:0.9rem;">
                    <datalist id="quoteCustList">
                        ${customers.map(c => `<option value="${c}">`).join('')}
                    </datalist>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:6px;">${t('رقم الواتساب (اختياري للفتح المباشر)', 'WhatsApp Phone (Optional)')}</label>
                    <input type="tel" id="quoteCustPhone" placeholder="مثال: 01012345678" style="width:100%; padding:10px 14px; border-radius:10px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-family:inherit; font-size:0.9rem;">
                </div>

                <!-- Products Table in Quote -->
                <div style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <label style="font-size:0.78rem; font-weight:700; color:var(--tx3);">${t('الأصناف والمنتجات', 'Items in Quote')}</label>
                        <button type="button" class="btn btn-p" id="btnAddQuoteRow" style="padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:700;">+ ${t('إضافة صنف', 'Add Item')}</button>
                    </div>
                    <div id="quoteRowsContainer" style="display:flex; flex-direction:column; gap:8px;">
                        <!-- Injected Rows -->
                    </div>
                </div>

                <!-- Discount & Notes -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px;">
                    <div>
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:6px;">${t('نسبة الخصم %', 'Discount %')}</label>
                        <input type="number" id="quoteDiscount" min="0" max="100" value="0" style="width:100%; padding:9px 12px; border-radius:10px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.88rem;">
                    </div>
                    <div>
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:6px;">${t('صلاحية العرض', 'Validity')}</label>
                        <select id="quoteValidity" style="width:100%; padding:9px 12px; border-radius:10px; border:1px solid var(--bd); background:var(--bg3); color:var(--tx1); font-size:0.88rem;">
                            <option value="3">${t('3 أيام', '3 Days')}</option>
                            <option value="7" selected>${t('أسبوع (7 أيام)', '7 Days')}</option>
                            <option value="15">${t('15 يوم', '15 Days')}</option>
                        </select>
                    </div>
                </div>

                <!-- Quick Pre-made Templates Dropdown -->
                <div style="padding:14px; border-radius:12px; background:var(--bg3); border:1px dashed var(--bd); margin-top:12px;">
                    <div style="font-size:0.78rem; font-weight:800; color:#f59e0b; margin-bottom:8px;">⚡ ${t('رسائل وقوالب واتساب سريعة جاهزة', 'Instant WhatsApp Message Templates')}</div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        <button type="button" class="btn btn-ghost" onclick="window.applyWaTemplate('payment_reminder')" style="font-size:0.75rem; padding:6px 10px; border-radius:8px;">💳 ${t('تذكير سداد', 'Payment Reminder')}</button>
                        <button type="button" class="btn btn-ghost" onclick="window.applyWaTemplate('new_stock')" style="font-size:0.75rem; padding:6px 10px; border-radius:8px;">📦 ${t('وصول بضاعة جديدة', 'New Stock Alert')}</button>
                        <button type="button" class="btn btn-ghost" onclick="window.applyWaTemplate('win_back')" style="font-size:0.75rem; padding:6px 10px; border-radius:8px;">🎁 ${t('استعادة عميل راكد', 'Win-Back Offer')}</button>
                        <button type="button" class="btn btn-ghost" onclick="window.applyWaTemplate('thank_you')" style="font-size:0.75rem; padding:6px 10px; border-radius:8px;">🤝 ${t('شكر وتقدير', 'Thank You')}</button>
                    </div>
                </div>
            </div>

            <!-- Right: Real-Time WhatsApp Live Simulation -->
            <div>
                <div class="wa-preview-card">
                    <div style="display:flex; align-items:center; gap:10px; padding-bottom:14px; border-bottom:1px solid #202c33; margin-bottom:14px;">
                        <div style="width:38px; height:38px; border-radius:50%; background:#25d366; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900;">SP</div>
                        <div>
                            <div style="font-weight:800; font-size:0.95rem;" id="waSimName">${preCustomer || t('عميل مميز', 'Valued Client')}</div>
                            <div style="font-size:0.72rem; color:#8696a0;">● ${t('متصل الآن (معاينة حية)', 'Online (Live Preview)')}</div>
                        </div>
                    </div>

                    <div class="wa-bubble" id="waLiveBubble">
                        <!-- Real-time formatted text -->
                    </div>

                    <button type="button" class="wa-send-btn" id="btnSendRealWA">
                        <span style="font-size:1.2rem;">💬</span> ${t('إرسال العرض عبر WhatsApp الآن', 'Send via WhatsApp Now')}
                    </button>
                </div>
            </div>
        </div>
        `;

        // Initialize Quote Rows
        const stockItems = getStock();
        let rows = [
            { name: stockItems[0]?.name || t('شاحن سريع 20W مع كابل', 'Fast Charger 20W'), qty: 5, price: stockItems[0]?.price || 180 },
            { name: stockItems[1]?.name || t('سماعة لاسلكية بلوتوث TWS', 'Wireless Earbuds TWS'), qty: 3, price: stockItems[1]?.price || 350 }
        ];

        function renderQuoteRows() {
            const container = document.getElementById('quoteRowsContainer');
            if (!container) return;
            container.innerHTML = rows.map((r, i) => `
            <div style="display:grid; grid-template-columns:1.5fr 70px 100px 30px; gap:8px; align-items:center;">
                <input type="text" class="q-name" data-idx="${i}" value="${r.name}" placeholder="${t('اسم الصنف', 'Item Name')}" style="padding:8px 10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); font-size:0.82rem;">
                <input type="number" class="q-qty" data-idx="${i}" value="${r.qty}" min="1" placeholder="${t('العدد', 'Qty')}" style="padding:8px; border-radius:8px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); font-size:0.82rem; text-align:center;">
                <input type="number" class="q-price" data-idx="${i}" value="${r.price}" min="0" placeholder="${t('السعر', 'Price')}" style="padding:8px; border-radius:8px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1); font-size:0.82rem; text-align:center;">
                <button type="button" data-del="${i}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1rem;">✕</button>
            </div>`).join('');
            updateLivePreview();
        }

        function updateLivePreview() {
            const cust = document.getElementById('quoteCustName')?.value.trim() || t('عميلنا العزيز', 'Valued Customer');
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

            const bubbleText = `تحية طيبة يا أستاذ *${cust}* 🌹\nيسعدنا تقديم عرض الأسعار الخاص والمميز لحضرتك من *Sales Pro*:\n\n📋 *تفاصيل الطلبية:*\n${itemsText}\n━━━━━━━━━━━━━━━\n💵 *المجموع:* ${fmtN(subtotal)} ج.م\n${discount > 0 ? `🎁 *خصم خاص (${discount}%):* -${fmtN(discountVal)} ج.م\n` : ''}✨ *الصافي المطلوب:* *${fmtN(netTotal)} ج.م*\n━━━━━━━━━━━━━━━\n⏳ *العرض سارٍ لمدة ${validity} أيام من تاريخ اليوم.*\n\nللتأكيد واعتماد الطلب، يرجى الرد على هذه الرسالة. شكراً لتعاملكم معنا! 🤝`;

            const bubbleEl = document.getElementById('waLiveBubble');
            if (bubbleEl) bubbleEl.textContent = bubbleText;

            const simName = document.getElementById('waSimName');
            if (simName) simName.textContent = cust;
        }

        renderQuoteRows();

        // Listeners for live typing
        document.getElementById('quoteCustName')?.addEventListener('input', updateLivePreview);
        document.getElementById('quoteDiscount')?.addEventListener('input', updateLivePreview);
        document.getElementById('quoteValidity')?.addEventListener('change', updateLivePreview);

        document.getElementById('btnAddQuoteRow')?.addEventListener('click', () => {
            rows.push({ name: '', qty: 1, price: 0 });
            renderQuoteRows();
        });

        document.getElementById('quoteRowsContainer')?.addEventListener('input', e => {
            const idx = e.target.dataset.idx;
            if (idx == null) return;
            if (e.target.classList.contains('q-name')) rows[idx].name = e.target.value;
            if (e.target.classList.contains('q-qty')) rows[idx].qty = parseInt(e.target.value) || 1;
            if (e.target.classList.contains('q-price')) rows[idx].price = parseFloat(e.target.value) || 0;
            updateLivePreview();
        });

        document.getElementById('quoteRowsContainer')?.addEventListener('click', e => {
            const delIdx = e.target.dataset.del;
            if (delIdx != null) {
                rows.splice(parseInt(delIdx), 1);
                renderQuoteRows();
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
            const waUrl = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            showToast(t('✅ تم فتح محادثة WhatsApp', '✅ WhatsApp Chat Opened'), 'success');
        });
    };

    window.applyWaTemplate = function(tplKey) {
        const cust = document.getElementById('quoteCustName')?.value.trim() || t('عميلنا العزيز', 'Valued Customer');
        let text = '';
        if (tplKey === 'payment_reminder') {
            text = `مساء الخير يا فندم أستاذ *${cust}* 🌸\nنود تذكير سيادتكم بموعد استحقاق الدفعة الحالية لتسوية الحساب.\nشاكرين دائماً حسن تعاونكم معنا في *Sales Pro*. 🙏`;
        } else if (tplKey === 'new_stock') {
            text = `أهلاً بك يا أستاذ *${cust}* 🎉\nوصلتنا تشكيلة جديدة ومميزة من أفضل المنتجات والإكسسوارات بأسعار خاصة جداً للعملاء المميزين.\nيسعدنا إرسال قائمة الكتالوج لحضرتك فوراً! 📦✨`;
        } else if (tplKey === 'win_back') {
            text = `أستاذ *${cust}* الغالي وحشتنا طلتك! 🌟\nتقديراً لتعاملنا السابق، محضرين لحضرتك خصم خاص 10% بونص على أول طلبية هذا الشهر.\nكلمنا أو اطلب الآن للاستفادة من العرض! 🎁`;
        } else if (tplKey === 'thank_you') {
            text = `شكراً جزيلاً يا أستاذ *${cust}* على ثقتك الغالية في *Sales Pro* 🤝\nتم تسجيل طلبيتك بنجاح، ونتمنى لك مبيعات وفيرة وموفقة دائماً! 🚀`;
        }

        const bubbleEl = document.getElementById('waLiveBubble');
        if (bubbleEl) bubbleEl.textContent = text;
        showToast(t('✅ تم تطبيق القالب بنجاح', '✅ Template applied'), 'info');
    };

    // ─── TAB 3: RFM CUSTOMER SEGMENTATION MATRIX ──────────────────────────────
    window.rRFM = function rRFM() {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getSales();
        const now = new Date();

        // Calculate RFM for every customer
        const custMap = {};
        S_data.forEach(r => {
            const name = r.customer || r['اسم العميل'] || r['العميل'] || r.client || t('عميل عام', 'General Client');
            const dt = parseDate(r.date || r['التاريخ'] || r['تاريخ الفاتورة']);
            const val = parseFloat(r.amount || r['المبلغ'] || r['الإجمالي'] || r.val || 0);

            if (!custMap[name]) {
                custMap[name] = { name, count: 0, totalSpend: 0, lastDate: null };
            }
            custMap[name].count += 1;
            custMap[name].totalSpend += val;
            if (dt && (!custMap[name].lastDate || dt > custMap[name].lastDate)) {
                custMap[name].lastDate = dt;
            }
        });

        const list = Object.values(custMap).map(c => {
            const recencyDays = c.lastDate ? Math.floor((now - c.lastDate) / (1000 * 60 * 60 * 24)) : 999;
            let segment = 'grow'; // default
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
                <div class="booster-icon-box" style="background:linear-gradient(135deg, #f59e0b, #d97706);">👑</div>
                <div>
                    <div class="booster-title">${t('مصفوفة تصنيف وسلوك العملاء (RFM)', 'RFM Customer Segmentation Matrix')}</div>
                    <div class="booster-desc">${t('تصنيف آلي وفق (حداثة الشراء · تكرار الطلب · القيمة المالية) لاستهداف بيعي فائق الدقة', 'Automatic segmentation by Recency, Frequency & Monetary Value to maximize retention')}</div>
                </div>
            </div>
        </div>

        <!-- 4 Core Quadrant Cards -->
        <div class="rfm-grid" style="margin-bottom:24px;">
            <div class="rfm-card rfm-vip">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.4rem;">👑</span>
                    <span style="font-weight:900; font-size:1.3rem; color:#f59e0b;">${vips.length}</span>
                </div>
                <div style="font-weight:800; font-size:1.05rem; margin:8px 0 4px; color:var(--tx1);">${t('عملاء VIP والأبطال (Champions)', 'VIP Champions')}</div>
                <div style="font-size:0.8rem; color:var(--tx3);">${t('أعلى مشتريات وشراء مستمر. قدم لهم أسعاراً حصرية وخدمة ممتازة.', 'Highest spend & frequency. Treat with exclusive VIP deals.')}</div>
            </div>

            <div class="rfm-card rfm-risk">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.4rem;">⚠️</span>
                    <span style="font-weight:900; font-size:1.3rem; color:#ef4444;">${risks.length}</span>
                </div>
                <div style="font-weight:800; font-size:1.05rem; margin:8px 0 4px; color:var(--tx1);">${t('في خطر الفقدان (At Risk)', 'At Risk Clients')}</div>
                <div style="font-size:0.8rem; color:var(--tx3);">${t('عملاء كبار توقفوا فجأة عن الشراء! أولوية قصوى للزيارة الفورية.', 'Big spenders whose orders stopped. Priority for visits!')}</div>
            </div>

            <div class="rfm-card rfm-grow">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.4rem;">🌟</span>
                    <span style="font-weight:900; font-size:1.3rem; color:#10b981;">${grows.length}</span>
                </div>
                <div style="font-weight:800; font-size:1.05rem; margin:8px 0 4px; color:var(--tx1);">${t('واعدون ونمو مستمر (Promising)', 'Promising Growth')}</div>
                <div style="font-size:0.8rem; color:var(--tx3);">${t('يشترون بانتظام وبقيم متصاعدة. شجعهم بعروض الـ Bundles.', 'Regular buyers with rising tickets. Pitch bundle offers.')}</div>
            </div>

            <div class="rfm-card rfm-lost">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.4rem;">💤</span>
                    <span style="font-weight:900; font-size:1.3rem; color:#64748b;">${losts.length}</span>
                </div>
                <div style="font-weight:800; font-size:1.05rem; margin:8px 0 4px; color:var(--tx1);">${t('راكدون بحاجة لتنشيط (Win-Back)', 'Dormant Win-Back')}</div>
                <div style="font-size:0.8rem; color:var(--tx3);">${t('انقطعوا لفترة طويلة. أرسل لهم عروض تصفية واسترداد مخصصة.', 'Inactive for long. Send re-engagement discounts.')}</div>
            </div>
        </div>

        <!-- Interactive Customer List Table -->
        <div class="card" style="padding:20px; border-radius:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                <h3 style="font-size:1.1rem; font-weight:800; color:var(--tx1);">${t('تفاصيل العملاء والإجراءات المقترحة', 'Client Matrix & Recommended Actions')}</h3>
                <div class="booster-tabs" id="rfmFilterTabs">
                    <button class="booster-tab-btn active" data-filter="all">${t('الكل', 'All')} (${list.length})</button>
                    <button class="booster-tab-btn" data-filter="vip">👑 VIP (${vips.length})</button>
                    <button class="booster-tab-btn" data-filter="risk">⚠️ ${t('في خطر', 'At Risk')} (${risks.length})</button>
                    <button class="booster-tab-btn" data-filter="grow">🌟 ${t('واعدون', 'Promising')} (${grows.length})</button>
                    <button class="booster-tab-btn" data-filter="lost">💤 ${t('راكدون', 'Dormant')} (${losts.length})</button>
                </div>
            </div>

            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                    <thead>
                        <tr style="border-bottom:1px solid var(--bd); text-align:right;">
                            <th style="padding:10px 12px; color:var(--tx3); font-weight:700;">${t('العميل', 'Customer')}</th>
                            <th style="padding:10px 12px; color:var(--tx3); font-weight:700;">${t('الشريحة', 'Segment')}</th>
                            <th style="padding:10px 12px; color:var(--tx3); font-weight:700;">${t('إجمالي المشتريات', 'Total Spend')}</th>
                            <th style="padding:10px 12px; color:var(--tx3); font-weight:700;">${t('عدد الفواتير', 'Orders')}</th>
                            <th style="padding:10px 12px; color:var(--tx3); font-weight:700;">${t('آخر طلب منذ', 'Last Order')}</th>
                            <th style="padding:10px 12px; color:var(--tx3); font-weight:700; text-align:center;">${t('إجراء فوري', 'Quick Action')}</th>
                        </tr>
                    </thead>
                    <tbody id="rfmTableBody">
                        <!-- Injected -->
                    </tbody>
                </table>
            </div>
        </div>
        `;

        function renderRFMTable(filter = 'all') {
            const tbody = document.getElementById('rfmTableBody');
            if (!tbody) return;
            const filtered = filter === 'all' ? list : list.filter(x => x.segment === filter);

            const badgeStyles = {
                vip: 'background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.3);',
                risk: 'background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);',
                grow: 'background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);',
                lost: 'background:rgba(100,116,139,0.15); color:#94a3b8; border:1px solid rgba(100,116,139,0.3);'
            };
            const labels = {
                vip: '👑 VIP Champion',
                risk: '⚠️ ' + t('في خطر', 'At Risk'),
                grow: '🌟 ' + t('واعد', 'Promising'),
                lost: '💤 ' + t('راكد', 'Dormant')
            };

            tbody.innerHTML = filtered.map(c => `
            <tr style="border-bottom:1px solid var(--bd); transition:background 0.15s;">
                <td style="padding:12px; font-weight:800; color:var(--tx1);">${c.name}</td>
                <td style="padding:12px;"><span style="padding:3px 8px; border-radius:8px; font-size:0.75rem; font-weight:800; ${badgeStyles[c.segment]}">${labels[c.segment]}</span></td>
                <td style="padding:12px; font-weight:800; color:#10b981;">${fmtP(c.totalSpend)}</td>
                <td style="padding:12px; color:var(--tx2); font-weight:700;">${c.count} ${t('طلبيات', 'orders')}</td>
                <td style="padding:12px; color:${c.recencyDays > 30 ? '#ef4444' : 'var(--tx2)'}; font-weight:700;">${c.recencyDays === 999 ? '—' : c.recencyDays + ' ' + t('يوم', 'days')}</td>
                <td style="padding:12px; text-align:center;">
                    <button class="btn btn-p" onclick="window.rQuotes('${encodeURIComponent(c.name)}')" style="padding:6px 12px; font-size:0.75rem; border-radius:8px; font-weight:700;">
                        <span>💬</span> ${t('واتساب / عرض', 'Quote / WA')}
                    </button>
                </td>
            </tr>`).join('');
        }

        renderRFMTable();

        document.getElementById('rfmFilterTabs')?.addEventListener('click', e => {
            const btn = e.target.closest('.booster-tab-btn');
            if (!btn) return;
            document.querySelectorAll('#rfmFilterTabs .booster-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderRFMTable(btn.dataset.filter);
        });
    };

    // ─── TAB 4: COMMISSION & INCENTIVE SIMULATOR ───────────────────────────────
    window.rCommission = function rCommission() {
        const M = document.getElementById('M');
        if (!M) return;

        const S_data = getSales();
        const T_data = getTargets();

        const currentSales = S_data.reduce((s, r) => s + parseFloat(r.amount || r['المبلغ'] || r['الإجمالي'] || 0), 0) || 75000;
        const currentTarget = T_data.reduce((s, r) => s + parseFloat(r.target || r['المستهدف'] || r['التارجت'] || 0), 0) || 100000;

        M.innerHTML = `
        <div class="booster-header">
            <div class="booster-title-group">
                <div class="booster-icon-box" style="background:linear-gradient(135deg, #10b981, #059669);">🏆</div>
                <div>
                    <div class="booster-title">${t('محاكي العمولات ومكافآت التارجت التفاعلي', 'Interactive Commission & Bonus Simulator')}</div>
                    <div class="booster-desc">${t('شاهد أرباحك وعمولتك الشهرية المتوقعة لحظة بلحظة مع كل بيعة جديدة', 'Simulate your monthly commission earnings and bonus tier accelerator in real-time')}</div>
                </div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:20px;">
            <!-- Sliders Box -->
            <div class="card" style="padding:22px; border-radius:20px;">
                <h3 style="font-size:1.1rem; font-weight:800; margin-bottom:18px;">🎛️ ${t('حرك المؤشرات لمحاكاة مبيعاتك', 'Adjust Sliders to Simulate Sales')}</h3>

                <div class="sim-slider-wrap">
                    <div class="sim-slider-hdr">
                        <span style="font-size:0.85rem; font-weight:700; color:var(--tx2);">${t('المبيعات المحققة المتوقعة (ج.م)', 'Projected Sales (EGP)')}</span>
                        <span style="font-size:1.1rem; font-weight:900; color:#3b82f6;" id="simValSales">${fmtP(currentSales)}</span>
                    </div>
                    <input type="range" class="sim-range" id="simRangeSales" min="0" max="${Math.max(250000, currentTarget * 2)}" step="5000" value="${currentSales}">
                </div>

                <div class="sim-slider-wrap">
                    <div class="sim-slider-hdr">
                        <span style="font-size:0.85rem; font-weight:700; color:var(--tx2);">${t('مستهدف المبيعات (التارجت)', 'Monthly Target (EGP)')}</span>
                        <span style="font-size:1.1rem; font-weight:900; color:#f59e0b;" id="simValTarget">${fmtP(currentTarget)}</span>
                    </div>
                    <input type="range" class="sim-range" id="simRangeTarget" min="20000" max="300000" step="5000" value="${currentTarget}">
                </div>

                <div class="sim-slider-wrap">
                    <div class="sim-slider-hdr">
                        <span style="font-size:0.85rem; font-weight:700; color:var(--tx2);">${t('مبيعات إكسسوارات إضافية (بونص إضافي)', 'Extra Accessories Lift')}</span>
                        <span style="font-size:1.1rem; font-weight:900; color:#10b981;" id="simValAcc">15,000 ج.م</span>
                    </div>
                    <input type="range" class="sim-range" id="simRangeAcc" min="0" max="50000" step="1000" value="15000">
                </div>
            </div>

            <!-- Projection Card -->
            <div class="card" style="padding:22px; border-radius:20px; background:linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(16,185,129,0.08) 100%); border:1.5px solid rgba(59,130,246,0.3);">
                <div style="font-size:0.8rem; color:var(--tx3); font-weight:800; text-transform:uppercase;">${t('إجمالي العمولة والمكافأة المتوقعة', 'Estimated Total Commission')}</div>
                <div style="font-size:2.4rem; font-weight:900; color:#10b981; margin:8px 0;" id="simTotalCommission">—</div>

                <!-- Tier Badge -->
                <div id="simTierBadge" style="display:inline-block; padding:6px 14px; border-radius:10px; font-weight:900; font-size:0.9rem; margin-bottom:18px;">—</div>

                <div style="display:flex; flex-direction:column; gap:8px; padding-top:14px; border-top:1px solid var(--bd); font-size:0.84rem;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--tx3);">${t('نسبة تحقيق الهدف:', 'Target Achievement:')}</span>
                        <span style="font-weight:900; color:var(--tx1);" id="simPct">—</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--tx3);">${t('عمولة المبيعات الأساسية:', 'Base Commission:')}</span>
                        <span style="font-weight:800; color:#3b82f6;" id="simBaseComm">—</span>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--tx3);">${t('بونص الإكسسوارات والتميز:', 'Bonus Accelerator:')}</span>
                        <span style="font-weight:800; color:#10b981;" id="simBonusAcc">—</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        function recalculate() {
            const sales = parseFloat(document.getElementById('simRangeSales')?.value || 0);
            const target = parseFloat(document.getElementById('simRangeTarget')?.value || 1);
            const acc = parseFloat(document.getElementById('simRangeAcc')?.value || 0);

            document.getElementById('simValSales').textContent = fmtP(sales);
            document.getElementById('simValTarget').textContent = fmtP(target);
            document.getElementById('simValAcc').textContent = fmtP(acc);

            const pct = Math.round((sales / target) * 100);
            document.getElementById('simPct').textContent = pct + '%';

            let baseRate = 0.015; // 1.5%
            let tierText = '';
            let tierStyle = '';

            if (pct < 80) {
                baseRate = 0.01;
                tierText = '🥉 ' + t('الشريحة البرونزية (تحت التارجت)', 'Bronze Tier (<80%)');
                tierStyle = 'background:rgba(148,163,184,0.2); color:#94a3b8;';
            } else if (pct < 100) {
                baseRate = 0.015;
                tierText = '🥈 ' + t('الشريحة الفضية (قريب من الهدف)', 'Silver Tier (80-99%)');
                tierStyle = 'background:rgba(59,130,246,0.2); color:#3b82f6;';
            } else if (pct < 125) {
                baseRate = 0.025;
                tierText = '🥇 ' + t('الشريحة الذهبية (تم تحقيق التارجت 🎯)', 'Gold Tier (100-124%)');
                tierStyle = 'background:rgba(245,158,11,0.2); color:#f59e0b;';
            } else {
                baseRate = 0.035;
                tierText = '💎 ' + t('الشريحة الماسية الفائقة (بطل المبيعات 🚀)', 'Diamond Elite (125%+)');
                tierStyle = 'background:rgba(16,185,129,0.2); color:#10b981;';
            }

            const baseComm = sales * baseRate;
            const accBonus = acc * 0.05; // 5% accelerator on accessories
            const total = baseComm + accBonus;

            document.getElementById('simBaseComm').textContent = fmtP(baseComm);
            document.getElementById('simBonusAcc').textContent = fmtP(accBonus);
            document.getElementById('simTotalCommission').textContent = fmtP(total);

            const badge = document.getElementById('simTierBadge');
            if (badge) {
                badge.textContent = tierText;
                badge.style.cssText = tierStyle + ' display:inline-block; padding:6px 14px; border-radius:10px; font-weight:900; font-size:0.88rem; margin-bottom:18px;';
            }
        }

        recalculate();
        document.getElementById('simRangeSales')?.addEventListener('input', recalculate);
        document.getElementById('simRangeTarget')?.addEventListener('input', recalculate);
        document.getElementById('simRangeAcc')?.addEventListener('input', recalculate);
    };

    // ─── 5. GLOBAL FLOATING ACTION BUTTON (FAB) ───────────────────────────────
    function injectFAB() {
        if (document.getElementById('spGlobalFAB')) return;

        const fab = document.createElement('div');
        fab.id = 'spGlobalFAB';
        fab.className = 'sp-fab-container';
        fab.innerHTML = `
            <button class="sp-fab-main" id="spFabBtn" title="${t('إجراءات سريعة', 'Quick Actions')}">＋</button>
            <div class="sp-fab-menu">
                <div class="sp-fab-item" id="fabActionQuote">
                    <span class="sp-fab-icon">💬</span>
                    <span>${t('عرض سعر واتساب', 'WhatsApp Quote')}</span>
                </div>
                <div class="sp-fab-item" id="fabActionSale">
                    <span class="sp-fab-icon">🛒</span>
                    <span>${t('تسجيل بيعة', 'Quick Sale')}</span>
                </div>
                <div class="sp-fab-item" id="fabActionVisit">
                    <span class="sp-fab-icon">🚗</span>
                    <span>${t('تسجيل زيارة', 'Log Visit')}</span>
                </div>
                <div class="sp-fab-item" id="fabActionStock">
                    <span class="sp-fab-icon">📦</span>
                    <span>${t('فحص المخزون', 'Check Stock')}</span>
                </div>
            </div>
        `;
        document.body.appendChild(fab);

        // Events
        document.getElementById('spFabBtn')?.addEventListener('click', e => {
            e.stopPropagation();
            fab.classList.toggle('active');
        });

        document.addEventListener('click', e => {
            if (!fab.contains(e.target)) fab.classList.remove('active');
        });

        document.getElementById('fabActionQuote')?.addEventListener('click', () => {
            fab.classList.remove('active');
            if (typeof P !== 'undefined') P = 'quotes';
            if (typeof window.rQuotes === 'function') window.rQuotes();
            if (typeof buildNav === 'function') buildNav();
        });

        document.getElementById('fabActionSale')?.addEventListener('click', () => {
            fab.classList.remove('active');
            if (typeof P !== 'undefined') P = 'sales';
            if (typeof render === 'function') render();
            if (typeof buildNav === 'function') buildNav();
        });

        document.getElementById('fabActionVisit')?.addEventListener('click', () => {
            fab.classList.remove('active');
            if (typeof P !== 'undefined') P = 'visits';
            if (typeof render === 'function') render();
            if (typeof buildNav === 'function') buildNav();
        });

        document.getElementById('fabActionStock')?.addEventListener('click', () => {
            fab.classList.remove('active');
            if (typeof P !== 'undefined') P = 'stock';
            if (typeof window.rStock === 'function') window.rStock();
            if (typeof buildNav === 'function') buildNav();
        });
    }

    // ─── 6. GPS CHECK-IN & VOICE NOTES & OBJECTIONS INTEL ─────────────────────
    window.captureGPSForVisit = function() {
        if (!navigator.geolocation) {
            showToast(t('❌ المتصفح لا يدعم تحديد الموقع GPS', '❌ Geolocation not supported'), 'error');
            return;
        }
        showToast(t('📍 جاري تحديد الموقع الجغرافي للزيارة...', '📍 Capturing GPS coordinates...'), 'info');
        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                const noteInput = document.querySelector('input[placeholder*="ملاحظات"], textarea[placeholder*="ملاحظات"], #inVN, #inCN');
                if (noteInput) {
                    noteInput.value = (noteInput.value ? noteInput.value + ' ' : '') + `[📍 تم تسجيل الوصول: ${lat},${lng}]`;
                }
                showToast(t(`✅ تم تسجيل الموقع: (${lat}, ${lng})`, `✅ Location logged: (${lat}, ${lng})`), 'success');
            },
            err => {
                showToast(t('⚠️ تعذر الوصول للموقع. يرجى تفعيل إذن الـ GPS', '⚠️ GPS permission denied'), 'error');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    window.openDirections = function(destName) {
        if (!destName) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destName)}`;
        window.open(url, '_blank');
    };

    window.startVoiceDictation = function(targetElementId) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            showToast(t('❌ الإملاء الصوتي غير مدعوم في هذا المتصفح', '❌ Speech recognition not supported in this browser'), 'error');
            return;
        }
        const rec = new SpeechRec();
        rec.lang = t('ar-EG', 'en-US');
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        showToast(t('🎙️ تحدث الآن... جاري الاستماع للملاحظة', '🎙️ Listening... speak now'), 'info');

        rec.onresult = e => {
            const transcript = e.results[0][0].transcript;
            const target = document.getElementById(targetElementId) || document.querySelector('input[placeholder*="ملاحظات"], textarea[placeholder*="ملاحظات"]');
            if (target) {
                target.value = (target.value ? target.value + ' ' : '') + transcript;
                target.dispatchEvent(new Event('input', { bubbles: true }));
            }
            showToast(t('✅ تم تسجيل الملاحظة الصوتية بنجاح', '✅ Voice note transcribed!'), 'success');
        };

        rec.onerror = () => {
            showToast(t('❌ لم يتم التعرف على الصوت، يرجى المحاولة مرة أخرى', '❌ Voice recognition failed, please retry'), 'error');
        };

        rec.start();
    };

    window.openObjectionLogger = function(customerName = '') {
        let modal = document.getElementById('spObjectionModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'spObjectionModal';
            modal.className = 'stk-ov';
            modal.innerHTML = `
                <div class="stk-m" style="max-width:500px; padding:22px; border-radius:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="font-size:1.1rem; font-weight:800; color:#ef4444; display:flex; align-items:center; gap:8px;">
                            <span>🛡️</span> ${t('تسجيل اعتراض العميل / أسعار المنافسين', 'Log Objection & Competitor Intel')}
                        </h3>
                        <button class="stk-mc" onclick="document.getElementById('spObjectionModal').classList.remove('on')">✕</button>
                    </div>

                    <div style="margin-bottom:14px;">
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('العميل', 'Customer')}</label>
                        <input type="text" id="objCust" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1);" value="${customerName}">
                    </div>

                    <div style="margin-bottom:14px;">
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('السبب الرئيسي لعدم إتمام البيع', 'Primary Reason for Lost Deal')}</label>
                        <select id="objReason" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1);">
                            <option value="price_high">${t('السعر أعلى من المنافس في السوق', 'Price is higher than competitor')}</option>
                            <option value="no_credit">${t('طلب تسهيلات دفع أو آجل غير متاح', 'Requested payment terms not available')}</option>
                            <option value="out_of_stock">${t('عدم توفر كمية أو صنف معين', 'Requested item / qty out of stock')}</option>
                            <option value="competitor_bonus">${t('المنافس يقدم بونص أو بضاعة مجانية', 'Competitor offers bonus/gifts')}</option>
                            <option value="slow_stock">${t('المحل لديه ركود في بضاعة قديمة', 'Store has old slow stock')}</option>
                            <option value="other">${t('سبب آخر', 'Other reason')}</option>
                        </select>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
                        <div>
                            <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('اسم المنافس (إن وجد)', 'Competitor Name')}</label>
                            <input type="text" id="objComp" placeholder="مثال: شركة X" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1);">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('سعر المنافس (ج.م)', 'Competitor Price')}</label>
                            <input type="number" id="objPrice" placeholder="0" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1);">
                        </div>
                    </div>

                    <div style="margin-bottom:18px;">
                        <label style="display:block; font-size:0.78rem; font-weight:700; color:var(--tx3); margin-bottom:4px;">${t('ملاحظات وتفاصيل إضافية', 'Additional Notes')}</label>
                        <textarea id="objNotes" rows="2" placeholder="${t('اكتب تفاصيل المحادثة أو سبب الرفض...', 'Details of objection...')}" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--bd); background:var(--bg2); color:var(--tx1);"></textarea>
                    </div>

                    <button class="btn btn-p" id="btnSaveObj" style="width:100%; padding:10px; border-radius:10px; font-weight:800; background:#ef4444; border:none;">
                        💾 ${t('حفظ في تقرير السوق والاعتراضات', 'Save Market Intel')}
                    </button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('btnSaveObj')?.addEventListener('click', () => {
                const rec = {
                    id: Date.now(),
                    customer: document.getElementById('objCust')?.value.trim() || customerName,
                    reason: document.getElementById('objReason')?.value,
                    competitor: document.getElementById('objComp')?.value.trim(),
                    compPrice: parseFloat(document.getElementById('objPrice')?.value || 0),
                    notes: document.getElementById('objNotes')?.value.trim(),
                    date: new Date().toISOString()
                };

                const existing = JSON.parse(localStorage.getItem('sp_objections') || '[]');
                existing.unshift(rec);
                localStorage.setItem('sp_objections', JSON.stringify(existing));

                modal.classList.remove('on');
                showToast(t('✅ تم حفظ سبب الاعتراض في تقرير استخبارات السوق', '✅ Objection saved to Market Intel report!'), 'success');
            });
        }

        if (document.getElementById('objCust')) document.getElementById('objCust').value = customerName;
        modal.classList.add('on');
    };

    // ─── INITIALIZATION & HOOKS ────────────────────────────────────────────────
    function initBooster() {
        registerBoosterNav();
        injectFAB();
        updateLiveBadges();

        // Hook into window.render to maintain compatibility
        const origRender = window.render;
        window.render = function () {
            if (typeof P !== 'undefined') {
                if (P === 'upsell' && typeof window.rUpsell === 'function') {
                    window.rUpsell();
                    updateLiveBadges();
                    return;
                }
                if (P === 'quotes' && typeof window.rQuotes === 'function') {
                    window.rQuotes();
                    updateLiveBadges();
                    return;
                }
                if (P === 'rfm' && typeof window.rRFM === 'function') {
                    window.rRFM();
                    updateLiveBadges();
                    return;
                }
                if (P === 'commission' && typeof window.rCommission === 'function') {
                    window.rCommission();
                    updateLiveBadges();
                    return;
                }
            }

            if (typeof origRender === 'function') origRender();
            setTimeout(updateLiveBadges, 100);
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBooster);
    } else {
        initBooster();
    }
})();
