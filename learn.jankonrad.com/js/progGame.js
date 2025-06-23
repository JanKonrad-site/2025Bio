document.addEventListener('DOMContentLoaded', () => {
  let draggedItem = null;
  let completed = false;

  const draggables = document.querySelectorAll('.draggable');
  const codeBlocks = document.getElementById('codeBlocks');
  const dropZone = document.getElementById('dropZone');
  const result = document.getElementById('resultCode');
  const codeElement = document.getElementById('finalCode');

  // Skryj výsledek při načtení
  result.classList.add('d-none');

  draggables.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      item.classList.add('dragging');
      e.dataTransfer.setData('text/plain', '');
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedItem = null;
    });
  });

  [codeBlocks, dropZone].forEach(zone => {
    zone.addEventListener('dragover', (e) => e.preventDefault());

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!draggedItem) return;

      // Zamezíme duplikaci
      if (!zone.contains(draggedItem)) {
        zone.querySelector('p')?.remove(); // odstraníme placeholder
        zone.appendChild(draggedItem);
        checkOrder();
      }
    });
  });

  function checkOrder() {
    const items = Array.from(dropZone.querySelectorAll('.draggable'));
    const order = items.map(el => el.dataset.order);

    if (order.join(',') === '1,2,3') {
      completed = true;
      result.classList.remove('d-none');
    } else {
      completed = false;
      result.classList.add('d-none');
    }
  }

  window.copyCode = function () {
    navigator.clipboard.writeText(codeElement.textContent.trim())
      .then(() => alert("Kód byl zkopírován do schránky!"));
  };
});