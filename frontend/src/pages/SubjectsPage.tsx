import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Subject, Task } from '../types';

export const SubjectsPage: React.FC = () => {
  const {
    subjects,
    tasks,
    addSubject,
    updateSubject,
    deleteSubject,
    openAddTaskModal,
  } = useData();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState<number>(3);
  const [color, setColor] = useState('#2563EB');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const totalCredits = subjects.reduce((sum: number, s: Subject) => sum + (s.credits || 0), 0);
  const pendingTasksCount = tasks.filter((t: Task) => !t.is_completed).length;

  const handleOpenAdd = () => {
    setCode('');
    setName('');
    setInstructor('');
    setCredits(3);
    setColor('#2563EB');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addSubject({
      code: code.trim() || undefined,
      name: name.trim(),
      instructor: instructor.trim() || undefined,
      credits,
      color,
    });
    setIsAddModalOpen(false);
  };

  const handleStartEdit = (subj: Subject) => {
    setEditingSubject(subj);
    setCode(subj.code || '');
    setName(subj.name);
    setInstructor(subj.instructor || '');
    setCredits(subj.credits || 3);
    setColor(subj.color || '#2563EB');
    setActiveMenuId(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !name.trim()) return;
    await updateSubject(editingSubject.id, {
      code: code.trim() || undefined,
      name: name.trim(),
      instructor: instructor.trim() || undefined,
      credits,
      color,
    });
    setEditingSubject(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubject) return;
    await deleteSubject(deletingSubject.id);
    setDeletingSubject(null);
  };

  const colorOptions = [
    { label: 'Primary Blue', hex: '#2563EB' },
    { label: 'Royal Purple', hex: '#712AE2' },
    { label: 'Warm Amber', hex: '#D97706' },
    { label: 'Forest Emerald', hex: '#006242' },
    { label: 'Crimson Rose', hex: '#E11D48' },
  ];

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
      <div className="px-space-lg py-space-xl max-w-7xl mx-auto w-full flex flex-col gap-space-xl">
        {/* Page Header & Action Cluster */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Academic Term
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> In Session (Week 8 of 16)
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Enrolled Subjects &amp; Courses
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Manage your course load, syllabus milestones, and track individual course progress for Fall 2025.
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              onClick={() => handleOpenAdd()}
              className="bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-2.5 rounded-xl hover:bg-primary transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              id="open-add-modal-btn"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="font-semibold">Add New Subject</span>
            </button>
          </div>
        </div>

        {/* Semester Overview KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Total Courses */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1 z-10">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Total Courses
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">{subjects.length}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Enrolled</span>
              </div>
              <span className="font-body-sm text-body-sm text-tertiary flex items-center gap-0.5 mt-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Full-Time Standing
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary z-10">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary-container/5 rounded-full pointer-events-none" />
          </div>

          {/* Card 2: Credit Load */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1 z-10">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Credit Load
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">{totalCredits || 16}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Units</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Target graduation: 2026</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary z-10">
              <span className="material-symbols-outlined text-[24px]">balance</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-secondary/5 rounded-full pointer-events-none" />
          </div>

          {/* Card 3: Avg Completion */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1 z-10">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Avg. Completion
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">78%</span>
                <span className="font-body-sm text-body-sm text-tertiary font-medium">+4.2%</span>
              </div>
              <div className="w-28 bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary z-10">
              <span className="material-symbols-outlined text-[24px]">donut_large</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-tertiary/5 rounded-full pointer-events-none" />
          </div>

          {/* Card 4: Pending Tasks */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1 z-10">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Pending Tasks
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {pendingTasksCount}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Due soon</span>
              </div>
              <span className="font-body-sm text-body-sm text-error flex items-center gap-0.5 mt-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">priority_high</span> 2 High Priority
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error z-10">
              <span className="material-symbols-outlined text-[24px]">pending_actions</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-error/5 rounded-full pointer-events-none" />
          </div>
        </div>

        {/* Active Courses Section */}
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Active Courses</h2>
              <span className="bg-surface-container-high text-on-surface-variant text-label-sm font-label-sm px-2 py-0.5 rounded-full font-semibold">
                Fall 2025
              </span>
            </div>
          </div>

          {/* Grid of Course Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
            {subjects.map((subj: Subject) => {
              const subjectTasks = tasks.filter((t: Task) => t.subject_id === subj.id);
              const completedTasks = subjectTasks.filter((t: Task) => t.is_completed).length;
              const totalSubjTasks = subjectTasks.length;
              const completionPercent =
                totalSubjTasks > 0 ? Math.round((completedTasks / totalSubjTasks) * 100) : 75;

              return (
                <div
                  key={subj.id}
                  className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group border border-surface-container/60"
                >
                  {/* Left Color Accent Bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                    style={{ backgroundColor: subj.color || '#2563EB' }}
                  />

                  <div className="flex flex-col gap-space-md pl-2">
                    {/* Header & Action Menu */}
                    <div className="flex items-start justify-between gap-space-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {subj.code && (
                            <span
                              className="font-label-sm text-label-sm px-2 py-0.5 rounded font-bold"
                              style={{
                                backgroundColor: `${subj.color}20`,
                                color: subj.color,
                              }}
                            >
                              {subj.code}
                            </span>
                          )}
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {subj.credits || 3} Credits
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors font-bold">
                          {subj.name}
                        </h3>
                        {subj.instructor && (
                          <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                            <span>{subj.instructor}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === subj.id ? null : subj.id)
                          }
                          className="p-1.5 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {activeMenuId === subj.id && (
                          <div className="absolute right-0 top-8 w-44 bg-surface-container-lowest rounded-xl shadow-xl z-30 p-1.5 flex flex-col gap-0.5 border border-surface-container animate-in fade-in duration-100">
                            <button
                              onClick={() => handleStartEdit(subj)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors text-left w-full cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px] text-primary">edit</span>
                              <span>Edit Subject</span>
                            </button>
                            <button
                              onClick={() => {
                                setDeletingSubject(subj);
                                setActiveMenuId(null);
                              }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container/30 transition-colors text-left w-full cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>Delete Subject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between font-label-md text-label-md">
                        <span className="text-on-surface font-semibold">Course Progress</span>
                        <span className="font-bold" style={{ color: subj.color }}>
                          {completionPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${completionPercent}%`,
                            backgroundColor: subj.color || '#2563EB',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                        <span>
                          {completedTasks} of {totalSubjTasks} assignments completed
                        </span>
                        <button
                          onClick={() => openAddTaskModal(subj.id)}
                          className="text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span> Add Task
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add New Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-xl p-space-lg flex flex-col gap-space-md border border-surface-container animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">library_add</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Add New Subject</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Fill out course metrics for syllabus tracking
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="flex flex-col gap-space-md">
              <div className="grid grid-cols-3 gap-space-md">
                <div className="flex flex-col gap-1.5 col-span-1">
                  <label className="font-label-md text-label-md text-on-surface">Course Code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CS 450"
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="font-label-md text-label-md text-on-surface">Subject Name *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Artificial Intelligence"
                    required
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">Instructor Name</label>
                  <input
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="e.g. Dr. Alan Turing"
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">Credit Units</label>
                  <select
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
                  >
                    <option value="4">4 Credits</option>
                    <option value="3">3 Credits</option>
                    <option value="2">2 Credits</option>
                    <option value="1">1 Credit</option>
                  </select>
                </div>
              </div>

              {/* Theme Color Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Subject Accent Theme</label>
                <div className="flex items-center gap-3 py-1">
                  {colorOptions.map((opt) => (
                    <label key={opt.hex} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="theme-color"
                        checked={color === opt.hex}
                        onChange={() => setColor(opt.hex)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="w-5 h-5 rounded-full inline-block shadow-sm" style={{ backgroundColor: opt.hex }} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-space-md py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary font-label-md text-label-md px-space-lg py-2.5 rounded-xl hover:bg-primary transition-all shadow-sm font-semibold cursor-pointer"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-xl p-space-lg flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Edit Subject</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Update course details &amp; goals</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Subject Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">Instructor</label>
                  <input
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
                    type="text"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface">Credit Units</label>
                  <input
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-container"
                    type="number"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-space-md py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary font-label-md text-label-md px-space-lg py-2.5 rounded-xl hover:bg-primary transition-all shadow-sm font-semibold cursor-pointer"
                >
                  Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-xl p-space-lg flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Confirm Deletion</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Are you sure you want to remove this course?</p>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant bg-surface-container-low p-space-sm rounded-xl">
              All linked assignments and milestones for{' '}
              <strong className="text-on-surface font-semibold">{deletingSubject.name}</strong> will be unlinked from
              this subject.
            </p>
            <div className="flex items-center justify-end gap-space-sm pt-1">
              <button
                onClick={() => setDeletingSubject(null)}
                className="px-space-md py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Keep Course
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-error text-on-error font-label-md text-label-md px-space-md py-2.5 rounded-xl hover:bg-error/90 transition-all shadow-sm font-semibold cursor-pointer"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
