import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Calendar, Target, Clock, Users } from 'lucide-react';
import { apiService } from '../services/api';
import { Program } from '../types';

const ProgramDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProgram(parseInt(id));
    }
  }, [id]);

  const loadProgram = async (programId: number) => {
    try {
      const response = await apiService.getProgram(programId);
      if (response.success && response.data) {
        setProgram(response.data);
      }
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProgram = () => {
    if (program) {
      navigate(`/programs/${program.id}/workouts`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center pb-20">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Программа не найдена
          </h2>
          <p className="text-text-secondary mb-4">
            Возможно, программа была удалена или не существует
          </p>
          <button
            onClick={() => navigate('/routines')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Вернуться к программам
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
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/routines')}
            className="w-10 h-10 bg-dark-card border border-dark-border rounded-lg flex items-center justify-center hover:border-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {program.title}
            </h1>
            <p className="text-text-secondary text-sm">
              Детали программы
            </p>
          </div>
        </div>

        {/* Program Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-6"
        >
          <div className="h-48 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="text-center text-white">
              <div className="text-6xl mb-2">💪</div>
              <h2 className="text-2xl font-bold">{program.title}</h2>
            </div>
          </div>
        </motion.div>

        {/* Program Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Длительность</p>
                <p className="text-text-primary font-semibold">{program.duration_days} дней</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-text-secondary text-sm">Тренировок</p>
                <p className="text-text-primary font-semibold">5/неделя</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Program Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            О программе
          </h3>
          <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
            <p className="text-text-secondary leading-relaxed">
              {program.description}
            </p>
          </div>
        </motion.div>

        {/* Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Цель программы
          </h3>
          <div className="p-4 bg-dark-card border border-dark-border rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-text-primary font-medium">{program.goal}</p>
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-6"
        >
          <button
            onClick={handleStartProgram}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-blue-600 transition-all duration-200 btn-glow flex items-center justify-center space-x-3"
          >
            <Play className="w-6 h-6" />
            <span>Начать программу</span>
          </button>
        </motion.div>

        {/* Program Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Что включено
          </h3>
          <div className="space-y-3">
            {[
              'Детальные инструкции по упражнениям',
              'Таймеры отдыха между подходами',
              'Отслеживание прогресса',
              'Статистика тренировок',
              'Экспорт данных'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-dark-card border border-dark-border rounded-lg">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-text-primary">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProgramDetail;
