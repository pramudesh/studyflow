import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import type { Task, Subject } from '../types';

export const TasksPage: React.FC = () => {
  const {
    tasks,
    subjects,
    toggleTaskCompletion,
    deleteTask,
    openAddTaskModal,
  } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      today: tasks.filter((t: Task) => !t.is_completed && (t.due_date === todayStr || !t.due_date)).length,
      upcoming: tasks.filter((t: Task) => !t.is_completed && t.due_date && t.due_date > todayStr).length,
      completed: tasks.filter((t: Task) => t.is_completed).length,
    };
  }, [tasks, todayStr]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((task: Task) => {
      // Tab filter
      if (activeTab === 'today') {
        if (task.is_completed || (task.due_date && task.due_date !== todayStr)) return false;
      } else if (activeTab === 'upcoming') {
        if (task.is_completed || !task.due_date || task.due_date <= todayStr) return false;
      } else if (activeTab === 'completed') {
        if (!task.is_completed) return false;
      }

      // Subject filter
      if (selectedSubjectFilter !== 'all' && task.subject_id !== selectedSubjectFilter) {
        return false;
      }

      // Priority filter
      if (selectedPriorityFilter !== 'all' && task.priority !== selectedPriorityFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query);
        const matchesCourse =
          task.subjects?.name.toLowerCase().includes(query) ||
          task.subjects?.code?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNotes && !matchesCourse) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, activeTab, selectedSubjectFilter, selectedPriorityFilter, searchQuery, todayStr]);

  const allFilteredSelected =
    filteredTasks.length > 0 && filteredTasks.every((t: Task) => selectedTaskIds.includes(t.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(filteredTasks.map((t: Task) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleToggleSelectTask = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = async () => {
    for (const id of selectedTaskIds) {
      await toggleTaskCompletion(id);
    }
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedTaskIds) {
      await deleteTask(id);
    }
    setSelectedTaskIds([]);
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
      <div className="p-space-lg lg:p-space-xl max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Header Section with Title, Stat Badges, and Primary CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                All Academic Tasks
              </h1>
              <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold">
                {counts.all} total tasks
              </span>
              <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                {counts.today} due today
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Stay ahead of syllabus deadlines, seminar assignments, and weekly lab deliverables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAddTaskModal()}
              className="bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span className="font-semibold">+ New Task</span>
            </button>
          </div>
        </div>

        {/* Controls Row: Search, Segmented Tabs, and Dropdowns */}
        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container/60 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Input Container */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm pl-11 pr-9 py-2.5 rounded-xl focus:outline-none focus:bg-surface-container transition-all"
              id="task-search-input"
              placeholder="Search by task title, keyword, or course code..."
              type="text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                id="clear-search-btn"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Segmented Tabs */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-full gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Today ({counts.today})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Upcoming ({counts.upcoming})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Completed ({counts.completed})
            </button>
          </div>

          {/* Dropdown Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {/* Subject Filter */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-surface-container-low text-on-surface font-label-md text-label-md px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Courses</option>
              {subjects.map((sub: Subject) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code || sub.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="bg-surface-container-low text-on-surface font-label-md text-label-md px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Bulk select all toggle row */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center justify-between px-2 text-on-surface-variant font-label-sm text-label-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
              />
              <span>Select all {filteredTasks.length} visible tasks</span>
            </label>
            <span>Showing {filteredTasks.length} tasks</span>
          </div>
        )}

        {/* Task Cards Container */}
        <div className="flex flex-col gap-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 border border-surface-container/60 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-outline-variant">assignment</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">No tasks found</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                No academic tasks match your active filters or search terms. Try clearing filters or create a new task.
              </p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSelectedSubjectFilter('all');
                  setSelectedPriorityFilter('all');
                  setSearchQuery('');
                }}
                className="mt-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-2 rounded-xl font-label-md text-label-md transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredTasks.map((task: Task) => {
              const isSelected = selectedTaskIds.includes(task.id);
              return (
                <div
                  key={task.id}
                  className={`bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container/60 hover:shadow-md transition-all flex items-start justify-between gap-4 group ${
                    isSelected ? 'ring-2 ring-primary/40 bg-surface-container-low/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox for bulk actions */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectTask(task.id)}
                      className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    />

                    {/* Completion Toggle */}
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        task.is_completed
                          ? 'bg-tertiary-container text-on-tertiary'
                          : 'bg-surface-container-low shadow-sm text-transparent hover:text-on-surface-variant/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none">check</span>
                    </button>

                    {/* Task Content */}
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-title-md text-title-md leading-tight ${
                            task.is_completed
                              ? 'line-through text-on-surface-variant font-medium'
                              : 'text-on-surface font-semibold group-hover:text-primary transition-colors'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        {task.is_completed ? (
                          <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
                            Done
                          </span>
                        ) : task.priority === 'high' ? (
                          <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                            <span
                              className="material-symbols-outlined text-[12px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              local_fire_department
                            </span>
                            High Priority
                          </span>
                        ) : task.priority === 'medium' ? (
                          <span className="bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
                            Medium
                          </span>
                        ) : (
                          <span className="bg-surface-container-highest text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
                            Low
                          </span>
                        )}
                      </div>

                      {task.notes && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                          {task.notes}
                        </p>
                      )}

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-on-surface-variant font-body-sm text-body-sm">
                        {task.subjects && (
                          <span
                            className="font-medium px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${task.subjects.color}20`,
                              color: task.subjects.color,
                            }}
                          >
                            {task.subjects.code || task.subjects.name}
                          </span>
                        )}

                        {task.due_date && (
                          <span
                            className={`flex items-center gap-1 ${
                              task.priority === 'high' && !task.is_completed && task.due_date <= todayStr
                                ? 'text-error font-medium'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {task.due_date} {task.due_time ? `• ${task.due_time}` : ''}
                          </span>
                        )}

                        {task.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">timelapse</span>
                            {task.duration_minutes}m duration
                          </span>
                        )}

                        {task.reminder_enabled && (
                          <span className="flex items-center gap-1 text-secondary">
                            <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                            Alert on
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Single Task Delete Action */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                      title="Delete Task"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div
          id="bulk-action-bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 z-40 animate-in slide-in-from-bottom-6 duration-200"
        >
          <span className="font-label-md text-label-md font-semibold" id="selected-count">
            {selectedTaskIds.length} task{selectedTaskIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-surface-variant/30" />
          <button
            onClick={handleBulkComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tertiary hover:bg-tertiary-container text-on-tertiary font-label-md text-label-md transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            <span>Mark Complete</span>
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error hover:bg-error/90 text-on-error font-label-md text-label-md transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Delete</span>
          </button>
          <button
            onClick={() => setSelectedTaskIds([])}
            className="p-1 text-inverse-on-surface/70 hover:text-inverse-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
};
