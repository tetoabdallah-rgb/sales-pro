const fs = require('fs');

console.log('Reading index_prev_gh.html and settings.js...');
const prevGh = fs.readFileSync('index_prev_gh.html', 'utf8');
const settingsJs = fs.readFileSync('settings.js', 'utf8');

// 1. Extract email card HTML from settings.js
const cardStartMarker = '<div class="card" style="margin-bottom:20px; border-top: 4px solid #10b981;">';
let cardStartIdx = settingsJs.indexOf(cardStartMarker);
let profMarkerIdx = settingsJs.indexOf('الملف الشخصي', cardStartIdx);
let cardEndIdx = settingsJs.lastIndexOf('<div class="card">', profMarkerIdx);

if (cardStartIdx === -1 || cardEndIdx === -1) {
    console.error('Failed to find card boundaries in settings.js:', cardStartIdx, cardEndIdx);
    process.exit(1);
}
const emailCardHtml = settingsJs.slice(cardStartIdx, cardEndIdx).trim();
console.log('Extracted emailCardHtml, length:', emailCardHtml.length);

// 2. Extract email JS functions from settings.js
const jsStartMarker = 'window.toggleEmailServiceFields = function()';
let jsStartIdx = settingsJs.indexOf(jsStartMarker);
if (jsStartIdx === -1) {
    console.error('Failed to find JS start in settings.js');
    process.exit(1);
}
const emailJsCode = settingsJs.slice(jsStartIdx).trim();
console.log('Extracted emailJsCode, length:', emailJsCode.length);

// 3. Inject into prevGh
let newHtml = prevGh;

// Inject Settings Card right before Profile card
const targetProfile = '<div class="card">\n            <h3>👤 ${L===\'ar\'?\'الملف الشخصي\':\'Profile\'}</h3>';
let profIdx = newHtml.indexOf(targetProfile);
if (profIdx === -1) {
    // try looser search
    profIdx = newHtml.indexOf('<h3>👤 ${L===\'ar\'?\'الملف الشخصي\':\'Profile\'}</h3>');
    // back up to <div class="card">
    profIdx = newHtml.lastIndexOf('<div class="card">', profIdx);
}

if (profIdx === -1) {
    console.error('Failed to find profile card in prevGh');
    process.exit(1);
}

newHtml = newHtml.slice(0, profIdx) + emailCardHtml + '\n        ' + newHtml.slice(profIdx);
console.log('Injected settings card.');

// Inject Dashboard Header Button right after bDateClear
const targetDateClear = '<button id="bDateClear" class="btn" style="padding:6px 10px;font-size:0.7rem;">?</button>';
let dateIdx = newHtml.indexOf(targetDateClear);
if (dateIdx !== -1) {
    const insertAfter = dateIdx + targetDateClear.length;
    const btnHtml = '\n            <button onclick="if(typeof sendDailyReportNow===\'function\')sendDailyReportNow(false);" class="btn btn-p" style="padding:6px 12px;font-size:0.75rem;background:#10b981;border-color:#059669;color:#fff;display:flex;align-items:center;gap:4px;" title="إرسال تقرير المبيعات للإيميل">📧 ${L===\'ar\'?\'تقرير الإيميل\':\'Email Report\'}</button>';
    newHtml = newHtml.slice(0, insertAfter) + btnHtml + newHtml.slice(insertAfter);
    console.log('Injected dashboard header button.');
} else {
    console.warn('Could not find bDateClear, trying alternate...');
}

// Inject JS logic before </body>
const scriptBlock = `
<script>
// ==========================================================================
// Automated Daily Email Report System (Zero-Regression Clean Injection)
// ==========================================================================
${emailJsCode}

// Auto-trigger daily check in background after app loads
window.addEventListener('load', () => {
    setTimeout(() => {
        if (typeof checkAndSendDailyReport === 'function') {
            checkAndSendDailyReport();
        }
    }, 4500);
});
</script>
`;

const bodyEndIdx = newHtml.lastIndexOf('</body>');
if (bodyEndIdx !== -1) {
    newHtml = newHtml.slice(0, bodyEndIdx) + scriptBlock + '\n' + newHtml.slice(bodyEndIdx);
    console.log('Injected JS script block.');
} else {
    console.error('Failed to find </body>');
    process.exit(1);
}

// Save to index.html
fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('SUCCESS! Created clean index.html. New size:', newHtml.length);
console.log('Contains globalSearchInput?', newHtml.includes('globalSearchInput'));
console.log('Contains generateDailyReportData?', newHtml.includes('generateDailyReportData'));
