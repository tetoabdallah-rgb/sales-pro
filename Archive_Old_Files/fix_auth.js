const fs = require('fs');
const path = require('path');

const old_code = `        auth.signInWithEmailAndPassword(e, p).catch(err => {
            let code = err.code || '';
            let msg = err.message || '';
            if(code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials' || code === 'auth/wrong-password' || msg.includes('INVALID_LOGIN_CREDENTIALS')){
                auth.createUserWithEmailAndPassword(e, p).catch(err2 => {
                    let code2 = err2.code || '';
                    let msg2 = err2.message || '';
                    if (code2 === 'auth/email-already-in-use' || msg2.includes('EMAIL_EXISTS')) {
                        $('aErr').textContent = '???? ?????? ??? ?????? ?? ?????? ????? ??????.';
                    } else if (code2 === 'auth/weak-password' || msg2.includes('WEAK_PASSWORD')) {
                        $('aErr').textContent = '???? ?????? ????? ????. ??? ?? ???? 6 ???? ??? ?????.';
                    } else {
                        $('aErr').textContent = msg2.includes('{') ? '??? ??? ????? ????? ??????? ???? ?? ??? ????????.' : msg2;
                    }
                    $('bLog').textContent = '???? / ???? ????';
                });
            } else {
                $('aErr').textContent = msg.includes('{') ? '?????? ?????????? ?? ???? ?????? ??? ?????.' : msg;
                $('bLog').textContent = '???? / ???? ????';
            }
        });`;

const new_code = `        auth.signInWithEmailAndPassword(e, p).catch(err => {
            let code = err.code || '';
            let msg = err.message || '';
            if(code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials' || code === 'auth/wrong-password' || msg.includes('INVALID_LOGIN_CREDENTIALS')){
                auth.createUserWithEmailAndPassword(e, p).catch(err2 => {
                    let code2 = err2.code || '';
                    let msg2 = err2.message || '';
                    if (code2 === 'auth/email-already-in-use' || msg2.includes('EMAIL_EXISTS')) {
                        $('aErr').textContent = '???? ?????? ??? ?????? ?? ?????? ????? ??????.';
                    } else if (code2 === 'auth/weak-password' || msg2.includes('WEAK_PASSWORD')) {
                        $('aErr').textContent = '???? ?????? ????? ????. ??? ?? ???? 6 ???? ??? ?????.';
                    } else {
                        $('aErr').textContent = msg2.includes('{') ? '??? ??? ????? ????? ??????? ???? ?? ??? ????????.' : msg2;
                    }
                    $('bLog').textContent = '???? / ???? ????';
                });
            } else {
                $('aErr').textContent = msg.includes('{') ? '?????? ?????????? ?? ???? ?????? ??? ?????.' : msg;
                $('bLog').textContent = '???? / ???? ????';
            }
        });`;

const dir = 'E:\\AI\\apk\\SalesProWeb';
let count = 0;

function walkDir(d) {
    fs.readdirSync(d).forEach(file => {
        let fullPath = path.join(d, file);
        if (fs.statSync(fullPath).isDirectory()) return; // skip subdirs for safety
        if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(old_code)) {
                content = content.replace(old_code, new_code);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated ' + fullPath);
                count++;
            }
        }
    });
}

walkDir(dir);
console.log('Total updated: ' + count);
