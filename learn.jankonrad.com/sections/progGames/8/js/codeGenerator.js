function generateCode() {
  const output = document.getElementById('output');
  const canvas = document.getElementById('canvas');
  let codeLines = [];

  function sanitize(text) {
    return text.replace(/"/g, '\\"');
  }

  function getExpressionFromSegment(segment) {
    if (segment.classList.contains('segment-val-wrapper')) {
      const select = segment.querySelector('select');
      const input = segment.querySelector('input');
      const type = select?.value;

      if (!type) return 'None';

      if (type === 'text') {
        const val = input?.value || '';
        return `"${sanitize(val)}"`;

      } else if (type === 'number') {
        const val = input?.value || '0';
        return isNaN(val) ? '0' : val;

      } else if (type === 'input') {
        const area = segment.querySelector('.input-area');
        const prompt = area?.querySelector('.input-prompt')?.value || '';
        const subtype = area?.querySelector('.input-subtype')?.value || 'text';
        const expr = `input("${sanitize(prompt)}")`;
        return subtype === 'number' ? `int(${expr})` : expr;

      } else if (type === 'var') {
        const selectVar = segment.querySelector('.input-area select');
        const span = segment.querySelector('.segment-var');
        if (selectVar) return selectVar.value || 'None';
        if (span) return span.textContent.trim();
      }
    }

    if (segment.classList.contains('segment-input-wrapper')) {
      const select = segment.querySelector('select');
      const expr = segment.querySelector('span')?.textContent || '';
      const subtype = select?.value || 'text';
      return subtype === 'number' ? `int(${expr})` : expr;
    }

    if (segment.classList.contains('segment-var')) {
      return segment.textContent.trim();
    }

    return '';
  }

  function getExpressionFromVarBlock(block) {
    const container = block.querySelector('.value-expression-container');
    if (!container) return 'None';

    const expressions = [];
    const children = [...container.children];

    if (children.length === 0) return 'None';

    const firstSegment = children[0];
    if (!firstSegment.classList.contains('segment-val-wrapper')) return 'None';
    expressions.push(getExpressionFromSegment(firstSegment));

    for (let i = 1; i < children.length; i++) {
      const child = children[i];
      if (child.classList.contains('operator-expression-wrapper')) {
        const op = child.querySelector('.segment-operator')?.value || '+';
        const valSegment = child.querySelector('.segment-val-wrapper');
        if (valSegment) {
          const val = getExpressionFromSegment(valSegment);
          expressions.push(op, val);
        }
      }
    }

    return expressions.join(' ');
  }

 function getExpressionFromCondition(editor) {
  const parts = [];
  editor.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent.trim();
      if (txt) parts.push(txt);
    } else if (node.classList?.contains('operator')) {
      parts.push(node.textContent.trim());
    } else {
      const expr = getExpressionFromSegment(node);
      if (expr) parts.push(expr);
    }
  });
  return parts.join(' ').trim() || 'True';
}

  function parseCanvas(container, indent = '') {
    const blocks = container.querySelectorAll(':scope > .canvas-block');

    blocks.forEach(block => {
      if (block.classList.contains('type-var')) {
        const name = block.querySelector('.var-name')?.value || 'x';
        const valueCode = getExpressionFromVarBlock(block);
        const note = block.querySelector('.note-text')?.value.trim();
        if (note) codeLines.push(`${indent}# ${note}`);
        codeLines.push(`${indent}${name} = ${valueCode}`);

      } else if (block.classList.contains('type-input')) {
        const prompt = block.querySelector('.input-prompt')?.value || '';
        const subtype = block.querySelector('.input-subtype')?.value || 'text';
        const expr = `input("${sanitize(prompt)}")`;
        codeLines.push(`${indent}${subtype === 'number' ? 'int(' + expr + ')' : expr}`);

      } else if (block.classList.contains('type-print')) {
        const editor = block.querySelector('.expression-editor');
        const parts = [];

        editor.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) parts.push(`"${sanitize(text)}"`);
          } else if (node.classList?.contains('segment-var')) {
            parts.push(node.textContent.trim());
          } else if (node.classList?.contains('segment-text')) {
            const text = node.textContent.trim();
            if (text) parts.push(`"${sanitize(text)}"`);
          } else if (node.classList?.contains('segment-space')) {
            parts.push(`" "`);
          }
        });

        if (parts.length > 0) {
          codeLines.push(`${indent}print(${parts.join(' + ')})`);
        } else {
          codeLines.push(`${indent}print()`);
        }

      } else if (block.classList.contains('type-note')) {
        const text = block.querySelector('textarea')?.value.trim();
        if (text) codeLines.push(`${indent}# ${text}`);

      } else if (block.classList.contains('type-if')) {
        const editor = block.querySelector('.condition-editor');
        const condition = getExpressionFromCondition(editor);
        codeLines.push(`${indent}if ${condition}:`);

        const ifCanvas = block.querySelector('.if-true-canvas');
        const elseCanvas = block.querySelector('.if-false-canvas');

        if (ifCanvas && ifCanvas.querySelector('.canvas-block')) {
          parseCanvas(ifCanvas, indent + '    ');
        } else {
          codeLines.push(indent + '    pass');
        }

        if (elseCanvas && elseCanvas.querySelector('.canvas-block')) {
          codeLines.push(`${indent}else:`);
          parseCanvas(elseCanvas, indent + '    ');
        }
      }
    });
  }

  parseCanvas(canvas);
  output.textContent = codeLines.join('\n') || '# Žádný kód';
}
