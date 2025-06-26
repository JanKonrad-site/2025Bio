function insertIfBlock() {
  const newBlock = document.createElement('div');
  newBlock.className = 'canvas-block type-if';
  newBlock.draggable = true;

  newBlock.innerHTML = `
    <label>Podmínka (if):</label>
    <div class="expression-editor-wrap">
      <div class="expression-editor condition-editor" contenteditable="false" title="Sestav podmínku pomocí prvků níže" style="min-height:24px;"></div>
      <div class="operator-buttons" style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 5px; align-items: center;">
        <button type="button" data-op="==">==</button>
        <button type="button" data-op="!=">!=</button>
        <button type="button" data-op=">">&gt;</button>
        <button type="button" data-op="<">&lt;</button>
        <button type="button" data-op=">=">&ge;</button>
        <button type="button" data-op="<=">&le;</button>
        <button type="button" data-op="and">and</button>
        <button type="button" data-op="or">or</button>
        <select class="insert-var-select"><option value="">+ Proměnná</option></select>
        <button type="button" class="insert-value">+ Hodnota</button>
        <button type="button" class="insert-input">+ Vstup</button>
      </div>
    </div>

    <div class="if-branches" style="display: flex; gap: 20px; margin-top: 10px;">
      <div style="flex:1;">
        <div><strong>Kód když platí:</strong></div>
        <div class="if-true-canvas branch-canvas bordered-dropzone" style="min-height:50px; border: 1px dashed #aaa; padding:5px;"></div>
      </div>
      <div style="flex:1;">
        <div><strong>Kód když neplatí:</strong></div>
        <div class="if-false-canvas branch-canvas bordered-dropzone" style="min-height:50px; border: 1px dashed #aaa; padding:5px;"></div>
      </div>
    </div>

    <span class="btn-remove" title="Odstranit blok">×</span>
    <div class="order-controls">
      <button class="move-up">▲</button>
      <button class="move-down">▼</button>
    </div>
  `;

  const conditionEditor = newBlock.querySelector('.condition-editor');

  const updateVarSelect = () => {
    const varSelect = newBlock.querySelector('.insert-var-select');
    varSelect.innerHTML = '<option value="">+ Proměnná</option>';
    if (window.canvas) {
      const varWidgets = window.canvas.querySelectorAll('.var-widget');
      const added = new Set();
      varWidgets.forEach(w => {
        const name = w.textContent.trim();
        if (name && !added.has(name)) {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          varSelect.appendChild(option);
          added.add(name);
        }
      });
    }
  };

  updateVarSelect();
  const varSelect = newBlock.querySelector('.insert-var-select');
  varSelect.addEventListener('mousedown', updateVarSelect);
  varSelect.addEventListener('change', () => {
    const name = varSelect.value;
    if (!name) return;
    const span = document.createElement('span');
    span.className = 'segment-var';
    span.textContent = name;
    span.draggable = true;
    span.addEventListener('dblclick', () => {
      span.remove();
      generateCode();
    });
    conditionEditor.appendChild(span);
    varSelect.value = '';
    generateCode();
  });

 function addValueInput(type = 'value') {
  const wrapper = document.createElement('span');
  wrapper.className = type === 'input' ? 'segment-input-wrapper' : 'segment-val-wrapper';
  wrapper.style.display = 'inline-flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '5px';

  const select = document.createElement('select');
  select.className = 'input-subtype';
  select.innerHTML = `
    <option value="text">Text</option>
    <option value="number">Číslo</option>
  `;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-prompt';
  input.placeholder = type === 'input' ? 'Zadej prompt' : 'Hodnota';
  input.style.width = '150px';

  const inputArea = document.createElement('span');
  inputArea.className = 'input-area';
  inputArea.appendChild(input);
  inputArea.appendChild(select);

  wrapper.appendChild(inputArea);

  input.addEventListener('input', generateCode);
  select.addEventListener('change', generateCode);
  wrapper.addEventListener('dblclick', () => {
    wrapper.remove();
    generateCode();
  });

  conditionEditor.appendChild(wrapper);
  generateCode();
}


  newBlock.querySelector('.insert-value').addEventListener('click', () => {
    addValueInput('value');
  });

  newBlock.querySelector('.insert-input').addEventListener('click', () => {
    addValueInput('input');
  });

  newBlock.querySelectorAll('.operator-buttons button[data-op]').forEach(btn => {
    btn.addEventListener('click', () => {
      const op = btn.dataset.op;
      const span = document.createElement('span');
      span.className = 'operator';
      span.textContent = ` ${op} `;
      span.addEventListener('dblclick', () => {
        span.remove();
        generateCode();
      });
      conditionEditor.appendChild(span);
      generateCode();
    });
  });

  conditionEditor.addEventListener('dragover', e => {
    e.preventDefault();
    conditionEditor.classList.add('dragover');
  });

  conditionEditor.addEventListener('dragleave', () => {
    conditionEditor.classList.remove('dragover');
  });

  conditionEditor.addEventListener('drop', e => {
    e.preventDefault();
    conditionEditor.classList.remove('dragover');
    if (window.dragged && window.dragged.classList.contains('var-widget')) {
      const span = document.createElement('span');
      span.className = 'segment-var';
      span.textContent = window.dragged.textContent;
      span.draggable = true;
      span.addEventListener('dblclick', () => {
        span.remove();
        generateCode();
      });
      conditionEditor.appendChild(span);
      generateCode();
    }
  });

  ['if-true-canvas', 'if-false-canvas'].forEach(className => {
    const canvas = newBlock.querySelector(`.${className}`);
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', e => {
      e.preventDefault();
      const dragging = document.querySelector('.canvas-block.dragging');
      if (dragging && !canvas.contains(dragging)) {
        canvas.appendChild(dragging);
        generateCode();
      }
    });
  });

  newBlock.querySelector('.btn-remove').addEventListener('click', () => {
    newBlock.remove();
    generateCode();
  });

  newBlock.querySelector('.move-up').addEventListener('click', () => {
    const prev = newBlock.previousElementSibling;
    if (prev) window.canvas.insertBefore(newBlock, prev);
    generateCode();
  });

  newBlock.querySelector('.move-down').addEventListener('click', () => {
    const next = newBlock.nextElementSibling;
    if (next) window.canvas.insertBefore(next, newBlock);
    generateCode();
  });

  newBlock.addEventListener('dragstart', () => newBlock.classList.add('dragging'));
  newBlock.addEventListener('dragend', () => {
    newBlock.classList.remove('dragging');
    generateCode();
  });

  window.canvas.appendChild(newBlock);
  generateCode();
}
