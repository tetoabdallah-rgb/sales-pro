const fs = require('fs');

let authFile = 'e:/AI/apk/SalesProWeb/auth.js';
let authContent = fs.readFileSync(authFile, 'utf-8');
authContent = authContent.replace(/db\.collection\('cloud_backups'\)\.doc\(user\.uid\)/g, "db.collection('users').doc(user.uid).collection('backup').doc('main')");
fs.writeFileSync(authFile, authContent, 'utf-8');

let gdriveFile = 'e:/AI/apk/SalesProWeb/gdrive.js';
let gdriveContent = fs.readFileSync(gdriveFile, 'utf-8');
gdriveContent = gdriveContent.replace(/db\.collection\('cloud_backups'\)\.doc\(currentUser\.uid\)/g, "db.collection('users').doc(currentUser.uid).collection('backup').doc('main')");
fs.writeFileSync(gdriveFile, gdriveContent, 'utf-8');

console.log('Replaced cloud_backups with users subcollection to fix permission issues');
