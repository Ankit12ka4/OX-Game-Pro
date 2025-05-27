document.addEventListener("DOMContentLoaded", function () {
  // Redirect function
  const redirectPage = (targetPage) => {
    window.location.href = targetPage;
  };

  // Generic selection handler
  function handleSelection(buttons, storageKey, applyClass = true) {
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        if (applyClass) {
          buttons.forEach(btn => btn.classList.remove('selected'));
          button.classList.add('selected');
        }
        localStorage.setItem(storageKey, button.textContent.trim());
      });
    });
  }

  // Load saved selection only where class needs to be shown
  function loadSavedSelection(buttons, storageKey) {
    const savedValue = localStorage.getItem(storageKey);
    if (savedValue) {
      const selectedButton = Array.from(buttons).find(
        btn => btn.textContent.trim() === savedValue
      );
      if (selectedButton) {
        selectedButton.classList.add('selected');
      }
    }
  }

  // Board Size Buttons - show selected class
  const boardButtons = document.querySelectorAll('.board-size');
  handleSelection(boardButtons, 'selectedBoardSize', true);
  loadSavedSelection(boardButtons, 'selectedBoardSize');

  // Game Mode Buttons - save value only and redirect accordingly
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(button => {
    button.addEventListener("click", function () {
      const gameMode = button.textContent.trim();
      localStorage.setItem("selectedGameMode", gameMode);

      if (gameMode === "👤 VS 🤖" || gameMode === "👤 VS 👤") {
        redirectPage("game.html");
      } else if (gameMode === "Online Play") {
        redirectPage("online.html");
      }
    });
  });
});
