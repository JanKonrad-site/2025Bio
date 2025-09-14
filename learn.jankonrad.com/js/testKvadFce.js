
(function(){
  const $ = (sel) => document.querySelector(sel);

  const qa = $('#qa'), qb = $('#qb'), qc = $('#qc');
  const x1 = $('#x1'), x2 = $('#x2'), noReal = $('#no-real');
  const u = $('#u'), v = $('#v');
  const discBadge = $('#disc-badge');
  const scoreBox = $('#score-box');
  const rootsHelp = $('#roots-help');
  const vertexHelp = $('#vertex-help');

  function parseNum(s){
    if (typeof s !== 'string') return NaN;
    s = s.trim().replace(',', '.');
    if (s === '') return NaN;
    return Number(s);
  }
  const eps = 1e-6;
  const approxEq = (A,B) => Number.isFinite(A) && Number.isFinite(B) && Math.abs(A - B) <= eps;

  function clearValidity(...els){
    els.forEach(el => el.classList.remove('is-valid','is-invalid'));
  }
  function setValid(el, ok){
    el.classList.toggle('is-valid', ok);
    el.classList.toggle('is-invalid', !ok);
  }

  function calcExpectations(a,b,c){
    const D = b*b - 4*a*c;
    let roots = null;
    if (D > eps){
      const sqrtD = Math.sqrt(D);
      const r1 = (-b - sqrtD) / (2*a);
      const r2 = (-b + sqrtD) / (2*a);
      roots = [r1, r2].sort((m,n)=>m-n);
    } else if (Math.abs(D) <= eps){
      const r = (-b) / (2*a);
      roots = [r, r];
    } // else roots remain null (no real)
    const uu = (-b) / (2*a);
    const vv = a*uu*uu + b*uu + c;
    return {D, roots, u: uu, v: vv};
  }

  function updateDisc(){
    const a = parseNum(qa.value), b = parseNum(qb.value), c = parseNum(qc.value);
    if (!Number.isFinite(a) || Math.abs(a) <= eps){
      discBadge.textContent = 'D = ?';
      return null;
    }
    const {D} = calcExpectations(a,b,c);
    discBadge.textContent = 'D = ' + (Math.abs(D) <= eps ? '0' : D.toFixed(4));
    return D;
  }

  // Check button
  $('#btn-check').addEventListener('click', () => {
    clearValidity(x1,x2,u,v);
    rootsHelp.hidden = true;
    vertexHelp.hidden = true;
    scoreBox.textContent = '';

    const a = parseNum(qa.value), b = parseNum(qb.value), c = parseNum(qc.value);
    if (!Number.isFinite(a) || Math.abs(a) <= eps){
      alert('A musí být číslo a nesmí být 0.');
      return;
    }
    if (!Number.isFinite(b) || !Number.isFinite(c)){
      alert('B a C musí být čísla.');
      return;
    }

    const exp = calcExpectations(a,b,c);
    // Vertex
    const uGuess = parseNum(u.value);
    const vGuess = parseNum(v.value);
    let vtxOK = approxEq(uGuess, exp.u) && approxEq(vGuess, exp.v);
    setValid(u, approxEq(uGuess, exp.u));
    setValid(v, approxEq(vGuess, exp.v));
    if (!vtxOK) vertexHelp.hidden = false;

    // Roots
    let rootsOK = false;
    const claimedNoReal = noReal.checked;

    if (exp.roots === null){
      // no real roots expected
      rootsOK = claimedNoReal;
      setValid(x1, rootsOK); setValid(x2, rootsOK);
      if (!rootsOK) rootsHelp.hidden = false;
    } else {
      // real roots expected
      const g1 = parseNum(x1.value);
      const g2 = parseNum(x2.value);
      if (!Number.isFinite(g1) || !Number.isFinite(g2)){
        setValid(x1, false); setValid(x2, false);
        rootsHelp.hidden = false;
      } else {
        const g = [g1,g2].sort((m,n)=>m-n);
        rootsOK = approxEq(g[0], exp.roots[0]) && approxEq(g[1], exp.roots[1]) && !claimedNoReal;
        setValid(x1, approxEq(g[0], exp.roots[0]) && !claimedNoReal);
        setValid(x2, approxEq(g[1], exp.roots[1]) && !claimedNoReal);
        if (!rootsOK) rootsHelp.hidden = false;
      }
    }

    // Score
    const score = (rootsOK?1:0) + (vtxOK?1:0);
    scoreBox.textContent = `Výsledek: ${score} / 2`;
  });

  // Clear button
  $('#btn-clear').addEventListener('click', () => {
    [x1,x2,u,v].forEach(el => { el.value=''; el.classList.remove('is-valid','is-invalid'); });
    noReal.checked = false;
    rootsHelp.hidden = true; vertexHelp.hidden = true;
    scoreBox.textContent = '';
  });

  // Update discriminant live
  ['input','change'].forEach(evt => {
    qa.addEventListener(evt, updateDisc);
    qb.addEventListener(evt, updateDisc);
    qc.addEventListener(evt, updateDisc);
  });
  updateDisc();

  // Random easy instance with integer roots
  function randint(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  $('#btn-random').addEventListener('click', () => {
    // Vyrobíme (x-r1)(x-r2) = x^2 - (r1+r2)x + r1*r2
    let r1 = randint(-5,5), r2 = randint(-5,5);
    while (r2 === r1) r2 = randint(-5,5);
    const A = 1;
    const B = -(r1 + r2);
    const C = r1 * r2;
    qa.value = A; qb.value = B; qc.value = C;
    updateDisc();

    // Předvymaž odpovědi
    [x1,x2,u,v].forEach(el => { el.value=''; el.classList.remove('is-valid','is-invalid'); });
    noReal.checked = false;
    rootsHelp.hidden = true; vertexHelp.hidden = true;
    scoreBox.textContent = '';
  });
})();
