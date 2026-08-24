
// js/auth.js
window.syncUI = window.syncUI || function(status) {
    console.log('[Cloud Sync]: ' + status);
    let el = document.getElementById('SYNC_STATUS') || document.getElementById('cloud_status');
    if (el) {
        if (status === 'syncing') el.innerHTML = '🔄 ' + (typeof L !== 'undefined' && L === 'ar' ? 'جاري المزامنة...' : 'Syncing...');
        else if (status === 'done') el.innerHTML = '☁️ ' + (typeof L !== 'undefined' && L === 'ar' ? 'متزامن مع السحابة' : 'Cloud Synced');
        else if (status === 'error') el.innerHTML = '❌ ' + (typeof L !== 'undefined' && L === 'ar' ? 'خطأ في المزامنة' : 'Sync Error');
    }
};

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        $('AUTH').classList.add('hidden');
        let over = document.getElementById('osStartupOverlay');
        if (over && !window.osShownAfterAuth) {
            window.osShownAfterAuth = true;
            over.style.display = 'flex';
            over.style.opacity = '1';
            over.style.transform = 'scale(1)';
            let prog = document.getElementById('osStartProgress');
            let stat = document.getElementById('osStartStatus');
            if(prog) prog.style.width = '30%';
            if(stat) stat.textContent = 'جاري تسجيل الدخول ومزامنة بياناتك...';
            setTimeout(() => {
                if(prog) prog.style.width = '70%';
                if(stat) stat.textContent = 'تجهيز واجهة المبيعات والأيقونات الذكية (3D)...';
            }, 500);
            setTimeout(() => {
                if(prog) prog.style.width = '100%';
                if(stat) stat.textContent = '✅ مرحباً بك في واجهة المبيعات الملكية!';
            }, 1000);
            setTimeout(() => {
                over.style.opacity = '0';
                over.style.transform = 'scale(1.08)';
                setTimeout(() => { over.style.display = 'none'; }, 600);
            }, 1400);
        }
        $('APP').classList.remove('hidden');
        $('APP').style.display = 'flex';
        if($('todoFloatBtn')) $('todoFloatBtn').style.display = 'flex';
        
        const ADMIN_EMAILS = ['tetoabdallah@gmail.com'];
        window.isAppAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
        
        function loadOwnDoc() {
            syncUI('syncing');
            // Using onSnapshot for real-time updates!
            db.collection('users').doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    let d = doc.data();
                    _mtC = d;
                    if (d['accCats'] && d['accCats'].length > 0) accCats = d['accCats'];
                    if (d['hwCats'] && d['hwCats'].length > 0) hwCats = d['hwCats'];
                    for(let k in d){
                        if (d[k] && (Array.isArray(d[k]) ? d[k].length > 0 : true)) {
                            _cache[k] = d[k];
                            try{ localStorage.setItem(k, JSON.stringify(d[k])); }catch(e){}
                        }
                    }
                    if (d['salesData'] && d['salesData'].length > 0) S = d['salesData'];
                    if (d['targetData'] && d['targetData'].length > 0) T = d['targetData'];
                    if (d['payData'] && d['payData'].length > 0) C = d['payData'];
                    if (d['duesData'] && d['duesData'].length > 0) D = d['duesData'];
                    syncUI('done');
                } else {
                    let md = { accCats: ld('accCats')||[], hwCats: ld('hwCats')||[] };
                    db.collection('users').doc(user.uid).set(md);
                }
            }, err => {
                syncUI('error'); console.error('Sync Error: ' + err.message);
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
                for(let k in comb){
                    if (comb[k] && comb[k].length > 0) {
                        _cache[k] = comb[k];
                        try{ localStorage.setItem(k, JSON.stringify(comb[k])); }catch(e){}
                    }
                }
                if (_cache['salesData'] && _cache['salesData'].length > 0) S = _cache['salesData']; else S = S || [];
                if (_cache['targetData'] && _cache['targetData'].length > 0) T = _cache['targetData']; else T = T || [];
                if (_cache['accCats'] && _cache['accCats'].length > 0) accCats = _cache['accCats']; else accCats = accCats || [];
                if (_cache['hwCats'] && _cache['hwCats'].length > 0) hwCats = _cache['hwCats']; else hwCats = hwCats || [];
                if (_cache['payData'] && _cache['payData'].length > 0) C = _cache['payData']; else C = C || [];
                if (_cache['duesData'] && _cache['duesData'].length > 0) D = _cache['duesData']; else D = D || [];
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
        
        // Auto-restore from cloud if local data is completely empty
        if ((!S || S.length === 0) && (!T || T.length === 0) && (!C || C.length === 0)) {
            console.log('Local data is empty, attempting auto-restore from cloud...');
            db.collection('users').doc(user.uid).get().then(async doc => {
                if (doc.exists && doc.data().backup_chunks) {
                    let d = doc.data();
                    let fullStr = "";
                    let numChunks = d.backup_chunks || 1;
                    for(let i=0; i<numChunks; i++){
                        let c = await db.collection('users').doc(user.uid).collection('chunks').doc('backup_chunk_'+i).get();
                        if(c.exists) fullStr += c.data().data;
                    }
                    if (fullStr) {
                        let p = JSON.parse(fullStr);
                        let changed = false;
                        if (p.salesData && p.salesData.length > 0)  { S = p.salesData;  sv('salesData',  S); changed = true; }
                        if (p.targetData && p.targetData.length > 0){ T = p.targetData; sv('targetData', T); changed = true; }
                        if (p.payData && p.payData.length > 0)      { C = p.payData;    sv('payData',    C); changed = true; }
                        if (p.duesData)     { D = p.duesData;   sv('duesData',   D); }
                        if (p.accCats)      { accCats = p.accCats; sv('accCats', accCats); }
                        if (p.hwCats)       { hwCats = p.hwCats;   sv('hwCats', hwCats); }
                        
                        if (changed) {
                            if (typeof toast === 'function') toast(L === 'ar' ? '✅ تم استرجاع بيانات السحابة تلقائياً' : '✅ Cloud data auto-restored', 'success');
                            setTimeout(() => { window.location.reload(); }, 1500);
                        }
                    }
                }
            }).catch(err => console.error('Auto-restore failed:', err));
        }
        
        if(typeof init === 'function') init();
    } else {
        currentUser = null;
        $('AUTH').classList.remove('hidden');
        $('APP').classList.add('hidden');
        $('APP').style.display = 'none';
        if($('todoFloatBtn')) $('todoFloatBtn').style.display = 'none';
        if($('todoDrawer')) $('todoDrawer').style.display = 'none';
        if($('todoOverlay')) $('todoOverlay').style.display = 'none';
    }
});

if ($('bLog')) {
    $('bLog').onclick = () => {
        let e = $('inE').value.trim(), p = $('inP').value.trim();
        if(!e || !p) { $('aErr').textContent = 'يرجى إدخال البيانات'; return; }
        
        $('bLog').textContent = 'جاري التحميل...';
                auth.signInWithEmailAndPassword(e, p).catch(err => {
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

