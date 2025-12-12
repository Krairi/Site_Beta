import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Receipts from './pages/Receipts';
import Consumption from './pages/Consumption';
import Subscriptions from './pages/Subscriptions';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-givd-mint">Chargement GIVD...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/stock" element={
            <ProtectedRoute>
              <Stock />
            </ProtectedRoute>
          } />
          
          <Route path="/receipts" element={
            <ProtectedRoute>
              <Receipts />
            </ProtectedRoute>
          } />
          
          <Route path="/consumption" element={
            <ProtectedRoute>
              <Consumption />
            </ProtectedRoute>
          } />
          
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;