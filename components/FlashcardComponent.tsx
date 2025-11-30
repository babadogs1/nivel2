import React, { useState } from 'react';
import type { Flashcard } from '../types';

interface FlashcardComponentProps {
  flashcards: Flashcard[];
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <p>No se encontraron flashcards para este tema.</p>;
  }

  const handleNext = () => {
    setIsFlipped(false);
    // Use a timeout to allow the card to flip back before changing content
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 300);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 300);
  };
  
  const currentCard = flashcards[currentIndex];
  
  // Inline styles for robust 3D transform animations
  const cardContainerStyle: React.CSSProperties = {
    transformStyle: 'preserve-3d',
    transition: 'transform 0.7s',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const cardFaceStyle: React.CSSProperties = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden', // For Safari compatibility
  };
  
  const cardBackStyle: React.CSSProperties = {
    ...cardFaceStyle,
    transform: 'rotateY(180deg)',
  };


  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-full max-w-2xl h-80"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className="relative w-full h-full rounded-lg shadow-xl cursor-pointer"
          style={cardContainerStyle}
        >
          {/* Front of card */}
          <div style={cardFaceStyle} className="absolute w-full h-full flex items-center justify-center p-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <p className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-200">{currentCard.term}</p>
          </div>
          {/* Back of card */}
          <div style={cardBackStyle} className="absolute w-full h-full flex items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-lg text-center text-gray-700 dark:text-gray-300">{currentCard.definition}</p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-gray-500 dark:text-gray-400">
        Haz clic en la tarjeta para voltearla.
      </p>

      <div className="mt-6 flex items-center justify-between w-full max-w-2xl">
        <button
          onClick={handlePrev}
          className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Anterior
        </button>
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default FlashcardComponent;