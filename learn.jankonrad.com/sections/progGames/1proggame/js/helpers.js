function createVarWidget(name) {
  const widget = document.createElement('div');
  widget.className = 'var-widget';
  widget.textContent = name || 'x';
  widget.draggable = true;

  widget.addEventListener('dragstart', e => {
    window.dragged = widget;
    widget.classList.add('dragging');
    e.dataTransfer.setData('text/plain', '');
  });

  widget.addEventListener('dragend', e => {
    window.dragged = null;
    widget.classList.remove('dragging');
  });

  return widget;
}

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
