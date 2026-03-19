// js/features/code-puzzle.js

function shuffleChildren(container) {
  const items = Array.from(container.children);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.forEach((item) => container.appendChild(item));
}

function setupPuzzle(puzzle) {
  if (!puzzle || puzzle.dataset.puzzleReady === "true") return;

  const itemsWrap = puzzle.querySelector("[data-puzzle-items]");
  const checkBtn = puzzle.querySelector("[data-puzzle-check]");
  const resetBtn = puzzle.querySelector("[data-puzzle-reset]");
  const feedback = puzzle.querySelector("[data-puzzle-feedback]");
  const result = puzzle.querySelector("[data-puzzle-result]");

  if (!itemsWrap) return;

  let selected = null;

  function clearSelection() {
    selected = null;
    itemsWrap.querySelectorAll(".code-puzzle__item").forEach((item) => {
      item.classList.remove("is-selected");
    });
  }

  function resetPuzzle() {
    shuffleChildren(itemsWrap);
    clearSelection();
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.remove("is-ok", "is-bad");
    }
    if (result) result.hidden = true;
  }

  itemsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".code-puzzle__item");
    if (!btn) return;

    if (!selected) {
      selected = btn;
      btn.classList.add("is-selected");
      return;
    }

    if (selected === btn) {
      btn.classList.remove("is-selected");
      selected = null;
      return;
    }

    const all = Array.from(itemsWrap.children);
    const a = all.indexOf(selected);
    const b = all.indexOf(btn);

    if (a < b) {
      itemsWrap.insertBefore(btn, selected);
    } else {
      itemsWrap.insertBefore(selected, btn);
    }

    clearSelection();
  });

  checkBtn?.addEventListener("click", () => {
    const current = Array.from(itemsWrap.children).map((el) => Number(el.dataset.step));
    const correct = [...current].sort((a, b) => a - b);
    const isCorrect = current.every((value, index) => value === correct[index]);

    if (feedback) {
      feedback.classList.remove("is-ok", "is-bad");
    }

    if (isCorrect) {
      if (feedback) {
        feedback.textContent = "Správně. Tohle je logické pořadí programu.";
        feedback.classList.add("is-ok");
      }
      if (result) result.hidden = false;
    } else {
      if (feedback) {
        feedback.textContent = "Ještě ne. Zkus si říct, co musí proběhnout dřív a co až potom.";
        feedback.classList.add("is-bad");
      }
      if (result) result.hidden = true;
    }
  });

  resetBtn?.addEventListener("click", resetPuzzle);

  resetPuzzle();
  puzzle.dataset.puzzleReady = "true";
}

export function initCodePuzzles() {
  document.querySelectorAll(".code-puzzle").forEach(setupPuzzle);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        if (node.matches?.(".code-puzzle")) {
          setupPuzzle(node);
        }

        node.querySelectorAll?.(".code-puzzle").forEach(setupPuzzle);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.info("[code-puzzle] ready");
}