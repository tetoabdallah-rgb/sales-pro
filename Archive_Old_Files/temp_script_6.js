
// js/settings.js

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
        
        <div class="card" style="margin-bottom:20px; border-top: 4px solid #10b981;">
            <h3 style="display:flex;align-items:center;gap:8px;">📧 ${L==='ar'?'التقرير اليومي التلقائي للإيميل (المبيعات والتحصيلات والعملاء)':'Automated Daily Email Report'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">
                ${L==='ar'?'إرسال ملخص يومي تلقائي إلى بريدك الإلكتروني بكل ما حدث في النظام من مبيعات، تحصيل، وأداء العملاء دون أي عناء أو تدخل يدوي.':'Automatically send a daily summary to your email with all sales, collections, and customer activity.'}
            </p>
            
            <div style="background:var(--bg3);padding:14px;border-radius:10px;margin-bottom:15px;border:1px solid var(--bd);">
                <div style="margin-bottom:12px;">
                    <label style="font-size:0.85rem;font-weight:bold;display:block;margin-bottom:6px;">${L==='ar'?'البريد الإلكتروني المستلم (الخاص بك):':'Recipient Email Address:'}</label>
                    <input type="email" id="repEmailInput" placeholder="name@example.com" class="sbox" style="width:100%;padding:10px;border-radius:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_report_email') || (typeof currentUser !== 'undefined' && currentUser ? currentUser.email : '')}">
                </div>
                
                <div style="margin-bottom:12px;">
                    <label style="font-size:0.85rem;font-weight:bold;display:flex;align-items:center;gap:8px;cursor:pointer;">
                        <input type="checkbox" id="repAutoChk" style="width:18px;height:18px;" ${localStorage.getItem('sp_report_auto') !== 'false' ? 'checked' : ''}>
                        <span>${L==='ar'?'تفعيل الإرسال التلقائي يومياً عند فتح التطبيق في الخلفية':'Enable automatic daily send when opening app'}</span>
                    </label>
                    <p style="font-size:0.75rem;color:var(--tx2);margin-top:4px;padding-right:26px;">
                        ${L==='ar'?'سيقوم التطبيق بالتحقق مرة واحدة يومياً عند فتحه أو تشغيله وإرسال تقرير المبيعات والتحصيلات تلقائياً في الخلفية بكل أمان.':'The app will check once a day when opened and automatically send sales and collections report in the background.'}
                    </p>
                </div>
                
                <div style="margin-bottom:12px;">
                    <label style="font-size:0.85rem;font-weight:bold;display:block;margin-bottom:6px;">${L==='ar'?'خدمة الإرسال (Sending Service):':'Sending Service:'}</label>
                    <select id="repServiceSel" class="sbox" style="width:100%;padding:8px;border-radius:8px;" onchange="toggleEmailServiceFields()">
                        <option value="formsubmit" ${(localStorage.getItem('sp_report_service')||'formsubmit')==='formsubmit'?'selected':''}>FormSubmit.co (${L==='ar'?'الأسهل - إرسال مباشر ومجاني دون إعدادات':'Easiest - Free, No API keys needed'})</option>
                        <option value="emailjs" ${(localStorage.getItem('sp_report_service')||'formsubmit')==='emailjs'?'selected':''}>EmailJS (${L==='ar'?'احترافي - يتطلب حساب في emailjs.com':'Professional - Requires EmailJS account'})</option>
                        <option value="webhook" ${(localStorage.getItem('sp_report_service')||'formsubmit')==='webhook'?'selected':''}>Custom Webhook / Google Script (${L==='ar'?'رابط ويب هوك مخصص':'Custom Webhook URL'})</option>
                    </select>
                </div>

                <div id="emailjsFields" style="display:${(localStorage.getItem('sp_report_service')||'formsubmit')==='emailjs'?'block':'none'};background:var(--bg);padding:10px;border-radius:8px;margin-bottom:12px;border:1px dashed var(--bd);">
                    <p style="font-size:0.75rem;color:var(--tx2);margin-bottom:8px;">${L==='ar'?'أدخل بيانات حسابك في EmailJS:':'Enter your EmailJS credentials:'}</p>
                    <input type="text" id="ejsServiceId" placeholder="Service ID (e.g., service_xxx)" class="sbox" style="width:100%;margin-bottom:8px;padding:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_emailjs_service_id')||''}">
                    <input type="text" id="ejsTemplateId" placeholder="Template ID (e.g., template_xxx)" class="sbox" style="width:100%;margin-bottom:8px;padding:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_emailjs_template_id')||''}">
                    <input type="text" id="ejsPublicKey" placeholder="Public Key / User ID (e.g., xxxxxxxx)" class="sbox" style="width:100%;padding:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_emailjs_public_key')||''}">
                </div>

                <div id="webhookFields" style="display:${(localStorage.getItem('sp_report_service')||'formsubmit')==='webhook'?'block':'none'};background:var(--bg);padding:10px;border-radius:8px;margin-bottom:12px;border:1px dashed var(--bd);">
                    <p style="font-size:0.75rem;color:var(--tx2);margin-bottom:8px;">${L==='ar'?'رابط الويب هوك أو Google Apps Script:':'Webhook or Google Apps Script URL:'}</p>
                    <input type="text" id="repWebhookUrl" placeholder="https://script.google.com/macros/s/..." class="sbox" style="width:100%;padding:8px;box-sizing:border-box;" value="${localStorage.getItem('sp_webhook_url')||''}">
                </div>

                <button class="btn btn-p" onclick="saveEmailReportSettings()" style="width:100%;padding:10px;font-weight:bold;">
                    💾 ${L==='ar'?'حفظ إعدادات التقرير اليومي':'Save Report Settings'}
                </button>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn btn-p" onclick="sendDailyReportNow(false)" style="flex:1;min-width:180px;background:#10b981;color:#fff;font-weight:bold;padding:12px;">
                    🚀 ${L==='ar'?'إرسال تقرير المبيعات والتحصيلات الآن (فوري)':'Send Sales & Collections Report Now'}
                </button>
                <button class="btn" onclick="previewDailyReportModal()" style="flex:1;min-width:140px;background:var(--bg3);padding:12px;">
                    👁️ ${L==='ar'?'معاينة محتوى التقرير':'Preview Report Content'}
                </button>
            </div>
            <div id="emailSendStatus" style="margin-top:12px;font-size:0.85rem;font-weight:bold;text-align:center;"></div>
        </div>

        <div class="card">
            <h3>👤 ${L==='ar'?'الملف الشخصي':'Profile'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${typeof currentUser !== 'undefined' && currentUser ? currentUser.email : 'Not logged in'}</p>
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

window.toggleEmailServiceFields = function() {
    let sel = document.getElementById('repServiceSel');
    let ejs = document.getElementById('emailjsFields');
    let webh = document.getElementById('webhookFields');
    if (ejs) ejs.style.display = sel && sel.value === 'emailjs' ? 'block' : 'none';
    if (webh) webh.style.display = sel && sel.value === 'webhook' ? 'block' : 'none';
};

window.saveEmailReportSettings = function() {
    let email = (document.getElementById('repEmailInput') ? document.getElementById('repEmailInput').value.trim() : '');
    let auto = (document.getElementById('repAutoChk') ? document.getElementById('repAutoChk').checked : true);
    let service = (document.getElementById('repServiceSel') ? document.getElementById('repServiceSel').value : 'formsubmit');
    
    if (!email) {
        if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '❌ يرجى إدخال البريد الإلكتروني أولاً' : 'Please enter an email address', 'error');
        return;
    }
    
    localStorage.setItem('sp_report_email', email);
    localStorage.setItem('sp_report_auto', auto ? 'true' : 'false');
    localStorage.setItem('sp_report_service', service);
    
    if (service === 'emailjs') {
        let sid = document.getElementById('ejsServiceId') ? document.getElementById('ejsServiceId').value.trim() : '';
        let tid = document.getElementById('ejsTemplateId') ? document.getElementById('ejsTemplateId').value.trim() : '';
        let pkey = document.getElementById('ejsPublicKey') ? document.getElementById('ejsPublicKey').value.trim() : '';
        localStorage.setItem('sp_emailjs_service_id', sid);
        localStorage.setItem('sp_emailjs_template_id', tid);
        localStorage.setItem('sp_emailjs_public_key', pkey);
    } else if (service === 'webhook') {
        let wurl = document.getElementById('repWebhookUrl') ? document.getElementById('repWebhookUrl').value.trim() : '';
        localStorage.setItem('sp_webhook_url', wurl);
    }
    
    if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '✅ تم حفظ إعدادات التقرير اليومي بنجاح' : 'Report settings saved successfully', 'success');
};

window.generateDailyReportData = function() {
    try {
        let sList = typeof window.S !== 'undefined' ? window.S : (typeof ld === 'function' ? ld('salesData') || [] : []);
        let cList = typeof window.C !== 'undefined' ? window.C : (typeof ld === 'function' ? ld('payData') || [] : []);
        let tList = typeof window.T !== 'undefined' ? window.T : (typeof ld === 'function' ? ld('targetData') || [] : []);
        
        let allDates = [];
        sList.forEach(r => {
            let d = typeof pd === 'function' ? pd(r['Order Date'] || r['Invoice Date']) : null;
            if (d && d.length === 10) allDates.push(d);
        });
        cList.forEach(r => {
            let d = typeof pd === 'function' ? pd(r['Date'] || r['Payment Date'] || r['Collection Date'] || r['Order Date']) : null;
            if (d && d.length === 10) allDates.push(d);
        });
        allDates.sort();
        
        let todayStr = new Date().toISOString().slice(0, 10);
        let latestDateStr = allDates.length > 0 ? allDates[allDates.length - 1] : todayStr;
        
        let totSales = 0, totProfit = 0, totTarget = 0, totColl = 0, accColl = 0, hwColl = 0;
        let custMap = {}, itemMap = {};
        
        sList.forEach(r => {
            let sv = typeof getSalesVal === 'function' ? getSalesVal(r) : Number(r['Sales After Discount'] || r['Amount'] || 0);
            let pv = typeof getProfitVal === 'function' ? getProfitVal(r) : Number(r['Profit'] || 0);
            totSales += sv;
            totProfit += pv;
            
            let c = r.Customer || r['Customer Name'] || 'عميل غير محدد';
            if (!custMap[c]) custMap[c] = 0;
            custMap[c] += sv;
            
            let itm = r['Item Description'] || 'صنف غير محدد';
            if (!itemMap[itm]) itemMap[itm] = 0;
            itemMap[itm] += sv;
        });
        
        tList.forEach(r => { totTarget += Number(r.Target) || 0; });
        
        cList.forEach(r => {
            let cv = typeof getPayVal === 'function' ? getPayVal(r) : Number(r['Amount'] || r['Collection'] || 0);
            totColl += cv;
            let ref = (r['Payment Ref.'] || r['Payment Ref'] || '').toString().trim().toLowerCase();
            let cat = r['Item Class Name'] || r['Category'] || '';
            if (ref.startsWith('acc') || (typeof isAcc === 'function' && isAcc(cat))) accColl += cv;
            else hwColl += cv;
        });
        
        let marginPct = totSales > 0 ? (totProfit / totSales * 100) : 0;
        let achPct = totTarget > 0 ? (totSales / totTarget * 100) : 0;
        
        // Activity for latest recorded date
        let daySales = 0, dayProfit = 0, dayActiveCusts = {};
        sList.forEach(r => {
            let d = typeof pd === 'function' ? pd(r['Order Date'] || r['Invoice Date']) : null;
            if (d === latestDateStr) {
                daySales += (typeof getSalesVal === 'function' ? getSalesVal(r) : 0);
                dayProfit += (typeof getProfitVal === 'function' ? getProfitVal(r) : 0);
                if (r.Customer) dayActiveCusts[r.Customer] = 1;
            }
        });
        let dayColl = 0;
        cList.forEach(r => {
            let d = typeof pd === 'function' ? pd(r['Date'] || r['Payment Date'] || r['Collection Date'] || r['Order Date']) : null;
            if (d === latestDateStr) {
                dayColl += (typeof getPayVal === 'function' ? getPayVal(r) : Number(r['Amount'] || 0));
                if (r['Customer Name'] || r['Customer']) dayActiveCusts[r['Customer Name'] || r['Customer']] = 1;
            }
        });
        
        let topCusts = Object.entries(custMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
        let topCustsText = topCusts.map((c, i) => `${i+1}. ${c[0]} (${typeof fmt==='function'?fmt(c[1]):c[1]} ج.م)`).join(' | ') || 'لا يوجد';
        
        let topItems = Object.entries(itemMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
        let topItemsText = topItems.map((it, i) => `${i+1}. ${it[0]} (${typeof fmt==='function'?fmt(it[1]):it[1]} ج.م)`).join(' | ') || 'لا يوجد';
        
        let recentColls = cList.slice(0, 5).map(r => `${r['Customer Name']||r['Customer']||'عميل'}: ${typeof fmt==='function'?fmt(typeof getPayVal==='function'?getPayVal(r):r['Amount']||0):0} ج.م`).join(' | ') || 'لا يوجد';
        let totalCustomersCount = Object.keys(custMap).length;
        let dayActiveCustCount = Object.keys(dayActiveCusts).length;
        
        return {
            todayStr, latestDateStr, totSales, totProfit, totTarget, totColl, accColl, hwColl,
            marginPct, achPct, daySales, dayProfit, dayColl, dayActiveCustCount,
            totalCustomersCount, topCustsText, topItemsText, recentCollsText: recentColls,
            topCusts, topItems, recentCollsArr: cList.slice(0, 5)
        };
    } catch(e) {
        console.error('Error generating report data:', e);
        return {
            todayStr: new Date().toISOString().slice(0,10), latestDateStr: 'N/A',
            totSales: 0, totProfit: 0, totTarget: 0, totColl: 0, accColl: 0, hwColl: 0,
            marginPct: 0, achPct: 0, daySales: 0, dayProfit: 0, dayColl: 0, dayActiveCustCount: 0,
            totalCustomersCount: 0, topCustsText: 'لا يوجد', topItemsText: 'لا يوجد', recentCollsText: 'لا يوجد',
            topCusts: [], topItems: [], recentCollsArr: []
        };
    }
};

window.sendDailyReportNow = function(isAuto = false) {
    try {
        let repEmail = localStorage.getItem('sp_report_email') || (typeof currentUser !== 'undefined' && currentUser ? currentUser.email : '');
        if (!repEmail) {
            if (!isAuto) {
                if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '❌ يرجى إدخال إيميل استلام التقارير في صفحة الإعدادات أولاً' : 'Please enter recipient email in Settings first', 'error');
                if (typeof P !== 'undefined' && P !== 'settings') {
                    if (confirm(typeof L !== 'undefined' && L === 'ar' ? 'لم تقم بإدخال بريدك الإلكتروني لاستلام التقرير اليومي. هل تود الانتقال لصفحة الإعدادات الآن؟' : 'No email set for daily reports. Go to Settings now?')) {
                        P = 'settings';
                        if (typeof buildNav === 'function') buildNav();
                        if (typeof render === 'function') render();
                    }
                }
            }
            return;
        }

        let statusEl = document.getElementById('emailSendStatus');
        if (!isAuto && statusEl) {
            statusEl.innerHTML = `<span style="color:var(--am);">⏳ ${typeof L !== 'undefined' && L === 'ar' ? 'جاري إعداد وإرسال التقرير اليومي إلى' : 'Sending daily report to'} ${repEmail}...</span>`;
        }
        if (!isAuto && typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '⏳ جاري إرسال التقرير إلى بريدك...' : 'Sending report...', 'info');

        let data = window.generateDailyReportData();
        let service = localStorage.getItem('sp_report_service') || 'formsubmit';
        
        let subject = `📊 تقرير Sales Pro اليومي الشامل - ${data.todayStr}`;
        let fFunc = typeof fmt === 'function' ? fmt : (n) => n;
        let pFunc = typeof pc === 'function' ? pc : (n) => n + '%';
        
        let payload = {
            "_subject": subject,
            "_template": "table",
            "📅 تاريخ التقرير": data.todayStr,
            "🕒 أحدث نشاط مسجل في النظام": data.latestDateStr,
            "💰 إجمالي المبيعات الشامل": `${fFunc(data.totSales)} ج.م`,
            "💵 إجمالي الأرباح": `${fFunc(data.totProfit)} ج.م (هامش ربح: ${pFunc(data.marginPct)})`,
            "🎯 التارجت الإجمالي ونسبة التحقيق": `${fFunc(data.totTarget)} ج.م (${pFunc(data.achPct)})`,
            "🪙 إجمالي التحصيلات": `${fFunc(data.totColl)} ج.م (إكسسوارات: ${fFunc(data.accColl)} | هاردوير: ${fFunc(data.hwColl)})`,
            "👥 عدد العملاء الإجمالي": `${data.totalCustomersCount} عميل (نشط في آخر نشاط: ${data.dayActiveCustCount})`,
            "📈 مبيعات اليوم / النشاط الأخير": `${fFunc(data.daySales)} ج.م (أرباح: ${fFunc(data.dayProfit)} ج.م)`,
            "💵 تحصيلات اليوم / النشاط الأخير": `${fFunc(data.dayColl)} ج.م`,
            "🏆 أفضل العملاء مبيعاً": data.topCustsText,
            "📦 أكثر الأصناف مبيعاً": data.topItemsText,
            "💰 أحدث عمليات التحصيل": data.recentCollsText,
            "ℹ️ نظام الإرسال": "تم إنشاء وإرسال هذا التقرير تلقائياً من تطبيق Sales Pro Enterprise"
        };

        if (service === 'formsubmit') {
            fetch('https://formsubmit.co/ajax/' + encodeURIComponent(repEmail), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(resData => {
                console.log('[Daily Report Sent]:', resData);
                localStorage.setItem('sp_report_last_sent_date', data.todayStr);
                if (!isAuto) {
                    if (statusEl) statusEl.innerHTML = `<span style="color:var(--ok);">✅ ${typeof L !== 'undefined' && L === 'ar' ? 'تم إرسال التقرير بنجاح إلى' : 'Report sent successfully to'} <strong>${repEmail}</strong>! <br><small style="color:var(--tx2);">(ملاحظة: إذا كان هذا أول إرسال، يرجى فحص صندوق الوارد أو Spam وتفعيل الرابط المرسل من FormSubmit مرة واحدة)</small></span>`;
                    if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '✅ تم إرسال التقرير بنجاح إلى إيميلك' : 'Report sent successfully', 'success');
                } else {
                    if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '📧 تم إرسال تقرير المبيعات والتحصيلات اليومي إلى إيميلك' : 'Automated daily report sent to email', 'success');
                }
            })
            .catch(err => {
                console.error('[Daily Report Error]:', err);
                if (!isAuto) {
                    if (statusEl) statusEl.innerHTML = `<span style="color:var(--rd);">❌ ${typeof L !== 'undefined' && L === 'ar' ? 'حدث خطأ أثناء الإرسال:' : 'Error sending report:'} ${err.message}</span>`;
                    if (typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '❌ حدث خطأ في إرسال التقرير' : 'Error sending report', 'error');
                }
            });
        } else if (service === 'emailjs') {
            let sid = localStorage.getItem('sp_emailjs_service_id');
            let tid = localStorage.getItem('sp_emailjs_template_id');
            let pkey = localStorage.getItem('sp_emailjs_public_key');
            if (!sid || !tid || !pkey) {
                if (!isAuto && typeof toast === 'function') toast(typeof L !== 'undefined' && L === 'ar' ? '❌ يرجى إدخال بيانات EmailJS في الإعدادات' : 'Please enter EmailJS credentials in Settings', 'error');
                return;
            }
            fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: sid,
                    template_id: tid,
                    user_id: pkey,
                    template_params: {
                        to_email: repEmail,
                        subject: subject,
                        report_date: data.todayStr,
                        latest_date: data.latestDateStr,
                        total_sales: fFunc(data.totSales),
                        total_profit: fFunc(data.totProfit),
                        margin_pct: pFunc(data.marginPct),
                        target_achieved: pFunc(data.achPct),
                        total_collections: fFunc(data.totColl),
                        active_customers: data.dayActiveCustCount,
                        top_customers: data.topCustsText,
                        top_items: data.topItemsText,
                        message: `تقرير Sales Pro لليوم ${data.todayStr}: إجمالي المبيعات ${fFunc(data.totSales)} ج.م | إجمالي التحصيلات ${fFunc(data.totColl)} ج.م | تحقيق التارجت ${pFunc(data.achPct)}`
                    }
                })
            })
            .then(res => {
                if (!res.ok) throw new Error('EmailJS HTTP status ' + res.status);
                localStorage.setItem('sp_report_last_sent_date', data.todayStr);
                if (!isAuto) {
                    if (statusEl) statusEl.innerHTML = `<span style="color:var(--ok);">✅ تم إرسال التقرير بنجاح عبر EmailJS إلى ${repEmail}</span>`;
                    if (typeof toast === 'function') toast('✅ تم إرسال التقرير عبر EmailJS بنجاح', 'success');
                } else {
                    if (typeof toast === 'function') toast('📧 تم إرسال التقرير التلقائي عبر EmailJS', 'success');
                }
            })
            .catch(err => {
                console.error('[EmailJS Error]:', err);
                if (!isAuto && typeof toast === 'function') toast('❌ خطأ في إرسال EmailJS: ' + err.message, 'error');
            });
        } else if (service === 'webhook') {
            let wurl = localStorage.getItem('sp_webhook_url');
            if (!wurl) {
                if (!isAuto && typeof toast === 'function') toast('❌ يرجى إدخال رابط الويب هوك في الإعدادات', 'error');
                return;
            }
            fetch(wurl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ email: repEmail, reportData: data, timestamp: new Date().toISOString() })
            })
            .then(res => {
                localStorage.setItem('sp_report_last_sent_date', data.todayStr);
                if (!isAuto) {
                    if (statusEl) statusEl.innerHTML = `<span style="color:var(--ok);">✅ تم إرسال التقرير بنجاح عبر الويب هوك</span>`;
                    if (typeof toast === 'function') toast('✅ تم إرسال التقرير عبر الويب هوك بنجاح', 'success');
                }
            })
            .catch(err => {
                console.error('[Webhook Error]:', err);
                if (!isAuto && typeof toast === 'function') toast('❌ خطأ في إرسال الويب هوك', 'error');
            });
        }
    } catch(err) {
        console.error('[sendDailyReportNow Exception]:', err);
    }
};

window.previewDailyReportModal = function() {
    let data = window.generateDailyReportData();
    let fFunc = typeof fmt === 'function' ? fmt : (n) => n;
    let pFunc = typeof pc === 'function' ? pc : (n) => n + '%';
    
    let topCustRows = (data.topCusts || []).map((c, i) => `<tr><td style="padding:6px;border-bottom:1px solid #334155;">#${i+1}</td><td style="padding:6px;border-bottom:1px solid #334155;">${c[0]}</td><td style="padding:6px;border-bottom:1px solid #334155;color:#60a5fa;font-weight:bold;">${fFunc(c[1])} ج.م</td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center;padding:10px;">لا يوجد بيانات</td></tr>';
    let topItemRows = (data.topItems || []).map((it, i) => `<tr><td style="padding:6px;border-bottom:1px solid #334155;">#${i+1}</td><td style="padding:6px;border-bottom:1px solid #334155;">${it[0]}</td><td style="padding:6px;border-bottom:1px solid #334155;color:#34d399;font-weight:bold;">${fFunc(it[1])} ج.م</td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center;padding:10px;">لا يوجد بيانات</td></tr>';
    
    let htmlContent = `
    <div id="REP_MODAL" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;">
        <div style="background:#0f172a;color:#f8fafc;width:100%;max-width:650px;max-height:90vh;border-radius:16px;border:1px solid #334155;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5);direction:rtl;text-align:right;">
            <div style="padding:16px 20px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center;background:#1e293b;">
                <h3 style="margin:0;font-size:1.1rem;color:#60a5fa;display:flex;align-items:center;gap:8px;">👁️ معاينة التقرير اليومي الشامل</h3>
                <button onclick="closePreviewReportModal()" style="background:transparent;border:none;color:#94a3b8;font-size:1.5rem;cursor:pointer;">✖</button>
            </div>
            <div style="padding:20px;overflow-y:auto;flex:1;font-size:0.9rem;">
                <div style="background:#1e293b;padding:12px 16px;border-radius:10px;margin-bottom:16px;border-right:4px solid #3b82f6;">
                    <strong>📅 تاريخ اليوم:</strong> ${data.todayStr} | <strong>🕒 أحدث نشاط مسجل:</strong> ${data.latestDateStr}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                    <div style="background:#1e293b;padding:12px;border-radius:10px;border:1px solid #334155;text-align:center;">
                        <span style="font-size:0.75rem;color:#94a3b8;">💰 إجمالي المبيعات الشامل</span>
                        <div style="font-size:1.3rem;font-weight:bold;color:#60a5fa;margin-top:4px;">${fFunc(data.totSales)} ج.م</div>
                        <span style="font-size:0.75rem;color:#cbd5e1;">نشاط اليوم/الأخير: ${fFunc(data.daySales)} ج.م</span>
                    </div>
                    <div style="background:#1e293b;padding:12px;border-radius:10px;border:1px solid #334155;text-align:center;">
                        <span style="font-size:0.75rem;color:#94a3b8;">💵 إجمالي الأرباح</span>
                        <div style="font-size:1.3rem;font-weight:bold;color:#34d399;margin-top:4px;">${fFunc(data.totProfit)} ج.م</div>
                        <span style="font-size:0.75rem;color:#cbd5e1;">هامش: ${pFunc(data.marginPct)}</span>
                    </div>
                    <div style="background:#1e293b;padding:12px;border-radius:10px;border:1px solid #334155;text-align:center;">
                        <span style="font-size:0.75rem;color:#94a3b8;">🎯 التارجت ونسبة التحقيق</span>
                        <div style="font-size:1.3rem;font-weight:bold;color:#fbbf24;margin-top:4px;">${pFunc(data.achPct)}</div>
                        <span style="font-size:0.75rem;color:#cbd5e1;">الهدف: ${fFunc(data.totTarget)} ج.م</span>
                    </div>
                    <div style="background:#1e293b;padding:12px;border-radius:10px;border:1px solid #334155;text-align:center;">
                        <span style="font-size:0.75rem;color:#94a3b8;">🪙 إجمالي التحصيلات</span>
                        <div style="font-size:1.3rem;font-weight:bold;color:#a78bfa;margin-top:4px;">${fFunc(data.totColl)} ج.م</div>
                        <span style="font-size:0.75rem;color:#cbd5e1;">إكسسوار: ${fFunc(data.accColl)} | هارد: ${fFunc(data.hwColl)}</span>
                    </div>
                </div>
                <div style="background:#1e293b;padding:14px;border-radius:10px;margin-bottom:14px;border:1px solid #334155;">
                    <h4 style="margin:0 0 10px;color:#f8fafc;font-size:0.95rem;border-bottom:1px solid #334155;padding-bottom:6px;">🏆 أفضل العملاء مبيعاً</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
                        <tr style="color:#94a3b8;text-align:right;"><th style="padding:6px;">#</th><th style="padding:6px;">العميل</th><th style="padding:6px;">المبيعات</th></tr>
                        ${topCustRows}
                    </table>
                </div>
                <div style="background:#1e293b;padding:14px;border-radius:10px;border:1px solid #334155;">
                    <h4 style="margin:0 0 10px;color:#f8fafc;font-size:0.95rem;border-bottom:1px solid #334155;padding-bottom:6px;">📦 أكثر الأصناف مبيعاً</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
                        <tr style="color:#94a3b8;text-align:right;"><th style="padding:6px;">#</th><th style="padding:6px;">الصنف</th><th style="padding:6px;">المبيعات</th></tr>
                        ${topItemRows}
                    </table>
                </div>
            </div>
            <div style="padding:14px 20px;border-top:1px solid #334155;background:#1e293b;display:flex;gap:10px;justify-content:flex-end;">
                <button onclick="closePreviewReportModal(); sendDailyReportNow(false);" class="btn btn-p" style="background:#10b981;color:#fff;padding:8px 16px;font-weight:bold;">🚀 إرسال للإيميل الآن</button>
                <button onclick="closePreviewReportModal()" class="btn" style="background:#334155;color:#f8fafc;padding:8px 16px;">✖ إغلاق</button>
            </div>
        </div>
    </div>`;
    
    let el = document.createElement('div');
    el.innerHTML = htmlContent;
    document.body.appendChild(el.firstElementChild);
};

window.closePreviewReportModal = function() {
    let m = document.getElementById('REP_MODAL');
    if (m) m.remove();
};

window.checkAndSendDailyReport = function() {
    try {
        let isAuto = localStorage.getItem('sp_report_auto') !== 'false';
        if (!isAuto) return;
        
        let repEmail = localStorage.getItem('sp_report_email') || (typeof currentUser !== 'undefined' && currentUser ? currentUser.email : '');
        if (!repEmail) return;
        
        let todayStr = new Date().toISOString().slice(0, 10);
        let lastSent = localStorage.getItem('sp_report_last_sent_date');
        
        if (lastSent === todayStr) {
            console.log('[Daily Report]: Already sent for today (' + todayStr + ')');
            return;
        }
        
        console.log('[Daily Report]: Automatic trigger checking in for today (' + todayStr + ')...');
        // Small check to avoid sending if sales list is empty or still initializing
        let sList = typeof S !== 'undefined' ? S : JSON.parse(localStorage.getItem('salesData')||'[]');
        let cList = typeof C !== 'undefined' ? C : JSON.parse(localStorage.getItem('payData')||'[]');
        if (sList.length === 0 && cList.length === 0) {
            console.log('[Daily Report]: Waiting for data before sending...');
            return;
        }
        
        window.sendDailyReportNow(true);
    } catch(err) {
        console.error('[checkAndSendDailyReport Error]:', err);
    }
};

window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof checkAndSendDailyReport === 'function') {
            checkAndSendDailyReport();
        }
    }, 4500);
});


