import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Dumbbell, Repeat, Timer } from 'lucide-react';
import { apiService } from '../services/api';
import { Exercise } from '../types';
import { useWorkout } from '../contexts/WorkoutContext';

const WorkoutExercises: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { startWorkout, isWorkoutActive, getExerciseData } = useWorkout();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadExercises(parseInt(id));
    }
  }, [id]);

  const loadExercises = async (workoutId: number) => {
    try {
      const response = await apiService.getExercises(workoutId);
      if (response.success && response.data) {
        setExercises(response.data);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    if (id) {
      // Запускаем тренировку в контексте
      startWorkout(parseInt(id));
      // Переходим к первому упражнению
      if (exercises.length > 0) {
        navigate(`/workouts/${id}/exercises/${exercises[0].id}`);
      }
    }
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

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: { [key: string]: string } = {
      'Грудь': 'from-red-500 to-red-600',
      'Спина': 'from-blue-500 to-blue-600',
      'Ноги': 'from-green-500 to-green-600',
      'Руки': 'from-purple-500 to-purple-600',
      'Плечи': 'from-yellow-500 to-yellow-600',
      'Пресс': 'from-pink-500 to-pink-600',
      'Кардио': 'from-orange-500 to-orange-600'
    };
    return colors[muscleGroup] || 'from-gray-500 to-gray-600';
  };

  const getExerciseStatus = (exercise: Exercise) => {
    if (!id || !isWorkoutActive()) return 'not-started';
    
    const exerciseData = getExerciseData(exercise.id, parseInt(id));
    if (!exerciseData) return 'not-started';
    
    const completedSets = exerciseData.sets.filter(set => set.completed).length;
    const totalSets = exerciseData.sets.length;
    
    if (completedSets === 0) return 'not-started';
    if (completedSets === totalSets) return 'completed';
    return 'in-progress';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-500/10';
      case 'in-progress': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-dark-border bg-dark-card';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-dark-card border border-dark-border rounded-lg flex items-center justify-center hover:border-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Упражнения
            </h1>
            <p className="text-text-secondary text-sm">
              {exercises.length} упражнений в тренировке
            </p>
          </div>
        </div>

        {/* Workout Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-4 bg-dark-card border border-dark-border rounded-xl mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Общее время</p>
                <p className="text-text-primary font-semibold">~{exercises.length * 10} мин</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Repeat className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Всего подходов</p>
                <p className="text-text-primary font-semibold">
                  {exercises.reduce((total, ex) => total + ex.sets, 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Exercises List */}
        <div className="space-y-4 mb-6">
          {exercises.map((exercise, index) => {
            const status = getExerciseStatus(exercise);
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-4 border rounded-xl cursor-pointer hover:border-primary/30 transition-colors ${getStatusColor(status)}`}
                onClick={() => navigate(`/workouts/${id}/exercises/${exercise.id}`)}
              >
              <div className="flex items-start space-x-4">
                {/* Exercise Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${getMuscleGroupColor(exercise.muscle_group)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg">
                    {getMuscleGroupIcon(exercise.muscle_group)}
                  </span>
                </div>

                {/* Exercise Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {exercise.name}
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Repeat className="w-4 h-4 text-text-secondary" />
                      <div>
                        <p className="text-xs text-text-secondary">Подходы</p>
                        <p className="text-sm font-medium text-text-primary">{exercise.sets}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Dumbbell className="w-4 h-4 text-text-secondary" />
                      <div>
                        <p className="text-xs text-text-secondary">Повторения</p>
                        <p className="text-sm font-medium text-text-primary">{exercise.reps}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-text-secondary" />
                      <div>
                        <p className="text-xs text-text-secondary">Отдых</p>
                        <p className="text-sm font-medium text-text-primary">{exercise.rest_time}с</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-text-secondary bg-dark-border px-2 py-1 rounded">
                      {exercise.muscle_group}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {exercise.weight} кг
                    </span>
                  </div>
                </div>
              </div>
              </motion.div>
            );
          })}
        </div>

        {/* Start Workout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button
            onClick={handleStartWorkout}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-all duration-200 btn-glow flex items-center justify-center space-x-3"
          >
            <Play className="w-6 h-6" />
            <span>
              {isWorkoutActive() ? 'Продолжить тренировку' : 'Начать тренировку'}
            </span>
          </button>
        </motion.div>

        {/* Empty State */}
        {exercises.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏋️</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Упражнения загружаются
            </h3>
            <p className="text-text-secondary">
              Скоро здесь появятся упражнения для тренировки
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WorkoutExercises;
