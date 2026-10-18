import React, { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { DashboardStats, Subject, SubjectProgress, Task } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const EMPTY_STATS: DashboardStats = {
  user_id: '',
  completed_count: 0,
  pending_count: 0,
  due_today_count: 0,
  overdue_count: 0,
  due_this_week_count: 0,
  high_priority_open_count: 0,
  completed_this_week_count: 0,
};

interface DataContextType {
  tasks: Task[];
  subjects: Subject[];
  stats: DashboardStats;
  subjectProgress: SubjectProgress[];
  loading: boolean;
  error: string | null;
  isLiveMode: boolean;
  isAddTaskModalOpen: boolean;
  selectedSubjectIdForNewTask: string | null;
  openAddTaskModal: (subjectId?: string) => void;
  closeAddTaskModal: () => void;
  isQuickTimerOpen: boolean;
  toggleQuickTimer: () => void;
  refreshData: () => Promise<void>;
  addTask: (data: {
    subjectId?: string;
    title: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    dueTime?: string;
    durationMinutes?: number;
    reminderEnabled?: boolean;
  }) => Promise<void>;
  updateTask: (
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
  ) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSubject: (data: {
    code?: string;
    name: string;
    instructor?: string;
    credits?: number;
    color?: string;
  }) => Promise<Subject>;
  updateSubject: (
    id: string,
    data: Partial<{
      code?: string;
      name?: string;
      instructor?: string;
      credits?: number;
      color?: string;
    }>
  ) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);

  // Modals state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [selectedSubjectIdForNewTask, setSelectedSubjectIdForNewTask] = useState<string | null>(null);
  const [isQuickTimerOpen, setIsQuickTimerOpen] = useState<boolean>(false);


  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const [subsRes, tasksRes, statsRes, progRes] = await Promise.all([
        api.getSubjects(),
        api.getTasks(),
        api.getDashboardStats().catch(() => null),
        api.getSubjectProgress().catch(() => null),
      ]);

      setSubjects(subsRes.subjects || []);
      setTasks(tasksRes.tasks || []);
      if (statsRes?.stats) setStats(statsRes.stats);
      if (progRes?.subjectProgress) setSubjectProgress(progRes.subjectProgress);
      setIsLiveMode(true);
    } catch (err: unknown) {
      console.error('Backend API connection error:', err);
      setError('Could not connect to the backend. Please ensure the server is running.');
      setIsLiveMode(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData]);

  const openAddTaskModal = (subjectId?: string) => {
    setSelectedSubjectIdForNewTask(subjectId || null);
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setSelectedSubjectIdForNewTask(null);
  };

  const toggleQuickTimer = () => {
    setIsQuickTimerOpen((prev) => !prev);
  };

  const addTask = async (data: {
    subjectId?: string;
    title: string;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    dueTime?: string;
    durationMinutes?: number;
    reminderEnabled?: boolean;
  }) => {
    const res = await api.createTask(data);
    setTasks((prev) => [res.task, ...prev]);
    await refreshData();
  };

  const updateTask = async (
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
  ) => {
    const res = await api.updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
    await refreshData();
  };

  const toggleTaskCompletion = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const newStatus = !target.is_completed;
    const res = await api.setTaskCompletion(id, newStatus);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
    await refreshData();
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await refreshData();
  };

  const addSubject = async (data: {
    code?: string;
    name: string;
    instructor?: string;
    credits?: number;
    color?: string;
  }) => {
    const res = await api.createSubject(data);
    setSubjects((prev) => [...prev, res.subject]);
    await refreshData();
    return res.subject;
  };

  const updateSubject = async (
    id: string,
    data: Partial<{
      code?: string;
      name?: string;
      instructor?: string;
      credits?: number;
      color?: string;
    }>
  ) => {
    const res = await api.updateSubject(id, data);
    setSubjects((prev) => prev.map((s) => (s.id === id ? res.subject : s)));
    await refreshData();
  };

  const deleteSubject = async (id: string) => {
    await api.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    await refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        subjects,
        stats,
        subjectProgress,
        loading,
        error,
        isLiveMode,
        isAddTaskModalOpen,
        selectedSubjectIdForNewTask,
        openAddTaskModal,
        closeAddTaskModal,
        isQuickTimerOpen,
        toggleQuickTimer,
        refreshData,
        addTask,
        updateTask,
        toggleTaskCompletion,
        deleteTask,
        addSubject,
        updateSubject,
        deleteSubject,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
