import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🚀 NOVO: Serve para mudar de página
import api from '../services/api'; // 🚀 NOVO: Nossa ponte com o servidor

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  // 🚀 Função atualizada: Agora ela fala com o servidor!
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      // 1. Bate na porta do servidor pedindo para entrar
      const response = await api.post('/auth/login', { 
        email: email, 
        senha: senha 
      });

      // 2. O servidor deixou entrar! Pegamos o crachá (token) e guardamos no cofre
      const cracha = response.data.access_token;
      localStorage.setItem('@Comanda:token', cracha);

      // 3. Avisamos que deu certo e mandamos o gerente para o painel
      alert('✅ Login feito com sucesso!');
      navigate('/gerente');

    } catch (error) {
      console.error(error);
      alert('❌ Erro ao fazer login. Verifique seu e-mail e senha!');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800">Acesso Restrito</h1>
          <p className="text-gray-500 mt-2">Faça login para gerenciar o cardápio</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-gray-600 ml-2">E-mail</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 mt-1 outline-none focus:border-red-400 transition-colors" 
              placeholder="gerente@pizzaria.com" 
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600 ml-2">Senha</label>
            <input 
              required 
              type="password" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 mt-1 outline-none focus:border-red-400 transition-colors" 
              placeholder="******" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-red-600 text-white font-black p-4 rounded-2xl hover:bg-red-700 active:scale-95 transition-all mt-4"
          >
            ENTRAR NO SISTEMA
          </button>
        </form>

      </div>
    </div>
  );
}