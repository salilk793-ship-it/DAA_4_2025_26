// ========== SUDOKU SOLVER - BACKTRACKING ALGORITHM ==========

let board = [];
let originalBoard = [];
let solving = false;
let stats = { attempts: 0, backtracks: 0, placed: 0 };

// ========== BOARD INITIALIZATION ==========

function createEmptyBoard() {
  const board = [];
  for (let r = 0; r < 9; r++) {
    board[r] = [];
    for (let c = 0; c < 9; c++) {
      board[r][c] = { value: 0, fixed: false };
    }
  }
  return board;
}

function cloneBoard(board) {
  return board.map(row => row.map(cell => ({ ...cell })));
}

function generatePuzzle() {
  const b = createEmptyBoard();

  // Fill diagonal 3x3 boxes
  for (let box = 0; box < 3; box++) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        b[box * 3 + r][box * 3 + c].value = nums[r * 3 + c];
      }
    }
  }

  // Solve the rest
  solveSudokuFast(b);

  // Mark all as fixed
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      b[r][c].fixed = true;
    }
  }

  // Remove cells
  const remove = 40;
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]));
  for (let i = 0; i < remove; i++) {
    const [r, c] = positions[i];
    b[r][c].value = 0;
    b[r][c].fixed = false;
  }

  return b;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ========== VALIDATION ==========

function isValid(board, row, col, num) {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c].value === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col].value === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c].value === num) {
        return false;
      }
    }
  }

  return true;
}

function findEmpty(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value === 0) return [r, c];
    }
  }
  return null;
}

// ========== FAST SOLVER (No visualization) ==========

function solveSudokuFast(board) {
  const pos = findEmpty(board);
  if (!pos) return true;

  const [r, c] = pos;
  for (let num = 1; num <= 9; num++) {
    if (isValid(board, r, c, num)) {
      board[r][c].value = num;
      if (solveSudokuFast(board)) return true;
      board[r][c].value = 0;
    }
  }
  return false;
}

// ========== STEP-BY-STEP SOLVER WITH VISUALIZATION ==========

async function solveStepByStep(callback, delay, signal) {
  stats = { attempts: 0, backtracks: 0, placed: 0 };

  async function solve(row, col) {
    // Find next empty cell starting from (row, col)
    while (row < 9) {
      if (board[row][col].value === 0) break;
      col++;
      if (col >= 9) { col = 0; row++; }
    }

    // No empty cell - solved!
    if (row >= 9) return true;

    if (signal?.aborted) return false;

    // Try numbers 1-9
    for (let num = 1; num <= 9; num++) {
      if (signal?.aborted) return false;

      // TRY: Place the number on board
      stats.attempts++;
      board[row][col].value = num;
      callback({ type: "TRY", row, col, value: num });
      await sleep(delay);

      if (signal?.aborted) {
        board[row][col].value = 0;
        return false;
      }

      if (isValid(board, row, col, num)) {
        // PLACE: Valid placement
        stats.placed++;
        callback({ type: "PLACE", row, col, value: num });
        await sleep(delay * 0.7);

        if (signal?.aborted) {
          board[row][col].value = 0;
          return false;
        }

        // Recurse to next cell
        let nextR = row, nextC = col + 1;
        if (nextC >= 9) { nextC = 0; nextR++; }

        const solved = await solve(nextR, nextC);

        if (solved) return true;

        // BACKTRACK: Recursion failed
        stats.backtracks++;
        callback({ type: "BACKTRACK", row, col, value: num });
        await sleep(delay);

        if (signal?.aborted) {
          board[row][col].value = 0;
          return false;
        }

        // CLEAR: Remove the number
        board[row][col].value = 0;
        callback({ type: "CLEAR", row, col });
        await sleep(delay * 0.7);

      } else {
        // INVALID: Conflicts detected
        callback({ type: "INVALID", row, col, value: num });
        await sleep(delay);

        if (signal?.aborted) {
          board[row][col].value = 0;
          return false;
        }

        // Remove the invalid number
        board[row][col].value = 0;
      }
    }

    // All 1-9 failed
    return false;
  }

  const solved = await solve(0, 0);

  if (solved) {
    callback({ type: "SOLVED" });
  } else if (!signal?.aborted) {
    callback({ type: "NO_SOLUTION" });
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== INSTANT SOLVE ==========

function solveSudokuInstant() {
  const copy = cloneBoard(board);
  if (solveSudokuFast(copy)) {
    board = copy;
    render();
    return true;
  }
  return false;
}

// ========== UI RENDERING ==========

function render() {
  const boardDiv = document.getElementById('board');

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = board[r][c];
      const div = document.getElementById(`cell-${r}-${c}`);

      if (!div) {
        // Create cell if it doesn't exist
        const newDiv = document.createElement('div');
        newDiv.className = 'cell';
        newDiv.id = `cell-${r}-${c}`;

        if (cell.fixed) newDiv.classList.add('fixed');
        if (cell.value > 0 && !cell.fixed) newDiv.classList.add('filled-by-solver');

        const input = document.createElement('input');
        input.type = 'text';
        input.value = cell.value === 0 ? '' : cell.value;
        input.maxLength = '1';
        input.readOnly = cell.fixed || solving;
        input.dataset.row = r;
        input.dataset.col = c;

        input.addEventListener('input', (e) => {
          if (solving || cell.fixed) return;
          const val = e.target.value.replace(/[^1-9]/g, '');
          e.target.value = val;
          cell.value = val === '' ? 0 : parseInt(val);
          render();
        });

        newDiv.appendChild(input);
        boardDiv.appendChild(newDiv);
      } else {
        // Update existing cell
        const input = div.querySelector('input');
        input.value = cell.value === 0 ? '' : cell.value;
        input.readOnly = cell.fixed || solving;

        // Update class
        div.className = 'cell';
        if (cell.fixed) div.classList.add('fixed');
        if (cell.value > 0 && !cell.fixed) div.classList.add('filled-by-solver');
      }
    }
  }

  updateStats();
}

function getCellDiv(r, c) {
  return document.getElementById(`cell-${r}-${c}`);
}

function animateCell(r, c, className) {
  const div = getCellDiv(r, c);
  if (!div) return;

  // Update the display value
  const input = div.querySelector('input');
  input.value = board[r][c].value === 0 ? '' : board[r][c].value;

  // Clear previous animations
  div.classList.remove('try', 'place', 'backtrack', 'invalid', 'clear');

  // Force reflow to restart animation
  void div.offsetWidth;

  // Add new animation
  div.classList.add(className);
}

function clearAllHighlights() {
  document.querySelectorAll('.cell').forEach(div => {
    div.classList.remove('try', 'place', 'backtrack', 'invalid', 'clear');
  });
}

function updateStats() {
  document.getElementById('attempts').textContent = stats.attempts;
  document.getElementById('backtracks').textContent = stats.backtracks;
  document.getElementById('placed').textContent = stats.placed;
}

function setStatus(msg, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = msg;
  status.className = `status ${type}`;
}

// ========== EVENT HANDLERS ==========

let abortController = null;

document.getElementById('solveBtn').addEventListener('click', async () => {
  if (solving) return;

  solving = true;
  document.getElementById('solveBtn').disabled = true;
  document.getElementById('stepBtn').disabled = true;
  document.getElementById('newBtn').disabled = true;
  document.getElementById('resetBtn').disabled = true;

  setStatus('⚡ Solving instantly...', 'info');

  if (solveSudokuInstant()) {
    setStatus('✓ Solved instantly!', 'solved');
  } else {
    setStatus('✗ No solution exists', 'error');
  }

  solving = false;
  document.getElementById('solveBtn').disabled = false;
  document.getElementById('stepBtn').disabled = false;
  document.getElementById('newBtn').disabled = false;
  document.getElementById('resetBtn').disabled = false;
});

document.getElementById('stepBtn').addEventListener('click', async () => {
  if (solving) return;

  solving = true;
  document.getElementById('solveBtn').disabled = true;
  document.getElementById('stepBtn').disabled = true;
  document.getElementById('newBtn').disabled = true;
  document.getElementById('resetBtn').disabled = true;
  document.getElementById('stopBtn').style.display = 'inline-block';

  const speed = parseInt(document.getElementById('speedSlider').value);
  const delay = speed;

  abortController = new AbortController();
  clearAllHighlights();
  setStatus('👁 Solving step-by-step...', 'info');

  await solveStepByStep((step) => {
    switch (step.type) {
      case 'TRY':
        animateCell(step.row, step.col, 'try');
        setStatus(`🟨 Trying ${step.value} at (${step.row + 1},${step.col + 1})`, 'info');
        break;
      case 'PLACE':
        animateCell(step.row, step.col, 'place');
        setStatus(`🟩 ✓ Placed ${step.value} at (${step.row + 1},${step.col + 1})`, 'info');
        break;
      case 'INVALID':
        animateCell(step.row, step.col, 'invalid');
        setStatus(`🔴 ✗ ${step.value} CONFLICTS at (${step.row + 1},${step.col + 1})`, 'info');
        break;
      case 'BACKTRACK':
        animateCell(step.row, step.col, 'backtrack');
        setStatus(`↩ BACKTRACKING from (${step.row + 1},${step.col + 1})`, 'info');
        break;
      case 'CLEAR':
        animateCell(step.row, step.col, 'clear');
        setStatus(`🗑 Cleared (${step.row + 1},${step.col + 1})`, 'info');
        break;
      case 'SOLVED':
        clearAllHighlights();
        render();
        setStatus(`🎉 SOLVED in ${stats.attempts} attempts, ${stats.backtracks} backtracks!`, 'solved');
        break;
      case 'NO_SOLUTION':
        setStatus('❌ No solution exists', 'error');
        break;
    }
  }, delay, abortController.signal);

  solving = false;
  document.getElementById('solveBtn').disabled = false;
  document.getElementById('stepBtn').disabled = false;
  document.getElementById('newBtn').disabled = false;
  document.getElementById('resetBtn').disabled = false;
  document.getElementById('stopBtn').style.display = 'none';
});

document.getElementById('stopBtn').addEventListener('click', () => {
  if (abortController) abortController.abort();
  clearAllHighlights();
  render();
  setStatus('⏹ Stopped', 'info');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (solving) return;
  board = cloneBoard(originalBoard);
  stats = { attempts: 0, backtracks: 0, placed: 0 };
  clearAllHighlights();
  setStatus('🔄 Reset to original puzzle', 'info');
  render();
});

document.getElementById('newBtn').addEventListener('click', () => {
  if (solving) return;
  board = generatePuzzle();
  originalBoard = cloneBoard(board);
  stats = { attempts: 0, backtracks: 0, placed: 0 };
  clearAllHighlights();
  setStatus('🎲 New puzzle generated', 'info');
  render();
});

document.getElementById('speedSlider').addEventListener('input', (e) => {
  document.getElementById('speedValue').textContent = e.target.value + 'ms';
});

// ========== INITIALIZATION ==========

board = generatePuzzle();
originalBoard = cloneBoard(board);
render();
setStatus('Ready! Click Step-by-Step to watch backtracking', 'info');
