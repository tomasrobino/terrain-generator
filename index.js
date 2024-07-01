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
            let element = board[x*currentWidth + z];
            switch (element) {
                case 0:
                    element = `\u{1b}[90m ${element} \u{1b}[0m`;
                    break;
                case 1:
                    element = `\u{1b}[32m ${element} \u{1b}[0m`;
                    break;
                case 2:
                    element = `\u{1b}[33m ${element} \u{1b}[0m`;
                    break;
                case 3:
                    element = `\u{1b}[34m ${element} \u{1b}[0m`;
                    break;
                case 4:
                    element = `\u{1b}[35m ${element} \u{1b}[0m`;
                    break;
                case 5:
                    element = `\u{1b}[36m${element}\u{1b}[0m`;
                    break;
            }
            arr.push(element);
        }
        console.log(arr.join(""));
    }
}

function printElevation(elevation, currentWidth) {
    for (let x = 0; x < Math.floor(elevation.length/currentWidth); x++) {
        let arr = [];
        for (let z = 0; z < currentWidth; z++) {
            let element = elevation[x*currentWidth + z];
            if (element !== 0) {
                element = `\u{1b}[91m${element}  \u{1b}[0m`;
            } else element = `\u{1b}[30m${element}  \u{1b}[0m`;
            arr.push(element);
        }
        console.log(arr.join(""));
    }
}
class Board {
    static blockCounter = 0;
    static root;

    static getBlockCounter() {
        return this.blockCounter;
    }

    static setBlockCounter(value) {
        this.blockCounter+=value;
    }

    static addBlockCounter() {
        this.blockCounter++;
    }

    static getRoot() {
        return this.root;
    }

    static setRoot(value) {
        this.root = value;
    }

    constructor(height, width, origin = [1], originElevation = [0], originHeight = 1, originWidth = 1) {
        this.height = height;
        this.width = width;
        this.origin = new Uint8Array(origin);
        this.originElevation = new Uint16Array(originElevation);
        this.originHeight = originHeight;
        this.originWidth = originWidth;
        this.board = new Uint8Array(height*width);
        this.elevation = [];
        
        let offset = 0;
        if (origin.length===1) {
            let random = randomSingle(Math.floor((this.height*this.width)));
            this.board[random] = 1;
            Board.setRoot(random);
            Board.addBlockCounter();
        } else {
            for (let i = 0; i < origin.length; i++) {
                if (origin[i] !== 0) {
                    this.board[(2*i)+offset] = origin[i];
                    switch (origin[i]) {
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
                if ((i+1)%this.originWidth === 0) {
                    offset += this.width;
                }
            }
        }

        this.elevation = this._populate();
    }

    _getAdjacent(i, array, arrayWidth, arrayHeight) {
        let coordY = Math.floor(i/arrayWidth);
        let coordX = i%arrayWidth;
        let answerArray = [];
        
        //If there's a block above
        if (coordY!==0 && array[i-arrayWidth] === 4) {
            answerArray.push(2);
        //If there's a block on the right
        }
        if (coordX!==arrayWidth-1 && array[i+1] === 5) {
            answerArray.push(3)
        //If there's a block below
        }
        if (coordY!==arrayHeight-1 && array[i+arrayWidth] === 2) {
            answerArray.push(4)
        //If there's a block on the left
        }
        if (coordX!==0 && array[i-1] === 3) {
            answerArray.push(5)
        }

        //Adds block i points to
        if (array[i] !== 1 && array[i] !== 0) {
            answerArray.push(array[i])
        }
        return answerArray;
    }

    _calcElevation(array, arrayWidth, arrayHeight) {
        let elevation = new Uint16Array(array.length);
        let targetsArray = [Board.getRoot()];
        let done = false;
        let current;
        let pathLength = 1;
        let newTargets = [];

        while (!done) {
            for (let i = 0; i < targetsArray.length; i++) {
                current = targetsArray[i];
                if (elevation[current] === 0) {
                    elevation[current] = pathLength
                } else continue;
                let adjs = this._getAdjacent(current, array, arrayWidth, arrayHeight);

                for (let g = 0; g < adjs.length; g++) {
                    let aux;
                    switch (adjs[g]) {
                        case 2:
                            aux = current-arrayWidth;
                            break;
                        case 3:
                            aux = current+1;
                            break;
                        case 4:
                            aux = current+arrayWidth;
                            break;
                        case 5:
                            aux = current-1;
                            break;
                        default:
                            printBoard(array, this.width);
                            console.log("--------------------");
                            printElevation(elevation, arrayWidth);
                            throw new Error("adjs element with invalid number");
                    }
                    if (array[aux] !== 0 && elevation[aux] === 0 && !newTargets.includes(aux)) newTargets.push(aux);
                }
            }
            targetsArray = Array.from(newTargets);
            if (targetsArray.length === 0) done = true;
            newTargets = [];
            pathLength++;
        }
        
        //Inverting height values
        // y = pathLength - x + 1
        // x + (y-x)
        pathLength--;
        printElevation(elevation, arrayWidth)
        console.log("---------------------")
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== 0) {
                elevation[i] = elevation[i] + ((pathLength - elevation[i] + 1) - elevation[i]);
            }
        }
        printElevation(elevation, arrayWidth)
        console.log("---------------------")
        return elevation;
    }

    _populate() {
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

        return this._calcElevation(this.board, this.width, this.height);
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
        //printElevation(this.elevation, this.width)
        //console.log("------------------------------")
    }
}


let boardArray = [];
boardArray[0] = new Board(HEIGHT, WIDTH);
boardArray[0].saveToFile("results/stage1.gif");

/*
for (let i = 1; i < STAGES_AMOUNT; i++) {
    boardArray[i] = new Board(boardArray[i-1].height*2, boardArray[i-1].width*2, boardArray[i-1].board, [], boardArray[i-1].height, boardArray[i-1].width);
    boardArray[i].saveToFile("results/stage"+(i+1)+".gif");
}

 */