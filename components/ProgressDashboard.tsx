import React, { useState, useEffect, useMemo } from 'react';
import { getQuizResults, clearAllResults } from '../services/progressService';
import type { QuizResult } from '../types';

interface ProgressDashboardProps {
  onClose: () => void;
}

// FIX: Define types for progress data to avoid 'unknown' type from Object.entries
type TopicProgress = {
  totalScore: number;
  totalQuestions: number;
  count: number;
};

type UniversityProgress = {
  totalScore: number;
  totalQuestions: number;
  topics: Record<string, TopicProgress>;
};

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onClose }) => {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    setResults(getQuizResults());
  }, []);
  
  const handleClearProgress = () => {
      if (window.confirm("¿Estás seguro de que quieres borrar todo tu progreso? Esta acción no se puede deshacer.")) {
          clearAllResults();
          setResults([]);
      }
  }

  const progressData = useMemo(() => {
    if (results.length === 0) return null;

    const overall = results.reduce(
      (acc, r) => {
        acc.totalScore += r.score;
        acc.totalQuestions += r.totalQuestions;
        return acc;
      },
      { totalScore: 0, totalQuestions: 0 }
    );
    
    const byUniversity: Record<string, UniversityProgress> = {};

    results.forEach(r => {
        if (!byUniversity[r.university]) {
            byUniversity[r.university] = { totalScore: 0, totalQuestions: 0, topics: {} };
        }
        byUniversity[r.university].totalScore += r.score;
        byUniversity[r.university].totalQuestions += r.totalQuestions;

        if (!byUniversity[r.university].topics[r.topic]) {
            byUniversity[r.university].topics[r.topic] = { totalScore: 0, totalQuestions: 0, count: 0 };
        }
        byUniversity[r.university].topics[r.topic].totalScore += r.score;
        byUniversity[r.university].topics[r.topic].totalQuestions += r.totalQuestions;
        byUniversity[r.university].topics[r.topic].count += 1;
    });

    return {
      overall: {
        accuracy: overall.totalQuestions > 0 ? (overall.totalScore / overall.totalQuestions) * 100 : 0,
        completed: results.length
      },
      byUniversity
    };
  }, [results]);

  const ProgressBar: React.FC<{ accuracy: number }> = ({ accuracy }) => {
    const color = accuracy >= 70 ? 'bg-green-500' : accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
            <div className={`${color} h-4 rounded-full`} style={{ width: `${accuracy}%` }}></div>
        </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Mi Progreso
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Cerrar progreso"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!progressData && (
            <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Aún no has completado ningún examen.</p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">¡Completa un quiz en 'Modo Examen' para ver tu progreso aquí!</p>
            </div>
        )}

        {progressData && (
          <div className="space-y-8">
            <div className="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Resumen General</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{progressData.overall.accuracy.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Precisión General</p>
                    </div>
                     <div>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{progressData.overall.completed}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Exámenes Completados</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(progressData.byUniversity).map(([university, uData]) => {
                    // FIX: Cast uData to the correct type to avoid 'unknown' type errors.
                    const universityData = uData as UniversityProgress;
                    const uniAccuracy = universityData.totalQuestions > 0 ? (universityData.totalScore / universityData.totalQuestions) * 100 : 0;
                    return (
                        <div key={university} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold mb-3">{university} - <span className="font-bold">{uniAccuracy.toFixed(1)}%</span></h4>
                             <div className="space-y-3">
                                {Object.entries(universityData.topics).map(([topic, tData]) => {
                                    // FIX: Cast tData to the correct type to avoid 'unknown' type errors.
                                    const topicData = tData as TopicProgress;
                                    const topicAccuracy = topicData.totalQuestions > 0 ? (topicData.totalScore / topicData.totalQuestions) * 100 : 0;
                                    return (
                                        <div key={topic}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic} ({topicData.count} {topicData.count > 1 ? 'intentos' : 'intento'})</span>
                                                <span className="text-sm font-bold">{topicAccuracy.toFixed(1)}%</span>
                                            </div>
                                            <ProgressBar accuracy={topicAccuracy} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
             <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleClearProgress}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
                >
                    Borrar Todo el Progreso
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;