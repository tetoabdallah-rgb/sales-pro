// js/settings.js

function rSettings() {
    $('M').innerHTML = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;">
                <span style="width:32px;height:32px;display:flex;">⚙️</span> ${t('settings')}
            </h1>
            <p>${L==='ar'?'تخصيص ألوان وواجهة التطبيق وإعدادات المزامنة':'Customize app colors, interface, and sync settings'}</p>
        </div>
        
        <div class="card" style="margin-bottom:20px;">
            <h3>🎨 ${L==='ar'?'اللون الأساسي':'Primary Color'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'اختر اللون الذي يريح عينيك':'Choose the color that fits you'}</p>
            
            <div style="display:flex;gap:12px;flex-wrap:wrap;" id="colorPicker">
                ${CL.map((color, i) => `
                    <div class="color-btn" data-color="${color}" style="width:40px;height:40px;border-radius:50%;background-color:${color};cursor:pointer;border:2px solid ${ld('sp_primary')===color?'var(--tx1)':'transparent'};transition:all 0.2s;"></div>
                `).join('')}
            </div>
        </div>
        
        <div class="card" style="margin-bottom:20px;">
            <h3>☁️ ${L==='ar'?'إعدادات المزامنة السحابية (Google Drive)':'Cloud Sync Settings (Google Drive)'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'أدخل مفاتيح API لتفعيل المزامنة مع جوجل درايف':'Enter API keys to enable cloud sync'}</p>
            <div class="fg">
                <input type="text" id="gdriveClientId" placeholder="${L==='ar'?'Google Client ID':'Google Client ID'}" class="sbox" style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('gdrive_client_id') || ''}">
            </div>
            <div class="fg">
                <input type="text" id="gdriveApiKey" placeholder="${L==='ar'?'Google API Key':'Google API Key'}" class="sbox" style="width:100%;margin-bottom:10px;" value="${localStorage.getItem('gdrive_api_key') || ''}">
            </div>
            <button class="btn btn-p" onclick="saveDriveKeys()">${L==='ar'?'حفظ المفاتيح':'Save Keys'}</button>
        </div>

        <div class="card" style="margin-bottom:20px;">
            <h3>🤖 ${L==='ar'?'إعدادات الذكاء الاصطناعي (Gemini AI)':'Gemini AI Settings'}</h3>
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
            
            // update selection UI
            document.querySelectorAll('.color-btn').forEach(b => b.style.border = '2px solid transparent');
            btn.style.border = '2px solid var(--tx1)';
        };
    });
}

window.saveDriveKeys = function() {
    const cId = document.getElementById('gdriveClientId').value.trim();
    const aKey = document.getElementById('gdriveApiKey').value.trim();
    if (cId && aKey) {
        localStorage.setItem('gdrive_client_id', cId);
        localStorage.setItem('gdrive_api_key', aKey);
        if(typeof toast === 'function') toast(L==='ar'?'تم حفظ مفاتيح جوجل درايف بنجاح. أعد تحميل الصفحة.':'Google Drive keys saved. Please reload.', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } else {
        if(typeof toast === 'function') toast(L==='ar'?'يرجى إدخال كلا المفتاحين':'Please enter both keys', 'error');
    }
};

window.saveGeminiKey = function() {
    const gKey = document.getElementById('geminiApiKey').value.trim();
    if (gKey) {
        localStorage.setItem('gemini_api_key', gKey);
        if(typeof toast === 'function') toast(L==='ar'?'تم حفظ مفتاح Gemini بنجاح':'Gemini key saved', 'success');
    } else {
        if(typeof toast === 'function') toast(L==='ar'?'يرجى إدخال المفتاح':'Please enter the key', 'error');
    }
};
