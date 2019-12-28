import { Game } from './game/game';
import { Direction } from './game/direction';

(function initialize() {
  const gameWidth = 32;
  const gameHeight = 18;
  const scaleFactor = 50;
  const foodColor = '#ff0000';
  const speed = 100;
  let game: Game;
  let canvas: CanvasRenderingContext2D;

  function initializeGameContainer(): CanvasRenderingContext2D {
    const canvasContext = <HTMLCanvasElement>document.getElementById('game');
    canvasContext.height = gameHeight * scaleFactor;
    canvasContext.width = gameWidth * scaleFactor;
    return <CanvasRenderingContext2D>canvasContext.getContext('2d');
  }

  function drawSnake() {
    let counter = 0;
    game.snake.forEachElement(v => {
      canvas.fillStyle = `rgb(0, ${Math.floor(255 * (counter / game.snake.length))}, 0)`;
      canvas.fillRect(v.x * scaleFactor, v.y * scaleFactor, scaleFactor, scaleFactor);
      counter++;
    });
  }

  function drawFood() {
    canvas.fillStyle = foodColor;
    canvas.fillRect(game.food.x * scaleFactor, game.food.y * scaleFactor, scaleFactor, scaleFactor);
  }

  function drawGame() {
    drawSnake();
    drawFood();
  }

  function startGame() {
    const gameInterval = window.setInterval(() => {
      const tickResult = game.tick();
      if (tickResult.ruleViolation) {
        window.clearInterval(gameInterval);
      } else if (tickResult.noSpaceForFood) {
        window.clearInterval(gameInterval);
      } else {
        canvas.clearRect(0, 0, gameWidth * scaleFactor, gameHeight * scaleFactor);
        drawGame();
      }
    }, speed);
  }

  window.addEventListener('load', () => {
    canvas = initializeGameContainer();
    game = new Game(gameWidth, gameHeight);
    drawGame();
    startGame();
  });

  window.addEventListener('keydown', e => {
    if (!game) {
      return;
    }
    switch (e.keyCode) {
      case 37:
        game.direction = Direction.Left;
        break;
      case 38:
        game.direction = Direction.Up;
        break;
      case 39:
        game.direction = Direction.Right;
        break;
      case 40:
        game.direction = Direction.Down;
        break;
      default:
        break;
    }
  });
})();
