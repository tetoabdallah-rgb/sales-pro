
window.exportToPDF = function(data, filename) {
    if(typeof pdfMake === 'undefined') {
        if(typeof toast === 'function') toast(typeof L !== 'undefined' && L==='ar' ? 'مكتبة PDF لم يتم تحميلها' : 'PDF library not loaded', 'error');
        return;
    }
    if(!data || data.length === 0) {
        if(typeof toast === 'function') toast(typeof L !== 'undefined' && L==='ar' ? 'لا توجد بيانات للتصدير' : 'No data to export', 'error');
        return;
    }
    
    try {
        let body = [];
        // Extract headers from the first object
        let headers = Object.keys(data[0]);
        let headRow = headers.map(h => ({ text: h, bold: true, fillColor: '#f0f2f5' }));
        body.push(headRow);
        
        // Extract rows
        data.forEach(rowObj => {
            let row = headers.map(h => String(rowObj[h] || ''));
            body.push(row);
        });
        
        let docDefinition = {
            content: [
                { text: filename, style: 'header', alignment: 'center', margin: [0,0,0,20] },
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
                font: 'Roboto'
            }
        };
        pdfMake.createPdf(docDefinition).download(filename + '.pdf');
        if(typeof toast === 'function') toast(typeof L !== 'undefined' && L==='ar' ? 'تم التصدير PDF' : 'PDF Exported!', 'success');
    } catch(e) {
        console.error(e);
        if(typeof toast === 'function') toast('Error: ' + e.message, 'error');
    }
};

// Automatically find Excel buttons and inject PDF buttons next to them
window.addEventListener('load', () => {
    setTimeout(() => {
        // Find buttons that call exportToExcel
        const excelBtns = document.querySelectorAll('button');
        excelBtns.forEach(btn => {
            if (btn.innerText && btn.innerText.toLowerCase().includes('excel') && btn.onclick && btn.onclick.toString().includes('exportToExcel')) {
                // Check if we already added a PDF button
                if (btn.nextElementSibling && btn.nextElementSibling.innerText.includes('PDF')) return;
                
                let pdfBtn = document.createElement('button');
                pdfBtn.className = btn.className;
                pdfBtn.style.cssText = btn.style.cssText;
                // Change color to red
                pdfBtn.style.background = 'var(--rdl)';
                pdfBtn.style.color = 'var(--rd)';
                pdfBtn.style.borderColor = 'var(--rd)';
                pdfBtn.innerHTML = btn.innerHTML.replace(/Excel/i, 'PDF').replace('?','?').replace('&#x1F4E5;','&#x1F4E5;'); // Replace icon if any
                
                // Copy onclick but replace exportToExcel with exportToPDF
                let clickCode = btn.onclick.toString();
                // Extract body of the function
                clickCode = clickCode.substring(clickCode.indexOf('{') + 1, clickCode.lastIndexOf('}'));
                if(!clickCode) {
                    // Arrow function fallback
                    let arrowIdx = btn.onclick.toString().indexOf('=>');
                    if(arrowIdx > -1) clickCode = btn.onclick.toString().substring(arrowIdx + 2);
                }
                
                if(clickCode) {
                    clickCode = clickCode.replace(/exportToExcel/g, 'exportToPDF');
                    pdfBtn.onclick = new Function('event', clickCode);
                    
                    // Insert after Excel button
                    btn.parentNode.insertBefore(pdfBtn, btn.nextSibling);
                }
            }
        });
    }, 1500); // Wait for DOM and initial renders
});
