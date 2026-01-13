function insertPrintBlock() {
  const canvas = window.canvas;
  const newBlock = document.createElement('div');
  newBlock.className = 'canvas-block type-print';
  newBlock.draggable = true;

  newBlock.innerHTML = `
    <label>Vypiš do konzole:</label>
    <div class="expression-editor" title="Přetáhni sem název proměnné nebo napiš text"></div>
    <div style="display:flex; gap: 10px; margin-top: 5px; flex-wrap: wrap;">
      <button class="add-segment-btn" type="button">+ Text</button>
      <button class="add-var-btn" type="button">+ Proměnná</button>
      <button class="add-op-btn" type="button">+ Operátor</button>
      <button class="add-space-btn" type="button">+ Mezera</button>
    </div>
    <span class="btn-remove" title="Odstranit blok">×</span>
    <div class="order-controls">
      <button class="move-up" title="Posunout nahoru">▲</button>
      <button class="move-down" title="Posunout dolů">▼</button>
    </div>
  `;

  const expressionEditor = newBlock.querySelector('.expression-editor');
  const addSegmentBtn = newBlock.querySelector('.add-segment-btn');
  const addVarBtn = newBlock.querySelector('.add-var-btn');
  const addOpBtn = newBlock.querySelector('.add-op-btn');
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

  function createVarSelectSegment() {
    const select = document.createElement('select');
    select.innerHTML = `<option value="">Vyber proměnnou</option>`;
    const vars = [...document.querySelectorAll('.var-widget')]
      .map(el => el.textContent.trim())
      .filter((val, idx, arr) => val && arr.indexOf(val) === idx);

    vars.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });

    const wrapper = document.createElement('span');
    wrapper.className = 'segment-var-select';
    wrapper.appendChild(select);

    select.addEventListener('change', () => {
      const name = select.value;
      if (!name) return;
      const varSpan = document.createElement('span');
      varSpan.className = 'segment-var';
      varSpan.textContent = name;
      varSpan.draggable = true;
      varSpan.title = 'Proměnná (dvojklikem odstraníš)';
      varSpan.addEventListener('dblclick', () => varSpan.remove());
      wrapper.replaceWith(varSpan);
      window.generateCode();
    });

    return wrapper;
  }

  function createOperatorSegment() {
    const wrapper = document.createElement('span');
    wrapper.className = 'segment-operator-wrapper';
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '5px';

    const select = document.createElement('select');
    select.className = 'segment-operator';
    ['+', '-', '*', '/', '%', ','].forEach(op => {
      const option = document.createElement('option');
      option.value = op;
      option.textContent = op;
      select.appendChild(option);
    });
    select.addEventListener('change', window.generateCode);

    const removeBtn = document.createElement('span');
    removeBtn.textContent = '×';
    removeBtn.style.cursor = 'pointer';
    removeBtn.title = 'Odstranit operátor';
    removeBtn.addEventListener('click', () => {
      wrapper.remove();
      window.generateCode();
    });

    wrapper.appendChild(select);
    wrapper.appendChild(removeBtn);
    return wrapper;
  }

  function createSpaceSegment() {
    const span = document.createElement('span');
    span.className = 'segment-space';
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

  // === Přidávací tlačítka ===
  addSegmentBtn.addEventListener('click', () => {
    expressionEditor.appendChild(createTextSegment(''));
    window.generateCode();
  });

  addVarBtn.addEventListener('click', () => {
    expressionEditor.appendChild(createVarSelectSegment());
    window.generateCode();
  });

  addOpBtn.addEventListener('click', () => {
    expressionEditor.appendChild(createOperatorSegment());
    window.generateCode();
  });

  addSpaceBtn.addEventListener('click', () => {
    expressionEditor.appendChild(createSpaceSegment());
    window.generateCode();
  });

  // === Drag & Drop pro proměnné ===
  expressionEditor.addEventListener('dragover', e => {
    e.preventDefault();
    expressionEditor.classList.add('dragover');
  });
  expressionEditor.addEventListener('dragleave', () => {
    expressionEditor.classList.remove('dragover');
  });
  expressionEditor.addEventListener('drop', e => {
    e.preventDefault();
    expressionEditor.classList.remove('dragover');
    if (window.dragged && window.dragged.classList.contains('var-widget')) {
      const varSeg = createTextSegment(window.dragged.textContent.trim());
      expressionEditor.appendChild(varSeg);
      window.generateCode();
    }
  });

  // === Přetahování celého bloku ===
  newBlock.addEventListener('dragstart', () => {
    newBlock.classList.add('dragging');
  });
  newBlock.addEventListener('dragend', () => {
    newBlock.classList.remove('dragging');
    window.generateCode();
  });

  // === Ovládání bloku ===
  removeBtn.addEventListener('click', () => {
    newBlock.remove();
    window.generateCode();
  });

  moveUpBtn.addEventListener('click', () => {
    const prev = newBlock.previousElementSibling;
    if (prev) canvas.insertBefore(newBlock, prev);
    window.generateCode();
  });

  moveDownBtn.addEventListener('click', () => {
    const next = newBlock.nextElementSibling;
    if (next) canvas.insertBefore(next, newBlock);
    window.generateCode();
  });

  canvas.appendChild(newBlock);
  window.generateCode();
}
