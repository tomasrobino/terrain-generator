const savePixels = require("save-pixels");
const ndarray = require("ndarray");


const WIDTH = 5;
const HEIGHT = 5;
const PERCENTAGE_FILLED = 0.4;
const STAGES_AMOUNT = 10;

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
    let flag = true;
    let aux = 0;
    let prevAux = 0;
    while (flag) {
        let random = Math.floor( Math.random() * adjAmount );
        let counter = 0;
        for (let i = 0; i < adjacenciesBoard.length; i++) {
            for (let k = 0; k < adjacenciesBoard[i].length; k++) {
                if (adjacenciesBoard[i][k]===1) {
                    //Placing tile
                    if (counter===random) {
                        let adjs = 0;
                        if (i>0 && board[i-1][k]===1) adjs++;
                        if (i<board.length-1 && board[i+1][k]===1) adjs++;
                        if (k>0 && board[i][k-1]===1) adjs++;
                        if (k<board[i].length-1 && board[i][k+1]===1) adjs++;
                        if (adjs === 1 || aux-prevAux >20) {
                            adjacenciesBoard[i][k] = 0;
                            board[i][k] = 1;
                            prevAux=aux;
                            return updateAdjacencies(i, k);
                        }
                        aux++;
                    }
                    counter++;
                }
            }
        }
    }
    
}

//Get root of algorithm, used in every resizing
function placeRoot(limitH, limitW, sizeH, sizeW) {
    const newSize = [limitH*2, limitW*2];
    const randomH = randomSingle(newSize[0]-sizeH+1);
    const randomW = randomSingle(newSize[1]-sizeW+1);
    board[limitW*randomH + randomW] = 1;
    return [randomH, randomW];
}

//let board = Array.from({length:HEIGHT}, () => new Array(WIDTH).fill(0));
let board = new Uint8Array(HEIGHT*WIDTH);
let blurryBoard = new Int16Array(board.length);

//Amount of times grid will be resized
let root = placeRoot(HEIGHT, WIDTH, 1, 1);
for (let i = 1; i < STAGES_AMOUNT; i++) {
    const currentHeight = HEIGHT*(2**i);
    const currentWidth = WIDTH*(2**i);
    for (let k = 0; k < currentHeight*currentWidth*PERCENTAGE_FILLED; k++) {
        let randomFlag = true;
        let random;
        do {
            random = randomSingle(currentHeight*currentWidth);
            if (board[random] === 0) {
                randomFlag = false;
            }
        } while (randomFlag);
        board[random] = 2;
        
        //Moving new block
        let flag = true;
        let coordY = Math.floor(random/currentWidth);
        let coordX = random%currentWidth;
        do {
            //Check if adjacent to other block
            if ((coordY!==0 && board[random-currentWidth] !== 0) || (coordY!==currentHeight-1 && board[random+currentWidth] !== 0) || (coordX!==0 && board[random-1] !== 0) || (coordX!==currentWidth-1 && board[random+1] !== 0)) {
                flag = false;
            }
            //Choose movement direction
            let direction = randomSingle(4);
            //Move
            switch (direction) {
                case 0:
                    if(coordY!==0) {
                        board[random] = 0;
                        random-=currentHeight;
                        board[random] = 2;
                    }
                    break;
                case 1:
                    if (coordY!==currentHeight-1) {
                        board[random] = 0;
                        random+=currentHeight;
                        board[random] = 2;
                    }
                    break;
                case 2:
                    if (coordX!==0) {
                        board[random] = 0;
                        random--;
                        board[random] = 2;
                    }
                    break;
                case 3:
                    if (coordX!==currentWidth-1) {
                        board[random] = 0;
                        random++;
                        board[random] = 2;
                    }
                    break;
                default:
                    break;
            }
        } while (flag);
    }
    root = placeRoot(currentHeight, currentWidth, currentHeight/2, currentWidth/2);
    board = new Uint8Array(currentHeight*currentWidth);
}


//For testing results

//const boardPrint = structuredClone(board);
for (let i = 0; i < board.length; i++) {
    for (let k = 0; k < board[i].length; k++) {
        if (board[i][k] === 1) board[i][k] = 255;
    }
}
//Note: the array is transposed
const ndBoard = ndarray(board.flat(), [WIDTH, HEIGHT]);
savePixels(ndBoard, "gif").pipe(process.stdout)