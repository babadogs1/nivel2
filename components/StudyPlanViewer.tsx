import React from 'react';
import type { StudyPlan, StudyPlanDay } from '../types';
import { clearStudyPlan } from '../services/studyPlanService';

interface StudyPlanViewerProps {
  plan: StudyPlan;
  onSelectTopic: (dayPlan: { subTopic: string; topic: string; }) => void;
  onCreateNewPlan: () => void;
}

const StudyPlanViewer: React.FC<StudyPlanViewerProps> = ({ plan, onSelectTopic, onCreateNewPlan }) => {

  const handleClear = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar este plan de estudio? Podrás generar uno nuevo.")) {
      clearStudyPlan();
      onCreateNewPlan();
    }
  }

  const groupedByWeek = plan.plan.reduce((acc, day) => {
    (acc[day.week] = acc[day.week] || []).push(day);
    return acc;
  }, {} as Record<number, StudyPlanDay[]>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Tu Plan de Estudio Personalizado</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                Un plan de {plan.weeks} semanas para el examen de {plan.university}.
            </p>
        </div>
        <button
          onClick={handleClear}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Crear un Nuevo Plan
        </button>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedByWeek).map(([week, days]) => (
          <div key={week}>
            <h3 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">Semana {week}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* FIX: Cast `days` to StudyPlanDay[] to allow calling .sort() */}
              {(days as StudyPlanDay[]).sort((a,b) => a.day - b.day).map((day, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="font-bold text-lg mb-2">Día {day.day}</p>
                  <div className="pl-4 border-l-4 border-blue-500">
                     <p className="font-semibold text-gray-800 dark:text-gray-200">{day.subTopic}</p>
                     <p className="text-sm text-gray-500 dark:text-gray-400">{day.topic}</p>
                     <button 
                        onClick={() => onSelectTopic({ subTopic: day.subTopic, topic: day.topic })}
                        className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Empezar a estudiar →
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyPlanViewer;