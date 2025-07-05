const player = document.getElementById("player");
const gameContainer = document.getElementById("game-container");
const message = document.getElementById("message");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restart-btn");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

const allWords = ["Uniqverse", "Belongship", "Inspirelead", "Mindshift", "Ownability"];
let collectedWords = [];
let lastWord = "";
let previousObstacleCols = [];

const totalColumns = 3;
let currentColumnIndex = 1;
let fallSpeed = 12;
let spawnCount = 0;
let spawnInterval;
let gameOver = false;
const wordSpawnThreshold = 3;

function getStep() {
  return gameContainer.offsetWidth / totalColumns;
}

function movePlayer(direction) {
  if (gameOver) return;

  if (direction === "left" && currentColumnIndex > 0) {
    currentColumnIndex--;
  } else if (direction === "right" && currentColumnIndex < totalColumns - 1) {
    currentColumnIndex++;
  }

  const step = getStep();
  player.style.left = `${currentColumnIndex * step}px`;
}

function spawnItem(colIndex, isObstacle) {
  const step = getStep();
  const item = document.createElement("div");

  item.style.left = `${colIndex * step}px`;
  item.style.top = `0px`;

  if (isObstacle) {
    item.classList.add("obstacle");
    item.textContent = "🌲";
  } else {
    item.classList.add("word");

    const availableWords = allWords.filter(
      (w) => !collectedWords.includes(w) && w !== lastWord
    );
    if (availableWords.length === 0) return;

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    lastWord = word;

    item.dataset.keyword = word;
    item.textContent = "🗝️"; // key emoji
  }

  gameContainer.appendChild(item);

  let top = 0;
  const interval = setInterval(() => {
    if (gameOver) {
      clearInterval(interval);
      return;
    }

    top += fallSpeed;
    item.style.top = `${top}px`;

const itemRect = item.getBoundingClientRect();
const playerRect = player.getBoundingClientRect();

const verticalMargin = 15;     // For top/bottom leniency
const horizontalMargin = 25;  // For left/right leniency

const isCollision =
  itemRect.bottom - verticalMargin >= playerRect.top &&
  itemRect.top + verticalMargin <= playerRect.bottom &&
  itemRect.left + horizontalMargin < playerRect.right &&
  itemRect.right - horizontalMargin > playerRect.left;


    if (isCollision) {
      clearInterval(interval);
      item.remove();

      if (item.classList.contains("obstacle")) {
        endGame("💥 Hai colpito un albero!");
      } else {
        const word = item.dataset.keyword;
        collectedWords.push(word);

        const kw = document.getElementById(`kw-${word}`);
        if (kw) kw.classList.add("collected");

        if (collectedWords.length === allWords.length) {
          confetti({
  particleCount: 150,
  spread: 100,
  origin: { y: 0.6 },
});

          endGame("🎉 Hai vinto! Tutti i valori raccolti!");
        }
      }
    }

    if (top > gameContainer.offsetHeight) {
      clearInterval(interval);
      item.remove();
    }
  }, 40);
}

function spawnRow() {
  if (gameOver) return;

  spawnCount++;

  let cols = [0, 1, 2].sort(() => Math.random() - 0.5);
  let obstacleCols = cols.slice(0, 2).sort();
  let safeCol = cols[2];

  // avoid repeating same obstacle pattern
  while (
    previousObstacleCols.length &&
    JSON.stringify(obstacleCols) === JSON.stringify(previousObstacleCols)
  ) {
    cols = [0, 1, 2].sort(() => Math.random() - 0.5);
    obstacleCols = cols.slice(0, 2).sort();
    safeCol = cols[2];
  }

  previousObstacleCols = obstacleCols;

  obstacleCols.forEach((col) => spawnItem(col, true));

  // Only place key in col 0 or 1 (left or center)
  const allowedCols = [0, 1];
  const keyCol = allowedCols[Math.floor(Math.random() * allowedCols.length)];

  if (
    spawnCount >= wordSpawnThreshold &&
    collectedWords.length < allWords.length &&
    !obstacleCols.includes(keyCol)
  ) {
    spawnItem(keyCol, false);
    spawnCount = 0;
  }
}

function endGame(text) {
  gameOver = true;
  message.textContent = text;
  overlay.classList.add("active");
  restartBtn.style.display = "block";
  clearInterval(spawnInterval);
}

function resetGame() {
  collectedWords = [];
  lastWord = "";
  gameOver = false;
  spawnCount = 0;
  currentColumnIndex = 1;

  document.querySelectorAll(".keyword").forEach((kw) => kw.classList.remove("collected"));
  document.querySelectorAll(".obstacle, .word").forEach((el) => el.remove());

  overlay.classList.remove("active");
  restartBtn.style.display = "none";

  const step = getStep();
  player.style.left = `${currentColumnIndex * step}px`;

  spawnInterval = setInterval(spawnRow, 1000);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") movePlayer("left");
  if (e.code === "ArrowRight") movePlayer("right");
});

leftBtn.addEventListener("click", () => movePlayer("left"));
rightBtn.addEventListener("click", () => movePlayer("right"));
restartBtn.addEventListener("click", resetGame);

window.addEventListener("load", () => {
  const step = getStep();
  player.style.left = `${currentColumnIndex * step}px`;
  spawnInterval = setInterval(spawnRow, 1000);
});
