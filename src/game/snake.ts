import { Direction } from './direction';
import { GamePosition } from './game-position';

function moveElementInDirection(element: GamePosition, direction: Direction): GamePosition {
  let { x, y } = element;
  switch (direction) {
    case Direction.Down:
      y++;
      break;
    case Direction.Up:
      y--;
      break;
    case Direction.Left:
      x--;
      break;
    case Direction.Right:
      x++;
      break;
    default:
      break;
  }
  return { x, y };
}

export type SnakeMoveResult = {
  foodEaten: boolean;
  eatenItself: boolean;
};

export class Snake {
  private elements: GamePosition[];

  constructor(headX: number, headY: number, length: number) {
    this.elements = [];
    for (let i = 0; i < length; i++) {
      this.elements.push({ x: headX - i, y: headY });
    }
  }

  private moveTail() {
    for (let i = this.elements.length - 1; i > 0; i--) {
      this.elements[i] = this.elements[i - 1];
    }
  }

  private moveHead(direction: Direction) {
    this.elements[0] = moveElementInDirection(this.elements[0], direction);
  }

  move(direction: Direction, foodPosition: GamePosition): SnakeMoveResult {
    let hasEaten = false;
    if (this.willSnakeEatFood(direction, foodPosition)) {
      this.enlarge();
      hasEaten = true;
    }
    this.moveTail();
    this.moveHead(direction);
    return {
      foodEaten: hasEaten,
      eatenItself: this.hasSnakeEatenItself()
    };
  }

  private willSnakeEatFood(direction: Direction, foodPosition: GamePosition): boolean {
    const futureHead = moveElementInDirection(this.elements[0], direction);
    return futureHead.x === foodPosition.x && futureHead.y === foodPosition.y;
  }

  private hasSnakeEatenItself(): boolean {
    const head = this.elements[0];
    for (let i = 1; i < this.elements.length; i++) {
      if (this.elements[i].x === head.x && this.elements[i].y === head.y) {
        return true;
      }
    }
    return false;
  }

  forEachElement(callback: (value: GamePosition) => void) {
    this.elements.forEach(v => {
      callback(v);
    });
  }

  getHeadPosition(): GamePosition {
    return this.elements[0];
  }

  get length(): number {
    return this.elements.length;
  }

  private enlarge() {
    this.elements.push(this.elements[this.elements.length - 1]);
  }
}
