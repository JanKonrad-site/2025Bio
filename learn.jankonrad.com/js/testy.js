 function checkAnswer(button, correct) {
    if (correct) {
      button.classList.remove("btn-outline-secondary");
      button.classList.add("btn-success");
    } else {
      button.classList.remove("btn-outline-secondary");
      button.classList.add("btn-danger");
    }
    button.disabled = true;
    let siblings = button.parentElement.querySelectorAll("button");
    siblings.forEach(b => b.disabled = true);
  }
  