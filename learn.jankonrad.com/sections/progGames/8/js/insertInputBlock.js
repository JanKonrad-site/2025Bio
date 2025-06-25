// insertInputBlock.js
function insertInputBlock() {
  const newBlock = document.createElement('div');
  newBlock.className = 'canvas-block type-input';
  newBlock.draggable = true;

  newBlock.innerHTML = `
    <label>Vstup uživatele (input):</label>
    <div class="input-block">
      <label>Prompt:</label>
      <input type="text" placeholder="Napiš prompt (např. 'Zadej věk')..." style="width: 250px;" class="input-prompt" />
      <label style="margin-left: 10px;">Typ vstupu:</label>
      <select class="input-subtype">
        <option value="text" selected>Text</option>
        <option value="number">Číslo</option>
      </select>
    </div>
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

  newBlock.querySelector('.input-prompt').addEventListener('input', generateCode);
  newBlock.querySelector('.input-subtype').addEventListener('change', generateCode);

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