// codeGenerator.js
export function generateCode(canvas, output) {
  const blocks = canvas.querySelectorAll('.canvas-block');
  let codeLines = [];
  let usedVarNames = new Set();

  function sanitizeVarName(name) {
    name = name.trim();
    if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) return null;
    if (usedVarNames.has(name)) return null;
    usedVarNames.add(name);
    return name;
  }

  blocks.forEach(block => {
    const varNameEl = block.querySelector('.var-name');
    if (varNameEl) {
      const varNameRaw = varNameEl.value;
      const varName = sanitizeVarName(varNameRaw);
      if (!varName) {
        codeLines.push(`# NEVALIDNÍ název proměnné: ${varNameRaw}`);
        return;
      }

      const valueType = block.querySelector('.value-type').value;
      const noteText = block.querySelector('.note-text').value.trim();
      let valueCode = 'None';

      if (valueType === 'input') {
        const prompt = block.querySelector('.input-prompt')?.value.trim() || '';
        const subtype = block.querySelector('.input-subtype')?.value || 'text';
        valueCode = subtype === 'number'
          ? `int(input("${prompt.replace(/"/g, '\\"')}"))`
          : `input("${prompt.replace(/"/g, '\\"')}")`;
      } else if (valueType === 'text') {
        const val = block.querySelector('input[type="text"]')?.value || '';
        valueCode = `"${val.replace(/"/g, '\\"')}"`;
      } else if (valueType === 'number') {
        const val = block.querySelector('input[type="number"]')?.value || '0';
        valueCode = /^\d+(\.\d+)?$/.test(val) ? val : '0';
      }

      if (noteText) codeLines.push(`# ${noteText}`);
      codeLines.push(`${varName} = ${valueCode}`);
    }
  });

  output.textContent = codeLines.join('\n') || '# Žádný kód';
}
