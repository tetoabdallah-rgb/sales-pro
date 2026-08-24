# Simple bundler - just concatenate files, no regex tricks
$ErrorActionPreference = 'Stop'

$css = Get-Content -Raw -Path "style.css" -Encoding UTF8
$js1 = Get-Content -Raw -Path "firebase-config.js" -Encoding UTF8
$js2 = Get-Content -Raw -Path "data-store.js" -Encoding UTF8
$js3 = Get-Content -Raw -Path "auth.js" -Encoding UTF8
$js4 = Get-Content -Raw -Path "ui-components.js" -Encoding UTF8
$js5 = Get-Content -Raw -Path "settings.js" -Encoding UTF8
$js6 = Get-Content -Raw -Path "app.js" -Encoding UTF8
$js7 = Get-Content -Raw -Path "gdrive.js" -Encoding UTF8
# Premium UX & Extended Features
$js8 = Get-Content -Raw -Path "new_features.js" -Encoding UTF8
$js9 = Get-Content -Raw -Path "appearance_settings.js" -Encoding UTF8
$js10 = Get-Content -Raw -Path "premium_ux.js" -Encoding UTF8
$js11 = Get-Content -Raw -Path "quick_search.js" -Encoding UTF8
$js12 = Get-Content -Raw -Path "customer_reports.js" -Encoding UTF8
$js13 = Get-Content -Raw -Path "stock.js" -Encoding UTF8
$js14 = Get-Content -Raw -Path "sales_booster.js" -Encoding UTF8

$html = @"
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Sales Pro Enterprise - Sales Pro</title>
  <meta name="theme-color" content="#1e293b">
  <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3214/3214746.png">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
"@

$html += $css

$html += @"

  </style>
</head>
<body>

<!-- Loading Overlay -->
<div id="LOADER" class="loader-overlay">
  <div class="loader-content">
    <div class="loader-icon">&#x2699;&#xFE0F;</div>
    <div class="loader-text">Sales Pro</div>
    <div class="loader-bar"><div class="loader-bar-fill"></div></div>
  </div>
</div>

<!-- Authentication Screen -->
<div id="AUTH" class="auth-bg">
  <div class="auth-card" style="border-radius:12px;">
    <div class="auth-logo">
      <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bar%20chart/3D/bar_chart_3d.png" alt="Sales Pro Logo" width="80" height="80" style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2)); animation: fadeUp 1s ease forwards;">
    </div>
    <h1 style="margin-bottom:4px; font-weight:800;">Sales Pro</h1>
    <p class="ds" style="font-size:0.85rem; margin-bottom:24px;">Welcome back, please sign in</p>
    
    <div class="fg" style="margin-bottom:16px;">
      <div class="input-wrap">
        <input type="email" id="inE" placeholder="Email address" autocomplete="username" style="width:100%; padding:12px 16px; border-radius:8px; font-size:0.9rem;">
      </div>
    </div>
    
    <div class="fg" style="margin-bottom:16px;">
      <div class="input-wrap">
        <input type="password" id="inP" placeholder="Password" autocomplete="current-password" style="width:100%; padding:12px 16px; border-radius:8px; font-size:0.9rem;">
      </div>
    </div>
    
    <button id="bLog" class="btn btn-p btn-login" style="width:100%; padding:12px; border-radius:8px; font-weight:600; cursor:pointer; margin-top:8px;">Sign In</button>
    <p id="aErr" class="aerr" style="font-size:0.8rem; min-height:20px; margin:8px 0; text-align:center;"></p>
    
    <button id="bLogG" class="btn btn-google" style="width:100%; padding:12px; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer;">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="G"> 
        <span style="font-weight:600; font-size:0.85rem;">Sign in with Google</span>
    </button>
  </div>
</div>

<!-- Main App -->
<div id="APP" class="hidden" style="display:none;">
  <nav class="sidebar">
    <div class="sbt">
      <span class="sbr">&#x2699;&#xFE0F; Sales Pro</span>
      <div class="sbb">
        <button id="bTh" title="Theme">&#x1F317;</button>
        <button id="bLn" title="Language">EN</button>
        <button id="bOt" title="Logout">&#x062E;&#x0631;&#x0648;&#x062C;</button>
      </div>
    </div>
    <div id="NV"></div>
  </nav>
  
  <main class="mw" id="M"></main>
  <nav class="bnav">
    <div class="bni" id="BN"></div>
  </nav>
</div>


  <!-- Print Invoice Modal (Enterprise V8 Static Sibling) -->
  <div class="print-modal" id="printInvoiceModal">
    <div class="print-modal-content" id="printModalContent"></div>
  </div>
<!-- Toast -->
<div class="toast" id="TT"></div>

<!-- CDN Scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>`n<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
<script src="https://accounts.google.com/gsi/client?onload=gisLoaded" async defer></script>
<script src="https://apis.google.com/js/api.js?onload=gapiLoaded" async defer></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

<!-- ALL LOCAL JS INLINED BELOW -->
<script>
"@

$html += $js1
$html += "`n</script>`n<script>`n"
$html += $js2
$html += "`n</script>`n<script>`n"
$html += $js3
$html += "`n</script>`n<script>`n"
$html += $js4
$html += "`n</script>`n<script>`n"
$html += $js5
$html += "`n</script>`n<script>`n"
$html += $js6
$html += "`n</script>`n<script>`n"
$html += $js7
$html += "`n</script>`n<script>`n"
$html += $js8
$html += "`n</script>`n<script>`n"
$html += $js9
$html += "`n</script>`n<script>`n"
$html += $js10
$html += "`n</script>`n<script>`n"
$html += $js11
$html += "`n</script>`n<script>`n"
$html += $js12
$html += "`n</script>`n<script>`n"
$html += $js13
$html += "`n</script>`n<script>`n"
$html += $js14

$html += @"

</script>
<script>
  window.addEventListener('load', function() {
    try {
      if(typeof init === 'function') init();
    } catch(e) {
      alert('Error during init: ' + e.message + '\n' + e.stack);
    }
    setTimeout(function() {
      var loader = document.getElementById('LOADER');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(function() { loader.style.display = 'none'; }, 500);
      }
    }, 800);
  });
</script>
</body>
</html>
"@

[System.IO.File]::WriteAllText("$PWD\index_final.html", $html, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText("$PWD\index.html", $html, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText("$PWD\index_bundle.html", $html, [System.Text.UTF8Encoding]::new($false))
$size = (Get-Item "index_final.html").Length
Write-Host "SUCCESS: index_final.html, index.html, and index_bundle.html created ($size bytes)"

