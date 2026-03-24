import { useEffect, useState } from 'react';
import { Wallet, Receipt, CheckCircle, X, CreditCard, Banknote, QrCode, Loader2, Utensils, AlertTriangle, Table } from 'lucide-react';
import api from '../services/api';

interface Comanda { id: string; mesa?: { numero: number }; status: string; aberta_em: string; }
interface ItemExtrato { produto: string; quantidade: number; preco_unitario: number; total: number; observacao?: string; }
interface ContaDetalhada { comandas_ids: string[]; mesa: number | string; itens: ItemExtrato[]; resumo: { subtotal: number; taxa_servico: number; total_a_pagar: number; }; }

export default function Caixa() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [contaSelecionada, setContaSelecionada] = useState<ContaDetalhada | null>(null);
  const [painelAberto, setPainelAberto] = useState(false);
  const [carregandoConta, setCarregandoConta] = useState(false);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<'PIX' | 'CARTAO' | 'DINHEIRO'>('CARTAO');

  const restauranteId = "5d5748f8-f621-4d5d-b8e5-d363884627f1";

  async function buscarComandas() {
    try {
      const response = await api.get(`/comandas?restaurante_id=${restauranteId}`);
      const lista = Array.isArray(response.data) ? response.data : [];
      
      // 🚀 MÁGICA AQUI: Mostra TUDO, a não ser que esteja PAGA ou CANCELADA
      setComandas(lista.filter((c: Comanda) => c.status !== 'PAGA' && c.status !== 'CANCELADA'));
    } catch (error) { 
      console.error("Erro ao buscar comandas:", error); 
    } finally { 
      setCarregando(false); 
    }
  }

  useEffect(() => {
    buscarComandas();
    const intervalo = setInterval(buscarComandas, 15000);
    return () => clearInterval(intervalo);
  }, []);

// 🚀 AGRUPADOR DE MESAS
  const mesasAgrupadas = comandas.reduce((acc: any, comanda) => {
    const num = comanda.mesa?.numero || 'Avulso';
    if (!acc[num]) {
      acc[num] = { numero: num, comandas: [], status_geral: 'ABERTA', ultima_atualizacao: comanda.aberta_em };
    }
    acc[num].comandas.push(comanda);
    
    // 🚀 Se a cozinha alterou o status para qualquer coisa diferente de ABERTA, pinta de laranja!
    if (comanda.status !== 'ABERTA') {
      acc[num].status_geral = 'AGUARDANDO_PAGAMENTO';
    }
    
    return acc;
  }, {});
  
  const mesasArray = Object.values(mesasAgrupadas);

  // 🚀 BUSCA O EXTRATO DE TODOS OS TICKETS E SOMA TUDO
  async function abrirResumoMesa(mesaAgrupada: any) {
    setPainelAberto(true);
    setCarregandoConta(true);
    try {
      const requests = mesaAgrupada.comandas.map((c: any) => api.get(`/comandas/${c.id}/conta`));
      const responses = await Promise.all(requests);
      
      const contaSomada: ContaDetalhada = {
        mesa: mesaAgrupada.numero,
        comandas_ids: mesaAgrupada.comandas.map((c: any) => c.id),
        itens: [],
        resumo: { subtotal: 0, taxa_servico: 0, total_a_pagar: 0 }
      };
      
      responses.forEach(res => {
        contaSomada.itens.push(...res.data.itens);
        contaSomada.resumo.subtotal += res.data.resumo.subtotal;
        contaSomada.resumo.taxa_servico += res.data.resumo.taxa_servico;
        contaSomada.resumo.total_a_pagar += res.data.resumo.total_a_pagar;
      });
      
      setContaSelecionada(contaSomada);
    } catch (error) {
      alert("Erro ao buscar detalhes da conta.");
      setPainelAberto(false);
    } finally { setCarregandoConta(false); }
  }

  function fecharPainel() {
    setPainelAberto(false);
    setTimeout(() => setContaSelecionada(null), 300);
  }

  // 🚀 FECHA TODOS OS TICKETS DA MESA AO MESMO TEMPO
  async function finalizarPagamento() {
    if (!contaSelecionada) return;
    setProcessandoPagamento(true);
    try {
      const requests = contaSelecionada.comandas_ids.map(id => api.patch(`/comandas/${id}/fechar`));
      await Promise.all(requests); // Espera todas as continhas fecharem
      
      fecharPainel();
      await buscarComandas();
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) { alert("🔒 Acesso Negado: Faça login."); } 
      else { alert("❌ Erro ao processar o pagamento."); }
    } finally { setProcessandoPagamento(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col overflow-hidden">
      
      {/* HEADER CAIXA */}
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 shadow-sm z-10 flex justify-between items-center relative">
        <div className="absolute top-0 left-10 w-48 h-20 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400 shadow-lg shadow-emerald-900/20">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">Caixa</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Visão Geral do Salão</p>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mesas Ocupadas</p>
            <p className="text-xl font-black text-white">{mesasArray.length}</p>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
            CAIXA ABERTO
          </div>
        </div>
      </header>

      {/* SALÃO COM MESAS AGRUPADAS */}
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {carregando ? (
          <div className="flex flex-col items-center justify-center h-full text-emerald-500">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold text-slate-400">Carregando salão...</p>
          </div>
        ) : mesasArray.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <Utensils size={64} className="mb-4 text-slate-700" />
            <h2 className="text-2xl font-bold text-slate-500">Salão Vazio</h2>
            <p className="font-medium text-slate-600">Nenhuma mesa ocupada no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {mesasArray.map((mesa: any) => {
              const isPronta = mesa.status_geral === 'AGUARDANDO_PAGAMENTO';
              return (
                <button 
                  key={mesa.numero}
                  onClick={() => abrirResumoMesa(mesa)}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-[24px] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl border border-slate-800 group aspect-[10/9] overflow-hidden
                    ${isPronta 
                      ? 'bg-orange-500/10 border-orange-500/40 shadow-orange-900/20 hover:border-orange-500 hover:bg-orange-500/20' 
                      : 'bg-slate-900 shadow-black/40 hover:border-blue-500/50 hover:bg-slate-800'
                    }
                  `}
                >
                  {isPronta && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 rounded-bl-full blur-xl"></div>
                  )}

                  {isPronta && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-2 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)] z-10">
                      <AlertTriangle size={14} />
                    </div>
                  )}

                  <div className="flex-grow flex flex-col items-center justify-center mb-6 relative z-10">
                    <Table className={`w-10 h-10 mb-2 transition-colors ${isPronta ? 'text-orange-400' : 'text-slate-600 group-hover:text-blue-400'}`} />
                    <h3 className={`text-3xl font-black tracking-tight ${isPronta ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      MESA {mesa.numero}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">{mesa.comandas.length} Tickets</p>
                  </div>

                  <div className="w-full flex flex-col items-center gap-3 mt-auto relative z-10">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border
                      ${isPronta 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30'
                      }
                    `}>
                      {isPronta ? 'Fechar Conta' : 'Consumindo'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* PAINEL LATERAL DIREITO (SLIDE-OVER) */}
      {painelAberto && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={fecharPainel}></div>}
      
      <aside className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-slate-900 border-l border-slate-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${painelAberto ? 'translate-x-0' : 'translate-x-full'}`}>
        {carregandoConta || !contaSelecionada ? (
          <div className="flex flex-col items-center justify-center h-full text-emerald-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold text-slate-400">Consolidando tickets...</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-950 p-8 text-white relative flex-shrink-0 border-b border-slate-800">
              <button onClick={fecharPainel} className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
              <div className="absolute top-0 right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-3 mb-1">
                <Receipt size={24} className="text-emerald-400" />
                <h2 className="text-3xl font-black">Mesa {contaSelecionada.mesa}</h2>
              </div>
              <p className="text-slate-500 font-medium text-xs mt-1 bg-slate-800 inline-block px-2 py-1 rounded border border-slate-700">Conta Unificada ({contaSelecionada.comandas_ids.length} Tickets)</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-900">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Detalhes do Consumo</h4>
              <div className="space-y-4">
                {contaSelecionada.itens.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-slate-200 leading-tight">
                        <span className="text-emerald-400 mr-1">{item.quantidade}x</span> {item.produto}
                      </p>
                      {item.observacao && <p className="text-[11px] text-slate-400 mt-1.5 font-medium bg-slate-800 px-2.5 py-1 rounded border border-slate-700 inline-block">Obs: {item.observacao}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">R$ {item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-950 border-t border-slate-800 flex-shrink-0">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-slate-400 font-medium">
                  <span>Subtotal</span><span>R$ {contaSelecionada.resumo.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-medium">
                  <span>Taxa de Serviço (10%)</span><span>R$ {contaSelecionada.resumo.taxa_servico.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-slate-800">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total a Pagar</span>
                  <span className="text-4xl font-black text-emerald-400 tracking-tighter">R$ {contaSelecionada.resumo.total_a_pagar.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {[{ id: 'PIX', icon: QrCode, label: 'Pix' }, { id: 'CARTAO', icon: CreditCard, label: 'Cartão' }, { id: 'DINHEIRO', icon: Banknote, label: 'Dinheiro' }].map(metodo => (
                  <button
                    key={metodo.id}
                    onClick={() => setMetodoPagamento(metodo.id as any)}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all font-bold text-[11px] uppercase tracking-wider gap-1.5
                      ${metodoPagamento === metodo.id 
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]' 
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <metodo.icon size={18} className={metodoPagamento === metodo.id ? 'text-emerald-400' : 'text-slate-500'} />
                    {metodo.label}
                  </button>
                ))}
              </div>

              <button 
                onClick={finalizarPagamento} disabled={processandoPagamento}
                className="w-full bg-emerald-600 text-white p-5 rounded-[20px] font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-500 active:scale-95 transition-all shadow-[0_0_30px_rgba(5,150,105,0.4)] disabled:opacity-70 disabled:active:scale-100"
              >
                {processandoPagamento ? <Loader2 className="animate-spin" size={24} /> : <><CheckCircle size={24} /> RECEBER PAGAMENTO</>}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}