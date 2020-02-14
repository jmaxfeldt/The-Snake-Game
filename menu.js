function changeBoardSize(newWidth, newHeight){
    width = canvas.width = newWidth;
    height = canvas.height = newHeight;
    document.getElementById("canvas-container").style.minWidth = width + 50 + "px";
    document.getElementById("canvas-container").style.minHeight = height + 25 + "px";
    cellsX = width / cellSize;
    cellsY = height / cellSize;
    openStartGamePopup();
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