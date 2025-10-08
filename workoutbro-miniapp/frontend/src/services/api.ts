import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  User, 
  Program, 
  Workout, 
  Exercise, 
  UserWorkout,
  PaginatedResponse 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add Telegram init data if available
        const tg = window.Telegram?.WebApp;
        if (tg?.initData) {
          config.headers['X-Telegram-Init-Data'] = tg.initData;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(telegramId: number, username: string): Promise<ApiResponse<User>> {
    const response = await this.api.post('/auth/login', {
      telegram_id: telegramId,
      username
    });
    return response.data;
  }

  // Programs endpoints
  async getPrograms(): Promise<ApiResponse<Program[]>> {
    const response = await this.api.get('/programs');
    return response.data;
  }

  async getProgram(id: number): Promise<ApiResponse<Program>> {
    const response = await this.api.get(`/programs/${id}`);
    return response.data;
  }

  // Workouts endpoints
  async getWorkouts(programId: number): Promise<ApiResponse<Workout[]>> {
    const response = await this.api.get(`/workouts/${programId}`);
    return response.data;
  }

  async getExercises(workoutId: number): Promise<ApiResponse<Exercise[]>> {
    const response = await this.api.get(`/workouts/${workoutId}/exercises`);
    return response.data;
  }

  // Workout session endpoints
  async startWorkout(userId: number, workoutId: number): Promise<ApiResponse<UserWorkout>> {
    const response = await this.api.post('/workouts/start', {
      user_id: userId,
      workout_id: workoutId
    });
    return response.data;
  }

  async finishWorkout(
    userWorkoutId: number, 
    totalVolume: number, 
    completedExercises: number,
    exercisesData: any[]
  ): Promise<ApiResponse<UserWorkout>> {
    const response = await this.api.post('/workouts/finish', {
      user_workout_id: userWorkoutId,
      total_volume: totalVolume,
      completed_exercises: completedExercises,
      exercises_data: exercisesData
    });
    return response.data;
  }

  // History endpoints
  async getHistory(userId: number, page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<UserWorkout>>> {
    const response = await this.api.get(`/history/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  }

  async exportData(userId: number, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await this.api.get(`/export/${userId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  // Utility methods
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
