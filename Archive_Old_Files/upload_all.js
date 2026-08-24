const fs = require('fs');
const https = require('https');
const path = require('path');

const owner = 'tetoabdallah-rgb';
const repo = 'sales-pro';
const branch = 'main';
const filesToUpload = ['index.html', 'app.js', 'new_features.js', 'service-worker.js', 'logo_2b.png', 'sw.js'];

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
    console.error("NO GITHUB TOKEN!");
    process.exit(1);
}

async function uploadFile(file) {
    console.log(`Uploading ${file}...`);
    return new Promise((resolve, reject) => {
        const getOpts = {
            path: `/repos/${owner}/${repo}/contents/${file}?ref=${branch}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Node.js',
                'Authorization': `token ${token}`
            }
        };

        const getReq = https.request('https://api.github.com' + getOpts.path, getOpts, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let sha = null;
                if (res.statusCode === 200) {
                    const parsed = JSON.parse(data);
                    sha = parsed.sha;
                }

                const contentBuffer = fs.readFileSync(file);
                const base64Content = contentBuffer.toString('base64');

                const payload = JSON.stringify({
                    message: `Update ${file} - Inject PDF capabilities & bump SW`,
                    content: base64Content,
                    branch: branch,
                    sha: sha
                });

                const putOpts = {
                    path: `/repos/${owner}/${repo}/contents/${file}`,
                    method: 'PUT',
                    headers: {
                        'User-Agent': 'Node.js',
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload)
                    }
                };

                const putReq = https.request('https://api.github.com' + putOpts.path, putOpts, putRes => {
                    let putData = '';
                    putRes.on('data', chunk => putData += chunk);
                    putRes.on('end', () => {
                        if (putRes.statusCode === 200 || putRes.statusCode === 201) {
                            console.log(`SUCCESS! ${file} has been uploaded.`);
                            resolve();
                        } else {
                            console.error(`ERROR uploading ${file}:`, putRes.statusCode);
                            console.error(putData.slice(0, 500));
                            reject(new Error("Upload failed"));
                        }
                    });
                });

                putReq.on('error', err => reject(err));
                putReq.write(payload);
                putReq.end();
            });
        });

        getReq.on('error', err => reject(err));
        getReq.end();
    });
}

async function main() {
    for (let file of filesToUpload) {
        if (fs.existsSync(file)) {
            await uploadFile(file);
        }
    }
    console.log(`All done! Live website: https://${owner}.github.io/${repo}/index.html`);
}

main();
