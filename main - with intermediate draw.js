// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const intDrawButton = document.querySelector('.int-draw-button');

const width = canvas.width = 1000;
const height = canvas.height = 800;

const cellSize = 20; //cell size in pixels
const cellsX = width / cellSize;
const cellsY = height / cellSize;
const numCells = cellsX * cellsY;
var openCells = numCells;
var startPos = new Vector2(Math.ceil((cellsX - 1) / 2), Math.ceil((cellsY - 1) / 2));

let boardCellsRep = [];
let inputQueue = [];
let isIntDraw = false;
var segmentQueue = 4;
var gameSpeed = 20; //this is the number of milliseconds between updates. Lower numbers will will increase the game speed
var isPaused = false;

console.log("Before Everything: " + boardCellsRep.length);

function InitializeGame() {
    console.log("Before: " + boardCellsRep.length);
    boardCellsRep.length = 0;
    for (let i = 0; i < numCells; i++) {
        console.log("NumCells: " + numCells);
        boardCellsRep.push(true);
    }
    console.log("After: " + boardCellsRep.length);
}

function random(min, max) {
    const num = Math.floor(Math.random() * (max - min)) + min;
    return num;
}

function Snake(xDir, yDir, color, lastPosition) {
    this.segments = [];
    this.direction = new Vector2(xDir, yDir);
    this.color = color;
    this.lastPosition = lastPosition;
}

function SnakeSegment(x, y) {
    this.x = x;
    this.y = y;
}

Snake.prototype.draw = function () {
    //test for food location
    ctx.beginPath();
    ctx.rect(foodLocation.x * cellSize + 5, foodLocation.y * cellSize + 5, cellSize - 10, cellSize - 10);
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fill();

    for (let i = 0; i < this.segments.length; i++) {
        ctx.beginPath();
        ctx.rect(this.segments[i].x * cellSize + 2, this.segments[i].y * cellSize + 2, cellSize - 4, cellSize - 4);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Snake.prototype.intermediateDraw = function (percentNext) {
//     let newDrawLoc = new Vector2(this.direction.x * percentNext + this.lastPosition.x, this.direction.y * percentNext + this.lastPosition.y);
//     //let newDrawLoc = new Vector2(this.direction.x * percentNext + this.segments[0].x, this.direction.y * percentNext + this.segments[0].y);
//     console.log("New Int Draw Location:  X:" + newDrawLoc.x + "  Y: " + newDrawLoc.y);
//     ctx.beginPath();
//     ctx.rect(newDrawLoc.x * cellSize, newDrawLoc.y * cellSize, cellSize, cellSize);
//     ctx.fillStyle = this.color;
//     ctx.fill();
// }

Snake.prototype.update = function () {
    let tmpLast = new Vector2(this.segments[this.segments.length - 1].x, this.segments[this.segments.length - 1].y);
    for (let i = inputQueue.length - 1; i >= 0; i--) {
        if (snake.direction.x != -inputQueue[i].x) { //apparently this works for up and down as well as right and left because javascript uses signed zeroes
            snake.direction = inputQueue[i];
            inputQueue.length = 0;
            break;
        }
    }
    for (let i = this.segments.length - 1; i > -1; i--) {
        if (i == 0) {
            //console.log("Head Position Before Update-  X:" + this.segments[i].x + "  Y: " + this.segments[i].y);
            this.lastPosition = new Vector2(this.segments[i].x, this.segments[i].y);
            //console.log("Last Position:  X: " + this.lastPosition.x + "  -Y: " + this.lastPosition.y);
            this.segments[i].x += this.direction.x;
            this.segments[i].y += this.direction.y;
            //console.log("Head Position After Update-  X: " + this.segments[i].x + "  Y: " + this.segments[i].y);
            //console.log("Last Position after position update:  X: " + this.lastPosition.x + "  -Y: " + this.lastPosition.y);
            boardCellsRep[this.segments[i].y * cellsX + this.segments[i].x] = false;
            break;
        }
        this.segments[i].x = this.segments[i - 1].x;
        this.segments[i].y = this.segments[i - 1].y;
    }
    if (segmentQueue > 0) {
        this.segments.push(new SnakeSegment(tmpLast.x, tmpLast.y));
        openCells--;
        segmentQueue--;
    }
    else {
        //boardCellsRep[tmpLast.x * cellsX + tmpLast.y] = true;
        boardCellsRep[tmpLast.y * cellsX + tmpLast.x] = true;
    }
}

function DetectCollisions() {
    if (snake.segments[0].x < 0 || snake.segments[0].x >= cellsX || snake.segments[0].y < 0 || snake.segments[0].y >= cellsY) {
        alert("GAME OVER. (You hit the wall)")
    }
    if (snake.segments[0].x == foodLocation.x && snake.segments[0].y == foodLocation.y) {
        segmentQueue+=5;
        foodLocation = GetNewFoodLoc();
    }
    for (let i = 1; i < snake.segments.length; i++) {
        if (snake.segments[0].x == snake.segments[i].x && snake.segments[0].y == snake.segments[i].y) {
            alert("GAME OVER. (You ate your own dang self");
        }
    }
}

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

function GetNewFoodLoc() {
    let randNum = random(0, boardCellsRep.length);
    if (!boardCellsRep[randNum]) {
        for (let i = randNum + 1; i < boardCellsRep.length; i++) {
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

let snake = new Snake(0, -1, 'rgb(0,255,255)', startPos);  //Find some other way to do all this
snake.segments.push(new SnakeSegment(startPos.x, startPos.y));
boardCellsRep[snake.segments[0].x * cellsX + snake.segments[0].y] = false;
openCells--;
let foodLocation = GetNewFoodLoc();

let start = new Date().getTime();
let lastUpdate = start;
let nextSnakeUpdate = start + gameSpeed;

function GameLoop() {
    let curTime = new Date().getTime();

    if (curTime > nextSnakeUpdate) {
        ctx.fillStyle = 'rgba(0, 0, 0, .5)'; //creates the black background
        ctx.fillRect(0, 0, width, height);

        snake.update();
        snake.draw();
        DetectCollisions();
        nextSnakeUpdate = curTime + gameSpeed;
        lastUpdate = curTime;
    }
    else {
        //if (isIntDraw) {
            //snake.intermediateDraw(1 / gameSpeed * (curTime - lastUpdate));
        //}
    }

    if (!isPaused) {
        requestAnimationFrame(GameLoop);
    }
}

let newDirection = new Vector2(0, 0);
addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowRight":
            inputQueue.push(new Vector2(1, 0));
            break;
        case "ArrowLeft":
            inputQueue.push(new Vector2(-1, 0));
            break;
        case "ArrowUp":
            inputQueue.push(new Vector2(0, -1));
            break;
        case "ArrowDown":
            inputQueue.push(new Vector2(0, 1));
            break;
        case "p":
            isPaused = !isPaused;
            if (!isPaused) {
                GameLoop();
            }
            break;
    }
})

intDrawButton.addEventListener('click', function () {
    isIntDraw = !isIntDraw;
    if (isIntDraw) {
        intDrawButton.innerHTML = "Int Draw: ON"
    }
    else {
        intDrawButton.innerHTML = "Int Draw: OFF"
    }

})

InitializeGame();
GameLoop();