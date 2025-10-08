import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ExerciseSetData {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseData {
  exerciseId: number;
  workoutId: number;
  sets: ExerciseSetData[];
  currentSetIndex: number;
}

export interface WorkoutSession {
  workoutId: number;
  exercises: ExerciseData[];
  startTime?: Date;
  isActive: boolean;
}

interface WorkoutContextType {
  currentWorkout: WorkoutSession | null;
  startWorkout: (workoutId: number) => void;
  endWorkout: () => void;
  updateExerciseData: (exerciseId: number, workoutId: number, sets: ExerciseSetData[], currentSetIndex: number) => void;
  getExerciseData: (exerciseId: number, workoutId: number) => ExerciseData | null;
  isWorkoutActive: () => boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);

  const startWorkout = (workoutId: number) => {
    setCurrentWorkout({
      workoutId,
      exercises: [],
      startTime: new Date(),
      isActive: true
    });
  };

  const endWorkout = () => {
    setCurrentWorkout(null);
  };

  const updateExerciseData = (exerciseId: number, workoutId: number, sets: ExerciseSetData[], currentSetIndex: number) => {
    if (!currentWorkout || currentWorkout.workoutId !== workoutId) {
      return;
    }

    setCurrentWorkout(prev => {
      if (!prev) return null;

      const existingExerciseIndex = prev.exercises.findIndex(
        ex => ex.exerciseId === exerciseId && ex.workoutId === workoutId
      );

      const exerciseData: ExerciseData = {
        exerciseId,
        workoutId,
        sets,
        currentSetIndex
      };

      let updatedExercises;
      if (existingExerciseIndex >= 0) {
        // Обновляем существующее упражнение
        updatedExercises = [...prev.exercises];
        updatedExercises[existingExerciseIndex] = exerciseData;
      } else {
        // Добавляем новое упражнение
        updatedExercises = [...prev.exercises, exerciseData];
      }

      return {
        ...prev,
        exercises: updatedExercises
      };
    });
  };

  const getExerciseData = (exerciseId: number, workoutId: number): ExerciseData | null => {
    if (!currentWorkout || currentWorkout.workoutId !== workoutId) {
      return null;
    }

    return currentWorkout.exercises.find(
      ex => ex.exerciseId === exerciseId && ex.workoutId === workoutId
    ) || null;
  };

  const isWorkoutActive = (): boolean => {
    return currentWorkout?.isActive || false;
  };

  const value: WorkoutContextType = {
    currentWorkout,
    startWorkout,
    endWorkout,
    updateExerciseData,
    getExerciseData,
    isWorkoutActive
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};
