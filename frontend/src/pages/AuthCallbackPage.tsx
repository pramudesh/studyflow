import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export const AuthCallbackPage: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Check hash fragment (Supabase OAuth: #access_token=...&refresh_token=...)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorDescription = hashParams.get('error_description') || hashParams.get('error');

        // 2. Check query params fallback (?code=... or ?error=...)
        const searchParams = new URLSearchParams(window.location.search);
        const queryError = searchParams.get('error_description') || searchParams.get('error');

        if (errorDescription || queryError) {
          setErrorMsg(errorDescription || queryError || 'Authentication failed. Please try again.');
          return;
        }

        if (accessToken) {
          localStorage.setItem('studyflow_access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('studyflow_refresh_token', refreshToken);
          }

          // Fetch user profile
          const res = await api.me();
          if (res?.user) {
            localStorage.setItem('studyflow_user', JSON.stringify(res.user));
          }

          // Redirect to main application dashboard
          navigate('/', { replace: true });
          window.location.reload(); // Reload to refresh auth context cleanly
          return;
        }

        // If no token, return to login
        navigate('/login', { replace: true });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to finalize session.');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center p-space-md">
      {errorMsg ? (
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-xl border border-surface-container text-center">
          <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">error</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">Authentication Error</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">{errorMsg}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <span className="font-label-lg text-label-lg text-on-surface">Finalizing authentication...</span>
        </div>
      )}
    </div>
  );
};
