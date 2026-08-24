const fs = require('fs');
const jsPath = 'scripts/main.js';
let content = fs.readFileSync(jsPath, 'utf8');

const regex = /\/\/ 1\. Full-Page To-Do \/ Tasks Tab \(Enterprise V8\)[\s\S]*?window\.toggleTodoStatus\s*=\s*function\(idx\)\s*{[\s\S]*?};\s*/;

const newCode = `// 1. Full-Page Kanban Tasks Board (Enterprise V8 - Drag & Drop)
window.rTodo = function() {
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    
    // Migrate old format (done: boolean) to new format (status: 'todo' | 'in_progress' | 'done')
    let migrated = false;
    todos = todos.map(t => {
        if (typeof t.done !== 'undefined') {
            migrated = true;
            let status = t.done ? 'done' : 'todo';
            return { text: t.text, status: status };
        }
        return t;
    });
    if (migrated) localStorage.setItem('sp_todos', JSON.stringify(todos));

    let html = \`<div class="ph">
        <h1 style="display:flex;align-items:center;gap:12px;"><span style="width:32px;height:32px;display:flex;">\${ICONS.todo || '📋'}</span> \${t('todo')}</h1>
    </div>
    
    <div class="card" style="margin:0 auto 24px;padding:28px;background:var(--bg2);border-radius:16px;box-shadow:0 6px 16px rgba(0,0,0,0.06);border:1px solid var(--bd);">
        <div style="display:flex;gap:12px;">
            <input type="text" id="newTodoInput" class="inp" placeholder="\${L==='ar'?'أدخل مهمة جديدة هنا...':'Enter new task here...'}" style="flex:1;padding:14px 18px;font-size:1.05rem;border-radius:12px;border:1px solid var(--bd);background:var(--bg1);color:var(--tx1);" onkeydown="if(event.key==='Enter') addTodoItem()">
            <button class="btn btn-p" onclick="addTodoItem()" style="padding:0 28px;font-size:1.05rem;font-weight:bold;border-radius:12px;display:flex;align-items:center;gap:8px;background:var(--ac);color:#fff;cursor:pointer;">
                <span style="font-size:1.4rem;">+</span> \${L==='ar'?'إضافة':'Add'}
            </button>
        </div>
    </div>\`;

    // Render Kanban Board
    html += \`<div class="kanban-board">\`;
    
    const cols = [
        { id: 'todo', titleAr: 'قيد الانتظار', titleEn: 'To Do', color: 'var(--am)' },
        { id: 'in_progress', titleAr: 'قيد التنفيذ', titleEn: 'In Progress', color: 'var(--ac)' },
        { id: 'done', titleAr: 'مكتملة', titleEn: 'Done', color: 'var(--gn)' }
    ];

    cols.forEach(col => {
        let colTasks = todos.map((t, idx) => ({...t, origIdx: idx})).filter(t => t.status === col.id);
        
        html += \`
        <div class="kanban-col">
            <div class="kanban-col-header">
                <span style="display:flex;align-items:center;gap:8px;">
                    <span style="width:12px;height:12px;border-radius:50%;background:\${col.color};"></span>
                    \${L==='ar' ? col.titleAr : col.titleEn}
                </span>
                <span class="kanban-count">\${colTasks.length}</span>
            </div>
            <div class="kanban-dropzone" id="dz-\${col.id}" ondragover="kbDragOver(event)" ondragleave="kbDragLeave(event)" ondrop="kbDrop(event, '\${col.id}')">
        \`;
        
        if (colTasks.length === 0) {
            html += \`<div style="text-align:center;color:var(--tx2);padding:20px 0;font-size:0.9rem;opacity:0.6;">\${L==='ar'?'اسحب المهام هنا':'Drop tasks here'}</div>\`;
        }

        colTasks.forEach(task => {
            html += \`
            <div class="kanban-card" draggable="true" ondragstart="kbDragStart(event, \${task.origIdx})" id="task-\${task.origIdx}">
                <div class="kanban-card-text">\${task.text}</div>
                <div class="kanban-card-actions">
                    <button class="kanban-btn" onclick="deleteTodoItem(\${task.origIdx})" title="\${L==='ar'?'حذف':'Delete'}">🗑️</button>
                </div>
            </div>
            \`;
        });
        
        html += \`</div></div>\`;
    });

    html += \`</div>\`;
    
    let elM = $('M');
    if (elM) elM.innerHTML = html;
};

// Kanban Drag and Drop Logic
window.kbDragStart = function(ev, idx) {
    ev.dataTransfer.setData('text/plain', idx);
    setTimeout(() => {
        document.getElementById('task-' + idx).classList.add('dragging');
    }, 0);
};
window.kbDragOver = function(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.add('drag-over');
};
window.kbDragLeave = function(ev) {
    ev.currentTarget.classList.remove('drag-over');
};
window.kbDrop = function(ev, newStatus) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    let idx = ev.dataTransfer.getData('text/plain');
    if(idx !== '') {
        updateTodoStatus(parseInt(idx, 10), newStatus);
    }
};

window.initTodoUI = function() {
    if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
};

window.toggleTodoDrawer = function() {
    if (typeof rPage === 'function') rPage('todo');
    else if (typeof P !== 'undefined') { P = 'todo'; if(typeof buildNav==='function') buildNav(); if(typeof render==='function') render(); }
};

window.addTodoItem = function() {
    let input = document.getElementById('newTodoInput');
    if(!input || !input.value.trim()) return;
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    todos.push({ text: input.value.trim(), status: 'todo' });
    localStorage.setItem('sp_todos', JSON.stringify(todos));
    input.value = '';
    if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
    else initTodoUI();
    if(typeof toast==='function') toast(L==='ar'?'تمت إضافة المهمة بنجاح':'Task added', 'success');
};

window.deleteTodoItem = function(idx) {
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    todos.splice(idx, 1);
    localStorage.setItem('sp_todos', JSON.stringify(todos));
    if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
    else initTodoUI();
    if(typeof toast==='function') toast(L==='ar'?'تم حذف المهمة':'Task deleted', 'warning');
};

window.updateTodoStatus = function(idx, newStatus) {
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('sp_todos') || '[]'); } catch(e) {}
    if(todos[idx]) {
        todos[idx].status = newStatus;
        localStorage.setItem('sp_todos', JSON.stringify(todos));
        if (typeof rTodo === 'function' && typeof P !== 'undefined' && P === 'todo') rTodo();
        else initTodoUI();
    }
};
`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync(jsPath, content, 'utf8');
    console.log("Successfully replaced Kanban JS.");
} else {
    console.log("Regex match failed.");
}
