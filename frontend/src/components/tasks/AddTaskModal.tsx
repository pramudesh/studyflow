import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import type { TaskPriority } from '../../types';

export const AddTaskModal: React.FC = () => {
  const { isAddTaskModalOpen, closeAddTaskModal, subjects, addTask, selectedSubjectIdForNewTask } = useData();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('23:59');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(150);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [subtasks, setSubtasks] = useState<string[]>([
    'Read textbook assignment',
    'Draft problem responses',
  ]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [showAddSubtaskInput, setShowAddSubtaskInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAddTaskModalOpen) {
      setTitle('');
      setNotes('');
      setErrorMsg('');
      const defaultSubj = selectedSubjectIdForNewTask || (subjects.length > 0 ? subjects[0].id : '');
      setSubjectId(defaultSubj);
      setDueDate(new Date().toISOString().slice(0, 10));
      setDueTime('23:59');
      setPriority('medium');
      setDurationMinutes(150);
      setReminderEnabled(true);
    }
  }, [isAddTaskModalOpen, selectedSubjectIdForNewTask, subjects]);

  if (!isAddTaskModalOpen) return null;

  const selectedSubject = subjects.find((s) => s.id === subjectId) || subjects[0];

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const handleAddSubtask = () => {
    if (newSubtaskInput.trim()) {
      setSubtasks([...subtasks, newSubtaskInput.trim()]);
      setNewSubtaskInput('');
      setShowAddSubtaskInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a task title');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await addTask({
        title: title.trim(),
        subjectId: subjectId || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        priority,
        durationMinutes,
        reminderEnabled,
        notes: notes.trim() || undefined,
      });
      closeAddTaskModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 top-16 left-64 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-space-md overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-surface-container">
        {/* 1. Modal Header */}
        <div className="px-space-xl pt-space-lg pb-space-md bg-surface-container-lowest flex items-start justify-between border-b border-surface-container-low">
          <div className="flex items-start gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary-container shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[26px]">edit_calendar</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface">Create New Task</span>
                <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                  Auto-Sync
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Organize your study goals, set deadlines, and track your syllabus
              </p>
            </div>
          </div>
          <button
            onClick={closeAddTaskModal}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 2. Modal Body / Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-space-xl py-space-md flex flex-col gap-space-md max-h-[68vh] overflow-y-auto pr-space-lg">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Task Title Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  Task Title <span className="text-error">*</span>
                </label>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {title.length}/100
                </span>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-xl placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                placeholder="e.g., Complete Problem Set 3 & Review Lecture Notes"
                type="text"
              />
            </div>

            {/* Subject / Course Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                Subject / Course <span className="text-error">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-xl flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: selectedSubject?.color || '#2563EB' }}
                    />
                    <span className="font-title-md text-title-md text-on-surface">
                      {selectedSubject
                        ? `${selectedSubject.code ? `${selectedSubject.code}: ` : ''}${selectedSubject.name}`
                        : 'Select Subject'}
                    </span>
                    {selectedSubject?.code && (
                      <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-1.5 py-0.5 rounded">
                        Core STEM
                      </span>
                    )}
                  </div>
                  <span
                    className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  >
                    arrow_drop_down
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-xl shadow-xl z-30 p-1.5 flex flex-col gap-1 border border-surface-container animate-in fade-in duration-100">
                    {subjects.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setSubjectId(sub.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          sub.id === subjectId
                            ? 'bg-surface-container-high/60 font-medium'
                            : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
                          <span className="font-label-md text-label-md text-on-surface">
                            {sub.code ? `${sub.code}: ` : ''}
                            {sub.name}
                          </span>
                        </div>
                        {sub.id === subjectId && (
                          <span className="material-symbols-outlined text-primary-container text-[18px]">check</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {/* Due Date */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                  <span>
                    Due Date <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-primary text-[18px] pointer-events-none">
                    calendar_today
                  </span>
                  <input
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
                    type="date"
                  />
                </div>
              </div>

              {/* Due Time with Quick Presets */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Due Time <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                    schedule
                  </span>
                  <input
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
                    type="time"
                  />
                </div>
                {/* Preset Quick Buttons */}
                <div className="flex items-center gap-1.5 mt-1 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    onClick={() => setDueTime('23:59')}
                    className="px-2 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors whitespace-nowrap cursor-pointer"
                  >
                    End of Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueTime('09:00')}
                    className="px-2 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Before Class
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueTime('08:00')}
                    className="px-2 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Tomorrow AM
                  </button>
                </div>
              </div>
            </div>

            {/* Priority Selector Segmented Buttons */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Priority Level</label>
              <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-1.5 rounded-xl">
                {/* Low */}
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                    priority === 'low'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-outline-variant" />
                  <span>Low</span>
                </button>

                {/* Medium */}
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                    priority === 'medium'
                      ? 'bg-secondary-fixed text-on-secondary-fixed shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim" />
                  <span>Medium</span>
                </button>

                {/* High */}
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                    priority === 'high'
                      ? 'bg-error-container text-on-error-container shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px] text-error"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_fire_department
                  </span>
                  <span>High</span>
                </button>
              </div>
            </div>

            {/* Estimated Duration & Subtasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md bg-surface-container-low/50 p-space-md rounded-2xl">
              {/* Duration Stepper */}
              <div className="flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">timelapse</span>
                    <span>Estimated Duration</span>
                  </span>
                  <span className="font-title-md text-title-md text-primary font-bold">
                    {formatDuration(durationMinutes)}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="360"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-2 bg-surface-container-high rounded-lg"
                />
                <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>15m</span>
                  <span>3h</span>
                  <span>6h</span>
                </div>
              </div>

              {/* Subtasks Minimal Preview */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Subtasks ({subtasks.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddSubtaskInput(true)}
                    className="text-primary font-label-sm text-label-sm font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span> Add Step
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
                  {subtasks.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg text-on-surface font-body-sm text-body-sm shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                      <span className="truncate flex-1">{step}</span>
                      <button
                        type="button"
                        onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))}
                        className="text-on-surface-variant hover:text-error"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                  {showAddSubtaskInput && (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        value={newSubtaskInput}
                        onChange={(e) => setNewSubtaskInput(e.target.value)}
                        placeholder="Step description..."
                        className="bg-surface-container text-on-surface text-body-sm px-2 py-1 rounded-lg flex-1 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubtask}
                        className="bg-primary text-on-primary text-label-sm px-2 py-1 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reminder Toggle Switch */}
            <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Study Notifications</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Alert 1 hour before + morning of due date
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
              </label>
            </div>

            {/* Notes & Resource Links Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                <span>Notes & Resource Links</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">Markdown supported</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-2.5 rounded-xl placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container resize-none"
                placeholder="Add lecture slides link, textbook chapter, or assignment requirements..."
              />
            </div>
          </div>

          {/* 3. Modal Footer */}
          <div className="px-space-xl py-space-md bg-surface-container-lowest flex items-center justify-between border-t border-surface-container-low">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-outline">info</span>
              <span>
                Fields marked <span className="text-error font-bold">*</span> are required
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={closeAddTaskModal}
                className="px-space-lg py-2.5 rounded-xl text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary-container to-secondary text-on-primary font-title-md text-title-md px-space-xl py-2.5 rounded-xl shadow-lg hover:shadow-primary-container/25 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check</span>
                    <span>Save Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
