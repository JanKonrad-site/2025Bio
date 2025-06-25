// canvas.js
export function setupCanvas() {
  const canvas = document.getElementById('canvas');
  let dragged = null;

  canvas.addEventListener('dragover', e => {
    e.preventDefault();
    if (dragged && dragged.classList.contains('var-widget')) return;

    const afterElement = getDragAfterElement(canvas, e.clientY);
    const dragging = document.querySelector('.canvas-block.dragging');
    if (!dragging) return;

    if (afterElement == null) {
      canvas.appendChild(dragging);
    } else {
      canvas.insertBefore(dragging, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.canvas-block:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  return {
    canvas,
    setDragged: (element) => { dragged = element; }
  };
}
