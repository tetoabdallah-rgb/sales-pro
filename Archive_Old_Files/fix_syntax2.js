const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The current broken text ends with:
// return v;
// }
// }   } });
// So that is 4 closing braces in total: } } } } and then );
// Wait, in the output above it says:
// return v;
// }
// }   } });
// That's ONE for formatter, plus THREE on the next line.
// So 4 braces total! Wait, if there are 4 braces, why is there a syntax error?
// Let's look closely at `options:{ ... plugins:{ ... datalabels: { ... formatter: function(v) { ... } } } }`
// There are 4 braces needed!
// 1. formatter
// 2. datalabels
// 3. plugins
// 4. options
// So we need 4 braces before `});`. But wait, in `return v; \n } \n }   } });`, there ARE 4 braces!
// Let's re-read the error message: `Unexpected token ')'`
// `                      }   } });`
// `                             ^`
// If it's a syntax error, let's fix it by rewriting it completely.

// Let's replace the whole formatter block to make it completely safe and clean.
let regex = /formatter:\s*function\(v\)\s*\{\s*if\s*\(!v\s*\|\|\s*v\s*===\s*0\)\s*return\s*'';\s*if\s*\(v\s*>=\s*1000000\)\s*return\s*\(v\s*\/\s*1000000\)\.toFixed\(1\)\s*\+\s*'M';\s*if\s*\(v\s*>=\s*1000\)\s*return\s*\(v\s*\/\s*1000\)\.toFixed\(1\)\s*\+\s*'K';\s*return\s*v;\s*\}[\s\}]*\);/g;

code = code.replace(regex, `formatter: function(v) {
                          if (!v || v === 0) return '';
                          if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
                          if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
                          return v;
                      }
                  }
              }
          }
      });`);

fs.writeFileSync('index.html', code, 'utf8');
console.log("Replaced with perfectly formatted braces.");
