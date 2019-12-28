import { Direction } from './direction';
import { Snake } from './snake';
import { GamePosition } from './game-position';

export type GameTickResult = {
  ruleViolation: boolean;
  noSpaceForFood: boolean;
  foodEaten: boolean;
};

export class Game {
  private currentDirection: Direction;

  private nextDirection: Direction;

  snake: Snake;

  food: GamePosition;

  constructor(private gameWidth: number, private gameHeight: number) {
    this.initializeSnake();
    this.initializeFood();
    this.currentDirection = Direction.Right;
    this.nextDirection = Direction.Right;
  }

  private initializeSnake() {
    const startLength = 4;
    const startY = Math.floor(this.height / 2);
    const startX = Math.floor(this.width / 2 + startLength / 2);
    this.snake = new Snake(startX, startY, startLength);
  }

  private initializeFood(): boolean {
    if (this.snake.length === this.height * this.width) {
      return false;
    }

    let newFood: GamePosition;
    do {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      newFood = { x, y };
    } while (this.isFoodInSnake(newFood));
    this.food = newFood;
    return true;
  }

  private isFoodInSnake(food: GamePosition) {
    let result = false;
    this.snake.forEachElement(e => {
      if (e.x === food.x && e.y === food.y) {
        result = true;
      }
    });
    return result;
  }

  set direction(direction: Direction) {
    if (
      (this.currentDirection === Direction.Down && direction !== Direction.Up) ||
      (this.currentDirection === Direction.Up && direction !== Direction.Down) ||
      (this.currentDirection === Direction.Left && direction !== Direction.Right) ||
      (this.currentDirection === Direction.Right && direction !== Direction.Left)
    ) {
      this.nextDirection = direction;
    }
  }

  get direction(): Direction {
    return this.currentDirection;
  }

  get width(): number {
    return this.gameWidth;
  }

  get height(): number {
    return this.gameHeight;
  }

  tick(): GameTickResult {
    const moveResult = this.snake.move(this.nextDirection, this.food);
    let noSpaceForFood = false;
    if (moveResult.foodEaten) {
      noSpaceForFood = !this.initializeFood();
    }
    this.currentDirection = this.nextDirection;

    return {
      ruleViolation: moveResult.eatenItself || this.hasRuleViolation(),
      noSpaceForFood,
      foodEaten: moveResult.foodEaten
    };
  }

  private hasRuleViolation(): boolean {
    const head = this.snake.getHeadPosition();
    return head.x < 0 || head.x >= this.width || head.y < 0 || head.y >= this.height;
  }
}
