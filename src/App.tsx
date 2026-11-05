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

// Smart Home route: shows Onboarding & Setup if first visit, or Dashboard if completed
function SmartRootRoute() {
  const { isOnboarded } = useKitchen();

  if (!isOnboarded) {
    return <OnboardingPage />;
  }

  return <HomePage />;
}

export function App() {
  return (
    <KitchenProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth & Dedicated Onboarding Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Application Layout Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<SmartRootRoute />} />
            <Route path="kitchen" element={<MyKitchenPage />} />
            <Route path="eat-now" element={<EatNowPage />} />
            <Route path="groceries" element={<GroceriesPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </KitchenProvider>
  );
}

export default App;
