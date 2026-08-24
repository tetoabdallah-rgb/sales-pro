const fs = require('fs');
const cp = require('child_process');
try {
    cp.execSync('.\\node-v20.11.1-win-x64\\node.exe -c new_features.js');
    console.log("new_features.js Syntax OK");
} catch(e) {
    console.log("new_features.js Syntax ERROR");
}
