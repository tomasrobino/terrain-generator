const fs = require("node:fs");
const sharp = require("sharp");


const WIDTH = 20;
const HEIGHT = 20;
const PERCENTAGE_FILLED = 0.2;
const STAGES_AMOUNT = 2;


//Returns one random integer, bounded by max and min
function randomSingle(max, min = 0) {
    return Math.floor( Math.random() * (max-min) + min );
}

//Get and place root of algorithm, used in every resizing
function placeRoot(currentHeight, currentWidth, root) {
    const random = randomSingle(Math.floor((currentHeight*currentWidth)/4));
    let offset = 0;
    //Position of random within square of permitted spawn places
    let coordY = Math.floor(random/(Math.floor(currentWidth/2)));
    let coordX = random%(Math.floor(currentWidth/2));

    //Real position of random
    let position = coordY*currentWidth + coordX;
    for (let i = 0; i < root.length; i++) {
        if (root[i] !== 0) {
            if ((i+1)%Math.floor(currentWidth/2) === 0) {
                offset += Math.floor(currentWidth/2);
            }
            board[offset+i+position] = 100;
        }
    }
    return random;
}

//Only for testing
function printBoard(board, currentWidth) {
    for (let x = 0; x < Math.floor(board.length/currentWidth); x++) {
        let arr = [];
        for (let z = 0; z < currentWidth; z++) {
            arr.push(board[x*currentWidth + z]);
        }
        console.log(arr);
    }
}

async function saveToFile(array, width, height, destination) {
    let img = sharp(array, {raw: { width: width, height: height, channels: 1 }});
    await img.toFile(destination);
}

async function main() {
    let board = new Uint8Array(HEIGHT*WIDTH);
    let blurryBoard = new Int16Array(board.length);

    for (let i = 0; i < STAGES_AMOUNT; i++) {
        const currentHeight = HEIGHT*(2**i);
        const currentWidth = WIDTH*(2**i);
        let root;
        
        if (i===0) {
            root = placeRoot(currentHeight, currentWidth, [1]);
        } else {
            //printBoard(board, Math.floor(currentWidth/2))
            let newBoard = new Uint8Array(board);
            //printBoard(newBoard, Math.floor(currentWidth/2))
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
            //Check if adjacent to other block
            do {
                let coordY = Math.floor(random/currentWidth);
                let coordX = random%currentWidth;
                if ((coordY!==0 && board[random-currentWidth] !== 0) || (coordY!==currentHeight-1 && board[random+currentWidth] !== 0) || (coordX!==0 && board[random-1] !== 0) || (coordX!==currentWidth-1 && board[random+1] !== 0)) {
                    flag = false;
                    board[random] = 1;
                }
                //Choose movement direction
                let direction = randomSingle(4);
                //Move
                if (flag) {
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
                }
            } while (flag);
        }
        //For testing
        for (let i = 0; i < board.length; i++) {
            if (board[i] === 1) board[i] = 255;
        }
        await saveToFile(board, currentWidth, currentHeight, "results/stage"+(i+1)+".gif")
    }
}

main()


//For testing results