document.addEventListener("DOMContentLoaded", () => {
    const modeSelect = document.getElementById("modeSelect");
    const startBtn = document.getElementById("startBtn");
    const gameContainer = document.getElementById("gameContainer");
    const statusMessage = document.getElementById("statusMessage");
    const restartBtn = document.getElementById("restartBtn");
    const leaderboardList = document.getElementById("leaderboardList");

    let board = [];
    let boardSize = 3;
    let winCondition = 3;
    let currentPlayer = "X";
    let gameActive = false;
    let lastWinner = null;

    // leaderboard को localStorage से लोड करें; यदि उपलब्ध न हो तो खाली array
    let leaderboard = JSON.parse(localStorage.getItem("oxLeaderboard")) || [];

    startBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", startGame);

    function startGame() {
        const mode = modeSelect.value;
        if (mode === "God") {
            boardSize = 7;
            winCondition = 7;
        } else {
            boardSize = parseInt(mode);
            winCondition = parseInt(mode);
        }
        board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(""));
        currentPlayer = lastWinner ? lastWinner : "X";
        gameActive = true;
        statusMessage.textContent = "Your Turn: " + currentPlayer;
        restartBtn.style.display = "none";
        renderBoard();
    }

    function renderBoard() {
        gameContainer.innerHTML = "";
        gameContainer.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = "";
                cell.addEventListener("click", handleCellClick);
                gameContainer.appendChild(cell);
            }
        }
    }

    function handleCellClick(e) {
        if (!gameActive) return;
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        if (board[row][col] !== "") return;
        board[row][col] = currentPlayer;
        e.target.textContent = currentPlayer;
        e.target.setAttribute("data-value", currentPlayer);
        e.target.classList.add("flip");
        setTimeout(() => {
            e.target.classList.remove("flip");
        }, 500);
        
        if (checkWin(row, col)) {
            statusMessage.textContent = currentPlayer + " wins!";
            gameActive = false;
            lastWinner = currentPlayer;
            restartBtn.style.display = "block";
            if (modeSelect.value === "God") {
                showCelebration();
                let playerName = prompt("Congratulations! You've won at God Level. Please enter your name for the leaderboard:");
                if (playerName && playerName.trim() !== "") {
                    updateLeaderboard(playerName.trim());
                }
            }
            return;
        } else if (isBoardFull()) {
            statusMessage.textContent = "It's a draw!";
            gameActive = false;
            restartBtn.style.display = "block";
            return;
        }
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusMessage.textContent = "Your Turn: " + currentPlayer;
    }

    function isBoardFull() {
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (board[r][c] === "") return false;
            }
        }
        return true;
    }

    function checkWin(row, col) {
        const player = board[row][col];
        return (countConsecutive(row, col, 0, 1, player) + countConsecutive(row, col, 0, -1, player) - 1 >= winCondition) ||
               (countConsecutive(row, col, 1, 0, player) + countConsecutive(row, col, -1, 0, player) - 1 >= winCondition) ||
               (countConsecutive(row, col, 1, 1, player) + countConsecutive(row, col, -1, -1, player) - 1 >= winCondition) ||
               (countConsecutive(row, col, 1, -1, player) + countConsecutive(row, col, -1, 1, player) - 1 >= winCondition);
    }

    function countConsecutive(row, col, rowDir, colDir, player) {
        let count = 0;
        let r = row, c = col;
        while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            count++;
            r += rowDir;
            c += colDir;
        }
        return count;
    }

    function updateLeaderboard(name) {
        let found = leaderboard.find(item => item.name.toLowerCase() === name.toLowerCase());
        if (found) {
            found.wins++;
        } else {
            leaderboard.push({ name: name, wins: 1 });
        }
        leaderboard.sort((a, b) => b.wins - a.wins);
        localStorage.setItem("oxLeaderboard", JSON.stringify(leaderboard));
        renderLeaderboard();
    }

    function renderLeaderboard() {
        leaderboardList.innerHTML = "";
        leaderboard.forEach(entry => {
            let li = document.createElement("li");
            li.textContent = entry.name + " - Wins: " + entry.wins;
            leaderboardList.appendChild(li);
        });
    }

    function showCelebration() {
        let celebration = document.createElement("div");
        celebration.className = "celebration";
        celebration.textContent = "👏👏👏 Congratulations! 👏👏👏";
        document.body.appendChild(celebration);
        setTimeout(() => {
            celebration.remove();
        }, 3000);
    }

    renderLeaderboard();
    startGame();
});