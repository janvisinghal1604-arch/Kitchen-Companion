import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { useKitchen } from '../context/KitchenContext';
import { Clock, Sparkles, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, updateUserProfile } = useKitchen();

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
          navigate('/');
        } else if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          showToast('Welcome back to Kitchen Companion!', 'success');
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
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestExplore = () => {
    updateUserProfile({
      full_name: 'Aditi Rao',
      email: 'aditi.rao@example.com'
    });
    showToast('Logged in as Mindful Explorer with Bengaluru sample pantry!', 'success');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
                  placeholder="e.g. Aditi Rao"
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
                placeholder="you@example.com"
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

          {/* Quick Demo Explorer Login */}
          <div className="pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={handleGuestExplore}
              className="w-full py-2.5 px-4 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-primary text-xs font-semibold border border-ink-border/80 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sage-800" />
              <span>Explore Instant Demo Kitchen (1-Click)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
