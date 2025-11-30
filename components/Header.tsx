
import React from 'react';

interface HeaderProps {
    onShowProgress: () => void;
    onShowPlan: () => void;
    onShowSyllabus: () => void;
    hasPlan: boolean;
    onOpenImageSolver: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowProgress, onShowPlan, onShowSyllabus, hasPlan, onOpenImageSolver }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={onShowSyllabus}>
           {/* Nuevo Logo NIVELAPP: N minimalista con gradiente */}
           <svg className="w-10 h-10 group-hover:scale-105 transition-transform duration-300" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nivelappGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
                  <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet */}
                  <stop offset="100%" stopColor="#f43f5e" /> {/* Rose */}
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="17" stroke="url(#nivelappGradient)" strokeWidth="3" />
              <path d="M14 27V13L26 27V13" stroke="url(#nivelappGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
           </svg>
           
           <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 hidden sm:block">
             NIVELAPP
           </h1>
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 sm:hidden">
             NIVELAPP
           </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={onOpenImageSolver}
            className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors flex items-center justify-center"
            title="Cámara IA - Resolver dudas con foto"
            aria-label="Cámara IA"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="ml-2 font-semibold hidden md:inline">Cámara IA</span>
          </button>

          {hasPlan && (
            <button
              onClick={onShowPlan}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Mi Plan
            </button>
          )}

          <button
             onClick={onShowSyllabus}
             className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden sm:block"
          >
            Temario
          </button>

          <button
            onClick={onShowProgress}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <span className="hidden md:inline">Mi Progreso</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
