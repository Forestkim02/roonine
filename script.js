// 初始化遊戲狀態
let currentPlayer = 'black'; // 黑棋先
let selectedPiece = null; // 當前選中的棋子
let board = Array(9).fill(null); // 棋盤 9 宮格
let pieces = {
  black: { large: 2, medium: 3, small: 3 },
  white: { large: 2, medium: 3, small: 3 }
};
let history = []; // 用來記錄每一步操作的歷史
let gameActive = true; // 判斷遊戲是否繼續進行

const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const blackLargeBtn = document.getElementById('blackLarge');
const blackMediumBtn = document.getElementById('blackMedium');
const blackSmallBtn = document.getElementById('blackSmall');
const whiteLargeBtn = document.getElementById('whiteLarge');
const whiteMediumBtn = document.getElementById('whiteMedium');
const whiteSmallBtn = document.getElementById('whiteSmall');
const undoBtn = document.getElementById('undo'); // 返回上一步按鈕
const resetBtn = document.getElementById('reset'); // 重新開始按鈕

// 點擊棋子按鈕選擇棋子
blackLargeBtn.addEventListener('click', () => selectPiece('black', 'large'));
blackMediumBtn.addEventListener('click', () => selectPiece('black', 'medium'));
blackSmallBtn.addEventListener('click', () => selectPiece('black', 'small'));
whiteLargeBtn.addEventListener('click', () => selectPiece('white', 'large'));
whiteMediumBtn.addEventListener('click', () => selectPiece('white', 'medium'));
whiteSmallBtn.addEventListener('click', () => selectPiece('white', 'small'));

// 點擊返回上一步和重新開始的按鈕
undoBtn.addEventListener('click', undoMove);
resetBtn.addEventListener('click', resetGame);

// 選擇棋子
function selectPiece(color, size) {
  if (!gameActive) {
    message.textContent = '遊戲已結束，請重新開始。';
    return;
  }

  if (currentPlayer !== color) {
    message.textContent = '現在不是你的回合。';
    return;
  }

  if (pieces[color][size] > 0) {
    selectedPiece = { color, size };
    message.textContent = `選擇了 ${color === 'black' ? '黑棋' : '白棋'} (${size})。`;
  } else {
    message.textContent = '該大小的棋子已經用完。';
  }
}

// 點擊棋盤的處理邏輯
cells.forEach(cell => {
  cell.addEventListener('click', () => handleCellClick(cell));
});

function handleCellClick(cell) {
  if (!gameActive) {
    message.textContent = '遊戲已結束，請重新開始。';
    return;
  }

  const index = cell.dataset.index;

  if (!selectedPiece) {
    message.textContent = '請選擇一顆棋子。';
    return;
  }

  const existingPiece = board[index];
  if (existingPiece) {
    if (canCapture(selectedPiece.size, existingPiece.size)) {
      history.push({ index, piece: board[index] }); // 記錄每一步操作
      updateCellContent(cell, selectedPiece);
      board[index] = selectedPiece;
      pieces[selectedPiece.color][selectedPiece.size]--;
      selectedPiece = null;
      checkWin();
      if (gameActive) switchPlayer();
    } else {
      message.textContent = '此位置無法放置該棋子。';
    }
  } else {
    history.push({ index, piece: null }); // 記錄每一步操作
    updateCellContent(cell, selectedPiece);
    board[index] = selectedPiece;
    pieces[selectedPiece.color][selectedPiece.size]--;
    selectedPiece = null;
    checkWin();
    if (gameActive) switchPlayer();
  }
}

// 更新格子內的顯示內容
function updateCellContent(cell, piece) {
  const sizeLabel = {
    large: '大',
    medium: '中',
    small: '小'
  };

  const symbol = piece.color === 'black' ? '⚫' : '⚪';
  cell.innerHTML = `<span>${symbol}</span><br><span>${sizeLabel[piece.size]}</span>`;
}

// 切換玩家
function switchPlayer() {
  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
  message.textContent = `現在是 ${currentPlayer === 'black' ? '黑棋' : '白棋'} 的回合。`;
}

// 判斷是否可以吃掉當前棋子
function canCapture(newSize, existingSize) {
  const sizeRank = { small: 1, medium: 2, large: 3 };
  return sizeRank[newSize] > sizeRank[existingSize];
}

// 返回上一步
function undoMove() {
  if (!gameActive) {
    message.textContent = '遊戲已結束，請重新開始。';
    return;
  }

  if (history.length > 0) {
    const lastMove = history.pop(); // 取出最後一步
    board[lastMove.index] = lastMove.piece; // 還原棋盤
    const cell = cells[lastMove.index];
    
    if (lastMove.piece) {
      updateCellContent(cell, lastMove.piece);
    } else {
      cell.innerHTML = ''; // 如果該格是空的，清空
    }

    switchPlayer(); // 返回上一步後也要切換玩家
    message.textContent = `返回上一步，現在是 ${currentPlayer === 'black' ? '黑棋' : '白棋'} 的回合。`;
  } else {
    message.textContent = '無法返回，沒有更多的操作記錄。';
  }
}

// 重新開始遊戲
function resetGame() {
  board.fill(null); // 清空棋盤
  pieces = {
    black: { large: 2, medium: 3, small: 3 },
    white: { large: 2, medium: 3, small: 3 }
  };
  history = []; // 清空歷史記錄
  selectedPiece = null;
  currentPlayer = 'black'; // 黑棋先
  gameActive = true; // 遊戲恢復進行

  cells.forEach(cell => {
    cell.innerHTML = ''; // 清空棋盤上的顯示
  });

  message.textContent = '已重新開始遊戲，黑棋先行。';
}

// 判斷遊戲是否結束
function checkWin() {
  const winPatterns = [
    [0, 1, 2], // 橫向
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // 縱向
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // 對角線
    [2, 4, 6]
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a].color === board[b]?.color && board[a].color === board[c]?.color) {
      gameActive = false; // 遊戲結束
      message.textContent = `${board[a].color === 'black' ? '黑棋' : '白棋'} 勝利！請重新開始遊戲。`;
      return;
    }
  }
}
