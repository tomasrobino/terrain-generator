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
                element = `\u{1b}[91m${element} \u{1b}[0m`;
            } else element = `\u{1b}[30m${element} \u{1b}[0m`;
            arr.push(element);
        }
        console.log(arr.join(""));
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

        if (array[i] !== 1 && array[i] !== 0) {
            answerArray.push(array[i])
        }
        return answerArray;
    }

    _calcElevation(array, arrayWidth, arrayHeight) {
        let elevation = new Uint16Array(array.length);
        let targetsArray = [];
        //Finding the ends and filling targetsArray
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== 0 && elevation[i] === 0) {
                if (this._getAdjacent(i, array, arrayWidth, arrayHeight).length === 1) {
                    elevation[i] = 1;
                    targetsArray.push(i);
                }
            }
        }

        //Advance backwards from end until finding a fork
        let forkArray = [];
        for (let i = 0; i < targetsArray.length; i++) {
            let pathLength = 1;
            let current = targetsArray[i];
            let noFork = true;
            //While runs until finding an unresolvable fork
            while (noFork) {
                let adjs = this._getAdjacent(current, array, arrayWidth, arrayHeight);
                let sideFlag = 0;
                //Within the while it's decided in which direction to go on
                while (sideFlag < adjs.length) {
                    //Switch gets index of prospective move
                    let aux = 0;
                    switch (adjs[sideFlag]) {
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
                            printBoard(this.board, this.width);
                            console.log("--------------------");
                            printElevation(elevation, arrayWidth);
                            throw new Error("adjs element with invalid number");
                    }

                    let forkIndex = forkArray.findIndex(val => val[0] === aux);
                    let auxAdjs = this._getAdjacent(aux, array, arrayWidth, arrayHeight);
                    //Check whether the tile's already been done or if it's a fork to solve
                    pathLength++;
                    let oldCurrent = current;
                    current = aux;
                    if (elevation[aux] === 0) {
                        //Normal advance
                        sideFlag = 3;
                        //New fork, add it to the list, and end outer while
                        if (auxAdjs.length > 2) {
                            forkArray.push([current, pathLength]);
                            noFork = false;
                        }
                    //Fork already exists
                    } else if (forkIndex !== -1) {
                        //Since all sides are accounted for, solve it
                        if (auxAdjs.length === 3) {
                            pathLength = Math.max(pathLength, forkArray[forkIndex][1]);
                            forkArray.splice(forkIndex, 1);
                        } else if (auxAdjs.length === 4) {
                            //empty means number of empty tiles adj to fork
                            let empty = 0;
                            for (let j = 0; j < auxAdjs.length; j++) {
                                let secondAux;
                                switch (auxAdjs[j]) {
                                    case 2:
                                        secondAux = aux-arrayWidth;
                                        break;
                                    case 3:
                                        secondAux = aux+1;
                                        break;
                                    case 4:
                                        secondAux = aux+arrayWidth;
                                        break;
                                    case 5:
                                        secondAux = aux-1;
                                        break;
                                    default:
                                        break;
                                }
                                if (elevation[secondAux] === 0) empty++;
                            }

                            pathLength = Math.max(pathLength, forkArray[forkIndex][1]);
                            //Can't solve fork yet, store greatest pathLength
                            if (empty === 1) {
                                forkArray.splice(forkIndex, 1);
                                noFork = false;
                            }
                        } else {
                            throw new Error("auxAdjs has an impossible length");
                        }
                    } else {
                        if (sideFlag === adjs.length-1) {
                            noFork = false;
                        }
                        current = oldCurrent;
                        pathLength--
                    }
                    sideFlag++;
                }
                //Actual move
                elevation[current] = pathLength;
            }
        }
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
        console.log(this.elevation)
        printElevation(this.elevation, this.width)
        console.log("------------------------------")
    }
}


let boardArray = [];
boardArray[0] = new Board(HEIGHT, WIDTH, [1], [0], 1, 1);
boardArray[0].saveToFile("results/stage1.gif");

for (let i = 1; i < STAGES_AMOUNT; i++) {
    boardArray[i] = new Board(boardArray[i-1].height*2, boardArray[i-1].width*2, boardArray[i-1].board, [], boardArray[i-1].height, boardArray[i-1].width);
    boardArray[i].saveToFile("results/stage"+(i+1)+".gif");
}