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

const getOpts = {
    hostname: 'api.github.com',
    path: `/repos/tetoabdallah-rgb/sales-pro/commits?per_page=10`,
    method: 'GET',
    headers: {
        'User-Agent': 'Node',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    }
};

https.get(getOpts, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        try {
            let commits = JSON.parse(data);
            commits.forEach(c => {
                console.log(c.sha.substring(0,7), c.commit.committer.date, c.commit.message);
            });
        } catch(e) {
            console.log('Error parsing:', e.message, data.slice(0, 200));
        }
    });
}).on('error', e => console.log('Err:', e.message));
