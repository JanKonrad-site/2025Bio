function insertIfBlock() {
  const newBlock = document.createElement('div');
  newBlock.className = 'canvas-block type-if';
  newBlock.draggable = true;

  newBlock.innerHTML = `
    <label>Podmínka (if):</label>
    <div class="expression-editor-wrap">
      <div class="expression-editor condition-editor" title="Zadej výraz (např. x > 5)"></div>
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

  // DnD proměnných
  conditionEditor.addEventListener('dragover', e => {
    e.preventDefault();
    conditionEditor.classList.add('dragover');
  });
  conditionEditor.addEventListener('dragleave', () => conditionEditor.classList.remove('dragover'));
  conditionEditor.addEventListener('drop', e => {
    e.preventDefault();
    conditionEditor.classList.remove('dragover');
    if (window.dragged && window.dragged.classList.contains('var-widget')) {
      const span = document.createElement('span');
      span.className = 'segment-var';
      span.textContent = window.dragged.textContent;
      span.draggable = true;
      span.addEventListener('dblclick', () => span.remove());
      conditionEditor.appendChild(span);
      generateCode();
    }
  });

  // Operátory
  newBlock.querySelectorAll('.operator-buttons button[data-op]').forEach(btn => {
    btn.addEventListener('click', () => {
      const op = btn.dataset.op;
      const span = document.createElement('span');
      span.className = 'operator';
      span.textContent = ` ${op} `;
      span.addEventListener('dblclick', () => span.remove());
      conditionEditor.appendChild(span);
      generateCode();
    });
  });

  // Výběr proměnných
  const varSelect = newBlock.querySelector('.insert-var-select');
  const updateVarSelect = () => {
    varSelect.innerHTML = '<option value="">+ Proměnná</option>';
    const vars = [...window.canvas.querySelectorAll('.var-widget')].map(w => w.textContent.trim());
    [...new Set(vars)].forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      varSelect.appendChild(opt);
    });
  };
  varSelect.addEventListener('mousedown', updateVarSelect);
  varSelect.addEventListener('change', () => {
    const name = varSelect.value;
    if (!name) return;
    const span = document.createElement('span');
    span.className = 'segment-var';
    span.textContent = name;
    span.draggable = true;
    span.addEventListener('dblclick', () => span.remove());
    conditionEditor.appendChild(span);
    varSelect.value = '';
    generateCode();
  });

  // Hodnota
  newBlock.querySelector('.insert-value').addEventListener('click', () => {
    const wrapper = document.createElement('span');
    wrapper.className = 'segment-val-wrapper';

    const select = document.createElement('select');
    select.innerHTML = '<option value="text">Text</option><option value="number">Číslo</option>';
    select.style.marginRight = '5px';

    const input = document.createElement('input');
    input.placeholder = 'hodnota';
    input.style.width = '80px';

    wrapper.appendChild(select);
    wrapper.appendChild(input);
    wrapper.addEventListener('dblclick', () => wrapper.remove());

    conditionEditor.appendChild(wrapper);
    generateCode();
  });

  // Vstup
  newBlock.querySelector('.insert-input').addEventListener('click', () => {
    const wrapper = document.createElement('span');
    wrapper.className = 'segment-input-wrapper';

    const inputPrompt = prompt('Zadej text pro input (např. Zadej věk):') || '';
    const subtype = document.createElement('select');
    subtype.className = 'input-subtype';
    subtype.innerHTML = '<option value="text">Text</option><option value="number">Číslo</option>';
    subtype.style.marginLeft = '5px';

    const prompt = document.createElement('span');
    prompt.className = 'input-prompt';
    prompt.textContent = inputPrompt;

    wrapper.appendChild(subtype);
    wrapper.appendChild(prompt);
    wrapper.addEventListener('dblclick', () => wrapper.remove());

    conditionEditor.appendChild(wrapper);
    generateCode();
  });

  // Drag & drop větví
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

  // Ovládání
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
    if (next) window.canvas.insertBefore(next, newBlock.nextSibling);
    generateCode();
  });

  newBlock.addEventListener('dragstart', () => newBlock.classList.add('dragging'));
  newBlock.addEventListener('dragend', () => {
    newBlock.classList.remove('dragging');
    generateCode();
  });

  const observer = new MutationObserver(() => generateCode());
  observer.observe(conditionEditor, { childList: true, subtree: true });

  window.canvas.appendChild(newBlock);
  generateCode();
}
