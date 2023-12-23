import React, { useState, useEffect, useRef } from 'react';
import './SnakeGame.css';

const generateFood = () => {
  const x = Math.floor(Math.random() * 18);
  const y = Math.floor(Math.random() * 18);
  return { x, y };
};

const SnakeGame = () => {
  const initialSnakeLength = 1;
  const [snake, setSnake] = useState(Array.from({ length: initialSnakeLength }, (_, index) => ({ x: index, y: 0 })));
  const [food, setFood] = useState(() => generateFood());
  const [direction, setDirection] = useState('RIGHT');
  const directionRef = useRef(direction);
  const [gameOver, setGameOver] = useState(false);

  const gameRef = useRef();

  useEffect(() => {
    const moveSnake = () => {
      const newSnake = snake.map((part, index) => {
        if (index === 0) {
          switch (direction) {
            case 'UP':
              return { ...part, y: part.y - 1 };
            case 'DOWN':
              return { ...part, y: part.y + 1 };
            case 'LEFT':
              return { ...part, x: part.x - 1 };
            case 'RIGHT':
              return { ...part, x: part.x + 1 };
            default:
              return part;
          }
        } else {
          return snake[index - 1];
        }
      });

      setSnake(newSnake);

      if (checkCollision(newSnake[0])) {
        setGameOver(true);
      }

      if (checkFoodCollision(newSnake[0])) {
        setFood(generateFood());
        setSnake([...newSnake, { x: -1, y: -1 }]);
      }
    };

    const checkCollision = (head) => {
      return (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= 18 ||
        head.y >= 18 ||
        snake.slice(1).some((part) => part.x === head.x && part.y === head.y)
      );
    };

    const checkFoodCollision = (head) => {
      return head.x === food.x && head.y === food.y;
    };

    const gameInterval = setInterval(() => {
      moveSnake();
      if (gameOver) {
        clearInterval(gameInterval);
      }
    }, 100);

    return () => {
      clearInterval(gameInterval);
    };
  }, [snake, direction, food, gameOver]);

  const handleKeyPress = (event) => {
    switch (event.key) {
      case 'ArrowUp':
        if (directionRef.current !== 'DOWN') {
          setDirection('UP');
        }
        break;
      case 'ArrowDown':
        if (directionRef.current !== 'UP') {
          setDirection('DOWN');
        }
        break;
      case 'ArrowLeft':
        if (directionRef.current !== 'RIGHT') {
          setDirection('LEFT');
        }
        break;
      case 'ArrowRight':
        if (directionRef.current !== 'LEFT') {
          setDirection('RIGHT');
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const renderGameBoard = () => {
    const board = [];
    for (let y = 0; y < 18; y++) {
      for (let x = 0; x < 18; x++) {
        let cellType = 'empty';
        if (snake.some((part) => part.x === x && part.y === y)) {
          cellType = 'snake';
        } else if (food.x === x && food.y === y) {
          cellType = 'food';
        }
        board.push(<div key={`${x}-${y}`} className={`cell ${cellType}`} />);
      }
    }
    return board;
  };

  return (
    <div>
      <h1>{gameOver ? 'Game Over' : 'Snake Game'}</h1>
      <div className="game-board">{renderGameBoard()}</div>
    </div>
  );
};

export default SnakeGame;
