import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';
import Promotions from './pages/Promotions';
import DevArea from './pages/DevArea';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const sessao = localStorage.getItem('auth_sessao');
  
  if (!sessao) {
    return <Navigate to="/login" replace />;
  }

  try {
    const dados = JSON.parse(sessao);
    if (!dados.usuario) return <Navigate to="/login" replace />;
    return children;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/vendas" replace />} />
          
          <Route path="vendas" element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          } />
          
          <Route path="estoque" element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } />
          
          <Route path="gerencia" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="promocoes" element={
            <ProtectedRoute>
              <Promotions />
            </ProtectedRoute>
          } />
          
          <Route path="dev" element={
            <ProtectedRoute>
              <DevArea />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
