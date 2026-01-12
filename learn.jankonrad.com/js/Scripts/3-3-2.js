
  function checkAnswer(button, isCorrect) {
    const q = button.closest(".quiz-question");
    if (!q) return;

    const answers = q.querySelectorAll(".btn-group-vertical .btn");
    answers.forEach(b => {
      b.disabled = true;
      b.classList.remove("btn-success", "btn-danger");
      b.classList.add("btn-outline-secondary");
    });

    button.classList.remove("btn-outline-secondary");
    button.classList.add(isCorrect ? "btn-success" : "btn-danger");

    // zvýrazni správnou odpověď (pokud uživatel klikl špatně)
    if (!isCorrect) {
      const correctBtn = Array.from(answers).find(b => b.getAttribute("onclick")?.includes("true"));
      if (correctBtn) {
        correctBtn.classList.remove("btn-outline-secondary");
        correctBtn.classList.add("btn-success");
      }
    }

    const feedback = q.querySelector(".quiz-feedback");
    const explain = q.getAttribute("data-explain") || "";

    if (feedback) {
      feedback.innerHTML = isCorrect
        ? `<span class="text-success fw-semibold">Správně.</span> ${explain ? " " + explain : ""}`
        : `<span class="text-danger fw-semibold">Špatně.</span> ${explain ? " " + explain : ""}`;
    }

    // volitelné tlačítko „Vysvětlit podrobněji“ (jen pokud existuje)
    const moreBtn = q.querySelector(".quiz-more");
    if (moreBtn) moreBtn.classList.remove("d-none");
  }

   function resetQuiz(target) {
    // target = buď DOM tlačítko (this), nebo string id
    let wrap = null;

    if (typeof target === "string") {
      const id = target.startsWith("#") ? target.slice(1) : target;
      wrap = document.getElementById(id) || document.querySelector(target);
    } else if (target && target.closest) {
      // najdi nejbližší blok kvízu (funguje v accordionu i mimo)
      wrap =
        target.closest(".accordion-collapse") ||
        target.closest(".accordion-body") ||
        target.closest(".quiz-wrap") ||
        target.closest("section") ||
        document;
    }

    if (!wrap) return;

    wrap.querySelectorAll(".quiz-question").forEach(q => {
      const answers = q.querySelectorAll(".btn-group-vertical .btn");
      answers.forEach(b => {
        b.disabled = false;
        b.classList.remove("btn-success", "btn-danger");
        b.classList.add("btn-outline-secondary");
      });

      const feedback = q.querySelector(".quiz-feedback");
      if (feedback) feedback.textContent = "";

      const moreBtn = q.querySelector(".quiz-more");
      if (moreBtn) moreBtn.classList.add("d-none");
    });
  }

