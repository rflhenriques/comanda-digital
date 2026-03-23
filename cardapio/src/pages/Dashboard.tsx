import { useEffect, useState } from 'react';
import { ChefHat, Check, Clock, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

interface Produto { nome: string; }
interface ItemComanda { 
  id: string; 
  quantidade: number; 
  observacao?: string; 
  produto: Produto; 
}
interface Comanda { 
  id: string; 
  mesa?: { numero: number };
  status: string; 
  aberta_em: string;
  itens: ItemComanda[]; 
}

export default function Dashboard() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [carregando, setCarregando] = useState(true);

  const restauranteId = "5d5748f8-f621-4d5d-b8e5-d363884627f1";

  async function buscarComandas() {
    try {
      const response = await api.get(`/comandas?restaurante_id=${restauranteId}`);
      const lista = Array.isArray(response.data) ? response.data : [];
      setComandas(lista.filter((c: Comanda) => c.status === 'ABERTA'));
    } catch (error) {
      console.error("Erro ao buscar comandas:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarComandas();
    const intervalo = setInterval(buscarComandas, 10000);
    return () => clearInterval(intervalo);
  }, []);

  async function concluirPedido(id: string, mesaNumero?: number) {
    try {
      await api.patch(`/comandas/${id}/concluir`);
      // ✅ Usando mesaNumero aqui para remover o aviso
      console.log(`Pedido da mesa ${mesaNumero} concluído`); 
      buscarComandas();
    } catch (error) {
      console.error(error);
      alert("Erro ao concluir pedido.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 font-sans text-gray-100">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center border-b border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-3 rounded-2xl text-white">
            <ChefHat size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Cozinha</h1>
            <p className="text-gray-400 font-medium">Pedidos em tempo real</p>
          </div>
        </div>
        
        <button onClick={buscarComandas} className="flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-700 transition-all font-bold">
          <RefreshCw size={16} className={carregando ? "animate-spin" : ""} />
          Atualizar
        </button>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* ✅ Usando Loader2 aqui para remover o aviso */}
        {carregando ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-red-600" size={48} />
          </div>
        ) : comandas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <Check size={64} className="mb-4 text-gray-700" />
            <h2 className="text-2xl font-bold">Cozinha limpa!</h2>
            <p>Nenhum pedido pendente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comandas.map(comanda => (
              <div key={comanda.id} className="bg-gray-800 rounded-[32px] p-6 border border-gray-700 shadow-xl flex flex-col relative overflow-hidden animate-in zoom-in duration-300">
                <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
                
                <div className="flex justify-between items-start mb-6 mt-2">
                  <span className="bg-red-500/10 text-red-500 font-black px-4 py-1 rounded-xl text-xl border border-red-500/20">
                    Mesa {comanda.mesa?.numero || 'S/N'}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                    <Clock size={14} />
                    {new Date(comanda.aberta_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {comanda.itens?.map((item, index) => (
                    <div key={index} className="border-b border-gray-700/50 pb-3 last:border-0">
                      <div className="flex gap-3">
                        <span className="bg-gray-700 text-white font-black w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
                          {item.quantidade}x
                        </span>
                        <p className="font-bold text-lg text-gray-200 leading-tight">{item.produto?.nome}</p>
                      </div>
                      {item.observacao && (
                        <div className="ml-11 mt-2 text-amber-400 text-sm font-bold bg-amber-400/10 p-2 rounded-lg border border-amber-400/20 flex items-start gap-1">
                          <AlertCircle size={14} className="shrink-0 mt-0.5" />
                          <span>{item.observacao}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => concluirPedido(comanda.id, comanda.mesa?.numero)}
                  className="w-full bg-green-600 text-white font-black p-4 rounded-2xl hover:bg-green-500 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Check size={20} /> PRONTO
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}