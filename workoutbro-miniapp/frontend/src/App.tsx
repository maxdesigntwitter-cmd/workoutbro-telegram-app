import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import BottomNavigation from './components/BottomNavigation';
import WorkoutTimer from './components/WorkoutTimer';

// Pages
import Home from './pages/Home';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import WorkoutDays from './pages/WorkoutDays';
import WorkoutExercises from './pages/WorkoutExercises';
import ExerciseDetail from './pages/ExerciseDetail';
import WorkoutSession from './pages/WorkoutSession';
import WorkoutSummary from './pages/WorkoutSummary';
import History from './pages/History';
import Explore from './pages/Explore';
import Measures from './pages/Measures';
import More from './pages/More';

// Hooks
import { useTelegram } from './hooks/useTelegram';

// Contexts
import { WorkoutProvider } from './contexts/WorkoutContext';

const App: React.FC = () => {
  const { isReady } = useTelegram();

  if (!isReady) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Инициализация приложения...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkoutProvider>
      <Router>
        <div className="min-h-screen bg-dark-bg">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/routines" element={<Programs />} />
              <Route path="/programs/:id" element={<ProgramDetail />} />
              <Route path="/programs/:id/workouts" element={<WorkoutDays />} />
              <Route path="/workouts/:id/exercises" element={<WorkoutExercises />} />
              <Route path="/workouts/:workoutId/exercises/:exerciseId" element={<ExerciseDetail />} />
              <Route path="/workout-session/:id" element={<WorkoutSession />} />
              <Route path="/workout-summary/:id" element={<WorkoutSummary />} />
              <Route path="/history" element={<History />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/measures" element={<Measures />} />
              <Route path="/more" element={<More />} />
            </Routes>
          </AnimatePresence>
          
          <WorkoutTimer />
          <BottomNavigation />
        </div>
      </Router>
    </WorkoutProvider>
  );
};

export default App;
