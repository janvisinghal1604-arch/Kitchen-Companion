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

function AppContent() {
  const { isOnboarded } = useKitchen();

  // If user hasn't completed onboarding, render ONLY the full-screen onboarding flow
  // (Splash -> Onboarding Features -> Personalized Preferences -> Kitchen Setup).
  // No App Header, No Sidebar, No Bottom Navigation.
  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  // Once onboarded, render the complete Kitchen Companion app with AppLayout (Header, Sidebar, BottomNav)
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Main Application Routes inside AppLayout */}
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
