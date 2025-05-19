const { Board } = require('./index');

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
});
