const WIDTH = 25;
const HEIGHT = 25;

//Returns two random integers, bounded by max and min
function randomCoords(heightMax, widthMax, heightMin = 0, widthMin = 0) {
    return new Array(Math.floor( Math.random() * (heightMax-heightMin) + heightMin ), Math.floor( Math.random() * (widthMax-widthMin) + widthMin ));
}

//Returns one random integer, bounded by max and min
function randomSingle(max, min = 0) {
    return new Array(Math.floor( Math.random() * (max-min) + min ));
}

function updateAdjacencies(coordY, coordX) {
    let adjAmount = 0;
    if (coordY!==0) {
        if (board[coordY-1][coordX] !== 1 && adjacenciesBoard[coordY-1, coordX] !== 1) {
            adjacenciesBoard[coordY-1, coordX] = 1;
            adjAmount++;
        }
    }
    if (coordY!==HEIGHT-1) {
        if (board[coordY+1][coordX] !== 1 && adjacenciesBoard[coordY+1, coordX] !== 1) {
            adjacenciesBoard[coordY+1, coordX] = 1;
            adjAmount++;
        }
    }
    if (coordX!==0) {
        if (board[coordX][coordX-1] !== 1 && adjacenciesBoard[coordY, coordX-1] !== 1) {
            adjacenciesBoard[coordY, coordX-1] = 1;
            adjAmount++;
        }
    }
    if (coordX!==WIDTH-1) {
        if (board[coordY][coordX+1] !== 1 && adjacenciesBoard[coordY, coordX+1] !== 1) {
            adjacenciesBoard[coordY, coordX+1] = 1;
            adjAmount++;
        }
    }
    
    return adjAmount;
}

const board = new Array(HEIGHT).fill(new Array(WIDTH).fill(0));
const adjacenciesBoard = new Array(HEIGHT).fill(new Array(WIDTH).fill(0));
let adjAmount = 0;

const root = randomCoords(HEIGHT, WIDTH); //Root for DLA
board[root[0]][root[1]] = 1;