import React, { useState } from 'react';

interface FigureComponentProps {
  description: string; // Will be used as a search query
}

const FigureComponent: React.FC<FigureComponentProps> = ({ description: query }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearch = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="my-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
      <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-2">Asistente de Búsqueda Visual con IA</h4>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        La IA ha generado la siguiente consulta optimizada para encontrar la mejor imagen educativa en la web.
      </p>
      <div className="w-full max-w-lg p-3 bg-white dark:bg-gray-700 border border-dashed border-gray-400 dark:border-gray-500 rounded-md">
        <p className="italic text-gray-800 dark:text-gray-200">"{query}"</p>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? '¡Copiado!' : 'Copiar Prompt'}
        </button>
        <button
          onClick={handleSearch}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscar en Google Images
        </button>
      </div>
    </div>
  );
};

export default FigureComponent;