// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const deltaText = document.getElementById('delta-time-text');

const width = canvas.width = 680;
const height = canvas.height = 680;

const cellSize = 40; //cell size in pixels
const cellsX = width / cellSize;
const cellsY = height / cellSize;
const numCells = cellsX * cellsY;
var openCells = numCells;
var startPos = new Vector2(Math.ceil((cellsX - 1) / 2), Math.ceil((cellsY - 1) / 2));

var boardCellsRep = [];
var segmentQueue = 4;
var gameSpeed = 200; //this is the number of milliseconds between updates. Lower numbers will will increase the game speed
var isPaused = false;

function Initialize() {
    for (let i = 0; i < numCells; i++) {
        boardCellsRep.push(true);
    }
}

function random(min, max) {
    const num = Math.floor(Math.random() * (max - min)) + min;
    return num;
}

function Snake(xDir, yDir, color) {
    this.segments = [];
    this.direction = new Vector2(xDir, yDir);
    this.color = color;
}

function SnakeSegment(x, y) {
    this.x = x;
    this.y = y;
}

Snake.prototype.draw = function () {
    //test for food location
    ctx.beginPath();
    ctx.rect(foodLocation.x * cellSize +2, foodLocation.y * cellSize + 2, cellSize -4 , cellSize -4);
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fill();

    for (let i = 0; i < this.segments.length; i++) {
        ctx.beginPath();
        //ctx.rect(this.segments[i].x, this.segments[i].y, cellSize, cellSize);
        ctx.rect(this.segments[i].x * cellSize, this.segments[i].y * cellSize, cellSize, cellSize);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

Snake.prototype.update = function () {
    let tmpLast = new Vector2(this.segments[this.segments.length - 1].x, this.segments[this.segments.length - 1].y);
    for (let i = this.segments.length - 1; i > -1; i--) {
        if (i == 0) {
            // this.segments[i].x += this.direction.x * cellSize;
            // this.segments[i].y += this.direction.y * cellSize;
            this.segments[i].x += this.direction.x;
            this.segments[i].y += this.direction.y;
            boardCellsRep[this.segments[i].x * cellsX + this.segments[i].y] = false;
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
        boardCellsRep[tmpLast.x * cellsX + tmpLast.y] = false;
    }
}

function DetectCollisions() {
    if (snake.segments[0].x < 0 || snake.segments[0].x >= width || snake.segments[0].y < 0 || snake.segments[0].y >= height) {
        alert("GAME OVER. (You hit the wall)")
    }
    if(snake.segments[0].x == foodLocation.x && snake.segments[0].y == foodLocation.y){
        segmentQueue++;
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

function GetNewFoodLoc()
{
    let randNum = random(0, boardCellsRep.length);
    if (!boardCellsRep[randNum]) {
        for (let i = randNum + 1; i < boardCellsRep.length; i++) {
            if(boardCellsRep[i]){
                return new Vector2(i - (Math.floor(i/cellsX) * cellsX), Math.floor(i/cellsX));
            }
        }
        for(let j = randNum - 1; j >=0; j--)
        {
            if(boardCellsRep[j]){
                console.log("FOUND A SPOT BACKWARDS");
                return new Vector2(j - (Math.floor(j/cellsX) * cellsX), Math.floor(j/cellsX));
            }
        }
    }  
    return new Vector2(randNum - (Math.floor(randNum/cellsX) * cellsX), Math.floor(randNum/cellsX));
}

let snake = new Snake(0, -1, 'rgb(0,255,255)');  //Find some other way to do all this
snake.segments.push(new SnakeSegment(startPos.x, startPos.y));
boardCellsRep[snake.segments[0].x * cellsX + snake.segments[0].y] = false;
openCells--;
let foodLocation = GetNewFoodLoc();

var start = new Date().getTime();
var lastFrameTime = start;
var nextInterval = start + 1000;
var snakeUpdate = 50;
var nextSnakeUpdate = start + snakeUpdate;
var deltaTime = 0.0;
var frameCount = 0;
var fps = 0;

function GameLoop() {
    let curTime = new Date().getTime();
    deltaTime = curTime - lastFrameTime;
    lastFrameTime = curTime;
    frameCount++;
    if (curTime >= nextInterval) {
        nextInterval = curTime + 1000;
        fps = frameCount;
        frameCount = 0;
    }
    deltaText.innerHTML = "Delta Time: " + deltaTime.toString() + "  -Open Cells: " + openCells.toString();

    if (curTime > nextSnakeUpdate) {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, width, height);

        snake.update();
        snake.draw();
        DetectCollisions();
        nextSnakeUpdate = curTime + gameSpeed;
    }

    if (!isPaused) {
        requestAnimationFrame(GameLoop);
    }
}

let newDirection = new Vector2(0, 0);
addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowRight":
            newDirection = new Vector2(1, 0);
            break;
        case "ArrowLeft":
            newDirection = new Vector2(-1, 0);
            break;
        case "ArrowUp":
            newDirection = new Vector2(0, -1);
            break;
        case "ArrowDown":
            newDirection = new Vector2(0, 1);
            break;
        case "p":
            isPaused = !isPaused;
            if (!isPaused) {
                GameLoop();
            }
            break;
    }
    if (snake.direction.x != -newDirection.x) { //apparently this works for up and down as well as right and left because javascript uses signed zeroes
        snake.direction = newDirection;
    }
})

GameLoop();