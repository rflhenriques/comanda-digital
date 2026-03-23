import { Routes, Route, Navigate } from 'react-router-dom';
import Cardapio from './pages/Cardapio';

// Futuramente importaremos aqui o Gerenciamento e Login
// import Gerenciamento from './pages/Gerenciamento';

export default function App() {
  return (
    <Routes>
      {/* Redireciona a página inicial para a mesa 01 (opcional) */}
      <Route path="/" element={<Navigate to="/mesa/01" />} />
      
      {/* Rota do Cardápio do Cliente */}
      <Route path="/mesa/:numeroMesa" element={<Cardapio />} />

      {/* 🚀 Próximo Passo: Criar a rota do Gerente */}
      {/* <Route path="/gerente" element={<Gerenciamento />} /> */}
    </Routes>
  );
}