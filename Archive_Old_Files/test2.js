// js/settings.js

// --- CRM MODULES --- //
function rVisits() {
    $('M').innerHTML = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;">${ICONS.visits} ${t('visits')}</h1>
            <button class="btn btn-p" onclick="showAddVisit()">${L==='ar'?'إضافة زيارة':'Add Visit'}</button>
        </div>
        <div class="tb"><div class="tbt"><h3>${t('visits')}</h3></div>
        <div class="tbs"><table id="vTable"><thead><tr>
            <th>${L==='ar'?'التاريخ':'Date'}</th>
            <th>${t('customers')}</th>
            <th>${L==='ar'?'نوع الزيارة':'Type'}</th>
            <th>${L==='ar'?'ملاحظات':'Notes'}</th>
        </tr></thead><tbody>
            ${V.map(v => `<tr><td>${v.date||''}</td><td>${v.customer||''}</td><td>${v.type||''}</td><td>${v.notes||''}</td></tr>`).join('')}
        </tbody></table></div></div>
    `;
    initAnm && initAnm();
}

window.showAddVisit = function() {
    let cuOpts = Object.keys(S.reduce((acc, r) => { if(r.Customer) acc[r.Customer]=1; return acc; }, {})).map(c => `<option value="${c}">${c}</option>`).join('');
    
    let m = document.createElement('div');
    m.className = 'modal-bg';
    m.innerHTML = `
        <div class="modal-card">
            <h3 style="margin-bottom:16px;">${L==='ar'?'إضافة زيارة جديدة':'Add New Visit'}</h3>
            <input type="date" id="vDate" class="sbox" style="width:100%;margin-bottom:10px;" value="${new Date().toISOString().split('T')[0]}">
            <select id="vCust" class="sbox" style="width:100%;margin-bottom:10px;">
                <option value="">${L==='ar'?'اختر العميل':'Select Customer'}</option>
                ${cuOpts}
            </select>
            <select id="vType" class="sbox" style="width:100%;margin-bottom:10px;">
                <option value="Sales">${L==='ar'?'بيع':'Sales'}</option>
                <option value="Collection">${L==='ar'?'تحصيل':'Collection'}</option>
                <option value="PR">${L==='ar'?'علاقات عامة':'PR'}</option>
            </select>
            <textarea id="vNotes" class="sbox" placeholder="${L==='ar'?'ملاحظات':'Notes'}" style="width:100%;height:80px;margin-bottom:16px;"></textarea>
            <div style="display:flex;gap:10px;">
                <button class="btn btn-p" style="flex:1;" onclick="saveVisit()">${L==='ar'?'حفظ':'Save'}</button>
                <button class="btn" style="flex:1;" onclick="this.closest('.modal-bg').remove()">${L==='ar'?'إلغاء':'Cancel'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(m);
};

window.saveVisit = function() {
    let v = {
        date: $('vDate').value,
        customer: $('vCust').value,
        type: $('vType').value,
        notes: $('vNotes').value,
        timestamp: Date.now()
    };
    if(!v.customer) return toast('يرجى اختيار عميل');
    V.push(v);
    localStorage.setItem('visitsData', JSON.stringify(V));
    document.querySelector('.modal-bg').remove();
    toast(L==='ar'?'تم الحفظ':'Saved');
    rVisits();
    if(auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).collection('visits').add(v).catch(e=>console.error(e));
    }
};

function rLeads() {
    $('M').innerHTML = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;">${ICONS.leads} ${t('leads')}</h1>
            <button class="btn btn-p" onclick="showAddLead()">${L==='ar'?'إضافة عميل محتمل':'Add Lead'}</button>
        </div>
        <div class="tb"><div class="tbt"><h3>${t('leads')}</h3></div>
        <div class="tbs"><table id="ldTable"><thead><tr>
            <th>${L==='ar'?'الاسم':'Name'}</th>
            <th>${L==='ar'?'الفرع/المنطقة':'Branch/Region'}</th>
            <th>${L==='ar'?'رقم الهاتف':'Phone'}</th>
            <th>${L==='ar'?'الحالة':'Status'}</th>
        </tr></thead><tbody>
            ${LD.map(l => `<tr><td>${l.name||''}</td><td>${l.branch||''}</td><td>${l.phone||''}</td><td><span class="badge bg-${l.status==='Hot'?'g':l.status==='Warm'?'a':'r'}">${l.status||''}</span></td></tr>`).join('')}
        </tbody></table></div></div>
    `;
    initAnm && initAnm();
}

window.showAddLead = function() {
    let m = document.createElement('div');
    m.className = 'modal-bg';
    m.innerHTML = `
        <div class="modal-card">
            <h3 style="margin-bottom:16px;">${L==='ar'?'إضافة عميل محتمل':'Add Lead'}</h3>
            <input type="text" id="lName" class="sbox" placeholder="${L==='ar'?'اسم العميل':'Customer Name'}" style="width:100%;margin-bottom:10px;">
            <input type="text" id="lBranch" class="sbox" placeholder="${L==='ar'?'الفرع (حدائق القبة/الأقصر)':'Branch'}" style="width:100%;margin-bottom:10px;">
            <input type="text" id="lPhone" class="sbox" placeholder="${L==='ar'?'رقم الهاتف':'Phone'}" style="width:100%;margin-bottom:10px;">
            <select id="lStatus" class="sbox" style="width:100%;margin-bottom:16px;">
                <option value="Hot">${L==='ar'?'مهتم جداً (Hot)':'Hot'}</option>
                <option value="Warm">${L==='ar'?'متردد (Warm)':'Warm'}</option>
                <option value="Cold">${L==='ar'?'غير مهتم (Cold)':'Cold'}</option>
            </select>
            <div style="display:flex;gap:10px;">
                <button class="btn btn-p" style="flex:1;" onclick="saveLead()">${L==='ar'?'حفظ':'Save'}</button>
                <button class="btn" style="flex:1;" onclick="this.closest('.modal-bg').remove()">${L==='ar'?'إلغاء':'Cancel'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(m);
};

window.saveLead = function() {
    let l = {
        name: $('lName').value,
        branch: $('lBranch').value,
        phone: $('lPhone').value,
        status: $('lStatus').value,
        timestamp: Date.now()
    };
    if(!l.name) return toast('يرجى إدخال اسم العميل');
    LD.push(l);
    localStorage.setItem('leadsData', JSON.stringify(LD));
    document.querySelector('.modal-bg').remove();
    toast(L==='ar'?'تم الحفظ':'Saved');
    rLeads();
    if(auth.currentUser) {
        db.collection('users').doc(auth.currentUser.uid).collection('leads').add(l).catch(e=>console.error(e));
    }
};

function rAI() {
    let apiKey = localStorage.getItem('gemini_api_key') || '';
    
    $('M').innerHTML = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;">${ICONS.ai} ${t('ai')}</h1>
        </div>
        <div style="background:var(--bg2); border-radius:16px; padding:24px; border:1px solid var(--bd);">
            <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:8px;color:var(--tx2);">${L==='ar'?'مفتاح Gemini API:':'Gemini API Key:'}</label>
                <input type="password" id="aiKey" class="sbox" value="${apiKey}" style="width:100%;max-width:400px;" placeholder="AIzaSy...">
                <button class="btn btn-p" style="margin-top:8px;" onclick="localStorage.setItem('gemini_api_key', $('aiKey').value); toast('تم حفظ المفتاح');">${L==='ar'?'حفظ المفتاح':'Save Key'}</button>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" style="margin-left:10px;color:var(--am);font-size:0.9rem;">${L==='ar'?'الحصول على مفتاح مجاني':'Get Free Key'}</a>
            </div>
            
            <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
                <button class="btn btn-p" onclick="aiAnalyze('sales')">${L==='ar'?'تحليل المبيعات (حدائق القبة والأقصر)':'Analyze Sales & Branches'}</button>
                <button class="btn btn-p" onclick="aiAnalyze('collections')">${L==='ar'?'متابعة التحصيلات المتأخرة':'Analyze Collections'}</button>
                <button class="btn btn-p" onclick="aiAnalyze('leads')">${L==='ar'?'خطة للعملاء الجدد':'Plan for Leads'}</button>
            </div>
            
            <div id="aiResponse" style="min-height:200px;background:var(--bg);border-radius:12px;padding:16px;border:1px solid var(--bd);white-space:pre-wrap;color:var(--tx);line-height:1.6;">
                ${L==='ar'?'اضغط على أحد الأزرار أعلاه ليقوم المساعد الذكي بتحليل بياناتك وإعطائك خطط زيادة المبيعات.':'Click a button above to get AI analysis.'}
            </div>
        </div>
    `;
    initAnm && initAnm();
}

window.aiAnalyze = async function(type) {
    let key = localStorage.getItem('gemini_api_key');
    if(!key) {
        alert(L==='ar'?'يرجى إدخال مفتاح Gemini API أولاً.':'Please enter Gemini API key first.');
        return;
    }
    
    $('aiResponse').innerHTML = '<div class="splash-loader" style="width:100%;background:var(--bd);"><div class="splash-loader-bar"></div></div><br/>' + (L==='ar'?'جاري التحليل والاتصال بالذكاء الاصطناعي...':'Analyzing...');
    
    let prompt = '';
    if(type === 'sales') {
        prompt = "أنت مساعد مبيعات ذكي. قم بتحليل استراتيجيات البيع لفرعي 'حدائق القبة' و 'الأقصر' واقترح 3 خطط عملية لزيادة المبيعات وتحقيق التارجت في هذين الفرعين باللغة العربية بطريقة احترافية.";
    } else if(type === 'collections') {
        prompt = "بصفتك مستشار مالي ومبيعات، اكتب لي خطة من 3 خطوات لمعالجة العملاء المتأخرين في السداد بأسلوب يحافظ على العلاقات العامة (PR) ويضمن التحصيل السريع باللغة العربية.";
    } else if(type === 'leads') {
        prompt = "اكتب لي سكريبت مبيعات مكالمة هاتفية (Cold Call) لاستهداف العملاء المحتملين (Leads) الجدد في قطاع المبيعات وإقناعهم باللغة العربية.";
    }
    
    try {
        let models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
        let data = null;
        for (let m of models) {
            try {
                let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ contents: [{parts: [{text: prompt}]}] })
                });
                let d = await res.json();
                if(!d.error) { data = d; break; }
                if(d.error && m === models[models.length-1]) throw new Error(d.error.message);
            } catch(ex) {
                if(m === models[models.length-1]) throw ex;
            }
        }
        
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>').replace(/\n/g, '<br/>');
        $('aiResponse').innerHTML = text;
    } catch (e) {
        $('aiResponse').innerHTML = `<span style="color:var(--rd)">${L==='ar'?'حدث خطأ:':'Error:'} ${e.message}</span>`;
    }
};
// --- END CRM MODULES --- //

function rSettings() {
    $('M').innerHTML = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;">
                <span style="width:32px;height:32px;display:flex;">⚙️</span> ${t('settings')}
            </h1>
            <p>${L==='ar'?'تخصيص ألوان التطبيق، والواجهة، وإعدادات المزامنة':'Customize app colors, interface, and sync settings'}</p>
        </div>
        
        <div class="card" style="margin-bottom:20px;">
            <h3>🎨 ${L==='ar'?'اللون الأساسي':'Primary Color'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'اختر اللون الذي يناسب ذوقك':'Choose the color that fits you'}</p>
            
            <div style="display:flex;gap:12px;flex-wrap:wrap;" id="colorPicker">
                ${CL.map((color, i) => `
                    <div class="color-btn" data-color="${color}" style="width:40px;height:40px;border-radius:50%;background-color:${color};cursor:pointer;border:2px solid ${ld('sp_primary')===color?'var(--tx1)':'transparent'};transition:all 0.2s;"></div>
                `).join('')}
            </div>
        </div>
        
        <div class="card" style="margin-bottom:20px;">
            <h3>☁️ ${L==='ar'?'النسخ الاحتياطي السحابي (Google Drive)':'Cloud Sync (Google Drive)'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'حفظ البيانات واسترجاعها مباشرة من حسابك في جوجل درايف.':'Backup and restore data directly from your Google Drive.'}</p>
            
            <div style="background:var(--bg3);padding:10px;border-radius:8px;margin-bottom:15px;">
                <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:10px;">${L==='ar'?'تحتاج إلى إدخال مفاتيح Google API لكي تعمل المزامنة:':'You must enter Google API keys for sync to work:'}</p>
                <input type="text" id="gdriveClientId" placeholder="Google Client ID" class="sbox" style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('gdrive_client_id') || ''}">
                <input type="text" id="gdriveApiKey" placeholder="Google API Key" class="sbox" style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('gdrive_api_key') || ''}">
                <button class="btn btn-p" onclick="saveDriveKeys()" style="width:100%;">${L==='ar'?'حفظ مفاتيح جوجل':'Save Google Keys'}</button>
            </div>

            <div id="driveStatus" style="font-size:0.85rem;color:var(--tx2);margin-bottom:16px;padding:10px;background:var(--bg3);border-radius:8px;">⏳ ${L==='ar'?'جاري التحقق...':'Checking...'}</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn btn-p" onclick="backupToGoogleDrive()" style="flex:1;min-width:140px;background:var(--ok);">
                    ☁️ ${L==='ar'?'حفظ في درايف':'Save to Drive'}
                </button>
                <button class="btn" onclick="restoreFromGoogleDrive()" style="flex:1;min-width:140px;background:var(--bg3);">
                    📂 ${L==='ar'?'استرجاع من درايف':'Restore from Drive'}
                </button>
            </div>
        </div>

        <div class="card" style="margin-bottom:20px;">
            <h3>🤖 ${L==='ar'?'إعدادات المساعد الذكي (Gemini AI)':'Gemini AI Settings'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'أدخل مفتاح Gemini API لتفعيل المساعد الذكي':'Enter Gemini API key to enable smart assistant'}</p>
            <div class="fg">
                <input type="text" id="geminiApiKey" placeholder="${L==='ar'?'Gemini API Key':'Gemini API Key'}" class="sbox" style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('gemini_api_key') || ''}">
            </div>
            <button class="btn btn-p" onclick="saveGeminiKey()">${L==='ar'?'حفظ المفتاح':'Save Key'}</button>
        </div>
        
                <div class="card" style="margin-bottom:20px;">
            <h3>📧 ${L==='ar'?'التقارير اليومية الآلية':'Automated Daily Reports'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'أدخل رابط (Web App URL) لربط الأبلكيشن بالإيميل':'Enter Web App URL to link with email'}</p>
            <div class="fg">
                <input type="text" id="inReportUrl" class="sbox" placeholder="https://script.google.com/macros/s/..." style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('report_url') || ''}">
            </div>
            <button class="btn btn-p" onclick="saveReportUrl()">${L==='ar'?'حفظ الرابط':'Save URL'}</button>
        </div>
        <div class="card">
            <h3>👤 ${L==='ar'?'الملف الشخصي':'Profile'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${currentUser ? currentUser.email : 'Not logged in'}</p>
            <button class="btn btn-p" onclick="logout()" style="background:var(--rd)">${t('logout')}</button>
        </div>
    `;

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.onclick = () => {
            let col = btn.getAttribute('data-color');
            sv('sp_primary', col);
            document.documentElement.style.setProperty('--am', col);
            document.querySelectorAll('.color-btn').forEach(b => b.style.border = '2px solid transparent');
            btn.style.border = '2px solid var(--tx1)';
        };
    });

    // Load cloud backup info
    if (typeof window.getCloudInfo === 'function') {
        window.getCloudInfo().then(info => {
            let ds = document.getElementById('driveStatus');
            if (!ds) return;
            if (!info) {
                ds.innerHTML = L==='ar' ? '⚠️ لم تقم بعمل مزامنة في جوجل درايف مؤخراً.' : '⚠️ No recent Google Drive sync.';
                return;
            }
            ds.innerHTML = `✅ <strong>${L==='ar'?'آخر مزامنة:':'Last sync:'}</strong> ${info.lastUpdated}
                &nbsp;|&nbsp; 📊 ${L==='ar'?'المبيعات:':'Sales:'} ${info.salesCount}
                &nbsp;|&nbsp; 💰 ${L==='ar'?'التحصيلات:':'Collections:'} ${info.payCount}`;
        });
    }
}

window.saveDriveKeys = function() {
    const cId = document.getElementById('gdriveClientId').value.trim();
    const aKey = document.getElementById('gdriveApiKey').value.trim();
    if (cId && aKey) {
        localStorage.setItem('gdrive_client_id', cId);
        localStorage.setItem('gdrive_api_key', aKey);
        if(typeof toast === 'function') toast(L==='ar'?'✅ تم حفظ مفاتيح جوجل درايف بنجاح.':'Google Drive keys saved', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } else {
        if(typeof toast === 'function') toast(L==='ar'?'❌ يرجى إدخال المفتاحين (Client ID و API Key)':'Please enter both keys', 'error');
    }
};

window.saveGeminiKey = function() {
    const gKey = document.getElementById('geminiApiKey').value.trim();
    if (gKey) {
        localStorage.setItem('gemini_api_key', gKey);
        if(typeof toast === 'function') toast(L==='ar'?'تم حفظ مفتاح Gemini بنجاح':'Gemini key saved', 'success');
    } else {
        if(typeof toast === 'function') toast(L==='ar'?'يرجى إدخال المفتاح أولاً':'Please enter the key', 'error');
    }
};

</script>
