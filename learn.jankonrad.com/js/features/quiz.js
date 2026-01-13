/* /assets/js/features/quiz.js */
export function initQuiz() {
  // kompatibilita: původní HTML může volat checkAnswer("q1","b")
  window.checkAnswer = function checkAnswer(questionId, correctAnswer) {
    const selected = document.querySelector(`input[name="${CSS.escape(questionId)}"]:checked`);
    const resultEl = document.getElementById(`${questionId}-result`) || document.getElementById("result");

    if (!selected) {
      if (resultEl) resultEl.innerText = "Vyber odpověď.";
      return false;
    }

    const ok = selected.value === correctAnswer;
    if (resultEl) resultEl.innerText = ok ? "Správně." : "Špatně.";
    return ok;
  };
}
