const timerDisplay = document.getElementById("timer");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const difficultySelect = document.getElementById("difficultySelect");
const gameArea = document.getElementById("gameArea");
const typingInput = document.getElementById("typingInput");

const scoreDisplay = document.getElementById("score");
const pointsDisplay = document.getElementById("points");
const finalStats = document.getElementById("finalStats");

let timerInterval;
let score = 0;
let points = 100;
let wordsTyped = 0;
let totalTypedChars = 0;
let gameInterval;
let gameDuration = 60;
let timeLeft = 60;
let difficultySettings = {
    easy: {
        speed: 10,        // slower clouds
        spawnRate: 2000,  // spawn every 2 seconds
        time: 60          // 60 seconds game
    },
    medium: {
        speed: 7,
        spawnRate: 1400,
        time: 75
    },
    hard: {
        speed: 5,
        spawnRate: 900,
        time: 90
    }
};
let currentDifficulty;
let clouds = [];

const wordBank = {
    easy: [
        "cat", "dog", "sun", "sky", "run", "tree", "fast", "blue", "jump", "play",
        "code", "loop", "bug", "map", "key", "data", "node", "byte", "grid", "star"
    ],
    medium: [
        "cloud", "storm", "pixel", "array", "logic", "debug", "stack", "react",
        "vector", "server", "object", "script", "rocket", "engine", "render",
        "async", "binary", "router", "module", "cache"
    ],
    hard: [
        "algorithm", "synchronize", "recursion", "abstraction", "middleware",
        "multithread", "polymorphism", "asynchronous", "architecture",
        "optimization", "compilation", "inheritance", "encapsulation",
        "authentication", "virtualization"
    ]
};

function startGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameScreen.classList.remove("warning");
    typingInput.focus();

    spawnCloud();
    gameInterval = setInterval(spawnCloud, currentDifficulty.spawnRate);

    // Use separate countdown variable
    timeLeft = gameDuration;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        // Last 10 seconds effect
        if (timeLeft <= 10) {
            gameScreen.classList.add("warning");
        }

        if (timeLeft <= 0) {
            endGame();
        }

    }, 1000);
}
// Restart
startBtn.addEventListener("click", () => {

    currentDifficulty = difficultySettings[difficultySelect.value];
  
    gameDuration = currentDifficulty.time;
    timeLeft = gameDuration;
  
    startScreen.classList.remove("active");
    gameScreen.classList.add("active");
  
    resetGame();
    startGame();
  });

// Reset values
function resetGame() {
    score = 0;
    points = 100;
    wordsTyped = 0;
    totalTypedChars = 0;
    timeLeft = gameDuration;
    clouds = [];
    gameArea.innerHTML = "";
    scoreDisplay.textContent = score;
    pointsDisplay.textContent = points;
}

// Spawn cloud
function spawnCloud() {
    const words = wordBank[difficultySelect.value];
    const word = words[Math.floor(Math.random() * words.length)];
    const cloud = document.createElement("div");
    cloud.classList.add("cloud");
    cloud.textContent = word;

    cloud.style.left = Math.random() * 80 + "%";
    cloud.style.animationDuration = currentDifficulty.speed + "s";

    gameArea.appendChild(cloud);
    clouds.push(cloud);

    // When cloud animation ends
    cloud.addEventListener("animationend", () => {
        if (gameArea.contains(cloud)) {

            const currentTyped = typingInput.value.trim();

            // If user was typing this word (partial match), clear input
            if (cloud.textContent.startsWith(currentTyped)) {
                typingInput.value = "";
            }

            cloud.classList.add("miss");

            setTimeout(() => {
                cloud.classList.add("burst");

                setTimeout(() => {
                    if (gameArea.contains(cloud)) {
                        gameArea.removeChild(cloud);
                    }
                }, 400);
            }, 100);

            points -= 10;
            updateHUD();
            checkGameOver();
        }
    });
}

// Typing logic
typingInput.addEventListener("input", () => {
    const typed = typingInput.value.trim();

    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];

        if (cloud.textContent === typed) {

            score += 10;
            wordsTyped++;
            totalTypedChars += typed.length;

            // Remove from clouds array immediately
            clouds.splice(i, 1);

            // Stop animation
            cloud.style.animation = "none";

            // Lock its position visually
            const rect = cloud.getBoundingClientRect();
            const parentRect = gameArea.getBoundingClientRect();
            cloud.style.top = rect.top - parentRect.top + "px";

            // Apply success effect
            cloud.classList.add("success");

            setTimeout(() => {
                cloud.classList.add("burst");

                setTimeout(() => {
                    if (gameArea.contains(cloud)) {
                        cloud.remove();
                    }
                }, 400);

            }, 100);

            typingInput.value = "";
            updateHUD();
            break;
        }
    }
});

// Update display
function updateHUD() {
    scoreDisplay.textContent = score;
    pointsDisplay.textContent = points;
}

// End game
function endGame() {
    clearInterval(timerInterval);
    gameScreen.classList.remove("warning");
    clearInterval(gameInterval);
    gameScreen.classList.remove("active");
    endScreen.classList.add("active");
    let minutes = gameDuration / 60;
    let wpm = Math.round((totalTypedChars / 5) / minutes);

    finalStats.innerHTML = `
    Score: ${score} <br>
    WPM: ${wpm} <br>
    Words Typed: ${wordsTyped}
  `;
}

// Check if lost all points
function checkGameOver() {
    if (points <= 0) {
        endGame();
    }
}