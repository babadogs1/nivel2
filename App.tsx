
import React, { useState, useEffect } from 'react';
import { StudyContext, StudyMode, Subject, StudyPlan, Quiz } from './types';
import Header from './components/Header';
import SyllabusNavigator from './components/SyllabusNavigator';
import StudyArea from './components/StudyArea';
import ProgressDashboard from './components/ProgressDashboard';
import SimulatorArea from './components/SimulatorArea';
import StudyPlanGenerator from './components/StudyPlanGenerator';
import StudyPlanViewer from './components/StudyPlanViewer';
import ImageSolver from './components/ImageSolver';
import { getStudyPlan } from './services/studyPlanService';
import { SYLLABUS } from './constants';


type AppView = 'planGenerator' | 'planViewer' | 'syllabus' | 'studyArea' | 'simulator' | 'imageSolver';

const App: React.FC = () => {
  const [studyContext, setStudyContext] = useState<StudyContext | null>(null);
  const [mode, setMode] = useState<StudyMode>('study');
  const [showProgress, setShowProgress] = useState(false);
  const [activeSimulator, setActiveSimulator] = useState<Subject | null>(null);
  const [activePdfQuiz, setActivePdfQuiz] = useState<Quiz | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [view, setView] = useState<AppView>('syllabus');

  useEffect(() => {
    const existingPlan = getStudyPlan();
    setStudyPlan(existingPlan);
    if (existingPlan) {
      setView('planViewer');
    } else {
      setView('syllabus');
    }
  }, []);

  const handleSelectSubTopic = (context: StudyContext, selectedMode: StudyMode) => {
    setStudyContext(context);
    setMode(selectedMode);
    setView('studyArea');
  };
  
  const handleStartSimulator = (syllabus: Subject) => {
    setActiveSimulator(syllabus);
    setActivePdfQuiz(null);
    setView('simulator');
  }

  const handleStartPdfSimulator = (quiz: Quiz) => {
    setActivePdfQuiz(quiz);
    setActiveSimulator(null);
    setView('simulator');
  }

  const handleBackToMain = () => {
    setStudyContext(null);
    setActiveSimulator(null);
    setActivePdfQuiz(null);
    if (studyPlan) {
      setView('planViewer');
    } else {
      setView('syllabus');
    }
  };

  const handlePlanGenerated = (plan: StudyPlan) => {
    setStudyPlan(plan);
    setView('planViewer');
  }

  const handleSelectFromPlan = (dayPlan: { subTopic: string; topic: string; }) => {
    // 1. Robust Normalization (Ignore Case, Accents, Special Chars)
    const normalize = (str: string) => 
        str.toLowerCase()
           .normalize("NFD")
           .replace(/[\u0300-\u036f]/g, "")
           .replace(/[^\w\s]/g, "")
           .trim();
    
    // 2. Find University (Fuzzy)
    let planUniversity = SYLLABUS.find(s => normalize(s.name) === normalize(studyPlan?.university || ""));
    
    if (!planUniversity && studyPlan?.university) {
        planUniversity = SYLLABUS.find(s => 
            normalize(s.name).includes(normalize(studyPlan.university)) || 
            normalize(studyPlan.university).includes(normalize(s.name))
        );
    }
    
    // 3. Find Topic and SubTopic (Fuzzy & Search Broadly)
    let context: StudyContext | null = null;

    if (planUniversity) {
        // Try to find exact or fuzzy match within the known syllabus
        for (const t of planUniversity.topics) {
            if (normalize(t.name) === normalize(dayPlan.topic) || normalize(t.name).includes(normalize(dayPlan.topic))) {
                const sub = t.subTopics.find(st => normalize(st.name) === normalize(dayPlan.subTopic) || normalize(st.name).includes(normalize(dayPlan.subTopic)));
                if (sub) {
                    context = {
                        university: planUniversity.name,
                        topic: t.name,
                        subTopic: sub
                    };
                    break;
                }
            }
        }
    }

    // 4. Fallback: If strict/fuzzy matching failed (AI hallucinated a name), create a temporary context.
    // This guarantees the user is ALWAYS navigated to the study area.
    if (!context) {
        console.warn("Using fallback context for study plan item:", dayPlan);
        context = {
            university: studyPlan?.university || "Mi Plan de Estudio",
            topic: dayPlan.topic,
            subTopic: { name: dayPlan.subTopic }
        };
    }
    
    setStudyContext(context);
    setMode('study');
    setView('studyArea');
  };

  const handleOpenImageSolver = () => {
    setView('imageSolver');
    setActiveSimulator(null);
    setActivePdfQuiz(null);
    setStudyContext(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        onShowProgress={() => setShowProgress(true)} 
        onShowPlan={() => setView('planViewer')}
        onShowSyllabus={() => setView('syllabus')}
        hasPlan={!!studyPlan}
        onOpenImageSolver={handleOpenImageSolver}
      />

      <main className="flex-grow container mx-auto px-4 py-8 md:px-8">
        {view === 'syllabus' && (
          <SyllabusNavigator 
            onSelectSubTopic={handleSelectSubTopic} 
            onStartSimulator={handleStartSimulator}
            onCreatePlan={() => setView('planGenerator')}
          />
        )}

        {view === 'planGenerator' && (
            <StudyPlanGenerator 
                onPlanGenerated={handlePlanGenerated} 
                onStartPdfSimulator={handleStartPdfSimulator}
            />
        )}

        {view === 'planViewer' && studyPlan && (
            <StudyPlanViewer 
                plan={studyPlan} 
                onSelectTopic={handleSelectFromPlan}
                onCreateNewPlan={() => setView('planGenerator')}
            />
        )}

        {view === 'studyArea' && studyContext && (
          <StudyArea 
            context={studyContext} 
            mode={mode} 
            onBack={handleBackToMain} 
          />
        )}

        {view === 'simulator' && (activeSimulator || activePdfQuiz) && (
          <SimulatorArea 
            syllabus={activeSimulator || undefined}
            preLoadedQuiz={activePdfQuiz}
            onBack={handleBackToMain} 
          />
        )}

        {view === 'imageSolver' && (
            <ImageSolver onBack={handleBackToMain} />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 py-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col items-start">
                 <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 ml-1 mb-1 tracking-wide">powered by</span>
                 <div className="flex items-center space-x-2">
                     <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="lagciaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                      <circle cx="20" cy="20" r="17" stroke="url(#lagciaGradient)" strokeWidth="3" />
                      <path d="M15 13 V27 H25" stroke="url(#lagciaGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                   <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500">
                     LAGCIA
                   </span>
                </div>
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium sm:pt-4">2026</span>
        </div>
      </footer>

      {showProgress && <ProgressDashboard onClose={() => setShowProgress(false)} />}
    </div>
  );
};

export default App;
