
    // ------------------------------------------------------------
    // Jednoduché „API“ pro začátečníky, aby se soustředili na JS logiku
    // ------------------------------------------------------------
    function makeApi(consoleEl){
      return {
        log: (msg) => {
          consoleEl.textContent += String(msg) + "\n";
          consoleEl.scrollTop = consoleEl.scrollHeight;
        },
        clear: () => { consoleEl.textContent = ""; },
        setText: (id, text) => {
          const el = document.getElementById(id);
          if(!el) throw new Error("Element #" + id + " neexistuje.");
          el.textContent = String(text);
        },
        unhide: (id) => {
          const el = document.getElementById(id);
          if(!el) throw new Error("Element #" + id + " neexistuje.");
          el.classList.remove("hidden");
        },
        hide: (id) => {
          const el = document.getElementById(id);
          if(!el) throw new Error("Element #" + id + " neexistuje.");
          el.classList.add("hidden");
        }
      };
    }

    function runUserCode(code, api){
      // Záměrně jednoduché: pro výuku v uzavřené třídě.
      // Běží to v kontextu této stránky; chyby vypíšeme do konzole labu.
      const fn = new Function("api", '"use strict";\n' + code);
      return fn(api);
    }

    function wireClearButtons(){
      document.querySelectorAll("[data-clear-console]").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const id = btn.getAttribute("data-clear-console");
          const el = document.getElementById(id);
          if(el) el.textContent = "";
        });
      });
    }

    // ------------------------------------------------------------
    // LAB 1
    // ------------------------------------------------------------
    const lab1 = {
      h1: document.getElementById("lab1H1"),
      p: document.getElementById("lab1P"),
      code: document.getElementById("lab1Code"),
      console: document.getElementById("lab1Console"),
      runBtn: document.getElementById("lab1Run"),
      resetBtn: document.getElementById("lab1Reset"),
      fillBtn: document.getElementById("lab1Fill"),
      reset(){
        this.h1.classList.add("hidden");
        this.p.classList.add("hidden");
        this.h1.textContent = "[nadpis]";
        this.p.textContent = "[odstavec]";
        this.console.textContent = "";
      }
    };

    lab1.resetBtn.addEventListener("click", ()=> lab1.reset());
    lab1.fillBtn.addEventListener("click", ()=>{
      lab1.code.value = `// Scénář pro „divadlo“
// K dispozici: api.unhide(id), api.setText(id, text), api.log(...)

api.unhide("lab1H1");

setTimeout(() => {
  api.unhide("lab1P");
  api.setText("lab1H1", "Hello");
  api.setText("lab1P", "World");
  api.log("Hotovo: nadpis i odstavec jsou zobrazené.");
}, 1000);
`;
    });

    lab1.runBtn.addEventListener("click", ()=>{
      const api = makeApi(lab1.console);
      try{
        api.clear();
        runUserCode(lab1.code.value, api);
      }catch(err){
        api.log("CHYBA: " + err.message);
      }
    });

    // ------------------------------------------------------------
    // LAB 2
    // ------------------------------------------------------------
    const lab2 = {
      out: document.getElementById("lab2Out"),
      code: document.getElementById("lab2Code"),
      console: document.getElementById("lab2Console"),
      runBtn: document.getElementById("lab2Run"),
      resetBtn: document.getElementById("lab2Reset"),
      fillBtn: document.getElementById("lab2Fill"),
      reset(){
        this.out.textContent = "—";
        this.console.textContent = "";
      }
    };

    lab2.resetBtn.addEventListener("click", ()=> lab2.reset());
    lab2.fillBtn.addEventListener("click", ()=>{
      lab2.code.value = `// Prompt + proměnná + výpis do scény
const yourName = prompt("Jak se jmenuješ?");
api.log("Uživatel zadal: " + yourName);

api.setText("lab2Out", "Ahoj, " + yourName + "!");
`;
    });

    lab2.runBtn.addEventListener("click", ()=>{
      const api = makeApi(lab2.console);
      try{
        api.clear();
        runUserCode(lab2.code.value, api);
      }catch(err){
        api.log("CHYBA: " + err.message);
      }
    });

    // ------------------------------------------------------------
    // LAB 3
    // ------------------------------------------------------------
    const lab3 = {
      out: document.getElementById("lab3Out"),
      code: document.getElementById("lab3Code"),
      console: document.getElementById("lab3Console"),
      runBtn: document.getElementById("lab3Run"),
      resetBtn: document.getElementById("lab3Reset"),
      fillBtn: document.getElementById("lab3Fill"),
      reset(){
        this.out.textContent = "—";
        this.console.textContent = "";
      }
    };

    lab3.resetBtn.addEventListener("click", ()=> lab3.reset());
    lab3.fillBtn.addEventListener("click", ()=>{
      lab3.code.value = `// Datové typy + typeof
const textValue = "23";
const numberValue = 23;
const boolValue = true;

const t1 = typeof textValue;
const t2 = typeof numberValue;
const t3 = typeof boolValue;

api.log("typeof textValue = " + t1);
api.log("typeof numberValue = " + t2);
api.log("typeof boolValue = " + t3);

api.setText("lab3Out",
  "textValue = \\"" + textValue + "\\" → " + t1 + "\\n" +
  "numberValue = " + numberValue + " → " + t2 + "\\n" +
  "boolValue = " + boolValue + " → " + t3
);
`;
    });

    lab3.runBtn.addEventListener("click", ()=>{
      const api = makeApi(lab3.console);
      try{
        api.clear();
        runUserCode(lab3.code.value, api);
      }catch(err){
        api.log("CHYBA: " + err.message);
      }
    });

    // ------------------------------------------------------------
    // LAB 4 (s kontrolami pravidel)
    // ------------------------------------------------------------
    const lab4 = {
      out: document.getElementById("lab4Out"),
      check: document.getElementById("lab4Check"),
      code: document.getElementById("lab4Code"),
      console: document.getElementById("lab4Console"),
      runBtn: document.getElementById("lab4Run"),
      resetBtn: document.getElementById("lab4Reset"),
      fillBtn: document.getElementById("lab4Fill"),
      reset(){
        this.out.textContent = "—";
        this.check.textContent = "—";
        this.console.textContent = "";
      }
    };

    lab4.resetBtn.addEventListener("click", ()=> lab4.reset());
    lab4.fillBtn.addEventListener("click", ()=>{
      lab4.code.value = `// --- NESAHEJ NA TENTO BLOK ---
let a = 3;
let b = 8;

// --- DOPLŇ POUZE 3 ŘÁDKY POD TUTO ČÁRU ---
// (1)
let temp = a;
// (2)
a = b;
// (3)
b = temp;

// --- NESAHEJ NA TENTO BLOK ---
api.log("a = " + a);
api.log("b = " + b);
api.setText("lab4Out", "Po spuštění: a = " + a + ", b = " + b);
`;
    });

    function validateSwapRules(code){
      // 1) zákaz číslic v části řešení (celý editor)
      if (/[0-9]/.test(code)) {
        return { ok:false, msg:"Porušení pravidla: řešení obsahuje číslice (0–9). Nesmí tam být žádné číslo." };
      }
      // 2) zákaz redeklarace a/b (var/let/const a = ...), ale povolíme změny a=..., b=...
      //   (hledáme deklaraci: let a / const a / var a, totéž pro b)
      if (/\b(let|const|var)\s+a\b/.test(code) || /\b(let|const|var)\s+b\b/.test(code)) {
        // V tomto labu jsou let a/let b nahoře – ty ale v textu jsou. Abychom je nepovažovali za chybu,
        // kontrolujeme jen část „řešení“ mezi značkami.
      }
      return { ok:true, msg:"" };
    }

    function extractSolutionBlock(code){
      const start = code.indexOf("// --- DOPLŇ POUZE 3 ŘÁDKY POD TUTO ČÁRU ---");
      const end = code.indexOf("// --- NESAHEJ NA TENTO BLOK ---", start + 1);
      if(start === -1 || end === -1) return "";
      return code.slice(start, end);
    }

    function validateSwapConstraints(code){
      const sol = extractSolutionBlock(code);

      // zákaz číslic v řešení
      if (/[0-9]/.test(sol)) {
        return { ok:false, msg:"Porušení pravidla: ve TŘECH ŘÁDCÍCH řešení jsou číslice (0–9)." };
      }

      // zákaz redeklarace a/b v řešení
      if (/\b(let|const|var)\s+a\b/.test(sol) || /\b(let|const|var)\s+b\b/.test(sol)) {
        return { ok:false, msg:"Porušení pravidla: v řešení znovu deklaruješ proměnnou a nebo b (let/const/var)." };
      }

      // doporučení: použít temp (ne povinné), ale pro začátečníka fajn – jen informativně
      const usedTemp = /\btemp\b/.test(sol);

      return { ok:true, msg: usedTemp ? "Pravidla splněna. (Použil(a) jsi dočasnou proměnnou – klasické řešení.)"
                                      : "Pravidla splněna. (Bez temp – také možné, pokud víš proč.)" };
    }

    lab4.runBtn.addEventListener("click", ()=>{
      const api = makeApi(lab4.console);
      api.clear();
      lab4.check.textContent = "—";

      const constraints = validateSwapConstraints(lab4.code.value);
      if(!constraints.ok){
        lab4.check.innerHTML = `<span class="bad">NEPROŠLO:</span> ${constraints.msg}`;
        api.log("CHYBA: " + constraints.msg);
        return;
      }

      try{
        runUserCode(lab4.code.value, api);

        // Z konzole už víme hodnoty a/b jen textově; otestujeme „správnost“ jednoduchým vyhodnocením:
        // (Necháme kód znovu proběhnout v izolaci a vytáhneme a/b – uděláme to přes návrat z funkce.)
        const testFn = new Function("api", '"use strict";\n' + lab4.code.value + "\nreturn {a, b};");
        const r = testFn({ ...api, log: ()=>{}, setText: ()=>{} });

        if(r && r.a === 8 && r.b === 3){
          lab4.check.innerHTML = `<span class="ok">OK:</span> Prohození je správně. ${constraints.msg}`;
        }else{
          lab4.check.innerHTML = `<span class="warn">TÉMĚŘ:</span> Kód běží, ale hodnoty nejsou správně prohozené (a=${r.a}, b=${r.b}).`;
        }
      }catch(err){
        api.log("CHYBA: " + err.message);
        lab4.check.innerHTML = `<span class="bad">CHYBA:</span> ${err.message}`;
      }
    });

    // Init
    wireClearButtons();
    lab1.reset();
    lab2.reset();
    lab3.reset();
    lab4.reset();
