import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Supabase redirects recovery emails with: #access_token=...&refresh_token=...&type=recovery
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const hashToken = hashParams.get('access_token');

    // Also support query param fallback (?token=... or ?access_token=...)
    const searchParams = new URLSearchParams(window.location.search);
    const queryToken = searchParams.get('access_token') || searchParams.get('token');

    const storedToken = localStorage.getItem('studyflow_access_token');
    const effectiveToken = hashToken || queryToken || storedToken;

    if (effectiveToken) {
      setRecoveryToken(effectiveToken);
      localStorage.setItem('studyflow_access_token', effectiveToken);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.resetPassword(password, recoveryToken || undefined);
      setSuccessMsg('Your password has been successfully reset! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-background flex items-center justify-center p-space-md">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 sm:p-10 shadow-xl border border-surface-container">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shadow-sm">
            <img
              alt="StudyFlow Logo"
              className="w-9 h-9 object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1ULcoEW6hopLXMyZf9KFbFElv9uKUPATyi0fYwup3oxYIAYXeVYJKD6k388hlBaz4VZ9eE70VxLJLLEYj3H0dopErfvER6xliYTYu3CDLbJo1dfUfmHEflLFy76E_xUHW7z6P92OgR0dL9Kf8rbwa7KGpoudzWqfWkBY6GmG_PARjezsIhItz0DzmAVQjpIgKnAwIg4sCNcZRLSpfQGe9P92FVUu8p_eP8K63uiheVe2DgnBDC07_btXqhW"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">StudyFlow</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Create New Password</span>
          </div>
        </div>

        <h1 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">Set New Password</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Enter a secure password for your StudyFlow scholar account.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-2.5">
            <span className="material-symbols-outlined text-error text-[20px] shrink-0">error</span>
            <div>
              <p className="font-semibold">Validation Error</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-body-md text-body-md flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0">check_circle</span>
              <div>
                <p className="font-semibold">Password Updated</p>
                <p className="mt-0.5 text-body-sm">{successMsg}</p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-title-md text-title-md flex items-center justify-center gap-2 hover:bg-primary-container transition-colors"
            >
              <span>Go to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-outline pointer-events-none text-body-lg">
                  lock
                </span>
                <input
                  id="newPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-transparent focus:border-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 text-outline hover:text-on-surface transition-colors p-1 flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-body-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmNewPassword">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-outline pointer-events-none text-body-lg">
                  lock_reset
                </span>
                <input
                  id="confirmNewPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-transparent focus:border-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-title-md text-title-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Saving new password...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  <span>Update Password</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-primary hover:underline font-label-md text-label-md inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Cancel and return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
