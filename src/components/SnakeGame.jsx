import React, { useState, useEffect, useRef } from 'react';
import './SnakeGame.css';
import treeImage from '../assets/imgs/tree.png'
import pokeball from "../assets/imgs/pokeball.png"

const generateFood = () => {
  const x = Math.floor(Math.random() * 8) + 1; // Generates a random number between 1 and 8 (inclusive)
  const y = Math.floor(Math.random() * 8) + 1;
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
      x: index + 1,
      y: 0 + 1,
      pokedexId: pokemonStack.current.pop(), // Set the initial pokedexId
    }))
  );

  const [food, setFood] = useState(() => generateFood());
  const [directionQueue, setDirectionQueue] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentDirectionRef = useRef('RIGHT');
  const currentPokemonRef = useRef([]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  
  const handleRestart = () => {
    pokemonStack.current = generateRandomPokemonOrder()
    setSnake(Array.from({ length: initialSnakeLength }, (_, index) => ({
      x: index + 1,
      y: 0 + 1,
      pokedexId: pokemonStack.current.pop(),
    })));
    setFood(generateFood());
    setDirectionQueue([]);
    setGameOver(false);
    setScore(0);
    setIsPlaying(false)
  };

  useEffect(() => {
    console.log(gameOver, isPlaying)
    if (gameOver || !isPlaying) {
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
            clearInterval(gameInterval);
          }

          if (checkFoodCollision(newSnake[0])) {
            setFood(generateFood());
            setScore((prevScore) => prevScore + 1);
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
        head.x < 1 ||
        head.y < 1 ||
        head.x > 8 ||
        head.y > 8 ||
        snake.slice(1).some((part) => part.x === head.x && part.y === head.y)
      );
    };

    const checkFoodCollision = (head) => {
      return head.x === food.x && head.y === food.y;
    };

    const gameInterval = setInterval(() => {
      moveSnake();
    }, 500);

    return () => {
      clearInterval(gameInterval);
    };
  }, [snake, directionQueue, food, gameOver, currentDirectionRef, isPlaying]);

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
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
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
        }
        else if (cellType == "food") {
          board.push(
            <div key={`${x}-${y}`} className={cellType}>
              <img
                className="pokemon_img"
                src={pokeball}
                alt={`Pokemon`}
              />
            </div>
          );
        } 
        else {
          // Otherwise, use the regular content
          if (x == 0 || x == 9 || y == 0 || y == 9) {
            board.push(<div key={`${x}-${y}`} className={"empty"}>
              <img
                className="pokemon_img"
                src={treeImage}
                alt={`Pokemon`}
              />
            </div>)
          }
          else {
            board.push(<div key={`${x}-${y}`} className={`cell ${cellType}`} />);
          }
        }
      }
    }
    return board;
  };

  return (
    <div className="game-container">
      <div className="main-container">
        <div className="main-menu">
        <button onClick={handleRestart} disabled={!gameOver}>Restart</button>
        <div className="score">Score: {score}</div>
        <button onClick={handlePlay} disabled={isPlaying}>Play</button>
        </div>
        <div className="game-board">
          {renderGameBoard()}
        </div>
        <div className="score-menu">
          <div>Score: {score}</div>
        </div>
      </div>
    </div>
  );
  
};

export default SnakeGame;
