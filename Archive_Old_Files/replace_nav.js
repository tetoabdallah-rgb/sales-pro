const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldNavRegex = /const NAV = \[\s*\{s:\{ar:'الأساسية',en:'Core'\}\},\s*\{p:'dash',ic:'📊'\},\{p:'sales',ic:'🧾'\},\{p:'targets',ic:'🎯'\},\{p:'personal',ic:'🤝'\},\s*\{p:'customers',ic:'🏢'\},\{p:'todo',ic:'📋'\},\{p:'brands',ic:'📦'\},\s*\{s:\{ar:'الأقسام',en:'Depts'\}\},\s*\{p:'accessories',ic:'🎧'\},\{p:'hardware',ic:'📱'\},\{p:'collections',ic:'💸'\},\s*\{s:\{ar:'متقدم',en:'Advanced'\}\},\s*\{p:'analytics',ic:'📈'\},\{p:'potential',ic:'🚀'\},\{p:'profit',ic:'💰'\},\s*\{p:'keyacc',ic:'👑'\},\{p:'dormant',ic:'😴'\},\{p:'prospects',ic:'🔍'\},\s*\{s:\{ar:'ذكي',en:'Smart'\}\},\s*\{p:'ai',ic:'🤖'\},\{p:'alerts',ic:'🔔'\},\s*\{s:\{ar:'النظام',en:'System'\}\},\s*\{p:'account',ic:'👤'\},\{p:'backup',ic:'💾'\},\{p:'setup',ic:'📁'\},\{p:'reset',ic:'🔄'\},\s*\{p:'settings',ic:'⚙️'\}\s*\];/g;

const newNav = const NAV = [
    {s:{ar:'الأساسية',en:'Core'}},
    {p:'dash',ic:'📊'},{p:'analytics',ic:'📈'},{p:'prospects',ic:'🔍'},{p:'sales',ic:'🧾'},{p:'targets',ic:'🎯'},{p:'personal',ic:'🤝'},
    {p:'customers',ic:'🏢'},{p:'todo',ic:'📋'},{p:'brands',ic:'📦'},
    {s:{ar:'الأقسام',en:'Depts'}},
    {p:'accessories',ic:'🎧'},{p:'hardware',ic:'📱'},{p:'collections',ic:'💸'},
    {s:{ar:'متقدم',en:'Advanced'}},
    {p:'potential',ic:'🚀'},{p:'profit',ic:'💰'},
    {p:'keyacc',ic:'👑'},{p:'dormant',ic:'😴'},
    {s:{ar:'ذكي',en:'Smart'}},
    {p:'ai',ic:'🤖'},{p:'alerts',ic:'🔔'},
    {s:{ar:'النظام',en:'System'}},
    {p:'account',ic:'👤'},{p:'backup',ic:'💾'},{p:'setup',ic:'📁'},{p:'reset',ic:'🔄'},
    {p:'settings',ic:'⚙️'}
];;

let oldContent = content;
content = content.replace(oldNavRegex, newNav);

if (content !== oldContent) {
    fs.writeFileSync('index.html', content, 'utf8');
    console.log('Successfully replaced NAV');
} else {
    console.log('Regex did not match!');
}
