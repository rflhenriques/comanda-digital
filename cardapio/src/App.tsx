import { Routes, Route, Navigate } from 'react-router-dom';

// Importando as páginas
import Cardapio from './pages/Cardapio';
import Dashboard from './pages/Dashboard'; 
import Caixa from './pages/Caixa';
import Login from './pages/Login'; // 🚀 Importamos a tela de Login aqui!
import Gerenciamento from './pages/Gerenciamento';
import Garcom from './pages/Garcom';

export default function App() {
  return (
    <Routes>
      {/* Rota do Cliente */}
      <Route path="/mesa/:numeroMesa" element={<Cardapio />} />
      
      {/* Rota da Cozinha */}
      <Route path="/cozinha" element={<Dashboard />} />
      
      {/* 🚀 A Rota do Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rota do Caixa */}
      <Route path="/caixa" element={<Caixa />} />

      {/* Redirecionamento de segurança */}
      <Route path="*" element={<Navigate to="/mesa/1" replace />} />

      <Route path="/gerenciamento" element={<Gerenciamento />} />

      <Route path="/garcom" element={<Garcom />} />
    </Routes>
  );
}