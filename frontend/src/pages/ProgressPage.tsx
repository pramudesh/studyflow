import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { subjectProgress, stats, toggleQuickTimer } = useData();
  const [range, setRange] = useState<'week' | 'month' | 'semester'>('semester');

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Maya';

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
      <div className="p-space-lg md:p-space-xl flex flex-col gap-space-xl max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                Analytics &amp; Intelligence
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              <span className="font-label-sm text-label-sm text-tertiary font-medium">Live Sync Active</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Academic Progress &amp; Study Insights
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Real-time breakdown of focus rhythms, completion velocities, and academic milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Range Pills */}
            <div className="bg-surface-container-low p-1 rounded-xl flex items-center shadow-sm">
              <button
                onClick={() => setRange('week')}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                  range === 'week'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setRange('month')}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                  range === 'month'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setRange('semester')}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                  range === 'semester'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Semester
              </button>
            </div>

            {/* Semester Selector Dropdown */}
            <div className="relative">
              <div className="bg-surface-container-lowest text-on-surface font-label-md text-label-md px-3.5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 border border-surface-container">
                <span className="material-symbols-outlined text-[18px] text-primary">school</span>
                <span>Fall 2025 Term</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Coach Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-surface-container-low rounded-2xl p-space-lg shadow-sm border border-surface-container/60">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[26px]">psychology</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-title-md text-title-md text-on-surface font-bold">StudyFlow AI Advisor</span>
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
                    Peak Productivity
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mt-1 max-w-3xl">
                  Outstanding work this term, {userName}! You're in the{' '}
                  <span className="font-title-md text-primary font-bold">top 5% of consistent study schedules</span>{' '}
                  this semester. You have completed {stats.completed_count} tasks with zero missed high-priority milestones.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="block font-label-sm text-label-sm text-on-surface-variant">Recommended Break</span>
                <span className="font-title-md text-title-md text-on-surface font-bold">In 42 mins</span>
              </div>
              <button
                onClick={toggleQuickTimer}
                className="bg-surface-container-lowest text-primary hover:bg-surface-container-high px-4 py-2 rounded-xl font-label-md text-label-md shadow-sm transition-colors font-semibold cursor-pointer"
              >
                Start Quick Study
              </button>
            </div>
          </div>
        </div>

        {/* Key KPI Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* KPI 1 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Task Completion Rate</span>
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/40 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
              </div>
            </div>
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero text-display-hero text-on-surface tracking-tight font-bold">
                  86.4%
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: '86.4%' }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
              <span className="inline-flex items-center text-tertiary font-bold bg-tertiary-fixed/30 px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +5.2%
              </span>
              <span className="text-on-surface-variant">vs. last month</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Total Study Hours</span>
              <div className="w-8 h-8 rounded-lg bg-primary-fixed/60 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">timelapse</span>
              </div>
            </div>
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero text-display-hero text-on-surface tracking-tight font-bold">
                  148.5
                </span>
                <span className="font-title-md text-title-md text-on-surface-variant font-semibold">hrs</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '74%' }} />
              </div>
            </div>
            <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>
                Avg. Pace: <strong className="text-on-surface font-semibold">4.8 hrs/day</strong>
              </span>
              <span className="text-primary font-semibold">Target: 5.0</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">On-Time Submissions</span>
              <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
            </div>
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero text-display-hero text-on-surface tracking-tight font-bold">96%</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '96%' }} />
              </div>
            </div>
            <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>
                Completed: <strong className="text-on-surface font-semibold">28 / 29 tasks</strong>
              </span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Focus Velocity Score</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">speed</span>
              </div>
            </div>
            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display-hero text-display-hero text-on-surface tracking-tight font-bold">92</span>
                <span className="font-title-md text-title-md text-on-surface-variant font-semibold">/ 100</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary-container h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
              <span className="text-primary font-bold">Top 8%</span>
              <span className="text-on-surface-variant">of Engineering Cohort</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Subject Focus Distribution */}
          <div className="lg:col-span-6 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 space-y-space-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Subject Focus Distribution</h2>
            <div className="space-y-4">
              {subjectProgress.map((sub) => (
                <div key={sub.subject_id} className="space-y-1.5">
                  <div className="flex items-center justify-between font-label-md text-label-md">
                    <span className="text-on-surface font-semibold">{sub.name}</span>
                    <span className="font-bold" style={{ color: sub.color }}>
                      {sub.completion_percent}% Completed
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ width: `${sub.completion_percent}%`, backgroundColor: sub.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Consistency Heatmap */}
          <div className="lg:col-span-6 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container/60 space-y-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Focus Streak Heatmap</h2>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">14 Days Active</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Daily deep-work activity for the current academic session.
            </p>
            <div className="grid grid-cols-7 gap-2 pt-2">
              {Array.from({ length: 28 }).map((_, i) => {
                const intensity = (i * 7 + 13) % 4;
                const bg =
                  intensity === 3
                    ? 'bg-primary'
                    : intensity === 2
                    ? 'bg-primary-container'
                    : intensity === 1
                    ? 'bg-primary-fixed'
                    : 'bg-surface-container-high';
                return (
                  <div
                    key={i}
                    className={`h-8 rounded-lg ${bg} transition-all hover:scale-110 cursor-pointer`}
                    title={`Day ${i + 1}: ${intensity * 2 + 1} hours focus`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-2 border-t border-surface-container">
              <span>Less focus</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-surface-container-high inline-block" />
                <span className="w-3 h-3 rounded bg-primary-fixed inline-block" />
                <span className="w-3 h-3 rounded bg-primary-container inline-block" />
                <span className="w-3 h-3 rounded bg-primary inline-block" />
              </div>
              <span>More focus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
