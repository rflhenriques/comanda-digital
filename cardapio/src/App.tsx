import { Routes, Route, Navigate } from 'react-router-dom';
import Cardapio from './pages/Cardapio';
import Gerenciamento from './pages/Gerenciamento';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // 🚀 IMPORTAMOS O DASHBOARD

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mesa/01" />} />
      <Route path="/mesa/:numeroMesa" element={<Cardapio />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/gerente" element={<Gerenciamento />} />
      
      {/* 🚀 NOVA ROTA PARA A COZINHA */}
      <Route path="/cozinha" element={<Dashboard />} />
    </Routes>
  );
}