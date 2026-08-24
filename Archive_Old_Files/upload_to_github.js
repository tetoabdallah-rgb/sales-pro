// upload_to_github.js - Reliable GitHub Pages uploader for Sales Pro
const fs = require('fs');
const https = require('https');
const path = require('path');

const owner = 'tetoabdallah-rgb';
const repo = 'sales-pro';
const branch = 'main';
const fileToUpload = 'index.html';

let token = process.env.GITHUB_TOKEN || '';
const envPath = path.join(process.env.USERPROFILE || process.env.HOME || '', '.env');

if (!token && fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (let line of lines) {
        if (line.trim().startsWith('GITHUB_TOKEN=')) {
            token = line.split('=')[1].trim();
            break;
        }
    }
}

if (!token) {
    console.error('❌ Error: GITHUB_TOKEN not found in environment or ~/.env');
    process.exit(1);
}

console.log(`🔄 Uploading ${fileToUpload} to https://github.com/${owner}/${repo} ...`);

const getOpts = {
    hostname: 'api.github.com',
    path: `/repos/${owner}/${repo}/contents/${fileToUpload}?ref=${branch}`,
    method: 'GET',
    headers: {
        'User-Agent': 'SalesPro-Uploader-Node',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    }
};

https.get(getOpts, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        let sha = null;
        if (res.statusCode === 200) {
            try {
                sha = JSON.parse(data).sha;
                console.log(`📌 Found existing file SHA: ${sha}`);
            } catch(e) {}
        }

        const contentBuffer = fs.readFileSync(fileToUpload);
        const base64Content = contentBuffer.toString('base64');

        const payload = JSON.stringify({
            message: `Update ${fileToUpload} - build and fixes`,
            content: base64Content,
            branch: branch,
            ...(sha ? { sha } : {})
        });

        const putOpts = {
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}/contents/${fileToUpload}`,
            method: 'PUT',
            headers: {
                'User-Agent': 'SalesPro-Uploader-Node',
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const putReq = https.request(putOpts, putRes => {
            let putData = '';
            putRes.on('data', chunk => putData += chunk);
            putRes.on('end', () => {
                if (putRes.statusCode === 200 || putRes.statusCode === 201) {
                    console.log(`✅ SUCCESS! ${fileToUpload} has been uploaded to GitHub.`);
                    console.log(`🌐 Live website: https://${owner}.github.io/${repo}/index.html`);
                } else {
                    console.error(`❌ FAILED to upload. Status: ${putRes.statusCode}`);
                    console.error(putData.slice(0, 500));
                }
            });
        });

        putReq.on('error', err => {
            console.error('❌ Request error:', err.message);
        });

        putReq.write(payload);
        putReq.end();
    });
}).on('error', err => {
    console.error('❌ Network error:', err.message);
});
