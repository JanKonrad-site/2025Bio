// insertNoteBlock.js
function insertNoteBlock() {
  const newBlock = document.createElement('div');
  newBlock.className = 'canvas-block type-note';
  newBlock.draggable = true;

  newBlock.innerHTML = `
    <label>Poznámka:</label>
    <textarea rows="2" class="note-text" placeholder="Zadej poznámku, bude v kódu jako komentář..."></textarea>
    <span class="btn-remove" title="Odstranit blok">×</span>
    <div class="order-controls">
      <button class="move-up" title="Posunout nahoru">▲</button>
      <button class="move-down" title="Posunout dolů">▼</button>
    </div>
  `;

  newBlock.addEventListener('dragstart', () => {
    newBlock.classList.add('dragging');
  });

  newBlock.addEventListener('dragend', () => {
    newBlock.classList.remove('dragging');
    generateCode();
  });

  newBlock.querySelector('.note-text').addEventListener('input', generateCode);

  newBlock.querySelector('.btn-remove').addEventListener('click', () => {
    newBlock.remove();
    generateCode();
  });

  newBlock.querySelector('.move-up').addEventListener('click', () => {
    const prev = newBlock.previousElementSibling;
    if (prev) {
      window.canvas.insertBefore(newBlock, prev);
      generateCode();
    }
  });

  newBlock.querySelector('.move-down').addEventListener('click', () => {
    const next = newBlock.nextElementSibling;
    if (next) {
      window.canvas.insertBefore(next, newBlock);
      generateCode();
    }
  });

  window.canvas.appendChild(newBlock);
  generateCode();
}