import React from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, BookOpen, Video, Users, Star } from 'lucide-react';

const Explore: React.FC = () => {
  const exploreItems = [
    {
      title: 'Популярные программы',
      description: 'Топ тренировочных программ',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      emoji: '🔥'
    },
    {
      title: 'Статьи и советы',
      description: 'Полезные материалы о тренировках',
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      emoji: '📚'
    },
    {
      title: 'Видео-гайды',
      description: 'Техника выполнения упражнений',
      icon: Video,
      color: 'from-purple-500 to-purple-600',
      emoji: '🎥'
    },
    {
      title: 'Сообщество',
      description: 'Общение с другими спортсменами',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      emoji: '👥'
    }
  ];

  const tips = [
    'Пейте достаточно воды во время тренировки',
    'Не забывайте про разминку перед тренировкой',
    'Следите за техникой выполнения упражнений',
    'Давайте мышцам время на восстановление'
  ];

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-6"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Исследовать
          </h1>
          <p className="text-text-secondary">
            Откройте для себя новые возможности
          </p>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Поиск программ, упражнений..."
              className="w-full pl-12 pr-4 py-4 bg-dark-card border border-dark-border rounded-xl text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </motion.div>

        {/* Explore Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {exploreItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="p-6 bg-dark-card border border-dark-border rounded-xl card"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-primary">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            💡 Советы дня
          </h2>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="p-4 bg-dark-card border border-dark-border rounded-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <p className="text-text-primary text-sm">{tip}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            ⭐ Рекомендуемое
          </h2>
          <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">💪</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Программа "Набор массы"
                </h3>
                <p className="text-text-secondary text-sm mb-2">
                  Специально разработанная программа для набора мышечной массы
                </p>
                <div className="flex items-center space-x-4 text-xs text-text-secondary">
                  <span>⭐ 4.9 (127 отзывов)</span>
                  <span>•</span>
                  <span>12 недель</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Explore;
