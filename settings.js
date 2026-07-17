// js/settings.js

function rSettings() {
    $('M').innerHTML = `
        <div class="ph">
            <h1 style="display:flex;align-items:center;gap:12px;">
                <span style="width:32px;height:32px;display:flex;">⚙️</span> ${t('settings')}
            </h1>
            <p>${L==='ar'?'تخصيص ألوان وواجهة التطبيق':'Customize app colors and interface'}</p>
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
            <h3>🤖 ${L==='ar'?'إعدادات الذكاء الاصطناعي':'AI Settings'}</h3>
            <p style="font-size:0.8rem;color:var(--tx2);margin-bottom:12px;">${L==='ar'?'أدخل مفتاح Gemini API لتفعيل المساعد الشخصي':'Enter your Gemini API Key to enable the AI Co-pilot'}</p>
            <div class="fg">
                <input id="inGKey" type="password" class="sbox" style="width:100%;max-width:400px;margin-bottom:10px;" placeholder="AIzaSy..." value="${ld('sp_gemini_key') || ''}">
                <button id="bSaveGKey" class="btn btn-p">${L==='ar'?'حفظ المفتاح':'Save Key'}</button>
            </div>
            <p style="font-size:0.75rem;color:var(--tx2); margin-top:8px;">${L==='ar'?'يتم حفظ المفتاح في متصفحك محلياً فقط ولا يتم إرساله لأي خادم آخر.':'Your key is securely saved in your browser storage and never sent to our servers.'}</p>
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

    $('bSaveGKey').onclick = () => {
        let val = $('inGKey').value.trim();
        sv('sp_gemini_key', val);
        alert(L==='ar'?'تم الحفظ بنجاح!':'Saved successfully!');
    };
}

