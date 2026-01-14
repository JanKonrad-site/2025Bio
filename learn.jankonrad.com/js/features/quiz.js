/* =========================
   QUIZ: vyhodnocení testů
   - kompatibilní s onclick="checkAnswer(this, true/false)"
   ========================= */
(() => {
  "use strict";

  // Najde "správné" tlačítko podle inline onclick (bez úprav HTML)
  function isCorrectButtonByOnclick(btn) {
    const onclick = btn.getAttribute("onclick") || "";
    return /checkAnswer\(\s*this\s*,\s*true\s*\)/.test(onclick);
  }

  function ensureQuizStatus(quizEl) {
    let status = quizEl.querySelector(".quiz-status");
    if (!status) {
      status = document.createElement("div");
      status.className = "quiz-status note note--info";
      status.innerHTML =
        '<strong>Skóre:</strong> <span class="quiz-score">0</span> / <span class="quiz-total">0</span>' +
        ' &nbsp;•&nbsp; <strong>Zodpovězeno:</strong> <span class="quiz-answered">0</span> / <span class="quiz-total2">0</span>';

      const heading = quizEl.querySelector("h4, h3, .card__title");
      if (heading) heading.insertAdjacentElement("afterend", status);
      else quizEl.insertBefore(status, quizEl.firstChild);
    }
    return status;
  }

  function updateQuizStatus(quizEl) {
    if (!quizEl) return;

    const questions = Array.from(quizEl.querySelectorAll(".quiz-question"));
    const total = questions.length;
    const answered = questions.filter(q => q.dataset.answered === "true").length;
    const score = questions.filter(q => q.dataset.correct === "true").length;

    const status = ensureQuizStatus(quizEl);
    status.querySelector(".quiz-score").textContent = String(score);
    status.querySelector(".quiz-total").textContent = String(total);
    status.querySelector(".quiz-answered").textContent = String(answered);
    status.querySelector(".quiz-total2").textContent = String(total);

    // finální hláška po dokončení
    let final = quizEl.querySelector(".quiz-final");
    if (answered === total && total > 0) {
      if (!final) {
        final = document.createElement("div");
        final.className = "quiz-final note note--info";
        quizEl.appendChild(final);
      }
      final.innerHTML = `<strong>Hotovo.</strong> Výsledek: ${score} / ${total}`;
      quizEl.dataset.completed = "true";
    }
  }

  // Veřejná funkce používaná v HTML (onclick)
  window.checkAnswer = function checkAnswer(btn, isCorrect) {
    const q = btn.closest(".quiz-question");
    if (!q) return;

    // už jednou zodpovězeno -> ignoruj další klik
    if (q.dataset.answered === "true") return;

    q.dataset.answered = "true";
    q.dataset.correct = isCorrect ? "true" : "false";

    const buttons = Array.from(q.querySelectorAll("button"));
    buttons.forEach(b => (b.disabled = true));

    // označ vybranou odpověď
    btn.classList.add(isCorrect ? "is-correct" : "is-wrong");

    // když je špatně, zvýrazni i správnou
    if (!isCorrect) {
      const correctBtn = buttons.find(isCorrectButtonByOnclick);
      if (correctBtn) correctBtn.classList.add("is-correct");
    }

    // aktualizuj skóre v rámci testu
    const quizEl =
      q.closest("#section-bios-uefi-test") ||
      q.closest("[data-quiz]") ||
      q.closest(".card") ||
      q.parentElement;

    updateQuizStatus(quizEl);
  };

  // Volitelný reset testu (když budeš chtít tlačítko „Reset“)
  window.resetQuiz = function resetQuiz(quizId) {
    const quizEl = document.getElementById(quizId);
    if (!quizEl) return;

    const questions = Array.from(quizEl.querySelectorAll(".quiz-question"));
    questions.forEach(q => {
      q.dataset.answered = "false";
      q.dataset.correct = "";

      const buttons = Array.from(q.querySelectorAll("button"));
      buttons.forEach(b => {
        b.disabled = false;
        b.classList.remove("is-correct", "is-wrong");
      });
    });

    const final = quizEl.querySelector(".quiz-final");
    if (final) final.remove();

    quizEl.dataset.completed = "false";
    updateQuizStatus(quizEl);
  };

  document.addEventListener("DOMContentLoaded", () => {
    // inicializace statusu pro existující test
    const quiz = document.getElementById("section-bios-uefi-test");
    if (quiz) updateQuizStatus(quiz);
  });
  /* =========================
   QUIZ: označení odpovědí + vyhodnocení
   kompatibilní s onclick="checkAnswer(this, true/false)"
   ========================= */
(() => {
  "use strict";

  function isCorrectByOnclick(btn) {
    const onclick = btn.getAttribute("onclick") || "";
    return /checkAnswer\(\s*this\s*,\s*true\s*\)/.test(onclick);
  }

  function markButtons(questionEl, clickedBtn, isCorrect) {
    const buttons = Array.from(questionEl.querySelectorAll("button"));

    // Zamkni otázku
    buttons.forEach(b => (b.disabled = true));

    // Reset tříd (kdyby se něco přepisovalo)
    buttons.forEach(b => {
      b.classList.remove("quiz-btn--correct", "quiz-btn--wrong", "quiz-btn--muted");
    });

    // Označ kliknuté tlačítko
    clickedBtn.classList.add(isCorrect ? "quiz-btn--correct" : "quiz-btn--wrong");

    // Když je špatně, označ i správné tlačítko
    if (!isCorrect) {
      const correctBtn = buttons.find(isCorrectByOnclick);
      if (correctBtn) correctBtn.classList.add("quiz-btn--correct");
    }

    // Vše ostatní utlum
    buttons.forEach(b => {
      const marked = b.classList.contains("quiz-btn--correct") || b.classList.contains("quiz-btn--wrong");
      if (!marked) b.classList.add("quiz-btn--muted");
    });

    // Stav na otázce (pro případné další styly)
    questionEl.classList.add("quiz-question--done");
    questionEl.classList.toggle("quiz-question--ok", !!isCorrect);
    questionEl.classList.toggle("quiz-question--bad", !isCorrect);
  }

  // Veřejná funkce volaná z HTML
  window.checkAnswer = function checkAnswer(btn, isCorrect) {
    const q = btn.closest(".quiz-question");
    if (!q) return;

    // už jednou zodpovězeno -> ignoruj další klik
    if (q.dataset.answered === "true") return;

    q.dataset.answered = "true";
    q.dataset.correct = isCorrect ? "true" : "false";

    markButtons(q, btn, isCorrect);

    // (Volitelné) pokud máš někde sumarizaci skóre, můžeš ji doplnit.
    // Tady záměrně nedělám texty "Správně/Špatně", protože chceš primárně označení.
  };
})();

})();
