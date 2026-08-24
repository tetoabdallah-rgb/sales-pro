// js/gdrive.js - Full Google Drive API Integration

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

let tokenClient;
let gapiInited = false;
let gisInited = false;

window.gapiLoaded = function() {
    if (typeof gapi !== 'undefined' && !gapi.client) {
        gapi.load('client', initializeGapiClient);
    } else if (typeof gapi !== 'undefined' && gapi.client) {
        initializeGapiClient();
    }
};

async function initializeGapiClient() {
    try {
        const API_KEY = localStorage.getItem('gdrive_api_key');
        if (!API_KEY) return;
        
        // Ensure gapi.client is loaded
        if (typeof gapi !== 'undefined' && !gapi.client) {
            await new Promise((resolve) => gapi.load('client', resolve));
        }

        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
    } catch (err) {
        console.warn("Error initializing GAPI client: ", err);
        throw err;
    }
}

window.gisLoaded = function() {
    const CLIENT_ID = localStorage.getItem('gdrive_client_id');
    if (!CLIENT_ID) return;
    if (typeof google === 'undefined' || !google.accounts) return;
    
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', 
    });
    gisInited = true;
};

// Auto-run if script tags loaded before this script
if (typeof gapi !== 'undefined') window.gapiLoaded();
if (typeof google !== 'undefined') window.gisLoaded();

let isInitializing = false;

async function requireAuth(callback) {
    const CLIENT_ID = localStorage.getItem('gdrive_client_id');
    const API_KEY = localStorage.getItem('gdrive_api_key');
    
    if (!CLIENT_ID || !API_KEY) {
        if(typeof toast === 'function') toast(L==='ar'?'يجب إدخال Google Client ID و API Key في الإعدادات':'Please enter Google Client ID and API Key in Settings', 'error');
        return;
    }

    if (isInitializing) {
        setTimeout(() => requireAuth(callback), 500);
        return;
    }

    isInitializing = true;
    try {
        if (!gapiInited) await initializeGapiClient();
        if (!gisInited) window.gisLoaded();
    } catch(e) {
        console.error(e);
    }
    isInitializing = false;

    if (!gapiInited || !gisInited) {
        if(typeof toast === 'function') toast(L==='ar'?'فشل الاتصال بخوادم جوجل. تأكد من صحة المفاتيح.':'Failed to connect to Google. Check keys.', 'error');
        return;
    }

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            if(typeof toast === 'function') toast(L==='ar'?'خطأ في تسجيل الدخول لجوجل':'Google Login Error', 'error');
            console.error(resp);
            return;
        }
        callback();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

window.backupToGoogleDrive = function() {
    requireAuth(async () => {
        if(typeof toast === 'function') toast(L==='ar'?'جاري الحفظ في جوجل درايف...':'Saving to Google Drive...', 'info');
        
        let ds = document.getElementById('driveStatus');
        if(ds) ds.innerHTML = `<span style="color:blue">${L==='ar'?'جاري الرفع...':'Uploading...'}</span>`;

        let dump = {
            salesData:  S        || [],
            targetData: T        || [],
            accCats:    accCats  || [],
            hwCats:     hwCats   || [],
            payData:    C        || [],
            duesData:   D        || [],
            lastUpdated: new Date().toISOString()
        };
        const fileContent = JSON.stringify(dump);
        const file = new Blob([fileContent], { type: 'application/json' });
        const metadata = {
            'name': `SalesPro_Backup.json`,
            'mimeType': 'application/json'
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        try {
            // First check if file already exists to overwrite it
            let existingFileId = null;
            const search = await gapi.client.drive.files.list({
                q: "name='SalesPro_Backup.json' and trashed=false",
                spaces: 'drive',
                fields: 'files(id, name)'
            });
            if (search.result.files && search.result.files.length > 0) {
                existingFileId = search.result.files[0].id;
            }

            let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            let method = 'POST';
            if (existingFileId) {
                url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
                method = 'PATCH';
            }

            const res = await fetch(url, {
                method: method,
                headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
                body: form
            });
            
            const data = await res.json();
            if (data.id) {
                let tme = new Date().toLocaleString(L === 'ar' ? 'ar-EG' : 'en-US');
                localStorage.setItem('last_gdrive_sync', tme);
                if(typeof toast === 'function') toast(L==='ar'?'✅ تم الحفظ في جوجل درايف!':'✅ Saved to Google Drive!', 'success');
                if(ds) ds.innerHTML = `✅ <strong>${L==='ar'?'آخر مزامنة:':'Last sync:'}</strong> ${tme}`;
            } else {
                throw new Error("Invalid response from Google Drive");
            }
        } catch (err) {
            console.error("Upload error", err);
            if(ds) ds.innerHTML = `<span style="color:red">Upload Error</span>`;
            if(typeof toast === 'function') toast(L==='ar'?'❌ فشل الحفظ في السحابة':'❌ Cloud save failed', 'error');
        }
    });
};

window.restoreFromGoogleDrive = function() {
    if (!confirm(L === 'ar' ? 'تحذير: سيتم استبدال البيانات الحالية بالنسخة الموجودة في جوجل درايف. متأكد؟' : 'Warning: Current data will be replaced with Google Drive backup. Sure?')) return;
    
    requireAuth(async () => {
        if(typeof toast === 'function') toast(L==='ar'?'جاري البحث عن النسخة...':'Searching for backup...', 'info');
        let ds = document.getElementById('driveStatus');
        if(ds) ds.innerHTML = `<span style="color:blue">${L==='ar'?'جاري التنزيل...':'Downloading...'}</span>`;

        try {
            const search = await gapi.client.drive.files.list({
                q: "name='SalesPro_Backup.json' and trashed=false",
                spaces: 'drive',
                fields: 'files(id, name, modifiedTime)',
                orderBy: 'modifiedTime desc'
            });

            if (!search.result.files || search.result.files.length === 0) {
                if(typeof toast === 'function') toast(L==='ar'?'❌ لا يوجد نسخة احتياطية في جوجل درايف!':'❌ No backup found in Google Drive!', 'error');
                if(ds) ds.innerHTML = `<span style="color:red">No backup found!</span>`;
                return;
            }

            const fileId = search.result.files[0].id;
            
            // Download file content
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token })
            });
            
            const content = await res.text();
            let p = JSON.parse(content);
            
            if (p.salesData)  { S       = p.salesData;  sv('salesData',  S); }
            if (p.targetData) { T       = p.targetData; sv('targetData', T); }
            if (p.accCats)    { accCats = p.accCats;    sv('accCats',    accCats); }
            if (p.hwCats)     { hwCats  = p.hwCats;     sv('hwCats',     hwCats); }
            if (p.payData)    { C       = p.payData;    sv('payData',    C); }
            if (p.duesData)   { D       = p.duesData;   sv('duesData',   D); }

            let tme = new Date(search.result.files[0].modifiedTime).toLocaleString(L === 'ar' ? 'ar-EG' : 'en-US');
            localStorage.setItem('last_gdrive_sync', tme);

            if (typeof toast === 'function') toast(L === 'ar' ? '✅ تم الاسترجاع بنجاح!' : '✅ Restored successfully!', 'success');
            if(ds) ds.innerHTML = `✅ <strong>${L==='ar'?'تم الاسترجاع!':'Restored!'}</strong>`;
            
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            console.error("Restore error", err);
            if(ds) ds.innerHTML = `<span style="color:red">Restore Error</span>`;
            if(typeof toast === 'function') toast(L==='ar'?'❌ فشل استرجاع البيانات':'❌ Restore failed', 'error');
        }
    });
};

window.saveToFirebaseCloud = async function() {
    if (typeof currentUser === 'undefined' || !currentUser || typeof db === 'undefined' || !db) return;
    try {
        let dump = {
            salesData:  typeof S !== 'undefined' ? (S || []) : [],
            targetData: typeof T !== 'undefined' ? (T || []) : [],
            accCats:    typeof accCats !== 'undefined' ? (accCats || []) : [],
            hwCats:     typeof hwCats !== 'undefined' ? (hwCats || []) : [],
            payData:    typeof C !== 'undefined' ? (C || []) : [],
            duesData:   typeof D !== 'undefined' ? (D || []) : [],
            lastUpdated: new Date().toISOString(),
            savedBy: currentUser.email || currentUser.uid
        };
        
        let str = JSON.stringify(dump);
        const chunkSize = 800000;
        let numChunks = Math.ceil(str.length / chunkSize);
        
        await db.collection('users').doc(currentUser.uid).set({
            backup_chunks: numChunks,
            backup_timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            backup_lastUpdated: dump.lastUpdated,
            backup_savedBy: dump.savedBy
        }, { merge: true });
        
        for(let i=0; i<numChunks; i++){
            let part = str.slice(i*chunkSize, (i+1)*chunkSize);
            await db.collection('users').doc(currentUser.uid).collection('chunks').doc('backup_chunk_'+i).set({ data: part });
        }
        console.log("✅ Silent Firebase cloud backup complete!");
    } catch(e) {
        console.error("Firebase backup error:", e);
    }
};

window.cloudAutoSave = function() {
    if (typeof window.saveToFirebaseCloud === 'function') {
        window.saveToFirebaseCloud();
    }
    if (typeof window.backupToGoogleDrive === 'function') {
        if (window.gapi && gapi.client && gapi.client.getToken() !== null) {
            window.backupToGoogleDrive();
        }
    }
};

// Automatic backup to Google Drive every 15 minutes (900,000 ms)
setInterval(() => {
    console.log("🕒 Running 15-minute automatic backup to Google Drive...");
    if (typeof window.backupToGoogleDrive === 'function') {
        if (window.gapi && gapi.client && gapi.client.getToken() !== null) {
            window.backupToGoogleDrive();
        } else if (typeof window.syncUI === 'function') {
            console.log("Google Drive token not active in background; synced with Firebase Cloud.");
        }
    }
}, 15 * 60 * 1000);


window.getCloudInfo = async function() {
    let lastS = localStorage.getItem('last_gdrive_sync');
    if(!lastS) return null;
    return {
        lastUpdated: lastS,
        salesCount: (S || []).length,
        payCount: (C || []).length
    };
};
