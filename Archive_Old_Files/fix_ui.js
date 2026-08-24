const fs = require('fs');

function fixHtml(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // The target is the buttons div in Kanban lead cards:
    // <div style="display:flex; gap:5px;">
    //     <button onclick="window.waLead('', '')" class="btn" style="flex:1; background:#25D366; color:#fff; padding:6px; font-size:0.9rem; border:none; border-radius:4px;">WhatsApp</button>
    //     <button onclick="window.delLead()" class="btn" style="background:#f44336; color:#fff; padding:6px; border:none; border-radius:4px;">X</button>
    // </div>
    
    // First, let's fix the container div for the buttons. We'll find it by searching for the buttons.
    let rx = /<div style="display:flex;\s*gap:5px;">\s*<button[^>]*>WhatsApp<\/button>\s*<button[^>]*>X<\/button>\s*<\/div>/g;
    
    content = content.replace(/<div style="display:flex; gap:5px;">(\s*<button onclick="window\.waLead[^>]*>.*?<\/button>\s*<button onclick="window\.delLead[^>]*>.*?<\/button>\s*)<\/div>/g, 
        '<div style="display:flex; gap:5px; flex-wrap:wrap;"></div>');
        
    // Wait, the above regex might be too strict. Let's do string replacement.
    content = content.replace(/<div style="display:flex; gap:5px;">\s*<button onclick="window\.waLead/g, '<div style="display:flex; gap:5px; flex-wrap:wrap; justify-content:space-between; align-items:center;">\n                    <button onclick="window.waLead');
    
    // Let's make the X button flex:1 too, or change its design.
    // X button has style="background:#f44336; color:#fff; padding:6px; border:none; border-radius:4px;"
    content = content.replace(/style="background:#f44336; color:#fff; padding:6px; border:none; border-radius:4px;"/g, 'style="background:#f44336; color:#fff; padding:6px; border:none; border-radius:4px; flex:1; min-width:40px; display:flex; justify-content:center; align-items:center;"');
    
    // WA button has style="flex:1; background:#25D366; color:#fff; padding:6px; font-size:0.9rem; border:none; border-radius:4px;"
    content = content.replace(/style="flex:1; background:#25D366; color:#fff; padding:6px; font-size:0.9rem; border:none; border-radius:4px;"/g, 'style="flex:2; background:#25D366; color:#fff; padding:6px; font-size:0.9rem; border:none; border-radius:4px; display:flex; justify-content:center; align-items:center;"');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed buttons in ' + file);
}

fixHtml('e:/AI/apk/SalesProWeb/index.html');
fixHtml('e:/AI/apk/SalesProWeb/ui-components.js');

function fixNewFeatures(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // qBtn
    content = content.replace(/'background:#8b5cf6; color:#fff; padding:6px; border:none; border-radius:4px; margin-left:4px; margin-right:4px;'/g, 
        "'flex:1; background:#8b5cf6; color:#fff; padding:6px; border:none; border-radius:4px; display:flex; justify-content:center; align-items:center; min-width:40px;'");
        
    // pBtn
    content = content.replace(/'padding:6px; border:none; border-radius:4px; margin-left:4px; margin-right:4px;'/g, 
        "'flex:1; padding:6px; border:none; border-radius:4px; display:flex; justify-content:center; align-items:center; min-width:40px;'");
        
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed buttons in ' + file);
}

fixNewFeatures('e:/AI/apk/SalesProWeb/new_features.js');

