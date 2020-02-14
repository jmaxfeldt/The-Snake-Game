// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const scoreText = document.getElementById("score-text");
const inputText = document.getElementById("input-text");
const snakeLengthText = document.getElementById("snake-length-text");

const width = canvas.width = 825;
const height = canvas.height = 600;
document.getElementById("canvas-container").style.minWidth = width + 50 + "px";
document.getElementById("canvas-container").style.minHeight = height + 25 + "px";

canvas.style.left = "25px";
canvas.style.position = "relative";

const gameStates = Object.freeze({ "pregame": 1, "running": 2, "gameover": 3, "paused": 4, "menu": 5 });
const cellSize = 25; //cell size in pixels.  Must divide evenly into height and width
const cellsX = width / cellSize;
const cellsY = height / cellSize;
const numCells = cellsX * cellsY;

let gameInstance = null;
let gameState = gameStates.pregame;
let cellsPerSecond = 0;
let openCells = numCells;
let startPos = new Vector2(Math.ceil((cellsX - 1) / 2), Math.ceil((cellsY - 1) / 2));
let boardCellsRep = [];
let inputQueue = [];

function random(min, max) {
    const num = Math.floor(Math.random() * (max - min)) + min;
    return num;
}

function Vector2(x, y) {
    this.x = x;
    this.y = y;
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
    this.nextUpdate = startTime;// + initialGameSpeed;

    this.playerSnake;
    this.food;

    this.initializeGame();
}

Game.prototype.initializeGame = function () {
    boardCellsRep.length = 0;
    for (let i = 0; i < numCells; i++) {
        boardCellsRep.push(true);
    }
    this.score = 0;
    this.playerSnake = new Snake(0, -1, 'rgb(0,255,255)', this.initialSnakeLength, this.startPos);
    this.food = new food(this.getNewFoodPos());
    this.gameLoop(); //runs the game loop once to draw the board under the start game popup
}

Game.prototype.gameLoop = function () {
    let curTime = new Date().getTime();

    if (curTime >= this.nextUpdate) {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)'; //creates the black background
        ctx.fillRect(0, 0, width, height);

        //this.drawGrid();

        this.drawCheckerboard();
        //this.drawWall();
        this.food.draw();
        this.playerSnake.update();
        //this.playerSnake.altUpdate();
        this.playerSnake.draw();
        //this.drawCellState();
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
        this.onFoodEaten();
    }
}

Game.prototype.onFoodEaten = function () {
    this.food.position = this.getNewFoodPos();
    this.score++;
    this.speedUp(this.speedUpStep);
    this.playerSnake.segmentQueue += 5;
    scoreText.innerText = "Score: " + this.score.toString();
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
    cellsPerSecond = 1000 / this.gameSpeed;
    inputText.innerText = "Speed: " + cellsPerSecond.toFixed(2).toString();
}

//Just some background drawing stuff from here until Snake
Game.prototype.drawCellState = function () {
    for (let i = 0; i < boardCellsRep.length; i++) {
        ctx.beginPath();
        ctx.arc((i - (Math.floor(i / cellsX) * cellsX)) * cellSize + cellSize / 2, Math.floor(i / cellsX) * cellSize + cellSize / 2, 2, 0, 360);
        //ctx.strokeText(i.toString(), (i - (Math.floor(i / cellsX) * cellsX)) * cellSize + cellSize / 2 - 15/2, Math.floor(i / cellsX) * cellSize + cellSize / 2 + 15/2 );
        if (boardCellsRep[i]) {
            ctx.fillStyle = "rgb(0, 255, 0)";
        }
        else {
            ctx.fillStyle = "rgb(255, 0 , 0)";
        }
        ctx.fill();

        // ctx.font = "15px"
        // ctx.fillStyle = "rgb(255, 255, 255)";
        // ctx.fillText("(" + (i - (Math.floor(i / cellsX) * cellsX)) + "," + Math.floor(i / cellsX) + ")", (i - (Math.floor(i / cellsX) * cellsX)) * cellSize, Math.floor(i / cellsX) * cellSize + 7.5);
    }
}

Game.prototype.drawGrid = function () {
    for (let i = 0; i < cellsX + 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.moveTo(0, i * cellSize)
        ctx.lineTo(width, i * cellSize)
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgb(75, 75, 75)";
        ctx.stroke();

    }
}

Game.prototype.drawCheckerboard = function () {
    for (let i = 0; i < cellsY; i++) {
        for (let j = 0; j < cellsX; j++) {
            ctx.beginPath();
            ctx.rect(j * cellSize, i * cellSize, cellSize, cellSize);
            if ((i + j) % 2 != 0) {
                ctx.fillStyle = "rgb(25,25,25)";
            }
            else {
                ctx.fillStyle = "rgb(0,0,0)";
            }
            ctx.fill();
        }
    }
}

Game.prototype.drawWall = function () {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 102, 0, .8)";
    ctx.lineWidth = 2;
    for (let i = 0; i < cellsX; i++) {
        ctx.strokeRect(i * cellSize, 0, cellSize - 2.5, cellSize - 2.5);
        ctx.strokeRect(i * cellSize, height - cellSize, cellSize - 2.5, cellSize - 2.5);
    }
    for(let j = 1; j < cellsY - 1; j++){
        ctx.strokeRect(0, j * cellSize, cellSize - 2.5, cellSize - 2.5);
        ctx.strokeRect(width - cellSize, j * cellSize, cellSize - 2.5, cellSize - 2.5);
    }
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
    //inputText.innerText = "Input Queue: " + inputQueue.length;

    if (inputQueue.length != 0) {
        this.direction = inputQueue[0];
        inputQueue.shift();
    }

    for (let i = this.segments.length - 1; i > 0; i--) {
        if (i > 0) {
            this.segments[i].x = this.segments[i - 1].x;
            this.segments[i].y = this.segments[i - 1].y;
        }
    }
    this.segments[0].x += this.direction.x;
    this.segments[0].y += this.direction.y;
    boardCellsRep[this.segments[0].y * cellsX + this.segments[0].x] = false;

    // for (let i = this.segments.length - 1; i > 0; i--) {
    //     if (i === 0) {
    //         //this.segments[i].position.addTo(this.direction);
    //         this.segments[i].x += this.direction.x;
    //         this.segments[i].y += this.direction.y;
    //         boardCellsRep[this.segments[i].y * cellsX + this.segments[i].x] = false;
    //         break;
    //     }
    //     this.segments[i].x = this.segments[i - 1].x;
    //     this.segments[i].y = this.segments[i - 1].y;
    // }

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

//This update unshifts and pops on every loop.  I use the normal update above because of unshift's bad performance, but it probably doesn't matter for arrays
//as small as the ones used here 
Snake.prototype.altUpdate = function () {
    if (inputQueue.length != 0) {
        this.direction = inputQueue[0];
        inputQueue.shift();
    }

    this.segments.unshift(new SnakeSegment(this.segments[0].x + this.direction.x, this.segments[0].y + this.direction.y, 'rgb(0, 255, 255)', 'rgb(0,255,255)'));
    boardCellsRep[this.segments[0].y * cellsX + this.segments[0].x] = false;
    if (this.segmentQueue === 0) {
        boardCellsRep[this.segments[this.segments.length - 1].y * cellsX + this.segments[this.segments.length - 1].x] = true;
        this.segments.pop();
    }
    else {
        snakeLengthText.innerText = "Snake Length: " + this.segments.length;
        this.segmentQueue--;
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
                document.getElementById("paused-text").style.display = "block";
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
    closeGameoverPopup();
    openStartGamePopup();
    //gameInstance = new Game(new Date().getTime(), 150, 4, startPos);
}

function openStartGamePopup() {
    gameState = gameStates.pregame;
    gameInstance = new Game(new Date().getTime(), 150, 4, startPos);
    document.getElementById("startgame-popup").style.display = "block";
}

function closeStartGamePopup() {
    document.getElementById("startgame-popup").style.display = "none";
    //gameInstance = new Game(new Date().getTime(), 150, 4, startPos);
    if (gameInstance != null) {
        console.log("There is a game instance");
        gameState = gameStates.running;
        gameInstance.gameLoop();
    }
}

function openGameoverPopup(message) {
    console.log("open popup");
    gameState = gameStates.gameover;
    document.getElementById("gameover-reason").innerText = message;
    document.getElementById("gameover-popup").style.display = "block"
}

function closeGameoverPopup() {
    console.log("close game over popup");
    document.getElementById("gameover-reason").innerText = "Who knows why?";
    document.getElementById("gameover-popup").style.display = "none"
}