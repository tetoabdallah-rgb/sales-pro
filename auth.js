// js/auth.js

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        $('AUTH').classList.add('hidden');
        $('APP').classList.remove('hidden');
        $('APP').style.display = 'flex';
        
        const ADMIN_EMAILS = ['tetoabdallah@gmail.com'];
        window.isAppAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
        
        function loadOwnDoc() {
            syncUI('syncing');
            // Using onSnapshot for real-time updates!
            db.collection('users').doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    let d = doc.data();
                    _cache = Object.assign({}, _cache, d);
                    _mtC = d;
                    accCats = d['accCats'] || accCats;
                    hwCats = d['hwCats'] || hwCats;
                    for(let k in d){ try{ localStorage.setItem(k, JSON.stringify(d[k])); }catch(e){} }
                    chkAsm();
                    syncUI('done');
                } else {
                    let md = { accCats: ld('accCats')||[], hwCats: ld('hwCats')||[] };
                    db.collection('users').doc(user.uid).set(md);
                }
            }, err => {
                syncUI('error'); console.error('Sync Error: ' + err.message);
            });
            
            db.collection('users').doc(user.uid).collection('chunks').onSnapshot(snap => {
                snap.docChanges().forEach(change => {
                    if (change.type === "added" || change.type === "modified") {
                        _chkC[change.doc.id] = change.doc.data().data;
                    }
                    if (change.type === "removed") {
                        delete _chkC[change.doc.id];
                    }
                });
                chkAsm();
            });
        }
        
        if (window.isAppAdmin) {
            let _admUsers = {};
            let _admChkC = {};
            let _unsubs = {};
            
            function asmAdmin() {
                let comb = { salesData:[], targetData:[], accCats:[], hwCats:[], payData:[], duesData:[] };
                for(let u in _admUsers) {
                    let d = _admUsers[u];
                    if(d.accCats && comb.accCats.length === 0) comb.accCats = d.accCats;
                    if(d.hwCats && comb.hwCats.length === 0) comb.hwCats = d.hwCats;
                    
                    ['salesData','targetData','payData','duesData'].forEach(k => {
                        let ct = d[k+'_meta'];
                        if(ct !== undefined) {
                            let uAsm = [];
                            let cmp = true;
                            for(let i=0; i<ct; i++) {
                                let chkKey = u+'_'+k+'_'+i;
                                if(_admChkC[chkKey]) uAsm = uAsm.concat(_admChkC[chkKey]);
                                else { cmp = false; break; }
                            }
                            if(cmp && uAsm.length > 0) {
                                uAsm.forEach(item => { if(typeof item === 'object') item._uid = u; });
                                comb[k] = comb[k].concat(uAsm);
                            }
                        } else if(d[k] && Array.isArray(d[k])) {
                            let arr = d[k];
                            arr.forEach(item => { if(typeof item === 'object') item._uid = u; });
                            comb[k] = comb[k].concat(arr);
                        }
                    });
                }
                _cache = Object.assign({}, _cache, comb);
                S = _cache['salesData'] || [];
                T = _cache['targetData'] || [];
                accCats = _cache['accCats'] || [];
                hwCats = _cache['hwCats'] || [];
                C = _cache['payData'] || [];
                D = _cache['duesData'] || [];
                
                for(let k in comb){ try{ localStorage.setItem(k, JSON.stringify(comb[k])); }catch(e){} }
                if(typeof render === 'function') render();
                syncUI('done');
            }
            
            db.collection('users').onSnapshot(snap => {
                syncUI('syncing');
                snap.forEach(doc => {
                    _admUsers[doc.id] = doc.data();
                    if(!_unsubs[doc.id]) {
                        _unsubs[doc.id] = db.collection('users').doc(doc.id).collection('chunks').onSnapshot(csnap => {
                            csnap.docChanges().forEach(change => {
                                let chkKey = doc.id + '_' + change.doc.id;
                                if(change.type === "added" || change.type === "modified") _admChkC[chkKey] = change.doc.data().data;
                                if(change.type === "removed") delete _admChkC[chkKey];
                            });
                            asmAdmin();
                        });
                    }
                });
                asmAdmin();
            }, err => {
                console.warn('Admin read failed', err);
                loadOwnDoc();
            });
        } else {
            loadOwnDoc();
        }
        
        if(typeof init === 'function') init();
    } else {
        currentUser = null;
        $('AUTH').classList.remove('hidden');
        $('APP').classList.add('hidden');
        $('APP').style.display = 'none';
    }
});

if ($('bLog')) {
    $('bLog').onclick = () => {
        let e = $('inE').value.trim(), p = $('inP').value.trim();
        if(!e || !p) { $('aErr').textContent = 'يرجى إدخال البيانات'; return; }
        
        $('bLog').textContent = 'جاري التحميل...';
        auth.signInWithEmailAndPassword(e, p).catch(err => {
            if(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'){
                auth.createUserWithEmailAndPassword(e, p).catch(err2 => {
                    $('aErr').textContent = err2.message;
                    $('bLog').textContent = 'دخول / حساب جديد';
                });
            } else {
                $('aErr').textContent = err.message;
                $('bLog').textContent = 'دخول / حساب جديد';
            }
        });
    };
}

if ($('bLogG')) {
    $('bLogG').onclick = () => {
        let provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(err => {
            $('aErr').textContent = err.message;
        });
    };
}

// Global logout
window.logout = function() {
    auth.signOut();
};
