import type { QuizResult } from '../types';

const PROGRESS_KEY = 'prep-ai-progress';

export const saveQuizResult = (result: QuizResult): void => {
  try {
    const existingResults = getQuizResults();
    const newResults = [...existingResults, result];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(newResults));
  } catch (error) {
    console.error("Error saving quiz result to localStorage:", error);
  }
};

export const getQuizResults = (): QuizResult[] => {
  try {
    const resultsJson = localStorage.getItem(PROGRESS_KEY);
    return resultsJson ? JSON.parse(resultsJson) : [];
  } catch (error) {
    console.error("Error retrieving quiz results from localStorage:", error);
    return [];
  }
};

export const clearAllResults = (): void => {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (error) {
    console.error("Error clearing quiz results from localStorage:", error);
  }
};
