
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


document.querySelectorAll('.cell').forEach(cell => {
  cell.style.margin = cellSpacing;
  cell.style.width = cellSize;
  cell.style.height = cellSize;
});

// =================== New Game Button Logic ===================
newBtn.addEventListener('click', () => {
  winCount = 0;
  lossCount = 0;
  updateScoreboard();
  localStorage.removeItem('selectedBoardSize');
  localStorage.removeItem('gameLevel');
  applySavedAILevel(); // यह लाइन AI emoji व level update के लिए है
  initGame();
});


// Ensure DOM is loaded before attaching listeners
window.addEventListener('DOMContentLoaded', () => {
  const hintBtn = document.getElementById('hint-btn');
  hintBtn.addEventListener('click', showHint);



  function showHint() {
    if (gameOver) return;

    if (!['Easy', 'Medium', 'Hard'].includes(gameLevel)) {
      statusMessage.textContent = "Hint is not available at this level.";
      return;
    }

    const emptyCells = board
      .map((val, idx) => val === null ? idx : null)
      .filter(idx => idx !== null);

    if (emptyCells.length === 0) return;

    for (let idx of emptyCells) {
      board[idx] = 'X';
      if (checkWin(board, 'X')) {
        board[idx] = null;
        highlightHintCell(idx);
        statusMessage.textContent = "Opponent could win here! Block it!";
        return;
      }
      board[idx] = null;
    }

    for (let idx of emptyCells) {
      board[idx] = 'O';
      if (checkWin(board, 'O')) {
        board[idx] = null;
        highlightHintCell(idx);
        statusMessage.textContent = "Try this move to win!";
        return;
      }
      board[idx] = null;
    }

    const randomHintIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    highlightHintCell(randomHintIndex);
    statusMessage.textContent = "Here's a hint!";
  }

  function highlightHintCell(index) {
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('hint-highlight');
    });

    const hintCell = document.querySelector(`.cell[data-index='${index}']`);
    if (hintCell) {
      hintCell.classList.add('hint-highlight');

      // Remove highlight after 3 seconds
      setTimeout(() => {
        hintCell.classList.remove('hint-highlight');
      }, 3000);
    }
  }
});


//AI thinking ke liye variable
let aiThinkingInterval = null;
let currentThinkingIndex = 0;

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

let thinkingCells = [];
let moveHistory = [];
let lastPlayerMoveIndex = null;
let lastAIMoveIndex = null;

let isGameOver = false;
// =================== Game Initialization ===========================
function createBoard(size, withClick = false) {
   board = Array(size * size).fill(null);
  const gameBoard = document.querySelector('.game-board');

  // Clear previous content
  gameBoard.innerHTML = '';

  // Remove previous board size classes
  gameBoard.classList.remove('board-3x3', 'board-5x5', 'board-7x7', 'board-default');

  // Add appropriate board size class
  if (size === 3) {
    gameBoard.classList.add('board-3x3');
  } else if (size === 5) {
    gameBoard.classList.add('board-5x5');
  } else if (size === 7) {
    gameBoard.classList.add('board-7x7');
  } else {
    gameBoard.classList.add('board-default');
  }

  // Setup grid
  gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gameBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  // Create cells
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', i);

    if (withClick) {
      cell.addEventListener('click', handleCellClick);
    }

    gameBoard.appendChild(cell);
  }

  return board;
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

  removeWinLine();

  // बोर्ड बनाएगा और सेल के साइज़/मार्जिन भी ठीक करेगा
  board = 
  createBoard(boardSize, true);

  moveHistory = [];
  lastPlayerMoveIndex = null;
  lastAIMoveIndex = null;

  playAgainBtn.style.display = 'none';
  tryAgainBtn.style.display = 'none';
  updateScoreboard();
}


// ==================== Game Flow ===========================
createBoard(boardSize, true); // Initial board render

function handleCellClick(e) {
  document.querySelectorAll('.cell').forEach(cell => {
  cell.classList.remove('hint-highlight');
});
  vibrateDevice();
  const index = e.target.getAttribute('data-index');
  if (gameOver || board[index]) return;

  makeMove(index, currentPlayer);

  if (!gameOver) {
    statusMessage.textContent = 'AI is thinking...';
    startAIThinkingAnimation();

    setTimeout(() => {
      stopAIThinkingAnimation();
      aiMove();
    }, 300);
  }
}


function setFontSizeBasedOnCell(cell) {
  const height = cell.clientHeight;
  // font-size को cell height का 70% रखो
  cell.style.fontSize = (height * 0.7) + 'px';
}

// ==================== Make Move Function ===================
function makeMove(index, player) {
  if (!board[index]) {
    board[index] = player;

    const cell = gameBoard.querySelector(`[data-index='${index}']`);
    cell.textContent = player;

    // यहाँ dynamic font size सेट कर रहे हैं
    setFontSizeBasedOnCell(cell);

    // X और O के लिए रंगीन क्लास जोड़ना
    if (player === 'X') {
      cell.classList.add('x');
      cell.classList.remove('o');
    } else {
      cell.classList.add('o');
      cell.classList.remove('x');
    }

    if (player === 'O') {
      // AI move पर vibrate animation
      cell.classList.add('ai-move-vibrate');
      setTimeout(() => {
        cell.classList.remove('ai-move-vibrate');
      }, 300);
    }

    // Move history में जोड़ो
    moveHistory.push({ index, player });

    // Track last move
    if (player === 'X') {
      lastPlayerMoveIndex = index;
    } else {
      lastAIMoveIndex = index;
    }

    // Highlight last move
    highlightLastMove(player === 'X' ? 'player' : 'ai');

    // Check for Win
    if (checkWin(board, player)) {
      gameOver = true;

      const winningLine = getWinningLine(board, player);
      drawWinLine(winningLine);
      highlightWin(player);

      // आखिरी move highlights हटा दो
      lastPlayerMoveIndex = null;
      lastAIMoveIndex = null;
      highlightLastMove();

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
    }

    // Check for Draw
    else if (board.every(cell => cell !== null)) {
      gameOver = true;
      statusMessage.textContent = 'Draw!';
      playAgainBtn.style.display = 'block';

      // Highlights reset करो
      lastPlayerMoveIndex = null;
      lastAIMoveIndex = null;
      highlightLastMove();
    }

    // Switch turn
    else {
      currentPlayer = (player === 'X') ? 'O' : 'X';
      statusMessage.textContent = (currentPlayer === 'X') ? 'Your Turn' : 'AI is thinking...';
    }
  }
}

// ==================== Highlight Last Move ===================
function highlightLastMove(byWhom) {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('last-move-player', 'last-move-ai');
  });

  if (byWhom === 'player' && lastPlayerMoveIndex !== null) {
    const cell = document.querySelector(`.cell[data-index='${lastPlayerMoveIndex}']`);
    if (cell) cell.classList.add('last-move-player');
  } else if (byWhom === 'ai' && lastAIMoveIndex !== null) {
    const cell = document.querySelector(`.cell[data-index='${lastAIMoveIndex}']`);
    if (cell) cell.classList.add('last-move-ai');
  }
}



// ==================== AI Thinking Animation ===================
function startAIThinkingAnimation() {
  const emptyCells = Array.from(document.querySelectorAll('.cell'))
    .filter((cell, index) => !board[index]);

  currentThinkingIndex = 0;

  aiThinkingInterval = setInterval(() => {
    emptyCells.forEach(cell => cell.classList.remove('thinking-highlight'));

    if (emptyCells.length === 0) {
      clearInterval(aiThinkingInterval);
      return;
    }

    const currentCell = emptyCells[currentThinkingIndex];
    currentCell.classList.add('thinking-highlight');

    currentThinkingIndex = (currentThinkingIndex + 5) % emptyCells.length;
  }, 100);
}

function stopAIThinkingAnimation() {
  clearInterval(aiThinkingInterval);
  aiThinkingInterval = null;

  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('thinking-highlight');
  });
}
function updateBoard() {
  document.querySelectorAll('.cell').forEach((cell, index) => {
    cell.textContent = board[index] || '';
  });
}
// बटन को पहचानें
const undoBtn = document.getElementById('undo-btn');

// Undo फंक्शन जोड़ें (पहले से भेजा था)
function undoMove() {
  if (moveHistory.length < 2 || gameOver) return;

  // दो बार undo (player और AI)
  for (let i = 0; i < 2; i++) {
    const lastMove = moveHistory.pop();
    if (lastMove) {
      board[lastMove.index] = null;  // <-- यहां '' की जगह null करो
      const cell = document.querySelector(`[data-index='${lastMove.index}']`);
      if (cell) cell.textContent = '';
    }
  }

  gameOver = false;
  statusMessage.textContent = 'Your Turn';
  currentPlayer = 'X';

  // अंतिम move index अपडेट करो
  lastPlayerMoveIndex = null;
  lastAIMoveIndex = null;
  highlightLastMove();

  updateBoard();
}
// बटन पर क्लिक से Undo फंक्शन चलाओ
undoBtn.addEventListener('click', undoMove);

function checkWin(board, player) {
  const winLines = generateWinLines(boardSize);
  return winLines.some(line => line.every(i => board[i] === player));
}

function getWinningLine(board, player) {
  const winLines = generateWinLines(boardSize);
  return winLines.find(line => line.every(i => board[i] === player)) || null;
}

function removeWinLine() {
  const line = document.querySelector('.win-line');
  if (line) {
    line.style.display = 'none';
    line.style.width = '0px';
  }
}

function drawWinLine(winLine) {
  if (!winLine || winLine.length < 2) return;

  const firstCell = gameBoard.querySelector(`[data-index='${winLine[0]}']`);
  const lastCell = gameBoard.querySelector(`[data-index='${winLine[winLine.length - 1]}']`);
  if (!firstCell || !lastCell) return;

  const wrapper = document.querySelector('.game-wrapper');
  const wrapperRect = wrapper.getBoundingClientRect();

  const firstRect = firstCell.getBoundingClientRect();
  const lastRect = lastCell.getBoundingClientRect();

  const x1 = firstRect.left + firstRect.width / 2 - wrapperRect.left;
  const y1 = firstRect.top + firstRect.height / 2 - wrapperRect.top;
  const x2 = lastRect.left + lastRect.width / 2 - wrapperRect.left;
  const y2 = lastRect.top + lastRect.height / 2 - wrapperRect.top;

  const originalLength = Math.hypot(x2 - x1, y2 - y1);
  const dx = (x2 - x1) / originalLength;
  const dy = (y2 - y1) / originalLength;

  const totalIncreasePercent = 0.24;
  const increaseFactor = totalIncreasePercent / 2;

  const newX1 = x1 - dx * originalLength * increaseFactor;
  const newY1 = y1 - dy * originalLength * increaseFactor;
  const newLength = originalLength * (1 + totalIncreasePercent);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  const line = document.querySelector('.win-line');

  // Reset previous classes
  line.classList.remove('win-line-player', 'win-line-ai');

  // Add color class based on player
  const winner = currentPlayer === 'X' ? 'player' : 'ai';
  line.classList.add(winner === 'player' ? 'win-line-player' : 'win-line-ai');

  line.style.display = 'block';
  line.style.width = '0px'; // for animation
  line.style.left = `${newX1}px`;
  line.style.top = `${newY1}px`;
  line.style.transformOrigin = 'left center';
  line.style.transform = `rotate(${angle}deg)`;

  setTimeout(() => {
    line.style.width = `${newLength}px`;
  }, 10);
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

//reset gameboard only
function resetGameBoardOnly() {
  // सिर्फ board खाली करना है
 
  board = Array(boardSize * boardSize).fill(null);
  gameOver = false;
  currentPlayer = 'X';

  // सभी सेल खाली करो और क्लास हटाओ
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win-player', 'win-ai');
  });

  // स्टेटस मैसेज रिसेट
  statusMessage.textContent = 'Your Turn';

  // बटन छुपाओ
  playAgainBtn.style.display = 'none';
  tryAgainBtn.style.display = 'none';

  // जीत की लाइन हटाओ
  const line = document.querySelector('.win-line');
  if (line) {
    line.style.display = 'none';
    line.style.width = '0px';
  }
}

function aiMove() {
  let index;
  try {
    if (gameLevel === 'Easy') {
      index = hybridPlannedLossMove();
    } else if (gameLevel === 'Medium') {
      index = (Math.random() < 0.5) ? hybridPlannedLossMove() : randomMove('Medium');
    } else if (gameLevel === 'Hard') {
      index = (Math.random() < 0.8) ? bestMove() : randomMove('Hard');
    } else if (gameLevel === 'God') {
      index = (Math.random() < 0.97) ? bestMove() : randomMove('God');
    }

    if (index !== null) {
      makeMove(index, 'O');
    }
  } catch (error) {
    console.error("AI move error:", error);
  }
}

function hybridPlannedLossMove() {
  const available = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
  if (!available.length) return null;

  const moveCount = board.filter(cell => cell !== null).length;

  // Step 1: Early randomness
  if (moveCount <= 2 && Math.random() < 0.5) {
    return getRandomItem(available);
  }

  // Step 2: Try to allow player to win in future (simulate)
  const potentialMoves = [];

  for (let move of shuffleArray(available)) {
    board[move] = 'O';
    const chances = countPlayerWinningChances('X', 2);
    board[move] = null;

    if (chances >= 1) {
      potentialMoves.push(move);
    }
  }

  if (potentialMoves.length) {
    return getRandomItem(potentialMoves);
  }

  // Step 3: If no good planned-losing move, return random
  return getRandomItem(available);
}

function countPlayerWinningChances(player, depthLimit) {
  let count = 0;

  function simulate(tempBoard, depth) {
    if (depth >= depthLimit) return;

    for (let i = 0; i < tempBoard.length; i++) {
      if (tempBoard[i] === null) {
        tempBoard[i] = player;
        if (checkWin(tempBoard, player)) {
          count++;
        } else {
          simulate(tempBoard, depth + 1);
        }
        tempBoard[i] = null;
      }
    }
  }

  simulate([...board], 0);
  return count;
}

function randomMove(level) {
  const available = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
  if (!available.length) return null;

  // 10% chance Easy mode helps the player win
  if (level === 'Easy' && Math.random() < 0.10) {
    return getHelpingMove('X') || getRandomItem(available);
  }

  // 5% chance Medium mode helps the player win
  if (level === 'Medium' && Math.random() < 0.05) {
    return getHelpingMove('X') || getRandomItem(available);
  }

  const player = 'X';
  const ai = 'O';

  // Blocking thresholds
  const blockChances = {
    'Easy': 0.20,
    'Medium': 0.35,
    'Hard': 0.50,
    'God': 0.95
  };

  // Try to block player win
  if (Math.random() < blockChances[level]) {
    const blockMove = getBlockingMove(player);
    if (blockMove !== null) return blockMove;
  }

  // Default random move
  return getRandomItem(available);
}
function getBlockingMove(player) {
  const available = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
  for (let i of available) {
    board[i] = player;
    if (checkWin(board, player)) {
      board[i] = null;
      return i;
    }
    board[i] = null;
  }

  // Check for double threat (fork) – block one
  let doubleThreats = [];
  for (let i of available) {
    board[i] = player;
    const chances = countPlayerWinningChances(player, 2);
    board[i] = null;
    if (chances >= 2) doubleThreats.push(i);
  }

  if (doubleThreats.length) return doubleThreats[0];
  return null;
}

function getHelpingMove(player) {
  const available = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
  for (let i of available) {
    board[i] = player;
    if (checkWin(board, player)) {
      board[i] = null;
      return i;
    }
    board[i] = null;
  }
  return null;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

// hint दिखाने वाला function
function showHint() {
  if (gameOver || currentPlayer !== 'X') return;  // गेम ख़त्म या AI की बारी हो तो hint नहीं दिखाना
  if (!['Easy', 'Medium', 'Hard'].includes(gameLevel)) return;  // सिर्फ Easy, Medium, Hard के लिए hint

  clearHintHighlight();

  // सबसे पहले मददगार move (win करने वाला), फिर blocking move, फिर bestMove
  let hintIndex = getHelpingMove('X') || getBlockingMove('X') || bestMove();

  if (hintIndex !== null) {
    const cell = gameBoard.querySelector(`[data-index='${hintIndex}']`);
    cell.classList.add('hint-highlight');
  }
}


// hint highlight हटाने वाला function
function clearHintHighlight() {
  document.querySelectorAll('.hint-highlight').forEach(cell => {
    cell.classList.remove('hint-highlight');
  });
}





function minimax(newBoard, depth, isMaximizing, depthLimit, alpha = -Infinity, beta = Infinity) {
  if (checkWin(newBoard, 'O')) return 10 - depth;
  if (checkWin(newBoard, 'X')) return depth - 10;
  if (newBoard.every(c => c !== null) || depth >= depthLimit) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = 'O';
        const score = minimax(newBoard, depth + 1, false, depthLimit, alpha, beta);
        newBoard[i] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;  // **Prune**
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = 'X';
        const score = minimax(newBoard, depth + 1, true, depthLimit, alpha, beta);
        newBoard[i] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;  // **Prune**
      }
    }
    return bestScore;
  }
}

function getDepthLimit() {
  if (boardSize === 3) {
    switch (gameLevel) {
      case 'Easy': return 1;
      case 'Medium': return 2;
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
  } else if (boardSize === 7) {
    switch (gameLevel) {
      case 'Easy': return 1;
      case 'Medium': return 2;
      case 'Hard': return 2;
      case 'God': return 3;
      default: return 2;
    }
  } else {
    return 3;
  }
}

// Utility functions
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRequiredToWin(size) {
  if (size === 3) return 3;
  if (size === 5) return 4;
  if (size === 7) return 5;
  return 3; // default fallback
}
// Generate winning combinations dynamically
function generateWinLines(size) {
  const lines = [];
  const winLength = size === 3 ? 3 : size === 5 ? 4 : 5;

  // Rows
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const row = [];
      for (let k = 0; k < winLength; k++) {
        row.push(r * size + (c + k));
      }
      lines.push(row);
    }
  }

  // Columns
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const col = [];
      for (let k = 0; k < winLength; k++) {
        col.push((r + k) * size + c);
      }
      lines.push(col);
    }
  }

  // Diagonal \
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const diag = [];
      for (let k = 0; k < winLength; k++) {
        diag.push((r + k) * size + (c + k));
      }
      lines.push(diag);
    }
  }

  // Diagonal /
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = winLength - 1; c < size; c++) {
      const diag = [];
      for (let k = 0; k < winLength; k++) {
        diag.push((r + k) * size + (c - k));
      }
      lines.push(diag);
    }
  }

  return lines;
}

// Button events
playAgainBtn.addEventListener('click', () => { vibrateDevice(); initGame(); });
tryAgainBtn.addEventListener('click', () => { vibrateDevice(); initGame(); });

// Start the game
initGame();
