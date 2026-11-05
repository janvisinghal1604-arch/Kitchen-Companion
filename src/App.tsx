import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { KitchenProvider, useKitchen } from './context/KitchenContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { MyKitchenPage } from './pages/MyKitchenPage';
import { EatNowPage } from './pages/EatNowPage';
import { GroceriesPage } from './pages/GroceriesPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { Clock } from 'lucide-react';

function AppContent() {
  const { isOnboarded, isAuthChecking } = useKitchen();

  // Show a minimal loading screen while checking for an existing Supabase auth session.
  // This prevents a flash of the onboarding screen for returning authenticated users
  // whose session is still being verified asynchronously.
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sage-800 flex items-center justify-center mx-auto shadow-elevated animate-pulse">
            <Clock className="w-8 h-8 text-cream-100" />
          </div>
          <p className="text-sm text-ink-secondary font-medium">Preparing your kitchen…</p>
        </div>
      </div>
    );
  }

  // If user hasn't completed onboarding (first-time visitor or logged-out user),
  // render ONLY the full-screen onboarding flow:
  //   Splash → Login/Signup → (auth success → Dashboard) OR (skip → Feature Tour → Prefs → Setup → Dashboard)
  // No App Header, No Sidebar, No Bottom Navigation during onboarding.
  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  // Once onboarded (authenticated or guest-completed), render the full Kitchen Companion app.
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Main Application Routes inside AppLayout (Header, Sidebar, BottomNav) */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="kitchen" element={<MyKitchenPage />} />
        <Route path="eat-now" element={<EatNowPage />} />
        <Route path="groceries" element={<GroceriesPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <KitchenProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </KitchenProvider>
  );
}

export default App;
