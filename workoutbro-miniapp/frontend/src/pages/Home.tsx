import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, BarChart3, User } from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';
import { apiService } from '../services/api';
import { Program } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isReady } = useTelegram();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      loadPrograms();
    }
  }, [isReady]);

  const loadPrograms = async () => {
    try {
      const response = await apiService.getPrograms();
      if (response.success && response.data) {
        setPrograms(response.data.slice(0, 3)); // Show only first 3 programs
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

  const quickActions = [
    {
      title: 'Начать тренировку',
      subtitle: 'Быстрый старт',
      icon: Play,
      color: 'bg-primary',
      onClick: () => navigate('/programs')
    }
  ];

  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
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
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Привет, {user?.first_name || 'Спортсмен'}! 👋
              </h1>
              <p className="text-text-secondary">
                Готов к новой тренировке?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Быстрые действия
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                onClick={action.onClick}
                className="w-full p-4 bg-dark-card border border-dark-border rounded-xl flex items-center space-x-4 hover:border-primary transition-all duration-200 btn-glow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-text-primary">
                    {action.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {action.subtitle}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Home;
