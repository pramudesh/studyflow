import type { DashboardStats, Subject, SubjectProgress, Task, User, Session } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('studyflow_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 204) {
        return null as unknown as T;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('An unexpected network error occurred. Please check your connection.');
    }
  }

  // --- Auth Endpoints ---
  async signup(data: { email: string; password: string; fullName?: string }): Promise<{
    user: User;
    session: Session | null;
    requiresEmailConfirmation: boolean;
  }> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<{
    user: User;
    session: Session;
  }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refresh(refreshToken: string): Promise<{
    user: User;
    session: Session;
  }> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('studyflow_access_token');
      localStorage.removeItem('studyflow_refresh_token');
      localStorage.removeItem('studyflow_user');
    }
  }

  async forgotPassword(email: string, redirectTo?: string): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, redirectTo }),
    });
  }

  async resetPassword(password: string, accessToken?: string): Promise<{ message: string }> {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return this.request('/auth/reset-password', {
      method: 'POST',
      headers,
      body: JSON.stringify({ password, accessToken }),
    });
  }


  async me(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  async getGoogleOAuthUrl(redirectTo?: string): Promise<{ url: string }> {
    const qs = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
    return this.request(`/auth/oauth/google${qs}`);
  }


  // --- Subjects Endpoints ---
  async getSubjects(): Promise<{ subjects: Subject[] }> {
    return this.request('/subjects');
  }

  async getSubject(id: string): Promise<{ subject: Subject }> {
    return this.request(`/subjects/${id}`);
  }

  async createSubject(data: {
    code?: string;
    name: string;
    instructor?: string;
    credits?: number;
    color?: string;
  }): Promise<{ subject: Subject }> {
    return this.request('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubject(
    id: string,
    data: Partial<{
      code?: string;
      name?: string;
      instructor?: string;
      credits?: number;
      color?: string;
    }>
  ): Promise<{ subject: Subject }> {
    return this.request(`/subjects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSubject(id: string): Promise<void> {
    return this.request(`/subjects/${id}`, { method: 'DELETE' });
  }

  // --- Tasks Endpoints ---
  async getTasks(params: {
    subjectId?: string;
    priority?: string;
    completed?: boolean;
    dueBefore?: string;
    dueAfter?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ tasks: Task[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params.subjectId) searchParams.set('subjectId', params.subjectId);
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.completed !== undefined) searchParams.set('completed', String(params.completed));
    if (params.dueBefore) searchParams.set('dueBefore', params.dueBefore);
    if (params.dueAfter) searchParams.set('dueAfter', params.dueAfter);
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortDir) searchParams.set('sortDir', params.sortDir);
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params.offset !== undefined) searchParams.set('offset', String(params.offset));

    const qs = searchParams.toString();
    return this.request(`/tasks${qs ? `?${qs}` : ''}`);
  }

  async getTask(id: string): Promise<{ task: Task }> {
    return this.request(`/tasks/${id}`);
  }

  async createTask(data: {
    subjectId?: string;
    title: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    dueTime?: string;
    durationMinutes?: number;
    reminderEnabled?: boolean;
  }): Promise<{ task: Task }> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    id: string,
    data: Partial<{
      subjectId?: string;
      title?: string;
      notes?: string;
      priority?: 'low' | 'medium' | 'high';
      dueDate?: string;
      dueTime?: string;
      durationMinutes?: number;
      reminderEnabled?: boolean;
    }>
  ): Promise<{ task: Task }> {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async setTaskCompletion(id: string, isCompleted: boolean): Promise<{ task: Task }> {
    return this.request(`/tasks/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(`/tasks/${id}`, { method: 'DELETE' });
  }

  // --- Dashboard Endpoints ---
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    return this.request('/dashboard/stats');
  }

  async getSubjectProgress(): Promise<{ subjectProgress: SubjectProgress[] }> {
    return this.request('/dashboard/subject-progress');
  }

  async getUpcomingTasks(): Promise<{ tasks: Task[] }> {
    return this.request('/dashboard/upcoming');
  }

  async getOverdueTasks(): Promise<{ tasks: Task[] }> {
    return this.request('/dashboard/overdue');
  }
}

export const api = new ApiService();
