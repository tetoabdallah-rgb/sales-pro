import os
import glob
import codecs

old_code = """        auth.signInWithEmailAndPassword(e, p).catch(err => {
            if(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'){
                auth.createUserWithEmailAndPassword(e, p).catch(err2 => {
                    $('aErr').textContent = err2.message;
                    $('bLog').textContent = '???? / ???? ????';
                });
            } else {
                $('aErr').textContent = err.message;
                $('bLog').textContent = '???? / ???? ????';
            }
        });"""

new_code = """        auth.signInWithEmailAndPassword(e, p).catch(err => {
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
        });"""

count = 0
for ext in ['*.html', '*.js']:
    for filepath in glob.glob(os.path.join(r'E:\AI\apk\SalesProWeb', ext)):
        with codecs.open(filepath, 'r', 'utf-8') as f:
            content = f.read()
            
        if old_code in content:
            content = content.replace(old_code, new_code)
            with codecs.open(filepath, 'w', 'utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
            count += 1
            
print(f"Total updated: {count}")
