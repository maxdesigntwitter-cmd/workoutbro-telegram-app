import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronUp, ChevronDown, MoreHorizontal, Info, Play, Check, Plus, Minus } from 'lucide-react';
import { apiService } from '../services/api';
import { Exercise } from '../types';
import { useWorkout, ExerciseSetData } from '../contexts/WorkoutContext';

// Используем ExerciseSetData из контекста

const ExerciseDetail: React.FC = () => {
  const { exerciseId, workoutId } = useParams<{ exerciseId: string; workoutId: string }>();
  const navigate = useNavigate();
  const { getExerciseData, updateExerciseData, isWorkoutActive } = useWorkout();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<ExerciseSetData[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showRestComplete, setShowRestComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (exerciseId && workoutId) {
      loadExercise(parseInt(exerciseId), parseInt(workoutId));
    }
  }, [exerciseId, workoutId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTime > 0) {
      interval = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setIsResting(false);
            setShowRestComplete(true);
            // Вибрация при завершении таймера
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            // Скрыть уведомление через 3 секунды
            setTimeout(() => setShowRestComplete(false), 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTime]);

  const loadExercise = async (exerciseId: number, workoutId: number) => {
    try {
      const response = await apiService.getExercises(workoutId);
      if (response.success && response.data) {
        setAllExercises(response.data);
        const foundExercise = response.data.find(ex => ex.id === exerciseId);
        if (foundExercise) {
          setExercise(foundExercise);
          
          // Проверяем, есть ли сохраненные данные для этого упражнения
          const savedData = getExerciseData(exerciseId, workoutId);
          
          if (savedData) {
            // Используем сохраненные данные
            setSets(savedData.sets);
            setCurrentSetIndex(savedData.currentSetIndex);
          } else {
            // Создаем новые подходы на основе данных упражнения
            const exerciseSets: ExerciseSetData[] = Array.from({ length: foundExercise.sets }, (_, index) => ({
              id: index + 1,
              reps: foundExercise.reps,
              weight: foundExercise.weight,
              completed: false
            }));
            setSets(exerciseSets);
            setCurrentSetIndex(0);
            
            // Сохраняем начальные данные в контекст
            updateExerciseData(exerciseId, workoutId, exerciseSets, 0);
          }
        }
      }
    } catch (error) {
      console.error('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetComplete = (setIndex: number) => {
    const wasCompleted = sets[setIndex]?.completed;
    
    const newSets = sets.map((set, index) => 
      index === setIndex ? { ...set, completed: !set.completed } : set
    );
    
    setSets(newSets);
    
    // Update current set index
    let newCurrentSetIndex = currentSetIndex;
    if (setIndex === currentSetIndex && setIndex < sets.length - 1) {
      newCurrentSetIndex = currentSetIndex + 1;
      setCurrentSetIndex(newCurrentSetIndex);
    }
    
    // Save to context
    if (exerciseId && workoutId) {
      updateExerciseData(parseInt(exerciseId), parseInt(workoutId), newSets, newCurrentSetIndex);
    }
    
    // If set was just completed (not uncompleted), start rest timer
    if (!wasCompleted && exercise) {
      setRestTime(exercise.rest_time);
      setIsResting(true);
    }
  };

  const handleWeightChange = (setIndex: number, delta: number) => {
    const newSets = sets.map((set, index) => 
      index === setIndex ? { ...set, weight: Math.max(0, set.weight + delta) } : set
    );
    setSets(newSets);
    
    // Save to context
    if (exerciseId && workoutId) {
      updateExerciseData(parseInt(exerciseId), parseInt(workoutId), newSets, currentSetIndex);
    }
  };

  const handleRepsChange = (setIndex: number, delta: number) => {
    const newSets = sets.map((set, index) => 
      index === setIndex ? { ...set, reps: Math.max(1, set.reps + delta) } : set
    );
    setSets(newSets);
    
    // Save to context
    if (exerciseId && workoutId) {
      updateExerciseData(parseInt(exerciseId), parseInt(workoutId), newSets, currentSetIndex);
    }
  };

  const handleStartRest = () => {
    if (exercise) {
      setRestTime(exercise.rest_time);
      setIsResting(true);
    }
  };

  const handleNextExercise = () => {
    if (!exercise || !workoutId) return;
    
    const currentIndex = allExercises.findIndex(ex => ex.id === exercise.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < allExercises.length) {
      const nextExercise = allExercises[nextIndex];
      navigate(`/workouts/${workoutId}/exercises/${nextExercise.id}`);
    } else {
      // Если это последнее упражнение, возвращаемся к списку упражнений
      navigate(`/workouts/${workoutId}/exercises`);
    }
  };

  const handlePreviousExercise = () => {
    if (!exercise || !workoutId) return;
    
    const currentIndex = allExercises.findIndex(ex => ex.id === exercise.id);
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      const prevExercise = allExercises[prevIndex];
      navigate(`/workouts/${workoutId}/exercises/${prevExercise.id}`);
    }
  };

  const isExerciseCompleted = () => {
    return sets.every(set => set.completed);
  };

  const isLastExercise = () => {
    if (!exercise || allExercises.length === 0) return false;
    const currentIndex = allExercises.findIndex(ex => ex.id === exercise.id);
    return currentIndex === allExercises.length - 1;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMuscleGroupIcon = (muscleGroup: string) => {
    const icons: { [key: string]: string } = {
      'Грудь': '💪',
      'Спина': '🏋️',
      'Ноги': '🦵',
      'Руки': '💪',
      'Плечи': '🔥',
      'Пресс': '⚡',
      'Кардио': '🏃'
    };
    return icons[muscleGroup] || '💪';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pb-20">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Упражнение не найдено
          </h3>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:text-blue-400"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center hover:border-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-green-500" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousExercise}
              className="p-1 hover:bg-green-500/20 rounded transition-colors"
              disabled={exercise && allExercises.length > 0 && allExercises.findIndex(ex => ex.id === exercise.id) === 0}
            >
              <ChevronUp className="w-4 h-4 text-green-500" />
            </button>
            <span className="text-green-500 font-semibold">
              {exercise && allExercises.length > 0 
                ? `${allExercises.findIndex(ex => ex.id === exercise.id) + 1} of ${allExercises.length}`
                : `${currentSetIndex + 1} of ${sets.length}`
              }
            </span>
            <button
              onClick={handleNextExercise}
              className="p-1 hover:bg-green-500/20 rounded transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-green-500" />
            </button>
          </div>
          
          <button className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center hover:border-green-400 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-green-500" />
          </button>
        </div>

        {/* Exercise Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden"
        >
          {/* Placeholder for exercise illustration */}
          <div className="text-center">
            <div className="text-8xl mb-4">{getMuscleGroupIcon(exercise.muscle_group)}</div>
            <p className="text-text-secondary text-sm">3D анимация упражнения</p>
          </div>
        </motion.div>

        {/* Exercise Title and Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-text-primary flex-1">
              {exercise.name}
            </h1>
            <button className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center hover:border-blue-400 transition-colors">
              <Info className="w-4 h-4 text-blue-500" />
            </button>
          </div>
        </motion.div>

        {/* Sets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">Sets</h2>
          
          <div className="space-y-3">
            {sets.map((set, index) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  set.completed 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : index === currentSetIndex
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-dark-card border-dark-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSetComplete(index)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        set.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-text-secondary hover:border-primary'
                      }`}
                    >
                      {set.completed && <Check className="w-4 h-4 text-white" />}
                      {!set.completed && <span className="text-text-secondary text-sm font-medium">{set.id}</span>}
                    </button>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRepsChange(index, -1);
                          }}
                          className="w-6 h-6 bg-dark-border rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <Minus className="w-3 h-3 text-text-secondary" />
                        </button>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Reps</p>
                          <p className="text-text-primary font-semibold">{set.reps}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRepsChange(index, 1);
                          }}
                          className="w-6 h-6 bg-dark-border rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <Plus className="w-3 h-3 text-text-secondary" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWeightChange(index, -2.5);
                          }}
                          className="w-6 h-6 bg-dark-border rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <Minus className="w-3 h-3 text-text-secondary" />
                        </button>
                        <div>
                          <p className="text-xs text-text-secondary mb-1">Weight (kg)</p>
                          <p className="text-xs text-text-secondary mb-1">Per Arm</p>
                          <p className="text-text-primary font-semibold">{set.weight}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWeightChange(index, 2.5);
                          }}
                          className="w-6 h-6 bg-dark-border rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <Plus className="w-3 h-3 text-text-secondary" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rest Timer and Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-xl mb-6"
        >
          <div className="flex items-center space-x-4">
            <span className="text-text-primary font-medium">Rest</span>
            <div className="text-text-primary font-mono text-lg">
              {formatTime(restTime)}
            </div>
          </div>
          
          <button
            onClick={handleStartRest}
            disabled={isResting}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isResting
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 btn-glow'
            }`}
          >
            <Play className="w-6 h-6 text-white" />
          </button>
        </motion.div>

        {/* Next Exercise Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <button
            onClick={isLastExercise() ? () => navigate('/workout-summary/1') : handleNextExercise}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-600 transition-all duration-200 btn-glow flex items-center justify-center space-x-3"
          >
            <span>
              {isLastExercise() 
                ? 'Завершить тренировку' 
                : 'Next Exercise'
              }
            </span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Rest Complete Notification */}
        {showRestComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg text-center">
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-semibold">Отдых завершен!</p>
              <p className="text-sm opacity-90">Можно переходить к следующему подходу</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ExerciseDetail;
