import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg('');
      const res = await api.getGoogleOAuthUrl();
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Google Login requires live Supabase credentials with Google Provider enabled in Supabase.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please ensure both passwords are identical.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      try {
        setIsSubmitting(true);
        const res = await signup(email, password, fullName);
        if (res.requiresEmailConfirmation) {
          setSuccessMsg(
            'Account created! A verification link was sent to your email. Please check your inbox and verify before signing in.'
          );
        } else {
          navigate('/');
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Signup failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        setIsSubmitting(true);
        await login(email, password);
        navigate('/');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid credentials.';
        if (msg.toLowerCase().includes('email not confirmed')) {
          setErrorMsg(
            'Email not verified yet! Please check your email inbox to verify your account, or disable "Confirm email" in your Supabase Dashboard (Authentication → Providers → Email).'
          );
        } else {
          setErrorMsg(msg);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };


  return (
    <main className="w-full min-h-screen bg-background flex items-center justify-center p-space-md">
      <div className="flex flex-col w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full rounded-3xl bg-surface-container-lowest shadow-xl overflow-hidden p-4 sm:p-8 lg:p-12 border border-surface-container">
          {/* Ambient decorative glows inside card container */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-primary-fixed-dim/40 via-surface-variant/20 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tl from-secondary-fixed/40 via-surface-variant/20 to-transparent blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* LEFT COLUMN: Authentic Student Authentication Flow */}
            <div className="lg:col-span-6 flex flex-col justify-center max-w-xl mx-auto lg:mx-0 w-full">
              {/* Brand Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    alt="StudyFlow Logo"
                    className="w-9 h-9 object-contain"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1ULcoEW6hopLXMyZf9KFbFElv9uKUPATyi0fYwup3oxYIAYXeVYJKD6k388hlBaz4VZ9eE70VxLJLLEYj3H0dopErfvER6xliYTYu3CDLbJo1dfUfmHEflLFy76E_xUHW7z6P92OgR0dL9Kf8rbwa7KGpoudzWqfWkBY6GmG_PARjezsIhItz0DzmAVQjpIgKnAwIg4sCNcZRLSpfQGe9P92FVUu8p_eP8K63uiheVe2DgnBDC07_btXqhW"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                      StudyFlow
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                      Academic OS
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Focus. Plan. Achieve.</span>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="mb-6">
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2">
                  {isSignUp ? (
                    <>
                      Join StudyFlow, scholar <span className="inline-block animate-bounce">🎓</span>
                    </>
                  ) : (
                    <>
                      Welcome back, scholar <span className="inline-block animate-bounce">👋</span>
                    </>
                  )}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {isSignUp
                    ? 'Create your academic profile to sync your courses, tasks, and GPA goals.'
                    : 'Stay organized, beat deadlines, and achieve your academic goals without the burnout.'}
                </p>
              </div>

              {/* Mode Toggle Segmented Control */}
              <div className="flex bg-surface-container-low p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                    !isSignUp
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                    isSignUp
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Single Sign-On Primary CTA */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3.5 px-5 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-200 shadow-sm text-on-surface font-title-md text-title-md active:scale-[0.99] group cursor-pointer disabled:opacity-60"
                id="ssoBtn"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="truncate">
                  {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google • Campus SSO'}
                </span>
                <span className="material-symbols-outlined text-outline group-hover:translate-x-0.5 transition-transform text-body-lg">
                  arrow_forward
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="w-full h-px bg-surface-container-high" />
                <span className="absolute bg-surface-container-lowest px-3 font-label-sm text-label-sm text-outline tracking-wider uppercase">
                  or campus email
                </span>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-error text-[20px] shrink-0">error</span>
                  <div className="flex-1">
                    <p className="font-semibold">Authentication Error</p>
                    <p className="mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Success Message Alert */}
              {successMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-body-sm text-body-sm flex items-start gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">check_circle</span>
                  <div className="flex-1">
                    <p className="font-semibold">Success</p>
                    <p className="mt-0.5">{successMsg}</p>
                  </div>
                </div>
              )}

              {/* Form Elements */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name for Signup */}
                {isSignUp && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="fullName">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 material-symbols-outlined text-outline pointer-events-none text-body-lg">
                        person
                      </span>
                      <input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Maya Lin"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline border border-transparent focus:border-primary/20"
                        type="text"
                      />
                    </div>
                  </div>
                )}

                {/* University Email Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="campusEmail">
                      Campus Email
                    </label>
                    <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      .edu Auto-unlocks Premium
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 material-symbols-outlined text-outline pointer-events-none text-body-lg">
                      school
                    </span>
                    <input
                      id="campusEmail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="maya.lin@university.edu"
                      required
                      type="email"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline border border-transparent focus:border-primary/20"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="studentPassword">
                      Password
                    </label>
                    {!isSignUp && (
                      <Link to="/forgot-password" className="font-label-sm text-label-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 material-symbols-outlined text-outline pointer-events-none text-body-lg">
                      lock
                    </span>
                    <input
                      id="studentPassword"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline border border-transparent focus:border-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Toggle password visibility"
                      className="absolute right-3.5 text-outline hover:text-on-surface transition-colors p-1 flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-body-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Password Confirmation for Signup */}
                {isSignUp && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 material-symbols-outlined text-outline pointer-events-none text-body-lg">
                        lock_reset
                      </span>
                      <input
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        type={showPassword ? 'text' : 'password'}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-outline border border-transparent focus:border-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* Helper Note: Edu Perks */}
                <div className="p-2.5 rounded-lg bg-surface-container flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-body-md mt-0.5">tips_and_updates</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    <strong className="font-semibold text-on-surface">Student tip:</strong> Signing in with your
                    institution's email grants 1 free semester of collaborative study workspaces & smart flashcards.
                  </p>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-primary bg-surface-container-low accent-primary cursor-pointer"
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Remember me on this device</span>
                  </label>
                  <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">encrypted</span> 256-bit AES
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary font-title-md text-title-md shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 group mt-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      <span>Authenticating scholar...</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create Student Account' : 'Sign In to Workspace'}</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                        login
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Sub Toggle / Sign Up link */}
              <div className="mt-6 text-center space-y-2">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp((prev) => !prev);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="font-title-md text-title-md text-secondary hover:text-secondary-container hover:underline ml-1 cursor-pointer"
                  >
                    {isSignUp ? 'Sign in to existing account →' : 'Sign up with student discount →'}
                  </button>
                </p>

              </div>

              {/* Trust Badges Under Form */}
              <div className="mt-8 pt-5 border-t border-surface-container flex items-center justify-center gap-6 text-outline">
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
                  <span
                    className="material-symbols-outlined text-tertiary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  FERPA Compliant
                </div>
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
                  <span
                    className="material-symbols-outlined text-tertiary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  Canvas &amp; Blackboard Sync
                </div>
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
                  <span
                    className="material-symbols-outlined text-tertiary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  No Credit Card Needed
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Friendly Visual Narrative & Social Proof */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
              <div className="relative w-full rounded-2xl bg-surface-container-low p-4 sm:p-6 lg:p-7 shadow-sm overflow-hidden border border-surface-container/60">
                {/* Decorative Top Metadata Pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold uppercase tracking-wider">
                      Live Campus Study Pod
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-sm">
                    <span className="material-symbols-outlined text-secondary text-sm">groups</span>
                    <span className="font-label-sm text-label-sm text-on-surface">32,480 Active Scholars</span>
                  </div>
                </div>

                {/* Main Campus Illustration */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-surface-container flex items-center justify-center shadow-inner group">
                  <img
                    alt="Diverse university students collaborating around a wooden table in a sunlit campus library"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3Zln8DsULhoQzlSzWdNjwuu8puuu1PcZ_w_UUga5wT-3F9WXUzFkZgzsYDLiicu1bvmfya2ltaKCJGa3Q4kH4O9OyUsxLaKLwNWFUnogOExrfbzVIMyO1QRdC8IAW8OkXrvkM8E-kk_EzoYk4OXBvx32smdK1u7CFR35Lcd_bLgcn3v9uxMffsPFtmHQKCyILfjRZQ-VdSbJ8Fp-H9C2X3PDfUt8N4MHbpNO01RcPfScbIEZ6wqKevw"
                  />
                  {/* Floating Pill Badge 1 */}
                  <div className="absolute top-4 left-4 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform hover:-translate-y-0.5 transition-transform">
                    <span className="text-amber-500 font-bold text-sm">★</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      4.9/5 Student Rating
                    </span>
                  </div>
                  {/* Floating Pill Badge 2 */}
                  <div className="absolute bottom-4 right-4 bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform hover:-translate-y-0.5 transition-transform">
                    <span
                      className="material-symbols-outlined text-tertiary text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      track_changes
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      94% on-time submissions
                    </span>
                  </div>
                </div>

                {/* Testimonial Card */}
                <div className="mt-4 bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-md border border-surface-container">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-title-md text-title-md flex-shrink-0 font-bold">
                      AK
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md text-on-surface italic leading-snug">
                        “StudyFlow raised my GPA from 3.2 to 3.8 in one term. The Pomodoro queue and Canvas deadline alerts
                        took all the panic away!”
                      </p>
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          — Alex K., Bioengineering @ UCLA
                        </span>
                        <div className="flex items-center text-amber-500 text-xs">★★★★★</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Feature Ticker */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center pt-2 border-t border-surface-container">
                  <div className="p-2 rounded-lg bg-surface-container-lowest">
                    <span className="block font-title-md text-title-md text-primary font-bold">25 min</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Focus Sprint</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-lowest">
                    <span className="block font-title-md text-title-md text-secondary font-bold">Smart</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Exam Prep</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-lowest">
                    <span className="block font-title-md text-title-md text-tertiary font-bold">Zero</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Late Penalties</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
