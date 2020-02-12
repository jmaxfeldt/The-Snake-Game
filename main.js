// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const scoreText = document.getElementById("score-text");
const inputText = document.getElementById("input-text");
const snakeLengthText = document.getElementById("snake-length-text");

const width = canvas.width = 800;
const height = canvas.height = 600;
document.getElementById("canvas-container").style.minWidth = width + 50 + "px";
document.getElementById("canvas-container").style.minHeight = height + 25 + "px";

canvas.style.left = "25px";
canvas.style.position = "relative";

const gameStates = Object.freeze({ "pregame": 1, "running": 2, "gameover": 3, "paused": 4 });
const cellSize = 25; //cell size in pixels
const cellsX = width / cellSize;
const cellsY = height / cellSize;
const numCells = cellsX * cellsY;

let gameInstance = null;
let gameState = gameStates.pregame;
let cellsPerSecond;
let openCells = numCells;
let startPos = new Vector2(Math.ceil((cellsX - 1) / 2), Math.ceil((cellsY - 1) / 2));
let boardCellsRep = [];
let inputQueue = [];
let isPaused = false;

function random(min, max) {
    const num = Math.floor(Math.random() * (max - min)) + min;
    return num;
}

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

Vector2.prototype.addTo = function (vector) {
    this.x += vector.x;
    this.y += vector.y;
}

function GameBoard() {
    this.boardCellsRep = [];
    this.cellSize = 20;
    this.numCellsX = width / this.cellSize;
    this.numCellsY = height / this.cellSize;
    this.numCells = this.numCellsX * this.numcellsY;
}

GameBoard.prototype.initBoard = function () {
    this.boardCellsRep.length = 0;
    for (let i = 0; i < numCells; i++) {
        this.boardCellsRep.push(true);
    }
}

function Game(startTime, initialGameSpeed, initialSnakeLength, startPos) {
    this.boundLoop = this.gameLoop.bind(this);
    this.startTime = startTime;
    this.startPos = startPos;
    this.gameSpeed = initialGameSpeed;
    this.speedUpStep = .02;
    this.maxSpeed = 30;
    let score = 0;
    this.initialSnakeLength = initialSnakeLength;
    this.nextUpdate = startTime + initialGameSpeed;

    console.log("startPos: " + startPos.toString());

    this.playerSnake;
    this.food;

    this.initializeGame();
}

Game.prototype.initializeGame = function () {
    console.log("Initialize game");
    boardCellsRep.length = 0;
    for (let i = 0; i < numCells; i++) {
        boardCellsRep.push(true);
    }
    this.score = 0;
    this.playerSnake = new Snake(0, -1, 'rgb(0,255,255)', this.initialSnakeLength, this.startPos);
    this.food = new food(this.getNewFoodPos()); 
}

Game.prototype.gameLoop = function () {
    let curTime = new Date().getTime();

    if (curTime > this.nextUpdate) {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)'; //creates the black background
        ctx.fillRect(0, 0, width, height);

        this.food.draw();
        this.playerSnake.update();
        this.playerSnake.draw();
        this.detectCollisions();
        this.nextUpdate = curTime + this.gameSpeed;
    }
   
    if (gameState === gameStates.running) {
        requestAnimationFrame(this.boundLoop);
    }
    
}

Game.prototype.detectCollisions = function () {
    if (this.playerSnake.segments[0].x < 0 || this.playerSnake.segments[0].x >= cellsX || this.playerSnake.segments[0].y < 0 || this.playerSnake.segments[0].y >= cellsY) {
        openGameoverPopup("(You hit the wall)");
    }
    for (let i = 1; i < this.playerSnake.segments.length; i++) {
        if (this.playerSnake.segments[0].x == this.playerSnake.segments[i].x && this.playerSnake.segments[0].y == this.playerSnake.segments[i].y) {
            openGameoverPopup("(You ate yourself)");
        }
    }
    if (this.playerSnake.segments[0].x == this.food.position.x && this.playerSnake.segments[0].y == this.food.position.y) {
        this.score++;
        this.speedUp(this.speedUpStep);
        cellsPerSecond = 1000 / this.gameSpeed
        scoreText.innerText = "Score: " + this.score.toString();
        this.playerSnake.segmentQueue += 5;
        this.food.position = this.getNewFoodPos();
    }
}

Game.prototype.getNewFoodPos = function () {
    let randNum = random(0, numCells);
    if (!boardCellsRep[randNum]) {
        for (let i = randNum + 1; i < numCells; i++) {
            if (boardCellsRep[i]) {
                return new Vector2(i - (Math.floor(i / cellsX) * cellsX), Math.floor(i / cellsX));
            }
        }
        for (let j = randNum - 1; j >= 0; j--) {
            if (boardCellsRep[j]) {
                return new Vector2(j - (Math.floor(j / cellsX) * cellsX), Math.floor(j / cellsX));
            }
        }
    }
    return new Vector2(randNum - (Math.floor(randNum / cellsX) * cellsX), Math.floor(randNum / cellsX));
}

Game.prototype.speedUp = function (speedStep) {
    this.gameSpeed -= this.gameSpeed * speedStep;
}

function Snake(xDir, yDir, color, initialLength, startPos) {
    this.segmentQueue = initialLength;
    this.segments = [];
    this.direction = new Vector2(xDir, yDir);
    this.color = color;

    this.segments.push(new SnakeSegment(startPos.x, startPos.y, 'rgb(0,255,255)', 'rgb(0,255,255)'))
}

Snake.prototype.draw = function () {
    for (let i = 0; i < this.segments.length; i++) {
        ctx.beginPath();
        ctx.rect(this.segments[i].x * cellSize + 2, this.segments[i].y * cellSize + 2, cellSize - 4, cellSize - 4);
        ctx.fillStyle = this.segments[i].currentColor;
        ctx.fill();
    }
}

Snake.prototype.update = function () {
    let tmpLast = new Vector2(this.segments[this.segments.length - 1].x, this.segments[this.segments.length - 1].y);
    inputText.innerText = "Input Queue: " + inputQueue.length;

    if (inputQueue.length != 0) {
        this.direction = inputQueue[0];
        inputQueue.shift();
    }


    for (let i = this.segments.length - 1; i > -1; i--) {
        if (i == 0) {
            //this.segments[i].position.addTo(this.direction);
            this.segments[i].x += this.direction.x;
            this.segments[i].y += this.direction.y;
            boardCellsRep[this.segments[i].y * cellsX + this.segments[i].x] = false;
            break;
        }
        this.segments[i].x = this.segments[i - 1].x;
        this.segments[i].y = this.segments[i - 1].y;
    }
    if (this.segmentQueue > 0) {
        this.segments.push(new SnakeSegment(tmpLast.x, tmpLast.y, 'rgb(0, 255, 255)', 'rgb(0,255,255)'));
        snakeLengthText.innerText = "Snake Length: " + this.segments.length;
        openCells--;
        this.segmentQueue--;
    }
    else {
        //boardCellsRep[tmpLast.x * cellsX + tmpLast.y] = true;
        boardCellsRep[tmpLast.y * cellsX + tmpLast.x] = true;
    }
}

function SnakeSegment(x, y, defaultColor, currentColor) {
    this.x = x;
    this.y = y;
    //this.position = new Vector2(x, y);
    this.defaultColor = defaultColor;
    this.currentColor = currentColor;
}

function food(position) {
    this.position = position;
}

food.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.position.x * cellSize + cellSize / 2, this.position.y * cellSize + cellSize / 2, cellSize / 2 - 5, 0, 360);
    //ctx.rect(this.position.x * cellSize + 5, this.position.y * cellSize + 5, cellSize - 10, cellSize - 10);
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fill();
}

addEventListener("keydown", function (event) {
    if (gameState === gameStates.pregame) {
        //console.log("Pregame input mode");
        closeStartGamePopup();
    }
    else if (gameState === gameStates.gameover) {
        //console.log("game over input mode");
        if (event.key === "Enter") {
            closeGameoverPopup();
            openStartGamePopup();
        }
    }
    else if (gameState === gameStates.paused) {
        //console.log("paused input mode");
        if (event.key === " " || event.key === "p") {
            document.getElementById("paused-text").style.display = "none";
            gameState = gameStates.running;
            gameInstance.gameLoop();
        }
    }
    else {
        //console.log("running input mode");
        switch (event.key) {
            
            case "ArrowRight":
            case "d":
                AddInput(new Vector2(1, 0));
                break;
            case "ArrowLeft":
            case "a":
                AddInput(new Vector2(-1, 0));
                break;
            case "ArrowUp":
            case "w":
                AddInput(new Vector2(0, -1));
                break;
            case "ArrowDown":
            case "s":
                AddInput(new Vector2(0, 1));
                break;
            case " ":
            case "p":
                //isPaused = !isPaused;
                document.getElementById("paused-text").style.display = "block";
                //if (!isPaused) {
                if (gameState === gameStates.running) {
                    console.log("Pausing game...");
                    gameState = gameStates.paused;
                }
                break;
        }
    }
})

//gameInstance = new Game(new Date().getTime(), 150, 4, startPos);
openStartGamePopup();

function AddInput(input) {
    if (inputQueue.length === 0 && gameInstance.playerSnake.direction.x != -input.x) {
        if ((input.x != gameInstance.playerSnake.direction.x && input.y != gameInstance.playerSnake.direction.y)) { //doesn't allow inputs that match the current direction
            inputQueue.push(input);
        }
    }
    else if (inputQueue.length === 1 && inputQueue[0].x != -input.x) {
        if ((input.x != inputQueue[0].x && input.y != inputQueue[0].y)) {
            inputQueue.push(input);
        }
    }
}

document.getElementById("play-again-btn").onclick = function () {
    console.log("play again button");
    //isPaused = false;
    closeGameoverPopup();
    openStartGamePopup();
    //gameInstance = new Game(new Date().getTime(), 150, 4, startPos);
}

function openGameoverPopup(message) {
    console.log("open popup");
    isPaused = true;
    gameState = gameStates.gameover;
    document.getElementById("gameover-reason").innerText = message;
    document.getElementById("gameover-popup").style.display = "block"
}

function closeGameoverPopup() {
    console.log("close game over popup");
    document.getElementById("gameover-reason").innerText = "Who knows why?";
    document.getElementById("gameover-popup").style.display = "none"
}

function openStartGamePopup() {
    gameState = gameStates.pregame;
    document.getElementById("startgame-popup").style.display = "block";
}

function closeStartGamePopup() {
    document.getElementById("startgame-popup").style.display = "none";
    gameInstance = new Game(new Date().getTime(), 150, 4, startPos);
    if (gameInstance != null) {
        console.log("There is a game instance");
        gameState = gameStates.running;
        gameInstance.gameLoop();
    }
}