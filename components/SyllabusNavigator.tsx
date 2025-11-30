import React, { useState } from 'react';
import { SYLLABUS } from '../constants';
import type { Topic, StudyMode, StudyContext, Subject } from '../types';

interface SyllabusNavigatorProps {
  onSelectSubTopic: (context: StudyContext, mode: StudyMode) => void;
  onStartSimulator: (syllabus: Subject) => void;
  onCreatePlan: () => void;
}

const SyllabusNavigator: React.FC<SyllabusNavigatorProps> = ({ onSelectSubTopic, onStartSimulator, onCreatePlan }) => {
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [openUniversity, setOpenUniversity] = useState<string | null>(SYLLABUS.length > 0 ? SYLLABUS[0].name : null);

  const toggleTopic = (topicName: string) => {
    setOpenTopic(openTopic === topicName ? null : topicName);
  };

  const toggleUniversity = (universityName: string) => {
    setOpenUniversity(openUniversity === universityName ? null : universityName);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">Temario Completo</h2>

      <div className="mb-10 p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-center">
        <h3 className="text-2xl font-bold mb-3 text-green-800 dark:text-green-200">¡Organiza tu Estudio!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-5">Crea un plan de estudio personalizado adaptado a tu tiempo y objetivos.</p>
        <button
            onClick={onCreatePlan}
            className="font-semibold text-lg p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg"
        >
            Generar Mi Plan de Estudio
        </button>
      </div>
      
      <div className="mb-10 p-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-2xl font-bold text-center mb-4 text-blue-800 dark:text-blue-200">Simuladores Generales de Examen</h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Pon a prueba tus conocimientos con un examen completo de 100 preguntas.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SYLLABUS.map((university) => (
            <button
              key={university.name}
              onClick={() => onStartSimulator(university)}
              className="w-full text-center font-semibold text-lg p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              aria-label={`Iniciar simulador para ${university.name}`}
            >
              Iniciar Simulador: {university.name.split(' - ')[1] || university.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        {SYLLABUS.map((university) => (
          <div key={university.name} className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => toggleUniversity(university.name)}
              className="w-full text-left font-bold text-xl p-4 bg-gray-100 dark:bg-gray-700 rounded-t-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex justify-between items-center"
              aria-expanded={openUniversity === university.name}
            >
              {university.name}
              <svg className={`w-6 h-6 transform transition-transform ${openUniversity === university.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {openUniversity === university.name && (
              <div className="p-4 space-y-2">
                {university.topics.map((topic: Topic) => (
                  <div key={topic.name}>
                    <button
                      onClick={() => toggleTopic(`${university.name}-${topic.name}`)}
                      className="w-full text-left font-semibold p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors flex justify-between items-center"
                      aria-expanded={openTopic === `${university.name}-${topic.name}`}
                    >
                      {topic.name}
                       <svg className={`w-5 h-5 transform transition-transform ${openTopic === `${university.name}-${topic.name}` ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {openTopic === `${university.name}-${topic.name}` && (
                      <ul className="mt-2 pl-4 space-y-1">
                        {topic.subTopics.map((subTopic) => (
                          <li key={subTopic.name} className="flex justify-between items-center p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/50 group transition-colors">
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300">{subTopic.name}</span>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                               <button
                                onClick={() => onSelectSubTopic({ university: university.name, topic: topic.name, subTopic }, 'flashcards')}
                                className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800 transition-colors"
                                aria-label={`Ver flashcards de ${subTopic.name}`}
                              >
                                Flashcards
                              </button>
                              <button
                                onClick={() => onSelectSubTopic({ university: university.name, topic: topic.name, subTopic }, 'study')}
                                className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                                aria-label={`Estudiar ${subTopic.name}`}
                              >
                                Estudiar
                              </button>
                              <button
                                onClick={() => onSelectSubTopic({ university: university.name, topic: topic.name, subTopic }, 'exam')}
                                className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-colors"
                                aria-label={`Tomar examen de ${subTopic.name}`}
                              >
                                Examen
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusNavigator;