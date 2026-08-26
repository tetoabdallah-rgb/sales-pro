// ============================================================
// customer_reports.js — Sales Pro Professional Customer PDF Reports
// Adds "Print Report" button to Targets & Customers pages.
// Uses pdfmake (already loaded in index.html).
// Safe injection — no existing code modified.
// ============================================================

(function () {
    'use strict';

    // ─── Helpers ───────────────────────────────────────────────────────────────
    function getLang() { return localStorage.getItem('sp_lang') || 'ar'; }

    function getSalesData() {
        try { return JSON.parse(localStorage.getItem('salesData') || '[]'); } catch(e) { return []; }
    }

    function getTargetData() {
        try { return JSON.parse(localStorage.getItem('targetData') || '[]'); } catch(e) { return []; }
    }

    function getCollectionsData() {
        try { return JSON.parse(localStorage.getItem('payData') || '[]'); } catch(e) { return []; }
    }

    function getVisitsData() {
        try { return JSON.parse(localStorage.getItem('sp_visits') || '[]'); } catch(e) { return []; }
    }

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

    function fmtN(n) { return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }); }

    function fmtDate(d) {
        if (!d) return '-';
        let dt = parseDate(d);
        if (!dt) return String(d);
        return dt.toLocaleDateString('en-GB');
    }

    // ─── Core Report Generator ─────────────────────────────────────────────────
    window.generateCustomerReport = function (customerName) {
        if (typeof pdfMake === 'undefined') {
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }

        let L = getLang();
        let S_data = getSalesData();
        let T_data = getTargetData();
        let C_data = getCollectionsData();
        let V_data = getVisitsData();

        // Filter data for this customer
        let custSales = S_data.filter(r => r.Customer === customerName);
        let custTarget = T_data.find(r => r.Customer === customerName) || {};
        let custVisits = V_data.filter(v => v.customer === customerName);

        // Calculate collections
        let custColTotal = 0;
        C_data.forEach(r => {
            let keys = Object.keys(r);
            let getV = (names) => { let k = keys.find(k => names.some(n => k.toLowerCase().replace(/\s+/g,'') === n.toLowerCase().replace(/\s+/g,''))); return k ? r[k] : null; };
            let cName = getV(['Customer Name','Customer']) || '';
            if (cName === customerName) {
                let rawVal = getV(['Amount','Collection']) || 0;
                custColTotal += Number(rawVal.toString().replace(/,/g,'')) || 0;
            }
        });

        // Totals
        let totalSales = 0, totalProfit = 0;
        custSales.forEach(r => {
            totalSales += typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
            totalProfit += typeof getProfitVal === 'function' ? getProfitVal(r) : Number(r['Profit'] || 0);
        });

        let target = Number(custTarget.Target || 0);
        let pctTarget = target > 0 ? Math.min((totalSales / target) * 100, 100) : 0;
        let due = Math.max(0, totalSales - custColTotal);
        let margin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
        let reportDate = new Date().toLocaleDateString(L === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

        // Last 10 invoices
        let recentSales = [...custSales]
            .sort((a, b) => {
                let da = parseDate(a['Invoice Date'] || a['Order Date'] || a['Date']);
                let db = parseDate(b['Invoice Date'] || b['Order Date'] || b['Date']);
                return (db || 0) - (da || 0);
            })
            .slice(0, 10);

        // Category breakdown
        let catMap = {};
        custSales.forEach(r => {
            let cat = r['Item Class Name'] || (L === 'ar' ? 'أخرى' : 'Other');
            let v = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
            catMap[cat] = (catMap[cat] || 0) + v;
        });
        let catEntries = Object.entries(catMap).sort((a,b) => b[1]-a[1]).slice(0, 8);

        // Status color
        let statusColor = pctTarget >= 100 ? '#10b981' : pctTarget >= 60 ? '#3b82f6' : '#ef4444';
        let statusText = pctTarget >= 100 ? (L === 'ar' ? 'حقق الهدف ✓' : 'Target Met ✓') :
                         pctTarget >= 60 ? (L === 'ar' ? 'تقدم جيد' : 'Good Progress') :
                         (L === 'ar' ? 'يحتاج متابعة' : 'Needs Follow-up');

        // ─── pdfmake document definition ──────────────────────────────────────
        let dd = {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [40, 60, 40, 60],
            info: { title: `${customerName} - ${L === 'ar' ? 'تقرير العميل' : 'Customer Report'}` },
            content: [
                // Header
                {
                    columns: [
                        {
                            stack: [
                                { text: 'SALES PRO', style: 'brand', color: '#5046e5' },
                                { text: L === 'ar' ? 'تقرير عميل احترافي' : 'Professional Customer Report', style: 'brandSub', color: '#64748b' },
                            ]
                        },
                        {
                            stack: [
                                { text: reportDate, style: 'headerDate', alignment: 'right', color: '#64748b' },
                                { text: L === 'ar' ? 'سري وخاص' : 'Confidential', style: 'headerDate', alignment: 'right', color: '#ef4444' },
                            ]
                        }
                    ],
                    margin: [0, 0, 0, 16]
                },

                // Divider
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#5046e5' }], margin: [0, 0, 0, 20] },

                // Customer Name Banner
                {
                    fillColor: '#0f172a',
                    table: { widths: ['*'], body: [[{
                        stack: [
                            { text: customerName, style: 'customerName', alignment: 'center', color: '#f1f5f9' },
                            { text: statusText, style: 'statusBadge', alignment: 'center', color: statusColor },
                        ],
                        fillColor: '#0f172a', border: [false,false,false,false], margin: [0, 16, 0, 16]
                    }]] },
                    margin: [0, 0, 0, 20]
                },

                // KPI Cards (4 columns)
                {
                    columns: [
                        kpiCard(L === 'ar' ? 'إجمالي المبيعات' : 'Total Sales', fmtN(totalSales), '#10b981'),
                        kpiCard(L === 'ar' ? 'نسبة التارجت' : 'Target %', pctTarget.toFixed(1) + '%', statusColor),
                        kpiCard(L === 'ar' ? 'صافي الربح' : 'Net Profit', fmtN(totalProfit), '#8b5cf6'),
                        kpiCard(L === 'ar' ? 'المتبقي للتحصيل' : 'Outstanding', fmtN(due), due > 0 ? '#ef4444' : '#10b981'),
                    ],
                    columnGap: 8,
                    margin: [0, 0, 0, 20]
                },

                // Target Progress Section
                {
                    table: {
                        widths: ['*'],
                        body: [[{
                            stack: [
                                { text: L === 'ar' ? 'تقدم التارجت' : 'Target Progress', style: 'sectionTitle' },
                                {
                                    table: {
                                        widths: ['*'],
                                        body: [[{
                                            canvas: [{
                                                type: 'rect', x: 0, y: 0, w: 475, h: 14, r: 7, color: '#1e293b'
                                            }, {
                                                type: 'rect', x: 0, y: 0, w: Math.max(14, 475 * pctTarget / 100), h: 14, r: 7, color: statusColor
                                            }],
                                            border: [false,false,false,false]
                                        }]]
                                    },
                                    margin: [0, 6, 0, 8]
                                },
                                {
                                    columns: [
                                        { text: `${L === 'ar' ? 'المحقق' : 'Achieved'}: ${fmtN(totalSales)}`, color: '#64748b', fontSize: 9 },
                                        { text: `${pctTarget.toFixed(1)}%`, alignment: 'center', color: statusColor, bold: true, fontSize: 11 },
                                        { text: `${L === 'ar' ? 'الهدف' : 'Target'}: ${fmtN(target)}`, alignment: 'right', color: '#64748b', fontSize: 9 },
                                    ]
                                }
                            ],
                            fillColor: '#0f172a', border: [false,false,false,false],
                            margin: [16, 12, 16, 12]
                        }]]
                    },
                    margin: [0, 0, 0, 20]
                },

                // Summary stats row
                {
                    columns: [
                        {
                            stack: [
                                { text: L === 'ar' ? 'ملخص إضافي' : 'Summary', style: 'sectionTitle' },
                                {
                                    table: {
                                        widths: ['*', '*'],
                                        body: [
                                            [summaryCell(L === 'ar' ? 'عدد الفواتير' : 'Invoices', custSales.length), summaryCell(L === 'ar' ? 'متوسط الفاتورة' : 'Avg Invoice', fmtN(custSales.length > 0 ? totalSales/custSales.length : 0))],
                                            [summaryCell(L === 'ar' ? 'إجمالي التحصيل' : 'Collections', fmtN(custColTotal)), summaryCell(L === 'ar' ? 'هامش الربح' : 'Margin', margin.toFixed(1) + '%')],
                                            [summaryCell(L === 'ar' ? 'عدد الزيارات' : 'Visits', custVisits.length), summaryCell(L === 'ar' ? 'متبقي' : 'Outstanding Due', fmtN(due))],
                                        ]
                                    },
                                    layout: { hLineColor: () => '#1e293b', vLineColor: () => '#1e293b', hLineWidth: () => 1, vLineWidth: () => 1 }
                                }
                            ]
                        }
                    ],
                    margin: [0, 0, 0, 20]
                },

                // Category breakdown
                catEntries.length > 0 ? [
                    { text: L === 'ar' ? 'توزيع المبيعات حسب الفئة' : 'Sales by Category', style: 'sectionTitle' },
                    {
                        table: {
                            widths: ['*', 80, 60],
                            headerRows: 1,
                            body: [
                                [
                                    { text: L === 'ar' ? 'الفئة' : 'Category', style: 'tableHeader' },
                                    { text: L === 'ar' ? 'المبيعات' : 'Sales', style: 'tableHeader', alignment: 'right' },
                                    { text: '%', style: 'tableHeader', alignment: 'right' },
                                ],
                                ...catEntries.map(([cat, val]) => [
                                    { text: cat, fontSize: 9, color: '#e2e8f0' },
                                    { text: fmtN(val), fontSize: 9, alignment: 'right', color: '#10b981', bold: true },
                                    { text: totalSales > 0 ? (val/totalSales*100).toFixed(1) + '%' : '0%', fontSize: 9, alignment: 'right', color: '#64748b' },
                                ])
                            ]
                        },
                        layout: { hLineColor: () => '#1e293b', vLineColor: () => '#1e293b', hLineWidth: () => 1, vLineWidth: () => 1, fillColor: (i) => i === 0 ? '#1e293b' : (i % 2 === 0 ? '#0f172a' : 'transparent') },
                        margin: [0, 0, 0, 20]
                    }
                ] : [],

                // Recent invoices table
                recentSales.length > 0 ? [
                    { text: L === 'ar' ? 'آخر 10 فواتير' : 'Last 10 Invoices', style: 'sectionTitle' },
                    {
                        table: {
                            widths: [60, '*', 80, 70],
                            headerRows: 1,
                            body: [
                                [
                                    { text: L === 'ar' ? 'التاريخ' : 'Date', style: 'tableHeader' },
                                    { text: L === 'ar' ? 'المنتج' : 'Product', style: 'tableHeader' },
                                    { text: L === 'ar' ? 'المبيعات' : 'Sales', style: 'tableHeader', alignment: 'right' },
                                    { text: L === 'ar' ? 'الربح' : 'Profit', style: 'tableHeader', alignment: 'right' },
                                ],
                                ...recentSales.map(r => {
                                    let sv = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
                                    let pv = typeof getProfitVal === 'function' ? getProfitVal(r) : Number(r['Profit'] || 0);
                                    return [
                                        { text: fmtDate(r['Invoice Date'] || r['Order Date'] || r['Date']), fontSize: 8, color: '#94a3b8' },
                                        { text: (r['Item Description'] || r['Item Class Name'] || '-').slice(0, 40), fontSize: 8, color: '#e2e8f0' },
                                        { text: fmtN(sv), fontSize: 8, alignment: 'right', color: '#10b981', bold: true },
                                        { text: fmtN(pv), fontSize: 8, alignment: 'right', color: '#8b5cf6' },
                                    ];
                                })
                            ]
                        },
                        layout: { hLineColor: () => '#1e293b', vLineColor: () => '#1e293b', hLineWidth: () => 1, vLineWidth: () => 1, fillColor: (i) => i === 0 ? '#1e293b' : (i % 2 === 0 ? '#0f172a' : 'transparent') },
                        margin: [0, 0, 0, 20]
                    }
                ] : [],

                // Visits
                custVisits.length > 0 ? [
                    { text: L === 'ar' ? 'سجل الزيارات' : 'Visit History', style: 'sectionTitle' },
                    {
                        table: {
                            widths: [60, '*', 70],
                            headerRows: 1,
                            body: [
                                [
                                    { text: L === 'ar' ? 'التاريخ' : 'Date', style: 'tableHeader' },
                                    { text: L === 'ar' ? 'الملاحظات' : 'Notes', style: 'tableHeader' },
                                    { text: L === 'ar' ? 'الزيارة القادمة' : 'Next Visit', style: 'tableHeader' },
                                ],
                                ...custVisits.slice(0, 5).map(v => [
                                    { text: v.date || '-', fontSize: 8, color: '#94a3b8' },
                                    { text: (v.outcome || '-').slice(0, 60), fontSize: 8, color: '#e2e8f0' },
                                    { text: v.nextDate || '-', fontSize: 8, color: '#f59e0b' },
                                ])
                            ]
                        },
                        layout: { hLineColor: () => '#1e293b', vLineColor: () => '#1e293b', hLineWidth: () => 1, vLineWidth: () => 1, fillColor: (i) => i === 0 ? '#1e293b' : 'transparent' },
                        margin: [0, 0, 0, 20]
                    }
                ] : [],

                // Footer
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#1e293b' }], margin: [0, 10, 0, 8] },
                {
                    columns: [
                        { text: `Sales Pro Enterprise — ${L === 'ar' ? 'تم إنشاؤه بتاريخ' : 'Generated'} ${reportDate}`, color: '#64748b', fontSize: 8 },
                        { text: L === 'ar' ? 'تقرير سري — لا يُشارك' : 'Confidential — Do not distribute', alignment: 'right', color: '#64748b', fontSize: 8 }
                    ]
                }
            ],

            styles: {
                brand: { fontSize: 22, bold: true, letterSpacing: 3 },
                brandSub: { fontSize: 9, letterSpacing: 1 },
                headerDate: { fontSize: 9 },
                customerName: { fontSize: 22, bold: true, margin: [0, 4, 0, 4] },
                statusBadge: { fontSize: 11, bold: true },
                sectionTitle: { fontSize: 11, bold: true, color: '#94a3b8', margin: [0, 0, 0, 8], letterSpacing: 1 },
                tableHeader: { fontSize: 8, bold: true, color: '#94a3b8', fillColor: '#1e293b' },
                kpiLabel: { fontSize: 7.5, color: '#64748b', margin: [0, 0, 0, 2] },
                kpiValue: { fontSize: 14, bold: true },
            },

            background: { canvas: [{ type: 'rect', x: 0, y: 0, w: 595, h: 842, color: '#030712' }] },
            defaultStyle: { font: 'Roboto', fontSize: 10, color: '#f1f5f9', lineHeight: 1.4 }
        };

        let filename = `${customerName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        pdfMake.createPdf(dd).download(filename);
        if (typeof toast === 'function') toast(getLang() === 'ar' ? `تم تصدير تقرير ${customerName}` : `Report exported for ${customerName}`, 'success');
    };

    // ─── Helper builders ───────────────────────────────────────────────────────
    function kpiCard(label, value, color) {
        return {
            stack: [
                { text: label, fontSize: 7, color: '#64748b', bold: true, margin: [0, 0, 0, 4] },
                { text: value, fontSize: 13, bold: true, color: color },
            ],
            fillColor: '#0f172a',
            border: [false, false, false, false],
            margin: [10, 10, 10, 10],
            style: 'kpiCard'
        };
    }

    function summaryCell(label, value) {
        return {
            stack: [
                { text: label, fontSize: 7.5, color: '#64748b' },
                { text: value, fontSize: 10, bold: true, color: '#f1f5f9', margin: [0, 2, 0, 0] }
            ],
            fillColor: '#0f172a',
            border: [false, false, false, false],
            margin: [8, 8, 8, 8]
        };
    }

    // ─── Inject "Print Report" button into Targets page ────────────────────────
    function injectPrintButtonsTargets() {
        let rows = document.querySelectorAll('#ttb tr');
        rows.forEach(tr => {
            if (tr.querySelector('.sp-pdf-btn')) return;
            let editBtn = tr.querySelector('button');
            if (!editBtn) return;
            let customerName = '';
            let firstTd = tr.querySelector('td:first-child');
            if (firstTd) customerName = firstTd.childNodes[0]?.textContent?.trim() || '';
            if (!customerName) return;

            let btn = document.createElement('button');
            btn.className = 'btn sp-pdf-btn';
            btn.style.cssText = 'padding:4px 8px;font-size:0.75rem;background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:6px;cursor:pointer;margin-top:4px;font-family:inherit;';
            btn.innerHTML = '📄 PDF';
            btn.title = getLang() === 'ar' ? 'تصدير تقرير PDF للعميل' : 'Export Customer PDF Report';
            btn.onclick = (e) => { e.stopPropagation(); window.generateCustomerReport(customerName); };

            let actTd = tr.querySelector('td:last-child');
            if (actTd) actTd.appendChild(btn);
        });
    }

    // ─── Hook into render cycle ────────────────────────────────────────────────
    let origRenderCR = window.render;
    window.render = function () {
        if (origRenderCR) origRenderCR();
        if (typeof P !== 'undefined' && P === 'targets') {
            setTimeout(injectPrintButtonsTargets, 500);
        }
    };

    // Also hook rTgt override
    let origRTgtCR = window.rTgt;
    window.rTgt = function () {
        if (origRTgtCR) origRTgtCR();
        setTimeout(injectPrintButtonsTargets, 600);
    };

    // ─── Global shortcut for customer profile modal ───────────────────────────
    // Extend customer profile if it exists
    let origCustProfile = window.openCustomerProfile;
    window.openCustomerProfile = function (name) {
        if (origCustProfile) origCustProfile(name);
        // Try to add PDF button to the profile modal
        setTimeout(() => {
            let modal = document.querySelector('.sp-modal-content, .customer-profile-modal');
            if (modal && !modal.querySelector('.sp-pdf-btn-profile')) {
                let pdfBtn = document.createElement('button');
                pdfBtn.className = 'sp-pdf-btn-profile';
                pdfBtn.style.cssText = `
                    width: 100%; margin-top: 12px; padding: 10px;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white; border: none; border-radius: 8px;
                    font-weight: bold; cursor: pointer; font-size: 0.9rem;
                    font-family: inherit; display: flex; align-items: center;
                    justify-content: center; gap: 8px;
                `;
                pdfBtn.innerHTML = `📄 ${getLang() === 'ar' ? 'تصدير تقرير PDF كامل' : 'Export Full PDF Report'}`;
                pdfBtn.onclick = () => window.generateCustomerReport(name);
                modal.appendChild(pdfBtn);
            }
        }, 300);
    };

    // ─── Quick access: add "Export PDF" in Customers table ───────────────────
    function injectCustomerTablePDF() {
        let rows = Array.from(document.querySelectorAll('#cTbody tr, #custTbody tr')).slice(0, 50);
        rows.forEach(tr => {
            if (tr.querySelector('.sp-pdf-cust')) return;
            let firstTd = tr.querySelector('td:first-child');
            if (!firstTd) return;
            let customerName = firstTd.textContent.trim();
            if (!customerName || customerName.length < 2) return;

            let btn = document.createElement('button');
            btn.className = 'sp-pdf-cust';
            btn.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);color:#ef4444;border-radius:5px;padding:3px 7px;font-size:0.7rem;cursor:pointer;font-family:inherit;margin-right:4px;';
            btn.textContent = '📄';
            btn.title = getLang() === 'ar' ? 'تقرير PDF' : 'PDF Report';
            btn.onclick = (e) => { e.stopPropagation(); window.generateCustomerReport(customerName); };
            firstTd.appendChild(btn);

            let btnRcpt = document.createElement('button');
            btnRcpt.className = 'sp-rcpt-cust';
            btnRcpt.style.cssText = 'background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);color:#10b981;border-radius:5px;padding:3px 7px;font-size:0.7rem;cursor:pointer;font-family:inherit;margin-right:4px;';
            btnRcpt.textContent = '🧾';
            btnRcpt.title = getLang() === 'ar' ? 'سند قبض فوري' : 'Digital Receipt';
            btnRcpt.onclick = (e) => { e.stopPropagation(); window.openDigitalReceiptModal(customerName); };
            firstTd.appendChild(btnRcpt);
        });
    }

    let origRCust = window.rCust;
    if (origRCust) {
        window.rCust = function () {
            origRCust();
            setTimeout(injectCustomerTablePDF, 500);
        };
    }

    // Also inject when render is called on customers page
    let origRenderFinal = window.render;
    window.render = function () {
        if (origRenderFinal) origRenderFinal();
        if (typeof P !== 'undefined' && (P === 'customers' || P === 'collections')) {
            setTimeout(injectCustomerTablePDF, 600);
        }
    };

    // ─── AGING DEBT RADAR & CREDIT GUARD ─────────────────────────────────────────
    window.rAgingDebt = function() {
        let L = getLang();
        let S_data = getSalesData();
        let C_data = getCollectionsData();
        let now = new Date();

        // Calculate debts per customer
        let custDebts = {};
        S_data.forEach(r => {
            let c = r.Customer || r['Customer Name'];
            if(!c) return;
            if(!custDebts[c]) custDebts[c] = { name: c, sales: 0, coll: 0, invoices: [] };
            let val = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax'] || 0);
            let d = parseDate(r['Invoice Date'] || r['Order Date'] || r['Date']) || now;
            custDebts[c].sales += val;
            custDebts[c].invoices.push({ amount: val, date: d });
        });

        C_data.forEach(r => {
            let keys = Object.keys(r);
            let getV = (names) => { let k = keys.find(k => names.some(n => k.toLowerCase().replace(/\s+/g,'') === n.toLowerCase().replace(/\s+/g,''))); return k ? r[k] : null; };
            let c = getV(['Customer Name','Customer']) || '';
            if (c && custDebts[c]) {
                let rawVal = getV(['Amount','Collection']) || 0;
                custDebts[c].coll += Number(rawVal.toString().replace(/,/g,'')) || 0;
            }
        });

        let cat30 = 0, cat60 = 0, cat90 = 0, catCrit = 0, totalDue = 0;
        let debtList = [];

        Object.values(custDebts).forEach(item => {
            let due = Math.max(0, item.sales - item.coll);
            if (due <= 0) return;
            totalDue += due;

            // Find oldest unpaid estimate
            let lastInv = item.invoices.sort((a,b) => b.date - a.date)[0];
            let days = lastInv ? Math.floor((now - lastInv.date) / (1000 * 60 * 60 * 24)) : 10;
            
            if (days <= 30) cat30 += due;
            else if (days <= 60) cat60 += due;
            else if (days <= 90) cat90 += due;
            else catCrit += due;

            debtList.push({ name: item.name, due: due, days: days, sales: item.sales, coll: item.coll });
        });

        debtList.sort((a,b) => b.due - a.due);

        let html = `
            <div class="ph" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
                <h1 style="display:flex;align-items:center;gap:12px;margin:0;"><span style="width:36px;height:36px;display:flex;">🛡️</span> ${L==='ar'?'رادار أعمار الديون والحد الائتماني':'Aging Debt Radar & Credit Guard'}</h1>
                <button class="btn btn-wa" onclick="sendBulkPaymentReminders()" style="padding:10px 16px;">💬 ${L==='ar'?'إرسال تذكيرات بالواتساب':'Send WhatsApp Reminders'}</button>
            </div>

            <!-- Aging Summary Grid -->
            <div class="aging-grid">
                <div class="aging-card aging-card-30">
                    <div style="font-size:0.8rem;color:var(--tx3);">${L==='ar'?'🟢 جارية (أقل من 30 يوم)':'🟢 Current (< 30 Days)'}</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#10b981;margin-top:4px;">${cat30.toLocaleString()} <small style="font-size:0.75rem;">${L==='ar'?'ج.م':'EGP'}</small></div>
                </div>
                <div class="aging-card aging-card-60">
                    <div style="font-size:0.8rem;color:var(--tx3);">${L==='ar'?'🟡 تستحق قريباً (31-60 يوم)':'🟡 Due Soon (31-60 Days)'}</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#f59e0b;margin-top:4px;">${cat60.toLocaleString()} <small style="font-size:0.75rem;">${L==='ar'?'ج.م':'EGP'}</small></div>
                </div>
                <div class="aging-card aging-card-90">
                    <div style="font-size:0.8rem;color:var(--tx3);">${L==='ar'?'🟠 متأخرة (61-90 يوم)':'🟠 Overdue (61-90 Days)'}</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#f97316;margin-top:4px;">${cat90.toLocaleString()} <small style="font-size:0.75rem;">${L==='ar'?'ج.م':'EGP'}</small></div>
                </div>
                <div class="aging-card aging-card-crit">
                    <div style="font-size:0.8rem;color:var(--tx3);">${L==='ar'?'🔴 حرجة (+90 يوم)':'🔴 Critical (+90 Days)'}</div>
                    <div style="font-size:1.4rem;font-weight:800;color:#ef4444;margin-top:4px;">${catCrit.toLocaleString()} <small style="font-size:0.75rem;">${L==='ar'?'ج.م':'EGP'}</small></div>
                </div>
            </div>

            <!-- Detailed Aging Table -->
            <div class="card">
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;white-space:nowrap;">
                        <thead>
                            <tr style="background:var(--bg3);border-bottom:2px solid var(--bd);">
                                <th style="padding:14px 12px;color:var(--tx2);text-align:right;">${L==='ar'?'العميل':'Customer'}</th>
                                <th style="padding:14px 12px;color:var(--tx2);text-align:center;">${L==='ar'?'إجمالي المديونية':'Total Due'}</th>
                                <th style="padding:14px 12px;color:var(--tx2);text-align:center;">${L==='ar'?'فترة التأخير':'Aging Bucket'}</th>
                                <th style="padding:14px 12px;color:var(--tx2);text-align:center;">${L==='ar'?'حالة الائتمان':'Credit Status'}</th>
                                <th style="padding:14px 12px;color:var(--tx2);text-align:center;">${L==='ar'?'إجراءات':'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        debtList.forEach(item => {
            let bucketColor = item.days <= 30 ? '#10b981' : (item.days <= 60 ? '#f59e0b' : (item.days <= 90 ? '#f97316' : '#ef4444'));
            let bucketText = item.days <= 30 ? (L==='ar'?'< 30 يوم':'< 30 Days') : (item.days <= 60 ? (L==='ar'?'31-60 يوم':'31-60 Days') : (item.days <= 90 ? (L==='ar'?'61-90 يوم':'61-90 Days') : (L==='ar'?'+90 يوم حرجة':'+90 Days Critical')));
            let creditSafe = item.due < 50000;
            let creditBadge = creditSafe 
                ? `<span style="background:rgba(16,185,129,0.12);color:#10b981;padding:4px 8px;border-radius:6px;font-size:0.8rem;font-weight:700;">🟢 ${L==='ar'?'ائتمان آمن':'Safe Limit'}</span>`
                : `<span style="background:rgba(239,68,68,0.12);color:#ef4444;padding:4px 8px;border-radius:6px;font-size:0.8rem;font-weight:700;">⚠️ ${L==='ar'?'تجاوز الحد':'Over Limit'}</span>`;

            html += `
                <tr style="border-bottom:1px solid var(--bd-s);">
                    <td style="padding:14px 12px;font-weight:bold;color:var(--tx1);text-align:right;">${item.name}</td>
                    <td style="padding:14px 12px;text-align:center;font-weight:800;color:#ef4444;">${item.due.toLocaleString()} ${L==='ar'?'ج.م':'EGP'}</td>
                    <td style="padding:14px 12px;text-align:center;"><span style="color:${bucketColor};font-weight:bold;">${bucketText}</span></td>
                    <td style="padding:14px 12px;text-align:center;">${creditBadge}</td>
                    <td style="padding:14px 12px;text-align:center;">
                        <div style="display:flex;gap:6px;justify-content:center;">
                            <button class="btn" onclick="window.openDigitalReceiptModal('${item.name}')" style="background:#10b981;color:#fff;border:none;padding:6px 10px;border-radius:8px;font-size:0.8rem;cursor:pointer;">🧾 ${L==='ar'?'سند قبض':'Receipt'}</button>
                            <button class="btn-wa" onclick="sendCustDebtWhatsApp('${item.name}', ${item.due})" style="padding:6px 10px;font-size:0.8rem;">💬 WA</button>
                            <button class="btn" onclick="window.generateCustomerReport('${item.name}')" style="background:var(--bg3);border:1px solid var(--bd);color:var(--tx1);padding:6px 10px;border-radius:8px;font-size:0.8rem;cursor:pointer;">📄 PDF</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        let M = document.getElementById('M');
        if (M) M.innerHTML = html;
    };

    window.sendCustDebtWhatsApp = function(name, due) {
        let L = getLang();
        let msg = L==='ar'
            ? `مرحباً أستاذ ${name} 🌸%0Aنحيطكم علماً بأن رصيد مديونيتكم الحالي هو *${Number(due).toLocaleString()} ج.م*.%0Aيرجى التكرم بترتيب موعد السداد شاكرين حسن تعاونكم الدائم معنا.%0A- Sales Pro Enterprise`
            : `Hello ${name},%0AKindly note that your current outstanding balance is *${Number(due).toLocaleString()} EGP*.%0APlease arrange for settlement at your earliest convenience.%0AThank you, Sales Pro Enterprise`;
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    };

    // ─── DIGITAL RECEIPT MODAL ──────────────────────────────────────────────────
    window.openDigitalReceiptModal = function(custName = '') {
        let L = getLang();
        let rcptNum = 'REC-' + Math.floor(100000 + Math.random() * 900000);
        let dateStr = new Date().toISOString().split('T')[0];

        let h = `
            <div class="pos-modal-header">
                <h3 style="margin:0;font-size:1.2rem;display:flex;align-items:center;gap:8px;color:var(--tx1);">🧾 ${L==='ar'?'إصدار سند قبض نقدية إلكتروني':'Issue Digital Receipt'}</h3>
                <span class="sp-modal-close" onclick="this.closest('.pos-modal-overlay').remove()">×</span>
            </div>
            <div class="pos-modal-body">
                <div class="receipt-box" id="printReceiptArea">
                    <div style="text-align:center;border-bottom:2px dashed #cbd5e1;padding-bottom:12px;margin-bottom:14px;">
                        <h2 style="margin:0;color:#1e293b;">SALES PRO ENTERPRISE</h2>
                        <div style="font-size:0.85rem;color:#64748b;">${L==='ar'?'سند استلام نقدية رسمي':'Official Cash Receipt'}</div>
                        <div style="font-weight:bold;color:#4f46e5;margin-top:4px;"># ${rcptNum}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                        <div>
                            <label class="sp-form-label">${L==='ar'?'وصلنا من العميل':'Received From'}</label>
                            <input type="text" id="rcptCust" class="sp-form-input" value="${custName}" placeholder="${L==='ar'?'اسم العميل':'Customer Name'}">
                        </div>
                        <div>
                            <label class="sp-form-label">${L==='ar'?'المبلغ المحصل (ج.م)':'Amount (EGP)'}</label>
                            <input type="number" id="rcptAmount" class="sp-form-input" placeholder="0.00" style="font-size:1.2rem;font-weight:800;color:#10b981;">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                        <div>
                            <label class="sp-form-label">${L==='ar'?'طريقة الدفع':'Payment Method'}</label>
                            <select id="rcptMethod" class="sp-form-input">
                                <option value="نقدي (كاش)">${L==='ar'?'نقدي (كاش)':'Cash'}</option>
                                <option value="شيك بنكي">${L==='ar'?'شيك بنكي':'Bank Cheque'}</option>
                                <option value="تحويل بنكي / محفظة">${L==='ar'?'تحويل بنكي / محفظة':'Bank Transfer / Wallet'}</option>
                            </select>
                        </div>
                        <div>
                            <label class="sp-form-label">${L==='ar'?'رقم واتساب العميل':'WhatsApp Phone'}</label>
                            <input type="text" id="rcptPhone" class="sp-form-input" placeholder="010XXXXXXXX">
                        </div>
                    </div>
                    <label class="sp-form-label">${L==='ar'?'وذلك عن / البيان':'Description / Notes'}</label>
                    <input type="text" id="rcptNotes" class="sp-form-input" placeholder="${L==='ar'?'سداد دفعة من الحساب / فاتورة رقم...':'Payment on account / invoice...'}">
                </div>

                <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">
                    <button type="button" onclick="saveAndSendReceipt(true)" class="btn-wa" style="padding:10px 18px;">💬 ${L==='ar'?'إرسال السند للعميل عبر واتساب':'Send Receipt via WhatsApp'}</button>
                    <button type="button" onclick="saveAndSendReceipt(false)" class="btn" style="background:var(--ac);color:#fff;font-weight:bold;padding:10px 18px;">💾 ${L==='ar'?'حفظ السند':'Save Receipt'}</button>
                </div>
            </div>
        `;
        let m = document.createElement('div');
        m.className = 'pos-modal-overlay';
        m.id = 'rcptModal';
        m.innerHTML = `<div class="pos-modal-box" style="max-width:540px;">${h}</div>`;
        document.body.appendChild(m);
    };

    window.saveAndSendReceipt = function(sendWhatsApp = false) {
        let L = getLang();
        let cust = document.getElementById('rcptCust') ? document.getElementById('rcptCust').value : '';
        let amt = document.getElementById('rcptAmount') ? Number(document.getElementById('rcptAmount').value) || 0 : 0;
        let method = document.getElementById('rcptMethod') ? document.getElementById('rcptMethod').value : 'Cash';
        let phone = document.getElementById('rcptPhone') ? document.getElementById('rcptPhone').value.replace(/[^0-9]/g,'') : '';
        let notes = document.getElementById('rcptNotes') ? document.getElementById('rcptNotes').value : '';

        if (!cust || amt <= 0) {
            alert(L==='ar'?'يرجى إدخال اسم العميل والمبلغ بشكل صحيح':'Please enter customer name and valid amount');
            return;
        }

        let rcptNum = 'REC-' + Math.floor(100000 + Math.random() * 900000);
        let dateStr = new Date().toISOString().split('T')[0];

        // Save to Collections store
        let C_data = getCollectionsData();
        C_data.push({
            'Customer Name': cust,
            'Amount': amt,
            'Date': dateStr,
            'Receipt Number': rcptNum,
            'Method': method,
            'Notes': notes
        });
        localStorage.setItem('payData', JSON.stringify(C_data));

        if (sendWhatsApp) {
            let msg = L==='ar'
                ? `*سند قبض واستلام نقدية رقم ${rcptNum}* 🧾%0A` +
                  `وصلنا من السادة: *${cust}*%0A` +
                  `مبلغ وقدره: *${amt.toLocaleString()} ج.م* 💰%0A` +
                  `طريقة السداد: ${method}%0A` +
                  `التاريخ: ${dateStr}%0A` +
                  (notes ? `البيان: ${notes}%0A` : '') +
                  `-----------------------%0A` +
                  `شكراً لتعاملكم معنا - Sales Pro Enterprise`
                : `*Official Cash Receipt #${rcptNum}* 🧾%0A` +
                  `Received from: *${cust}*%0A` +
                  `Amount: *${amt.toLocaleString()} EGP* 💰%0A` +
                  `Payment Method: ${method}%0A` +
                  `Date: ${dateStr}%0A` +
                  (notes ? `Notes: ${notes}%0A` : '') +
                  `-----------------------%0A` +
                  `Thank you, Sales Pro Enterprise`;
            let url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
            window.open(url, '_blank');
        }

        let m = document.getElementById('rcptModal');
        if (m) m.remove();
        if(typeof toast === 'function') toast(L==='ar'?`تم حفظ سند القبض ${rcptNum} وتحديث الحساب`:`Receipt ${rcptNum} saved successfully`, 'success');
    };

})();
