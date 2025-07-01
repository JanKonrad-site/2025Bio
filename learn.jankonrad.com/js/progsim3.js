function runSim3() {
    const container = document.getElementById("sim3Questions");
    const result = document.getElementById("sim3Result");
    const questions = [
      ["Kolik je 2 + 2?", "4"],
      ["Kolik je 5 * 3?", "15"],
      ["Kolik je 10 / 2?", "5"]
    ];
    let score = 0;
    container.innerHTML = "";
    questions.forEach(([q, correct], i) => {
      const label = document.createElement("label");
      label.textContent = q;
      const input = document.createElement("input");
      input.type = "text";
      input.id = "q" + i;
      input.className = "form-control mb-2";
      container.appendChild(label);
      container.appendChild(input);
    });
    const btn = document.createElement("button");
    btn.textContent = "Vyhodnotit";
    btn.className = "btn btn-sm btn-light mt-2";
    btn.onclick = () => {
      score = 0;
      questions.forEach(([q, correct], i) => {
        const ans = document.getElementById("q" + i).value.trim();
        if (ans === correct) score++;
      });
      result.textContent = `Získal jsi ${score} bod(y) z ${questions.length}.`;
    };
    container.appendChild(btn);
  }
  
  function runSimCalc() {
    const container = document.getElementById("simCalc");
    const result = document.getElementById("simCalcResult");
    container.innerHTML = "";
  
    const num1 = document.createElement("input");
    num1.type = "number";
    num1.placeholder = "První číslo";
    num1.className = "form-control mb-2";
  
    const num2 = document.createElement("input");
    num2.type = "number";
    num2.placeholder = "Druhé číslo";
    num2.className = "form-control mb-2";
  
    const op = document.createElement("input");
    op.type = "text";
    op.placeholder = "Operace (+, -, *, /)";
    op.className = "form-control mb-2";
  
    const btn = document.createElement("button");
    btn.textContent = "Spočítej";
    btn.className = "btn btn-sm btn-light mt-2";
    btn.onclick = () => {
      const a = parseFloat(num1.value);
      const b = parseFloat(num2.value);
      const operation = op.value.trim();
      let res = "";
      if (operation === "+") res = a + b;
      else if (operation === "-") res = a - b;
      else if (operation === "*") res = a * b;
      else if (operation === "/") res = b !== 0 ? a / b : "Nelze dělit nulou";
      else res = "Neznámá operace";
      result.textContent = `Výsledek: ${res}`;
    };
  
    container.appendChild(num1);
    container.appendChild(num2);
    container.appendChild(op);
    container.appendChild(btn);
  }
  