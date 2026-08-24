const fs = require('fs');
const path = require('path');

const replacement = `        auth.signInWithEmailAndPassword(e, p).catch(err => {
            let code = err.code || '';
            let msg = err.message || '';
            if(code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials' || code === 'auth/wrong-password' || msg.includes('INVALID_LOGIN_CREDENTIALS')){
                auth.createUserWithEmailAndPassword(e, p).catch(err2 => {
                    let code2 = err2.code || '';
                    let msg2 = err2.message || '';
                    if (code2 === 'auth/email-already-in-use' || msg2.includes('EMAIL_EXISTS')) {
                        $('aErr').textContent = 'كلمة المرور غير صحيحة، أو الحساب موجود بالفعل.';
                    } else if (code2 === 'auth/weak-password' || msg2.includes('WEAK_PASSWORD')) {
                        $('aErr').textContent = 'كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.';
                    } else {
                        $('aErr').textContent = msg2.includes('{') ? 'حدث خطأ أثناء إنشاء الحساب، تأكد من صحة البيانات.' : msg2;
                    }
                    $('bLog').textContent = 'دخول / حساب جديد';
                });
            } else {
                $('aErr').textContent = msg.includes('{') ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : msg;
                $('bLog').textContent = 'دخول / حساب جديد';
            }
        });`;

const regex = /auth\.signInWithEmailAndPassword\(e, p\)\.catch\(err => \{[\s\S]*?\}\);/;

const dir = 'E:\\AI\\apk\\SalesProWeb';
let count = 0;

function walkDir(d) {
    fs.readdirSync(d).forEach(file => {
        let fullPath = path.join(d, file);
        if (fs.statSync(fullPath).isDirectory()) return; 
        if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (regex.test(content) && !content.includes('auth/invalid-login-credentials')) {
                content = content.replace(regex, replacement);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated ' + fullPath);
                count++;
            }
        }
    });
}

walkDir(dir);
console.log('Total updated: ' + count);
