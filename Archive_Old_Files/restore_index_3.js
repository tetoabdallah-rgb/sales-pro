const https = require('https');
const fs = require('fs');

const options = {
    hostname: 'raw.githubusercontent.com',
    path: '/tetoabdallah-rgb/sales-pro/7e0b914b47cbc66d6effb833bcb893b435290726/index.html',
    method: 'GET'
};

https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('index.html.restored3', data, 'utf8');
        console.log(`Restored 3! Size: ${data.length}`);
    });
}).on('error', console.error);
