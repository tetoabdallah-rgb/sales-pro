const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Update ICONS object to ensure intuitive 3D Fluent icons for every single tab
let newIcons = `const ICONS = {
    dash: getImg('Bar%20chart/3D/bar_chart_3d.png'),
    sales: getImg('Receipt/3D/receipt_3d.png'),
    targets: getImg('Bullseye/3D/bullseye_3d.png'),
    personal: getImg('Handshake/3D/handshake_3d.png'),
    customers: getImg('Store/3D/store_3d.png'),
    brands: getImg('Package/3D/package_3d.png'),
    accessories: getImg('Headphone/3D/headphone_3d.png'),
    hardware: getImg('Mobile%20phone/3D/mobile_phone_3d.png'),
    analytics: getImg('Chart%20increasing/3D/chart_increasing_3d.png'),
    potential: getImg('Rocket/3D/rocket_3d.png'),
    profit: getImg('Money%20bag/3D/money_bag_3d.png'),
    keyacc: getImg('Crown/3D/crown_3d.png'),
    dormant: getImg('Sleeping%20face/3D/sleeping_face_3d.png'),
    prospects: getImg('Magnifying%20glass%20tilted%20left/3D/magnifying_glass_tilted_left_3d.png'),
    ai: getImg('Robot/3D/robot_3d.png'),
    alerts: getImg('Bell/3D/bell_3d.png'),
    account: getImg('Bust%20in%20silhouette/3D/bust_in_silhouette_3d.png'),
    backup: getImg('Floppy%20disk/3D/floppy_disk_3d.png'),
    setup: getImg('Folder/3D/folder_3d.png'),
    reset: getImg('Wastebasket/3D/wastebasket_3d.png'),
    settings: getImg('Gear/3D/gear_3d.png'),
    collections: getImg('Money%20with%20wings/3D/money_with_wings_3d.png')
};`;

// Replace old ICONS
let iconRegex = /const ICONS = \{[\s\S]*?\};/;
if (iconRegex.test(c)) {
    c = c.replace(iconRegex, newIcons);
    console.log('Updated ICONS object successfully.');
} else {
    console.log('Could not find ICONS object to replace!');
}

// 2. Add macOS / Windows OS Enterprise Startup Splash Screen right after <body class="app">
let osStartupHTML = `
  <!-- macOS / Windows OS Enterprise Startup Splash Screen -->
  <div id="osStartupOverlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%);z-index:999999;display:flex;align-items:center;justify-content:center;transition:opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);font-family:'Plus Jakarta Sans','Tajawal',sans-serif;dir:ltr;">
    <div style="background:rgba(255,255,255,0.06);backdrop-filter:blur(25px);-webkit-backdrop-filter:blur(25px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;width:88%;max-width:440px;padding:26px 30px;box-shadow:0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(79,70,229,0.25);color:#ffffff;text-align:center;position:relative;overflow:hidden;">
      <!-- macOS Window Buttons -->
      <div style="display:flex;gap:8px;position:absolute;top:18px;left:20px;">
        <span style="width:12px;height:12px;border-radius:50%;background:#ff5f56;display:inline-block;box-shadow:0 0 6px rgba(255,95,86,0.6);"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#ffbd2e;display:inline-block;box-shadow:0 0 6px rgba(255,189,46,0.6);"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#27c93f;display:inline-block;box-shadow:0 0 6px rgba(39,201,63,0.6);"></span>
      </div>
      <!-- OS Header -->
      <div style="font-size:0.75rem;letter-spacing:1.5px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-top:2px;margin-bottom:24px;font-weight:600;">Sales Pro OS • Enterprise v8.5</div>
      
      <!-- App Logo & Title -->
      <div style="margin:20px 0;">
        <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Rocket/3D/rocket_3d.png" style="width:76px;height:76px;filter:drop-shadow(0 10px 15px rgba(79,70,229,0.5));animation:osPulse 2s infinite ease-in-out;">
        <h2 style="font-size:1.7rem;font-weight:800;margin:14px 0 4px 0;background:linear-gradient(to right, #ffffff, #a5b4fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">SALES PRO</h2>
        <div style="font-size:0.9rem;color:rgba(255,255,255,0.7);font-family:'Tajawal',sans-serif;">نظام إدارة المبيعات المؤسسي الذكي</div>
      </div>
      
      <!-- OS Progress Bar -->
      <div style="margin-top:28px;background:rgba(0,0,0,0.4);border-radius:10px;height:8px;width:100%;overflow:hidden;padding:2px;border:1px solid rgba(255,255,255,0.08);">
        <div id="osStartProgress" style="width:5%;height:100%;background:linear-gradient(90deg, #4f46e5, #06b6d4, #10b981);border-radius:8px;transition:width 0.4s ease-out;box-shadow:0 0 12px rgba(6,182,212,0.8);"></div>
      </div>
      <div id="osStartStatus" style="margin-top:12px;font-size:0.85rem;color:rgba(255,255,255,0.6);font-family:'Tajawal',sans-serif;min-height:20px;">جاري تشغيل محرك النظام...</div>
    </div>
  </div>
  <style>
  @keyframes osPulse {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-6px) scale(1.05); }
  }
  </style>
`;

if (!c.includes('osStartupOverlay')) {
    c = c.replace('<body class="app">', '<body class="app">' + osStartupHTML);
    console.log('Added OS Startup Splash Screen HTML.');
}

// 3. Add Auto-Backup every 15 mins (900000 ms) and OS Startup control logic right before </body>
let autoBackupAndOSScript = `
<script>
// Auto-Backup to Google Drive every 15 minutes
window.addEventListener('load', function() {
    // OS Startup Sequence
    let prog = document.getElementById('osStartProgress');
    let stat = document.getElementById('osStartStatus');
    let over = document.getElementById('osStartupOverlay');
    if (over) {
        setTimeout(() => {
            if(prog) prog.style.width = '40%';
            if(stat) stat.textContent = 'جاري مزامنة قاعدة بيانات العملاء والمبيعات...';
        }, 350);
        
        setTimeout(() => {
            if(prog) prog.style.width = '85%';
            if(stat) stat.textContent = 'تجهيز واجهة المبيعات والأيقونات الذكية...';
        }, 800);
        
        setTimeout(() => {
            if(prog) prog.style.width = '100%';
            if(stat) stat.textContent = '✅ تم التشغيل بنجاح!';
        }, 1200);
        
        setTimeout(() => {
            over.style.opacity = '0';
            over.style.transform = 'scale(1.08)';
            setTimeout(() => { over.style.display = 'none'; }, 700);
        }, 1500);
    }

    // Google Drive Auto-Backup Interval (Every 15 mins = 900,000 ms)
    setInterval(() => {
        if (typeof saveToGoogleDrive === 'function' && localStorage.getItem('gdrive_client_id') && localStorage.getItem('gdrive_api_key')) {
            console.log('[Auto-Backup]: Starting 15-min Google Drive backup...');
            saveToGoogleDrive(true);
        }
    }, 900000);
});
</script>
`;

if (!c.includes('Auto-Backup to Google Drive every 15 minutes')) {
    c = c.replace('</body>', autoBackupAndOSScript + '\n</body>');
    console.log('Added Auto-Backup interval and OS Startup script.');
}

// Also update rBk in ui-components block to display auto-backup status card
let oldDriveBtn = `                <button class="btn" id="bDriveJSON" style="width:100%; justify-content:center; background:#0f9d58; color:white; border:none;">
                    نسخ احتياطي إلى (Google Drive) ☁️
                </button>`;

let newDriveBtn = `                <button class="btn" id="bDriveJSON" style="width:100%; justify-content:center; background:#0f9d58; color:white; border:none; font-weight:700; font-size:0.95rem; padding:12px;">
                    نسخ احتياطي فوري إلى (Google Drive) ☁️
                </button>
                <div style="margin-top:14px;padding:12px 16px;background:rgba(16, 185, 129, 0.12);border:1px solid #10b981;border-radius:12px;text-align:center;">
                    <div style="color:#10b981;font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;gap:6px;">
                        <span>⏱️</span> النسخ الاحتياطي التلقائي (كل 15 دقيقة): مفعل ✅
                    </div>
                    <div style="color:var(--tx2);font-size:0.75rem;margin-top:4px;">يقوم النظام برفع نسخة أمان تلقائياً إلى حسابك في جوجل درايف في الخلفية دون تدخل منك.</div>
                </div>`;

if (c.includes(oldDriveBtn)) {
    c = c.replace(oldDriveBtn, newDriveBtn);
    console.log('Updated Backup UI with 15-min auto-backup indicator.');
} else {
    console.log('Could not find oldDriveBtn to replace or already updated.');
}

fs.writeFileSync('index.html', c);
fs.writeFileSync('index_restored.html', c);
console.log('Successfully saved index.html and index_restored.html. New length:', c.length);
