const WIDTH = 10;
const HEIGHT = 10;
const AMOUNT = 0.4;

//Returns two random integers, bounded by max and min
function randomCoords(heightMax, widthMax, heightMin = 0, widthMin = 0) {
    return new Array(Math.floor( Math.random() * (heightMax-heightMin) + heightMin ), Math.floor( Math.random() * (widthMax-widthMin) + widthMin ));
}

//Returns one random integer, bounded by max and min
function randomSingle(max, min = 0) {
    return new Array(Math.floor( Math.random() * (max-min) + min ));
}

//Update adjacenciesBoard surrounding given coordinates
function updateAdjacencies(coordY, coordX) {
    let adjAmount = -1;
    if (coordY!==0) {
        if (board[coordY-1][coordX] !== 1 && adjacenciesBoard[coordY-1][coordX] !== 1) {
            adjacenciesBoard[coordY-1][coordX] = 1;
            adjAmount++;
        }
    }
    if (coordY!==HEIGHT-1) {
        if (board[coordY+1][coordX] !== 1 && adjacenciesBoard[coordY+1][coordX] !== 1) {
            adjacenciesBoard[coordY+1][coordX] = 1;
            adjAmount++;
        }
    }
    if (coordX!==0) {
        if (board[coordY][coordX-1] !== 1 && adjacenciesBoard[coordY][coordX-1] !== 1) {
            adjacenciesBoard[coordY][coordX-1] = 1;
            adjAmount++;
        }
    }
    if (coordX!==WIDTH-1) {
        if (board[coordY][coordX+1] !== 1 && adjacenciesBoard[coordY][coordX+1] !== 1) {
            adjacenciesBoard[coordY][coordX+1] = 1;
            adjAmount++;
        }
    }

    
    return adjAmount;
}

//Places tile, calls and returns updateAdjacencies()
function placeAdjacent(adjAmount) {
    //Iterate adjacencies board, counting until finding the tile selected with a single random number
    let random = Math.floor( Math.random() * adjAmount );
    let counter = 0;
    for (let i = 0; i < adjacenciesBoard.length; i++) {
        for (let k = 0; k < adjacenciesBoard[i].length; k++) {
            if (adjacenciesBoard[i][k]===1) {
                //Placing tile
                if (counter===random) {
                    adjacenciesBoard[i][k] = 0;
                    board[i][k] = 1;
                    return updateAdjacencies(i, k);
                }
                counter++;
            }
        }
    }
}

const board = Array.from({length:HEIGHT}, () => new Array(WIDTH).fill(0));
const adjacenciesBoard = Array.from({length:HEIGHT}, () => new Uint8ClampedArray(WIDTH));
let adjAmount = 0;

//const root = randomCoords(HEIGHT, WIDTH); //Root for DLA
const root = [Math.floor(HEIGHT/2), Math.floor(WIDTH/2)];
board[root[0]][root[1]] = 1;
adjAmount+=updateAdjacencies(root[0], root[1]);
adjAmount++;

for (let i = 1; i < HEIGHT*WIDTH*AMOUNT; i++) {
    adjAmount+=placeAdjacent(adjAmount);
}
console.table(board)