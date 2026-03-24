import { useEffect, useState, useMemo } from 'react';
import { ShoppingBag, Plus, Minus, Utensils, Search, ArrowLeft, AlertCircle, Hash, MessageSquare, Loader2, CheckCircle, User, Fingerprint } from 'lucide-react';
import api from '../services/api';

interface Categoria { id: string; nome: string; }
interface Produto { id: string; nome: string; preco: number; descricao: string; imagem?: string; categoria: Categoria; }
interface ItemCarrinho extends Produto { quantidade: number; observacao: string; }
interface Comanda { id: string; mesa?: { numero: number }; status: string; cliente?: { nome: string; cpf: string }; }
interface ContaDetalhada { comandas_ids: string[]; itens: any[]; resumo: { subtotal: number; taxa_servico: number; total_a_pagar: number; }; }

export default function Garcom() {
  // Estados de Navegação: MAPA -> CHECKIN -> PEDIDO ou CONTA
  const [modo, setModo] = useState<'MAPA_MESAS' | 'CHECKIN' | 'LANCAR_PEDIDO' | 'VER_CONTA'>('MAPA_MESAS');
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  
  // Estados de Dados
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [comandasAtivas, setComandasAtivas] = useState<Comanda[]>([]);
  const [contaMesa, setContaMesa] = useState<ContaDetalhada | null>(null);
  
  // Estados de Identificação (Check-in)
  const [nomeInput, setNomeInput] = useState('');
  const [cpfInput, setCpfInput] = useState('');

  // Estados de UI
  const [enviando, setEnviando] = useState(false);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  
  const restauranteId = "5d5748f8-f621-4d5d-b8e5-d363884627f1";
  const totalMesas = 20;

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(carregarDados, 10000);
    return () => clearInterval(intervalo);
  }, []);

  async function carregarDados() {
    try {
      const [resProd, resCom] = await Promise.all([
        api.get(`/produtos?restaurante_id=${restauranteId}`),
        api.get(`/comandas?restaurante_id=${restauranteId}`)
      ]);
      setProdutos(resProd.data);
      setComandasAtivas(Array.isArray(resCom.data) ? resCom.data : []);
    } catch (error) { console.error("Erro ao carregar dados"); }
  }

  function mostrarErro(msg: string) {
    setErro(msg);
    setTimeout(() => setErro(null), 4000);
  }

  // 🚀 INICIAR ATENDIMENTO (CHECK-IN)
  async function realizarCheckin(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post('/comandas', { 
        restaurante_id: restauranteId, 
        mesa_numero: mesaSelecionada,
        cpf: cpfInput.replace(/\D/g, ''),
        nome: nomeInput,
        itens: [] 
      });
      setModo('LANCAR_PEDIDO');
      carregarDados();
    } catch (err: any) {
      mostrarErro(err.response?.data?.message || "Erro ao abrir mesa.");
    } finally { setEnviando(false); }
  }

  // 🚀 BUSCA A CONTA CONSOLIDADA
  async function abrirContaMesa(num: number) {
    setMesaSelecionada(num);
    try {
      const ticketsMesa = comandasAtivas.filter(c => c.mesa?.numero === num);
      const responses = await Promise.all(ticketsMesa.map(c => api.get(`/comandas/${c.id}/conta`)));
      
      const contaSomada: ContaDetalhada = {
        comandas_ids: ticketsMesa.map(c => c.id),
        itens: [],
        resumo: { subtotal: 0, taxa_servico: 0, total_a_pagar: 0 }
      };
      
      responses.forEach(res => {
        contaSomada.itens.push(...res.data.itens);
        contaSomada.resumo.subtotal += res.data.resumo.subtotal;
        contaSomada.resumo.taxa_servico += res.data.resumo.taxa_servico;
        contaSomada.resumo.total_a_pagar += res.data.resumo.total_a_pagar;
      });
      
      setContaMesa(contaSomada);
      setModo('VER_CONTA');
    } catch (error) { mostrarErro("Erro ao carregar conta."); }
  }

  // 🚀 FINALIZA PAGAMENTO
  async function finalizarPagamento() {
    if (!contaMesa) return;
    setEnviando(true);
    try {
      await Promise.all(contaMesa.comandas_ids.map(id => api.patch(`/comandas/${id}/fechar`)));
      setModo('MAPA_MESAS');
      setContaMesa(null);
      carregarDados();
    } catch (error) { mostrarErro("Erro ao fechar conta."); }
    finally { setEnviando(false); }
  }

  // Funções de Carrinho
  function adicionarAoCarrinho(p: Produto) {
    setCarrinho(prev => {
      const existe = prev.find(i => i.id === p.id);
      if (existe) return prev.map(i => i.id === p.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...prev, { ...p, quantidade: 1, observacao: "" }];
    });
  }

  function removerDoCarrinho(id: string) {
    setCarrinho(prev => prev.map(i => i.id === id ? { ...i, quantidade: Math.max(0, i.quantidade - 1) } : i).filter(i => i.quantidade > 0));
  }

  function atualizarObservacao(id: string, texto: string) {
    setCarrinho(prev => prev.map(item => item.id === id ? { ...item, observacao: texto } : item));
  }

  const totalCarrinho = useMemo(() => carrinho.reduce((acc, i) => acc + (Number(i.preco) * i.quantidade), 0), [carrinho]);
  const totalItens = useMemo(() => carrinho.reduce((acc, i) => acc + i.quantidade, 0), [carrinho]);

  async function lancarPedido() {
    if (carrinho.length === 0 || !mesaSelecionada) return;
    setEnviando(true);
    try {
      // Busca o CPF da mesa já aberta para vincular o pedido corretamente
      const mesaAberta = comandasAtivas.find(c => c.mesa?.numero === mesaSelecionada);
      await api.post('/comandas', { 
        restaurante_id: restauranteId, 
        mesa_numero: mesaSelecionada,
        cpf: mesaAberta?.cliente?.cpf || '',
        itens: carrinho.map(i => ({ produto_id: i.id, quantidade: i.quantidade, observacao: i.observacao })) 
      });
      setCarrinho([]);
      setModo('MAPA_MESAS');
      carregarDados();
    } catch (err) { mostrarErro("Erro ao lançar pedido."); }
    finally { setEnviando(false); }
  }

  const getStatusMesa = (num: number) => {
    const comanda = comandasAtivas.find(c => c.mesa?.numero === num);
    if (!comanda) return 'LIVRE';
    return comanda.status === 'AGUARDANDO_PAGAMENTO' ? 'PRONTA' : 'OCUPADA';
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex justify-center overflow-x-hidden">
      
      {/* TOAST DE ERRO */}
      {erro && (
        <div className="fixed top-4 z-[100] w-[90%] max-w-xs animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400">
            <AlertCircle size={20} />
            <p className="font-bold text-xs leading-tight flex-1">{erro}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-slate-900 shadow-2xl min-h-screen flex flex-col relative">
        
        {/* TELA 1: MAPA DE MESAS */}
        {modo === 'MAPA_MESAS' && (
          <div className="flex-1 flex flex-col p-6 animate-in fade-in">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black">Salão</h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Mapa de Mesas</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400"><Hash size={24} /></div>
            </header>

            <div className="grid grid-cols-3 gap-4 overflow-y-auto pb-10">
              {Array.from({ length: totalMesas }, (_, i) => i + 1).map(num => {
                const status = getStatusMesa(num);
                return (
                  <button key={num} 
                    onClick={() => status === 'LIVRE' ? (setMesaSelecionada(num), setModo('CHECKIN')) : abrirContaMesa(num)}
                    className={`aspect-square rounded-[24px] flex flex-col items-center justify-center border-2 transition-all active:scale-95
                      ${status === 'LIVRE' ? 'bg-slate-950 border-slate-800 text-slate-600' : ''}
                      ${status === 'OCUPADA' ? 'bg-blue-600/10 border-blue-500/40 text-blue-400' : ''}
                      ${status === 'PRONTA' ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 animate-pulse' : ''}
                    `}
                  >
                    <span className="text-2xl font-black">{num}</span>
                    <span className="text-[10px] font-bold uppercase">{status === 'LIVRE' ? 'Vazia' : 'Ocupada'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TELA 2: CHECK-IN (IDENTIFICAR CLIENTE) */}
        {modo === 'CHECKIN' && (
          <div className="flex-1 flex flex-col p-8 items-center justify-center animate-in slide-in-from-bottom-10">
            <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-900/20">
              <User size={40} className="text-blue-500" />
            </div>
            <h1 className="text-3xl font-black mb-2 text-white">Mesa {mesaSelecionada}</h1>
            <p className="text-slate-400 font-medium text-sm mb-8 text-center">Identifique o cliente para abrir a conta.</p>

            <form onSubmit={realizarCheckin} className="w-full space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Nome do Cliente</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input type="text" required value={nomeInput} onChange={e => setNomeInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Nome completo ou apelido" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">CPF do Cliente</label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input type="tel" required value={cpfInput} onChange={e => setCpfInput(e.target.value)} maxLength={14}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="000.000.000-00" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                 <button type="button" onClick={() => setModo('MAPA_MESAS')} className="flex-1 bg-slate-800 text-slate-300 p-4 rounded-2xl font-black text-lg">CANCELAR</button>
                 <button type="submit" disabled={enviando} className="flex-[2] bg-blue-600 text-white p-4 rounded-2xl font-black text-lg flex justify-center items-center shadow-lg shadow-blue-900/40">
                   {enviando ? <Loader2 className="animate-spin" /> : 'ABRIR MESA'}
                 </button>
              </div>
            </form>
          </div>
        )}

        {/* TELA 3: LANÇAR PEDIDO (IGUAL AO CARDÁPIO DO CLIENTE) */}
        {modo === 'LANCAR_PEDIDO' && (
          <>
            <header className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-900/95 sticky top-0 z-40">
              <button onClick={() => setModo('MAPA_MESAS')} className="p-2 bg-slate-800 rounded-xl text-slate-400"><ArrowLeft size={24}/></button>
              <div>
                <h2 className="text-xl font-black leading-none">Mesa {mesaSelecionada}</h2>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">Lançamento de Itens</p>
              </div>
            </header>

            <div className="p-4 bg-slate-900 border-b border-slate-800 sticky top-[80px] z-30">
               <div className="relative">
                  <Search className="absolute left-4 top-3 text-slate-500" size={18} />
                  <input type="text" placeholder="Buscar no cardápio..." value={busca} onChange={e => setBusca(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 font-bold text-sm outline-none focus:border-blue-500 transition-colors" />
               </div>
            </div>

            <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-44 custom-scrollbar">
              {produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).map(p => {
                const itemCarrinho = carrinho.find(i => i.id === p.id);
                const qtde = itemCarrinho?.quantidade || 0;
                
                return (
                  <div key={p.id} className={`p-4 rounded-[28px] border transition-all flex flex-col gap-4 ${qtde > 0 ? 'bg-blue-600/5 border-blue-500/40' : 'bg-slate-800/40 border-slate-800'}`}>
                    <div className="flex gap-4 items-center">
                      {p.imagem ? (
                        <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                          <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800">
                          <Utensils size={24} className="text-slate-800" />
                        </div>
                      )}

                      <div className="flex-1 pr-2">
                        <h3 className="font-bold text-slate-100 text-md leading-tight">{p.nome}</h3>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{p.descricao}</p>
                        <p className="text-blue-400 font-black text-md mt-1">R$ {Number(p.preco).toFixed(2)}</p>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2 bg-slate-950 p-1 rounded-full border border-slate-800">
                        <button onClick={() => adicionarAoCarrinho(p)} className="w-8 h-8 flex rounded-full items-center justify-center bg-blue-600 text-white"><Plus size={16}/></button>
                        <span className="font-black text-sm w-4 text-center">{qtde}</span>
                        <button onClick={() => removerDoCarrinho(p.id)} className="w-8 h-8 flex rounded-full items-center justify-center bg-slate-900 text-slate-400"><Minus size={16}/></button>
                      </div>
                    </div>

                    {/* OBSERVAÇÃO DO ITEM */}
                    {qtde > 0 && (
                      <div className="relative animate-in slide-in-from-top-2">
                        <MessageSquare className="absolute left-3 top-2.5 text-blue-500/40" size={14} />
                        <input type="text" placeholder="Observações..." value={itemCarrinho?.observacao || ''} 
                          onChange={(e) => atualizarObservacao(p.id, e.target.value)}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-[10px] font-medium text-slate-400 outline-none" />
                      </div>
                    )}
                  </div>
                );
              })}
            </main>

            {totalItens > 0 && (
              <div className="fixed bottom-6 w-full max-w-md px-6 z-50">
                <button onClick={lancarPedido} disabled={enviando} className="w-full bg-blue-600 text-white p-5 rounded-[24px] font-black text-lg flex justify-between items-center shadow-2xl active:scale-95 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-black/20 p-2.5 rounded-xl relative"><ShoppingBag size={24} /><span className="absolute -top-2 -right-2 bg-white text-blue-600 text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black shadow-sm">{totalItens}</span></div>
                    <span>ENVIAR PEDIDO</span>
                  </div>
                  {enviando ? <Loader2 className="animate-spin" /> : <span>R$ {totalCarrinho.toFixed(2)}</span>}
                </button>
              </div>
            )}
          </>
        )}

        {/* TELA 4: VISUALIZAR CONTA E FECHAR */}
        {modo === 'VER_CONTA' && contaMesa && (
          <div className="flex-1 flex flex-col animate-in slide-in-from-right">
            <header className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-40">
              <div className="flex items-center gap-4">
                <button onClick={() => setModo('MAPA_MESAS')} className="p-2 bg-slate-800 rounded-xl text-slate-400"><ArrowLeft size={24}/></button>
                <h2 className="text-xl font-black leading-none">Conta Mesa {mesaSelecionada}</h2>
              </div>
              <button onClick={() => setModo('LANCAR_PEDIDO')} className="bg-blue-600/10 text-blue-400 p-2.5 rounded-xl border border-blue-500/20 active:scale-90 transition-all"><Plus size={24} /></button>
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-y-auto pb-44">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Itens na Comanda</h4>
                {contaMesa.itens.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <p className="font-bold text-slate-300 text-sm"><span className="text-blue-500">{item.quantidade}x</span> {item.produto}</p>
                    <p className="font-black text-white text-sm">R$ {item.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex justify-between text-slate-500 text-xs font-bold"><span>Subtotal</span><span>R$ {contaMesa.resumo.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-500 text-xs font-bold"><span>Serviço (10%)</span><span>R$ {contaMesa.resumo.taxa_servico.toFixed(2)}</span></div>
                <div className="flex justify-between items-end pt-3 border-t border-slate-800">
                  <span className="text-xs font-black text-slate-400 uppercase">Total Geral</span>
                  <span className="text-3xl font-black text-emerald-400 tracking-tighter">R$ {contaMesa.resumo.total_a_pagar.toFixed(2)}</span>
                </div>
              </div>
            </main>

            <div className="fixed bottom-6 w-full max-w-md px-6 z-50">
              <button onClick={finalizarPagamento} disabled={enviando} className="w-full bg-emerald-600 text-white p-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50">
                {enviando ? <Loader2 className="animate-spin" /> : <><CheckCircle size={24} /> RECEBER E LIBERAR</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}