
  // Select DOM Elements
const gameBoard = document.querySelector('.game-board');
const statusMessage = document.querySelector('.turn-indicator');
const playAgainBtn = document.querySelector('.btn-play');
const newBtn = document.querySelector('.btn-new');
const tryAgainBtn = document.querySelector('.btn-try');
const aiScoreSpan = document.querySelector('.ai-score');
const humanScoreSpan = document.querySelector('.human-score');
const aiOptions = document.querySelector('.ai-options');
const humanOptions = document.querySelector('.human-options');
const aiEmoji = document.querySelector('.ai-emoji');
const humanEmoji = document.querySelector('.human-emoji');

// ================= Emoji Fallback on Window Load ===================
window.onload = function () {
  // Emoji fallback: अगर primary emoji दिख नहीं रहा, तो backup दिखाओ
  document.querySelectorAll('.emoji.primary').forEach(function (primaryEmoji) {
    const backupEmoji = primaryEmoji.nextElementSibling;
    if (primaryEmoji.offsetWidth === 0 || primaryEmoji.offsetHeight === 0) {
      backupEmoji.style.display = 'inline';
      primaryEmoji.style.display = 'none';
    }
  });

  applySavedAILevel();
  initGame();
};

// ==================== Toggle Dropdowns ============================
function toggleAIOptions() {
  aiOptions.classList.toggle('hidden');
  humanOptions.classList.add('hidden');
}

function toggleHumanOptions() {
  humanOptions.classList.toggle('hidden');
  aiOptions.classList.add('hidden');
}

// =================== Set Human Emoji ===============================
function setHumanEmoji(primaryEmoji, backupEmoji, name) {
  if (humanEmoji) {
    const primary = humanEmoji.querySelector('.emoji.primary');
    const backup = humanEmoji.querySelector('.emoji.backup');
    const label = humanEmoji.querySelector('.emoji-name');

    if (primary) primary.textContent = primaryEmoji;
    if (backup) backup.textContent = backupEmoji;
    if (label) label.textContent = name;
  }
  humanOptions.classList.add('hidden');
}

// =================== Set AI Level and Save to localStorage ==========
function setAILevel(emoji, level) {
  localStorage.setItem('selectedGameLevel', level);
  updateAIEmoji(level);
  aiOptions.classList.add('hidden');
  console.log("AI Level set to:", level);

  gameLevel = level;  // Update gameLevel variable for AI moves
  initGame();         // Restart game on level change
}

// =================== Load Saved AI Level from localStorage ==========
function applySavedAILevel() {
  const savedLevel = localStorage.getItem('selectedGameLevel');
  if (savedLevel) {
    updateAIEmoji(savedLevel);
    gameLevel = savedLevel;
  } else {
    updateAIEmoji(gameLevel);
  }
}

// =================== Update AI Emoji Display =========================
function updateAIEmoji(level) {
  let emojiPrimary = '🤖', emojiBackup = '💻';

  switch (level) {
    case 'Easy':
      emojiPrimary = '🤖'; emojiBackup = '💻';
      break;
    case 'Medium':
      emojiPrimary = '🔰'; emojiBackup = '💡';
      break;
    case 'Hard':
      emojiPrimary = '⚙️'; emojiBackup = '⛭';
      break;
    case 'God':
      emojiPrimary = '👽'; emojiBackup = '★';
      break;
  }

  if (aiEmoji) {
    const primary = aiEmoji.querySelector('.emoji.primary');
    const backup = aiEmoji.querySelector('.emoji.backup');
    const label = aiEmoji.querySelector('.emoji-name');

    if (primary) primary.textContent = emojiPrimary;
    if (backup) backup.textContent = emojiBackup;
    if (label) label.textContent = level;
  }
}

// ==================== Device Vibrate on Interaction ===================
function vibrateDevice() {
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

// ==================== Game Logic Variables ===========================
let board = [];
let boardSize = parseInt(localStorage.getItem('selectedBoardSize')) || 3;
let gameLevel = localStorage.getItem('gameLevel') || 'Hard';

let currentPlayer = 'X';
let gameOver = false;
let winCount = 0;
let lossCount = 0;


// =================== Game Initialization ===========================
function createBoard(size, withClick = false) {
  board = Array(size * size).fill(null);
  gameBoard.innerHTML = '';
  gameBoard.style.display = 'grid';
  gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gameBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', i);
    if (withClick) {
      cell.addEventListener('click', handleCellClick);
    }
    gameBoard.appendChild(cell);
  }
}

function updateScoreboard() {
  humanScoreSpan.textContent = winCount;
  aiScoreSpan.textContent = lossCount;
}

function initGame() {
  boardSize = parseInt(localStorage.getItem('selectedBoardSize')) || 3;
  gameLevel = localStorage.getItem('gameLevel') || 'Hard';
  currentPlayer = 'X';
  gameOver = false;
  statusMessage.textContent = 'Your Turn';

  createBoard(boardSize, true);

  playAgainBtn.style.display = 'none';
  tryAgainBtn.style.display = 'none';
}

// ==================== Game Flow ===========================
createBoard(boardSize); // Initial board render

function handleCellClick(e) {
  vibrateDevice();
  const index = e.target.getAttribute('data-index');
  if (gameOver || board[index]) return;

  makeMove(index, currentPlayer);

  if (!gameOver) {
    statusMessage.textContent = 'AI is thinking...';
    setTimeout(() => aiMove(), 300);
  }
}

function makeMove(index, player) {
  if (!board[index]) {
    board[index] = player;
    const cell = gameBoard.querySelector(`[data-index='${index}']`);
    cell.textContent = player;

    if (checkWin(board, player)) {
      gameOver = true;
      highlightWin(player);
      if (player === 'X') {
        winCount++;
        statusMessage.textContent = 'You win!';
        playAgainBtn.style.display = 'block';
      } else {
        lossCount++;
        statusMessage.textContent = 'AI wins!';
        tryAgainBtn.style.display = 'block';
      }
      updateScoreboard();
    } else if (board.every(cell => cell !== null)) {
      gameOver = true;
      statusMessage.textContent = 'Draw!';
      playAgainBtn.style.display = 'block';
    } else {
      currentPlayer = (player === 'X') ? 'O' : 'X';
      statusMessage.textContent = (currentPlayer === 'X') ? 'Your Turn' : 'AI is thinking...';
    }
  }
}

function checkWin(board, player) {
  const winLines = generateWinLines(boardSize);
  return winLines.some(line => line.every(i => board[i] === player));
}

function highlightWin(player) {
  const winLines = generateWinLines(boardSize);
  winLines.forEach(line => {
    if (line.every(i => board[i] === player)) {
      line.forEach(i => {
        const cell = gameBoard.querySelector(`[data-index='${i}']`);
        cell.classList.add(player === 'X' ? 'win-player' : 'win-ai');
      });
    }
  });
}

function aiMove() {
  let index;
  try {
    if (gameLevel === 'Easy') {
      index = randomMove();
    } else if (gameLevel === 'Medium') {
      index = (Math.random() < 0.5) ? randomMove() : bestMove();
    } else if (gameLevel === 'Hard') {
      index = (Math.random() < 0.8) ? bestMove() : randomMove();
    } else if (gameLevel === 'God') {
      index = (Math.random() < 0.95) ? bestMove() : randomMove();
    }

    if (index !== null) {
      makeMove(index, 'O');
    }
  } catch (error) {
    console.error("AI move error:", error);
  }
}

function randomMove() {
  const available = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
  return available.length ? available[Math.floor(Math.random() * available.length)] : null;
}

function bestMove() {
  let bestScore = -Infinity;
  let move = null;
  const depthLimit = getDepthLimit();

  board.forEach((cell, index) => {
    if (cell === null) {
      board[index] = 'O';
      const score = minimax(board, 0, false, depthLimit);
      board[index] = null;
      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });
  return move;
}

function minimax(newBoard, depth, isMaximizing, depthLimit) {
  if (checkWin(newBoard, 'O')) return 10 - depth;
  if (checkWin(newBoard, 'X')) return depth - 10;
  if (newBoard.every(c => c !== null) || depth >= depthLimit) return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (let i = 0; i < newBoard.length; i++) {
    if (newBoard[i] === null) {
      newBoard[i] = isMaximizing ? 'O' : 'X';
      const score = minimax(newBoard, depth + 1, !isMaximizing, depthLimit);
      newBoard[i] = null;
      bestScore = isMaximizing
        ? Math.max(score, bestScore)
        : Math.min(score, bestScore);
    }
  }

  return bestScore;
}

function getDepthLimit() {
  if (boardSize === 3) {
    switch (gameLevel) {
      case 'Easy': return 2;
      case 'Medium': return 3;
      case 'Hard': return 5;
      case 'God': return 7; // full depth
      default: return 5;
    }
  } else if (boardSize === 4) {
    switch (gameLevel) {
      case 'Easy': return 2;
      case 'Medium': return 3;
      case 'Hard': return 4;
      case 'God': return 6;
      default: return 4;
    }
  } else if (boardSize === 5) {
    switch (gameLevel) {
      case 'Easy': return 1;
      case 'Medium': return 2;
      case 'Hard': return 3;
      case 'God': return 4;
      default: return 3;
    }
  } else {
    return 3; // default fallback
  }
}

// Generate winning combinations dynamically
function generateWinLines(size) {
  const lines = [];

  // Rows
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push(r * size + c);
    }
    lines.push(row);
  }

  // Columns
  for (let c = 0; c < size; c++) {
    const col = [];
    for (let r = 0; r < size; r++) {
      col.push(r * size + c);
    }
    lines.push(col);
  }

  // Diagonal \
  const diag1 = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
  }
  lines.push(diag1);

  // Diagonal /
  const diag2 = [];
  for (let i = 0; i < size; i++) {
    diag2.push((i + 1) * (size - 1));
  }
  lines.push(diag2);

  return lines;
}

// Button events
playAgainBtn.addEventListener('click', () => { vibrateDevice(); initGame(); });
tryAgainBtn.addEventListener('click', () => { vibrateDevice(); initGame(); });

// Start the game
initGame();
