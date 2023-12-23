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
  const [directionQueue, setDirectionQueue] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const currentDirectionRef = useRef('RIGHT');

  useEffect(() => {
    if (gameOver) {
      return; // If the game is over, do nothing
    }

    const moveSnake = () => {
      currentDirectionRef.current = directionQueue.length > 0 ? directionQueue.shift() : currentDirectionRef.current;

      const currentDirection = currentDirectionRef.current;
      

      if (currentDirection) {
        setSnake((prevSnake) => {
          const newSnake = prevSnake.map((part, index) => {
            if (index === 0) {
              switch (currentDirection) {
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
              return prevSnake[index - 1];
            }
          });

          if (checkCollision(newSnake[0])) {
            setGameOver(true);
          }

          if (checkFoodCollision(newSnake[0])) {
            setFood(generateFood());
            return [...newSnake, { x: -1, y: -1 }];
          }

          return newSnake;
        });
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
    }, 100);

    return () => {
      clearInterval(gameInterval);
    };
  }, [snake, directionQueue, food, gameOver, currentDirectionRef]);

  const handleKeyPress = (event) => {
    let newDirection = null;
    switch (event.key) {
      case 'ArrowUp':
        newDirection = 'UP';
        break;
      case 'ArrowDown':
        newDirection = 'DOWN';
        break;
      case 'ArrowLeft':
        newDirection = 'LEFT';
        break;
      case 'ArrowRight':
        newDirection = 'RIGHT';
        break;
      default:
        break;
    }

    if (newDirection) {
      setDirectionQueue((prevQueue) => [...prevQueue, newDirection]);
    }
  };

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
