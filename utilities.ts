//Returns one random integer, bounded by max and min
function randomSingle(max: number, min: number = 0): number {
    return Math.floor( Math.random() * (max-min) + min );
}

//Only for testing
function printBoard(board: Uint8Array, currentWidth: number) {
    for (let x: number = 0; x < Math.floor(board.length/currentWidth); x++) {
        let arr: string[] = [];
        for (let z: number = 0; z < currentWidth; z++) {
            let element: number = board[x*currentWidth + z];
            let expression: string;
            switch (element) {
                case 0:
                    expression = `\u{1b}[90m ${element} \u{1b}[0m`;
                    break;
                case 1:
                    expression = `\u{1b}[32m ${element} \u{1b}[0m`;
                    break;
                case 2:
                    expression = `\u{1b}[33m ${element} \u{1b}[0m`;
                    break;
                case 3:
                    expression = `\u{1b}[34m ${element} \u{1b}[0m`;
                    break;
                case 4:
                    expression = `\u{1b}[35m ${element} \u{1b}[0m`;
                    break;
                case 5:
                    expression = `\u{1b}[36m${element}\u{1b}[0m`;
                    break;
                default:
                    throw new Error("Impossible expression value");
            }
            arr.push(expression);
        }
        console.log(arr.join(""));
    }
}

function printElevation(elevation: Uint16Array, currentWidth: number) {
    for (let x: number = 0; x < Math.floor(elevation.length/currentWidth); x++) {
        let arr: string[] = [];
        for (let z: number = 0; z < currentWidth; z++) {
            let element: number = elevation[x*currentWidth + z];
            let expression: string;
            if (element !== 0) {
                if (element<10) {
                    expression = `\u{1b}[91m${element}\u00A0  \u{1b}[0m`;
                } else expression = `\u{1b}[91m${element}  \u{1b}[0m`;
            } else expression = `\u{1b}[30m${element}\u00A0  \u{1b}[0m`;
            arr.push(expression);
        }
        console.log(arr.join(""));
    }
}

function getAdjacent(i: number, array: ArrayLike<number>, arrayWidth: number, arrayHeight: number): number[] {
    let coordY: number = Math.floor(i/arrayWidth);
    let coordX: number = i%arrayWidth;
    let answerArray: number[] = [];

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

export {randomSingle}
export {getAdjacent}
export {printBoard}
export {printElevation}