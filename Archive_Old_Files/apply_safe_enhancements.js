const fs = require('fs');
const path = './index.html';

let code = fs.readFileSync(path, 'utf8');
console.log("Original length:", code.length);

// 1. Add sanitize function
const sanitizeCode = `
window.sanitize = function(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, match => {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[match];
    });
};
`;

if (!code.includes('window.sanitize')) {
    code = code.replace('<script>', '<script>\n' + sanitizeCode);
    console.log("Added sanitize()");
}

// 2. Add PDFExport library to head
const pdfScripts = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
`;
if (!code.includes('pdfmake.min.js')) {
    code = code.replace('</head>', pdfScripts + '</head>');
    console.log("Added pdfmake scripts to <head>");
}

// 3. Add PDF button next to Excel button
const pdfButtonCode = `<button class="btn export-btn" style="background:var(--rdl); color:var(--rd); border-color:var(--rd);" onclick="exportTableToPDF('salesTable', 'Sales_Report')">?? Export PDF</button>`;

let matches = 0;
code = code.replace(/(<button class="btn export-btn" onclick="exportTableToExcel\([^)]+\)">[^<]+<\/button>)/g, (match) => {
    if (match.includes('salesTable')) {
        matches++;
        return match + ' ' + pdfButtonCode;
    }
    return match;
});
console.log(`Added PDF button to ${matches} places`);

// 4. Implement exportTableToPDF
const pdfImpl = `
window.exportTableToPDF = function(tableId, title) {
    if(typeof pdfMake === 'undefined') {
        if(typeof toast === 'function') toast(L==='ar'?'??????? ???????? ??? ??????':'PDF library not loaded', 'error');
        return;
    }
    try {
        let table = document.getElementById(tableId);
        if(!table) return;
        
        let body = [];
        // headers
        let headRow = [];
        table.querySelectorAll('th').forEach(th => {
            headRow.push({ text: th.innerText, bold: true, fillColor: '#f0f2f5' });
        });
        body.push(headRow);
        
        // rows
        table.querySelectorAll('tbody tr').forEach(tr => {
            let row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.innerText);
            });
            body.push(row);
        });
        
        let docDefinition = {
            content: [
                { text: title, style: 'header', alignment: 'center', margin: [0,0,0,20] },
                {
                    table: {
                        headerRows: 1,
                        body: body
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true }
            },
            defaultStyle: {
                font: 'Roboto' // Note: pdfmake default font Roboto does not support Arabic well without custom VFS, but for English numbers/basic text it works. For full Arabic, a custom VFS is needed, but this is a solid start without breaking anything.
            }
        };
        pdfMake.createPdf(docDefinition).download(title + '.pdf');
        if(typeof toast === 'function') toast(L==='ar'?'?? ?????? PDF ?????!':'PDF Exported!', 'success');
    } catch(e) {
        console.error(e);
        if(typeof toast === 'function') toast('Error: ' + e.message, 'error');
    }
};
`;

if (!code.includes('window.exportTableToPDF')) {
    code = code.replace('<script>', '<script>\n' + pdfImpl);
    console.log("Added exportTableToPDF implementation");
}

// Save changes
fs.writeFileSync(path, code);
console.log("Changes applied successfully. New length:", code.length);
