import type { StudyPlan } from '../types';

const STUDY_PLAN_KEY = 'prep-ai-study-plan';

export const saveStudyPlan = (plan: StudyPlan): void => {
  try {
    localStorage.setItem(STUDY_PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error("Error saving study plan to localStorage:", error);
  }
};

export const getStudyPlan = (): StudyPlan | null => {
  try {
    const planJson = localStorage.getItem(STUDY_PLAN_KEY);
    return planJson ? JSON.parse(planJson) : null;
  } catch (error) {
    console.error("Error retrieving study plan from localStorage:", error);
    return null;
  }
};

export const clearStudyPlan = (): void => {
  try {
    localStorage.removeItem(STUDY_PLAN_KEY);
  } catch (error) {
    console.error("Error clearing study plan from localStorage:", error);
  }
};