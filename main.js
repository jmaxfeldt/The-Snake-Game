// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const deltaText = document.getElementById('delta-time-text');

const width = canvas.width = 820;  //canvas.width = window.innerWidth;
const height = canvas.height = 820; //canvas.height = window.innerHeight;

var cellSize = 20;
var segmentQueue = 5;
var isPaused = false;

// function to generate random number

function random(min, max) {
    const num = Math.floor(Math.random() * (max - min)) + min;
    return num;
}

function Snake(startX, startY, initialLength, xDir, yDir) {
    this.segments = [];
    this.headPos = new Vector2(startX, startY);
    this.length = initialLength;
    this.direction = new Vector2(xDir, yDir);
}

function SnakeSegment(x, y) {
    this.x = x;
    this.y = y;
}

Snake.prototype.draw = function () {
    for (let i = 0; i < this.segments.length; i++) {
        ctx.beginPath();
        ctx.rect(this.segments[i].x, this.segments[i].y, cellSize, cellSize)
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fill();
    }
}

Snake.prototype.update = function () {
    let tmpLast = new Vector2(this.segments[this.segments.length - 1].x, this.segments[this.segments.length - 1].y);
    for (let i = this.segments.length - 1; i > -1; i--) {
        if (i == 0) {
            this.segments[i].x += this.direction.x * cellSize;
            this.segments[i].y += this.direction.y * cellSize;
            break;
        }
        this.segments[i].x = this.segments[i - 1].x;
        this.segments[i].y = this.segments[i - 1].y;
    }
    if (segmentQueue > 0) {
        this.segments.push(new SnakeSegment(tmpLast.x, tmpLast.y));
        segmentQueue--;
    }
}

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

let snake = new Snake(400, 400, 1, 0, -1);
snake.segments.push(new SnakeSegment(400, 400));

var start = new Date().getTime();
var lastFrameTime = start;
var nextInterval = start + 1000;
var snakeUpdate = 50;
var nextSnakeUpdate = start + snakeUpdate;
var deltaTime = 0.0;
var frameCount = 0;
var fps = 0;

function loop() {
    let curTime = new Date().getTime();
    deltaTime = curTime - lastFrameTime;
    lastFrameTime = curTime;
    frameCount++;
    if (curTime >= nextInterval) {
        nextInterval = curTime + 1000;
        fps = frameCount;
        frameCount = 0;
    }
    deltaText.innerHTML = "Delta Time: " + deltaTime.toString() + "  -FPS: " + fps.toString();

    if (curTime > nextSnakeUpdate) {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, width, height);

        snake.update();
        snake.draw();
        nextSnakeUpdate = curTime + snakeUpdate;
    }

    if (!isPaused) {
        //loop();
        requestAnimationFrame(loop);
    }
}

addEventListener("keyup", function (event) {
    if (event.keyCode == 32) {
        isPaused = !isPaused;

        if (!isPaused) {
            loop();
        }
    }
});

addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowRight":
            snake.direction.x = 1;
            snake.direction.y = 0;
            break;
        case "ArrowLeft":
            snake.direction.x = -1;
            snake.direction.y = 0;
            break;
        case "ArrowUp":
            snake.direction.x = 0;
            snake.direction.y = -1;
            break;
        case "ArrowDown":
            snake.direction.x = 0;
            snake.direction.y = 1;
            break;
    }
})

loop();
//snake.draw();

// function DrawCells() {
//     let horizontalCells = width / cellSize;
//     let verticalCells = height / cellSize;

//     for (let i = 0; i < verticalCells; i++) {
//         for (let j = 0; j < horizontalCells; j++) {
//             ctx.beginPath();
//             ctx.rect(j * cellSize, i * cellSize, cellSize, cellSize)
//             ctx.fillStyle = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
//             //ctx.fillStyle = 'rgba(' + (255 - j) + ',' + 0 + ',' + 0 + ',' + 1 + ')';
//             ctx.fill();
//         }
//     }
// }