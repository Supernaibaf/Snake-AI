import { Game } from './game/game';
import { SnakeAI } from './ai/snake-ai';

(function initialize() {
  const gameWidth = 32;
  const gameHeight = 18;
  const scaleFactor = 50;
  const foodColor = '#ff0000';
  let game: Game;
  let snakeAI: SnakeAI;
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
      const nextDirection = snakeAI.getNextDirectionChange();
      if (nextDirection.newDirection !== undefined) {
        game.direction = nextDirection.newDirection;
      }
      const tickResult = game.tick();
      if (tickResult.ruleViolation) {
        window.clearInterval(gameInterval);
      } else if (tickResult.noSpaceForFood) {
        window.clearInterval(gameInterval);
      } else {
        snakeAI.gameChanged(tickResult);
        canvas.clearRect(0, 0, gameWidth * scaleFactor, gameHeight * scaleFactor);
        drawGame();
      }
    }, 10);
  }

  window.addEventListener('load', () => {
    canvas = initializeGameContainer();
    game = new Game(gameWidth, gameHeight);
    snakeAI = new SnakeAI(game);
    drawGame();
    startGame();
  });
})();
