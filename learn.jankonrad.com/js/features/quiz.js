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
   QUIZ: označení odpovědí + vyhodnocení + "Vysvětlit podrobněji"
   kompatibilní s onclick="checkAnswer(this, true/false)"
   ========================= */
(() => {
  "use strict";

  // Najde "správné" tlačítko podle inline onclick (bez úprav HTML)
  function isCorrectButtonByOnclick(btn) {
    const onclick = btn.getAttribute("onclick") || "";
    return /checkAnswer\(\s*this\s*,\s*true\s*\)/.test(onclick);
  }

  function getQuizRootFromQuestion(q) {
    // primárně tvůj wrapper
    return (
      q.closest(".quiz-wrap") ||
      q.closest("[data-quiz]") ||
      q.closest(".card") ||
      q.parentElement
    );
  }

  function ensureQuizStatus(quizEl) {
    let status = quizEl.querySelector(".quiz-status");
    if (!status) {
      status = document.createElement("div");
      status.className = "quiz-status note note--info";
      status.innerHTML =
        '<strong>Skóre:</strong> <span class="quiz-score">0</span> / <span class="quiz-total">0</span>' +
        ' &nbsp;•&nbsp; <strong>Zodpovězeno:</strong> <span class="quiz-answered">0</span> / <span class="quiz-total2">0</span>';

      // vlož na začátek kvízu
      quizEl.insertBefore(status, quizEl.firstChild);
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
    } else {
      if (final) final.remove();
      quizEl.dataset.completed = "false";
    }
  }

  function markButtons(questionEl, clickedBtn, isCorrect) {
    // beru jen odpovědní tlačítka (ne "Vysvětlit..." a ne reset)
    const buttons = Array.from(questionEl.querySelectorAll(".btn-group-vertical button"));

    // Zamkni otázku
    buttons.forEach(b => (b.disabled = true));

    // Reset tříd (pro jistotu)
    buttons.forEach(b => {
      b.classList.remove(
        "is-correct", "is-wrong", "is-muted",
        "quiz-btn--correct", "quiz-btn--wrong", "quiz-btn--muted"
      );
    });

    // Označ kliknuté
    if (isCorrect) {
      clickedBtn.classList.add("is-correct", "quiz-btn--correct");
    } else {
      clickedBtn.classList.add("is-wrong", "quiz-btn--wrong");
    }

    // Když je špatně, zvýrazni i správné tlačítko
    if (!isCorrect) {
      const correctBtn = buttons.find(isCorrectButtonByOnclick);
      if (correctBtn) correctBtn.classList.add("is-correct", "quiz-btn--correct");
    }

    // Ostatní utlum
    buttons.forEach(b => {
      const marked =
        b.classList.contains("is-correct") ||
        b.classList.contains("is-wrong") ||
        b.classList.contains("quiz-btn--correct") ||
        b.classList.contains("quiz-btn--wrong");

      if (!marked) b.classList.add("is-muted", "quiz-btn--muted");
    });

    // Stav na otázce (volitelné styly)
    questionEl.classList.add("quiz-question--done");
    questionEl.classList.toggle("quiz-question--ok", !!isCorrect);
    questionEl.classList.toggle("quiz-question--bad", !isCorrect);
  }

  function showExplainAndMore(questionEl) {
    // 1) krátké vysvětlení do .quiz-feedback
    const explain = questionEl.getAttribute("data-explain") || "";
    const feedback = questionEl.querySelector(".quiz-feedback");
    if (feedback) feedback.innerHTML = explain;

    // 2) zobraz tlačítko "Vysvětlit podrobněji" až po zodpovězení
    const moreBtn = questionEl.querySelector(".quiz-more");
    if (moreBtn) moreBtn.classList.remove("d-none");
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
    showExplainAndMore(q);

    // update skóre pro celý kvíz
    const quizEl = getQuizRootFromQuestion(q);
    updateQuizStatus(quizEl);
  };

  // Reset konkrétního kvízu podle id
  window.resetQuiz = function resetQuiz(quizId) {
    const quizEl = document.getElementById(quizId);
    if (!quizEl) return;

    const questions = Array.from(quizEl.querySelectorAll(".quiz-question"));
    questions.forEach(q => {
      q.dataset.answered = "false";
      q.dataset.correct = "";

      // odemkni a vyčisti jen odpovědní tlačítka
      const buttons = Array.from(q.querySelectorAll(".btn-group-vertical button"));
      buttons.forEach(b => {
        b.disabled = false;
        b.classList.remove(
          "is-correct", "is-wrong", "is-muted",
          "quiz-btn--correct", "quiz-btn--wrong", "quiz-btn--muted"
        );
      });

      // smaž feedback
      const feedback = q.querySelector(".quiz-feedback");
      if (feedback) feedback.innerHTML = "";

      // schovej "Vysvětlit podrobněji"
      const moreBtn = q.querySelector(".quiz-more");
      if (moreBtn) moreBtn.classList.add("d-none");

      // reset stavových tříd otázky
      q.classList.remove("quiz-question--done", "quiz-question--ok", "quiz-question--bad");
    });

    // smaž finální hlášku
    const final = quizEl.querySelector(".quiz-final");
    if (final) final.remove();

    quizEl.dataset.completed = "false";
    updateQuizStatus(quizEl);
  };

  // Inicializace skóre pro všechny kvízy na stránce
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".quiz-wrap").forEach(updateQuizStatus);
  });
})();
})();
