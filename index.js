const savePixels = require("save-pixels");
const ndarray = require("ndarray");


const WIDTH = 5;
const HEIGHT = 5;
const PERCENTAGE_FILLED = 0.4;
const STAGES_AMOUNT = 5;

//Returns two random integers, bounded by max and min
function randomCoords(heightMax, widthMax, heightMin = 0, widthMin = 0) {
    return new Array(Math.floor( Math.random() * (heightMax-heightMin) + heightMin ), Math.floor( Math.random() * (widthMax-widthMin) + widthMin ));
}

//Returns one random integer, bounded by max and min
function randomSingle(max, min = 0) {
    return Math.floor( Math.random() * (max-min) + min );
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

//Get and place root of algorithm, used in every resizing
function placeRoot(currentHeight, currentWidth, root) {
    const random = randomSingle(Math.floor((currentHeight*currentWidth)/2));
    for (let i = 0; i < root.length; i++) {
        if (root[i] === 1) {
            board[Math.floor(random/currentWidth) + random%currentWidth + i] = 1;
        }
    }
    return random;
}

//let board = Array.from({length:HEIGHT}, () => new Array(WIDTH).fill(0));
let board = new Uint8Array(HEIGHT*WIDTH);
let blurryBoard = new Int16Array(board.length);

//Amount of times grid will be resized
for (let i = 0; i < STAGES_AMOUNT; i++) {
    const currentHeight = HEIGHT*(2**i);
    const currentWidth = WIDTH*(2**i);
    let root;
    
    if (i===0) {
        root = placeRoot(currentHeight, currentWidth, [1]);
    } else {
        let newBoard = [...board];
        board = new Uint8Array(currentHeight*currentWidth);
        root = placeRoot(currentHeight, currentWidth, newBoard);
    }
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
                board[random] = 1;
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
    console.log("Stage "+i+" done")
    console.log(board)
}


//For testing results
/*
for (let i = 0; i < board.length; i++) {
    if (board[i] === 1) board[i] = 255;
}

const ndBoard = ndarray(board, [WIDTH*(2**STAGES_AMOUNT), HEIGHT*(2**STAGES_AMOUNT)]);
savePixels(ndBoard, "gif").pipe(process.stdout)
*/