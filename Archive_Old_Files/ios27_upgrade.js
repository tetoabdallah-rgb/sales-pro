const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Replace Light Theme Variables
code = code.replace(/:root\s*\{[\s\S]*?\}/, `:root {
    --bg: #f5f5f7;
    --bg2: rgba(255, 255, 255, 0.55);
    --glass: blur(40px) saturate(200%);
    --bg-g: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
    --bg3: rgba(255, 255, 255, 0.8);
    --bg4: rgba(255, 255, 255, 0.9);
    --tx1: #1d1d1f;
    --tx2: #515154;
    --tx3: #86868b;
    --ac: #007aff;
    --ac2: #5856d6;
    --acl: rgba(0, 122, 255, 0.15);
    --gn: #34c759;
    --gnl: rgba(52, 199, 89, 0.15);
    --rd: #ff3b30;
    --rdl: rgba(255, 59, 48, 0.15);
    --am: #ff9500;
    --aml: rgba(255, 149, 0, 0.15);
    --bl: #5ac8fa;
    --bll: rgba(90, 200, 250, 0.15);
    --bd: rgba(0, 0, 0, 0.05);
    --bd-s: rgba(0, 0, 0, 0.02);
    --r: 24px;
    --sh: 0 4px 24px rgba(0, 0, 0, 0.04);
    --sh-md: 0 12px 32px rgba(0, 0, 0, 0.08);
    --sh-lg: 0 20px 40px rgba(0, 0, 0, 0.12);
    --btn-g: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
    --sidebar-w: 280px;
  }`);

// Replace Dark Theme Variables
code = code.replace(/html\[data-theme="dark"\]\s*\{[\s\S]*?\}/, `html[data-theme="dark"] {
    --bg: #000000;
    --bg2: rgba(28, 28, 30, 0.55);
    --glass: blur(40px) saturate(200%);
    --bg-g: linear-gradient(120deg, #1c1c1e 0%, #2c2c2e 100%);
    --bg3: rgba(44, 44, 46, 0.8);
    --bg4: rgba(58, 58, 60, 0.9);
    --tx1: #f5f5f7;
    --tx2: #ebebf5;
    --tx3: #8e8e93;
    --ac: #0a84ff;
    --ac2: #5e5ce6;
    --acl: rgba(10, 132, 255, 0.15);
    --gn: #32d74b;
    --gnl: rgba(50, 215, 75, 0.15);
    --rd: #ff453a;
    --rdl: rgba(255, 69, 58, 0.15);
    --am: #ffd60a;
    --aml: rgba(255, 214, 10, 0.15);
    --bl: #64d2ff;
    --bll: rgba(100, 210, 255, 0.15);
    --bd: rgba(255, 255, 255, 0.08);
    --bd-s: rgba(255, 255, 255, 0.03);
    --sh: 0 4px 24px rgba(0, 0, 0, 0.3);
    --sh-md: 0 12px 32px rgba(0, 0, 0, 0.4);
    --sh-lg: 0 20px 40px rgba(0, 0, 0, 0.5);
    --btn-g: linear-gradient(135deg, #5e5ce6 0%, #0a84ff 100%);
  }`);

// Floating Sidebar
code = code.replace(/\.sidebar\s*\{[\s\S]*?z-index:\s*1000;\s*\}/, `.sidebar {
    position: fixed;
    top: 16px;
    right: 16px;
    width: var(--sidebar-w);
    height: calc(100vh - 32px);
    background: var(--bg2);
    border: 1px solid var(--bd);
    border-radius: var(--r);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    z-index: 1000;
    backdrop-filter: var(--glass);
    -webkit-backdrop-filter: var(--glass);
    box-shadow: var(--sh-lg);
  }`);

code = code.replace(/\.mw\s*\{[\s\S]*?min-height:\s*100vh;\s*\}/, `.mw {
    margin-right: calc(var(--sidebar-w) + 32px);
    padding: 24px 32px;
    transition: margin 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    min-height: 100vh;
  }`);

code = code.replace(/body\.en\s*\.sidebar\s*\{[\s\S]*?left:\s*0;\s*\}/, `body.en .sidebar {
    border-right: 1px solid var(--bd);
    border-left: 1px solid var(--bd);
    right: auto;
    left: 16px;
  }`);

code = code.replace(/body\.en\s*\.mw\s*\{[\s\S]*?margin-left:\s*var\(--sidebar-w\);\s*\}/, `body.en .mw {
    margin-right: 0;
    margin-left: calc(var(--sidebar-w) + 32px);
  }`);

// Cards
code = code.replace(/\.card\s*\{[\s\S]*?margin-bottom:\s*24px;\s*\}/, `.card {
    background: var(--bg2);
    border-radius: var(--r);
    padding: 24px;
    box-shadow: var(--sh);
    border: 1px solid var(--bd);
    margin-bottom: 24px;
    backdrop-filter: var(--glass);
    -webkit-backdrop-filter: var(--glass);
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }`);

if (!code.includes('.card:hover')) {
    code = code.replace(/\.card\s*\{[\s\S]*?\}/, `$&
  .card:hover {
      transform: translateY(-4px) scale(1.005);
      box-shadow: var(--sh-md);
  }`);
}

// Buttons
code = code.replace(/\.btn\s*\{[\s\S]*?cursor:\s*pointer;\s*\}/, `.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 9999px;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: inherit;
    border: 1px solid var(--bd);
    background: var(--bg3);
    color: var(--tx1);
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    cursor: pointer;
  }`);

if (!code.includes('.btn:active')) {
    code = code.replace(/\.btn:hover\s*\{[\s\S]*?\}/, `$&
  .btn:active {
      transform: scale(0.95);
  }`);
}

// Nav Items
code = code.replace(/\.nI\s*\{[\s\S]*?margin-bottom:\s*4px;\s*\}/, `.nI {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    color: var(--tx2);
    text-decoration: none;
    border-radius: 16px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    margin-bottom: 6px;
  }`);

code = code.replace(/\.nI:hover\s*\{[\s\S]*?\}/, `.nI:hover {
    background: var(--bg3);
    color: var(--tx1);
    transform: scale(1.02);
  }`);

// Inputs
code = code.replace(/\.inp\s*\{[\s\S]*?transition:\s*all\s*0\.3s\s*ease;\s*\}/, `.inp {
    width: 100%;
    padding: 14px 18px;
    border-radius: 16px;
    border: 1px solid var(--bd);
    background: var(--bg2);
    color: var(--tx1);
    font-size: 0.95rem;
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    backdrop-filter: blur(10px);
  }`);

code = code.replace(/\.inp:focus\s*\{[\s\S]*?\}/, `.inp:focus {
    outline: none;
    border-color: var(--ac);
    box-shadow: 0 0 0 4px var(--acl);
    transform: translateY(-1px);
  }`);

// Table tweaks
code = code.replace(/\.tbl\s*th\s*\{[\s\S]*?border-bottom:\s*2px\s*solid\s*var\(--bd\);\s*\}/, `.tbl th {
    padding: 16px;
    color: var(--tx3);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--bd);
  }`);
  
code = code.replace(/\.tbl\s*td\s*\{[\s\S]*?border-bottom:\s*1px\s*solid\s*var\(--bd\);\s*\}/, `.tbl td {
    padding: 16px;
    color: var(--tx1);
    border-bottom: 1px solid var(--bd-s);
  }`);

fs.writeFileSync('index.html', code, 'utf8');
console.log("iOS 27 style applied successfully.");
