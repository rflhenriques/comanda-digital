import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, Utensils } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const response = await api.post('/auth/login', { email, senha });
      localStorage.setItem('@Comanda:token', response.data.access_token);
      localStorage.setItem('@Comanda:user', JSON.stringify(response.data.usuario));
      navigate('/caixa');
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Elementos de fundo abstratos */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl shadow-black/50 overflow-hidden relative z-10">
        
        {/* Cabeçalho */}
        <div className="bg-slate-900 p-8 text-center border-b border-slate-800">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)] transform rotate-3">
            <Utensils size={32} className="text-emerald-400 -rotate-3" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Acesso Restrito</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Painel do Gerente / Caixa</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          {erro && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm font-bold border border-red-500/20 flex items-center gap-2">
              <Lock size={16} /> {erro}
            </div>
          )}

          <form onSubmit={fazerLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-500" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                  placeholder="gerente@pizzaria.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={20} />
                <input 
                  type="password" 
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={carregando}
              className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-emerald-500 active:scale-95 transition-all shadow-[0_0_20px_rgba(5,150,105,0.3)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {carregando ? <Loader2 className="animate-spin" size={24} /> : 'ENTRAR NO SISTEMA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}