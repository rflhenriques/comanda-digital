import { useEffect, useState } from 'react';
import { ChefHat, Clock, CheckCircle2, AlertTriangle, Loader2, UtensilsCrossed } from 'lucide-react';
import api from '../services/api';

// --- Tipagens ---
interface Produto { id: string; nome: string; }
interface Item { id: string; quantidade: number; observacao: string; produto: Produto; }
interface Comanda { id: string; mesa?: { numero: number }; status: string; aberta_em: string; itens: Item[]; }

export default function Dashboard() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [botaoCarregando, setBotaoCarregando] = useState<string | null>(null);

  const restauranteId = "5d5748f8-f621-4d5d-b8e5-d363884627f1";

  async function buscarPedidos() {
    try {
      const response = await api.get(`/comandas?restaurante_id=${restauranteId}`);
      const lista = Array.isArray(response.data) ? response.data : [];
      // A cozinha só vê o que está ABERTA (sendo consumido/preparado)
      setComandas(lista.filter((c: Comanda) => c.status === 'ABERTA'));
    } catch (error) {
      console.error("Erro ao buscar pedidos da cozinha", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarPedidos();
    const intervalo = setInterval(buscarPedidos, 10000); // Atualiza a cada 10s
    return () => clearInterval(intervalo);
  }, []);

  async function marcarComoPronto(id: string) {
    setBotaoCarregando(id);
    try {
      await api.patch(`/comandas/${id}/concluir`);
      // Ao invés de esperar os 10s, já remove da tela imediatamente para o cozinheiro
      setComandas(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert("Erro ao atualizar o pedido.");
      console.error(error);
    } finally {
      setBotaoCarregando(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
      
      {/* HEADER DA COZINHA */}
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 shadow-sm z-10 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-4">
          <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <ChefHat size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Cozinha Digital</h1>
            <p className="text-slate-400 text-sm font-medium mt-0.5">Pedidos em tempo real</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fila de Preparo</p>
            <p className="text-xl font-black text-white">{comandas.length} Pedidos</p>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></span>
            AO VIVO
          </div>
        </div>
      </header>

      {/* ÁREA DOS PEDIDOS (GRID) */}
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {carregando ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-rose-500">
            <Loader2 className="animate-spin mb-4" size={50} />
            <p className="font-bold text-slate-400 text-lg">Buscando comandas...</p>
          </div>
        ) : comandas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-600 animate-in fade-in duration-700">
            <div className="bg-slate-900 p-8 rounded-full border border-slate-800 mb-6 shadow-xl shadow-black/50">
              <UtensilsCrossed size={64} className="text-slate-700" />
            </div>
            <h2 className="text-3xl font-black text-slate-500 tracking-tight">Cozinha Limpa!</h2>
            <p className="font-medium text-slate-600 mt-2 text-lg">Nenhum pedido na fila de preparo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {comandas.map(comanda => (
              <div 
                key={comanda.id} 
                className="bg-slate-900 rounded-[28px] border border-slate-800 flex flex-col shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-300"
              >
                {/* CABEÇALHO DO TICKET */}
                <div className="bg-slate-800/50 p-5 border-b border-slate-800 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pedido</span>
                    <h3 className="text-2xl font-black text-white leading-none mt-1">
                      MESA {comanda.mesa?.numero || 'S/N'}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <Clock size={16} className="text-slate-500 mb-1" />
                    <span className="text-sm font-bold text-slate-300 font-mono">
                      {new Date(comanda.aberta_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* LISTA DE ITENS DO TICKET */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  {comanda.itens.map((item, idx) => (
                    <div key={item.id} className={`${idx !== comanda.itens.length - 1 ? 'border-b border-slate-800/60 pb-4' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-800 text-emerald-400 font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-700">
                          {item.quantidade}x
                        </div>
                        <div className="pt-1">
                          <p className="font-bold text-slate-200 text-lg leading-tight">{item.produto?.nome}</p>
                          
                          {/* BLOCO DE OBSERVAÇÃO GRITANTE */}
                          {item.observacao && (
                            <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
                              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-sm font-bold text-amber-400 leading-snug">
                                {item.observacao.toUpperCase()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BOTÃO DE PRONTO */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                  <button 
                    onClick={() => marcarComoPronto(comanda.id)}
                    disabled={botaoCarregando === comanda.id}
                    className="w-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 group"
                  >
                    {botaoCarregando === comanda.id ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" /> 
                        PEDIDO PRONTO
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}