
function runSim1() {
  const name = document.getElementById('sim1Name').value;
  const age = parseInt(document.getElementById('sim1Age').value);
  if (!name || isNaN(age)) {
    document.getElementById('sim1Result').textContent = 'Zadej prosím jméno i věk.';
    return;
  }
  const result = age >= 18 ? "Jsi plnoletý/á" : "Ještě ti není 18";
  document.getElementById('sim1Result').textContent = `${name}, ${result}`;
}

function runSim2() {
  const num1 = parseFloat(document.getElementById('sim2Num1').value);
  const num2 = parseFloat(document.getElementById('sim2Num2').value);
  const op = document.getElementById('sim2Op').value.trim();
  let result = '';
  if (isNaN(num1) || isNaN(num2)) {
    result = 'Zadej obě čísla správně.';
  } else {
    switch (op) {
      case '+': result = `Výsledek: ${num1 + num2}`; break;
      case '-': result = `Výsledek: ${num1 - num2}`; break;
      case '*': result = `Výsledek: ${num1 * num2}`; break;
      case '/': result = num2 !== 0 ? `Výsledek: ${num1 / num2}` : 'Nelze dělit nulou.'; break;
      default: result = 'Neplatná operace. Použij +, -, *, /';
    }
  }
  document.getElementById('sim2Result').textContent = result;
}
