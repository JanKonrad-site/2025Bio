/* /assets/js/features/jc-runner.js */
/**
 * Bezpečnější varianta původního Fce.js:
 * - nic nepadá, pokud prvky ještě nejsou v DOM (dynamické sekce)
 * - reaguje na modal show (bootstrap-like event i custom)
 */
export function initJcRunner() {
  const elIn = document.getElementById("jc-input");
  const elRail = document.getElementById("jc-rail");
  const elLen = document.getElementById("jc-len");
  const elI = document.getElementById("jc-i");
  const elState = document.getElementById("jc-state");
  const elRes = document.getElementById("jc-result");

  if (!elIn || !elRail || !elLen || !elI || !elState || !elRes) return;

  // zabránit dvojí inicializaci
  if (elIn.dataset._jcInit === "1") return;
  elIn.dataset._jcInit = "1";

  const esc = (t) =>
    (t ?? "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const isDigits = (str) => {
    if (!str || str.length === 0) return false;
    for (let k = 0; k < str.length; k++) {
      const ch = str[k];
      if (ch < "0" || ch > "9") return false;
    }
    return true;
  };

  function render(s) {
    const input = (s || "").toString();
    elRail.innerHTML = "";

    for (let i = 0; i < input.length; i++) {
      const span = document.createElement("span");
      span.className = "jc-ch";
      span.textContent = input[i];
      elRail.appendChild(span);
    }

    elLen.textContent = String(input.length);
    elI.textContent = "0";
    elState.textContent = "Připraveno";
    elRes.textContent = "";
  }

  function runOnce() {
    const input = (elIn.value || "").trim();
    render(input);

    if (!input) {
      elState.textContent = "Zadej řetězec.";
      return;
    }

    if (isDigits(input)) elRes.textContent = "Řetězec obsahuje pouze číslice.";
    else elRes.textContent = "Řetězec obsahuje i jiné znaky než číslice.";
  }

  // tlačítka (pokud existují)
  const btnRun = document.getElementById("jc-run");
  btnRun?.addEventListener("click", runOnce);

  // pokud to má být resetováno při otevření modalu
  const modal = elIn.closest(".modal");
  const onShow = () => {
    // lehký reset UI (nepřepisuje vstup)
    render((elIn.value || "").trim());
  };
  modal?.addEventListener("shown.bs.modal", onShow);
  modal?.addEventListener("modal:shown", onShow);

  // inicializace view
  render((elIn.value || "").trim());

  // kompatibilita pro případné inline volání
  window.jcRunOnce = runOnce;
}
