import React from 'react';

interface ProgressLoaderProps {
  current: number;
  total: number;
  text?: string;
}

const ProgressLoader: React.FC<ProgressLoaderProps> = ({ current, total, text = "Generando..." }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="my-16 flex flex-col items-center">
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
        {text} {current} / {total}
      </p>
      <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressLoader;
