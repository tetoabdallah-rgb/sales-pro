const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

let regex = /(return v;\s*\}\s*)\}\);/g;
// We need to add TWO missing closing braces for plugins and options.
// Wait, datalabels block was closed?
// The replacement string was:
// formatter: function(v) { ... return v; } }
// So the `}` closes `datalabels`.
// We need `}` to close `plugins` and `}` to close `options`.
// Then `});` to close `new Chart(`.
code = code.replace(regex, "$1    }   } });");

fs.writeFileSync('index.html', code, 'utf8');
console.log("Syntax fixed!");
