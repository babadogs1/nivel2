
import React, { useState, useEffect, useCallback } from 'react';
import type { Quiz, Subject, StudyContext } from '../types';
import { generateSimulationExam } from '../services/geminiService';
import ProgressLoader from './ProgressLoader';
import ErrorMessage from './ErrorMessage';
import QuizComponent from './QuizComponent';

interface SimulatorAreaProps {
  syllabus?: Subject;
  preLoadedQuiz?: Quiz | null;
  onBack: () => void;
}

const SimulatorArea: React.FC<SimulatorAreaProps> = ({ syllabus, preLoadedQuiz, onBack }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(preLoadedQuiz || null);
  const [isLoading, setIsLoading] = useState<boolean>(!preLoadedQuiz);
  const [error, setError] = useState<string>('');
  const [simulationProgress, setSimulationProgress] = useState({ current: 0, total: 0 });


  const fetchSimulationExam = useCallback(async () => {
    if (!syllabus) return;
    
    setIsLoading(true);
    setError('');
    setSimulationProgress({ current: 0, total: 30 }); // Standard sim is 30
    try {
      const quizData = await generateSimulationExam(syllabus, (loaded, total) => {
          setSimulationProgress({ current: loaded, total });
      });
      if (quizData && quizData.questions.length > 0) {
        setQuiz(quizData);
      } else {
        setError('No se pudo generar el examen de simulación. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Ocurrió un error al generar el examen de simulación.');
    } finally {
      setIsLoading(false);
    }
  }, [syllabus]);

  useEffect(() => {
    if (!preLoadedQuiz && syllabus) {
        fetchSimulationExam();
    } else if (preLoadedQuiz) {
        setIsLoading(false);
        setQuiz(preLoadedQuiz);
    }
  }, [fetchSimulationExam, preLoadedQuiz, syllabus]);
  
  const simulationContext: StudyContext = {
      university: syllabus ? syllabus.name : "Documento PDF",
      topic: "Simulador General",
      subTopic: { name: "Examen Completo" }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-8">
       <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver
        </button>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-1 text-center text-gray-800 dark:text-gray-200">
        {syllabus ? `Simulador de Examen: ${syllabus.name}` : 'Simulador basado en PDF'}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
        {quiz?.questions.length || (syllabus ? 30 : 80)} preguntas | {((quiz?.questions.length || (syllabus ? 30 : 80)) * 90) / 60} minutos
      </p>

      {error && <ErrorMessage message={error} />}
      {isLoading && <ProgressLoader current={simulationProgress.current} total={simulationProgress.total} text="Generando Simulación..." />}
      {!isLoading && quiz && (
        <QuizComponent 
            quiz={quiz} 
            context={simulationContext}
            onFinish={onBack} 
            finishButtonText="Volver al Inicio" 
            mode="exam" 
        />
      )}
    </div>
  );
};

export default SimulatorArea;
