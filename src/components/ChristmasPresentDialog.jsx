import React, { useState, useEffect } from 'react';
import "./ChristmasPresentDialog.css"

const ChristmasPresentDialog = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const slides = [
    "Merry Christmas Amber and Kira!",
    "Welcome to the Pokemon Snake Game!",
    `
      Snorlax and Espeon need your help! Use the arrow keys on your keyboard to navigate them through the area. Each Pokeball you collect will make another Pokemon spawn behind them.
      
      Be careful not to hit the trees or run into another Pokemon! If you do, the game will end. See if you can beat your high score, Pokemon Trainer!
    `,
    `
      Great job, Pokemon Trainer! You're on your way to becoming a Pokemon Master. Click the "Close" button, then click "Play" to proceed with the game!
    `,
    // Add more slides as needed
  ];
  

  const handleNext = () => {
    setSlideIndex((prevIndex) => Math.min(prevIndex + 1, slides.length - 1));
  };

  const handlePrevious = () => {
    setSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleModalClick = (e) => {
    // Prevent clicks inside the modal from closing it
    e.stopPropagation();
  };

  useEffect(() => {
    const currentDate = new Date();
    const isChristmasDay = currentDate.getDate() === 25 && currentDate.getMonth() === 11; // Months are zero-based in JavaScript (0 - January, 11 - December)

    if (isChristmasDay) {
      setIsOpen(true);
    }
  }, []); // Empty dependency array to run the effect only once on mount

  return (
    <>
     {isOpen && (
      <div className="modal-overlay" onClick={handleModalClick}>
        <div className="modal" onClick={handleModalClick}>
          <h1>{slides[slideIndex]}</h1>
          {slideIndex > 0 && <button onClick={handlePrevious}>Previous</button>}
          {slideIndex < slides.length - 1 && <button onClick={handleNext}>Next</button>}
          {slideIndex === slides.length - 1 && <button onClick={handleClose}>Close</button>}
        </div>
      </div>)}
    </>
  );
};

export default ChristmasPresentDialog;
