function insertVarBlock() {
  const newBlock = document.createElement('div');
  newBlock.className = 'canvas-block type-var';
  newBlock.draggable = true;

  newBlock.innerHTML = `
    <div class="canvas-block-header">
      <label>Proměnná:</label>
      <input class="var-name" type="text" value="x" /> =
      <span class="value-expression-container" style="display: inline-flex; gap: 5px;"></span>
      <button type="button" class="add-operator-btn" style="margin-left: 10px;">+ Přidat další výraz</button>
      <span class="btn-remove" title="Odstranit blok" style="margin-left: 10px;">×</span>
    </div>
    <input class="note-text" placeholder="Poznámka (bude v kódu jako komentář)..." style="margin-top: 10px;" />
    <div class="var-widget-container"></div>
    <div class="order-controls">
      <button class="move-up" title="Posunout nahoru">▲</button>
      <button class="move-down" title="Posunout dolů">▼</button>
    </div>
  `;

  const varNameInput = newBlock.querySelector('.var-name');
  const noteInput = newBlock.querySelector('.note-text');
  const widgetContainer = newBlock.querySelector('.var-widget-container');
  const valueContainer = newBlock.querySelector('.value-expression-container');

  function createVarSelect(currentName) {
    const select = document.createElement('select');
    select.innerHTML = `<option value="">Vyber proměnnou</option>`;
    if (window.canvas) {
      const vars = [...window.canvas.querySelectorAll('.var-widget')]
        .map(v => v.textContent.trim())
        .filter(name => name && name !== currentName);
      [...new Set(vars)].forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
      });
    }

    const wrapper = document.createElement('span');
    wrapper.className = 'segment-var-wrapper';
    wrapper.appendChild(select);

    select.addEventListener('change', () => {
      const name = select.value;
      if (!name) return;
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
      span.addEventListener('dragend', () => {
        window.dragged = null;
        span.classList.remove('dragging');
      });
      span.addEventListener('dblclick', () => {
        span.remove();
        generateCode();
      });
      wrapper.replaceWith(span);
      generateCode();
    });

    return wrapper;
  }

  function createValueSegment(type = 'text') {
    const wrapper = document.createElement('span');
    wrapper.className = 'segment-val-wrapper';
    wrapper.style.marginRight = '5px';

    const select = document.createElement('select');
    select.innerHTML = `
      <option value="text">Text</option>
      <option value="number">Číslo</option>
      <option value="input">Vstup</option>
      <option value="var">Proměnná</option>
    `;
    select.value = type;

    const inputWrapper = document.createElement('span');
    inputWrapper.className = 'input-area';
    inputWrapper.style.marginLeft = '5px';

    const updateInputField = () => {
      inputWrapper.innerHTML = '';
      const valueType = select.value;
      if (valueType === 'var') {
        inputWrapper.appendChild(createVarSelect(varNameInput.value.trim()));
      } else if (valueType === 'input') {
        const prompt = document.createElement('input');
        prompt.type = 'text';
        prompt.placeholder = 'prompt...';
        prompt.style.width = '120px';
        prompt.className = 'input-prompt';

        const subtype = document.createElement('select');
        subtype.className = 'input-subtype';
        subtype.innerHTML = `
          <option value="text">Text</option>
          <option value="number">Číslo</option>
        `;
        subtype.style.marginLeft = '5px';

        prompt.addEventListener('input', generateCode);
        subtype.addEventListener('change', generateCode);

        inputWrapper.appendChild(prompt);
        inputWrapper.appendChild(subtype);
      } else {
        const input = document.createElement('input');
        input.type = valueType === 'number' ? 'number' : 'text';
        input.placeholder = valueType === 'number' ? 'číslo' : 'text';
        input.style.width = '120px';
        input.addEventListener('input', generateCode);
        inputWrapper.appendChild(input);
      }
      generateCode();
    };

    select.addEventListener('change', updateInputField);
    wrapper.appendChild(select);
    wrapper.appendChild(inputWrapper);

    updateInputField();
    return wrapper;
  }

  function addOperatorAndValue() {
    const wrapper = document.createElement('span');
    wrapper.className = 'operator-expression-wrapper';
    wrapper.style.marginRight = '10px';

    const opSelect = document.createElement('select');
    opSelect.innerHTML = `
      <option value="+">+</option>
      <option value="-">-</option>
      <option value="*">*</option>
      <option value="/">/</option>
    `;
    opSelect.className = 'segment-operator';
    opSelect.style.marginLeft = '5px';
    opSelect.title = 'Operátor – dvojklikem odstraníš výraz';
    opSelect.addEventListener('dblclick', () => {
      wrapper.remove();
      generateCode();
    });
    opSelect.addEventListener('change', generateCode);

    wrapper.appendChild(opSelect);
    wrapper.appendChild(createValueSegment());
    valueContainer.appendChild(wrapper);
    generateCode();
  }

  function renderInitialValueEditor() {
    valueContainer.innerHTML = '';
    valueContainer.appendChild(createValueSegment('text'));
  }

  newBlock.querySelector('.add-operator-btn').addEventListener('click', addOperatorAndValue);

  function updateVarWidget() {
    widgetContainer.innerHTML = '';
    const name = varNameInput.value.trim() || 'x';
    const widget = createVarWidget(name);
    widgetContainer.appendChild(widget);
    generateCode();
  }

  varNameInput.addEventListener('input', () => {
    updateVarWidget();
    // re-render var selects
    const selects = valueContainer.querySelectorAll('select');
    selects.forEach(sel => {
      if (sel.closest('.segment-val-wrapper')) {
        const inputArea = sel.closest('.segment-val-wrapper').querySelector('.input-area');
        if (sel.value === 'var') {
          inputArea.innerHTML = '';
          inputArea.appendChild(createVarSelect(varNameInput.value.trim()));
        }
      }
    });
  });

  noteInput.addEventListener('input', generateCode);

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

  renderInitialValueEditor();
  window.canvas.appendChild(newBlock);
  updateVarWidget();
}
