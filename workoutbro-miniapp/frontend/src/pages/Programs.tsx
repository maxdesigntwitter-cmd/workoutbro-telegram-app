import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Target, Calendar, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';
import { Program } from '../types';

const Programs: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await apiService.getPrograms();
      if (response.success && response.data) {
        setPrograms(response.data);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const getProgramIcon = (goal: string) => {
    if (goal.toLowerCase().includes('масс')) return '💪';
    if (goal.toLowerCase().includes('сил')) return '🔥';
    if (goal.toLowerCase().includes('вынос')) return '🏃';
    if (goal.toLowerCase().includes('похуд')) return '⚡';
    return '🏋️';
  };

  const getProgramColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600'
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
        className="px-6 pt-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Тренировочные программы
          </h1>
          <p className="text-text-secondary">
            Выберите программу, которая подходит вашим целям
          </p>
        </motion.div>

        {/* Programs List */}
        <motion.div variants={itemVariants} className="space-y-4">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              className="p-6 bg-dark-card border border-dark-border rounded-xl card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/programs/${program.id}`)}
            >
              <div className="flex items-start space-x-4">
                {/* Program Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${getProgramColor(index)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl">
                    {getProgramIcon(program.goal)}
                  </span>
                </div>

                {/* Program Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {program.title}
                  </h3>
                  
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {program.description}
                  </p>

                  {/* Program Stats */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Target className="w-3 h-3" />
                      <span>{program.goal}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Calendar className="w-3 h-3" />
                      <span>{program.duration_days} дней</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-text-secondary">
                      <Clock className="w-3 h-3" />
                      <span>5 тренировок/неделя</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-primary font-medium">
                        Начать программу
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {programs.length === 0 && (
          <motion.div 
            variants={itemVariants}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏋️</span>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Программы загружаются
            </h3>
            <p className="text-text-secondary">
              Скоро здесь появятся тренировочные программы
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Programs;
