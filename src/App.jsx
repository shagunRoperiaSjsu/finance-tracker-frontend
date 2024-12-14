import { BrowserRouter } from 'react-router-dom';
import { AppShell, AppShellNavbar, AppShellHeader, AppShellMain } from '@mantine/core';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Dashboard from './components/Dashboard/Dashboard';
import Transactions from './components/Transactions/Transactions';
import Reports from './components/Reports/Reports';
import AppHeader from './components/Layout/AppHeader';
import AppNavbar from './components/Layout/AppNavbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

function AppLayout() {
  const [opened, setOpened] = useState(false);
  const { user } = useAuth();

  // If user is not logged in, render a simple AppShell without navbar and header
  if (!user) {
    return (
      <AppShell padding="md">
        <AppShellMain>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/signin" />} />
          </Routes>
        </AppShellMain>
      </AppShell>
    );
  }

  // If user is logged in, render the full AppShell with navbar and header
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShellHeader>
        <AppHeader opened={opened} setOpened={setOpened} />
      </AppShellHeader>

      <AppShellNavbar>
        <AppNavbar />
      </AppShellNavbar>

      <AppShellMain>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AppShellMain>
    </AppShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
