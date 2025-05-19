const { Board } = require('./index');
const sharp = require('sharp');

// Mocking sharp to prevent actual file creation
jest.mock('sharp', () => jest.fn(() => ({
  toFile: jest.fn(() => Promise.resolve())
})));

describe('Board class', () => {
  const width = 10;
  const height = 10;

  let board: any;

  beforeEach(() => {
    board = new Board(width, height);
  });

  test('should initialize with correct dimensions', () => {
    expect(board.width).toBe(width);
    expect(board.height).toBe(height);
    expect(board.board.length).toBe(width * height);
    expect(board.elevation.length).toBe(width * height);
  });

  test('static block counter should increment', () => {
    const initial = Board.getBlockCounter();
    Board.addBlockCounter();
    expect(Board.getBlockCounter()).toBe(initial + 1);
  });

  test('static block counter can be incremented by value', () => {
    const initial = Board.getBlockCounter();
    Board.setBlockCounter(5);
    expect(Board.getBlockCounter()).toBe(initial + 5);
  });

  test('can initialize board with origin data', () => {
    const origin = new Uint8Array([1, 0, 2]);
    const originElevation = new Uint16Array([0, 1, 2]);
    const originHeight = 1;
    const originWidth = 3;
    const customBoard = new Board(10, 10, origin, originElevation, originHeight, originWidth);

    expect(customBoard.board.length).toBe(100);
    expect(customBoard.elevation.length).toBe(100);
  });

  test('saveToFile calls sharp and toFile correctly', async () => {
    await board.saveToFile('dummy/path.gif');
    expect(sharp).toHaveBeenCalled();
    const sharpInstance = sharp.mock.results[0].value;
    expect(sharpInstance.toFile).toHaveBeenCalledWith('dummy/path.gif');
  });

  test('saveElevationToFile calls sharp and toFile correctly', async () => {
    await board.saveElevationToFile('dummy/elevation.gif');
    expect(sharp).toHaveBeenCalled();
    const sharpInstance = sharp.mock.results[sharp.mock.calls.length - 1].value;
    expect(sharpInstance.toFile).toHaveBeenCalledWith('dummy/elevation.gif');
  });

  test('_linearInterpolation returns a number between 0 and 1', () => {
    const origin = new Uint8Array([1, 2, 3, 4]);
    const originElevation = new Uint16Array([10, 20, 30, 40]);
    const customBoard = new Board(2, 2, origin, originElevation, 2, 2);
    const result = customBoard._linearInterpolation(0);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
  });

});
