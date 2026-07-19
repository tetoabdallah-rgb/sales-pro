// js/settings.js

function rSettings() {
    let savedClient = localStorage.getItem('sp_gdrive_client') || '';
    let savedApi = localStorage.getItem('sp_gdrive_api') || '';

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
            <h3>☁️ ${L==='ar'?'إعدادات Google Drive':'Google Drive Settings'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'أدخل مفاتيح الربط لتفعيل المزامنة السحابية':'Enter API keys to enable cloud sync'}</p>
            
            <div style="margin-bottom:12px;">
                <label style="display:block;margin-bottom:5px;font-size:0.9rem;">Client ID</label>
                <input type="text" id="gClientInp" class="sbox" style="width:100%;font-size:0.85rem;" placeholder="123456...apps.googleusercontent.com" value="${savedClient}">
            </div>
            <div style="margin-bottom:12px;">
                <label style="display:block;margin-bottom:5px;font-size:0.9rem;">API Key</label>
                <input type="text" id="gApiInp" class="sbox" style="width:100%;font-size:0.85rem;" placeholder="AIzaSy..." value="${savedApi}">
            </div>
            <button class="btn btn-p" id="bSaveG" style="width:100%; background:var(--gn);">${L==='ar'?'حفظ إعدادات المزامنة':'Save Sync Settings'}</button>
        </div>
        
        <div class="card">
            <h3>👤 ${L==='ar'?'الملف الشخصي':'Profile'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${(typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : 'Not logged in'}</p>
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

    $('bSaveG').onclick = () => {
        let c = $('gClientInp').value.trim();
        let a = $('gApiInp').value.trim();
        localStorage.setItem('sp_gdrive_client', c);
        localStorage.setItem('sp_gdrive_api', a);
        if(typeof toast === 'function') toast(L==='ar'?'تم الحفظ بنجاح!':'Saved successfully!', 'success');
        
        // Re-initialize gapi immediately if they were loaded
        if (typeof initializeGapiClient === 'function') initializeGapiClient();
        if (typeof gisLoaded === 'function') gisLoaded();
    };
}
