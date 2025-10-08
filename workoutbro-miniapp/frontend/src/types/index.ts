// Telegram WebApp types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  ready: () => void;
}

// App types
export interface User {
  id: number;
  telegram_id: number;
  username: string;
  created_at: string;
}

export interface Program {
  id: number;
  title: string;
  description: string;
  goal: string;
  duration_days: number;
  image_url?: string;
  workouts?: Workout[];
}

export interface Workout {
  id: number;
  program_id: number;
  day_name: string;
  order_index: number;
  exercises?: Exercise[];
}

export interface Exercise {
  id: number;
  workout_id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest_time: number;
  muscle_group: string;
  completed_sets?: number;
}

export interface UserWorkout {
  id: number;
  user_id: number;
  workout_id: number;
  start_time: string;
  end_time?: string;
  total_volume: number;
  completed_exercises: number;
  exercises_data?: ExerciseSession[];
}

export interface ExerciseSession {
  exercise_id: number;
  exercise_name: string;
  sets_completed: number;
  total_sets: number;
  reps_per_set: number[];
  weights_used: number[];
  rest_times: number[];
}

export interface WorkoutSession {
  workout_id: number;
  start_time: string;
  current_exercise_index: number;
  exercises: Exercise[];
  completed_exercises: number[];
  total_volume: number;
}

// Navigation types
export type TabType = 'routines' | 'explore' | 'history' | 'measures' | 'more';

export interface NavigationTab {
  id: TabType;
  label: string;
  icon: string;
  path: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
