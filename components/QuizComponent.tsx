
import React, { useState, useEffect } from 'react';
import type { Quiz, QuizQuestion, StudyMode, StudyContext } from '../types';
import { generateHint, analyzeMistakes } from '../services/geminiService';
import { saveQuizResult } from '../services/progressService';
import InlineContent from './InlineContent';

interface QuizComponentProps {
  quiz: Quiz;
  context: StudyContext;
  onFinish: () => void;
  finishButtonText: string;
  mode: StudyMode;
}

const SECONDS_PER_QUESTION = 90; // 1.5 minutes per question

const QuizComponent: React.FC<QuizComponentProps> = ({ quiz, context, onFinish, finishButtonText, mode }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [quizTimeSeconds] = useState(quiz.questions.length * SECONDS_PER_QUESTION);
  const [timeLeft, setTimeLeft] = useState(quizTimeSeconds);
  const [reviewMode, setReviewMode] = useState(false);
  const [mistakeAnalysis, setMistakeAnalysis] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'exam' || showResults || reviewMode) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, showResults, reviewMode]);

  const handleTimeUp = () => {
    setShowResults(true);
  };
  
  useEffect(() => {
    if(showResults && !reviewMode) {
      const result = {
        university: context.university,
        topic: context.topic,
        subTopic: context.subTopic.name,
        score: score,
        totalQuestions: quiz.questions.length,
        date: new Date().toISOString(),
      };
      saveQuizResult(result);

      const mistakes = quiz.questions.map((q, i) => ({
          question: q,
          userAnswerIndex: userAnswers[i],
      })).filter(item => item.userAnswerIndex !== null && item.userAnswerIndex !== item.question.correctAnswerIndex);

      if (mistakes.length > 0) {
          setIsAnalysisLoading(true);
          const mistakeDetails = mistakes.map(m => ({
              question: m.question.question,
              userAnswer: m.question.options[m.userAnswerIndex!],
              correctAnswer: m.question.options[m.question.correctAnswerIndex],
              explanation: m.question.explanation,
          }));

          analyzeMistakes(mistakeDetails)
              .then(analysis => setMistakeAnalysis(analysis))
              .catch(err => {
                  console.error(err);
                  setMistakeAnalysis("Hubo un problema al generar el análisis de tus errores.");
              })
              .finally(() => setIsAnalysisLoading(false));
      }
    }
  }, [showResults, reviewMode, context, score, quiz.questions, userAnswers]);


  const currentQuestion: QuizQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = index;
    setUserAnswers(newAnswers);

    setIsAnswered(true);
    if (index === currentQuestion.correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsAnswered(false);
      setHint(null);
      setIsHintLoading(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(Array(quiz.questions.length).fill(null));
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setHint(null);
    setIsHintLoading(false);
    setTimeLeft(quizTimeSeconds);
    setReviewMode(false);
    setMistakeAnalysis(null);
    setIsAnalysisLoading(false);
  };

  const handleGetHint = async () => {
    if (isHintLoading || hint) return;
    setIsHintLoading(true);
    const generatedHint = await generateHint(currentQuestion.question, currentQuestion.options);
    setHint(generatedHint);
    setIsHintLoading(false);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (reviewMode) {
    return (
      <div>
        <h3 className="text-2xl font-bold mb-6 text-center">Revisión del Examen</h3>
        <div className="space-y-8">
          {quiz.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswerIndex;
            return (
              <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <p className="font-semibold mb-2">{index + 1}. {question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isUserChoice = userAnswer === optIndex;
                    const isCorrectAnswer = question.correctAnswerIndex === optIndex;
                    let optionClass = "w-full text-left p-3 rounded-md border text-sm ";

                    if (isCorrectAnswer) {
                      optionClass += "bg-green-100 dark:bg-green-900/50 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200";
                    } else if (isUserChoice && !isCorrectAnswer) {
                      optionClass += "bg-red-100 dark:bg-red-900/50 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200";
                    } else {
                       optionClass += "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500";
                    }
                    
                    return (
                        <div key={optIndex} className={optionClass}>
                            {option}
                            {isUserChoice && !isCorrect && <span className="font-bold ml-2">(Tu respuesta)</span>}
                            {isCorrectAnswer && <span className="font-bold ml-2">(Respuesta correcta)</span>}
                        </div>
                    );
                  })}
                </div>
                 <div className="mt-4 p-3 bg-yellow-50 dark:bg-gray-700 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-500 text-sm">
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Explicación:</h4>
                    <p className="text-yellow-700 dark:text-yellow-300">{question.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
            <button onClick={() => setReviewMode(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Volver a Resultados
            </button>
        </div>
      </div>
    );
  }


  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const hasMistakes = score < quiz.questions.length;
    return (
      <div className="text-center p-4 md:p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">¡Examen Completado!</h3>
        <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: percentage >= 70 ? '#22c55e' : percentage >= 40 ? '#f59e0b' : '#ef4444' }}>
          {percentage}%
        </p>
        <p className="text-lg md:text-xl mb-6 text-gray-600 dark:text-gray-300">
          Obtuviste {score} de {quiz.questions.length} respuestas correctas.
        </p>
        
        {/* AI Mistake Analysis Section */}
        {hasMistakes && (
            <div className="mt-8 text-left max-w-3xl mx-auto">
                {isAnalysisLoading && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg animate-pulse">
                        <svg className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-700 dark:text-gray-200 font-semibold">Analizando tus errores para darte consejos...</span>
                    </div>
                )}
                {mistakeAnalysis && !isAnalysisLoading && (
                    <div className="p-5 bg-teal-50 dark:bg-teal-900/50 border-l-4 border-teal-500 rounded-r-lg">
                        <div className="flex items-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-teal-600 dark:text-teal-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <h4 className="text-xl font-bold text-teal-800 dark:text-teal-200">Consejos de tu Tutor IA</h4>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-teal-800 dark:text-teal-200 space-y-2">
                           <InlineContent text={mistakeAnalysis} />
                        </div>
                    </div>
                )}
            </div>
        )}
        {!hasMistakes && score > 0 && (
             <div className="mt-8 text-left max-w-3xl mx-auto p-5 bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 rounded-r-lg">
                <h4 className="text-xl font-bold text-green-800 dark:text-green-200">¡Puntaje Perfecto!</h4>
                <p className="text-green-700 dark:text-green-300 mt-2">¡Excelente trabajo! Has respondido todas las preguntas correctamente. Sigue así.</p>
            </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Intentar de Nuevo
          </button>
          <button onClick={() => setReviewMode(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Revisar Respuestas
          </button>
          <button onClick={onFinish} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            {finishButtonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow">
            <p className="text-sm text-gray-500 dark:text-gray-400">
            Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}
            </p>
            <h3 className="text-xl font-semibold my-2">{currentQuestion.question}</h3>
        </div>
        {mode === 'exam' && !isAnswered && (
            <button
            onClick={handleGetHint}
            disabled={isHintLoading || !!hint}
            className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 ml-4"
            aria-label="Obtener una pista"
            >
            {isHintLoading ? (
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )}
            </button>
        )}
      </div>
      
       {mode === 'exam' && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(timeLeft / quizTimeSeconds) * 100}%`, transition: 'width 1s linear' }}></div>
          <p className="text-center text-sm font-bold mt-1 text-gray-600 dark:text-gray-300">Tiempo Restante: {formatTime(timeLeft)}</p>
        </div>
      )}


      {hint && mode === 'exam' && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200"><strong className="font-semibold">Pista:</strong> {hint}</p>
        </div>
      )}

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correctAnswerIndex;
          const isSelected = userAnswers[currentQuestionIndex] === index;
          
          let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 text-lg ";
          if (isAnswered) {
            if (isCorrect) {
              buttonClass += "bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200 scale-105 shadow-lg";
            } else if (isSelected) {
              buttonClass += "bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200";
            } else {
              buttonClass += "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400";
            }
          } else {
            buttonClass += "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:border-blue-500 dark:hover:border-blue-400";
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={buttonClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-500">
          <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Explicación:</h4>
          <p className="text-yellow-700 dark:text-yellow-300">{currentQuestion.explanation}</p>
        </div>
      )}
      
      <div className="mt-8 text-right">
        <button
          onClick={handleNextQuestion}
          disabled={!isAnswered}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex < quiz.questions.length - 1 ? 'Siguiente' : 'Ver Resultados'}
        </button>
      </div>
    </div>
  );
};

export default QuizComponent;