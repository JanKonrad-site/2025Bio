// button.js
export function setupButtons(runBtn, downloadBtn, output) {
  runBtn.addEventListener('click', () => {
    alert('Pro spuštění kódu si jej zkopíruj a vlož do Python IDE, například https://replit.com/languages/python');
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([output.textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
