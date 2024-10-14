import React, { useState, useEffect } from 'react';
import { Shuffle, Timer, Move, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type Difficulty = 'easy' | 'medium' | 'hard';

const difficultySettings = {
  easy: { gridSize: 4, emojis: ['🌟', '🌙', '☀️', '🌎', '🌈', '⚡', '❄️', '🔥'] },
  medium: { gridSize: 5, emojis: ['🌟', '🌙', '☀️', '🌎', '🌈', '⚡', '❄️', '🔥', '🌊', '🍀', '🌸', '🍁'] },
  hard: { gridSize: 6, emojis: ['🌟', '🌙', '☀️', '🌎', '🌈', '⚡', '❄️', '🔥', '🌊', '🍀', '🌸', '🍁', '🌴', '🌵', '🌺', '🍄', '🌹', '🌻'] }
};

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameStarted) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameStarted]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setShowCongrats(true);
      setIsGameStarted(false);
    }
  }, [cards]);

  const initializeGame = (diff: Difficulty) => {
    const { gridSize, emojis } = difficultySettings[diff];
    const shuffledEmojis = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.pow(gridSize, 2) / 2);
    
    const shuffledCards = [...shuffledEmojis, ...shuffledEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setIsGameStarted(false);
    setShowCongrats(false);
  };

  const handleCardClick = (id: number) => {
    if (!isGameStarted) setIsGameStarted(true);
    if (flippedCards.length === 2) return;
    
    setCards(cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    ));
    
    setFlippedCards([...flippedCards, id]);
    setMoves(moves + 1);

    if (flippedCards.length === 1) {
      const firstCardId = flippedCards[0];
      const secondCardId = id;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      if (firstCard?.emoji === secondCard?.emoji) {
        setCards(cards.map(card => 
          card.id === firstCardId || card.id === secondCardId
            ? { ...card, isMatched: true }
            : card
        ));
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(cards.map(card => 
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const gridSizeClass = {
    easy: 'grid-cols-4',
    medium: 'grid-cols-5',
    hard: 'grid-cols-6'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8">
      <h1 className="text-5xl font-bold mb-8 text-shadow">Memory Game</h1>
      <div className="mb-6 flex justify-between w-full max-w-2xl">
        <div className="flex items-center">
          <Move className="mr-2" />
          <span className="text-xl">Moves: {moves}</span>
        </div>
        <div className="flex items-center">
          <Timer className="mr-2" />
          <span className="text-xl">Time: {formatTime(time)}</span>
        </div>
      </div>
      <motion.div 
        key={difficulty}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className={`grid ${gridSizeClass[difficulty]} gap-4 mb-8 w-full max-w-2xl`}
      >
        {cards.map((card) => (
          <motion.button
            key={card.id}
            className={`aspect-square rounded-xl shadow-lg ${
              card.isFlipped || card.isMatched ? 'bg-white' : 'bg-gradient-to-br from-blue-400 to-blue-600'
            } flex items-center justify-center text-4xl`}
            onClick={() => !card.isFlipped && !card.isMatched && handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <div className="absolute w-full h-full backface-hidden">
              {card.isFlipped || card.isMatched ? card.emoji : ''}
            </div>
          </motion.button>
        ))}
      </motion.div>
      <div className="flex space-x-4 mb-6">
        {(['easy', 'medium', 'hard'] as const).map((diff) => (
          <button
            key={diff}
            className={`px-4 py-2 rounded-lg transition-colors ${
              difficulty === diff
                ? 'bg-green-500'
                : 'bg-gray-300 text-gray-700'
            }`}
            onClick={() => setDifficulty(diff)}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>
      <button
        className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        onClick={() => initializeGame(difficulty)}
      >
        <Shuffle className="mr-2" /> Restart Game
      </button>

      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white text-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
            >
              <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
              <p className="mb-2">You completed the game in:</p>
              <p className="text-2xl font-semibold mb-4">{formatTime(time)}</p>
              <p className="mb-4">Total moves: {moves}</p>
              <button
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                onClick={() => {
                  setShowCongrats(false);
                  initializeGame(difficulty);
                }}
              >
                Play Again
              </button>
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowCongrats(false)}
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryGame;