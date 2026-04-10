// assets/js/features/blockgame.js

(function () {
  // ----------------------------
  // Robustní kopírování (data-copy-target)
  // ----------------------------
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch (e) {
        document.body.removeChild(ta);
        return false;
      }
    }
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy-target]");
    if (!btn) return;

    const id = btn.getAttribute("data-copy-target");
    const pre = document.getElementById(id);
    if (!pre) return;

    const code = pre.innerText;
    const ok = await copyText(code);
    btn.textContent = ok ? "Zkopírováno ✓" : "Nelze zkopírovat";
    setTimeout(() => (btn.textContent = "Kopírovat"), 1200);
  });

  // ----------------------------
  // Block game
  // ----------------------------
  const SNIPPETS = {
    imports: `import sqlite3\nfrom pathlib import Path\n`,
    dbfile: `DB_FILE = Path(__file__).resolve().with_name("reservations.db")\n`,
    print_before: `print("DB path:", DB_FILE)\nprint("DB exists BEFORE:", DB_FILE.exists())\n`,
    connect: `conn = sqlite3.connect(str(DB_FILE))\n`,
    create_table: `conn.execute("""\nCREATE TABLE IF NOT EXISTS reservations (\n    id        INTEGER PRIMARY KEY AUTOINCREMENT,\n    name      TEXT    NOT NULL,\n    date      TEXT    NOT NULL,\n    arrival   TEXT    NOT NULL,\n    departure TEXT    NOT NULL\n);\n""")\n`,
    commit1: `conn.commit()\n`,
    input_fields:
      `name = input("Jméno: ").strip()\n` +
      `date = input("Datum (YYYY-MM-DD): ").strip()\n` +
      `arrival = input("Příchod (HH:MM): ").strip()\n` +
      `departure = input("Odchod (HH:MM): ").strip()\n`,
    insert:
      `conn.execute(\n` +
      `    "INSERT INTO reservations (name, date, arrival, departure) VALUES (?, ?, ?, ?);",\n` +
      `    (name, date, arrival, departure)\n` +
      `)\n`,
    commit2: `conn.commit()\n`,
    select:
      `rows = conn.execute("""\n` +
      `    SELECT id, name, date, arrival, departure\n` +
      `    FROM reservations\n` +
      `    ORDER BY date ASC, arrival ASC;\n` +
      `""").fetchall()\n`,
    close: `conn.close()\n`,
    print_rows:
      `print("\\n--- Rezervace v databázi ---")\n` +
      `for (rid, name, date, arrival, departure) in rows:\n` +
      `    print(f"#{rid} | {name} | {date} | {arrival}-{departure}")\n`,
    print_after:
      `print("\\nDB exists AFTER:", DB_FILE.exists())\n` +
      `input("ENTER pro ukončení...")\n`,
  };

  function buildLinearCode(order) {
    // Vytvoří kompletní skript včetně __main__ bloku
    const head = SNIPPETS.imports + "\n" + SNIPPETS.dbfile + "\n";
    const bodyOrder = order.filter((k) => k !== "imports" && k !== "dbfile");
    const body = bodyOrder.map((k) => SNIPPETS[k] || "").join("\n");
    return (
      head +
      `\nif __name__ == "__main__":\n` +
      body
        .split("\n")
        .map((line) => (line.trim() === "" ? "" : "    " + line))
        .join("\n") +
      "\n"
    );
  }

  document.querySelectorAll(".blockgame").forEach((root) => {
    const target = (root.getAttribute("data-target") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const stackEl = root.querySelector("[data-bg-stack]");
    const statusEl = root.querySelector("[data-bg-status]");
    const revealEl = root.querySelector("[data-bg-reveal]");
    const codeEl = root.querySelector("#code-res-linear code");

    let current = [];

    function render() {
      stackEl.innerHTML = "";
      current.forEach((key, idx) => {
        const li = document.createElement("li");
        li.className = "blockgame__item";
        li.textContent = `${idx + 1}. ${key}`;
        stackEl.appendChild(li);
      });

      const ok = current.join(",") === target.join(",");
      if (ok) {
        statusEl.textContent = "✅ Správně! Teď se odhalil celý kód.";
        revealEl.hidden = false;
        codeEl.textContent = buildLinearCode(current);
      } else {
        statusEl.textContent = "Skládej bloky. Až bude pořadí správně, objeví se kód.";
        revealEl.hidden = true;
        codeEl.textContent = "";
      }
    }

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-block]");
      if (btn) {
        const key = btn.getAttribute("data-block");
        current.push(key);
        render();
        return;
      }

      const undo = e.target.closest("[data-bg-undo]");
      if (undo) {
        current.pop();
        render();
        return;
      }

      const reset = e.target.closest("[data-bg-reset]");
      if (reset) {
        current = [];
        render();
        return;
      }
    });

    render();
  });
})();