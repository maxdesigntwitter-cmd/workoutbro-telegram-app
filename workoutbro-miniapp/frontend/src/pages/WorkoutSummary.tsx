import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Dumbbell, Target, Share2, Download } from 'lucide-react';
import { apiService } from '../services/api';
import { UserWorkout } from '../types';
import { useWorkout } from '../contexts/WorkoutContext';

const WorkoutSummary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkout, endWorkout } = useWorkout();
  const [workoutData, setWorkoutData] = useState<UserWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate workout data from context
    if (currentWorkout) {
      const totalVolume = currentWorkout.exercises.reduce((total, exercise) => {
        return total + exercise.sets.reduce((exerciseTotal, set) => {
          return exerciseTotal + (set.completed ? set.weight * set.reps : 0);
        }, 0);
      }, 0);

      const completedExercises = currentWorkout.exercises.filter(exercise => 
        exercise.sets.every(set => set.completed)
      ).length;

      setWorkoutData({
        id: 1,
        user_id: 1,
        workout_id: currentWorkout.workoutId,
        start_time: currentWorkout.startTime?.toISOString() || new Date().toISOString(),
        end_time: new Date().toISOString(),
        total_volume: totalVolume,
        completed_exercises: completedExercises
      });
    }
    setLoading(false);
  }, [currentWorkout]);

  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  const handleSaveWorkout = async () => {
    // Save workout data to backend
    try {
      if (workoutData) {
        // Создаем данные для сохранения
        const exerciseSessions = currentWorkout?.exercises.map(exercise => ({
          exercise_id: exercise.exerciseId,
          exercise_name: `Exercise ${exercise.exerciseId}`,
          sets_completed: exercise.sets.filter(set => set.completed).length,
          total_sets: exercise.sets.length,
          reps_per_set: exercise.sets.map(set => set.reps),
          weights_used: exercise.sets.map(set => set.weight),
          rest_times: exercise.sets.map(() => 120) // Default rest time
        })) || [];

        // Сохраняем тренировку
        await apiService.finishWorkout(
          workoutData.workout_id,
          workoutData.total_volume,
          workoutData.completed_exercises,
          exerciseSessions
        );
        
        console.log('Workout saved successfully');
        alert('Тренировка сохранена!');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Ошибка при сохранении тренировки');
    }
  };

  const handleEndWorkout = () => {
    // Завершаем тренировку и очищаем данные
    endWorkout();
    navigate('/');
  };

  const handleShare = () => {
    // Share workout results in Telegram
    const message = `🏋️ Завершил тренировку!\n\n⏱️ Время: ${formatTime(workoutData!.start_time, workoutData!.end_time || workoutData!.start_time)}\n💪 Упражнений: ${workoutData!.completed_exercises}\n🏋️ Тоннаж: ${workoutData!.total_volume} кг\n\n#WorkoutBro #Тренировка`;
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        type: 'share_workout',
        message
      }));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportData(1, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!workoutData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Данные тренировки не найдены
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            На главную
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
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Тренировка завершена!
          </h1>
          <p className="text-text-secondary">
            Отличная работа! Ты справился с тренировкой
          </p>
        </motion.div>

        {/* Workout Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Общее время</p>
                <p className="text-text-primary font-bold text-xl">
                  {formatTime(workoutData.start_time, workoutData.end_time || workoutData.start_time)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Упражнений выполнено</p>
                <p className="text-text-primary font-bold text-xl">
                  {workoutData.completed_exercises}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Общий тоннаж</p>
                <p className="text-text-primary font-bold text-xl">
                  {workoutData.total_volume.toLocaleString()} кг
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <button
            onClick={handleSaveWorkout}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-all duration-200 btn-glow"
          >
            Сохранить тренировку
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleShare}
              className="py-3 bg-dark-card border border-dark-border text-text-primary rounded-xl font-medium hover:border-primary transition-colors flex items-center justify-center space-x-2"
            >
              <Share2 className="w-5 h-5" />
              <span>Поделиться</span>
            </button>

            <button
              onClick={handleExport}
              className="py-3 bg-dark-card border border-dark-border text-text-primary rounded-xl font-medium hover:border-primary transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Экспорт</span>
            </button>
          </div>

          <button
            onClick={handleEndWorkout}
            className="w-full py-3 bg-dark-card border border-dark-border text-text-primary rounded-xl font-medium hover:border-primary transition-colors"
          >
            Завершить тренировку
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WorkoutSummary;
