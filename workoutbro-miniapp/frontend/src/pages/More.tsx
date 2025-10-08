import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  Info, 
  LogOut,
  Moon,
  Sun,
  Download,
  Share2,
  Star
} from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';

const More: React.FC = () => {
  const { user, close } = useTelegram();

  const settingsItems = [
    {
      title: 'Профиль',
      subtitle: 'Личная информация',
      icon: User,
      color: 'text-blue-500',
      onClick: () => console.log('Profile')
    },
    {
      title: 'Уведомления',
      subtitle: 'Настройки уведомлений',
      icon: Bell,
      color: 'text-green-500',
      onClick: () => console.log('Notifications')
    },
    {
      title: 'Тема',
      subtitle: 'Тёмная тема',
      icon: Moon,
      color: 'text-purple-500',
      onClick: () => console.log('Theme')
    },
    {
      title: 'Приватность',
      subtitle: 'Настройки приватности',
      icon: Shield,
      color: 'text-red-500',
      onClick: () => console.log('Privacy')
    }
  ];

  const supportItems = [
    {
      title: 'Помощь',
      subtitle: 'FAQ и поддержка',
      icon: HelpCircle,
      color: 'text-yellow-500',
      onClick: () => console.log('Help')
    },
    {
      title: 'О приложении',
      subtitle: 'Версия 1.0.0',
      icon: Info,
      color: 'text-gray-500',
      onClick: () => console.log('About')
    },
    {
      title: 'Оценить приложение',
      subtitle: 'Оставить отзыв',
      icon: Star,
      color: 'text-orange-500',
      onClick: () => console.log('Rate')
    }
  ];

  const actionItems = [
    {
      title: 'Экспорт данных',
      subtitle: 'Скачать все данные',
      icon: Download,
      color: 'text-blue-500',
      onClick: () => console.log('Export')
    },
    {
      title: 'Поделиться приложением',
      subtitle: 'Пригласить друзей',
      icon: Share2,
      color: 'text-green-500',
      onClick: () => console.log('Share')
    }
  ];

  const handleLogout = () => {
    // In a real app, you would clear user data and redirect
    console.log('Logout');
    close();
  };

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
            Настройки
          </h1>
          <p className="text-text-secondary">
            Управление приложением
          </p>
        </div>

        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 bg-dark-card border border-dark-border rounded-xl mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">
                {user?.first_name || 'Пользователь'} {user?.last_name || ''}
              </h3>
              <p className="text-text-secondary">
                @{user?.username || 'username'}
              </p>
              <p className="text-text-secondary text-sm">
                ID: {user?.id || 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Настройки
          </h2>
          <div className="space-y-2">
            {settingsItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={item.onClick}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="w-full p-4 bg-dark-card border border-dark-border rounded-xl flex items-center space-x-4 hover:border-primary transition-colors"
              >
                <div className={`w-10 h-10 bg-dark-border rounded-lg flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {item.subtitle}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Действия
          </h2>
          <div className="space-y-2">
            {actionItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={item.onClick}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="w-full p-4 bg-dark-card border border-dark-border rounded-xl flex items-center space-x-4 hover:border-primary transition-colors"
              >
                <div className={`w-10 h-10 bg-dark-border rounded-lg flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {item.subtitle}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Поддержка
          </h2>
          <div className="space-y-2">
            {supportItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={item.onClick}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="w-full p-4 bg-dark-card border border-dark-border rounded-xl flex items-center space-x-4 hover:border-primary transition-colors"
              >
                <div className={`w-10 h-10 bg-dark-border rounded-lg flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {item.subtitle}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-4 hover:border-red-500/40 transition-colors"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-red-500">
                Выйти
              </h3>
              <p className="text-sm text-red-500/70">
                Закрыть приложение
              </p>
            </div>
          </button>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center mt-8"
        >
          <p className="text-text-secondary text-sm">
            WorkoutBro v1.0.0
          </p>
          <p className="text-text-secondary text-xs mt-1">
            Made with ❤️ for fitness enthusiasts
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default More;
