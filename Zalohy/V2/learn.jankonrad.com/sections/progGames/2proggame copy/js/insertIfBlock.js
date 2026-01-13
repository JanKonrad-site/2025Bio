function insertIfBlock() {
  const newBlock = document.createElement('div');
  newBlock.className = 'canvas-block type-if';
  newBlock.draggable = true;

  newBlock.innerHTML = `
    <label>Podmínka (if):</label>
    <div class="expression-editor-wrap">
      <div class="expression-editor condition-editor" contenteditable="false"></div>
      <div class="operator-buttons">
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

    <div class="if-branches" style="display:flex;flex-direction:column;gap:10px;">
      <div><strong>Kód když platí:</strong></div>
      <div class="if-true-canvas branch-canvas bordered-dropzone" style="min-height:50px;border:1px dashed #aaa;padding:5px;"></div>

      <div class="else-if-container"></div>

      <div><strong>Kód když neplatí:</strong></div>
      <div class="if-false-canvas branch-canvas bordered-dropzone" style="min-height:50px;border:1px dashed #aaa;padding:5px;"></div>
    </div>

    <button type="button" class="add-else-if" style="margin-top:10px;">+ else if</button>
    <span class="btn-remove" title="Odstranit blok">×</span>
    <div class="order-controls">
      <button class="move-up">▲</button>
      <button class="move-down">▼</button>
    </div>
  `;

  const conditionEditor = newBlock.querySelector('.condition-editor');

  // === Přetahování do všech canvasů ===
  function setupDrop(canvas) {
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', e => {
      e.preventDefault();
      const dragging = document.querySelector('.canvas-block.dragging');
      if (dragging && !canvas.contains(dragging)) {
        canvas.appendChild(dragging);
        generateCode();
      }
    });
  }

  ['.if-true-canvas', '.if-false-canvas'].forEach(selector => {
    setupDrop(newBlock.querySelector(selector));
  });

  const elseIfContainer = newBlock.querySelector('.else-if-container');

  function createElseIfBlock() {
    const wrapper = document.createElement('div');
    wrapper.className = 'else-if-block';

    wrapper.innerHTML = `
      <div style="margin-top:10px;"><strong>Podmínka else if:</strong></div>
      <div class="expression-editor condition-editor" contenteditable="false"></div>
      <div class="operator-buttons">
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
      <div class="elif-canvas branch-canvas bordered-dropzone" style="min-height:50px;border:1px dashed #aaa;padding:5px;margin-top:5px;"></div>
    `;

    setupDrop(wrapper.querySelector('.elif-canvas'));

    // Posluchače pro tlačítka, proměnné a vstupy
    setupEditorControls(wrapper);

    elseIfContainer.appendChild(wrapper);
    generateCode();
  }

  newBlock.querySelector('.add-else-if').addEventListener('click', createElseIfBlock);

  function setupEditorControls(scope) {
    const editor = scope.querySelector('.condition-editor');

    scope.querySelectorAll('button[data-op]').forEach(btn => {
      btn.addEventListener('click', () => {
        const op = btn.dataset.op;
        const span = document.createElement('span');
        span.className = 'operator';
        span.textContent = ` ${op} `;
        span.addEventListener('dblclick', () => {
          span.remove();
          generateCode();
        });
        editor.appendChild(span);
        generateCode();
      });
    });

    const varSelect = scope.querySelector('.insert-var-select');
    const updateVarSelect = () => {
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
      editor.appendChild(span);
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
      wrapper.addEventListener('dblclick', () => {
        wrapper.remove();
        generateCode();
      });

      editor.appendChild(wrapper);
      generateCode();
    }

    scope.querySelector('.insert-value')?.addEventListener('click', () => {
      addValueInput('value');
    });

    scope.querySelector('.insert-input')?.addEventListener('click', () => {
      addValueInput('input');
    });

    editor.addEventListener('drop', e => {
      e.preventDefault();
      if (window.dragged && window.dragged.classList.contains('var-widget')) {
        const span = document.createElement('span');
        span.className = 'segment-var';
        span.textContent = window.dragged.textContent;
        span.draggable = true;
        span.addEventListener('dblclick', () => {
          span.remove();
          generateCode();
        });
        editor.appendChild(span);
        generateCode();
      }
    });

    editor.addEventListener('dragover', e => {
      e.preventDefault();
      editor.classList.add('dragover');
    });
    editor.addEventListener('dragleave', () => editor.classList.remove('dragover'));
  }

  setupEditorControls(newBlock);

  // === Obecné ovládání ===
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

  window.canvas.appendChild(newBlock);
  generateCode();
}
