// blocks.js
export function setupBlocks(insertBlock) {
  const blocks = document.querySelectorAll('#blocks .block');
  blocks.forEach(block => {
    block.addEventListener('click', () => {
      insertBlock(block.dataset.type);
    });
  });
}
