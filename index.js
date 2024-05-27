const WIDTH = 25;
const HEIGHT = 25;

const board = new Array(HEIGHT).fill(new Array(WIDTH).fill(0));

//Returns two random integers, bounded by max and min
function randomCoords(heightMax, widthMax, heightMin = 0, widthMin = 0) {
    return new Array(Math.floor( Math.random() * (heightMax-heightMin) + heightMin ), Math.floor( Math.random() * (widthMax-widthMin) + widthMin ));
}
let root = randomCoords(HEIGHT, WIDTH); //Root for DLA

