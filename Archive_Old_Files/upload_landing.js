const fs = require('fs');
const https = require('https');
const path = require('path');

const owner = 'tetoabdallah-rgb';
const repo = 'sales-pro';
const branch = 'main';

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
    console.error('Error: GITHUB_TOKEN not found');
    process.exit(1);
}

const files = [
    { local: 'index.html', remote: 'index.html' },
    { local: 'styles/landing.css', remote: 'styles/landing.css' }
];

async function getSha(remotePath) {
    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}/contents/${remotePath}?ref=${branch}`,
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Node.js'
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const json = JSON.parse(data);
                    resolve(json.sha);
                } else {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.end();
    });
}

async function uploadFile(fileObj) {
    const localPath = path.join('e:/AI/apk/SalesProWeb', fileObj.local);
    if (!fs.existsSync(localPath)) return;
    const content = fs.readFileSync(localPath).toString('base64');
    const sha = await getSha(fileObj.remote);

    const body = {
        message: `feat: Redesigned landing page with animated background`,
        content: content,
        branch: branch
    };
    if (sha) body.sha = sha;

    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}/contents/${fileObj.remote}`,
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Node.js',
                'Content-Type': 'application/json'
            }
        }, (res) => {
            res.on('data', () => {});
            res.on('end', () => {
                console.log(`Uploaded: ${fileObj.remote}`);
                resolve();
            });
        });
        req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    for (const f of files) {
        await uploadFile(f);
    }
    console.log('All files deployed!');
})();
