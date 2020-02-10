// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById("score-text");
const inputText = document.getElementById("input-text");
const snakeLengthText = document.getElementById("snake-length-text");

const width = canvas.width = 1000;
const height = canvas.height = 800;
canvas.style.left = "25px";
canvas.style.position = "relative";

const cellSize = 20; //cell size in pixels
const cellsX = width / cellSize;
const cellsY = height / cellSize;
const numCells = cellsX * cellsY;

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
    this.gameLoop();
}

Game.prototype.initializeGame = function () {
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
        ctx.fillStyle = 'rgba(0, 0, 0, .5)'; //creates the black background
        ctx.fillRect(0, 0, width, height);

        this.food.draw();
        this.playerSnake.update();
        this.playerSnake.draw();
        this.detectCollisions();
        this.nextUpdate = curTime + this.gameSpeed;
    }

    if (!isPaused) {
        requestAnimationFrame(this.boundLoop);
    }
}

Game.prototype.detectCollisions = function () {
    if (this.playerSnake.segments[0].x < 0 || this.playerSnake.segments[0].x >= cellsX || this.playerSnake.segments[0].y < 0 || this.playerSnake.segments[0].y >= cellsY) {
        alert("GAME OVER. (You hit the wall)")
        this.initializeGame();
    }
    for (let i = 1; i < this.playerSnake.segments.length; i++) {
        if (this.playerSnake.segments[0].x == this.playerSnake.segments[i].x && this.playerSnake.segments[0].y == this.playerSnake.segments[i].y) {
            alert("GAME OVER. (You ate your own dang self");
        }
    }
    if (this.playerSnake.segments[0].x == this.food.position.x && this.playerSnake.segments[0].y == this.food.position.y) {
        this.score++;
        this.speedUp(this.speedUpStep);
        scoreText.innerHTML = "Score: " + this.score.toString();
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

Game.prototype.speedUp = function(speedStep){
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
    inputText.innerHTML = "Input Queue: " + inputQueue.length;

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
        snakeLengthText.innerHTML = "Snake Length: " + this.segments.length;
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
    ctx.arc(this.position.x * cellSize + cellSize/2, this.position.y * cellSize + cellSize/2, cellSize/2 - 5, 0, 360);
    //ctx.rect(this.position.x * cellSize + 5, this.position.y * cellSize + 5, cellSize - 10, cellSize - 10);
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fill();
}

addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowRight":
            AddInput(new Vector2(1, 0));
            //inputQueue.push(new Vector2(1, 0));
            break;
        case "ArrowLeft":
            AddInput(new Vector2(-1, 0));
            //inputQueue.push(new Vector2(-1, 0));
            break;
        case "ArrowUp":
            AddInput(new Vector2(0, -1));
            //inputQueue.push(new Vector2(0, -1));
            break;
        case "ArrowDown":
            AddInput(new Vector2(0, 1));
            //inputQueue.push(new Vector2(0, 1));
            break;
        case "p":
            isPaused = !isPaused;
            if (!isPaused) {
                newGame.gameLoop();
            }
            break;
    }
})

let newGame = new Game(new Date().getTime(), 150, 4, startPos);

function AddInput(input) {
    if (inputQueue.length === 0 && newGame.playerSnake.direction.x != -input.x) {
        if ((input.x != newGame.playerSnake.direction.x && input.y != newGame.playerSnake.direction.y)) { //doesn't allow inputs that match the current direction
            inputQueue.push(input);
        }
    }
    else if (inputQueue.length === 1 && inputQueue[0].x != -input.x) {
        if ((input.x != inputQueue[0].x && input.y != inputQueue[0].y)) {
            inputQueue.push(input);
        }
    }
}