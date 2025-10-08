import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Dumbbell, Target, Download, Filter } from 'lucide-react';
import { apiService } from '../services/api';
import { UserWorkout } from '../types';

const History: React.FC = () => {
  const [workouts, setWorkouts] = useState<UserWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      const response = await apiService.getHistory(1, 1, 20);
      if (response.success && response.data) {
        setWorkouts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      // Mock data for development
      setWorkouts([
        {
          id: 1,
          user_id: 1,
          workout_id: 1,
          start_time: '2025-01-07T10:00:00Z',
          end_time: '2025-01-07T11:12:00Z',
          total_volume: 12400,
          completed_exercises: 8
        },
        {
          id: 2,
          user_id: 1,
          workout_id: 2,
          start_time: '2025-01-05T09:30:00Z',
          end_time: '2025-01-05T10:15:00Z',
          total_volume: 8600,
          completed_exercises: 6
        },
        {
          id: 3,
          user_id: 1,
          workout_id: 1,
          start_time: '2025-01-03T18:00:00Z',
          end_time: '2025-01-03T19:30:00Z',
          total_volume: 15200,
          completed_exercises: 10
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  const handleExport = async () => {
    try {
      const blob = await apiService.exportData(1, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getWorkoutTitle = (workoutId: number) => {
    const titles: { [key: number]: string } = {
      1: 'Bodybuilding System',
      2: 'Bigger Arms',
      3: 'Power Training'
    };
    return titles[workoutId] || `Тренировка #${workoutId}`;
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              История тренировок
            </h1>
            <p className="text-text-secondary">
              {workouts.length} тренировок
            </p>
          </div>
          <button
            onClick={handleExport}
            className="p-3 bg-dark-card border border-dark-border rounded-lg hover:border-primary transition-colors"
          >
            <Download className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        {/* Filter */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: 'all', label: 'Все' },
            { key: 'week', label: 'Неделя' },
            { key: 'month', label: 'Месяц' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-primary text-white'
                  : 'bg-dark-card border border-dark-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Workouts List */}
        <div className="space-y-4">
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-4 bg-dark-card border border-dark-border rounded-xl card"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {getWorkoutTitle(workout.workout_id)}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {formatDate(workout.start_time)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-text-primary font-semibold">
                    {formatTime(workout.start_time, workout.end_time || workout.start_time)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-text-secondary text-xs">Упражнений</span>
                  </div>
                  <p className="text-text-primary font-semibold">
                    {workout.completed_exercises}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                      <Dumbbell className="w-4 h-4 text-purple-500" />
                    <span className="text-text-secondary text-xs">Тоннаж</span>
                  </div>
                  <p className="text-text-primary font-semibold">
                    {workout.total_volume.toLocaleString()} кг
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-text-secondary text-xs">Время</span>
                  </div>
                  <p className="text-text-primary font-semibold">
                    {formatTime(workout.start_time, workout.end_time || workout.start_time)}
                  </p>
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
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Пока нет тренировок
            </h3>
            <p className="text-text-secondary">
              Начните тренироваться, чтобы увидеть статистику
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default History;
