import { SupabaseClient, User } from "@supabase/supabase-js";

export type TaskPriority = "low" | "medium" | "high";

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
  due_date: string | null; // YYYY-MM-DD
  due_time: string | null; // HH:MM:SS
  duration_minutes: number | null;
  reminder_enabled: boolean;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskDashboardStats {
  user_id: string;
  completed_count: number;
  pending_count: number;
  due_today_count: number;
  overdue_count: number;
  due_this_week_count: number;
  high_priority_open_count: number;
  completed_this_week_count: number;
}

export interface SubjectProgressStats {
  subject_id: string;
  user_id: string;
  name: string;
  code: string | null;
  color: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percent: number;
}

// Augment Express's Request type with the authenticated user + a
// request-scoped Supabase client (attached by the auth middleware).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      accessToken?: string;
      supabase?: SupabaseClient;
    }
  }
}
