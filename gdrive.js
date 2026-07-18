// js/gdrive.js

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // User needs to replace this
const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';     // User needs to replace this
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Initialize Google APIs
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
    } catch (err) {
        console.warn("Error initializing GAPI client: ", err);
    }
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
}

// Ensure scripts call our init functions when loaded
if (typeof gapi !== 'undefined') gapiLoaded();
if (typeof google !== 'undefined') gisLoaded();

// Helper: Backup Data to Google Drive
window.backupToGoogleDrive = async function() {
    if (!gapiInited || !gisInited) {
        if(typeof toast === 'function') toast("Google Drive غير جاهز بعد", "error");
        return;
    }
    
    if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        if(typeof toast === 'function') toast("يرجى إضافة Client ID في ملف gdrive.js", "error");
        return;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        
        if(typeof toast === 'function') toast("جاري الرفع إلى Google Drive...", "info");
        
        let dump = { S, T, C, D, accCats, hwCats };
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
                if(typeof toast === 'function') toast("تم الرفع بنجاح! تفقد Google Drive", "success");
            } else {
                throw new Error("لم يتم إرجاع معرف الملف");
            }
        } catch (err) {
            console.error("Upload error", err);
            if(typeof toast === 'function') toast("فشل الرفع", "error");
        }
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
};
