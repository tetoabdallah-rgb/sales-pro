const fs = require('fs');

const jsPath = 'scripts/main.js';
let content = fs.readFileSync(jsPath, 'utf8');

const targetFunction = `    function parseFile(file, cb, sheetName) {
        let reader = new FileReader();
        reader.onload = e => {
            try {
                let wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
                let ws;
                if (sheetName) {
                    let sName = wb.SheetNames.find(s => s.trim().toLowerCase() === sheetName.trim().toLowerCase());
                    ws = sName ? wb.Sheets[sName] : wb.Sheets[wb.SheetNames[0]];
                } else {
                    ws = wb.Sheets[wb.SheetNames[0]];
                }
                cb(XLSX.utils.sheet_to_json(ws));
            } catch(err) { toast(L==='ar'?TUI('؟ Error reading file'):'؟ Error reading file'); }
        };
        reader.readAsArrayBuffer(file);
    }`;

// Since the exact text might have ? characters due to bad previous saves, we can use a regex to match the parseFile function block.
const parseFileRegex = /function parseFile\(file,\s*cb,\s*sheetName\)\s*{[\s\S]*?reader\.readAsArrayBuffer\(file\);\s*}/;

const replacementFunction = `function parseFile(file, cb, sheetName) {
        // Show loader
        let loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = '<div class="loader-content"><div class="loader-icon">📊</div><div class="loader-text">' + (typeof L !== 'undefined' && L==='ar'?'جاري معالجة البيانات...':'Processing Data...') + '</div></div>';
        document.body.appendChild(loader);

        let reader = new FileReader();
        reader.onload = e => {
            // Use setTimeout to yield to the UI thread so the loader renders
            setTimeout(() => {
                try {
                    let wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
                    let ws;
                    if (sheetName) {
                        let sName = wb.SheetNames.find(s => s.trim().toLowerCase() === sheetName.trim().toLowerCase());
                        ws = sName ? wb.Sheets[sName] : wb.Sheets[wb.SheetNames[0]];
                    } else {
                        ws = wb.Sheets[wb.SheetNames[0]];
                    }
                    cb(XLSX.utils.sheet_to_json(ws));
                } catch(err) { 
                    if(typeof toast === 'function') toast(typeof L !== 'undefined' && L==='ar' ? 'خطأ في قراءة الملف' : 'Error reading file', 'error'); 
                } finally {
                    loader.classList.add('fade-out');
                    setTimeout(() => loader.remove(), 500);
                }
            }, 50);
        };
        reader.readAsArrayBuffer(file);
    }`;

if (parseFileRegex.test(content)) {
    content = content.replace(parseFileRegex, replacementFunction);
    
    // Also fix the toast message on line 2654 to display properly (if it has ??)
    content = content.replace(/toast\(L==='ar'\s*\?\s*'.*?'\s*:\s*'.*?'\);\s*render\(\);/g, "toast(L==='ar' ? '✅ تم تحديث البيانات بنجاح!' : '✅ Data Updated!');\n            render();");
    
    fs.writeFileSync(jsPath, content, 'utf8');
    console.log("Successfully replaced parseFile.");
} else {
    console.log("Could not find parseFile function.");
}
