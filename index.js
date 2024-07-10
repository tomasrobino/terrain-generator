const sharp = require("sharp");
const {printElevation, printBoard, randomSingle, getAdjacent} = require("./utilities");


const WIDTH = parseInt(process.argv[2]);
const HEIGHT = parseInt(process.argv[3]);
const PERCENTAGE_FILLED = parseFloat(process.argv[4]);
const STAGES_AMOUNT = parseInt(process.argv[5]);


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
        this.originElevation = originElevation;
        this.originHeight = originHeight;
        this.originWidth = originWidth;
        this.board = new Uint8Array(height*width);

        let offset = 0;
        if (origin.length===1) {
            let random = randomSingle(Math.floor((this.height*this.width)));
            this.board[random] = 1;
            Board.setRoot(random);
            Board.addBlockCounter();
        } else {
            for (let i = 0; i < origin.length; i++) {
                if (i === Board.getRoot()) {
                    Board.setRoot((2*Board.getRoot())+offset);
                }
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
        this.elevation = new Uint16Array(this.board.length);
        this._populate();
        this._calcElevation();
    }

    _calcElevation() {
        let targetsArray = [];
        let pathLength = 2;
        let done = false;
        let current;
        let forksArray = [];
        let newTargets = [];

        //Getting all branch ends
        for (let i = 0; i < this.board.length; i++) {
            if ( getAdjacent(i, this.board, this.width, this.height).length === 1){
                targetsArray.push(i);
                this.elevation[i] = 1;
            }
        }

        while (!done) {
            let i = 0;
            let flag = true;
            while (flag) {
                let sides = getAdjacent(targetsArray[i], this.board, this.width, this.height);
                let moved = false;
                for (let j = 0; j < sides.length; j++) {
                    //Translating getAdjacent result to actual index
                    switch (sides[j]) {
                        case 2:
                            current = targetsArray[i] - this.width;
                            break;
                        case 3:
                            current = targetsArray[i] + 1;
                            break;
                        case 4:
                            current = targetsArray[i] + this.width;
                            break;
                        case 5:
                            current = targetsArray[i] - 1;
                            break;
                        default:
                            printBoard(this.board, this.width);
                            console.log("--------------------");
                            printElevation(this.elevation, this.width);
                            throw new Error("adjs element with invalid number");
                            break;
                    }

                    let forkIndex = forksArray.findIndex(value => value === current);
                    if (this.elevation[current] === 0) {
                        this.elevation[current] = pathLength;
                        pathLength++;
                        moved = true;
                        break;
                    } else if (forkIndex !== -1) {
                        //Attempt to solve fork

                    }
                }

                if (!moved) {
                    flag = false;
                }
            }
            i++;
        }
    }

    aaaa() {
        let pathLength
        let targetsArray = [Board.getRoot()];
        pathLength = 1;
        let done = false;
        let current;
        let newTargets = [];

        while (!done) {
            for (let i = 0; i < targetsArray.length; i++) {
                current = targetsArray[i];
                if (this.elevation[current] === 0) {
                    this.elevation[current] = pathLength;
                } else continue;
                let adjs = getAdjacent(current, this.board, this.width, this.height);

                for (let g = 0; g < adjs.length; g++) {
                    let aux;
                    switch (adjs[g]) {
                        case 2:
                            aux = current-this.width;
                            break;
                        case 3:
                            aux = current+1;
                            break;
                        case 4:
                            aux = current+this.width;
                            break;
                        case 5:
                            aux = current-1;
                            break;
                        default:
                            printBoard(this.board, this.width);
                            console.log("--------------------");
                            printElevation(this.elevation, this.width);
                            throw new Error("adjs element with invalid number");
                    }
                    if (this.board[aux] !== 0 && this.elevation[aux] === 0 && !newTargets.includes(aux)) newTargets.push(aux);
                }
            }
            targetsArray = Array.from(newTargets);
            if (targetsArray.length === 0) done = true;
            newTargets = [];
            pathLength++;
        }
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
        printElevation(this.elevation, this.width)
    }
}


let boardArray = [];
boardArray[0] = new Board(HEIGHT, WIDTH);
boardArray[0].saveToFile("results/stage1.gif");


for (let i = 1; i < STAGES_AMOUNT; i++) {
    boardArray[i] = new Board(boardArray[i-1].height*2, boardArray[i-1].width*2, boardArray[i-1].board, boardArray[i-1].elevation, boardArray[i-1].height, boardArray[i-1].width);
    boardArray[i].saveToFile("results/stage"+(i+1)+".gif");
}
