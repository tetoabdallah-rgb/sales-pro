
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

