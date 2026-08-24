// Append dynamic NAV injection to new_features.js
const fs = require('fs');
let content = fs.readFileSync('new_features.js', 'utf8');

const injectionCode = `

// =======================
// DYNAMIC UI INJECTION
// =======================
(function injectNavItems() {
    if (typeof NAV !== 'undefined') {
        // Only inject if not already there
        if (!NAV.find(n => n.p === 'visits')) {
            let coreIdx = NAV.findIndex(n => n.s && n.s.en === 'Depts');
            if (coreIdx > -1) {
                NAV.splice(coreIdx, 0, {p:'visits',ic:'🚗'}, {p:'leads',ic:'🤝'});
            } else {
                NAV.push({p:'visits',ic:'🚗'}, {p:'leads',ic:'🤝'});
            }
        }
    }
    
    if (typeof ICONS !== 'undefined') {
        ICONS['visits'] = '🚗';
        ICONS['leads'] = '🤝';
        // 'collections' is already in NAV but might need translation if missing
    }
})();

let old_buildNav = window.buildNav;
window.buildNav = function() {
    if(old_buildNav) old_buildNav();
    
    setTimeout(() => {
        let L = window.L || 'ar';
        let elVisits = document.querySelector('.ni[data-p="visits"] span:nth-child(2)');
        if(elVisits) elVisits.textContent = L==='ar' ? 'الزيارات' : 'Visits';
        
        let elLeads = document.querySelector('.ni[data-p="leads"] span:nth-child(2)');
        if(elLeads) elLeads.textContent = L==='ar' ? 'محتملين' : 'Leads';
        
        let elCol = document.querySelector('.ni[data-p="collections"] span:nth-child(2)');
        if(elCol) elCol.textContent = L==='ar' ? 'التحصيلات' : 'Collections';
    }, 50);
};

// Override render to catch our new pages if the original app.js doesn't route them
let old_render = window.render;
window.render = function() {
    if (typeof P !== 'undefined') {
        if (P === 'visits') {
            if (typeof buildNav === 'function') buildNav();
            rVisits();
            return;
        }
        if (P === 'leads') {
            if (typeof buildNav === 'function') buildNav();
            rLeads();
            return;
        }
        // collections is already routed by original code maybe? But let's be safe
        if (P === 'collections') {
            if (typeof buildNav === 'function') buildNav();
            if (typeof rCollections === 'function') rCollections();
            return;
        }
    }
    if (old_render) old_render();
};
`;

if (!content.includes('DYNAMIC UI INJECTION')) {
    fs.writeFileSync('new_features.js', content + '\n' + injectionCode, 'utf8');
    console.log('Successfully injected dynamic UI logic into new_features.js');
} else {
    console.log('Already injected.');
}
