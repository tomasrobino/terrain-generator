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

function getAdjacent(i, array, arrayWidth, arrayHeight) {
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

exports.randomSingle = randomSingle;
exports.getAdjacent = getAdjacent;
exports.printBoard = printBoard;
exports.printElevation = printElevation;