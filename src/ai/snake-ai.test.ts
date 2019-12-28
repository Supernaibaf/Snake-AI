import { SnakeAI } from './snake-ai';
import { Game } from '../game/game';

describe(SnakeAI.name, () => {
  describe('initializeGameBoardCircuit', () => {
    it('should calculate correct game board circuit for even width', () => {
      const height = 3;
      const width = 4;
      const game = new Game(width, height);

      const ai = new SnakeAI(game);

      expect(ai.circuit).toEqual([
        [3, 4, 5],
        [2, 7, 6],
        [1, 8, 9],
        [0, 11, 10]
      ]);
    });

    it('should calculate correct game board circuit for even height', () => {
      const height = 4;
      const width = 3;
      const game = new Game(width, height);

      const ai = new SnakeAI(game);

      expect(ai.circuit).toEqual([
        [3, 2, 1, 0],
        [4, 7, 8, 11],
        [5, 6, 9, 10]
      ]);
    });
  });
});
