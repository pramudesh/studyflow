import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    tasks,
    stats,
    subjectProgress,
    toggleTaskCompletion,
    openAddTaskModal,
    toggleQuickTimer,
  } = useData();

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Maya';

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => t.due_date === todayStr || !t.due_date);
  const completedToday = todayTasks.filter((t) => t.is_completed).length;
  const totalToday = todayTasks.length || 1;
  const todayPercent = Math.round((completedToday / totalToday) * 100);

  // Upcoming incomplete tasks
  const upcomingTasks = tasks
    .filter((t) => !t.is_completed && t.due_date && t.due_date > todayStr)
    .slice(0, 3);

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-lg py-space-md max-w-[1440px] mx-auto w-full space-y-space-lg">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 -bottom-20 w-56 h-56 bg-secondary-fixed/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                  Fall Semester 2025 • Week 9
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                <span className="font-label-sm text-label-sm text-tertiary font-medium">On Track</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight flex items-center gap-2">
                Good morning, {userName}! <span className="inline-block animate-pulse">✨</span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                You have{' '}
                <span className="font-title-md text-primary font-semibold">
                  {todayTasks.filter((t) => !t.is_completed).length} tasks
                </span>{' '}
                due today and{' '}
                <span className="font-title-md text-error font-semibold">
                  {stats.due_this_week_count || upcomingTasks.length} upcoming deadlines
                </span>{' '}
                this week. Keep up the high momentum!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm pt-2 lg:pt-0">
              <button
                onClick={toggleQuickTimer}
                className="bg-surface-container-low text-secondary font-label-md text-label-md px-space-md py-2.5 rounded-xl hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                id="quick-pomodoro-btn"
              >
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <span>Quick Study (25m)</span>
              </button>
              <button
                onClick={() => openAddTaskModal()}
                className="bg-gradient-to-r from-primary to-secondary text-on-primary font-title-md text-title-md px-space-lg py-2.5 rounded-xl hover:opacity-95 transition-all shadow-md flex items-center gap-2 group cursor-pointer"
                id="open-task-modal-btn"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-200">
                  add
                </span>
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {/* Metric 1: Tasks Completed */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container/60 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">
                Tasks Completed Today
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">{completedToday}</span>
                <span className="font-title-md text-title-md text-on-surface-variant">/ {totalToday}</span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                {totalToday - completedToday} remaining
              </span>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle className="stroke-surface-container" cx="24" cy="24" fill="none" r="20" strokeWidth="4.5" />
                <circle
                  className="stroke-primary"
                  cx="24"
                  cy="24"
                  fill="none"
                  r="20"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * todayPercent) / 100}
                  strokeLinecap="round"
                  strokeWidth="4.5"
                />
              </svg>
              <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">{todayPercent}%</span>
            </div>
          </div>

          {/* Metric 2: Upcoming Deadlines */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container/60 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">
                Upcoming Deadlines
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {stats.due_this_week_count || 5}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">this week</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[12px]">schedule</span> 2 in &lt;48h
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[24px]">assignment_late</span>
            </div>
          </div>

          {/* Metric 3: Current Study Streak */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container/60 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">
                Current Streak
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">14</span>
                <span className="font-headline-sm text-headline-sm text-secondary font-semibold">Days 🔥</span>
              </div>
              <div className="flex items-center gap-1 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <span
                className="material-symbols-outlined text-[26px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
          </div>

          {/* Metric 4: Semester GPA Target */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container/60 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium uppercase tracking-wide">
                Target Semester GPA
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">3.85</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">/ 4.0</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[13px]">arrow_upward</span> +0.15 vs Midterm
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* LEFT COLUMN: 8 cols on desktop */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            {/* Today's Study Tasks Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 flex flex-col space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Today's Study Tasks</h2>
                  <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold">
                    {todayTasks.filter((t) => !t.is_completed).length} remaining
                  </span>
                </div>
                <Link
                  to="/tasks"
                  className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>

              {/* Task List */}
              <div className="flex flex-col gap-space-sm" id="taskListContainer">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant font-body-sm">
                    <span className="material-symbols-outlined text-4xl text-primary/40 mb-2">task_alt</span>
                    <p>No tasks scheduled for today. Great job or add a new goal!</p>
                  </div>
                ) : (
                  todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`group transition-all p-space-md rounded-xl flex items-start gap-space-md ${
                        task.is_completed
                          ? 'bg-surface-container-low/50 opacity-80'
                          : 'bg-surface-container-low hover:bg-surface-container-high/60'
                      }`}
                    >
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                          task.is_completed
                            ? 'bg-tertiary-container text-on-tertiary'
                            : 'bg-surface-container-lowest shadow-sm text-transparent hover:text-on-surface-variant/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] leading-none">check</span>
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-title-md text-title-md truncate transition-colors ${
                              task.is_completed
                                ? 'text-on-surface-variant line-through font-medium'
                                : 'text-on-surface font-semibold group-hover:text-primary'
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.is_completed ? (
                            <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold shrink-0">
                              Completed
                            </span>
                          ) : task.priority === 'high' ? (
                            <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold shrink-0">
                              High Priority
                            </span>
                          ) : task.priority === 'medium' ? (
                            <span className="bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold shrink-0">
                              Medium Priority
                            </span>
                          ) : (
                            <span className="bg-surface-container-highest text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold shrink-0">
                              Low Priority
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                          {task.subjects && (
                            <span
                              className="font-medium px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${task.subjects.color}20`,
                                color: task.subjects.color,
                              }}
                            >
                              {task.subjects.code || task.subjects.name}
                            </span>
                          )}
                          {task.due_time && (
                            <span
                              className={`flex items-center gap-1 ${
                                task.priority === 'high' && !task.is_completed
                                  ? 'text-error font-medium'
                                  : 'text-on-surface-variant'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">schedule</span> Due{' '}
                              {task.due_time}
                            </span>
                          )}
                          {task.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">timelapse</span>{' '}
                              {task.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weekly Productivity Chart Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 space-y-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Weekly Productivity Log
                    </h2>
                    <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
                      31.5 hrs logged
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Daily study target: 5.0 hours</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="w-3 h-3 rounded bg-primary" /> Hours Logged
                  </div>
                  <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                    <span className="w-3 h-0.5 bg-outline" /> Daily Goal (5h)
                  </div>
                </div>
              </div>

              {/* Study Chart Visual */}
              <div className="relative w-full h-56 pt-6 flex flex-col justify-end">
                {/* Target Reference Line at 5.0h */}
                <div className="absolute inset-x-0 bottom-24 h-px bg-outline/25 border-dashed border-t border-outline/40 z-10 pointer-events-none flex items-center justify-end">
                  <span className="bg-surface-container-lowest px-1 font-label-sm text-label-sm text-on-surface-variant">
                    5.0h goal
                  </span>
                </div>
                {/* Bar Columns */}
                <div className="grid grid-cols-7 gap-2 sm:gap-4 h-44 items-end pb-6 z-20">
                  {/* Mon */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                      4.5h
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-primary-fixed hover:bg-primary transition-all rounded-t-lg"
                      style={{ height: '64%' }}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Mon</span>
                  </div>
                  {/* Tue */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="font-label-sm text-label-sm text-primary group-hover:text-primary transition-colors font-bold">
                      5.2h
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-primary hover:bg-primary-container transition-all rounded-t-lg shadow-sm"
                      style={{ height: '74%' }}
                    />
                    <span className="font-label-sm text-label-sm text-primary font-bold">Today</span>
                  </div>
                  {/* Wed */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                      3.8h
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-primary-fixed hover:bg-primary transition-all rounded-t-lg"
                      style={{ height: '54%' }}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Wed</span>
                  </div>
                  {/* Thu */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                      6.0h
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-secondary hover:bg-secondary-container transition-all rounded-t-lg shadow-sm"
                      style={{ height: '85%' }}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Thu</span>
                  </div>
                  {/* Fri */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                      4.0h
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-primary-fixed hover:bg-primary transition-all rounded-t-lg"
                      style={{ height: '57%' }}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Fri</span>
                  </div>
                  {/* Sat */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                      2.5h
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-surface-container-highest hover:bg-primary-fixed transition-all rounded-t-lg"
                      style={{ height: '35%' }}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Sat</span>
                  </div>
                  {/* Sun */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors font-semibold">
                      5.5h
                    </span>
                    <div
                      className="w-full max-w-[40px] bg-primary hover:bg-primary-container transition-all rounded-t-lg"
                      style={{ height: '78%' }}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calming Pastel Banner / Quick Breather Tip */}
            <div className="bg-surface-container-low rounded-2xl p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm border border-surface-container/60">
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">spa</span>
                </div>
                <div>
                  <p className="font-title-md text-title-md text-on-surface font-semibold">
                    All caught up on high priorities for today!
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    You've made steady progress on assignments. Take a relaxing 15-minute breather or hydrate.
                  </p>
                </div>
              </div>
              <button
                onClick={toggleQuickTimer}
                className="shrink-0 bg-surface-container-lowest hover:bg-surface-container-high font-label-md text-label-md text-on-surface px-space-md py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Log Short Break
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: 4 cols on desktop */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Upcoming Deadlines Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 space-y-space-md">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Upcoming Deadlines</h2>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">event_upcoming</span>
              </div>
              <div className="space-y-space-sm">
                {upcomingTasks.map((t, idx) => (
                  <div
                    key={t.id}
                    className="bg-surface-container-low p-space-md rounded-xl space-y-2 hover:bg-surface-container-high/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-title-md text-title-md text-on-surface font-semibold leading-tight">
                        {t.title}
                      </span>
                      <span
                        className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                          idx === 0
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-primary-fixed text-on-primary-fixed'
                        }`}
                      >
                        {idx === 0 ? 'In 2 days' : idx === 1 ? 'In 4 days' : 'In 6 days'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                      <span
                        className="flex items-center gap-1 font-medium"
                        style={{ color: t.subjects?.color || '#004ac6' }}
                      >
                        <span className="material-symbols-outlined text-[14px]">school</span>{' '}
                        {t.subjects?.code || 'Course'}
                      </span>
                      <span className={idx === 0 ? 'text-error font-medium' : ''}>
                        {t.due_date} • {t.due_time || '11:59 PM'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Progress Breakdown */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 space-y-space-md">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Subject Progress</h2>
                <Link to="/subjects" className="font-label-sm text-label-sm text-primary font-semibold hover:underline">
                  Manage
                </Link>
              </div>
              <div className="space-y-space-md">
                {subjectProgress.map((sub) => (
                  <div key={sub.subject_id} className="space-y-1.5">
                    <div className="flex items-center justify-between font-label-md text-label-md">
                      <span className="text-on-surface font-semibold">
                        {sub.name} {sub.code ? `(${sub.code})` : ''}
                      </span>
                      <span className="font-bold" style={{ color: sub.color }}>
                        {sub.completion_percent}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${sub.completion_percent}%`, backgroundColor: sub.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                      <span>Tasks: {sub.completed_tasks} completed</span>
                      <span>{sub.total_tasks - sub.completed_tasks} pending</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
