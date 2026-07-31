// new_features.js - Added for Visits, Leads, AI Assistant, Collections Follow-up

// Inject Custom CSS for Modals to match the dark theme perfectly
(function injectStyles() {
    if(document.getElementById('sp-new-features-css')) return;
    let style = document.createElement('style');
    style.id = 'sp-new-features-css';
    style.innerHTML = `
        .sp-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
            display: flex; justify-content: center; align-items: center; z-index: 9999;
            opacity: 0; animation: spFadeIn 0.3s forwards;
        }
        .sp-modal-content {
            background: var(--bg2); width: 90%; max-width: 450px;
            border-radius: 16px; padding: 24px; position: relative;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            transform: translateY(20px); animation: spSlideUp 0.3s forwards;
            border: 1px solid var(--bd);
        }
        .sp-modal-close {
            position: absolute; top: 16px; left: 16px; cursor: pointer;
            font-size: 1.5rem; color: var(--tx3); line-height: 1;
        }
        .sp-modal-close:hover { color: var(--rd); }
        @keyframes spFadeIn { to { opacity: 1; } }
        @keyframes spSlideUp { to { transform: translateY(0); } }
        
        .sp-form-label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--tx2); font-size: 0.9rem; }
        .sp-form-input { 
            width: 100%; padding: 12px; margin-bottom: 16px; 
            background: var(--bg3); border: 1px solid var(--bd); 
            color: var(--tx1); border-radius: 8px; font-family: inherit;
        }
        .sp-form-input:focus { border-color: var(--ac); outline: none; }
        .sp-btn-primary {
            width: 100%; padding: 12px; background: var(--ac); color: #fff;
            border: none; border-radius: 8px; font-weight: bold; cursor: pointer;
            transition: opacity 0.2s;
        }
        .sp-btn-primary:hover { opacity: 0.9; }
    `;
    document.head.appendChild(style);
})();

// =======================
// VISITS (الزيارات)
// =======================
function rVisits() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let html = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🚗</span> ${L==='ar'?'الزيارات ومتابعة العملاء':'Visits & Follow-up'}</h1>
            <button class="btn" onclick="addVisitModal()" style="background:var(--ac);color:#fff;font-weight:bold;">➕ ${L==='ar'?'زيارة جديدة':'New Visit'}</button>
        </div>
        <div class="card" id="visitsList" style="margin-top:20px;">
            <div style="overflow-x:auto;">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--bd);">
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'التاريخ':'Date'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'العميل':'Customer'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'النتيجة':'Outcome'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'الزيارة القادمة':'Next Visit'}</th>
                        </tr>
                    </thead>
                    <tbody id="vTbody">
                    </tbody>
                </table>
            </div>
        </div>
    `;
    let M = document.getElementById('M');
    if(M) M.innerHTML = html;
    loadVisits();
}

let visitsData = [];

function loadVisits() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    visitsData = JSON.parse(localStorage.getItem('sp_visits') || '[]');
    let tb = document.getElementById('vTbody');
    if (!tb) return;
    tb.innerHTML = '';
    if (visitsData.length === 0) {
        tb.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--tx3);">${L==='ar'?'لا توجد زيارات مسجلة. ابدأ بإضافة زيارة جديدة!':'No visits logged'}</td></tr>`;
        return;
    }
    visitsData.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(v => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        tr.innerHTML = `
            <td style="padding:15px 10px;">${v.date}</td>
            <td style="padding:15px 10px;font-weight:bold;color:var(--ac);">${v.customer}</td>
            <td style="padding:15px 10px;white-space:normal;">${v.outcome}</td>
            <td style="padding:15px 10px;"><span style="background:var(--bg3);padding:4px 8px;border-radius:4px;">${v.nextDate || '-'}</span></td>
        `;
        tb.appendChild(tr);
    });
}

window.addVisitModal = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let S = window.S || [];
    let cList = [...new Set(S.map(r=>r.Customer).filter(Boolean))];
    let opts = cList.map(c => `<option value="${c}">${c}</option>`).join('');
    let h = `
        <h3 style="margin-bottom:20px;font-size:1.2rem;display:flex;align-items:center;gap:8px;">🚗 ${L==='ar'?'تسجيل زيارة جديدة':'Log New Visit'}</h3>
        <label class="sp-form-label">${L==='ar'?'العميل':'Customer'}</label>
        <select id="nvCust" class="sp-form-input">${opts}</select>
        
        <label class="sp-form-label">${L==='ar'?'تاريخ الزيارة':'Visit Date'}</label>
        <input type="date" id="nvDate" class="sp-form-input" value="${new Date().toISOString().split('T')[0]}">
        
        <label class="sp-form-label">${L==='ar'?'نتائج الزيارة / ملاحظات':'Outcome / Notes'}</label>
        <textarea id="nvOutcome" class="sp-form-input" style="height:80px;resize:vertical;" placeholder="${L==='ar'?'ماذا حدث في الزيارة؟':'What happened?'}"></textarea>
        
        <label class="sp-form-label">${L==='ar'?'موعد الزيارة القادمة':'Next Visit Date'}</label>
        <input type="date" id="nvNext" class="sp-form-input">
        
        <button class="sp-btn-primary" onclick="saveVisit()">${L==='ar'?'حفظ الزيارة':'Save Visit'}</button>
    `;
    let m = document.createElement('div');
    m.className = 'sp-modal-overlay';
    m.id = 'vModal';
    m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>${h}</div>`;
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
    let L = localStorage.getItem('sp_lang') || 'ar';
    let html = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">🤝</span> ${L==='ar'?'عملاء محتملين (Leads)':'Potential Clients'}</h1>
            <button class="btn" onclick="addLeadModal()" style="background:var(--ac);color:#fff;font-weight:bold;">➕ ${L==='ar'?'إضافة عميل محتمل':'Add Lead'}</button>
        </div>
        <div class="kg" style="margin-top:20px;margin-bottom:20px;">
            <div class="ki"><div class="lb">${L==='ar'?'إجمالي المحتملين':'Total Leads'}</div><div class="vl" id="ldTot">0</div></div>
            <div class="ki" style="color:var(--am)"><div class="lb">${L==='ar'?'قيد التواصل':'In Progress'}</div><div class="vl" id="ldInp">0</div></div>
            <div class="ki" style="color:var(--gn)"><div class="lb">${L==='ar'?'تم التحويل (Converted)':'Converted'}</div><div class="vl" id="ldConv">0</div></div>
        </div>
        <div class="card" id="leadsList">
            <div style="overflow-x:auto;">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--bd);">
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'الاسم':'Name'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'رقم الهاتف':'Phone'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'الحالة':'Status'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'الإجراء':'Action'}</th>
                        </tr>
                    </thead>
                    <tbody id="lTbody">
                    </tbody>
                </table>
            </div>
        </div>
    `;
    let M = document.getElementById('M');
    if(M) M.innerHTML = html;
    loadLeads();
}

let leadsData = [];

function loadLeads() {
    let L = localStorage.getItem('sp_lang') || 'ar';
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
        let stText = ld.status === 'converted' ? (L==='ar'?'عميل فعلي':'Converted') : (L==='ar'?'تواصل مبدئي':'Pending');
        
        let actions = ld.status === 'converted' ? '<span style="color:var(--tx3);">-</span>' : `<button class="btn" style="padding:6px 12px;font-size:0.8rem;background:var(--gn);color:#fff;border-radius:6px;font-weight:bold;" onclick="convertLead(${ld.id})">${L==='ar'?'تحويل لعميل':'Convert'}</button>`;
        
        tr.innerHTML = `
            <td style="padding:15px 10px;font-weight:bold;">${ld.name}</td>
            <td style="padding:15px 10px;color:var(--tx2);">${ld.phone || '-'}</td>
            <td style="padding:15px 10px;"><span style="color:${stColor};background:var(--bg3);padding:4px 8px;border-radius:4px;font-weight:bold;font-size:0.85rem;">${stText}</span></td>
            <td style="padding:15px 10px;">${actions}</td>
        `;
        tb.appendChild(tr);
    });
    
    if(tot===0) {
        tb.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--tx3);">${L==='ar'?'لا يوجد عملاء محتملين. ابدأ بإضافة عميل!':'No leads'}</td></tr>`;
    }
    
    document.getElementById('ldTot').textContent = tot;
    document.getElementById('ldInp').textContent = inp;
    document.getElementById('ldConv').textContent = conv;
}

window.addLeadModal = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let h = `
        <h3 style="margin-bottom:20px;font-size:1.2rem;display:flex;align-items:center;gap:8px;">🤝 ${L==='ar'?'إضافة عميل محتمل':'Add Lead'}</h3>
        <label class="sp-form-label">${L==='ar'?'اسم العميل':'Client Name'}</label>
        <input type="text" id="nlName" class="sp-form-input" placeholder="${L==='ar'?'الاسم...':'Name...'}">
        
        <label class="sp-form-label">${L==='ar'?'رقم الهاتف':'Phone'}</label>
        <input type="text" id="nlPhone" class="sp-form-input" placeholder="${L==='ar'?'01...':'01...'}">
        
        <label class="sp-form-label">${L==='ar'?'ملاحظات / الاهتمام':'Notes'}</label>
        <textarea id="nlNotes" class="sp-form-input" style="height:80px;resize:vertical;" placeholder="${L==='ar'?'اكتب تفاصيل الفرصة...':'Notes...'}"></textarea>
        
        <button class="sp-btn-primary" onclick="saveLead()">${L==='ar'?'حفظ العميل':'Save Lead'}</button>
    `;
    let m = document.createElement('div');
    m.className = 'sp-modal-overlay';
    m.id = 'lModal';
    m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>${h}</div>`;
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
    let L = localStorage.getItem('sp_lang') || 'ar';
    if(!confirm(L==='ar'?'هل أنت متأكد من تحويل هذا العميل إلى عميل فعلي؟':'Convert this lead to a real customer?')) return;
    let idx = leadsData.findIndex(l => l.id === id);
    if(idx > -1) {
        leadsData[idx].status = 'converted';
        localStorage.setItem('sp_leads', JSON.stringify(leadsData));
        loadLeads();
        if(typeof toast === 'function') toast(L==='ar'?'تم التحويل بنجاح':'Converted successfully', 'success');
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
        let emailBody = encodeURIComponent(`تنبيه: يوجد ${delayCount} عملاء متأخرين عن تحقيق 50% من المستهدف. يرجى المتابعة.`);
        let h = `
            <div style="text-align:center;padding:10px;">
                <div style="font-size:3.5rem;margin-bottom:10px;">⚠️</div>
                <h2 style="color:var(--rd);margin:0 0 10px 0;">تنبيهات المتأخرات اليومية</h2>
                <p style="margin-bottom:20px;color:var(--tx2);line-height:1.5;">يوجد <strong>${delayCount}</strong> عملاء متأخرين عن تحقيق المستهدف (أقل من 50%). يرجى مراجعة صفحة التنبيهات.</p>
                <div style="display:flex;gap:10px;flex-direction:column;">
                    <button class="sp-btn-primary" onclick="this.closest('.sp-modal-overlay').remove(); if(typeof P!=='undefined'){ P='alerts'; if(typeof buildNav==='function') buildNav(); if(typeof render==='function') render(); }">مراجعة التنبيهات في التطبيق</button>
                    <a href="mailto:?subject=تنبيه تأخير تارجت العملاء&body=${emailBody}" class="btn" style="background:var(--bg3);color:var(--tx1);border:1px solid var(--bd);padding:12px;border-radius:8px;text-decoration:none;display:block;">📧 إرسال تنبيه عبر الإيميل</a>
                </div>
            </div>
        `;
        let m = document.createElement('div');
        m.className = 'sp-modal-overlay';
        m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>${h}</div>`;
        document.body.appendChild(m);
    }
    
    localStorage.setItem('sp_last_alert_check', today);
};

let oldInit = window.init;
window.init = function() {
    if(oldInit) oldInit();
    setTimeout(window.checkDailyAlerts, 3000);
    setTimeout(window.injectBranchCards, 3000);
};

// =======================
// GEMINI AI INTEGRATION
// =======================
window.askGemini = async function() {
    let q = document.getElementById('aiInput').value;
    if(!q) return;
    
    let apiKey = localStorage.getItem('sp_gemini_key');
    if(!apiKey) {
        let h = `
            <h3 style="margin-bottom:15px;color:var(--tx1);">🤖 تفعيل المساعد الذكي</h3>
            <p style="color:var(--tx2);font-size:0.9rem;margin-bottom:15px;line-height:1.5;">لإستخدام المساعد الذكي، يرجى إدخال مفتاح Google Gemini API Key الخاص بك (يمكنك الحصول عليه مجاناً من Google AI Studio).</p>
            <input type="text" id="tmpApiKey" class="sp-form-input" placeholder="AIzaSy...">
            <button class="sp-btn-primary" onclick="
                let k = document.getElementById('tmpApiKey').value;
                if(k) { localStorage.setItem('sp_gemini_key', k); this.closest('.sp-modal-overlay').remove(); window.askGemini(); }
            ">حفظ المفتاح</button>
        `;
        let m = document.createElement('div');
        m.className = 'sp-modal-overlay';
        m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>${h}</div>`;
        document.body.appendChild(m);
        return;
    }
    
    let resDiv = document.getElementById('aiResponse');
    resDiv.innerHTML = '<div style="color:var(--ac);padding:15px;text-align:center;background:var(--bg3);border-radius:12px;">جارٍ التحليل والتفكير... 🤖</div>';
    
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
            context += "مبيعات فرع حدائق القبة: " + qobbahSales + "\n";
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
            resDiv.innerHTML = '<div style="color:var(--rd);padding:15px;background:var(--bg3);border-radius:12px;">خطأ في API: ' + data.error.message + '</div>';
            return;
        }
        
        let text = data.candidates[0].content.parts[0].text;
        let htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--ac);">$1</strong>').replace(/\n/g, '<br>');
        resDiv.innerHTML = '<div style="background:var(--bg3);padding:20px;border-radius:12px;border:1px solid var(--bd);line-height:1.7;color:var(--tx1);font-size:0.95rem;">' + htmlText + '</div>';
        
    } catch(err) {
        resDiv.innerHTML = '<div style="color:var(--rd);padding:15px;background:var(--bg3);border-radius:12px;">حدث خطأ في الاتصال. تأكد من صحة المفتاح والإنترنت.</div>';
    }
};

let old_rAI = window.rAI;
window.rAI = function() {
    if(old_rAI) old_rAI();
    let L = localStorage.getItem('sp_lang') || 'ar';
    let aiCard = document.createElement('div');
    aiCard.className = 'card';
    aiCard.style.marginTop = '20px';
    aiCard.innerHTML = `
        <h3 style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">🤖 ${L==='ar'?'المساعد الذكي (Gemini AI)':'AI Assistant'}</h3>
        <p style="color:var(--tx2);font-size:0.95rem;margin-bottom:20px;line-height:1.5;">${L==='ar'?'اطرح سؤالاً عن مبيعاتك، أو اطلب خطة لتطوير المبيعات وتحقيق التارجت للعملاء أو للفروع (مثل فرع الأقصر أو حدائق القبة).':'Ask anything about sales or request a plan.'}</p>
        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
            <input type="text" id="aiInput" class="sp-form-input" style="flex:1;min-width:250px;margin:0;" placeholder="${L==='ar'?'مثال: اقترح خطة لزيادة مبيعات فرع الأقصر هذا الشهر...':'Ask something...'}">
            <button class="sp-btn-primary" style="width:auto;min-width:120px;" onclick="askGemini()">${L==='ar'?'إرسال للذكاء الاصطناعي':'Send'}</button>
        </div>
        <div id="aiResponse"></div>
    `;
    let M = document.getElementById('M');
    if(M) M.appendChild(aiCard);
};

// =======================
// COLLECTIONS FOLLOW-UP (التحصيلات)
// =======================
let old_rCollections = window.rCollections;
window.rCollections = function() {
    if(old_rCollections) old_rCollections();
    let L = localStorage.getItem('sp_lang') || 'ar';
    
    let html = `
        <div class="card" style="margin-top:20px; border-top:4px solid var(--ac);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
                <h3 style="margin:0;display:flex;align-items:center;gap:8px;">💰 ${L==='ar'?'متابعة التحصيلات والمتأخرات':'Collections Follow-up'}</h3>
                <button class="btn" style="background:var(--ac);color:#fff;font-weight:bold;padding:8px 16px;" onclick="addColModal()">➕ ${L==='ar'?'إضافة متابعة تحصيل':'Add Follow-up'}</button>
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%;text-align:left;border-collapse:collapse;white-space:nowrap;">
                    <thead>
                        <tr style="border-bottom:2px solid var(--bd);">
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'العميل':'Customer'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'المبلغ المتأخر':'Overdue Amount'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'موعد السداد المتوقع':'Expected Date'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'الحالة':'Status'}</th>
                            <th style="padding:15px 10px;color:var(--tx2);">${L==='ar'?'الإجراء':'Action'}</th>
                        </tr>
                    </thead>
                    <tbody id="cTbody">
                    </tbody>
                </table>
            </div>
        </div>
    `;
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
    let L = localStorage.getItem('sp_lang') || 'ar';
    colData = JSON.parse(localStorage.getItem('sp_collections_fu') || '[]');
    let tb = document.getElementById('cTbody');
    if (!tb) return;
    tb.innerHTML = '';
    if (colData.length === 0) {
        tb.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--tx3);">${L==='ar'?'لا يوجد ديون مسجلة للمتابعة.':'No collections tracked'}</td></tr>`;
        return;
    }
    
    colData.sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(c => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--bd-s)';
        
        let stColor = c.status === 'paid' ? 'var(--gn)' : (new Date(c.date) < new Date() ? 'var(--rd)' : 'var(--am)');
        let stText = c.status === 'paid' ? (L==='ar'?'تم السداد':'Paid') : (new Date(c.date) < new Date() ? (L==='ar'?'متأخر بشدة':'Heavily Overdue') : (L==='ar'?'قيد الانتظار':'Pending'));
        
        let actions = c.status === 'paid' ? '<span style="color:var(--tx3);">-</span>' : `<button class="btn" style="padding:6px 12px;font-size:0.8rem;background:var(--gn);color:#fff;border-radius:6px;font-weight:bold;" onclick="markColPaid(${c.id})">${L==='ar'?'تم السداد':'Mark Paid'}</button>`;
        
        tr.innerHTML = `
            <td style="padding:15px 10px;font-weight:bold;color:var(--tx1);">${c.customer}</td>
            <td style="padding:15px 10px;color:var(--rd);font-weight:bold;font-size:1.1rem;">${typeof fmt==='function'?fmt(c.amount):c.amount}</td>
            <td style="padding:15px 10px;color:var(--tx2);">${c.date}</td>
            <td style="padding:15px 10px;"><span style="color:${stColor};background:var(--bg3);padding:4px 8px;border-radius:4px;font-weight:bold;font-size:0.85rem;">${stText}</span></td>
            <td style="padding:15px 10px;">${actions}</td>
        `;
        tb.appendChild(tr);
    });
};

window.addColModal = function() {
    let L = localStorage.getItem('sp_lang') || 'ar';
    let S_data = window.S || [];
    let cList = [...new Set(S_data.map(r=>r.Customer).filter(Boolean))];
    let opts = cList.map(c => `<option value="${c}">${c}</option>`).join('');
    let h = `
        <h3 style="margin-bottom:20px;font-size:1.2rem;display:flex;align-items:center;gap:8px;">💰 ${L==='ar'?'إضافة مبلغ متأخر للعميل':'Add Overdue Amount'}</h3>
        <label class="sp-form-label">${L==='ar'?'العميل':'Customer'}</label>
        <select id="ncCust" class="sp-form-input">${opts}</select>
        
        <label class="sp-form-label">${L==='ar'?'المبلغ المتأخر':'Overdue Amount'}</label>
        <input type="number" id="ncAmount" class="sp-form-input" placeholder="0.00">
        
        <label class="sp-form-label">${L==='ar'?'موعد السداد المتوقع':'Expected Payment Date'}</label>
        <input type="date" id="ncDate" class="sp-form-input" value="${new Date().toISOString().split('T')[0]}">
        
        <button class="sp-btn-primary" onclick="saveCol()">${L==='ar'?'حفظ המتابعة':'Save'}</button>
    `;
    let m = document.createElement('div');
    m.className = 'sp-modal-overlay';
    m.id = 'cModal';
    m.innerHTML = `<div class="sp-modal-content"><span class="sp-modal-close" onclick="this.closest('.sp-modal-overlay').remove()">×</span>${h}</div>`;
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
    let L = localStorage.getItem('sp_lang') || 'ar';
    if(!confirm(L==='ar'?'هل أنت متأكد من تسجيل المبلغ كمسدد؟':'Mark as paid?')) return;
    let idx = colData.findIndex(c => c.id === id);
    if(idx > -1) {
        colData[idx].status = 'paid';
        localStorage.setItem('sp_collections_fu', JSON.stringify(colData));
        loadColFollowups();
        if(typeof toast === 'function') toast(L==='ar'?'تم سداد المبلغ':'Marked as paid', 'success');
    }
};

// =======================
// DYNAMIC UI INJECTION & BRANCH CARDS
// =======================
window.injectBranchCards = function() {
    // Only inject in Dashboard
    if(typeof P !== 'undefined' && P === 'dash') {
        let S_data = window.S || [];
        if(S_data.length === 0) return;
        
        // Calculate Branch Sales
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
        
        let dashCards = document.querySelector('.kg'); // The grid for KPIs
        if(dashCards && !document.getElementById('branchLuxor')) {
            let L = localStorage.getItem('sp_lang') || 'ar';
            let html = `
                <div class="ki" id="branchLuxor" style="border-left: 3px solid var(--ac); background: var(--bg3);">
                    <div class="lb">${L==='ar'?'مبيعات الأقصر':'Luxor Sales'}</div>
                    <div class="vl" style="color:var(--tx1);">${typeof fmt==='function'?fmt(luxorSales):luxorSales}</div>
                </div>
                <div class="ki" id="branchQobbah" style="border-left: 3px solid var(--pu); background: var(--bg3);">
                    <div class="lb">${L==='ar'?'مبيعات حدائق القبة':'Qobbah Sales'}</div>
                    <div class="vl" style="color:var(--tx1);">${typeof fmt==='function'?fmt(qobbahSales):qobbahSales}</div>
                </div>
            `;
            dashCards.insertAdjacentHTML('beforeend', html);
        }
    }
};

(function injectNavItems() {
    if (typeof NAV !== 'undefined') {
        if (!NAV.find(n => n.p === 'visits')) {
            let coreIdx = NAV.findIndex(n => n.s && (n.s.en === 'Depts' || n.s.en === 'Advanced'));
            if (coreIdx > -1) {
                NAV.splice(coreIdx, 0, {p:'visits',ic:'🚗'}, {p:'leads',ic:'🤝'});
            } else {
                NAV.push({p:'visits',ic:'🚗'}, {p:'leads',ic:'🤝'});
            }
        }
    }
    if (typeof ICONS !== 'undefined') {
        ICONS['visits'] = '🚗';
        ICONS['leads'] = '🤝';
    }
})();

let old_buildNav = window.buildNav;
window.buildNav = function() {
    if(old_buildNav) old_buildNav();
    
    setTimeout(() => {
        let L = localStorage.getItem('sp_lang') || 'ar';
        let elVisits = document.querySelector('.ni[data-p="visits"] span:nth-child(2)');
        if(elVisits) elVisits.textContent = L==='ar' ? 'الزيارات' : 'Visits';
        
        let elLeads = document.querySelector('.ni[data-p="leads"] span:nth-child(2)');
        if(elLeads) elLeads.textContent = L==='ar' ? 'محتملين' : 'Leads';
        
        let elCol = document.querySelector('.ni[data-p="collections"] span:nth-child(2)');
        if(elCol) elCol.textContent = L==='ar' ? 'التحصيلات' : 'Collections';
    }, 50);
};

let old_render = window.render;
window.render = function() {
    if (typeof P !== 'undefined') {
        if (P === 'visits') {
            if (typeof buildNav === 'function') buildNav();
            rVisits();
            return;
        }
        if (P === 'leads') {
            if (typeof buildNav === 'function') buildNav();
            rLeads();
            return;
        }
        if (P === 'collections') {
            if (typeof buildNav === 'function') buildNav();
            if (typeof rCollections === 'function') rCollections();
            return;
        }
    }
    if (old_render) old_render();
    setTimeout(window.injectBranchCards, 100);
};
