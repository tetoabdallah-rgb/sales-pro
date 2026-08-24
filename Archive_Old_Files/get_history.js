const https = require('https');
const fs = require('fs');
const path = require('path');

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

const req = https.request({
    hostname: 'api.github.com',
    path: '/repos/tetoabdallah-rgb/sales-pro/commits?path=index.html',
    method: 'GET',
    headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${token}`
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        let commits = JSON.parse(data);
        commits.slice(0, 5).forEach((c, i) => {
            console.log(`[${i}] SHA: ${c.sha} - Date: ${c.commit.author.date} - Message: ${c.commit.message}`);
        });
    });
});
req.on('error', e => console.error(e));
req.end();
