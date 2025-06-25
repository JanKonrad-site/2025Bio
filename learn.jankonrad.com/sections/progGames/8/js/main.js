// main.js
import { setupBlocks } from './blocks.js';
import { setupCanvas } from './canvas.js';
import { setupButtons } from './button.js';
import { generateCode } from './codeGenerator.js';
import { createVarWidget } from './helpers.js';



document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');
  const runBtn = document.getElementById('runBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  const { canvas, setDragged } = setupCanvas();

  function insertBlock(type) {
    const placeholder = canvas.querySelector('p');
    if (placeholder) placeholder.remove();

    if (type === 'var') {
      const newBlock = document.createElement('div');
      newBlock.className = `canvas-block type-${type}`;
      newBlock.draggable = true;
      newBlock.innerHTML = `
        <div class="canvas-block-header">
          <label>Proměnná:</label>
          <input class="var-name" type="text" value="x" />
          =
          <select class="value-type">
            <option value="text" selected>Text</option>
            <option value="number">Číslo</option>
            <option value="input">Vstup od uživatele</option>
          </select>
          <span class="value-input-area"></span>
          <span class="btn-remove" title="Odstranit blok">×</span>
        </div>
        <input class="note-text" placeholder="Poznámka (bude v kódu jako komentář)..." />
        <div class="var-widget-container"></div>
        <div class="order-controls">
          <button class="move-up" title="Posunout nahoru">▲</button>
          <button class="move-down" title="Posunout dolů">▼</button>
        </div>
      `;

      const varNameInput = newBlock.querySelector('.var-name');
      const valueTypeSelect = newBlock.querySelector('.value-type');
      const valueInputArea = newBlock.querySelector('.value-input-area');
      const noteInput = newBlock.querySelector('.note-text');
      const widgetContainer = newBlock.querySelector('.var-widget-container');

      function createValueInput(type) {
        valueInputArea.innerHTML = '';
        let input;
        if (type === 'input') {
          const div = document.createElement('div');
          div.className = 'input-block';
          div.innerHTML = `
            <label>Prompt:</label>
            <input type="text" class="input-prompt" placeholder="Zadej text..." />
            <label>Typ vstupu:</label>
            <select class="input-subtype">
              <option value="text" selected>Text</option>
              <option value="number">Číslo</option>
            </select>
          `;
          valueInputArea.appendChild(div);
        } else {
          input = document.createElement('input');
          input.type = type === 'text' ? 'text' : 'number';
          input.placeholder = type === 'text' ? 'Textová hodnota' : 'Číselná hodnota';
          valueInputArea.appendChild(input);
        }
      }

      function updateVarWidget() {
        widgetContainer.innerHTML = '';
        const name = varNameInput.value.trim() || 'x';
        const widget = createVarWidget(name, setDragged);
        widgetContainer.appendChild(widget);
        generateCode(canvas, output);
      }

      valueTypeSelect.addEventListener('change', () => {
        createValueInput(valueTypeSelect.value);
        generateCode(canvas, output);
      });
      varNameInput.addEventListener('input', updateVarWidget);
      noteInput.addEventListener('input', () => generateCode(canvas, output));

      newBlock.querySelector('.btn-remove').addEventListener('click', () => {
        newBlock.remove();
        generateCode(canvas, output);
      });

      newBlock.querySelector('.move-up').addEventListener('click', () => {
        const prev = newBlock.previousElementSibling;
        if (prev) canvas.insertBefore(newBlock, prev);
        generateCode(canvas, output);
      });

      newBlock.querySelector('.move-down').addEventListener('click', () => {
        const next = newBlock.nextElementSibling;
        if (next) canvas.insertBefore(next, newBlock);
        generateCode(canvas, output);
      });

      newBlock.addEventListener('dragstart', () => newBlock.classList.add('dragging'));
      newBlock.addEventListener('dragend', () => {
        newBlock.classList.remove('dragging');
        generateCode(canvas, output);
      });

      createValueInput(valueTypeSelect.value);
      canvas.appendChild(newBlock);
      updateVarWidget();
    }

    generateCode(canvas, output);
  }

  setupBlocks(insertBlock);
  setupButtons(runBtn, downloadBtn, output);
});
