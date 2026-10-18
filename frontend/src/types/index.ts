export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

export interface Subject {
  id: string;
  user_id: string;
  code: string | null;
  name: string;
  instructor: string | null;
  credits: number | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  due_date: string | null;
  due_time: string | null;
  duration_minutes: number | null;
  reminder_enabled: boolean;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  subjects?: Pick<Subject, 'id' | 'name' | 'code' | 'color'> | null;
}

export interface DashboardStats {
  user_id: string;
  completed_count: number;
  pending_count: number;
  due_today_count: number;
  overdue_count: number;
  due_this_week_count: number;
  high_priority_open_count: number;
  completed_this_week_count: number;
}

export interface SubjectProgress {
  subject_id: string;
  user_id: string;
  name: string;
  code: string | null;
  color: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percent: number;
}
