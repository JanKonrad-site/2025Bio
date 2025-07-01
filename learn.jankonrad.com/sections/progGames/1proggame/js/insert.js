function insertBlock(type) {
  if (type === 'var') return insertVarBlock();
  if (type === 'input') return insertInputBlock();
  if (type === 'print') return insertPrintBlock();
  if (type === 'note') return insertNoteBlock();
  if (type === 'if') return insertIfBlock();
}