function insertPrintBlock() {
  const canvas = window.canvas;
  const newBlock = document.createElement('div');
  newBlock.className = 'canvas-block type-print';
  newBlock.draggable = true;

  newBlock.innerHTML = `
    <label>Vypiš do konzole:</label>
    <div class="expression-editor" title="Přetáhni sem název proměnné nebo napiš text"></div>
    <div style="display:flex; gap: 10px; margin-top: 5px;">
      <button class="add-segment-btn" type="button">+ Přidat textový segment</button>
      <button class="add-space-btn" type="button">+ Přidat mezeru</button>
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
    window.generateCode();
  });

  const expressionEditor = newBlock.querySelector('.expression-editor');
  const addSegmentBtn = newBlock.querySelector('.add-segment-btn');
  const addSpaceBtn = newBlock.querySelector('.add-space-btn');
  const removeBtn = newBlock.querySelector('.btn-remove');
  const moveUpBtn = newBlock.querySelector('.move-up');
  const moveDownBtn = newBlock.querySelector('.move-down');

  function createTextSegment(value = '') {
    const span = document.createElement('span');
    span.className = 'segment-text';
    span.contentEditable = true;
    span.spellcheck = false;
    span.textContent = value;
    span.title = 'Textový segment (dvojklikem odstraníš)';
    span.addEventListener('input', window.generateCode);
    span.addEventListener('dblclick', () => span.remove());
    return span;
  }

  function createVarSegment(name) {
    const span = document.createElement('span');
    span.className = 'segment-var';
    span.textContent = name;
    span.draggable = true;
    span.title = 'Proměnná (dvojklikem odstraníš)';

    span.addEventListener('dragstart', e => {
      window.dragged = span;
      span.classList.add('dragging');
      e.dataTransfer.setData('text/plain', '');
    });
    span.addEventListener('dragend', e => {
      window.dragged = null;
      span.classList.remove('dragging');
    });
    span.addEventListener('dblclick', () => span.remove());
    return span;
  }

function createSpaceSegment() {
  const span = document.createElement('span');
  span.className = 'segment-space'; // ← změna třídy
  span.contentEditable = false;
  span.textContent = ' ';
  span.title = 'Mezera (dvojklikem odstraníš)';
  span.style.userSelect = 'none';
  span.style.backgroundColor = '#ddd';
  span.style.border = '1px dashed #aaa';
  span.style.minWidth = '10px';
  span.style.display = 'inline-block';
  span.addEventListener('dblclick', () => span.remove());
  return span;
}

  addSegmentBtn.addEventListener('click', () => {
    const newSeg = createTextSegment('');
    expressionEditor.appendChild(newSeg);
    window.generateCode();
  });

  addSpaceBtn.addEventListener('click', () => {
    const spaceSeg = createSpaceSegment();
    expressionEditor.appendChild(spaceSeg);
    window.generateCode();
  });

  expressionEditor.addEventListener('dragover', e => {
    e.preventDefault();
    expressionEditor.classList.add('dragover');
  });
  expressionEditor.addEventListener('dragleave', e => {
    expressionEditor.classList.remove('dragover');
  });
  expressionEditor.addEventListener('drop', e => {
    e.preventDefault();
    expressionEditor.classList.remove('dragover');
    if (window.dragged && window.dragged.classList.contains('var-widget')) {
      const varName = window.dragged.textContent;
      const varSeg = createVarSegment(varName);
      expressionEditor.appendChild(varSeg);
      window.generateCode();
    }
  });

  removeBtn.addEventListener('click', () => {
    newBlock.remove();
    window.generateCode();
  });
  moveUpBtn.addEventListener('click', () => {
    const prev = newBlock.previousElementSibling;
    if (prev) {
      canvas.insertBefore(newBlock, prev);
      window.generateCode();
    }
  });
  moveDownBtn.addEventListener('click', () => {
    const next = newBlock.nextElementSibling;
    if (next) {
      canvas.insertBefore(next, newBlock);
      window.generateCode();
    }
  });

  canvas.appendChild(newBlock);
  window.generateCode();
}