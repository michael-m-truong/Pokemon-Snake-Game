import React, { useState, useEffect, useRef } from 'react';
import './SnakeGame.css';

const generateFood = () => {
  const x = Math.floor(Math.random() * 18);
  const y = Math.floor(Math.random() * 18);
  return { x, y };
};

const generateRandomPokemonOrder = () => {
  const numbers = Array.from({ length: 649 }, (_, index) => index + 1);

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // Ensure either 163 or 196 is last or second to last with a 50/50 chance
  if (Math.random() < 0.5) {
    // If 196 is not the last element, swap it with the last element
    const indexOf196 = numbers.indexOf(196);
    [numbers[numbers.length - 1], numbers[indexOf196]] = [numbers[indexOf196], numbers[numbers.length - 1]];
  } else {
    // If 163 is not the last element, swap it with the last element
    const indexOf143 = numbers.indexOf(143);
    [numbers[numbers.length - 1], numbers[indexOf143]] = [numbers[indexOf143], numbers[numbers.length - 1]];
  }

  const stack = numbers;

  return stack;
};


const SnakeGame = () => {
  const pokemonStack = useRef(generateRandomPokemonOrder());
  const initialSnakeLength = 1;
  const [snake, setSnake] = useState(
    Array.from({ length: initialSnakeLength }, (_, index) => ({
      x: index,
      y: 0,
      pokedexId: pokemonStack.current.pop(), // Set the initial pokedexId
    }))
  );

  const [food, setFood] = useState(() => generateFood());
  const [directionQueue, setDirectionQueue] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  const currentDirectionRef = useRef('RIGHT');
  const currentPokemonRef = useRef([]);

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
            const newPokedexId = pokemonStack.current.pop();
            currentPokemonRef.current.push(newPokedexId);
            return [...newSnake, { x: -1, y: -1, pokedexId: newPokedexId }];
          }

          return newSnake.map((part, index) => {
            // Ensure each snake part has a unique pokedexId
            if (index === 0) {
              return part;
            }
            return { ...part, pokedexId: currentPokemonRef.current[index - 1] };
          });
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
        let pokedexId = null;

        if (snake.some((part) => part.x === x && part.y === y)) {
          cellType = 'snake';
          const currentPart = snake.find((part) => part.x === x && part.y === y);
          if (currentPart) {
            pokedexId = currentPart.pokedexId;
          }
        } else if (food.x === x && food.y === y) {
          cellType = 'food';
        }

        if (cellType === 'snake') {
          // If it's a snake cell, use the default Pokémon image URL
          board.push(
            <div key={`${x}-${y}`} className={cellType}>
              <img
                className="pokemon_img"
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokedexId}.gif`}
                alt={`Pokemon`}
              />
            </div>
          );
        } else {
          // Otherwise, use the regular content
          board.push(<div key={`${x}-${y}`} className={`cell ${cellType}`} />);
        }
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
