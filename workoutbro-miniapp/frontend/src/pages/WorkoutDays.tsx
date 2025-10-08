import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { Workout } from '../types';

const WorkoutDays: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWorkouts(parseInt(id));
    }
  }, [id]);

  const loadWorkouts = async (programId: number) => {
    try {
      const response = await apiService.getWorkouts(programId);
      if (response.success && response.data) {
        setWorkouts(response.data);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayIcon = (dayName: string) => {
    const icons: { [key: string]: string } = {
      'Понедельник': '💪',
      'Вторник': '🔥',
      'Среда': '⚡',
      'Четверг': '🏋️',
      'Пятница': '💥',
      'Суббота': '🚀',
      'Воскресенье': '🌟'
    };
    return icons[dayName] || '🏋️';
  };

  const getDayColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600'
    ];
    return colors[index % colors.length];
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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">
              Расписание тренировок
            </h1>
            <p className="text-text-secondary text-sm">
              Выберите день для тренировки
            </p>
          </div>
        </div>

        {/* Start Workout Button */}
        {workouts.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => {
              // Начинаем тренировку с первого дня
              const firstWorkout = workouts[0];
              navigate(`/workouts/${firstWorkout.id}/exercises`);
            }}
            className="w-full mb-6 p-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-primary transition-all duration-200 btn-glow"
          >
            <Play className="w-5 h-5" />
            <span>Начать тренировку</span>
          </motion.button>
        )}

        {/* Workout Days */}
        <div className="space-y-4">
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-dark-card border border-dark-border rounded-xl card"
              onClick={() => navigate(`/workouts/${workout.id}/exercises`)}
            >
              <div className="flex items-center space-x-4">
                {/* Day Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${getDayColor(index)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl">
                    {getDayIcon(workout.day_name)}
                  </span>
                </div>

                {/* Day Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {workout.day_name}
                  </h3>
                  
                  <p className="text-text-secondary text-sm mb-3">
                    Тренировка #{workout.order_index}
                  </p>

                  {/* Day Stats */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Calendar className="w-3 h-3" />
                      <span>День {workout.order_index}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Play className="w-3 h-3" />
                      <span>~60 мин</span>
                    </div>
                  </div>
                </div>

                {/* Action Arrow */}
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {workouts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Тренировки загружаются
            </h3>
            <p className="text-text-secondary">
              Скоро здесь появятся дни тренировок
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WorkoutDays;
