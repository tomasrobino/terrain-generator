const sharp = require("sharp");
const {printBoard, printElevation, randomSingle, getAdjacent} = require("./utilities")


const WIDTH = parseInt(process.argv[2]);
const HEIGHT = parseInt(process.argv[3]);
const PERCENTAGE_FILLED = parseFloat(process.argv[4]);
const STAGES_AMOUNT = parseInt(process.argv[5]);

function formula(x: number): number {
    return 1 - 1 / (1 + x);
}

class Board {
    private static blockCounter = 0;
    private static root: number;
    public readonly height: number;
    public readonly width: number;
    private readonly origin: Uint8Array;
    private readonly originElevation: Uint16Array;
    private readonly originHeight: number;
    public readonly originWidth: number;
    public readonly board: Uint8Array;
    public readonly elevation: Uint16Array;

    static getBlockCounter() {
        return this.blockCounter;
    }

    static setBlockCounter(value: number) {
        this.blockCounter+=value;
    }

    static addBlockCounter() {
        this.blockCounter++;
    }

    static getRoot() {
        return this.root;
    }

    static setRoot(value: number) {
        this.root = value;
    }

    constructor(height: number, width: number, origin: Uint8Array = new Uint8Array([1]), originElevation: Uint16Array = new Uint16Array([0]), originHeight: number = 1, originWidth: number = 1) {
        this.height = height;
        this.width = width;
        this.origin = new Uint8Array(origin);
        this.originElevation = originElevation;
        this.originHeight = originHeight;
        this.originWidth = originWidth;
        this.board = new Uint8Array(height*width);

        let offset = 0;
        if (this.origin.length===1) {
            let random = randomSingle(Math.floor((this.height*this.width)));
            this.board[random] = 1;
            Board.setRoot(random);
            Board.addBlockCounter();
        } else {
            for (let i = 0; i < this.origin.length; i++) {
                if (i === Board.getRoot()) {
                    Board.setRoot((2*Board.getRoot())+offset);
                }
                if (this.origin[i] !== 0) {
                    this.board[(2*i)+offset] = this.origin[i];
                    switch (this.origin[i]) {
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
        let targetsArray: number[] = [];
        let forksArray: number[] = [];

        //Getting all branch ends
        for (let i = 0; i < this.board.length; i++) {
            if ( getAdjacent(i, this.board, this.width, this.height).length === 1){
                targetsArray.push(i);
                this.elevation[i] = 1;
            }
        }

        for (let i = 0; i < targetsArray.length; i++) {
            let flag: boolean = true;
            let pathLength: number = 2;
            while (flag) {
                let sides = getAdjacent(targetsArray[i], this.board, this.width, this.height);
                let moved: boolean = false;
                for (let j: number = 0; j < sides.length; j++) {
                    let next;
                    //Translating getAdjacent result to actual index
                    switch (sides[j]) {
                        case 2:
                            next = targetsArray[i] - this.width;
                            break;
                        case 3:
                            next = targetsArray[i] + 1;
                            break;
                        case 4:
                            next = targetsArray[i] + this.width;
                            break;
                        case 5:
                            next = targetsArray[i] - 1;
                            break;
                        default:
                            printBoard(this.board, this.width);
                            console.log("--------------------");
                            printElevation(this.elevation, this.width);
                            throw new Error("adjs element with invalid number");
                    }

                    let forkIndex: number = forksArray.findIndex(value => value === next);
                    let nextAdj = getAdjacent(next, this.board, this.width, this.height);
                    if (this.elevation[next] === 0) {
                        this.elevation[next] = pathLength;
                        //Detecting and adding fork
                        if (nextAdj.length > 2) {
                            forksArray.push(next);
                        } else {
                            targetsArray[i] = next;
                            moved = true;
                        }
                        break;
                    //If next is a fork
                    } else if (forkIndex !== -1) {
                        //Set maximum as path
                        this.elevation[next] = Math.max(this.elevation[next], pathLength);
                        //If three-way fork, solve it
                        if (nextAdj.length === 3) {
                            forksArray.splice(forkIndex, 1);
                            moved = true;
                            targetsArray[i] = next;
                        } else {
                            //If four-way fork
                            let adjCounter: number = 0;
                            //Translating getAdjacent result to actual index
                            for (let g = 0; g < nextAdj.length; g++) {
                                //Checks amount of sides already done
                                switch (nextAdj[g]) {
                                    case 2:
                                        if (this.elevation[next - this.width] !== 0) adjCounter++;
                                        break;
                                    case 3:
                                        if (this.elevation[next + 1] !== 0) adjCounter++;
                                        break;
                                    case 4:
                                        if (this.elevation[next + this.width] !== 0) adjCounter++;
                                        break;
                                    case 5:
                                        if (this.elevation[next - 1] !== 0) adjCounter++;
                                        break;
                                    default:
                                        printBoard(this.board, this.width);
                                        console.log("--------------------");
                                        printElevation(this.elevation, this.width);
                                        throw new Error("nextAdjs element with invalid number");
                                }
                            }
                            //When three of the sides are done, solve it
                            if (adjCounter === 3) {
                                forksArray.splice(forkIndex, 1);
                                moved = true;
                                targetsArray[i] = next;
                            }
                        }
                        break;
                    }
                }
                pathLength++;
                if (!moved) {
                    flag = false;
                }
            }
        }
    }

    _populate() {
        for (let k = 0; k < this.height*this.width*PERCENTAGE_FILLED - Board.getBlockCounter(); k++) {
            let randomFlag: boolean = true;
            let random;
            do {
                random = randomSingle(this.height*this.width);
                if (this.board[random] === 0) {
                    randomFlag = false;
                }

            } while (randomFlag);

            //Moving new block
            let flag: boolean = true;
            //Check if adjacent to other block
            do {
                let coordY: number = Math.floor(random/this.width);
                let coordX: number = random%this.width;
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

    _linearInterpolation(i) {
        const adjs: number[] = getAdjacent(i, this.origin, this.originWidth, this.originHeight);
        const ratio: number = 1/adjs.length;
        const resArr: number[] = [i];
        if (i < this.originWidth-1) resArr.push(i+1);
        if (i < this.originHeight-1) {
            resArr.push(i+this.originWidth);
            if (i < this.originWidth-1) resArr.push(i+this.originWidth+1);
        }

        return formula(resArr.reduce((acc, val) => acc + this.originElevation[val]*ratio));
    }

    saveToFile(destination: string) {
        let boardForImage: Uint8Array = new Uint8Array(this.board);
        for (let g = 0; g < boardForImage.length; g++) {
            if (boardForImage[g] === 1) {
                boardForImage[g] = 100;
            } else if (boardForImage[g] !== 0) boardForImage[g] = 255;
        }
        let img = sharp(boardForImage, {raw: { width: this.width, height: this.height, channels: 1 }});
        img.toFile(destination);
    }

    saveElevationToFile(destination: string) {
        const boardForImage: Uint8Array = new Uint8Array(this.elevation);
        const max: number = Math.max(...boardForImage);
        const division: number = 256/max;
        printElevation(this.elevation, this.width);
        for (let i = 0; i < boardForImage.length; i++) {
            if (boardForImage[i] !== 0) {
                const res: number = boardForImage[i] * division - 1;
                if (res > 255) throw new Error("Invalid res value: " + res + ", max value: " + max + ", elevation value: " + this.elevation[i]);
                boardForImage[i] = res;
            }
        }
        let img = sharp(boardForImage, {raw: { width: this.width, height: this.height, channels: 1 }});
        img.toFile(destination);
    }
}


let boardArray = [];
boardArray[0] = new Board(HEIGHT, WIDTH);
boardArray[0].saveToFile("results/board/stage1.gif");
boardArray[0].saveElevationToFile("results/elevation/stage1.gif");

for (let i = 1; i < STAGES_AMOUNT; i++) {
    boardArray[i] = new Board(boardArray[i-1].height*2, boardArray[i-1].width*2, boardArray[i-1].board, boardArray[i-1].elevation, boardArray[i-1].height, boardArray[i-1].width);
    boardArray[i].saveToFile("results/board/stage"+(i+1)+".gif");
    boardArray[i].saveElevationToFile("results/elevation/stage"+(i+1)+".gif");
}
