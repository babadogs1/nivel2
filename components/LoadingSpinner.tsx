import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  messages: string[];
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ messages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); 

    return () => clearInterval(intervalId);
  }, [messages]);

  const defaultMessage = "Generando contenido con IA...";
  const currentMessage = messages && messages.length > 0 ? messages[currentIndex] : defaultMessage;

  return (
    <div className="flex justify-center items-center my-16">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
       <p className="ml-4 text-lg text-gray-600 dark:text-gray-300">{currentMessage}</p>
    </div>
  );
};

export default LoadingSpinner;