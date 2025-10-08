import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Dumbbell, 
  Search, 
  Clock, 
  Ruler, 
  MoreHorizontal 
} from 'lucide-react';
import { NavigationTab, TabType } from '../types';

const navigationTabs: NavigationTab[] = [
  {
    id: 'home',
    label: 'Главная',
    icon: '🏠',
    path: '/'
  },
  {
    id: 'routines',
    label: 'Программы',
    icon: '🏋️',
    path: '/programs'
  },
  {
    id: 'explore',
    label: 'Исследовать',
    icon: '🔍',
    path: '/explore'
  },
  {
    id: 'more',
    label: 'Еще',
    icon: '⋯',
    path: '/more'
  }
];

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleTabClick = (tab: NavigationTab) => {
    navigate(tab.path);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-50 ${className}`}>
      <div className="flex items-center justify-around py-2 px-4">
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`
              flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200
              ${isActive(tab.path) 
                ? 'text-primary bg-primary/10' 
                : 'text-text-secondary hover:text-text-primary hover:bg-dark-border/50'
              }
            `}
          >
            <span className="text-lg mb-1">
              {tab.icon}
            </span>
            <span className="text-xs font-medium">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
