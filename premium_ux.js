// ============================================================
// premium_ux.js — Sales Pro Premium UX Enhancements
// Safe injection-only pattern. No existing code is modified.
// Features:
//   1. KPI Smart Banner (Motivational progress on Dashboard)
//   2. Month-over-Month Comparison (Analytics enhancement)
//   3. Daily Activity Feed (New page: 'today')
//   4. Focus Mode (Distraction-free presentation view)
//   5. Notification Center (Sidebar bell badge + dropdown)
//   6. Mobile Quick Actions (Bottom nav enhancements)
// ============================================================

(function () {
    'use strict';

    // ─── Helpers ───────────────────────────────────────────────────────────────
    function getLang() { return localStorage.getItem('sp_lang') || 'ar'; }
    function getSales() { try { return JSON.parse(localStorage.getItem('salesData') || '[]'); } catch(e) { return []; } }
    function getTargets() { try { return JSON.parse(localStorage.getItem('targetData') || '[]'); } catch(e) { return []; } }
    function getCollections() { try { return JSON.parse(localStorage.getItem('payData') || '[]'); } catch(e) { return []; } }
    function getVisits() { try { return JSON.parse(localStorage.getItem('sp_visits') || '[]'); } catch(e) { return []; } }
    function getTodos() { try { return JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) { return []; } }

    function parseDate(v) {
        if (!v) return null;
        if (typeof v === 'number') {
            return new Date(Math.round((v - 25569) * 86400 * 1000));
        }
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

    function fmtNum(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return Math.round(n).toLocaleString('en-US');
    }

    function todayStr() { return new Date().toISOString().split('T')[0]; }

    // ──────────────────────────────────────────────────────────────────────────
    // FEATURE 1: KPI Smart Banner (injected after Dashboard renders)
    // ──────────────────────────────────────────────────────────────────────────
    function injectKPIBanner() {
        if (document.getElementById('sp-kpi-banner')) return;
        let M = document.getElementById('M');
        if (!M) return;

        let L = getLang();
        let S_data = getSales();
        let T_data = getTargets();
        if (S_data.length === 0 && T_data.length === 0) return;

        // Calc totals
        let totalTarget = 0, totalAchieved = 0;
        let sMap = {};
        S_data.forEach(r => {
            let c = r.Customer || '';
            let v = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
            sMap[c] = (sMap[c] || 0) + v;
        });
        T_data.forEach(r => {
            totalTarget += Number(r.Target || 0);
            totalAchieved += sMap[r.Customer || ''] || 0;
        });

        let pct = totalTarget > 0 ? Math.min((totalAchieved / totalTarget) * 100, 100) : 0;

        // Days remaining in month
        let now = new Date();
        let lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        let daysLeft = lastDay - now.getDate();

        let mood = '', moodColor = '', emoji = '';
        if (pct >= 100) { mood = L === 'ar' ? '🎉 مبروك! الهدف تحقق بالكامل!' : '🎉 Goal Achieved!'; moodColor = '#10b981'; emoji = '🏆'; }
        else if (pct >= 80) { mood = L === 'ar' ? 'ممتاز! قريب جداً من الهدف، استمر!' : 'Excellent! Almost there!'; moodColor = '#3b82f6'; emoji = '🚀'; }
        else if (pct >= 50) { mood = L === 'ar' ? 'أداء جيد، ما زال أمامك وقت!' : 'Good progress, keep going!'; moodColor = '#f59e0b'; emoji = '💪'; }
        else { mood = L === 'ar' ? 'هيا بنا! الهدف في المتناول!' : 'Let\'s go! Target is reachable!'; moodColor = '#ef4444'; emoji = '⚡'; }

        let banner = document.createElement('div');
        banner.id = 'sp-kpi-banner';
        banner.style.cssText = `
            background: linear-gradient(135deg, var(--bg2,#1e293b) 0%, var(--bg3,#0f172a) 100%);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 20px 24px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
        `;
        banner.innerHTML = `
            <div style="position:absolute;top:0;right:0;width:120px;height:120px;background:${moodColor};opacity:0.06;border-radius:50%;transform:translate(30px,-30px);"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
                <div style="flex:1;min-width:200px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                        <span style="font-size:1.8rem;">${emoji}</span>
                        <div>
                            <div style="font-size:0.75rem;color:var(--tx3,#64748b);text-transform:uppercase;letter-spacing:1px;font-weight:600;">${L === 'ar' ? 'نسبة إنجاز التارجت' : 'Target Achievement'}</div>
                            <div style="font-size:0.9rem;color:${moodColor};font-weight:700;">${mood}</div>
                        </div>
                    </div>
                    <div style="background:rgba(255,255,255,0.06);border-radius:50px;height:12px;overflow:hidden;position:relative;">
                        <div id="sp-kpi-fill" style="height:100%;width:0%;background:linear-gradient(90deg,${moodColor},${moodColor}aa);border-radius:50px;transition:width 1.2s cubic-bezier(.4,0,.2,1);"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:6px;">
                        <span style="font-size:0.75rem;color:var(--tx3,#64748b);">${fmtNum(totalAchieved)} ${L === 'ar' ? 'محقق' : 'achieved'}</span>
                        <span style="font-size:0.85rem;color:${moodColor};font-weight:800;">${pct.toFixed(1)}%</span>
                        <span style="font-size:0.75rem;color:var(--tx3,#64748b);">${fmtNum(totalTarget)} ${L === 'ar' ? 'هدف' : 'target'}</span>
                    </div>
                </div>
                <div style="text-align:center;background:rgba(255,255,255,0.04);border-radius:12px;padding:14px 20px;border:1px solid rgba(255,255,255,0.06);">
                    <div style="font-size:2rem;font-weight:900;color:var(--tx1,#f1f5f9);line-height:1;">${daysLeft}</div>
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);margin-top:4px;">${L === 'ar' ? 'يوم متبقي في الشهر' : 'days left in month'}</div>
                </div>
            </div>
        `;

        let firstCard = M.querySelector('.kg, .card');
        if (firstCard) {
            M.insertBefore(banner, firstCard);
        } else {
            M.prepend(banner);
        }

        // Animate progress bar
        requestAnimationFrame(() => {
            setTimeout(() => {
                let fill = document.getElementById('sp-kpi-fill');
                if (fill) fill.style.width = pct.toFixed(1) + '%';
            }, 200);
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // FEATURE 2: Month-over-Month Comparison in Analytics
    // ──────────────────────────────────────────────────────────────────────────
    function injectMoMComparison() {
        if (document.getElementById('sp-mom-card')) return;
        let M = document.getElementById('M');
        if (!M) return;

        let L = getLang();
        let S_data = getSales();
        if (S_data.length === 0) return;

        let now = new Date();
        let curY = now.getFullYear(), curM = now.getMonth();
        let prevY = curM === 0 ? curY - 1 : curY;
        let prevM = curM === 0 ? 11 : curM - 1;

        let curSales = 0, prevSales = 0;
        let curOrders = new Set(), prevOrders = new Set();

        S_data.forEach(r => {
            let d = parseDate(r['Invoice Date'] || r['Order Date'] || r['Date']);
            if (!d) return;
            let v = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
            if (d.getFullYear() === curY && d.getMonth() === curM) {
                curSales += v;
                if (r['Order Nbr']) curOrders.add(r['Order Nbr']);
            }
            if (d.getFullYear() === prevY && d.getMonth() === prevM) {
                prevSales += v;
                if (r['Order Nbr']) prevOrders.add(r['Order Nbr']);
            }
        });

        let salesGrowth = prevSales > 0 ? ((curSales - prevSales) / prevSales) * 100 : 0;
        let ordersGrowth = prevOrders.size > 0 ? ((curOrders.size - prevOrders.size) / prevOrders.size) * 100 : 0;

        let monthNames = {
            ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
            en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        };

        function growthBadge(pct) {
            let color = pct >= 0 ? '#10b981' : '#ef4444';
            let arrow = pct >= 0 ? '↑' : '↓';
            return `<span style="color:${color};font-weight:700;font-size:0.85rem;">${arrow} ${Math.abs(pct).toFixed(1)}%</span>`;
        }

        let card = document.createElement('div');
        card.id = 'sp-mom-card';
        card.style.cssText = `margin: 20px 0; border-radius: 16px; overflow: hidden; border: 1px solid var(--bd,rgba(255,255,255,0.08));`;
        card.innerHTML = `
            <div style="padding:16px 20px;background:var(--bg2,#1e293b);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--bd,rgba(255,255,255,0.08));">
                <h3 style="margin:0;font-size:1rem;display:flex;align-items:center;gap:8px;">
                    <span>📈</span> ${L === 'ar' ? 'مقارنة الأشهر' : 'Month Comparison'}
                </h3>
                <span style="font-size:0.75rem;color:var(--tx3,#64748b);">${monthNames[L][prevM]} vs ${monthNames[L][curM]}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;background:var(--bg,#0f172a);">
                <div style="padding:20px;border-left:1px solid var(--bd,rgba(255,255,255,0.08));">
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">${L === 'ar' ? 'مبيعات الشهر الحالي' : 'Current Month Sales'}</div>
                    <div style="font-size:1.5rem;font-weight:800;color:var(--tx1,#f1f5f9);margin-bottom:4px;">${fmtNum(curSales)}</div>
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);">vs ${fmtNum(prevSales)} ${L === 'ar' ? 'الشهر الماضي' : 'last month'}</div>
                    <div style="margin-top:8px;">${growthBadge(salesGrowth)}</div>
                </div>
                <div style="padding:20px;">
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">${L === 'ar' ? 'عدد الفواتير الحالي' : 'Current Month Orders'}</div>
                    <div style="font-size:1.5rem;font-weight:800;color:var(--tx1,#f1f5f9);margin-bottom:4px;">${curOrders.size}</div>
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);">vs ${prevOrders.size} ${L === 'ar' ? 'الشهر الماضي' : 'last month'}</div>
                    <div style="margin-top:8px;">${growthBadge(ordersGrowth)}</div>
                </div>
            </div>
        `;

        M.insertBefore(card, M.firstChild);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // FEATURE 3: Daily Activity Feed (new page 'today')
    // ──────────────────────────────────────────────────────────────────────────
    window.rToday = function () {
        let L = getLang();
        let today = todayStr();
        let S_data = getSales();
        let C_data = getCollections();
        let V_data = getVisits();
        let Todo_data = getTodos();

        // Today's sales
        let todaySales = S_data.filter(r => {
            let d = parseDate(r['Invoice Date'] || r['Order Date'] || r['Date']);
            return d && d.toISOString().split('T')[0] === today;
        });

        // Today's collections
        let todayCols = C_data.filter(r => {
            let d = parseDate(r['Date'] || r['date'] || r['Payment Date']);
            return d && d.toISOString().split('T')[0] === today;
        });

        // Today's visits
        let todayVisits = V_data.filter(v => v.date === today);

        // Completed todos
        let doneTodos = Todo_data.filter(t => t.done);

        let todaySalesTotal = 0;
        let todaySalesRows = '';
        todaySales.forEach(r => {
            let v = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
            todaySalesTotal += v;
            todaySalesRows += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div>
                        <div style="font-weight:600;font-size:0.9rem;">${r.Customer || '-'}</div>
                        <div style="font-size:0.75rem;color:var(--tx3,#64748b);">${r['Item Description'] || r['Item Class Name'] || ''}</div>
                    </div>
                    <div style="font-weight:700;color:#10b981;">${fmtNum(v)}</div>
                </div>`;
        });

        let todayColsTotal = 0;
        let todayColsRows = '';
        todayCols.forEach(r => {
            let keys = Object.keys(r);
            let getV = (names) => { let k = keys.find(k => names.some(n => k.toLowerCase().replace(/\s+/g,'') === n.toLowerCase().replace(/\s+/g,''))); return k ? r[k] : 0; };
            let v = Number((getV(['Amount','Collection']) || '0').toString().replace(/,/g,'')) || 0;
            let cust = getV(['Customer Name','Customer']) || '-';
            todayColsTotal += v;
            todayColsRows += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="font-weight:600;font-size:0.9rem;">${cust}</div>
                    <div style="font-weight:700;color:#3b82f6;">${fmtNum(v)}</div>
                </div>`;
        });

        function section(icon, titleAr, titleEn, count, total, rows, color, emptyAr, emptyEn) {
            return `
                <div style="background:var(--bg2,#1e293b);border-radius:16px;border:1px solid var(--bd,rgba(255,255,255,0.08));overflow:hidden;margin-bottom:16px;">
                    <div style="padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-size:1.4rem;">${icon}</span>
                            <span style="font-weight:700;">${L === 'ar' ? titleAr : titleEn}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                            ${total > 0 ? `<span style="font-weight:800;color:${color};">${fmtNum(total)}</span>` : ''}
                            <span style="background:${color}22;color:${color};border-radius:20px;padding:2px 10px;font-size:0.75rem;font-weight:700;">${count}</span>
                        </div>
                    </div>
                    <div style="padding:4px 20px 8px;">
                        ${rows || `<div style="text-align:center;padding:20px;color:var(--tx3,#64748b);font-size:0.85rem;">${L === 'ar' ? emptyAr : emptyEn}</div>`}
                    </div>
                </div>`;
        }

        let visitRows = '';
        todayVisits.forEach(v => {
            visitRows += `
                <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div>
                        <div style="font-weight:600;font-size:0.9rem;">${v.customer || '-'}</div>
                        <div style="font-size:0.75rem;color:var(--tx3,#64748b);margin-top:2px;">${v.outcome || ''}</div>
                    </div>
                    ${v.nextDate ? `<div style="font-size:0.75rem;background:rgba(245,158,11,0.15);color:#f59e0b;padding:3px 8px;border-radius:6px;">${v.nextDate}</div>` : ''}
                </div>`;
        });

        let todoRows = '';
        doneTodos.slice(0, 5).forEach(t => {
            todoRows += `
                <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <span style="color:#10b981;font-size:1rem;">✓</span>
                    <span style="font-size:0.9rem;text-decoration:line-through;color:var(--tx3,#64748b);">${t.text || t.title || t.task || ''}</span>
                </div>`;
        });

        let M = document.getElementById('M');
        if (!M) return;
        M.innerHTML = `
            <div class="ph" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
                <h1 style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:1.6rem;">📅</span>
                    ${L === 'ar' ? 'سجل اليوم' : 'Daily Feed'}
                </h1>
                <div style="font-size:0.85rem;color:var(--tx3,#64748b);background:var(--bg2,#1e293b);padding:8px 16px;border-radius:10px;border:1px solid var(--bd,rgba(255,255,255,0.08));">
                    ${new Date().toLocaleDateString(L === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:16px 0;">
                <div style="background:var(--bg2,#1e293b);border-radius:12px;padding:16px;border:1px solid rgba(16,185,129,0.2);text-align:center;">
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);text-transform:uppercase;letter-spacing:1px;">${L === 'ar' ? 'مبيعات اليوم' : "Today's Sales"}</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#10b981;margin-top:4px;">${fmtNum(todaySalesTotal)}</div>
                    <div style="font-size:0.75rem;color:var(--tx3,#64748b);">${todaySales.length} ${L === 'ar' ? 'فاتورة' : 'invoices'}</div>
                </div>
                <div style="background:var(--bg2,#1e293b);border-radius:12px;padding:16px;border:1px solid rgba(59,130,246,0.2);text-align:center;">
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);text-transform:uppercase;letter-spacing:1px;">${L === 'ar' ? 'تحصيلات اليوم' : "Today's Collections"}</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#3b82f6;margin-top:4px;">${fmtNum(todayColsTotal)}</div>
                    <div style="font-size:0.75rem;color:var(--tx3,#64748b);">${todayCols.length} ${L === 'ar' ? 'دفعة' : 'payments'}</div>
                </div>
                <div style="background:var(--bg2,#1e293b);border-radius:12px;padding:16px;border:1px solid rgba(245,158,11,0.2);text-align:center;">
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);text-transform:uppercase;letter-spacing:1px;">${L === 'ar' ? 'زيارات اليوم' : "Today's Visits"}</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#f59e0b;margin-top:4px;">${todayVisits.length}</div>
                    <div style="font-size:0.75rem;color:var(--tx3,#64748b);">${L === 'ar' ? 'زيارة' : 'visits'}</div>
                </div>
                <div style="background:var(--bg2,#1e293b);border-radius:12px;padding:16px;border:1px solid rgba(139,92,246,0.2);text-align:center;">
                    <div style="font-size:0.7rem;color:var(--tx3,#64748b);text-transform:uppercase;letter-spacing:1px;">${L === 'ar' ? 'مهام منجزة' : 'Done Tasks'}</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#8b5cf6;margin-top:4px;">${doneTodos.length}</div>
                    <div style="font-size:0.75rem;color:var(--tx3,#64748b);">${L === 'ar' ? 'مهمة' : 'tasks'}</div>
                </div>
            </div>

            ${section('🧾', 'فواتير اليوم', "Today's Invoices", todaySales.length, todaySalesTotal, todaySalesRows, '#10b981', 'لا توجد مبيعات مسجلة اليوم', 'No sales recorded today')}
            ${section('💰', 'تحصيلات اليوم', "Today's Collections", todayCols.length, todayColsTotal, todayColsRows, '#3b82f6', 'لا توجد تحصيلات اليوم', 'No collections today')}
            ${section('🚗', 'زيارات اليوم', "Today's Visits", todayVisits.length, 0, visitRows, '#f59e0b', 'لا توجد زيارات مسجلة اليوم', 'No visits today')}
            ${doneTodos.length > 0 ? section('✅', 'مهام مكتملة', 'Completed Tasks', doneTodos.length, 0, todoRows, '#8b5cf6', '', '') : ''}
        `;
    };

    // ──────────────────────────────────────────────────────────────────────────
    // FEATURE 4: Focus Mode
    // ──────────────────────────────────────────────────────────────────────────
    (function initFocusMode() {
        // Inject CSS
        let style = document.createElement('style');
        style.id = 'sp-focus-mode-css';
        style.innerHTML = `
            body.sp-focus .sidebar { transform: translateX(100%) !important; opacity: 0 !important; pointer-events: none !important; }
            body.en.sp-focus .sidebar { transform: translateX(-100%) !important; }
            body.sp-focus .mw { padding-right: 24px !important; padding-left: 24px !important; }
            body.sp-focus .bnav { display: none !important; }
            #sp-focus-btn { transition: all 0.2s; }
            #sp-focus-btn:hover { transform: scale(1.05); }
            #sp-focus-overlay {
                position: fixed; inset: 0; z-index: 9998;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(20px);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                gap: 24px; opacity: 0;
                pointer-events: none;
                transition: opacity 0.4s;
            }
            #sp-focus-overlay.active { opacity: 1; pointer-events: all; }
            .sp-focus-kpi {
                text-align: center;
                animation: spFocusPop 0.5s cubic-bezier(.4,0,.2,1) both;
            }
            @keyframes spFocusPop { from { transform: scale(0.8); opacity:0; } to { transform: scale(1); opacity:1; } }
        `;
        document.head.appendChild(style);

        // Add focus button to sidebar top bar
        function addFocusBtn() {
            let sbb = document.querySelector('.sbb');
            if (!sbb || document.getElementById('sp-focus-btn')) return;
            let btn = document.createElement('button');
            btn.id = 'sp-focus-btn';
            btn.title = 'Focus Mode';
            btn.innerHTML = '⏱️';
            btn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:1rem;padding:4px;border-radius:6px;';
            sbb.insertBefore(btn, sbb.firstChild);
            btn.onclick = toggleFocusMode;
        }

        window.toggleFocusMode = function () {
            let overlay = document.getElementById('sp-focus-overlay');
            if (overlay && overlay.classList.contains('active')) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 400);
                document.getElementById('sp-focus-btn').innerHTML = '⏱️';
                document.getElementById('sp-focus-btn').title = 'Focus Mode';
                return;
            }

            let L = getLang();
            let S_data = getSales();
            let T_data = getTargets();
            let sMap = {};
            S_data.forEach(r => {
                let v = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
                sMap[r.Customer || ''] = (sMap[r.Customer || ''] || 0) + v;
            });
            let totalTarget = 0, totalAchieved = 0;
            T_data.forEach(r => { totalTarget += Number(r.Target || 0); totalAchieved += sMap[r.Customer || ''] || 0; });
            let totalSales = 0;
            S_data.forEach(r => { totalSales += typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0); });
            let pct = totalTarget > 0 ? Math.min((totalAchieved / totalTarget) * 100, 100) : 0;

            let ov = document.createElement('div');
            ov.id = 'sp-focus-overlay';
            ov.innerHTML = `
                <button onclick="window.toggleFocusMode()" style="position:absolute;top:24px;right:24px;background:rgba(255,255,255,0.1);border:none;color:white;cursor:pointer;font-size:1.5rem;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;">✕</button>
                <div style="font-size:0.8rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:2px;">${new Date().toLocaleDateString(L === 'ar' ? 'ar-EG' : 'en-US', {weekday:'long', month:'long', day:'numeric'})}</div>
                <div class="sp-focus-kpi">
                    <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">${L === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</div>
                    <div style="font-size:clamp(3rem,8vw,6rem);font-weight:900;color:white;line-height:1;">${fmtNum(totalSales)}</div>
                </div>
                <div class="sp-focus-kpi" style="animation-delay:0.1s;">
                    <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">${L === 'ar' ? 'نسبة إنجاز التارجت' : 'Target Achievement'}</div>
                    <div style="background:rgba(255,255,255,0.1);border-radius:50px;height:16px;width:min(400px,80vw);overflow:hidden;">
                        <div style="height:100%;width:${pct.toFixed(1)}%;background:linear-gradient(90deg,#10b981,#3b82f6);border-radius:50px;transition:width 1.5s;"></div>
                    </div>
                    <div style="font-size:2rem;font-weight:800;color:#10b981;margin-top:10px;">${pct.toFixed(1)}%</div>
                </div>
            `;
            document.body.appendChild(ov);
            requestAnimationFrame(() => ov.classList.add('active'));
            document.getElementById('sp-focus-btn').innerHTML = '✕';
        };

        // Try to add button now and after renders
        setTimeout(addFocusBtn, 1000);
        let origBuildNav = window.buildNav;
        window.buildNav = function () {
            if (origBuildNav) origBuildNav();
            setTimeout(addFocusBtn, 100);
        };
    })();

    // ──────────────────────────────────────────────────────────────────────────
    // FEATURE 5: Notification Center
    // ──────────────────────────────────────────────────────────────────────────
    (function initNotificationCenter() {
        let styleEl = document.createElement('style');
        styleEl.innerHTML = `
            #sp-notif-btn { position: relative; background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 6px; transition: all 0.2s; }
            #sp-notif-btn:hover { background: rgba(255,255,255,0.08); transform: scale(1.1); }
            #sp-notif-badge { position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg,#0f172a); animation: spBadgePop 0.3s cubic-bezier(.4,0,.2,1); }
            @keyframes spBadgePop { from { transform: scale(0); } to { transform: scale(1); } }
            #sp-notif-dropdown {
                position: fixed; top: 56px; right: 12px; width: 320px; max-height: 420px;
                background: var(--bg2,#1e293b); border-radius: 16px; border: 1px solid var(--bd,rgba(255,255,255,0.1));
                box-shadow: 0 20px 60px rgba(0,0,0,0.5); overflow-y: auto;
                z-index: 9997; opacity: 0; transform: translateY(-8px) scale(0.97);
                pointer-events: none; transition: all 0.2s cubic-bezier(.4,0,.2,1);
            }
            body.en #sp-notif-dropdown { right: auto; left: 12px; }
            #sp-notif-dropdown.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
            .sp-notif-item { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.15s; }
            .sp-notif-item:hover { background: rgba(255,255,255,0.04); }
            .sp-notif-item:last-child { border-bottom: none; }
        `;
        document.head.appendChild(styleEl);

        function calcNotifications() {
            let notifs = [];
            let L = getLang();
            let S_data = getSales();
            let T_data = getTargets();
            let Todo_data = getTodos();

            // 1. Dormant customers (30+ days)
            let latestByCustomer = {};
            S_data.forEach(r => {
                let d = parseDate(r['Invoice Date'] || r['Order Date'] || r['Date']);
                let c = r.Customer;
                if (d && c) {
                    if (!latestByCustomer[c] || d > latestByCustomer[c]) latestByCustomer[c] = d;
                }
            });
            let dormantCount = 0;
            let today = new Date();
            Object.values(latestByCustomer).forEach(d => {
                if (Math.floor((today - d) / 86400000) >= 30) dormantCount++;
            });
            if (dormantCount > 0) {
                notifs.push({ icon: '💤', color: '#ef4444', text: L === 'ar' ? `${dormantCount} عميل خامل منذ 30+ يوم` : `${dormantCount} customers dormant 30+ days`, page: 'dormant' });
            }

            // 2. Customers near target (90%+)
            let sMap = {};
            S_data.forEach(r => { let c = r.Customer || ''; let v = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0); sMap[c] = (sMap[c] || 0) + v; });
            let nearCount = 0, overCount = 0;
            T_data.forEach(r => {
                let tg = Number(r.Target || 0);
                let ach = sMap[r.Customer || ''] || 0;
                let p = tg > 0 ? ach / tg * 100 : 0;
                if (p >= 100) overCount++;
                else if (p >= 90) nearCount++;
            });
            if (overCount > 0) notifs.push({ icon: '🏆', color: '#10b981', text: L === 'ar' ? `${overCount} عميل حقق التارجت 100%!` : `${overCount} customers hit 100% target!`, page: 'targets' });
            if (nearCount > 0) notifs.push({ icon: '🎯', color: '#3b82f6', text: L === 'ar' ? `${nearCount} عملاء قريبون من الهدف (90%+)` : `${nearCount} customers near target (90%+)`, page: 'targets' });

            // 3. Overdue todos
            let overdueTodos = Todo_data.filter(t => !t.done && t.dueDate && new Date(t.dueDate) < today);
            if (overdueTodos.length > 0) notifs.push({ icon: '📋', color: '#f59e0b', text: L === 'ar' ? `${overdueTodos.length} مهمة متأخرة` : `${overdueTodos.length} overdue tasks`, page: 'todo' });

            // 4. Today's activity summary
            let todaySales = S_data.filter(r => { let d = parseDate(r['Invoice Date'] || r['Order Date'] || r['Date']); return d && d.toISOString().split('T')[0] === todayStr(); });
            if (todaySales.length > 0) notifs.push({ icon: '🧾', color: '#8b5cf6', text: L === 'ar' ? `${todaySales.length} فاتورة مسجلة اليوم` : `${todaySales.length} invoices today`, page: 'today' });

            return notifs;
        }

        function addNotifBtn() {
            let sbb = document.querySelector('.sbb');
            if (!sbb || document.getElementById('sp-notif-btn')) return;

            let notifs = calcNotifications();
            let btn = document.createElement('button');
            btn.id = 'sp-notif-btn';
            btn.title = 'Notifications';
            btn.innerHTML = `🔔${notifs.length > 0 ? `<span id="sp-notif-badge">${notifs.length > 9 ? '9+' : notifs.length}</span>` : ''}`;
            sbb.insertBefore(btn, sbb.firstChild);

            // Dropdown
            let dd = document.createElement('div');
            dd.id = 'sp-notif-dropdown';
            let L = getLang();
            dd.innerHTML = `
                <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-weight:700;font-size:0.95rem;">🔔 ${L === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
                    <span style="font-size:0.75rem;color:var(--tx3,#64748b);">${notifs.length} ${L === 'ar' ? 'إشعار' : 'alerts'}</span>
                </div>
                ${notifs.length === 0
                    ? `<div style="text-align:center;padding:30px;color:var(--tx3,#64748b);">✅ ${L === 'ar' ? 'كل شيء على ما يرام!' : 'All clear!'}</div>`
                    : notifs.map(n => `
                        <div class="sp-notif-item" onclick="if(typeof window.nav==='function') window.nav('${n.page}'); else { window.P='${n.page}'; if(typeof buildNav==='function') buildNav(); if(typeof render==='function') render(); } document.getElementById('sp-notif-dropdown').classList.remove('open');">
                            <div style="display:flex;align-items:flex-start;gap:12px;">
                                <span style="font-size:1.3rem;line-height:1;">${n.icon}</span>
                                <div>
                                    <div style="font-size:0.85rem;font-weight:500;color:var(--tx1,#f1f5f9);">${n.text}</div>
                                    <div style="font-size:0.7rem;color:${n.color};margin-top:3px;">${L === 'ar' ? 'اضغط للعرض' : 'Tap to view'} →</div>
                                </div>
                            </div>
                        </div>`).join('')
                }
            `;
            document.body.appendChild(dd);

            btn.onclick = (e) => {
                e.stopPropagation();
                dd.classList.toggle('open');
            };
            document.addEventListener('click', () => dd.classList.remove('open'));
        }

        setTimeout(addNotifBtn, 1200);
        let origBuildNavNotif = window.buildNav;
        window.buildNav = function () {
            if (origBuildNavNotif) origBuildNavNotif();
            setTimeout(() => {
                let existing = document.getElementById('sp-notif-btn');
                if (existing) existing.remove();
                let existingDd = document.getElementById('sp-notif-dropdown');
                if (existingDd) existingDd.remove();
                addNotifBtn();
            }, 150);
        };
    })();

    // ──────────────────────────────────────────────────────────────────────────
    // FEATURE 6: Mobile Quick Actions (FAB + Bottom Nav enhancement)
    // ──────────────────────────────────────────────────────────────────────────
    (function initMobileQuickActions() {
        let style = document.createElement('style');
        style.innerHTML = `
            #sp-fab {
                position: fixed; bottom: 80px; left: 20px;
                z-index: 999;
                display: none;
            }
            body.en #sp-fab { left: auto; right: 20px; }
            @media (max-width: 900px) { #sp-fab { display: block; } }
            #sp-fab-main {
                width: 54px; height: 54px; border-radius: 50%;
                background: var(--am, #5046e5); color: white;
                border: none; font-size: 1.5rem; cursor: pointer;
                box-shadow: 0 4px 20px rgba(80,70,229,0.4);
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s; position: relative; z-index: 2;
            }
            #sp-fab-main:hover { transform: scale(1.08); }
            #sp-fab-main.open { transform: rotate(45deg); background: #ef4444; }
            #sp-fab-actions {
                position: absolute; bottom: 60px; left: 0;
                display: flex; flex-direction: column; gap: 8px; align-items: center;
                opacity: 0; pointer-events: none;
                transition: all 0.3s cubic-bezier(.4,0,.2,1);
                transform: translateY(10px);
            }
            #sp-fab-actions.open { opacity: 1; pointer-events: all; transform: translateY(0); }
            .sp-fab-action {
                background: var(--bg2, #1e293b); border: 1px solid var(--bd, rgba(255,255,255,0.1));
                border-radius: 12px; padding: 10px 14px;
                display: flex; align-items: center; gap: 8px; cursor: pointer;
                box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                white-space: nowrap; font-size: 0.85rem; font-weight: 600;
                color: var(--tx1, #f1f5f9); transition: all 0.15s;
            }
            .sp-fab-action:hover { background: var(--am, #5046e5); color: white; }
        `;
        document.head.appendChild(style);

        function addFAB() {
            if (document.getElementById('sp-fab')) return;
            let L = getLang();
            let fab = document.createElement('div');
            fab.id = 'sp-fab';
            fab.innerHTML = `
                <div id="sp-fab-actions">
                    <div class="sp-fab-action" onclick="closeFAB();if(typeof addVisitModal==='function')addVisitModal();">
                        <span>🚗</span> <span>${L === 'ar' ? 'زيارة جديدة' : 'New Visit'}</span>
                    </div>
                    <div class="sp-fab-action" onclick="closeFAB();window.P='today';if(typeof buildNav==='function')buildNav();if(typeof render==='function')render();if(typeof rToday==='function')rToday();">
                        <span>📅</span> <span>${L === 'ar' ? 'سجل اليوم' : 'Daily Feed'}</span>
                    </div>
                    <div class="sp-fab-action" onclick="closeFAB();window.P='alerts';if(typeof buildNav==='function')buildNav();if(typeof render==='function')render();">
                        <span>🔔</span> <span>${L === 'ar' ? 'التنبيهات' : 'Alerts'}</span>
                    </div>
                </div>
                <button id="sp-fab-main" onclick="toggleFAB()">＋</button>
            `;
            document.body.appendChild(fab);
        }

        window.toggleFAB = function () {
            let main = document.getElementById('sp-fab-main');
            let actions = document.getElementById('sp-fab-actions');
            if (!main || !actions) return;
            main.classList.toggle('open');
            actions.classList.toggle('open');
        };

        window.closeFAB = function () {
            let main = document.getElementById('sp-fab-main');
            let actions = document.getElementById('sp-fab-actions');
            if (main) main.classList.remove('open');
            if (actions) actions.classList.remove('open');
        };

        setTimeout(addFAB, 1500);
    })();

    // ──────────────────────────────────────────────────────────────────────────
    // Hook into existing render cycle
    // ──────────────────────────────────────────────────────────────────────────
    (function hookRender() {
        // Add 'today' page to NAV
        function addTodayNav() {
            if (typeof NAV !== 'undefined' && !NAV.find(n => n.p === 'today')) {
                let dashIdx = NAV.findIndex(n => n.p === 'dash');
                if (dashIdx > -1) {
                    NAV.splice(dashIdx + 1, 0, { p: 'today', ic: '📅' });
                }
            }
        }
        addTodayNav();

        // Extend render to support 'today' page and inject KPI banner on dash
        let origRender = window.render;
        window.render = function () {
            if (typeof P !== 'undefined') {
                if (P === 'today') {
                    if (typeof buildNav === 'function') buildNav();
                    window.rToday();
                    return;
                }
            }
            if (origRender) origRender();
            // Inject KPI Banner after dashboard renders
            if (typeof P !== 'undefined' && P === 'dash') {
                setTimeout(injectKPIBanner, 300);
            }
            // Inject MoM on analytics
            if (typeof P !== 'undefined' && P === 'analytics') {
                setTimeout(injectMoMComparison, 300);
            }
        };

        // Extend buildNav to label 'today'
        let origBN = window.buildNav;
        window.buildNav = function () {
            if (origBN) origBN();
            setTimeout(() => {
                let L = getLang();
                let el = document.querySelector('.ni[data-p="today"] span:nth-child(2)');
                if (el) el.textContent = L === 'ar' ? 'سجل اليوم' : 'Daily Feed';
            }, 60);
        };
    })();

})();
