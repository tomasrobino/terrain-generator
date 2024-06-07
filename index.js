const fs = require("node:fs");
const sharp = require("sharp");


const WIDTH = 20;
const HEIGHT = 20;
const PERCENTAGE_FILLED = 0.2;
const STAGES_AMOUNT = 5;


//Returns one random integer, bounded by max and min
function randomSingle(max, min = 0) {
    return Math.floor( Math.random() * (max-min) + min );
}

//Get and place root of algorithm, used in every resizing
function placeRoot(currentHeight, currentWidth, root, board) {    
    let offset = 0;
    let oldWidth = Math.floor(currentWidth/2);
    let blockCounter = 0;
    for (let i = 0; i < root.length; i++) {
        if (root[i] !== 0) {
            board[(2*i)+offset] = root[i];
            switch (root[i]) {
                case 2:
                    board[(2*i)+offset-currentWidth] = 2;
                    break;
                case 3:
                    board[(2*i)+offset+1] = 3;
                    break;
                case 4:
                    board[(2*i)+offset+currentWidth] = 4;
                    break;
                case 5:
                    board[(2*i)+offset-1] = 5;
                    break;
                default:
                    break;
            }
            blockCounter+=2;
        }
        if ((i+1)%oldWidth === 0) {
            offset += currentWidth;
        }
    }
    return blockCounter;
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
        let blockCounter = 1;
        if (i===0) {
            root = randomSingle(Math.floor((currentHeight*currentWidth)));
            board[root] = 1;
            blockCounter++;
        } else {
            let oldBoard = new Uint8Array(board);
            board = new Uint8Array(currentHeight*currentWidth);
            blockCounter += placeRoot(currentHeight, currentWidth, oldBoard, board);
        }
        for (let k = 0; k < currentHeight*currentWidth*PERCENTAGE_FILLED - blockCounter; k++) {
            let randomFlag = true;
            let random;
            do {
                random = randomSingle(currentHeight*currentWidth);
                if (board[random] === 0) {
                    randomFlag = false;
                }
                
            } while (randomFlag);
            
            //Moving new block
            let flag = true;
            //Check if adjacent to other block
            do {
                let coordY = Math.floor(random/currentWidth);
                let coordX = random%currentWidth;
                //If there's a block above
                if (coordY!==0 && board[random-currentWidth] !== 0) {
                    board[random] = 2;
                    blockCounter++;
                    flag = false;
                //If there's a block below
                } else if (coordY!==currentHeight-1 && board[random+currentWidth] !== 0) {
                    board[random] = 4;
                    blockCounter++;
                    flag = false;
                //If there's a block on the right
                } else if (coordX!==0 && board[random-1] !== 0) {
                    board[random] = 5;
                    blockCounter++;
                    flag = false;
                //If there's a block on the left
                } else if (coordX!==currentWidth-1 && board[random+1] !== 0) {
                    board[random] = 3;
                    blockCounter++;
                    flag = false;
                //If there's no adjacent block, move randomly
                } else {
                    //Choose movement direction
                    let direction = randomSingle(4);
                    //Move
                    if (flag) {
                        switch (direction) {
                            case 0:
                                if(coordY!==0) {
                                    random-=currentHeight;
                                }
                                break;
                            case 1:
                                if (coordY!==currentHeight-1) {
                                    random+=currentHeight;
                                }
                                break;
                            case 2:
                                if (coordX!==0) {
                                    random--;
                                }
                                break;
                            case 3:
                                if (coordX!==currentWidth-1) {
                                    random++;
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            } while (flag);
        }
        console.log(`Stage ${i+1} done; Placed ${blockCounter-1} blocks`);
        //For testing
        let boardForImage = new Uint8Array(board);
        for (let g = 0; g < boardForImage.length; g++) {
            if (boardForImage[g] === 1) {
                boardForImage[g] = 100;
            } else if (boardForImage[g] !== 0) boardForImage[g] = 255;
        }
        await saveToFile(boardForImage, currentWidth, currentHeight, "results/stage"+(i+1)+".gif")
    }
}

main()