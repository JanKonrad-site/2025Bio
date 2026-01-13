function setupCanvas() {
  const canvas = window.canvas;

  canvas.addEventListener('dragover', e => {
    e.preventDefault();
    if (window.dragged && window.dragged.classList.contains('var-widget')) return;

    const afterElement = getDragAfterElement(canvas, e.clientY);
    const dragging = document.querySelector('.canvas-block.dragging');
    if (!dragging) return;

    if (afterElement == null) {
      canvas.appendChild(dragging);
    } else {
      canvas.insertBefore(dragging, afterElement);
    }
  });
}