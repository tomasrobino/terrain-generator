const sharp = require("sharp");


const WIDTH = parseInt(process.argv[2]);
const HEIGHT = parseInt(process.argv[3]);
const PERCENTAGE_FILLED = parseFloat(process.argv[4]);
const STAGES_AMOUNT = parseInt(process.argv[5]);


//Returns one random integer, bounded by max and min
function randomSingle(max, min = 0) {
    return Math.floor( Math.random() * (max-min) + min );
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

class Board {
    static blockCounter = 0;

    static getBlockCounter() {
        return this.blockCounter;
    }

    static setBlockCounter(value) {
        this.blockCounter+=value;
    }

    static addBlockCounter() {
        this.blockCounter++;
    }

    constructor(height, width, root, rootElevation, rootHeight, rootWidth) {
        this.height = height;
        this.width = width;
        this.root = new Uint8Array(root);
        this.rootElevation = new Uint16Array(rootElevation);
        this.rootHeight = rootHeight;
        this.rootWidth = rootWidth;
        this.board = new Uint8Array(height*width);
        let offset = 0;
        if (root.length===1) {
            this.board[randomSingle(Math.floor((this.height*this.width)))] = 1;
            Board.addBlockCounter();
        } else {
            for (let i = 0; i < root.length; i++) {
                if (root[i] !== 0) {
                    this.board[(2*i)+offset] = root[i];
                    switch (root[i]) {
                        case 2:
                            this.board[(2*i)+offset-this.width] = 2;
                            break;
                        case 3:
                            this.board[(2*i)+offset+1] = 3;
                            break;
                        case 4:
                            this.board[(2*i)+offset+this.width] = 4;
                            break;
                        case 5:
                            this.board[(2*i)+offset-1] = 5;
                            break;
                        default:
                            break;
                    }
                }
                if ((i+1)%this.rootWidth === 0) {
                    offset += this.width;
                }
            }
        }
    }

    populate() {
        for (let k = 0; k < this.height*this.width*PERCENTAGE_FILLED - Board.getBlockCounter(); k++) {
            let randomFlag = true;
            let random;
            do {
                random = randomSingle(this.height*this.width);
                if (this.board[random] === 0) {
                    randomFlag = false;
                }
                
            } while (randomFlag);
            
            //Moving new block
            let flag = true;
            //Check if adjacent to other block
            do {
                let coordY = Math.floor(random/this.width);
                let coordX = random%this.width;
                //If there's a block above
                if (coordY!==0 && this.board[random-this.width] !== 0) {
                    this.board[random] = 2;
                    Board.addBlockCounter();
                    flag = false;
                //If there's a block below
                } else if (coordY!==this.height-1 && this.board[random+this.width] !== 0) {
                    this.board[random] = 4;
                    Board.addBlockCounter();
                    flag = false;
                //If there's a block on the right
                } else if (coordX!==0 && this.board[random-1] !== 0) {
                    this.board[random] = 5;
                    Board.addBlockCounter();
                    flag = false;
                //If there's a block on the left
                } else if (coordX!==this.width-1 && this.board[random+1] !== 0) {
                    this.board[random] = 3;
                    Board.addBlockCounter();
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
                                    random-=this.height;
                                }
                                break;
                            case 1:
                                if (coordY!==this.height-1) {
                                    random+=this.height;
                                }
                                break;
                            case 2:
                                if (coordX!==0) {
                                    random--;
                                }
                                break;
                            case 3:
                                if (coordX!==this.width-1) {
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
    }

    saveToFile(destination) {
        let boardForImage = new Uint8Array(this.board);
        for (let g = 0; g < boardForImage.length; g++) {
            if (boardForImage[g] === 1) {
                boardForImage[g] = 100;
            } else if (boardForImage[g] !== 0) boardForImage[g] = 255;
        }
        let img = sharp(boardForImage, {raw: { width: this.width, height: this.height, channels: 1 }});
        img.toFile(destination);
    }
}


let boardArray = [];
boardArray[0] = new Board(HEIGHT, WIDTH, [1], [0], 1, 1);
boardArray[0].populate();
boardArray[0].saveToFile("results/stage1.gif");

for (let i = 1; i < STAGES_AMOUNT; i++) {
    boardArray[i] = new Board(boardArray[i-1].height*2, boardArray[i-1].width*2, boardArray[i-1].board, [], boardArray[i-1].height, boardArray[i-1].width);
    boardArray[i].populate();
    boardArray[i].saveToFile("results/stage"+(i+1)+".gif");
}