/* /assets/js/features/simulations.js */
export function initSimulations() {
  const registry = new Map();

  // --- sim1 (věk)
  registry.set("sim1", () => {
    const ageInput = document.getElementById("ageInput");
    const result = document.getElementById("sim1Result");
    const age = Number(ageInput?.value);
    if (!result) return;

    if (!Number.isFinite(age)) result.innerText = "Zadej číslo.";
    else if (age >= 18) result.innerText = "Jsi dospělý/á.";
    else result.innerText = "Nejsi dospělý/á.";
  });

  // --- sim2 (kalkulačka)
  registry.set("sim2", () => {
    const n1 = Number(document.getElementById("num1")?.value);
    const n2 = Number(document.getElementById("num2")?.value);
    const op = document.getElementById("op")?.value;
    const result = document.getElementById("sim2Result");
    if (!result) return;

    if (!Number.isFinite(n1) || !Number.isFinite(n2)) {
      result.innerText = "Zadej dvě čísla.";
      return;
    }

    let out;
    if (op === "+") out = n1 + n2;
    else if (op === "-") out = n1 - n2;
    else if (op === "*") out = n1 * n2;
    else if (op === "/") out = n2 === 0 ? "Nelze dělit nulou." : n1 / n2;
    else out = "Neplatná operace.";

    result.innerText = `Výsledek: ${out}`;
  });

  // --- sim3 (mini test)
  registry.set("sim3", () => {
    const container = document.getElementById("sim3Questions");
    const result = document.getElementById("sim3Result");
    if (!container || !result) return;

    const questions = [
      ["Kolik je 2 + 2?", "4"],
      ["Kolik je 5 * 3?", "15"],
      ["Kolik je 10 / 2?", "5"],
    ];

    container.innerHTML = "";
    questions.forEach(([q], i) => {
      const label = document.createElement("label");
      label.textContent = q;
      const input = document.createElement("input");
      input.type = "text";
      input.id = "q" + i;
      input.className = "form-control mb-2"; // klidně nech (bez Bootstrapu to ničemu nevadí)
      container.appendChild(label);
      container.appendChild(input);
    });

    const btn = document.createElement("button");
    btn.textContent = "Vyhodnotit";
    btn.className = "btn btn-sm btn-light mt-2";
    btn.onclick = () => {
      let score = 0;
      questions.forEach(([, correct], i) => {
        const val = (document.getElementById("q" + i)?.value || "").trim();
        if (val === correct) score++;
      });
      result.textContent = `Skóre: ${score}/${questions.length}`;
    };

    container.appendChild(btn);
  });

  // --- tip (spropitné)
  registry.set("tip", () => {
    const bill = parseFloat(document.getElementById("bill")?.value || "");
    const tipPercent = parseFloat(document.getElementById("tipPercent")?.value || "");
    const people = parseInt(document.getElementById("people")?.value || "", 10);
    const result = document.getElementById("tipResult");
    if (!result) return;

    if (!Number.isFinite(bill) || !Number.isFinite(tipPercent) || !Number.isFinite(people) || people <= 0) {
      result.textContent = "Zadej správné hodnoty.";
      return;
    }

    const totalTip = bill * (tipPercent / 100);
    const total = bill + totalTip;
    const perPerson = total / people;
    result.textContent =
      `Spropitné celkem: ${totalTip.toFixed(2)} Kč, ` +
      `Celkem: ${total.toFixed(2)} Kč, ` +
      `Na osobu: ${perPerson.toFixed(2)} Kč`;
  });

  // veřejné API + kompatibilita se starými názvy
  window.runSim = (id) => registry.get(String(id))?.();
  window.runSim1 = () => window.runSim("sim1");
  window.runSim2 = () => window.runSim("sim2");
  window.runSim3 = () => window.runSim("sim3");
  window.runSimTip = () => window.runSim("tip");
}
