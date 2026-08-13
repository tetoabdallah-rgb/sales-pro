// ============================================================
// appearance_settings.js — Sales Pro Appearance Control Panel
// Adds a full Appearance tab to Settings page.
// Controls: Font Size, UI Scale, Font Family, Primary Color.
// Safe injection — no existing code modified.
// ============================================================

(function () {
    'use strict';

    // ─── Immediate Fix: Reset oversized font if needed ─────────────────────────
    (function fixFontSize() {
        let stored = parseInt(localStorage.getItem('sp_font_size') || '0');
        // If index is 2 or 3 (18px/20px from old system), reset to index 0 = 14px
        if (stored >= 2) {
            localStorage.setItem('sp_font_size', '0');
        }
        // Override sp_fonts sizes with better range
        window.sp_fonts = window.sp_fonts || {};
        window.sp_fonts.sizes = ['13px', '14px', '15.5px', '17px', '19px'];
        // Re-apply
        let idx = parseInt(localStorage.getItem('sp_font_size') || '0');
        document.documentElement.style.fontSize = window.sp_fonts.sizes[idx] || '14px';
    })();

    // ─── UI Scale Manager ──────────────────────────────────────────────────────
    window.applyUIScale = function (scale) {
        localStorage.setItem('sp_ui_scale', scale);
        let app = document.getElementById('APP');
        if (app) {
            app.style.zoom = (scale / 100) + '';
        }
    };

    window.loadUIScale = function () {
        let scale = parseInt(localStorage.getItem('sp_ui_scale') || '100');
        let app = document.getElementById('APP');
        if (app) app.style.zoom = (scale / 100) + '';
    };

    // Apply scale on load
    setTimeout(window.loadUIScale, 600);

    // ─── Color Presets ─────────────────────────────────────────────────────────
    const COLOR_PRESETS = [
        { name: 'أزرق كلاسيكي', ac: '#2563eb', ac2: '#4f46e5', gn: '#10b981', id: 'blue' },
        { name: 'بنفسجي', ac: '#7c3aed', ac2: '#6d28d9', gn: '#10b981', id: 'purple' },
        { name: 'أخضر', ac: '#059669', ac2: '#047857', gn: '#10b981', id: 'green' },
        { name: 'أحمر', ac: '#dc2626', ac2: '#b91c1c', gn: '#10b981', id: 'red' },
        { name: 'برتقالي', ac: '#ea580c', ac2: '#c2410c', gn: '#10b981', id: 'orange' },
        { name: 'وردي', ac: '#db2777', ac2: '#be185d', gn: '#10b981', id: 'pink' },
        { name: 'فيروزي', ac: '#0891b2', ac2: '#0e7490', gn: '#10b981', id: 'teal' },
        { name: 'ذهبي', ac: '#d97706', ac2: '#b45309', gn: '#10b981', id: 'gold' },
    ];

    window.applyColorPreset = function (presetId) {
        let preset = COLOR_PRESETS.find(p => p.id === presetId);
        if (!preset) return;
        localStorage.setItem('sp_color_preset', presetId);

        let root = document.documentElement;
        root.style.setProperty('--ac', preset.ac);
        root.style.setProperty('--ac2', preset.ac2);
        root.style.setProperty('--acl', preset.ac + '22');
        root.style.setProperty('--btn-g', `linear-gradient(135deg, ${preset.ac}, ${preset.ac2})`);

        if (typeof toast === 'function') {
            let L = localStorage.getItem('sp_lang') || 'ar';
            toast(L === 'ar' ? `✅ تم تطبيق لون: ${preset.name}` : `✅ Color applied: ${preset.name}`, 'success');
        }
        // Re-render active nav item
        if (typeof buildNav === 'function') setTimeout(buildNav, 100);
    };

    window.loadColorPreset = function () {
        let stored = localStorage.getItem('sp_color_preset');
        if (!stored) return;
        let preset = COLOR_PRESETS.find(p => p.id === stored);
        if (!preset) return;
        let root = document.documentElement;
        root.style.setProperty('--ac', preset.ac);
        root.style.setProperty('--ac2', preset.ac2);
        root.style.setProperty('--acl', preset.ac + '22');
        root.style.setProperty('--btn-g', `linear-gradient(135deg, ${preset.ac}, ${preset.ac2})`);
    };

    setTimeout(window.loadColorPreset, 100);

    // ─── Font Families ─────────────────────────────────────────────────────────
    const FONT_FAMILIES = [
        { label: 'Tajawal', value: 'Tajawal' },
        { label: 'Cairo', value: 'Cairo' },
        { label: 'Almarai', value: 'Almarai' },
        { label: 'IBM Plex Sans', value: 'IBM Plex Sans Arabic' },
    ];

    // ─── Build Appearance Tab HTML ─────────────────────────────────────────────
    function buildAppearanceHTML() {
        let L = localStorage.getItem('sp_lang') || 'ar';
        let currentScale = parseInt(localStorage.getItem('sp_ui_scale') || '100');
        let currentFontIdx = parseInt(localStorage.getItem('sp_font_size') || '0');
        let currentFamily = localStorage.getItem('sp_font_family') || 'Tajawal';
        let currentPreset = localStorage.getItem('sp_color_preset') || 'blue';

        const SCALES = [75, 85, 90, 100, 110, 115, 125];
        const FONT_LABELS_AR = ['صغير جداً', 'صغير', 'متوسط', 'كبير', 'أكبر'];
        const FONT_LABELS_EN = ['XS', 'S', 'M', 'L', 'XL'];
        const FONT_SIZES_PX = ['13px', '14px', '15.5px', '17px', '19px'];

        function card(icon, titleAr, titleEn, content) {
            return `
            <div style="background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:20px;margin-bottom:14px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--bd);">
                    <span style="font-size:1.4rem;">${icon}</span>
                    <span style="font-weight:700;font-size:1rem;">${L === 'ar' ? titleAr : titleEn}</span>
                </div>
                ${content}
            </div>`;
        }

        // ── Scale Buttons ──
        let scaleButtons = SCALES.map(s => `
            <button onclick="window.applyUIScale(${s});document.querySelectorAll('.sp-scale-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');"
                class="sp-scale-btn${currentScale === s ? ' active' : ''}"
                style="flex:1;padding:9px 0;border-radius:8px;border:1.5px solid ${currentScale === s ? 'var(--ac)' : 'var(--bd)'};
                background:${currentScale === s ? 'var(--ac)' : 'var(--bg)'};
                color:${currentScale === s ? '#fff' : 'var(--tx2)'};
                font-weight:700;cursor:pointer;font-size:0.8rem;font-family:inherit;
                transition:all 0.15s;">${s}%</button>`).join('');

        let scaleCard = card('🔍', 'حجم الواجهة', 'UI Scale', `
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${scaleButtons}
            </div>
            <div style="margin-top:10px;font-size:0.75rem;color:var(--tx3);">
                ${L === 'ar' ? '💡 لو الكلام مش ظاهر كله، اختر نسبة أصغر (85% أو 90%)' : '💡 If content is cut off, choose a smaller scale (85% or 90%)'}
            </div>
        `);

        // ── Font Size Buttons ──
        let fontSizeBtns = FONT_SIZES_PX.map((sz, i) => `
            <button onclick="window.setAppFontSize(${i});document.querySelectorAll('.sp-font-size-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');"
                class="sp-font-size-btn${currentFontIdx === i ? ' active' : ''}"
                style="flex:1;padding:10px 0;border-radius:8px;border:1.5px solid ${currentFontIdx === i ? 'var(--ac)' : 'var(--bd)'};
                background:${currentFontIdx === i ? 'var(--ac)' : 'var(--bg)'};
                color:${currentFontIdx === i ? '#fff' : 'var(--tx2)'};
                font-weight:700;cursor:pointer;font-size:${sz};font-family:inherit;
                transition:all 0.15s;">${L === 'ar' ? FONT_LABELS_AR[i] : FONT_LABELS_EN[i]}</button>`).join('');

        let fontSizeCard = card('🔤', 'حجم الخط', 'Font Size', `
            <div style="display:flex;gap:6px;flex-wrap:wrap;">${fontSizeBtns}</div>
        `);

        // ── Font Family ──
        let fontFamilyBtns = FONT_FAMILIES.map(f => `
            <button onclick="window.setAppFontFamily('${f.value}');document.querySelectorAll('.sp-font-fam-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');"
                class="sp-font-fam-btn${currentFamily === f.value ? ' active' : ''}"
                style="flex:1;min-width:100px;padding:10px 8px;border-radius:8px;border:1.5px solid ${currentFamily === f.value ? 'var(--ac)' : 'var(--bd)'};
                background:${currentFamily === f.value ? 'var(--ac)' : 'var(--bg)'};
                color:${currentFamily === f.value ? '#fff' : 'var(--tx2)'};
                font-weight:600;cursor:pointer;font-size:0.85rem;font-family:'${f.value}',sans-serif;
                transition:all 0.15s;">${f.label}</button>`).join('');

        let fontFamilyCard = card('✍️', 'نوع الخط', 'Font Family', `
            <div style="display:flex;gap:8px;flex-wrap:wrap;">${fontFamilyBtns}</div>
        `);

        // ── Color Presets ──
        let colorSwatches = COLOR_PRESETS.map(p => `
            <div onclick="window.applyColorPreset('${p.id}');document.querySelectorAll('.sp-color-swatch').forEach(s=>s.style.outline='none');this.style.outline='3px solid var(--tx1)';"
                class="sp-color-swatch"
                title="${p.name}"
                style="width:44px;height:44px;border-radius:12px;cursor:pointer;
                background:linear-gradient(135deg,${p.ac},${p.ac2});
                outline:${currentPreset === p.id ? '3px solid var(--tx1)' : 'none'};
                outline-offset:2px;
                transition:all 0.15s;box-shadow:0 2px 8px ${p.ac}44;"></div>`).join('');

        let colorCard = card('🎨', 'لون التطبيق', 'App Color', `
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                ${colorSwatches}
            </div>
            <div style="margin-top:12px;font-size:0.75rem;color:var(--tx3);">${L === 'ar' ? 'اختر اللون الأساسي للتطبيق' : 'Choose the primary app accent color'}</div>
        `);

        // ── Reset Button ──
        let resetCard = `
            <div style="display:flex;justify-content:center;margin-top:4px;">
                <button onclick="window.spResetAppearance()" style="
                    padding:11px 28px;border-radius:10px;border:1.5px solid var(--bd);
                    background:var(--bg);color:var(--tx3);font-weight:600;cursor:pointer;
                    font-family:inherit;font-size:0.9rem;transition:all 0.2s;
                " onmouseover="this.style.borderColor='var(--rd)';this.style.color='var(--rd)';"
                   onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--tx3)';">
                    🔄 ${L === 'ar' ? 'إعادة تعيين الافتراضي' : 'Reset to Defaults'}
                </button>
            </div>`;

        return `
        <div id="sp-appearance-panel" style="margin-top:20px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <span style="font-size:1.8rem;">🎨</span>
                <div>
                    <h2 style="margin:0;font-size:1.2rem;">${L === 'ar' ? 'ضبط المظهر والعرض' : 'Appearance Settings'}</h2>
                    <p style="margin:4px 0 0;font-size:0.8rem;color:var(--tx3);">${L === 'ar' ? 'تحكم في حجم الواجهة والخطوط والألوان' : 'Control UI scale, fonts, and colors'}</p>
                </div>
            </div>
            ${scaleCard}
            ${fontSizeCard}
            ${fontFamilyCard}
            ${colorCard}
            ${resetCard}
        </div>`;
    }

    // ─── Reset appearance to defaults ─────────────────────────────────────────
    window.spResetAppearance = function () {
        localStorage.removeItem('sp_ui_scale');
        localStorage.removeItem('sp_font_size');
        localStorage.removeItem('sp_font_family');
        localStorage.removeItem('sp_color_preset');

        window.applyUIScale(100);
        if (typeof window.setAppFontSize === 'function') window.setAppFontSize(1);
        if (typeof window.setAppFontFamily === 'function') window.setAppFontFamily('Tajawal');

        // Reset CSS variables
        let root = document.documentElement;
        root.style.removeProperty('--ac');
        root.style.removeProperty('--ac2');
        root.style.removeProperty('--acl');
        root.style.removeProperty('--btn-g');

        let L = localStorage.getItem('sp_lang') || 'ar';
        if (typeof toast === 'function') toast(L === 'ar' ? '✅ تم إعادة تعيين المظهر' : '✅ Appearance reset to defaults', 'success');
        setTimeout(() => {
            if (typeof window.injectAppearancePanel === 'function') window.injectAppearancePanel();
        }, 200);
    };

    // ─── Add Appearance Tab button to Settings ─────────────────────────────────
    function addAppearanceTab() {
        let existing = document.getElementById('sp-appearance-tab-btn');
        if (existing) return;

        let L = localStorage.getItem('sp_lang') || 'ar';

        // Find settings tabs row
        let M = document.getElementById('M');
        if (!M) return;

        // Add tab buttons row if settings is active
        let settingsContent = M.querySelector('.ph');
        if (!settingsContent) return;

        // Check if we're on settings page
        if (typeof P !== 'undefined' && P !== 'settings') return;

        // Insert tab switcher
        let tabRow = document.getElementById('sp-settings-tabs');
        if (!tabRow) {
            tabRow = document.createElement('div');
            tabRow.id = 'sp-settings-tabs';
            tabRow.style.cssText = `
                display:flex;gap:8px;margin-bottom:16px;
                background:var(--bg2);border:1px solid var(--bd);
                border-radius:12px;padding:6px;
            `;
            tabRow.innerHTML = `
                <button id="sp-tab-general" onclick="spSwitchSettingsTab('general')" style="
                    flex:1;padding:9px 12px;border-radius:8px;border:none;cursor:pointer;
                    font-family:inherit;font-size:0.85rem;font-weight:700;transition:all 0.2s;
                    background:var(--ac);color:#fff;
                ">⚙️ ${L === 'ar' ? 'عام' : 'General'}</button>
                <button id="sp-tab-appearance" onclick="spSwitchSettingsTab('appearance')" style="
                    flex:1;padding:9px 12px;border-radius:8px;border:none;cursor:pointer;
                    font-family:inherit;font-size:0.85rem;font-weight:700;transition:all 0.2s;
                    background:transparent;color:var(--tx3);
                ">🎨 ${L === 'ar' ? 'المظهر' : 'Appearance'}</button>
            `;

            // Insert before first content
            let firstEl = M.children[0];
            if (firstEl) M.insertBefore(tabRow, firstEl.nextSibling);
        }
    }

    window.spSwitchSettingsTab = function (tab) {
        let L = localStorage.getItem('sp_lang') || 'ar';
        let generalBtn = document.getElementById('sp-tab-general');
        let appearBtn = document.getElementById('sp-tab-appearance');
        let appearPanel = document.getElementById('sp-appearance-panel');

        // Style the tab buttons
        let activeStyle = 'background:var(--ac);color:#fff;';
        let inactiveStyle = 'background:transparent;color:var(--tx3);';

        if (tab === 'general') {
            if (generalBtn) generalBtn.style.cssText += ';' + activeStyle;
            if (appearBtn) appearBtn.style.cssText += ';' + inactiveStyle;
            if (appearPanel) appearPanel.style.display = 'none';

            // Show all the original settings content
            let M = document.getElementById('M');
            if (M) {
                Array.from(M.children).forEach(c => {
                    if (c.id !== 'sp-settings-tabs' && c.id !== 'sp-appearance-panel') {
                        c.style.display = '';
                    }
                });
            }
        } else if (tab === 'appearance') {
            if (generalBtn) generalBtn.setAttribute('style', generalBtn.getAttribute('style').replace('background:var(--ac);color:#fff', inactiveStyle));
            if (appearBtn) appearBtn.setAttribute('style', appearBtn.getAttribute('style').replace('background:transparent;color:var(--tx3)', activeStyle));

            // Hide all original settings content
            let M = document.getElementById('M');
            if (M) {
                Array.from(M.children).forEach(c => {
                    if (c.id !== 'sp-settings-tabs' && c.id !== 'sp-appearance-panel') {
                        c.style.display = 'none';
                    }
                });
            }

            // Show or create appearance panel
            if (!appearPanel) {
                window.injectAppearancePanel();
            } else {
                appearPanel.style.display = '';
            }
        }
    };

    window.injectAppearancePanel = function () {
        let M = document.getElementById('M');
        if (!M) return;
        let old = document.getElementById('sp-appearance-panel');
        if (old) old.remove();

        let panel = document.createElement('div');
        panel.innerHTML = buildAppearanceHTML();
        let child = panel.firstElementChild;
        M.appendChild(child);
    };

    // ─── Hook into render/settings ─────────────────────────────────────────────
    let origRender = window.render;
    window.render = function () {
        if (origRender) origRender();
        if (typeof P !== 'undefined' && P === 'settings') {
            setTimeout(addAppearanceTab, 400);
        }
    };

    // Also hook rSettings if it exists
    let origRSettings = window.rSettings;
    if (origRSettings) {
        window.rSettings = function () {
            origRSettings();
            setTimeout(addAppearanceTab, 400);
        };
    }

    // ─── Better button active state via CSS ───────────────────────────────────
    let css = document.createElement('style');
    css.innerHTML = `
        .sp-scale-btn.active, .sp-font-size-btn.active, .sp-font-fam-btn.active {
            background: var(--ac) !important;
            color: #fff !important;
            border-color: var(--ac) !important;
            box-shadow: 0 4px 12px var(--acl);
        }
        .sp-color-swatch:hover { transform: scale(1.1); }
        #sp-tab-general, #sp-tab-appearance { transition: all 0.2s !important; }
    `;
    document.head.appendChild(css);

    // ─── Watch for settings.js rSettings override ────────────────────────────
    // Since settings.js may define rSettings after this file loads,
    // we also patch via a MutationObserver on #M
    let mo = new MutationObserver(() => {
        if (typeof P !== 'undefined' && P === 'settings') {
            let tabs = document.getElementById('sp-settings-tabs');
            if (!tabs) setTimeout(addAppearanceTab, 300);
        }
    });
    let mEl = document.getElementById('M');
    if (mEl) mo.observe(mEl, { childList: true });

})();
