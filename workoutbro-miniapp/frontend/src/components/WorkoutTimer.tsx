import React from 'react';
import { Clock } from 'lucide-react';
import { useWorkout } from '../contexts/WorkoutContext';

const WorkoutTimer: React.FC = () => {
  const { currentWorkout } = useWorkout();

  if (!currentWorkout?.isActive) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-dark-card border border-primary/30 rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-text-primary">
            {formatTime(currentWorkout.elapsedTime)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;
