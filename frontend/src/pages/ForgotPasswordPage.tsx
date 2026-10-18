import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const msg = await forgotPassword(email.trim());
      setMessage(msg || 'If that email is registered, a password reset email has been dispatched.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send reset instructions. Please try again.');
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
            <span className="font-body-sm text-body-sm text-on-surface-variant">Account Security</span>
          </div>
        </div>

        <h1 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">Reset Password</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Enter your registered campus email and we will send you a secure link to reset your account credentials.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-body-md text-body-md flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0">mark_email_read</span>
              <div>
                <p className="font-semibold">Reset Email Sent</p>
                <p className="mt-0.5 text-body-sm">{message}</p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-title-md text-title-md flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="resetEmail">
                Campus Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-outline pointer-events-none text-body-lg">
                  school
                </span>
                <input
                  id="resetEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya.lin@university.edu"
                  required
                  type="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-transparent focus:border-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-primary text-on-primary font-title-md text-title-md shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Sending instructions...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                  <span>Send Reset Instructions</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-primary hover:underline font-label-md text-label-md inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
