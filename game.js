let currentMoleTile;
let plantTiles = [];
let score = 0;
let gameOver = false;
let highScore = {
    easy: 0,
    medium: 0,
    hard: 0
};
let difficulty = "easy";
const hit = new Audio("./Correct.mp3")
const miss = new Audio("./Wrong.mp3")
let moleImg = document.createElement("img");
moleImg.src = "./Mole.png";
let plantImgs = [];
let gameMode = "classic";
let timeLeft = 60;
let timeInterval = null;
const warning = new Audio("./Time_Warning2.mp3");
warning.preload = "auto";
let warningPlayed = false;

window.onload = function() {
    setTiles();

    // difficulty selection overlay
    document.querySelectorAll(".diff-btn").forEach(btn => {
        if (btn.dataset.diff) {
            btn.addEventListener("click", () => {
                difficulty = btn.dataset.diff;
                document.getElementById("difficulty").style.display = "none";
                startGame();
            })
        }
    })

    // Game Mode Toggle
    document.getElementById("gameMode").addEventListener("click", () => {
        if (gameMode === "classic") {
            gameMode = "timed";
            timeLeft = 60;
            document.getElementById("gameMode").innerText = "Mode: Timed";
            document.getElementById("gameMode").classList.add("selected");

        } else {
            gameMode = "classic";
            document.getElementById("gameMode").innerText = "Mode: Classic";
            document.getElementById("gameMode").classList.remove("selected");
        }
    })

    // Game over overlay
    const overlay = document.getElementById("overlay");
    overlay.addEventListener("click", (e) => {
        if (e.target.id === "changeDiff") {
            return;
        }

        overlay.style.display = "none";
        resetGame();
        startGame();
    })

    document.getElementById("changeDiff").addEventListener("click", () => {
        overlay.style.display = "none";
        clearInterval(window.moleTimer);
        clearInterval(window.plantTimer);
        window.moleTimer = null;
        window.plantTimer = null;
        resetGame();
        document.getElementById("difficulty").style.display = "flex";

        if (gameMode === "timed") {
            document.getElementById("gameMode").innerText = "Mode: Timed";
            document.getElementById("gameMode").classList.add("selected");

        } else {
            document.getElementById("gameMode").innerText = "Mode: Classic";
            document.getElementById("gameMode").classList.remove("selected");
        }
    })
}

function setTiles() {
    for (let i = 0; i < 9; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        document.getElementById("board").appendChild(tile);
    }
}

function startGame() {
    document.getElementById("highscore").innerText = "High Score (" + difficulty.toString() + ") :" + highScore[difficulty].toString();

    let moleInterval = 1000;
    let plantInterval = 1000;

    if (difficulty === "medium") {
        moleInterval = 850;
        plantInterval = 850;

    } else if (difficulty === "hard") {
        moleInterval = 700;
        plantInterval = 700;
    }

    if (window.moleTimer) {
        clearInterval(window.moleTimer);
    }

    if (window.plantTimer) {
        clearInterval(window.plantTimer);
    }

    window.moleTimer = setInterval(spawnMole, moleInterval);
    window.plantTimer = setInterval(spawnPlant, plantInterval);

    if (gameMode === "timed") {
        timeLeft = 60;
        document.getElementById("timer").style.display = "inline-block";
        document.getElementById("timer").innerText = "Time: " + timeLeft.toString();

        if (timeInterval) {
            clearInterval(timeInterval);
        }

        timeInterval = setInterval(() => {
            timeLeft--;
            document.getElementById("timer").innerText = "Time: " + timeLeft.toString();

            if (timeLeft <= 5) {
                document.getElementById("timer").classList.add("time-warning");
                if (!warningPlayed) {
                    warning.currentTime = 0;
                    warning.volume = 0.4;
                    warning.play();
                    warningPlayed = true;
                }
            }

            if (timeLeft <= 0) {
                clearInterval(timeInterval);
                gameLost();
            }
        }, 1000);

    } else {
        document.getElementById("timer").style.display = "none";
        document.getElementById("timer").innerText = "Time: 60";
    }
}

function spawnMole() {
    if (gameOver) {
        return;
    }

    if (currentMoleTile && currentMoleTile.contains(moleImg)) {
        currentMoleTile.removeChild(moleImg);
    }

    let num = getRandomTile();
    if (plantTiles.some(tile => tile.id === num)) {
        return;
    }
    currentMoleTile = document.getElementById(num);
    currentMoleTile.appendChild(moleImg);
}

function spawnPlant() {
    if (gameOver) {
        return;
    }

    plantTiles.forEach(tile => {
        const img = tile.querySelector("img");
        if (img) {
            tile.removeChild(img);
        }
    });
    plantTiles = [];

    let plantCount = 1;
    if (difficulty === "hard") {
        plantCount = 2;
    }

    while (plantImgs.length < plantCount) {
        let img = document.createElement("img");
        img.src = "./Piranha_plant.png";
        plantImgs.push(img);
    }

    for (let i = 0; i < plantCount; i++) {
        let num = getRandomTile();
        while (
            (currentMoleTile && currentMoleTile.id === num) || 
            (plantTiles.some(tile => tile.id === num))
        ) {
            num = getRandomTile();
        }

        let tile = document.getElementById(num);
        tile.appendChild(plantImgs[i]);
        plantTiles.push(tile);
    }
}

function getRandomTile() {
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

function selectTile() {
    if (gameOver) {
        return;
    }
    
    if (this === currentMoleTile) {
        hit.currentTime = 0;
        hit.play();

        score += 10;
        document.getElementById("score").innerText = score.toString();
        currentMoleTile.removeChild(moleImg);
        currentMoleTile = null;

    } else if (plantTiles.includes(this)) {
        miss.currentTime = 0;
        miss.play();
        gameLost();

    } else {
        miss.currentTime = 0;
        miss.play();

        score -= 10;
        document.getElementById("score").innerText = score.toString();
        if (score < 0) {
            gameLost();
        }
    }

}

function gameLost() {
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
    warningPlayed = false;
    document.getElementById("timer").classList.remove("time-warning");

    gameOver = true; 
    document.getElementById("score").innerText = "GAME OVER: " + score.toString();

    let newRecord = false;
    if (score > highScore[difficulty]) {
        highScore[difficulty] = score;
        newRecord = true;
        document.getElementById("highscore").innerText = "High Score (" + difficulty.toString() + ") :" + highScore[difficulty].toString();

        // zoom effect
        document.getElementById("highscore").classList.add("new-record");
        setTimeout(() => {
            document.getElementById("highscore").classList.remove("new-record");
        }, 800);
    }

    document.getElementById("finalScore").innerText = "Score: " + score.toString();
    document.getElementById("finalHighScore").innerText = "High Score (" + difficulty.toString() + ") :" + highScore[difficulty].toString();
    if (newRecord) {
        document.getElementById("record").style.display = "block";
    } else {
        document.getElementById("record").style.display = "none";
    }
    document.getElementById("overlay").style.display = "flex";
}

function resetGame() {
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
    }
    document.getElementById("timer").style.display = "none";
    warningPlayed = false;
    document.getElementById("timer").classList.remove("time-warning");

    score = 0;
    gameOver = false;
    if (currentMoleTile && currentMoleTile.contains(moleImg)) {
        currentMoleTile.removeChild(moleImg);
    }
    currentMoleTile = null;

    plantTiles.forEach(tile => {
        const img = tile.querySelector("img");
        if (img) {
            tile.removeChild(img);
        }
    });
    plantTiles = [];

    document.getElementById("score").innerText = score.toString();
}
