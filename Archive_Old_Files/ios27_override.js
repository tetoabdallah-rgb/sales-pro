const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The massive iOS 27 override CSS
const iosCSS = `
  <!-- iOS 27 / VisionOS Premium Override -->
  <style id="ios27">
    /* Deep Glassmorphism & Mesh Backgrounds */
    :root {
      --bg-g: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
      --bg2: rgba(255, 255, 255, 0.4) !important;
      --glass: blur(40px) saturate(200%) !important;
      --r: 24px !important;
      --sh: 0 8px 32px rgba(0, 0, 0, 0.04) !important;
      --sh-md: 0 16px 48px rgba(0, 0, 0, 0.08) !important;
      --sh-lg: 0 24px 64px rgba(0, 0, 0, 0.12) !important;
      --btn-g: linear-gradient(135deg, #007aff 0%, #5856d6 100%) !important;
    }

    html[data-theme="dark"] {
      --bg-g: radial-gradient(circle at 10% 20%, rgb(0, 0, 0) 0%, rgb(18, 18, 20) 90%);
      --bg2: rgba(30, 30, 32, 0.4) !important;
      --glass: blur(40px) saturate(200%) !important;
      --bd: rgba(255, 255, 255, 0.05) !important;
      --bd-s: rgba(255, 255, 255, 0.02) !important;
      --sh: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
      --sh-md: 0 16px 48px rgba(0, 0, 0, 0.4) !important;
      --sh-lg: 0 24px 64px rgba(0, 0, 0, 0.5) !important;
      --btn-g: linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%) !important;
    }

    body {
      background: var(--bg-g) !important;
      background-size: cover !important;
      background-attachment: fixed !important;
    }

    /* Floating Sidebar */
    .sidebar {
      position: fixed !important;
      top: 16px !important;
      right: 16px !important;
      bottom: auto !important;
      width: var(--sidebar-w) !important;
      height: calc(100vh - 32px) !important;
      border: 1px solid var(--bd) !important;
      border-radius: var(--r) !important;
      padding: 24px 16px !important;
      box-shadow: var(--sh-lg) !important;
      background: var(--bg2) !important;
      backdrop-filter: var(--glass) !important;
      -webkit-backdrop-filter: var(--glass) !important;
    }

    body.en .sidebar {
      right: auto !important;
      left: 16px !important;
    }

    /* Main Wrapper Adjustment */
    .mw {
      margin-right: calc(var(--sidebar-w) + 32px) !important;
      margin-left: 0 !important;
      padding: 24px 32px !important;
      min-height: 100vh !important;
      transition: margin 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
    }

    body.en .mw {
      margin-left: calc(var(--sidebar-w) + 32px) !important;
      margin-right: 0 !important;
    }

    /* Cards */
    .card {
      background: var(--bg2) !important;
      border-radius: var(--r) !important;
      border: 1px solid var(--bd) !important;
      box-shadow: var(--sh) !important;
      backdrop-filter: var(--glass) !important;
      -webkit-backdrop-filter: var(--glass) !important;
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
    }

    .card:hover {
      transform: translateY(-4px) scale(1.005) !important;
      box-shadow: var(--sh-md) !important;
    }

    /* Inputs & Selects */
    .inp {
      border-radius: 16px !important;
      padding: 14px 18px !important;
      background: var(--bg2) !important;
      border: 1px solid var(--bd) !important;
      backdrop-filter: blur(16px) !important;
      transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1) !important;
    }

    .inp:focus {
      border-color: var(--ac) !important;
      box-shadow: 0 0 0 4px var(--acl) !important;
      transform: translateY(-1px) !important;
    }

    /* Buttons */
    .btn {
      border-radius: 9999px !important; /* Pill shape */
      padding: 12px 28px !important;
      font-weight: 600 !important;
      transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s !important;
    }

    .btn:active {
      transform: scale(0.95) !important;
    }

    .btn-p {
      background: var(--btn-g) !important;
      color: #fff !important;
      border: none !important;
      box-shadow: 0 4px 12px var(--acl) !important;
    }

    /* Tables */
    .tbl th {
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      font-size: 0.85rem !important;
      color: var(--tx3) !important;
      border-bottom: 1px solid var(--bd) !important;
    }
    
    .tbl td {
      border-bottom: 1px solid var(--bd-s) !important;
    }

    .tbl tr:hover td {
      background: rgba(255, 255, 255, 0.05) !important;
    }

    html[data-theme="dark"] .tbl tr:hover td {
      background: rgba(255, 255, 255, 0.02) !important;
    }
    
    /* Hide some mobile stuff if on desktop to avoid conflict */
    @media (max-width: 768px) {
      .sidebar {
        display: none !important;
      }
      .mw {
        margin: 0 !important;
        padding: 16px !important;
        padding-bottom: 90px !important;
      }
      body.en .mw {
        margin: 0 !important;
      }
    }
  </style>
</head>`;

// Inject before </head>
if (!code.includes('<style id="ios27">')) {
    code = code.replace('</head>', iosCSS);
    fs.writeFileSync('index.html', code, 'utf8');
    console.log("iOS override appended to head.");
} else {
    // If it already exists, replace it
    let regex = /<!-- iOS 27 \/ VisionOS Premium Override -->[\s\S]*?<\/style>\s*<\/head>/;
    code = code.replace(regex, iosCSS);
    fs.writeFileSync('index.html', code, 'utf8');
    console.log("iOS override updated in head.");
}
