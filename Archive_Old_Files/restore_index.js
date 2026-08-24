const https = require('https');
const fs = require('fs');

const options = {
    hostname: 'raw.githubusercontent.com',
    path: '/tetoabdallah-rgb/sales-pro/6b941cd9829f733de06dd5516087c829bd46f4c7/index.html',
    method: 'GET'
};

https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('index.html.restored', data, 'utf8');
        console.log(`Restored! Size: ${data.length}`);
    });
}).on('error', console.error);
