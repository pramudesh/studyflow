import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

export const QuickStudyModal: React.FC = () => {
  const { isQuickTimerOpen, toggleQuickTimer } = useData();
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<'pomodoro' | 'short' | 'long'>('pomodoro');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  if (!isQuickTimerOpen) return null;

  const handleSelectMode = (newMode: 'pomodoro' | 'short' | 'long') => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'pomodoro') setSecondsLeft(25 * 60);
    if (newMode === 'short') setSecondsLeft(5 * 60);
    if (newMode === 'long') setSecondsLeft(15 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSeconds = mode === 'pomodoro' ? 25 * 60 : mode === 'short' ? 5 * 60 : 15 * 60;
  const percent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-space-md animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-space-lg flex flex-col items-center gap-space-md border border-surface-container">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Quick Study Sprint</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Focus sprints maximize retention</p>
            </div>
          </div>
          <button
            onClick={toggleQuickTimer}
            className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mode Pills */}
        <div className="bg-surface-container-low p-1 rounded-full flex items-center gap-1">
          <button
            onClick={() => handleSelectMode('pomodoro')}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all ${
              mode === 'pomodoro'
                ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sprint (25m)
          </button>
          <button
            onClick={() => handleSelectMode('short')}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all ${
              mode === 'short'
                ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleSelectMode('long')}
            className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all ${
              mode === 'long'
                ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Circular Display */}
        <div className="relative w-52 h-52 my-3 flex items-center justify-center">
          <svg className="w-52 h-52 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e5eeff" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#712ae2"
              strokeWidth="8"
              strokeDasharray="314.16"
              strokeDashoffset={314.16 - (314.16 * percent) / 100}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-display-hero text-[44px] font-bold text-on-surface tracking-tight leading-none">
              {timeString}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
              {isRunning ? 'Flow in progress' : 'Sprint ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => setIsRunning((prev) => !prev)}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary font-title-md text-title-md shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">{isRunning ? 'pause' : 'play_arrow'}</span>
            <span>{isRunning ? 'Pause Flow' : 'Start Sprint'}</span>
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              handleSelectMode(mode);
            }}
            className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Reset timer"
          >
            <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
