document.addEventListener('DOMContentLoaded', () => {
  window.canvas = document.getElementById('canvas');
  window.output = document.getElementById('output');
  window.dragged = null;
  window.generateCode = generateCode;
  window.createVarWidget = createVarWidget;

  setupCanvas();
  setupBlockClicks();
  setupRunButton();
  setupDownloadButton();
});
