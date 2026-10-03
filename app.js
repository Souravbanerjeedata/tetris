(() => {
  "use strict";

  // ─── Constants ───────────────────────────────────────────────
  const COLS = 10;
  const ROWS = 20;
  const HIDDEN_ROWS = 2; // buffer above visible board
  const TOTAL_ROWS = ROWS + HIDDEN_ROWS;

  const PIECES = {
    I: {
      shapes: [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
        [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
      ],
      color: "I",
    },
    O: {
      shapes: [
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
      ],
      color: "O",
    },
    T: {
      shapes: [
        [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
        [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
      ],
      color: "T",
    },
    S: {
      shapes: [
        [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
        [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
      ],
      color: "S",
    },
    Z: {
      shapes: [
        [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
        [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
        [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
      ],
      color: "Z",
    },
    J: {
      shapes: [
        [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
        [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
      ],
      color: "J",
    },
    L: {
      shapes: [
        [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
        [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
        [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
      ],
      color: "L",
    },
  };

  const PIECE_KEYS = Object.keys(PIECES);
  const SCORE_TABLE = [0, 100, 300, 500, 800]; // single, double, triple, tetris
  const LEVEL_SPEEDS = [
    800, 720, 630, 550, 470, 380, 300, 220, 130, 100, 80, 80, 80, 70, 70, 70, 50, 50, 50, 30,
  ];

  // ─── DOM ─────────────────────────────────────────────────────
  const gridEl = document.getElementById("grid");
  const miniGridEl = document.getElementById("mini-grid");
  const holdGridEl = document.getElementById("hold-grid");
  const scoreEl = document.getElementById("score");
  const levelEl = document.getElementById("level");
  const linesEl = document.getElementById("lines");
  const startModal = document.getElementById("startModal");
  const gameOverModal = document.getElementById("gameOverModal");
  const pauseModal = document.getElementById("pauseModal");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const resumeBtn = document.getElementById("resumeBtn");
  const finalScoreEl = document.getElementById("finalScore");
  const finalStatsEl = document.getElementById("finalStats");

  // Build main grid cells
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      gridEl.appendChild(cell);
      cells.push(cell);
    }
  }

  // Mini grids (4x4)
  function buildMini(el) {
    const arr = [];
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement("div");
      cell.className = "mini-cell";
      el.appendChild(cell);
      arr.push(cell);
    }
    return arr;
  }
  const miniCells = buildMini(miniGridEl);
  const holdCells = buildMini(holdGridEl);

  // ─── State ───────────────────────────────────────────────────
  let board = []; // TOTAL_ROWS x COLS, null or color string
  let current = null; // { type, rotation, x, y }
  let nextType = null;
  let holdType = null;
  let canHold = true;
  let score = 0;
  let level = 1;
  let lines = 0;
  let dropInterval = null;
  let isPlaying = false;
  let isPaused = false;
  let bag = [];

  // ─── Helpers ─────────────────────────────────────────────────
  function emptyBoard() {
    board = Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(null));
  }

  function shuffleBag() {
    bag = [...PIECE_KEYS];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }

  function nextFromBag() {
    if (bag.length === 0) shuffleBag();
    return bag.pop();
  }

  function createPiece(type) {
    return { type, rotation: 0, x: 3, y: 0 };
  }

  function getShape(piece) {
    return PIECES[piece.type].shapes[piece.rotation];
  }

  function collides(piece, dx = 0, dy = 0, rot = piece.rotation) {
    const shape = PIECES[piece.type].shapes[rot];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = piece.x + c + dx;
        const ny = piece.y + r + dy;
        if (nx < 0 || nx >= COLS || ny >= TOTAL_ROWS) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
    }
    return false;
  }

  function lockPiece() {
    const shape = getShape(current);
    const color = PIECES[current.type].color;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const y = current.y + r;
        const x = current.x + c;
        if (y >= 0) board[y][x] = color;
      }
    }
  }

  function clearLines() {
    let cleared = 0;
    for (let r = TOTAL_ROWS - 1; r >= 0; r--) {
      if (board[r].every((cell) => cell !== null)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        r++; // re-check same index after shift
      }
    }
    if (cleared > 0) {
      lines += cleared;
      score += SCORE_TABLE[cleared] * level;
      level = Math.floor(lines / 10) + 1;
      updateStats();
      resetDropSpeed();
    }
  }

  function ghostY() {
    let dy = 0;
    while (!collides(current, 0, dy + 1)) dy++;
    return current.y + dy;
  }

  // ─── Drawing ─────────────────────────────────────────────────
  function clearCells(cellArr) {
    cellArr.forEach((c) => {
      c.className = c.classList.contains("mini-cell") ? "mini-cell" : "cell";
      c.style.background = "";
      c.style.color = "";
    });
  }

  function drawBoard() {
    clearCells(cells);
    // Locked pieces
    for (let r = HIDDEN_ROWS; r < TOTAL_ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = board[r][c];
        if (color) {
          const idx = (r - HIDDEN_ROWS) * COLS + c;
          cells[idx].classList.add("filled", color);
        }
      }
    }
    // Ghost
    if (current && isPlaying) {
      const gy = ghostY();
      const shape = getShape(current);
      const color = PIECES[current.type].color;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const y = gy + r - HIDDEN_ROWS;
          const x = current.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            const idx = y * COLS + x;
            if (!cells[idx].classList.contains("filled")) {
              cells[idx].classList.add("filled", "ghost", color);
            }
          }
        }
      }
    }
    // Current piece
    if (current) {
      const shape = getShape(current);
      const color = PIECES[current.type].color;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const y = current.y + r - HIDDEN_ROWS;
          const x = current.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            const idx = y * COLS + x;
            cells[idx].className = "cell filled " + color;
          }
        }
      }
    }
  }

  function drawMini(cellArr, type) {
    clearCells(cellArr);
    if (!type) return;
    const shape = PIECES[type].shapes[0];
    const color = PIECES[type].color;
    const offsetR = shape.length === 2 ? 1 : shape.length === 3 ? 0 : 0;
    const offsetC = shape[0].length === 2 ? 1 : 0;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const idx = (r + offsetR) * 4 + (c + offsetC);
        if (idx >= 0 && idx < 16) {
          cellArr[idx].classList.add("filled", color);
        }
      }
    }
  }

  function updateStats() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
  }

  // ─── Game flow ───────────────────────────────────────────────
  function spawn() {
    current = createPiece(nextType);
    nextType = nextFromBag();
    canHold = true;
    drawMini(miniCells, nextType);
    if (collides(current)) {
      gameOver();
      return;
    }
    drawBoard();
  }

  function hardDrop() {
    if (!current || !isPlaying || isPaused) return;
    let dist = 0;
    while (!collides(current, 0, 1)) {
      current.y++;
      dist++;
    }
    score += dist * 2;
    lockAndContinue();
  }

  function softDrop() {
    if (!current || !isPlaying || isPaused) return;
    if (!collides(current, 0, 1)) {
      current.y++;
      score += 1;
      updateStats();
      drawBoard();
    } else {
      lockAndContinue();
    }
  }

  function lockAndContinue() {
    lockPiece();
    clearLines();
    spawn();
    updateStats();
  }

  function move(dx) {
    if (!current || !isPlaying || isPaused) return;
    if (!collides(current, dx, 0)) {
      current.x += dx;
      drawBoard();
    }
  }

  function rotate(dir = 1) {
    if (!current || !isPlaying || isPaused) return;
    const nextRot = (current.rotation + dir + 4) % 4;
    // Simple wall kicks
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!collides(current, k, 0, nextRot)) {
        current.rotation = nextRot;
        current.x += k;
        drawBoard();
        return;
      }
    }
  }

  function hold() {
    if (!current || !isPlaying || isPaused || !canHold) return;
    const type = current.type;
    if (holdType) {
      current = createPiece(holdType);
      holdType = type;
    } else {
      holdType = type;
      spawn();
      return;
    }
    canHold = false;
    drawMini(holdCells, holdType);
    if (collides(current)) {
      // shouldn't happen often
      gameOver();
      return;
    }
    drawBoard();
  }

  function resetDropSpeed() {
    clearInterval(dropInterval);
    const speed = LEVEL_SPEEDS[Math.min(level - 1, LEVEL_SPEEDS.length - 1)];
    dropInterval = setInterval(() => {
      if (!isPlaying || isPaused) return;
      if (!collides(current, 0, 1)) {
        current.y++;
        drawBoard();
      } else {
        lockAndContinue();
      }
    }, speed);
  }

  function startGame() {
    emptyBoard();
    shuffleBag();
    score = 0;
    level = 1;
    lines = 0;
    holdType = null;
    canHold = true;
    nextType = nextFromBag();
    isPlaying = true;
    isPaused = false;
    document.body.classList.add("playing");
    startModal.classList.add("hidden");
    gameOverModal.classList.add("hidden");
    pauseModal.classList.add("hidden");
    updateStats();
    clearCells(holdCells);
    spawn();
    resetDropSpeed();
  }

  function gameOver() {
    isPlaying = false;
    clearInterval(dropInterval);
    document.body.classList.remove("playing");
    finalScoreEl.textContent = `Score: ${score}`;
    finalStatsEl.textContent = `Level ${level} • ${lines} lines`;
    gameOverModal.classList.remove("hidden");
  }

  function togglePause() {
    if (!isPlaying) return;
    isPaused = !isPaused;
    if (isPaused) {
      pauseModal.classList.remove("hidden");
    } else {
      pauseModal.classList.add("hidden");
    }
  }

  // ─── Input ───────────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "c", "C", "x", "X", "p", "P"].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === "p" || e.key === "P") {
      togglePause();
      return;
    }

    if (isPaused) return;

    switch (e.key) {
      case "ArrowLeft":
        move(-1);
        break;
      case "ArrowRight":
        move(1);
        break;
      case "ArrowDown":
        softDrop();
        break;
      case "ArrowUp":
      case "x":
      case "X":
        rotate(1);
        break;
      case "z":
      case "Z":
        rotate(-1);
        break;
      case " ":
        hardDrop();
        break;
      case "c":
      case "C":
        hold();
        break;
    }
  });

  // Touch / swipe
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  const SWIPE_MIN = 30;

  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      if (!isPlaying || isPaused) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const dt = Date.now() - touchStartTime;

      if (Math.max(absDx, absDy) < SWIPE_MIN) {
        // Tap = rotate
        if (dt < 300) rotate(1);
        return;
      }

      if (absDx > absDy) {
        move(dx > 0 ? 1 : -1);
      } else {
        if (dy > 0) {
          if (absDy > 80) hardDrop();
          else softDrop();
        }
      }
    },
    { passive: true }
  );

  // Prevent scroll on game area
  document.querySelector(".grid-wrapper")?.addEventListener(
    "touchmove",
    (e) => {
      if (isPlaying) e.preventDefault();
    },
    { passive: false }
  );

  // Buttons
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  resumeBtn.addEventListener("click", () => {
    isPaused = false;
    pauseModal.classList.add("hidden");
  });

  // Click pause modal background to resume
  pauseModal.addEventListener("click", (e) => {
    if (e.target === pauseModal) {
      isPaused = false;
      pauseModal.classList.add("hidden");
    }
  });

  // Initial draw (empty board shown under start modal)
  emptyBoard();
  drawBoard();
  drawMini(miniCells, null);
  drawMini(holdCells, null);
})();
