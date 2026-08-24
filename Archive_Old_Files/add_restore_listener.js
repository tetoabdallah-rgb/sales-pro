const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const anchor = `      if($('bMailJSON')) {`;
const inject = `
      if($('bRestoreDrive')) {
          $('bRestoreDrive').onclick = () => {
              if(typeof window.restoreFromGoogleDrive === 'function') {
                  window.restoreFromGoogleDrive();
              } else {
                  toast(L==='ar'?'خدمة Google Drive غير متاحة':'Google Drive service is not available', 'error');
              }
          };
      }
`;

code = code.replace(anchor, inject + anchor);
fs.writeFileSync('index.html', code, 'utf8');
console.log('Restore listener injected');
