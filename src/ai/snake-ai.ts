import { Game, GameTickResult } from '../game/game';
import { Direction } from '../game/direction';

export type DirectionChange = {
  newDirection?: Direction;
};

type CircuitDirection = {
  direction: Direction;
  nextCircuitNumber: number;
};

type Shortcut = {
  circuitNumber: number;
  requiredMoves: number;
  x: number;
  y: number;
};

export class SnakeAI {
  private gameBoardCircuit: number[][];

  private shortcuts: Shortcut[];

  constructor(private game: Game) {
    this.initializeGameBoardCircuit();
    this.shortcuts = [];
  }

  private initializeGameBoardCircuit() {
    this.gameBoardCircuit = Array(this.game.width);
    for (let i = 0; i < this.game.width; i++) {
      this.gameBoardCircuit[i] = Array(this.game.height).fill(-1);
    }
    if (this.game.height < 2 || this.game.width < 2) {
      throw new Error('Cannot create AI if one side is smaller than 2');
    }
    if (this.game.height % 2 === 0) {
      let counter = 0;
      for (let i = this.game.height - 1; i >= 0; i--) {
        this.gameBoardCircuit[0][i] = counter;
        counter++;
      }
      for (let i = 0; i < this.game.height; i++) {
        for (let j = 1; j < this.game.width; j++) {
          const x = i % 2 === 0 ? j : this.game.width - j;
          this.gameBoardCircuit[x][i] = counter;
          counter++;
        }
      }
    } else if (this.game.width % 2 === 0) {
      let counter = 0;
      for (let i = this.game.width - 1; i >= 0; i--) {
        this.gameBoardCircuit[i][0] = counter;
        counter++;
      }
      for (let i = 0; i < this.game.width; i++) {
        for (let j = 1; j < this.game.height; j++) {
          const y = i % 2 === 0 ? j : this.game.height - j;
          this.gameBoardCircuit[i][y] = counter;
          counter++;
        }
      }
    } else {
      throw new Error('Cannot create AI if no side can be divided by 2');
    }
  }

  get circuit(): number[][] {
    return this.gameBoardCircuit;
  }

  private getMaxCircuitNumber(): number {
    return this.game.width * this.game.height - 1;
  }

  gameChanged(tickResult: GameTickResult) {
    if (!tickResult.foodEaten) {
      this.shortcuts.forEach(s => s.requiredMoves--);
      this.shortcuts = this.shortcuts.filter(s => s.requiredMoves > 0);
    }
  }

  getNextDirectionChange(): DirectionChange {
    const shortcutResult = this.takeShortcut();
    if (shortcutResult.newDirection) {
      return shortcutResult;
    }
    return this.followCircuit();
  }

  private getSurroundingCircuitDirections(): CircuitDirection[] {
    const head = this.game.snake.getHeadPosition();
    const directions = [];
    if (head.x > 0 && this.game.direction !== Direction.Right) {
      directions.push({
        direction: Direction.Left,
        nextCircuitNumber: this.gameBoardCircuit[head.x - 1][head.y]
      });
    }
    if (head.x < this.game.width - 1 && this.game.direction !== Direction.Left) {
      directions.push({
        direction: Direction.Right,
        nextCircuitNumber: this.gameBoardCircuit[head.x + 1][head.y]
      });
    }
    if (head.y > 0 && this.game.direction !== Direction.Down) {
      directions.push({
        direction: Direction.Up,
        nextCircuitNumber: this.gameBoardCircuit[head.x][head.y - 1]
      });
    }
    if (head.y < this.game.height - 1 && this.game.direction !== Direction.Up) {
      directions.push({
        direction: Direction.Down,
        nextCircuitNumber: this.gameBoardCircuit[head.x][head.y + 1]
      });
    }
    return directions;
  }

  private takeShortcut(): DirectionChange {
    const head = this.game.snake.getHeadPosition();
    const foodPosition = this.game.food;
    const circuitNumber = this.gameBoardCircuit[head.x][head.y];
    const foodCircuitNumber = this.gameBoardCircuit[foodPosition.x][foodPosition.y];

    const surroundingDirections = this.getSurroundingCircuitDirections();
    let bestDirection: Direction | undefined;
    let bestDistance = 0;
    const maxDistance = this.game.width * this.game.height;
    for (let i = 0; i < surroundingDirections.length; i++) {
      const { nextCircuitNumber, direction } = surroundingDirections[i];
      const foodNumber = foodCircuitNumber + (foodCircuitNumber < circuitNumber ? maxDistance : 0);
      const nextNumber = nextCircuitNumber + (nextCircuitNumber < circuitNumber ? maxDistance : 0);
      const distance = nextNumber - circuitNumber;
      if (
        nextNumber > circuitNumber &&
        nextNumber < foodNumber &&
        distance > bestDistance &&
        this.shortcuts.every(s => {
          const shortcutNumber =
            s.circuitNumber + (s.circuitNumber < circuitNumber ? maxDistance : 0);
          return shortcutNumber > nextNumber && shortcutNumber - nextNumber > s.requiredMoves;
        })
      ) {
        bestDistance = distance;
        bestDirection = direction;
      }
    }
    if (bestDistance > 1) {
      this.shortcuts.push({
        circuitNumber,
        requiredMoves: this.game.snake.length,
        x: head.x,
        y: head.y
      });
    }
    return { newDirection: bestDirection };
  }

  private followCircuit(): DirectionChange {
    const head = this.game.snake.getHeadPosition();
    const circuitNumber = this.gameBoardCircuit[head.x][head.y];
    const nextCircuitNumber = circuitNumber === this.getMaxCircuitNumber() ? 0 : circuitNumber + 1;
    let newDirection: Direction | undefined;
    if (head.x > 0 && this.gameBoardCircuit[head.x - 1][head.y] === nextCircuitNumber) {
      newDirection = this.game.direction !== Direction.Right ? Direction.Left : Direction.Up;
    } else if (
      head.x < this.game.width - 1 &&
      this.gameBoardCircuit[head.x + 1][head.y] === nextCircuitNumber
    ) {
      newDirection = this.game.direction !== Direction.Left ? Direction.Right : Direction.Down;
    } else if (head.y > 0 && this.gameBoardCircuit[head.x][head.y - 1] === nextCircuitNumber) {
      newDirection = this.game.direction !== Direction.Down ? Direction.Up : Direction.Left;
    } else if (
      head.y < this.game.height - 1 &&
      this.gameBoardCircuit[head.x][head.y + 1] === nextCircuitNumber
    ) {
      newDirection = this.game.direction !== Direction.Up ? Direction.Down : Direction.Right;
    }
    return { newDirection };
  }
}
