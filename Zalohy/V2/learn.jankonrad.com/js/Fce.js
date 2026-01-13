
(() => {
  // Pomocné funkce
  const esc = t => (t ?? "").toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const isDigits = (str) => {
    if (!str || str.length === 0) return false;
    for (let k = 0; k < str.length; k++) {
      const ch = str[k];
      if (ch < '0' || ch > '9') return false;
    }
    return true;
  };

  // ELEMENTY (krokování)
  const elIn   = document.getElementById('jc-input');
  const elRail = document.getElementById('jc-rail');
  const elLen  = document.getElementById('jc-len');
  const elI    = document.getElementById('jc-i');
  const elState= document.getElementById('jc-state');
  const elRes  = document.getElementById('jc-result');
  const elLog  = document.getElementById('jc-log');

  const btnStart = document.getElementById('jc-start');
  const btnStep  = document.getElementById('jc-step');
  const btnRun   = document.getElementById('jc-run');
  const btnStop  = document.getElementById('jc-stop');

  // ELEMENTY (rychlý test)
  const quickIn  = document.getElementById('jc-quick-input');
  const qBtnChk  = document.getElementById('jc-quick-check');
  const qBtnClr  = document.getElementById('jc-quick-clear');
  const qOut1    = document.getElementById('jc-quick-out1');
  const qOut2    = document.getElementById('jc-quick-out2');

  // Stav pro krokování
  let raw = "", s = "", i = 0, L = 0, phase = 0, decided = false, timer = null, running = false;

  function renderRail(activeIndex = -999){
    if(!elRail) return;
    elRail.innerHTML = "";
    for(let k = 0; k < L; k++){
      const cell = document.createElement('div');
      cell.className = 'jc-cell' + (k === activeIndex ? ' active' : '');
      const chr = s[k] === " " ? "␣" : s[k] || "";
      cell.innerHTML = `<span class="idx">${k}</span><span class="chr">${esc(chr)}</span>`;
      elRail.appendChild(cell);
    }
  }
  function log(msg){ if(elLog){ elLog.textContent += msg + "\n"; elLog.scrollTop = elLog.scrollHeight; } }
  function setState(html){ if(elState){ elState.innerHTML = html; } }
  function setResult(v){
    if(!elRes) return;
    elRes.innerHTML = v===true ? '<span class="text-success fw-bold">True</span>'
                  : v===false ? '<span class="text-danger fw-bold">False</span>'
                              : '–';
  }
  function updateIL(){
    if(elI) elI.textContent = String(i);
    if(elLen) elLen.textContent = String(L);
  }

  function reset(){
    raw = (elIn?.value ?? "").toString();
    s = raw.trim();
    i = 0; L = s.length; phase = 0; decided = false;
    if(elLog) elLog.textContent = "";
    renderRail();
    updateIL();
    setState('Start → <code>text = text.strip()</code>');
    setResult(null);
    log(`Vstup: "${raw}"`);
    log(`Po strip(): "${s}" (len=${L})`);
  }

  // Krokování podle „profi“ větve (se slice) – ale čitelně
  // Phase 0: empty?  Phase 1: first char '-' ?  Phase 2: minus-branch  Phase 3: full isdigit
  function step(){
    if(decided) return false;

    if(phase === 0){
      setState('Je prázdný? <code>if text == ""</code>');
      if(L === 0){
        setResult(false); decided = true;
        log('Prázdný řetězec → vracím False.');
        return false;
      }
      phase = 1; return true;
    }

    if(phase === 1){
      setState('Začíná na <code>"-"</code>? <code>if text[0] == "-"</code>');
      if(L > 0 && s[0] === '-'){
        renderRail(0);
        log('První znak je "-" → větev s mínusem.');
        phase = 2; return true;
      } else {
        log('První znak není "-" → ověřím celý text .isdigit().');
        phase = 3; return true;
      }
    }

    if(phase === 2){
      // Větev s mínusem
      if(L === 1){
        setState('Je to jen "-"? → <code>return False</code>');
        setResult(false); decided = true;
        log('Délka je 1 a znak je "-" → False.');
        return false;
      }
      const rest = s.slice(1);
      setState('Zbytek musí být číslice: <code>text[1:].isdigit()</code>');
      log(`Kontroluji zbytek: "${rest}" → ${isDigits(rest)}`);
      setResult(isDigits(rest));
      decided = true;
      log(isDigits(rest) ? 'OK → True.' : 'Obsahuje ne-číslici → False.');
      return false;
    }

    if(phase === 3){
      setState('Celý text musí být číslice: <code>text.isdigit()</code>');
      log(`Kontroluji celý text: "${s}" → ${isDigits(s)}`);
      setResult(isDigits(s));
      decided = true;
      log(isDigits(s) ? 'OK → True.' : 'Obsahuje ne-číslici → False.');
      return false;
    }

    return false;
  }

  function startRun(){
    if(running) return;
    running = true;
    timer = setInterval(() => { if(!step()) stopRun(); }, 700);
  }
  function stopRun(){ running = false; if(timer){ clearInterval(timer); timer = null; } }

  // Rychlý test – obě verze (bez slice i se slice)
  function jeCelek_ucen(text){
    text = (text ?? "").toString().trim();
    if(text === "") return false;
    let i = 0;
    if(text[0] === "-"){
      if(text.length === 1) return false;
      i = 1;
    }
    while(i < text.length){
      const ch = text[i];
      if(ch < '0' || ch > '9') return false;
      i++;
    }
    return true;
  }
  function jeCelek_profi(text){
    text = (text ?? "").toString().trim();
    if(text === "") return false;
    if(text[0] === "-"){
      if(text.length === 1) return false;
      const rest = text.slice(1);
      return isDigits(rest);
    }
    return isDigits(text);
  }

  // Bindy
  btnStart?.addEventListener('click', () => { stopRun(); reset(); });
  btnStep ?.addEventListener('click', () => { step(); updateIL(); });
  btnRun  ?.addEventListener('click', () => { startRun(); });
  btnStop ?.addEventListener('click', () => { stopRun(); });

  qBtnChk?.addEventListener('click', () => {
    const t = quickIn.value ?? "";
    const r1 = jeCelek_ucen(t);
    const r2 = jeCelek_profi(t);
    qOut1.innerHTML = r1 ? '<span class="text-success fw-bold">True</span>' : '<span class="text-danger fw-bold">False</span>';
    qOut2.innerHTML = r2 ? '<span class="text-success fw-bold">True</span>' : '<span class="text-danger fw-bold">False</span>';
  });
  qBtnClr?.addEventListener('click', () => {
    quickIn.value = "";
    qOut1.textContent = "–";
    qOut2.textContent = "–";
  });

  // Při otevření modalu vyresetuj krokování i rychlý test
  const modalEl = document.getElementById('modalJeCelekExplain');
  modalEl?.addEventListener('shown.bs.modal', () => {
    // přepni implicitně na tab „Vysvětlení“?
    // necháme tak, jen reset krokování:
    reset();
    // a rychlý test default:
    if(quickIn) quickIn.value = "-42";
    if(qOut1) qOut1.textContent = "–";
    if(qOut2) qOut2.textContent = "–";
  });
  modalEl?.addEventListener('hide.bs.modal', stopRun);
})();

