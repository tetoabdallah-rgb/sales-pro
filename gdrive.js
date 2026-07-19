// js/gdrive.js

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Initialize Google APIs
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    let API_KEY = localStorage.getItem('sp_gdrive_api') || '';
    if (!API_KEY) return;
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        gapiInited = true;
    } catch (err) {
        console.warn("Error initializing GAPI client: ", err);
    }
}

function gisLoaded() {
    let CLIENT_ID = localStorage.getItem('sp_gdrive_client') || '';
    if (!CLIENT_ID) return;
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: '', // defined later
    });
    gisInited = true;
}

// Ensure scripts call our init functions when loaded
if (typeof gapi !== 'undefined') gapiLoaded();
if (typeof google !== 'undefined') gisLoaded();

// Helper: Backup Data to Google Drive
window.backupToGoogleDrive = async function() {
    let CLIENT_ID = localStorage.getItem('sp_gdrive_client') || '';
    let API_KEY = localStorage.getItem('sp_gdrive_api') || '';

    if (!CLIENT_ID || !API_KEY) {
        if(typeof toast === 'function') toast(L==='ar'?'يرجى إضافة Client ID و API Key في الإعدادات':'Please add Client ID and API Key in Settings', 'error');
        return;
    }

    if (!gapiInited) {
        await initializeGapiClient();
    }
    if (!gisInited) {
        gisLoaded();
    }

    if (!gapiInited || !gisInited) {
        if(typeof toast === 'function') toast(L==='ar'?'خدمة Google Drive غير جاهزة، تأكد من المفاتيح أو الاتصال بالإنترنت':'Google Drive is not ready, check keys or internet', 'error');
        return;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        
        if(typeof toast === 'function') toast(L==='ar'?'جاري الرفع إلى Google Drive...':'Uploading to Google Drive...', 'info');
        
        let dump = { S: (typeof S !== 'undefined'?S:[]), T: (typeof T !== 'undefined'?T:[]), C: (typeof C !== 'undefined'?C:[]), D: (typeof D !== 'undefined'?D:[]), accCats: (typeof accCats !== 'undefined'?accCats:[]), hwCats: (typeof hwCats !== 'undefined'?hwCats:[]) };
        const fileContent = JSON.stringify(dump);
        const file = new Blob([fileContent], { type: 'application/json' });
        const metadata = {
            'name': `SalesPro_Backup_${new Date().toISOString().split('T')[0]}.json`,
            'mimeType': 'application/json'
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        try {
            const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
                body: form
            });
            const data = await res.json();
            if (data.id) {
                if(typeof toast === 'function') toast(L==='ar'?'تم الرفع بنجاح! تفقد Google Drive':'Uploaded successfully! Check Google Drive', 'success');
            } else {
                throw new Error("لم يتم إرجاع معرف الملف");
            }
        } catch (err) {
            console.error("Upload error", err);
            if(typeof toast === 'function') toast(L==='ar'?'فشل الرفع':'Upload failed', 'error');
        }
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
};
