

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
// js/firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyAxXU5MePdVP1OcOyzitl0Jy5jMGrWtTSE",
    authDomain: "salesproapp-ba56b.firebaseapp.com",
    projectId: "salesproapp-ba56b",
    storageBucket: "salesproapp-ba56b.firebasestorage.app",
    messagingSenderId: "954558106678",
    appId: "1:954558106678:web:666ce1e645b3c9bbe01c97",
    measurementId: "G-FPFPWB7VV5"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Force long-polling to bypass strict Antiviruses or Firewalls that block WebSockets
db.settings({
    experimentalForceLongPolling: true
});

const auth = firebase.auth();
let currentUser = null;

