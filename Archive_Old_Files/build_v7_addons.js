const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Remove old v7 block if exists
if (html.includes('<!-- SALESPRO ADDONS V7 START -->')) {
    const startIdx = html.indexOf('<!-- SALESPRO ADDONS V7 START -->');
    const endIdx = html.indexOf('<!-- SALESPRO ADDONS V7 END -->') + '<!-- SALESPRO ADDONS V7 END -->'.length;
    html = html.substring(0, startIdx) + html.substring(endIdx);
}

const v7Block = `
<!-- SALESPRO ADDONS V7 START -->
<style id="salespro-addons-v7-css">
/* Floating To-Do Button & Drawer */
.todo-float-btn { position:fixed; bottom:80px; right:20px; background:linear-gradient(135deg, #6c5ce7, #a29bfe); color:#fff; width:54px; height:54px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.6rem; box-shadow:0 6px 16px rgba(108,92,231,0.4); cursor:pointer; z-index:9000; transition:transform 0.2s, box-shadow 0.2s; }
.todo-float-btn:hover { transform:scale(1.08); box-shadow:0 8px 20px rgba(108,92,231,0.6); }
.todo-drawer { position:fixed; top:0; right:-380px; width:340px; max-width:90%; height:100%; background:var(--bg); border-left:1px solid var(--border); box-shadow:-8px 0 32px rgba(0,0,0,0.3); z-index:99999; transition:right 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display:flex; flex-direction:column; padding:20px; color:var(--tx); }
.todo-drawer.open { right:0; }
.todo-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:99990; display:none; backdrop-filter:blur(2px); }
.todo-overlay.open { display:block; }
.todo-item { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:var(--bg3); border-radius:8px; margin-bottom:8px; border-left:3px solid #6c5ce7; }
.todo-item.done span { text-decoration:line-through; opacity:0.5; }

/* Print Invoice Modal */
.print-modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:999999; display:none; align-items:center; justify-content:center; padding:20px; }
.print-modal-content { background:#fff; color:#000; width:100%; max-width:650px; padding:30px; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.4); max-height:90vh; overflow-y:auto; font-family:'Segoe UI', Tahoma, sans-serif; }
@media print {
    body * { visibility:hidden; }
    #printModalContent, #printModalContent * { visibility:visible; }
    #printModalContent { position:absolute; left:0; top:0; width:100%; box-shadow:none; padding:0; }
    .no-print { display:none !important; }
}
</style>

<script id="salespro-addons-v7-js">
(function(){
    console.log("Initializing Sales Pro Addons v7...");

    // 1️⃣ WhatsApp Integration
    window.openWhatsApp = function(phone, type, name, amount, dueDate) {
        if (!phone || phone === 'undefined' || phone === 'null') {
            if(typeof toast === 'function') toast(L === 'ar' ? 'لا يوجد رقم هاتف مسجل' : 'No phone recorded', 'error');
            return;
        }
        let p = String(phone).replace(/[^0-9+]/g, '');
        if (p.startsWith('0') && (p.length === 10 || p.length === 11)) p = '2' + p;
        let msg = '';
        if (type === 'due') {
            msg = L === 'ar' ? 
                \`أهلاً بك أستاذ \${name} من Sales Pro. نود تذكيركم بموعد استحقاق دفعة بقيمة \${amount || ''} ج.م بتاريخ \${dueDate || ''}. نسعد دائماً بالتعامل معكم.\` :
                \`Hello Mr/Ms \${name} from Sales Pro. Friendly reminder regarding due payment of \${amount || ''} EGP dated \${dueDate || ''}. Thank you!\`;
        } else if (type === 'lead') {
            msg = L === 'ar' ?
                \`أهلاً بك أستاذ \${name} من Sales Pro. يسعدنا التواصل معكم لتقديم خدماتنا ومنتجاتنا، ومستعدون لأي استفسار.\` :
                \`Hello Mr/Ms \${name} from Sales Pro. We are glad to connect with you regarding our products and services.\`;
        } else if (type === 'visit') {
            msg = L === 'ar' ?
                \`أهلاً بك أستاذ \${name} من Sales Pro. تشرفنا بزيارتكم والتواصل معكم اليوم، ونأمل في تعاون مثمر دائماً.\` :
                \`Hello Mr/Ms \${name} from Sales Pro. It was a pleasure visiting you today.\`;
        } else {
            msg = L === 'ar' ? \`أهلاً بك أستاذ \${name} من Sales Pro. كيف يمكننا مساعدتكم اليوم؟\` : \`Hello Mr/Ms \${name} from Sales Pro. How can we assist you today?\`;
        }
        window.open(\`https://api.whatsapp.com/send?phone=\${p}&text=\${encodeURIComponent(msg)}\`, '_blank');
    };

    window.waBtnHtml = function(phone, type, name, amount, dueDate) {
        if(!phone || phone === '') return '';
        let cleanName = (name || '').replace(/'/g, "\\'");
        return \`<a href="javascript:void(0)" onclick="openWhatsApp('\${phone}', '\${type}', '\${cleanName}', '\${amount||''}', '\${dueDate||''}')" style="color:#25D366;margin-left:6px;font-size:1.2rem;text-decoration:none;vertical-align:middle;" title="WhatsApp">💬</a>\`;
    };

    // 2️⃣ Global Search Bar Helper
    window.initGlobalSearch = function() {
        let el = document.getElementById('globalSearchInput');
        if(!el) return;
        el.addEventListener('input', function() {
            let q = this.value.trim().toLowerCase();
            let resBox = document.getElementById('globalSearchResults');
            let clearBtn = document.getElementById('clearGlobalSearch');
            if(!resBox) return;
            if(q.length === 0) {
                resBox.style.display = 'none';
                if(clearBtn) clearBtn.style.display = 'none';
                return;
            }
            if(clearBtn) clearBtn.style.display = 'inline';
            
            let matches = [];
            // Search Sales
            (window.S || []).forEach(s => {
                if((s.Customer && s.Customer.toLowerCase().includes(q)) || (s['Payment Ref.'] && String(s['Payment Ref.']).toLowerCase().includes(q))) {
                    matches.push({ type: L === 'ar' ? 'فاتورة بيع' : 'Sale Invoice', title: s.Customer, sub: \`\${s['Sales Without Tax']||0} EGP - \${s['Order Date']||''}\`, p: 'sales' });
                }
            });
            // Search Leads
            (loadLS('leadsData') || []).forEach(l => {
                if((l.name && l.name.toLowerCase().includes(q)) || (l.phone && String(l.phone).includes(q))) {
                    matches.push({ type: L === 'ar' ? 'عميل محتمل (Lead)' : 'Lead', title: l.name, sub: \`\${l.phone||''} (\${l.branch||''})\`, p: 'leads' });
                }
            });
            // Search Visits
            (loadLS('visitsData') || []).forEach(v => {
                if((v.customer && v.customer.toLowerCase().includes(q)) || (v.note && v.note.toLowerCase().includes(q))) {
                    matches.push({ type: L === 'ar' ? 'زيارة' : 'Visit', title: v.customer, sub: \`\${v.date||''} - \${v.type||''}\`, p: 'visits' });
                }
            });

            if(matches.length === 0) {
                resBox.innerHTML = \`<div style="padding:10px;text-align:center;color:var(--tx2);">\${L === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matches found'}</div>\`;
            } else {
                resBox.innerHTML = matches.slice(0, 8).map(m => \`
                    <div onclick="P='\${m.p}';if(typeof buildNav==='function')buildNav();if(typeof render==='function')render();document.getElementById('globalSearchResults').style.display='none';document.getElementById('globalSearchInput').value='';" style="padding:8px 12px;border-bottom:1px solid var(--border);cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <strong style="font-size:0.9rem;display:block;">\${m.title}</strong>
                            <span style="font-size:0.75rem;color:var(--tx2);">\${m.sub}</span>
                        </div>
                        <span class="badge" style="font-size:0.7rem;padding:2px 6px;">\${m.type}</span>
                    </div>
                \`).join('');
            }
            resBox.style.display = 'block';
        });

        let clearBtn = document.getElementById('clearGlobalSearch');
        if(clearBtn) {
            clearBtn.onclick = function() {
                el.value = '';
                document.getElementById('globalSearchResults').style.display = 'none';
                this.style.display = 'none';
            };
        }
    };

    // 3️⃣ Excel Import Helper
    window.importFromExcel = function(targetType) {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls, .csv';
        input.onchange = function(e) {
            let file = e.target.files[0];
            if(!file) return;
            if(typeof XLSX === 'undefined') {
                alert('XLSX library not loaded yet!');
                return;
            }
            let reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    let data = new Uint8Array(evt.target.result);
                    let workbook = XLSX.read(data, {type: 'array'});
                    let firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    let jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    if(!jsonData || jsonData.length === 0) {
                        if(typeof toast==='function') toast(L==='ar'?'الملف فارغ أو غير صالح':'Empty or invalid file', 'error');
                        return;
                    }

                    if(targetType === 'leads') {
                        let ld = loadLS('leadsData') || [];
                        jsonData.forEach(row => {
                            ld.push({
                                id: Date.now() + Math.random(),
                                name: row['Customer Name'] || row['Name'] || row['الاسم'] || row['اسم العميل'] || 'بدون اسم',
                                phone: row['Phone'] || row['Mobile'] || row['رقم الهاتف'] || row['التليفون'] || '',
                                branch: row['Branch'] || row['الفرع'] || 'حدائق القبة',
                                status: row['Status'] || row['الحالة'] || 'Warm',
                                note: row['Note'] || row['ملاحظات'] || 'تم الاستيراد من الإكسل'
                            });
                        });
                        sv('leadsData', ld);
                        if(typeof toast==='function') toast(L==='ar'? \`تم استيراد \${jsonData.length} عميل محتمل بنجاح!\` : \`Imported \${jsonData.length} leads!\`, 'success');
                        if(typeof render==='function') render();
                    } else if(targetType === 'customers') {
                        let count = 0;
                        jsonData.forEach(row => {
                            let cName = row['Customer Name'] || row['Customer'] || row['اسم العميل'] || row['العميل'];
                            if(cName) {
                                S.push({
                                    'Customer': cName,
                                    'Order Date': row['Date'] || row['التاريخ'] || new Date().toISOString().split('T')[0],
                                    'Sales Without Tax': Number(row['Amount'] || row['المبلغ'] || row['المبيعات'] || 0),
                                    'Payment Ref.': row['Ref'] || row['البيان'] || 'استيراد رصيد'
                                });
                                count++;
                            }
                        });
                        sv('salesData', S);
                        if(typeof toast==='function') toast(L==='ar'? \`تم استيراد \${count} عملية للعملاء!\` : \`Imported \${count} customer records!\`, 'success');
                        if(typeof render==='function') render();
                    }
                } catch(err) {
                    console.error("Excel import error:", err);
                    if(typeof toast==='function') toast(L==='ar'?'حدث خطأ أثناء قراءة الملف':'Error reading file', 'error');
                }
            };
            reader.readAsArrayBuffer(file);
        };
        input.click();
    };

    // 5️⃣ Print Receipt / PDF Invoice Generator
    window.printReceipt = function(customerName, amount, date, ref) {
        let modal = document.getElementById('printInvoiceModal');
        if(!modal) {
            modal = document.createElement('div');
            modal.id = 'printInvoiceModal';
            modal.className = 'print-modal';
            document.body.appendChild(modal);
        }
        let invNo = 'INV-' + Math.floor(100000 + Math.random() * 900000);
        modal.innerHTML = \`
            <div class="print-modal-content" id="printModalContent">
                <div style="text-align:center;border-bottom:2px dashed #ccc;padding-bottom:15px;margin-bottom:20px;">
                    <h2 style="margin:0;color:#2c3e50;font-weight:800;">Sales Pro CRM</h2>
                    <p style="margin:4px 0 0;color:#7f8c8d;font-size:0.9rem;">إيصال معاملة مبيعات / تحصيل رسمي</p>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:15px;font-size:0.95rem;">
                    <div><strong>رقم الإيصال:</strong> \${invNo}</div>
                    <div><strong>التاريخ:</strong> \${date || new Date().toISOString().split('T')[0]}</div>
                </div>
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:0.95rem;">
                    <tr style="background:#f8f9fa;border-bottom:1px solid #ddd;">
                        <th style="padding:10px;text-align:right;border:1px solid #ddd;">البيان / العميل</th>
                        <th style="padding:10px;text-align:left;border:1px solid #ddd;">القيمة (ج.م)</th>
                    </tr>
                    <tr>
                        <td style="padding:12px;border:1px solid #ddd;"><strong>\${customerName || 'عميل عام'}</strong><br><small style="color:#666;">\${ref || 'دفعة حساب / مبيعات'}</small></td>
                        <td style="padding:12px;text-align:left;border:1px solid #ddd;font-weight:bold;font-size:1.1rem;color:#27ae60;">\${fmt(amount || 0)} ج.م</td>
                    </tr>
                </table>
                <div style="text-align:center;margin-top:30px;color: #7f8c8d;font-size:0.85rem;border-top:1px solid #eee;padding-top:15px;">
                    شكراً لثقتكم وتعاملكم معنا! • تم الإصدار بواسطة Sales Pro
                </div>
                <div class="no-print" style="margin-top:25px;display:flex;gap:12px;justify-content:center;">
                    <button onclick="window.print();" class="btn btn-p" style="padding:10px 24px;font-size:1rem;background:#27ae60;color:#fff;border:none;border-radius:8px;cursor:pointer;">🖨️ طباعة / حفظ PDF</button>
                    <button onclick="document.getElementById('printInvoiceModal').style.display='none';" class="btn" style="padding:10px 20px;background:#95a5a6;color:#fff;border:none;border-radius:8px;cursor:pointer;">إغلاق</button>
                </div>
            </div>
        \`;
        modal.style.display = 'flex';
    };

    // 7️⃣ Daily To-Do List Drawer
    window.toggleTodoDrawer = function() {
        let drawer = document.getElementById('todoDrawer');
        let overlay = document.getElementById('todoOverlay');
        if(!drawer) {
            overlay = document.createElement('div');
            overlay.id = 'todoOverlay';
            overlay.className = 'todo-overlay';
            overlay.onclick = toggleTodoDrawer;
            document.body.appendChild(overlay);

            drawer = document.createElement('div');
            drawer.id = 'todoDrawer';
            drawer.className = 'todo-drawer';
            drawer.innerHTML = \`
                <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:16px;">
                    <h3 style="margin:0;display:flex;align-items:center;gap:8px;">📌 \${L === 'ar' ? 'مفكرة المهام السريعة' : 'Daily To-Do List'}</h3>
                    <span onclick="toggleTodoDrawer()" style="cursor:pointer;font-size:1.3rem;color:var(--tx2);">✖</span>
                </div>
                <div style="display:flex;gap:8px;margin-bottom:16px;">
                    <input type="text" id="newTodoInput" placeholder="\${L === 'ar' ? 'أضف مهمة جديدة...' : 'Add a task...'}" style="flex:1;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);color:var(--tx);font-size:0.9rem;">
                    <button onclick="addTodoItem()" style="background:#6c5ce7;color:#fff;border:none;border-radius:8px;padding:0 14px;cursor:pointer;font-weight:bold;">+</button>
                </div>
                <div id="todoListContainer" style="flex:1;overflow-y:auto;"></div>
            \`;
            document.body.appendChild(drawer);
            renderTodos();

            let inp = document.getElementById('newTodoInput');
            if(inp) inp.addEventListener('keypress', e => { if(e.key==='Enter') addTodoItem(); });
        }
        drawer.classList.toggle('open');
        overlay.classList.toggle('open');
        if(drawer.classList.contains('open')) renderTodos();
    };

    window.renderTodos = function() {
        let list = loadLS('sales_todos') || [];
        let container = document.getElementById('todoListContainer');
        if(!container) return;
        if(list.length === 0) {
            container.innerHTML = \`<p style="text-align:center;color:var(--tx2);margin-top:40px;">\${L === 'ar' ? 'لا توجد مهام حالياً. استمتع بيومك! 🎉' : 'No tasks yet. Enjoy your day! 🎉'}</p>\`;
            return;
        }
        container.innerHTML = list.map((item, idx) => \`
            <div class="todo-item \${item.done ? 'done' : ''}">
                <div style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1;" onclick="toggleTodoStatus(\${idx})">
                    <input type="checkbox" \${item.done ? 'checked' : ''} style="cursor:pointer;width:18px;height:18px;">
                    <span style="font-size:0.9rem;">\${item.text}</span>
                </div>
                <span onclick="deleteTodoItem(\${idx})" style="cursor:pointer;color:#e74c3c;font-size:1.1rem;padding:0 6px;" title="حذف">🗑️</span>
            </div>
        \`).join('');
    };

    window.addTodoItem = function() {
        let inp = document.getElementById('newTodoInput');
        if(!inp || !inp.value.trim()) return;
        let list = loadLS('sales_todos') || [];
        list.unshift({ text: inp.value.trim(), done: false, id: Date.now() });
        sv('sales_todos', list);
        inp.value = '';
        renderTodos();
    };

    window.toggleTodoStatus = function(idx) {
        let list = loadLS('sales_todos') || [];
        if(list[idx]) {
            list[idx].done = !list[idx].done;
            sv('sales_todos', list);
            renderTodos();
        }
    };

    window.deleteTodoItem = function(idx) {
        let list = loadLS('sales_todos') || [];
        list.splice(idx, 1);
        sv('sales_todos', list);
        renderTodos();
    };

    window.initTodoFloatBtn = function() {
        if(!document.getElementById('todoFloatBtn')) {
            let btn = document.createElement('div');
            btn.id = 'todoFloatBtn';
            btn.className = 'todo-float-btn';
            btn.innerHTML = '📌';
            btn.title = L === 'ar' ? 'مفكرة المهام السريعة' : 'To-Do List';
            btn.onclick = toggleTodoDrawer;
            document.body.appendChild(btn);
        }
    };

    // 4️⃣ & 6️⃣ Hook into Render to inject UI elements dynamically (Robust Safe-Wrap)
    function setupRenderHook() {
        if (typeof window.render !== 'function' || window.render._isV7Hook) {
            if (!window.render || !window.render._isV7Hook) {
                setTimeout(setupRenderHook, 100);
            }
            return;
        }
        window._originalRenderV7 = window.render;
        const v7RenderHook = function(...args) {
            if (typeof window._originalRenderV7 === 'function') {
                try {
                    window._originalRenderV7.apply(this, args);
                } catch (err) {
                    console.error("Original render error:", err);
                }
            }
            try {
                if (typeof window.applyV7AddonsAfterRender === 'function') {
                    window.applyV7AddonsAfterRender();
                }
            } catch (e) {
                console.error("Addons v7 render hook error:", e);
            }
        };
        v7RenderHook._isV7Hook = true;
        window.render = v7RenderHook;
    }
    setupRenderHook();

    window.applyV7AddonsAfterRender = function() {
        initTodoFloatBtn();

        let m = document.getElementById('M');
        if (m && !document.getElementById('globalSearchContainer')) {
            let sc = document.createElement('div');
            sc.id = 'globalSearchContainer';
            sc.style.cssText = 'margin:12px 16px 8px 16px; position:relative; z-index:100;';
            sc.innerHTML = \`
                <div style="display:flex;align-items:center;background:var(--bg3);border-radius:10px;padding:8px 14px;border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                    <span style="font-size:1.2rem;margin-right:8px;color:var(--tx2);">🔍</span>
                    <input type="text" id="globalSearchInput" placeholder="\${L==='ar'?'بحث شامل في العملاء، الأصناف، الفواتير، والزيارات...':'Global search customers, items, invoices, visits...'}" style="border:none;background:transparent;width:100%;color:var(--tx);font-size:0.95rem;outline:none;">
                    <span id="clearGlobalSearch" style="cursor:pointer;display:none;color:var(--tx2);font-size:1.1rem;margin-left:8px;">✖</span>
                </div>
                <div id="globalSearchResults" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--bg);border:1px solid var(--border);border-radius:8px;max-height:350px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,0.3);margin-top:4px;z-index:9999;padding:8px;"></div>
            \`;
            m.parentNode.insertBefore(sc, m);
            initGlobalSearch();
        }

        if(P === 'customers' || P === 'leads') {
            let ph = m.querySelector('.ph');
            if(ph && !document.getElementById('btnExcelImport')) {
                let btn = document.createElement('button');
                btn.id = 'btnExcelImport';
                btn.className = 'btn';
                btn.style.cssText = 'background:#27ae60;color:#fff;display:flex;align-items:center;gap:6px;font-size:0.85rem;padding:6px 12px;border-radius:8px;border:none;cursor:pointer;margin-left:auto;';
                btn.innerHTML = \`📥 \${L === 'ar' ? 'استيراد من Excel' : 'Import Excel'}\`;
                btn.onclick = () => importFromExcel(P);
                ph.appendChild(btn);
            }
        }

        if((P === 'dashboard' || P === 'analytics') && !document.getElementById('branchPerfChartCard')) {
            let qobbahSales = 0, luxorSales = 0, tot = 0;
            (window.S || []).forEach(s => {
                let val = Number(s['Sales Without Tax'] || 0);
                tot += val;
                let c = (s.Customer || '').toLowerCase();
                let ref = (s['Payment Ref.'] || '').toLowerCase();
                if(c.includes('أقصر') || c.includes('اقصر') || c.includes('luxor') || ref.includes('أقصر') || ref.includes('luxor')) {
                    luxorSales += val;
                } else {
                    qobbahSales += val;
                }
            });
            let qPct = tot > 0 ? Math.round((qobbahSales/tot)*100) : 50;
            let lPct = tot > 0 ? Math.round((luxorSales/tot)*100) : 50;

            let card = document.createElement('div');
            card.id = 'branchPerfChartCard';
            card.className = 'card';
            card.style.cssText = 'margin-top:16px;padding:16px;border-left:4px solid #2ecc71;';
            card.innerHTML = \`
                <h3 style="margin:0 0 12px 0;display:flex;align-items:center;gap:8px;font-size:1rem;">📊 \${L === 'ar' ? 'مقارنة أداء المبيعات بين الفروع (ميزة بصرية جديدة)' : 'Branch Sales Performance'}</h3>
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px;">
                        <span>🏢 \${L === 'ar' ? 'فرع حدائق القبة والعملاء العامين' : 'Hadayek El-Qobbah & General'}</span>
                        <strong>\${fmt(qobbahSales)} ج.م (\${qPct}%)</strong>
                    </div>
                    <div style="background:var(--bg3);height:14px;border-radius:7px;overflow:hidden;border:1px solid rgba(0,0,0,0.05);">
                        <div style="background:linear-gradient(90deg, #3498db, #2ecc71);width:\${qPct}%;height:100%;transition:width 1s;"></div>
                    </div>
                </div>
                <div>
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px;">
                        <span>🏛️ \${L === 'ar' ? 'فرع الأقصر وعملائه' : 'Luxor Branch'}</span>
                        <strong>\${fmt(luxorSales)} ج.م (\${lPct}%)</strong>
                    </div>
                    <div style="background:var(--bg3);height:14px;border-radius:7px;overflow:hidden;border:1px solid rgba(0,0,0,0.05);">
                        <div style="background:linear-gradient(90deg, #e74c3c, #f39c12);width:\${lPct}%;height:100%;transition:width 1s;"></div>
                    </div>
                </div>
            \`;
            m.appendChild(card);
        }

        if(P === 'sales' || P === 'customers') {
            m.querySelectorAll('table tbody tr').forEach(tr => {
                let tds = tr.querySelectorAll('td');
                if(tds.length >= 2 && !tr.querySelector('.btn-print-icon')) {
                    let cName = tds[0] ? tds[0].innerText.trim() : 'العميل';
                    let amtStr = tds[tds.length - 1] ? tds[tds.length - 1].innerText.replace(/[^0-9.]/g,'') : '0';
                    let btn = document.createElement('a');
                    btn.className = 'btn-print-icon';
                    btn.href = 'javascript:void(0)';
                    btn.innerHTML = '🖨️';
                    btn.title = L === 'ar' ? 'طباعة إيصال' : 'Print Receipt';
                    btn.style.cssText = 'margin-left:8px;font-size:1.1rem;text-decoration:none;cursor:pointer;';
                    btn.onclick = (e) => { e.stopPropagation(); printReceipt(cName, Number(amtStr), new Date().toISOString().split('T')[0], 'فاتورة مبيعات/حساب'); };
                    if(tds[0]) tds[0].appendChild(btn);
                }
            });
        }

        if(P === 'leads') {
            m.querySelectorAll('#ldTable tbody tr').forEach(tr => {
                let tds = tr.querySelectorAll('td');
                if(tds.length >= 3 && !tr.querySelector('.wa-injected')) {
                    let name = tds[0].innerText.trim();
                    let phone = tds[2].innerText.trim();
                    if(phone && phone !== '') {
                        let span = document.createElement('span');
                        span.className = 'wa-injected';
                        span.innerHTML = waBtnHtml(phone, 'lead', name);
                        tds[2].appendChild(span);
                    }
                }
            });
        }
    };

    setTimeout(() => { try { if(typeof window.applyV7AddonsAfterRender === 'function') window.applyV7AddonsAfterRender(); } catch(e) { console.error("Initial addon render error:", e); } }, 1000);
})();
</script>
<!-- SALESPRO ADDONS V7 END -->
`;

['index.html', 'index_final.html', 'index_bundle.html'].forEach(filename => {
    if (fs.existsSync(filename)) {
        let content = fs.readFileSync(filename, 'utf8');
        if (content.includes('<!-- SALESPRO ADDONS V7 START -->')) {
            const sIdx = content.indexOf('<!-- SALESPRO ADDONS V7 START -->');
            const eIdx = content.indexOf('<!-- SALESPRO ADDONS V7 END -->') + '<!-- SALESPRO ADDONS V7 END -->'.length;
            content = content.substring(0, sIdx) + content.substring(eIdx);
        }
        const pos = content.lastIndexOf('</body>');
        if (pos !== -1) {
            content = content.substring(0, pos) + v7Block + content.substring(pos);
            fs.writeFileSync(filename, content, 'utf8');
            console.log("Successfully injected Sales Pro Addons v7 into " + filename + "!");
        }
    }
});
