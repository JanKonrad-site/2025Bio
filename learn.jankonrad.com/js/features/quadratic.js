/* /assets/js/features/quadratic.js */
export function initQuadratic() {
  // pokud UI neexistuje, nic nedělej (kvůli dynamickému načítání sekcí)
  const qa = document.getElementById("qa");
  const qb = document.getElementById("qb");
  const qc = document.getElementById("qc");
  if (!qa || !qb || !qc) return;

  // zabránit dvojité inicializaci
  const root = qa.closest("[data-quadratic]") || document;
  if (root?.dataset?.quadraticInit === "1") return;
  if (root?.dataset) root.dataset.quadraticInit = "1";

  const x1 = document.getElementById("x1");
  const x2 = document.getElementById("x2");
  const noReal = document.getElementById("no-real");
  const u = document.getElementById("u");
  const v = document.getElementById("v");
  const discBadge = document.getElementById("disc-badge");
  const scoreBox = document.getElementById("score-box");
  const rootsHelp = document.getElementById("roots-help");
  const vertexHelp = document.getElementById("vertex-help");

  const eps = 1e-6;

  const parseNum = (s) => {
    if (typeof s !== "string") return NaN;
    s = s.trim().replace(",", ".");
    if (!s) return NaN;
    return Number(s);
  };

  const round = (n) => Math.round(n * 1000) / 1000;

  function setBadge(text, tone) {
    if (!discBadge) return;
    discBadge.textContent = text;
    discBadge.classList.remove("ok", "warn", "bad");
    if (tone) discBadge.classList.add(tone);
  }

  function mark(el, ok) {
    if (!el) return;
    el.classList.toggle("is-valid", ok);
    el.classList.toggle("is-invalid", !ok);
  }

  function calcExpectations(a, b, c) {
    const D = b * b - 4 * a * c;

    let roots = null;
    if (D > eps) {
      const sqrtD = Math.sqrt(D);
      const r1 = (-b - sqrtD) / (2 * a);
      const r2 = (-b + sqrtD) / (2 * a);
      roots = [r1, r2].sort((m, n) => m - n);
    } else if (Math.abs(D) <= eps) {
      const r = (-b) / (2 * a);
      roots = [r, r];
    }

    const U = -b / (2 * a);
    const V = -D / (4 * a);

    return { D, roots, U, V };
  }

  function update() {
    const a = parseNum(qa.value);
    const b = parseNum(qb.value);
    const c = parseNum(qc.value);

    if (!Number.isFinite(a) || Math.abs(a) < eps) {
      setBadge("a musí být nenulové", "bad");
      return;
    }

    const { D, roots, U, V } = calcExpectations(a, b, c);

    // badge
    if (D > eps) setBadge(`D = ${round(D)} (2 kořeny)`, "ok");
    else if (Math.abs(D) <= eps) setBadge(`D = ${round(D)} (dvojnásobný kořen)`, "warn");
    else setBadge(`D = ${round(D)} (bez reálných kořenů)`, "bad");

    // vyhodnocení kořenů
    if (noReal) {
      const expectNoReal = D < -eps;
      mark(noReal, !!noReal.checked === expectNoReal);
      if (rootsHelp) rootsHelp.style.display = expectNoReal ? "block" : "none";
    }

    if (roots) {
      const exp1 = roots[0];
      const exp2 = roots[1];
      const in1 = parseNum(x1?.value || "");
      const in2 = parseNum(x2?.value || "");

      const ok1 = Number.isFinite(in1) && Math.abs(in1 - exp1) <= 0.01;
      const ok2 = Number.isFinite(in2) && Math.abs(in2 - exp2) <= 0.01;

      mark(x1, ok1);
      mark(x2, ok2);
    } else {
      // očekáváme bez reálných kořenů => x1/x2 můžeme nechat bez validace
      x1 && mark(x1, true);
      x2 && mark(x2, true);
    }

    // vrchol
    const inU = parseNum(u?.value || "");
    const inV = parseNum(v?.value || "");

    const okU = Number.isFinite(inU) && Math.abs(inU - U) <= 0.01;
    const okV = Number.isFinite(inV) && Math.abs(inV - V) <= 0.01;

    mark(u, okU);
    mark(v, okV);

    if (vertexHelp) vertexHelp.style.display = "block";

    // skóre
    let score = 0;
    let total = 0;

    const count = (el) => {
      if (!el) return;
      total++;
      if (el.classList.contains("is-valid")) score++;
    };

    [noReal, x1, x2, u, v].forEach(count);

    if (scoreBox) scoreBox.textContent = `Skóre: ${score}/${total}`;
  }

  ["input", "change"].forEach((evt) => {
    qa.addEventListener(evt, update);
    qb.addEventListener(evt, update);
    qc.addEventListener(evt, update);
    noReal?.addEventListener(evt, update);
    x1?.addEventListener(evt, update);
    x2?.addEventListener(evt, update);
    u?.addEventListener(evt, update);
    v?.addEventListener(evt, update);
  });

  update();
}
