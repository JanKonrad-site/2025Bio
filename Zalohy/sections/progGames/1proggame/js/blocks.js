function setupBlockClicks() {
  const blocks = document.querySelectorAll('#blocks .block');
  blocks.forEach(block => {
    block.addEventListener('click', () => {
      insertBlock(block.dataset.type);
    });
  });
}