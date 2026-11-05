import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { useKitchen } from '../context/KitchenContext';
import { Clock, Sparkles, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, updateUserProfile, completeOnboarding } = useKitchen();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const supabase = getSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName }
            }
          });
          if (error) throw error;
          if (fullName) {
            updateUserProfile({ full_name: fullName, email });
          }
          showToast('Account created! Welcome to Kitchen Companion.', 'success');
          await completeOnboarding({ full_name: fullName, email });
          navigate('/');
        } else if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          const userMeta = data.user?.user_metadata;
          if (userMeta?.full_name) {
            updateUserProfile({ full_name: userMeta.full_name, email });
          }
          showToast('Welcome back to Kitchen Companion!', 'success');
          await completeOnboarding({ full_name: userMeta?.full_name || fullName, email });
          navigate('/');
        } else if (mode === 'forgot') {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw error;
          setSuccessMsg('Password reset instructions sent to your email.');
          showToast('Password reset link sent', 'info');
        }
      } else {
        // Fallback local session login
        updateUserProfile({
          full_name: fullName || 'Mindful Chef',
          email: email || 'chef@kitchencompanion.app'
        });
        showToast('Signed in successfully (Offline-First Persistent Session)', 'success');
        await completeOnboarding({ full_name: fullName || 'Mindful Chef', email: email || 'chef@kitchencompanion.app' });
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    if (!isSupabaseConfigured()) {
      showToast('OAuth requires Supabase configuration', 'warning');
      return;
    }
    if (!supabase) return;
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
    } catch (err: any) {
      showToast(err.message || 'OAuth login failed', 'error');
    }
  };

  const handleGuestExplore = async () => {
    updateUserProfile({
      full_name: 'Aditi Rao',
      email: 'aditi.rao@example.com'
    });
    showToast('Exploring Kitchen Companion as guest!', 'success');
    await completeOnboarding({ full_name: 'Aditi Rao', email: 'aditi.rao@example.com' }, undefined, true);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand */}
        <div className="w-14 h-14 rounded-2xl bg-sage-800 text-cream-100 flex items-center justify-center mx-auto shadow-elevated mb-4">
          <Clock className="w-8 h-8 text-cream-100" />
        </div>
        <h2 className="font-editorial text-4xl text-ink-primary font-normal">Kitchen Companion</h2>
        <p className="text-sm text-ink-secondary mt-1 font-serif italic">
          Consume with intention. Waste less.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl border border-cream-300 sm:px-10 space-y-6">
          {/* OAuth Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full py-2.5 px-4 rounded-xl border border-ink-border hover:bg-cream-50 text-sm font-medium text-ink-primary transition flex items-center justify-center gap-2.5 shadow-soft"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('apple')}
              className="w-full py-2.5 px-4 rounded-xl border border-ink-border hover:bg-cream-50 text-sm font-medium text-ink-primary transition flex items-center justify-center gap-2.5 shadow-soft"
            >
              <AppleIcon />
              <span>Continue with Apple</span>
            </button>
            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-cream-200" />
              <span className="text-xs text-ink-secondary">or</span>
              <div className="flex-1 h-px bg-cream-200" />
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-cream-200 text-xs">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 font-semibold text-center border-b-2 transition ${
                mode === 'login'
                  ? 'border-sage-800 text-sage-900'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 font-semibold text-center border-b-2 transition ${
                mode === 'signup'
                  ? 'border-sage-800 text-sage-900'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => {
                setMode('forgot');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 font-semibold text-center border-b-2 transition ${
                mode === 'forgot'
                  ? 'border-sage-800 text-sage-900'
                  : 'border-transparent text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Reset
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-tomato-50 border border-tomato-200 text-xs text-tomato-800">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-800">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
            {mode === 'signup' && (
              <div>
                <label className="block font-medium text-ink-primary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan or Aditi Rao"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sage-700" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block font-medium text-ink-primary mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sage-700" />
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-cream-50 focus:ring-2 focus:ring-sage-400 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-semibold text-xs md:text-sm transition shadow-soft disabled:opacity-50 mt-2"
            >
              {isLoading
                ? 'Processing...'
                : mode === 'signup'
                ? 'Join Kitchen Companion'
                : mode === 'forgot'
                ? 'Send Reset Instructions'
                : 'Sign In to Your Kitchen'}
            </button>
          </form>

          {/* Skip for now — Guest explore */}
          <div className="pt-4 border-t border-cream-200 text-center">
            <button
              type="button"
              onClick={handleGuestExplore}
              className="text-xs text-ink-secondary hover:text-ink-primary underline underline-offset-4 transition"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
