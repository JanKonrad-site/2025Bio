// helpers.js
export function createVarWidget(name, setDragged) {
  const widget = document.createElement('div');
  widget.className = 'var-widget';
  widget.textContent = name || 'x';
  widget.draggable = true;

  widget.addEventListener('dragstart', e => {
    setDragged(widget);
    widget.classList.add('dragging');
    e.dataTransfer.setData('text/plain', '');
  });

  widget.addEventListener('dragend', e => {
    setDragged(null);
    widget.classList.remove('dragging');
  });

  return widget;
}
