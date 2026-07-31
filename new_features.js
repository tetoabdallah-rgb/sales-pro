// new_features.js - Added for Visits, Leads, AI Assistant, Collections Follow-up

// =======================
// VISITS (الزيارات)
// =======================
function rVisits() {
    let html = \
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🚗</span> \</h1>
            <button class="btn" onclick="addVisitModal()" style="background:var(--ac);color:#fff;">➕ \</button>
        </div>
        <div class="card" id="visitsList">
            <table style="width:100%;text-align:left;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid var(--bd);">
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                    </tr>
                </thead>
                <tbody id="vTbody">
                </tbody>
            </table>
        </div>
    \;
    let M = document.getElementById('M');
    if(M) M.innerHTML = html;
    loadVisits();
}

let visitsData = [];

function loadVisits() {
    visitsData = JSON.parse(localStorage.getItem('sp_visits') || '[]');
    let tb = document.getElementById('vTbody');
    if (!tb) return;
    tb.innerHTML = '';
    if (visitsData.length === 0) {
        tb.innerHTML = \<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--tx3);">\</td></tr>\;
        return;
    }
    visitsData.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(v => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        tr.innerHTML = \
            <td style="padding:10px;">\</td>
            <td style="padding:10px;font-weight:bold;">\</td>
            <td style="padding:10px;">\</td>
            <td style="padding:10px;">\</td>
        \;
        tb.appendChild(tr);
    });
}

window.addVisitModal = function() {
    let S = window.S || [];
    let cList = [...new Set(S.map(r=>r.Customer).filter(Boolean))];
    let opts = cList.map(c => \<option value="\">\</option>\).join('');
    let h = \
        <h3>\</h3>
        <label>\</label>
        <select id="nvCust" class="sbox" style="width:100%;margin-bottom:10px;">\</select>
        <label>\</label>
        <input type="date" id="nvDate" class="sbox" style="width:100%;margin-bottom:10px;" value="\">
        <label>\</label>
        <textarea id="nvOutcome" class="sbox" style="width:100%;margin-bottom:10px;height:60px;"></textarea>
        <label>\</label>
        <input type="date" id="nvNext" class="sbox" style="width:100%;margin-bottom:10px;">
        <button class="btn" style="width:100%;background:var(--ac);color:#fff;" onclick="saveVisit()">\</button>
    \;
    let m = document.createElement('div');
    m.className = 'modal show';
    m.id = 'vModal';
    m.innerHTML = \<div class="modal-content"><span class="modal-close" onclick="this.closest('.modal').remove()">×</span>\</div>\;
    document.body.appendChild(m);
};

window.saveVisit = function() {
    let c = document.getElementById('nvCust').value;
    let d = document.getElementById('nvDate').value;
    let o = document.getElementById('nvOutcome').value;
    let n = document.getElementById('nvNext').value;
    if(!c || !d) { alert('العميل والتاريخ مطلوبان'); return; }
    visitsData.push({ id: Date.now(), customer: c, date: d, outcome: o, nextDate: n });
    localStorage.setItem('sp_visits', JSON.stringify(visitsData));
    let modal = document.getElementById('vModal');
    if(modal) modal.remove();
    loadVisits();
    if(typeof toast === 'function') toast('تم حفظ الزيارة بنجاح', 'success');
};


// =======================
// LEADS (العملاء المحتملين)
// =======================
function rLeads() {
    let html = \
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🤝</span> \</h1>
            <button class="btn" onclick="addLeadModal()" style="background:var(--ac);color:#fff;">➕ \</button>
        </div>
        <div class="kg" style="margin-bottom:20px;">
            <div class="ki"><div class="lb">إجمالي المحتملين</div><div class="vl" id="ldTot">0</div></div>
            <div class="ki" style="color:var(--am)"><div class="lb">قيد التواصل</div><div class="vl" id="ldInp">0</div></div>
            <div class="ki" style="color:var(--gn)"><div class="lb">تم التحويل (Converted)</div><div class="vl" id="ldConv">0</div></div>
        </div>
        <div class="card" id="leadsList">
            <table style="width:100%;text-align:left;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid var(--bd);">
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                    </tr>
                </thead>
                <tbody id="lTbody">
                </tbody>
            </table>
        </div>
    \;
    let M = document.getElementById('M');
    if(M) M.innerHTML = html;
    loadLeads();
}

let leadsData = [];

function loadLeads() {
    leadsData = JSON.parse(localStorage.getItem('sp_leads') || '[]');
    let tb = document.getElementById('lTbody');
    if (!tb) return;
    tb.innerHTML = '';
    
    let tot=0, inp=0, conv=0;
    
    leadsData.forEach(ld => {
        tot++;
        if(ld.status === 'converted') conv++;
        else inp++;
        
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        let stColor = ld.status === 'converted' ? 'var(--gn)' : 'var(--am)';
        let stText = ld.status === 'converted' ? 'تم التحويل لعميل فعلي' : 'تواصل مبدئي / جاري';
        
        let actions = ld.status === 'converted' ? '-' : \<button class="btn" style="padding:4px 8px;font-size:0.75rem;background:var(--gn);color:#fff;" onclick="convertLead(\)">تحويل لعميل</button>\;
        
        tr.innerHTML = \
            <td style="padding:10px;font-weight:bold;">\</td>
            <td style="padding:10px;">\</td>
            <td style="padding:10px;color:\;font-weight:bold;">\</td>
            <td style="padding:10px;">\</td>
        \;
        tb.appendChild(tr);
    });
    
    if(tot===0) {
        tb.innerHTML = \<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--tx3);">\</td></tr>\;
    }
    
    document.getElementById('ldTot').textContent = tot;
    document.getElementById('ldInp').textContent = inp;
    document.getElementById('ldConv').textContent = conv;
}

window.addLeadModal = function() {
    let h = \
        <h3>\</h3>
        <label>\</label>
        <input type="text" id="nlName" class="sbox" style="width:100%;margin-bottom:10px;">
        <label>\</label>
        <input type="text" id="nlPhone" class="sbox" style="width:100%;margin-bottom:10px;">
        <label>\</label>
        <textarea id="nlNotes" class="sbox" style="width:100%;margin-bottom:10px;height:60px;"></textarea>
        <button class="btn" style="width:100%;background:var(--ac);color:#fff;" onclick="saveLead()">\</button>
    \;
    let m = document.createElement('div');
    m.className = 'modal show';
    m.id = 'lModal';
    m.innerHTML = \<div class="modal-content"><span class="modal-close" onclick="this.closest('.modal').remove()">×</span>\</div>\;
    document.body.appendChild(m);
};

window.saveLead = function() {
    let n = document.getElementById('nlName').value;
    let p = document.getElementById('nlPhone').value;
    let nt = document.getElementById('nlNotes').value;
    if(!n) { alert('الاسم مطلوب'); return; }
    leadsData.push({ id: Date.now(), name: n, phone: p, notes: nt, status: 'new', date: new Date().toISOString() });
    localStorage.setItem('sp_leads', JSON.stringify(leadsData));
    let modal = document.getElementById('lModal');
    if(modal) modal.remove();
    loadLeads();
    if(typeof toast === 'function') toast('تم إضافة العميل المحتمل', 'success');
};

window.convertLead = function(id) {
    if(!confirm('هل أنت متأكد من تحويل هذا العميل إلى عميل فعلي؟')) return;
    let idx = leadsData.findIndex(l => l.id === id);
    if(idx > -1) {
        leadsData[idx].status = 'converted';
        localStorage.setItem('sp_leads', JSON.stringify(leadsData));
        loadLeads();
        if(typeof toast === 'function') toast('تم التحويل بنجاح', 'success');
    }
};


// =======================
// DAILY ALERTS CHECK (التنبيهات اليومية)
// =======================
window.checkDailyAlerts = function() {
    let lastCheck = localStorage.getItem('sp_last_alert_check');
    let today = new Date().toISOString().split('T')[0];
    if(lastCheck === today) return;
    
    let delayCount = 0;
    let T_data = window.T || [];
    let S_data = window.S || [];
    if (T_data.length > 0 && S_data.length > 0) {
        let cuS = {};
        S_data.forEach(r => { let c=r.Customer||''; cuS[c]=(cuS[c]||0)+(typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales Without Tax']||0)); });
        T_data.forEach(r => {
            let tg=Number(r.Target)||0, ach=cuS[r.Customer]||0, pct=tg>0?ach/tg*100:0;
            if(pct < 50 && tg > 0) delayCount++;
        });
    }
    
    if (delayCount > 0) {
        let h = \
            <div style="text-align:center;">
                <div style="font-size:3rem;">⚠️</div>
                <h2 style="color:var(--rd);margin:10px 0;">تنبيهات المتأخرات اليومية</h2>
                <p style="margin-bottom:20px;">يوجد <strong>\</strong> عملاء متأخرين عن تحقيق المستهدف (أقل من 50%). يرجى مراجعة صفحة التنبيهات.</p>
                <button class="btn" style="background:var(--ac);color:#fff;" onclick="this.closest('.modal').remove(); if(typeof P!=='undefined'){ P='alerts'; if(typeof buildNav==='function') buildNav(); if(typeof render==='function') render(); }">الذهاب للتنبيهات</button>
            </div>
        \;
        let m = document.createElement('div');
        m.className = 'modal show';
        m.innerHTML = \<div class="modal-content"><span class="modal-close" onclick="this.closest('.modal').remove()">×</span>\</div>\;
        document.body.appendChild(m);
    }
    
    localStorage.setItem('sp_last_alert_check', today);
};

let oldInit = window.init;
window.init = function() {
    if(oldInit) oldInit();
    setTimeout(window.checkDailyAlerts, 2000);
};

// =======================
// GEMINI AI INTEGRATION
// =======================
window.askGemini = async function() {
    let q = document.getElementById('aiInput').value;
    if(!q) return;
    
    let apiKey = localStorage.getItem('sp_gemini_key');
    if(!apiKey) {
        let key = prompt('لإستخدام المساعد الذكي، يرجى إدخال مفتاح Google Gemini API Key الخاص بك:\n(يمكنك الحصول عليه مجاناً من Google AI Studio)');
        if(key) {
            localStorage.setItem('sp_gemini_key', key);
            apiKey = key;
        } else {
            return;
        }
    }
    
    let resDiv = document.getElementById('aiResponse');
    resDiv.innerHTML = '<div style="color:var(--tx2);">جارٍ التحليل والتفكير... 🤖</div>';
    
    try {
        let context = "أنت مساعد ذكي لمدير مبيعات يعمل على تطبيق Sales Pro. لديك البيانات التالية:\n";
        let T_data = window.T || [];
        let S_data = window.S || [];
        if (T_data.length > 0) {
            context += "إجمالي المستهدف: " + T_data.reduce((acc,r)=>acc+(Number(r.Target)||0),0) + "\n";
        }
        if (S_data.length > 0) {
            let luxorSales = 0, qobbahSales = 0;
            S_data.forEach(s => {
                let val = Number(s['Sales Without Tax'] || 0);
                let c = (s.Customer || '').toLowerCase();
                let ref = (s['Payment Ref.'] || '').toLowerCase();
                if(c.includes('أقصر') || c.includes('اقصر') || c.includes('luxor') || ref.includes('luxor')) {
                    luxorSales += val;
                } else {
                    qobbahSales += val;
                }
            });
            context += "مبيعات فرع الأقصر: " + luxorSales + "\n";
            context += "مبيعات فرع حدائق القبة (والعام): " + qobbahSales + "\n";
        }
        
        let response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contents: [{parts: [{text: context + "\nسؤال المستخدم: " + q}]}]
            })
        });
        
        let data = await response.json();
        if(data.error) {
            resDiv.innerHTML = '<div style="color:var(--rd);">خطأ في API: ' + data.error.message + '</div>';
            return;
        }
        
        let text = data.candidates[0].content.parts[0].text;
        let htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong></strong>').replace(/\n/g, '<br>');
        resDiv.innerHTML = '<div style="background:var(--bg3);padding:15px;border-radius:12px;border:1px solid var(--bd);line-height:1.6;">' + htmlText + '</div>';
        
    } catch(err) {
        resDiv.innerHTML = '<div style="color:var(--rd);">حدث خطأ في الاتصال. تأكد من صحة المفتاح والإنترنت.</div>';
    }
};

let old_rAI = window.rAI;
window.rAI = function() {
    if(old_rAI) old_rAI();
    
    let aiCard = document.createElement('div');
    aiCard.className = 'card';
    aiCard.style.marginTop = '20px';
    aiCard.innerHTML = \
        <h3>🤖 المساعد الذكي (Gemini AI)</h3>
        <p style="color:var(--tx2);font-size:0.9rem;margin-bottom:15px;">اطرح سؤالاً عن مبيعاتك، أو اطلب خطة لتطوير المبيعات وتحقيق التارجت للعملاء أو للفروع.</p>
        <div style="display:flex;gap:10px;margin-bottom:15px;">
            <input type="text" id="aiInput" class="sbox" style="flex:1;" placeholder="مثال: اقترح خطة لزيادة مبيعات فرع الأقصر هذا الشهر...">
            <button class="btn" style="background:var(--ac);color:#fff;" onclick="askGemini()">إرسال</button>
        </div>
        <div id="aiResponse"></div>
    \;
    let M = document.getElementById('M');
    if(M) M.appendChild(aiCard);
};

// =======================
// COLLECTIONS FOLLOW-UP (التحصيلات)
// =======================
let old_rCollections = window.rCollections;
window.rCollections = function() {
    if(old_rCollections) old_rCollections();
    
    let html = \
        <div class="card" style="margin-top:20px; border-top:4px solid var(--bl);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h3 style="margin:0;">💰 \</h3>
                <button class="btn" style="background:var(--ac);color:#fff;" onclick="addColModal()">➕ \</button>
            </div>
            <table style="width:100%;text-align:left;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid var(--bd);">
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                        <th style="padding:10px;">\</th>
                    </tr>
                </thead>
                <tbody id="cTbody">
                </tbody>
            </table>
        </div>
    \;
    let m = document.getElementById('M');
    if(m) {
        let div = document.createElement('div');
        div.innerHTML = html;
        m.appendChild(div);
        loadColFollowups();
    }
};

let colData = [];

window.loadColFollowups = function() {
    colData = JSON.parse(localStorage.getItem('sp_collections_fu') || '[]');
    let tb = document.getElementById('cTbody');
    if (!tb) return;
    tb.innerHTML = '';
    if (colData.length === 0) {
        tb.innerHTML = \<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--tx3);">\</td></tr>\;
        return;
    }
    
    colData.sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(c => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        
        let stColor = c.status === 'paid' ? 'var(--gn)' : (new Date(c.date) < new Date() ? 'var(--rd)' : 'var(--am)');
        let stText = c.status === 'paid' ? (L==='ar'?'تم السداد':'Paid') : (new Date(c.date) < new Date() ? (L==='ar'?'متأخر بشدة':'Heavily Overdue') : (L==='ar'?'قيد الانتظار':'Pending'));
        
        let actions = c.status === 'paid' ? '-' : \<button class="btn" style="padding:4px 8px;font-size:0.75rem;background:var(--gn);color:#fff;" onclick="markColPaid(\)">\</button>\;
        
        tr.innerHTML = \
            <td style="padding:10px;font-weight:bold;">\</td>
            <td style="padding:10px;color:var(--rd);font-weight:bold;">\</td>
            <td style="padding:10px;">\</td>
            <td style="padding:10px;color:\;font-weight:bold;">\</td>
            <td style="padding:10px;">\</td>
        \;
        tb.appendChild(tr);
    });
};

window.addColModal = function() {
    let S_data = window.S || [];
    let cList = [...new Set(S_data.map(r=>r.Customer).filter(Boolean))];
    let opts = cList.map(c => \<option value="\">\</option>\).join('');
    let h = \
        <h3>\</h3>
        <label>\</label>
        <select id="ncCust" class="sbox" style="width:100%;margin-bottom:10px;">\</select>
        <label>\</label>
        <input type="number" id="ncAmount" class="sbox" style="width:100%;margin-bottom:10px;">
        <label>\</label>
        <input type="date" id="ncDate" class="sbox" style="width:100%;margin-bottom:10px;">
        <button class="btn" style="width:100%;background:var(--ac);color:#fff;" onclick="saveCol()">\</button>
    \;
    let m = document.createElement('div');
    m.className = 'modal show';
    m.id = 'cModal';
    m.innerHTML = \<div class="modal-content"><span class="modal-close" onclick="this.closest('.modal').remove()">×</span>\</div>\;
    document.body.appendChild(m);
};

window.saveCol = function() {
    let c = document.getElementById('ncCust').value;
    let a = document.getElementById('ncAmount').value;
    let d = document.getElementById('ncDate').value;
    if(!c || !a || !d) { alert('جميع الحقول مطلوبة'); return; }
    colData.push({ id: Date.now(), customer: c, amount: Number(a), date: d, status: 'pending' });
    localStorage.setItem('sp_collections_fu', JSON.stringify(colData));
    let modal = document.getElementById('cModal');
    if(modal) modal.remove();
    loadColFollowups();
    if(typeof toast === 'function') toast('تم إضافة المتأخرات', 'success');
};

window.markColPaid = function(id) {
    if(!confirm('هل أنت متأكد من تسجيل المبلغ كمسدد؟')) return;
    let idx = colData.findIndex(c => c.id === id);
    if(idx > -1) {
        colData[idx].status = 'paid';
        localStorage.setItem('sp_collections_fu', JSON.stringify(colData));
        loadColFollowups();
        if(typeof toast === 'function') toast('تم سداد المبلغ', 'success');
    }
};
