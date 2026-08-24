const query = `[out:json][timeout:25];
nwr["shop"~"electronics|mobile_phone"](29.80,30.80,30.15,31.25);
out center 5;`;

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SalesProWeb Test (Node.js)'
    },
    body: 'data=' + encodeURIComponent(query)
})
.then(res => res.json())
.then(data => console.log(data.elements.length + " elements found"))
.catch(err => console.error(err));
