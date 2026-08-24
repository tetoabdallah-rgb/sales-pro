const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const backupButtonHtml = `
                <button class="btn" id="bDriveJSON" style="width:100%; justify-content:center; background:#0f9d58; color:white; border:none;">
                    نسخ احتياطي إلى (Google Drive) ☁️
                </button>`;

const backupButtonHtmlWithRestore = `
                <button class="btn" id="bDriveJSON" style="width:100%; justify-content:center; background:#0f9d58; color:white; border:none;">
                    نسخ احتياطي إلى (Google Drive) ☁️
                </button>
                <button class="btn" id="bRestoreDrive" style="width:100%; justify-content:center; background:#4285F4; color:white; border:none; margin-top:10px;">
                    استرجاع بواسطة (Google Drive) ⬇️
                </button>`;

code = code.replace(backupButtonHtml, backupButtonHtmlWithRestore);

const bDriveClick = `      if($('bDriveJSON')) {
          $('bDriveJSON').onclick = () => {
              if(typeof window.backupToGoogleDrive === 'function') {
                  window.backupToGoogleDrive();
              } else {
                  toast(L==='ar'?'خدمة Google Drive غير متوفرة':'Google Drive service is not available', 'error');
              }
          };
      }`;

const bDriveClickWithRestore = `      if($('bDriveJSON')) {
          $('bDriveJSON').onclick = () => {
              if(typeof window.backupToGoogleDrive === 'function') {
                  window.backupToGoogleDrive();
              } else {
                  toast(L==='ar'?'خدمة Google Drive غير متوفرة':'Google Drive service is not available', 'error');
              }
          };
      }
      if($('bRestoreDrive')) {
          $('bRestoreDrive').onclick = () => {
              if(typeof window.restoreFromGoogleDrive === 'function') {
                  window.restoreFromGoogleDrive();
              } else {
                  toast(L==='ar'?'خدمة Google Drive غير متوفرة':'Google Drive service is not available', 'error');
              }
          };
      }`;

code = code.replace(bDriveClick, bDriveClickWithRestore);

fs.writeFileSync('index.html', code, 'utf8');
console.log('Restore button added to index.html');
