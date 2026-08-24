const fs = require('fs');
const cssPath = 'styles/main.css';

const kanbanCSS = `
/* ---------- Kanban Board ---------- */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}

.kanban-col {
  background: var(--bg2);
  border-radius: 16px;
  border: 1px solid var(--bd);
  padding: 20px;
  min-height: 400px;
  box-shadow: var(--sh);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kanban-col-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--tx1);
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanban-count {
  background: var(--bg3);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--tx2);
}

.kanban-dropzone {
  flex: 1;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: background 0.3s;
  border-radius: 8px;
}

.kanban-dropzone.drag-over {
  background: var(--bg3);
  outline: 2px dashed var(--ac);
}

.kanban-card {
  background: var(--bg1);
  border: 1px solid var(--bd-s);
  border-radius: 12px;
  padding: 16px;
  cursor: grab;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--sh-md);
  border-color: var(--ac);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.kanban-card-text {
  font-size: 1.05rem;
  color: var(--tx1);
  font-weight: 600;
  margin-bottom: 12px;
  word-wrap: break-word;
}

.kanban-card-actions {
  display: flex;
  justify-content: flex-end;
}

.kanban-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #ef4444;
  font-size: 1.1rem;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
}
.kanban-btn:hover {
  background: rgba(239,68,68,0.1);
}
`;

fs.appendFileSync(cssPath, kanbanCSS, 'utf8');
console.log("Appended Kanban CSS");
