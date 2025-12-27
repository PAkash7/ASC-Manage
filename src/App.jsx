import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Transactions from './pages/Transactions';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();
  // For demo/dev ease, uncommment next line to bypass login
  // return children; 
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute>
          <Layout>
            <Inventory />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute>
          <Layout>
            <Billing />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <Layout>
            <Transactions />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
