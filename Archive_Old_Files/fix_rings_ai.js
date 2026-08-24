const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
c = c.replace(/\\s* \u005D/g, '</div>');
c = c.replace(/\\s* \]\/g, '</div>');
c = c.replace(/\\s* \]/g, '</div>');
c = c.replace(/\\s* ]/g, '</div>');
c = c.replace(/\\s*\? \]\?/g, '</div>');
// Just manually replace that line
c = c.replace(
    /        <div class="rg">\$\{ring\(L==='ar'\?TUI\('Sales'\):'Sales', ap, ts\)\}\$\{ring\(L==='ar'\?TUI\('Profit'\):'Profit', pp, tp\)\}.*/g,
    "        <div class=\\"rg\\">\\${ring(L==='ar'?TUI('Sales'):'Sales', ap, ts)}\\${ring(L==='ar'?TUI('Profit'):'Profit', pp, tp)}</div>"
);
fs.writeFileSync('index.html', c);
console.log('Fixed ring endings!');
