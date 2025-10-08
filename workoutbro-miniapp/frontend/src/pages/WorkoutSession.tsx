import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Check, SkipForward, Timer } from 'lucide-react';
import { apiService } from '../services/api';
import { Exercise, WorkoutSession as WorkoutSessionType } from '../types';

const WorkoutSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<WorkoutSessionType | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWorkoutSession(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
      if (isResting && restTime > 0) {
        setRestTime(prev => prev - 1);
      } else if (isResting && restTime === 0) {
        setIsResting(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isResting, restTime]);

  const loadWorkoutSession = async (workoutId: number) => {
    try {
      const response = await apiService.getExercises(workoutId);
      if (response.success && response.data) {
        const exercises = response.data;
        setSession({
          workout_id: workoutId,
          start_time: new Date().toISOString(),
          current_exercise_index: 0,
          exercises,
          completed_exercises: [],
          total_volume: 0
        });
      }
    } catch (error) {
      console.error('Error loading workout session:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    if (!session) return;

    const currentExercise = session.exercises[currentExerciseIndex];
    
    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      startRest(currentExercise.rest_time);
    } else {
      // Exercise completed
      const newCompletedExercises = [...session.completed_exercises, currentExerciseIndex];
      setSession(prev => prev ? {
        ...prev,
        completed_exercises: newCompletedExercises
      } : null);

      if (currentExerciseIndex < session.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
      } else {
        // Workout completed
        navigate(`/workout-summary/${id}`);
      }
    }
  };

  const startRest = (restSeconds: number) => {
    setIsResting(true);
    setRestTime(restSeconds);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  const handleNextExercise = () => {
    if (!session) return;
    
    const newCompletedExercises = [...session.completed_exercises, currentExerciseIndex];
    setSession(prev => prev ? {
      ...prev,
      completed_exercises: newCompletedExercises
    } : null);

    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
    } else {
      navigate(`/workout-summary/${id}`);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / session.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-dark-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Тренировка
            </h1>
            <p className="text-text-secondary text-sm">
              {formatTime(sessionTime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-text-secondary text-sm">Упражнение</p>
            <p className="text-text-primary font-semibold">
              {currentExerciseIndex + 1} из {session.exercises.length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-dark-border rounded-full h-2 mb-6">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Current Exercise */}
        <motion.div
          key={currentExerciseIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 bg-dark-card border border-dark-border rounded-xl mb-6"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💪</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {currentExercise.name}
            </h2>
            <p className="text-text-secondary">
              {currentExercise.muscle_group}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-dark-border rounded-lg">
              <p className="text-text-secondary text-sm">Подход</p>
              <p className="text-text-primary font-bold text-xl">
                {currentSet}/{currentExercise.sets}
              </p>
            </div>
            <div className="text-center p-3 bg-dark-border rounded-lg">
              <p className="text-text-secondary text-sm">Повторения</p>
              <p className="text-text-primary font-bold text-xl">
                {currentExercise.reps}
              </p>
            </div>
            <div className="text-center p-3 bg-dark-border rounded-lg">
              <p className="text-text-secondary text-sm">Вес</p>
              <p className="text-text-primary font-bold text-xl">
                {currentExercise.weight} кг
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rest Timer */}
        {isResting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl mb-6 text-center"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Timer className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-green-500 mb-2">
              Отдых
            </h3>
            <p className="text-3xl font-bold text-text-primary mb-4">
              {formatTime(restTime)}
            </p>
            <button
              onClick={skipRest}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Пропустить отдых
            </button>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {!isResting && (
            <button
              onClick={handleCompleteSet}
              className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-all duration-200 btn-glow flex items-center justify-center space-x-3"
            >
              <Check className="w-6 h-6" />
              <span>Выполнить подход</span>
            </button>
          )}

          <button
            onClick={handleNextExercise}
            className="w-full py-3 bg-dark-card border border-dark-border text-text-primary rounded-xl font-medium hover:border-primary transition-colors flex items-center justify-center space-x-3"
          >
            <SkipForward className="w-5 h-5" />
            <span>Следующее упражнение</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkoutSession;
