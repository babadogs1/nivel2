
import React, { useState } from 'react';
import { SYLLABUS } from '../constants';
import { generateStudyPlan, generateStudyPlanFromPDF, generateSimulationFromPDF } from '../services/geminiService';
import { saveStudyPlan } from '../services/studyPlanService';
import type { StudyPlan, Quiz } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ProgressLoader from './ProgressLoader';

interface StudyPlanGeneratorProps {
  onPlanGenerated: (plan: StudyPlan) => void;
  onStartPdfSimulator?: (quiz: Quiz) => void;
}

const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({ onPlanGenerated, onStartPdfSimulator }) => {
  const [mode, setMode] = useState<'manual' | 'pdf'>('manual');
  const [university, setUniversity] = useState(SYLLABUS[0].name);
  const [weeks, setWeeks] = useState('4');
  const [hoursPerWeek, setHoursPerWeek] = useState('5');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'plan' | 'simulator'>('plan');
  const [error, setError] = useState('');
  const [simProgress, setSimProgress] = useState({ current: 0, total: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setError('');
      } else {
        setError('Por favor, sube un archivo PDF válido.');
        setPdfFile(null);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the Data-URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingType('plan');
    setError('');

    const weeksNum = parseInt(weeks, 10);
    const hoursNum = parseInt(hoursPerWeek, 10);

    if (isNaN(weeksNum) || weeksNum <= 0 || isNaN(hoursNum) || hoursNum <= 0) {
      setError('Por favor, ingresa números válidos y positivos.');
      setIsLoading(false);
      return;
    }

    try {
      let plan: StudyPlan;

      if (mode === 'manual') {
        const selectedSyllabus = SYLLABUS.find(s => s.name === university);
        if (!selectedSyllabus) {
          setError('Universidad no encontrada.');
          setIsLoading(false);
          return;
        }
        plan = await generateStudyPlan(university, weeksNum, hoursNum, selectedSyllabus);
      } else {
        // PDF Mode
        if (!pdfFile) {
          setError('Por favor, selecciona un archivo PDF.');
          setIsLoading(false);
          return;
        }
        const base64 = await fileToBase64(pdfFile);
        plan = await generateStudyPlanFromPDF(base64, weeksNum, hoursNum);
      }

      saveStudyPlan(plan);
      onPlanGenerated(plan);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al generar el plan. Asegúrate de que el PDF sea legible o revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePdfSimulator = async () => {
    if (!pdfFile) {
        setError('Por favor, selecciona un archivo PDF primero.');
        return;
    }
    setIsLoading(true);
    setLoadingType('simulator');
    setSimProgress({ current: 0, total: 80 });
    setError('');

    try {
        const base64 = await fileToBase64(pdfFile);
        const quiz = await generateSimulationFromPDF(base64, (loaded, total) => {
            setSimProgress({ current: loaded, total });
        });

        if (quiz && onStartPdfSimulator) {
            onStartPdfSimulator(quiz);
        } else {
            setError("No se pudo generar el simulador.");
        }
    } catch (err) {
        console.error(err);
        setError('Error al generar el simulador del PDF.');
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading) {
    if (loadingType === 'simulator') {
        return <ProgressLoader current={simProgress.current} total={simProgress.total} text="Generando simulador de 80 preguntas desde tu PDF..." />;
    }

    const loadingMessages = mode === 'pdf' 
      ? ["Leyendo tu documento PDF...", "Analizando el temario con IA...", "Estructurando tu plan de estudio personalizado..."]
      : ["Diseñando tu plan de estudio...", "Distribuyendo temas de manera equilibrada...", "Optimizando tu calendario..."];
      
    return (
      <div className="text-center p-8">
        <LoadingSpinner messages={loadingMessages} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Crea tu Plan de Estudio</h2>
      
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setMode('manual')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'manual' 
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Temario Predefinido
          </button>
          <button
            onClick={() => setMode('pdf')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'pdf' 
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Subir PDF
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md mb-6 text-center font-semibold">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'manual' ? (
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              1. ¿Para qué universidad te estás preparando?
            </label>
            <select
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            >
              {SYLLABUS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        ) : (
          <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-center">
            <label htmlFor="pdfUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              1. Sube el temario en PDF
            </label>
            <input
              type="file"
              id="pdfUpload"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200
                cursor-pointer"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              La IA analizará el documento para crear tu plan. Máximo 10MB.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label htmlFor="weeks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                2. Semanas disponibles
            </label>
            <input
                type="number"
                id="weeks"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                placeholder="Ej: 8"
                min="1"
                max="52"
            />
            </div>

            <div>
            <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                3. Horas por semana
            </label>
            <input
                type="number"
                id="hoursPerWeek"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                placeholder="Ej: 10"
                min="1"
                max="40"
            />
            </div>
        </div>

        <div className="space-y-3">
            <button
            type="submit"
            className="w-full text-center font-bold text-lg p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isLoading || (mode === 'pdf' && !pdfFile)}
            >
            {isLoading ? 'Generando...' : (mode === 'pdf' ? 'Analizar PDF y Crear Plan' : 'Generar Plan Automático')}
            </button>

            {mode === 'pdf' && (
                <button
                    type="button"
                    onClick={handleGeneratePdfSimulator}
                    disabled={isLoading || !pdfFile}
                    className="w-full text-center font-bold text-lg p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    Generar Simulador del PDF (80 preguntas)
                </button>
            )}
        </div>
      </form>
    </div>
  );
};

export default StudyPlanGenerator;
