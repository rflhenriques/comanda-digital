import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, X, Plus, Minus, CheckCircle2, Loader2, Utensils, MessageSquare, ChefHat, ChevronRight, User, Fingerprint, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Categoria { id: string; nome: string; }
interface Produto { id: string; nome: string; preco: number; descricao: string; imagem?: string; categoria: Categoria; }
interface ItemCarrinho extends Produto { quantidade: number; observacao: string; }

export default function Cardapio() {
  const { numeroMesa } = useParams();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [pedidoSucesso, setPedidoSucesso] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Todas");
  const [enviando, setEnviando] = useState(false);
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  // 🚀 ESTADO DA NOTIFICAÇÃO DE ERRO
  const [erro, setErro] = useState<string | null>(null);

  const [cliente, setCliente] = useState<{cpf: string, nome: string} | null>(() => {
    const salvo = localStorage.getItem(`@Comanda:cliente_mesa_${numeroMesa}`);
    return salvo ? JSON.parse(salvo) : null;
  });
  const [cpfInput, setCpfInput] = useState('');
  const [nomeInput, setNomeInput] = useState('');

  const restauranteId = "5d5748f8-f621-4d5d-b8e5-d363884627f1";

  // Função para mostrar erro e sumir após 4 segundos
  function mostrarErro(mensagem: string) {
    setErro(mensagem);
    setTimeout(() => setErro(null), 4000);
  }

  useEffect(() => {
    async function carregarInicial() {
      try {
        const resProd = await api.get(`/produtos?restaurante_id=${restauranteId}`);
        setProdutos(resProd.data);
      } catch (error) { 
        console.error(error); 
      } finally { 
        setCarregando(false); 
      }
    }
    carregarInicial();
  }, [restauranteId]);

  const produtosAgrupados = useMemo(() => {
    return produtos.reduce((acc: any, produto) => {
      const cat = produto.categoria?.nome || "Outros";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(produto);
      return acc;
    }, {});
  }, [produtos]);

  const categoriasDisponiveis = ["Todas", ...Object.keys(produtosAgrupados)];

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

  const totalCarrinho = carrinho.reduce((acc, i) => acc + (Number(i.preco) * i.quantidade), 0);
  const totalItens = carrinho.reduce((acc, i) => acc + i.quantidade, 0);

  async function acessarMesa(e: React.FormEvent) {
    e.preventDefault();
    if (!cpfInput || !nomeInput) return;
    
    setCarregandoLogin(true);
    const cpfFormatado = cpfInput.replace(/\D/g, '');

    try {
      await api.post('/comandas', { 
        restaurante_id: restauranteId, 
        mesa_numero: Number(numeroMesa),
        cpf: cpfFormatado,
        nome: nomeInput,
        itens: [] 
      });

      const dadosCliente = { cpf: cpfFormatado, nome: nomeInput };
      localStorage.setItem(`@Comanda:cliente_mesa_${numeroMesa}`, JSON.stringify(dadosCliente));
      setCliente(dadosCliente);
    } catch (error: any) {
      if (error.response?.data?.message?.includes('utilizada') || error.response?.data?.message?.includes('ocupada')) {
        mostrarErro("Esta mesa já está ocupada por outro cliente.");
      } else {
        mostrarErro("Erro ao acessar mesa. Tente novamente.");
      }
    } finally {
      setCarregandoLogin(false);
    }
  }

  async function confirmarPedido() {
    if (!cliente) return;
    setEnviando(true);
    try {
      await api.post('/comandas', { 
        restaurante_id: restauranteId, 
        mesa_numero: Number(numeroMesa),
        cpf: cliente.cpf,
        nome: cliente.nome,
        itens: carrinho.map(i => ({ 
            produto_id: i.id, 
            quantidade: i.quantidade,
            observacao: i.observacao 
        })) 
      });
      setPedidoSucesso(true); 
      setCarrinho([]); 
      setTimeout(() => { setModalAberto(false); setPedidoSucesso(false); }, 3000);
    } catch (error: any) { 
      mostrarErro("Não foi possível enviar o pedido. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans pb-32 flex justify-center text-slate-100 relative">
      
      {/* 🚀 COMPONENTE DE NOTIFICAÇÃO (TOAST) */}
      {erro && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl shadow-red-900/40 flex items-center gap-3 border border-red-400">
            <div className="bg-white/20 p-2 rounded-full">
              <AlertCircle size={20} />
            </div>
            <p className="font-bold text-sm leading-tight">{erro}</p>
            <button onClick={() => setErro(null)} className="ml-auto opacity-70 hover:opacity-100">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl bg-slate-900 relative shadow-2xl shadow-black/50 min-h-screen">
        
        {!cliente ? (
          /* TELA DE BOAS VINDAS */
          <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-rose-600/20 to-transparent pointer-events-none"></div>
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative z-10 text-center">
              <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(225,29,72,0.2)]">
                <Utensils size={40} className="text-rose-500" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Bem-vindo!</h1>
              <p className="text-slate-400 font-medium text-sm mb-8">Identifique-se para iniciar a conta da Mesa <span className="text-rose-400 font-bold">{numeroMesa}</span>.</p>
              <form onSubmit={acessarMesa} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input type="text" required value={nomeInput} onChange={e => setNomeInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 font-bold text-white focus:outline-none focus:border-rose-500 transition-colors placeholder:text-slate-700"
                      placeholder="Como quer ser chamado?" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Seu CPF</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input type="tel" required value={cpfInput} onChange={e => setCpfInput(e.target.value)} maxLength={14}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 font-bold text-white focus:outline-none focus:border-rose-500 transition-colors placeholder:text-slate-700"
                      placeholder="000.000.000-00" />
                  </div>
                </div>
                <button type="submit" disabled={carregandoLogin} className="w-full bg-rose-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-rose-500 active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(225,29,72,0.5)] mt-4 disabled:opacity-70 flex justify-center items-center gap-2">
                  {carregandoLogin ? <Loader2 className="animate-spin" size={24} /> : 'ACESSAR CARDÁPIO'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* TELA DO CARDÁPIO NORMAL */
          <>
            <header className="bg-slate-900 pt-10 pb-6 px-6 text-center border-b border-slate-800 relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-3 border border-rose-500/20">
                <ChefHat size={32} className="text-rose-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">O Famoso Menu</h1>
              <div className="mt-3 flex gap-2">
                <div className="inline-flex items-center bg-slate-800 text-slate-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-700">Mesa {numeroMesa || '00'}</div>
                <div className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-rose-500/20">
                  <User size={12} /> {cliente.nome.split(' ')[0]}
                </div>
              </div>
            </header>

            <nav className="sticky top-0 bg-slate-900/80 backdrop-blur-xl z-30 border-b border-slate-800 px-6 py-4 overflow-x-auto flex gap-3 custom-scrollbar">
              {categoriasDisponiveis.map(cat => (
                <button key={cat} onClick={() => setCategoriaAtiva(cat)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    categoriaAtiva === cat 
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-900/50 transform scale-105 border border-rose-500" 
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-200"
                  }`}>
                  {cat}
                </button>
              ))}
            </nav>

            <main className="mt-6 px-6">
              {carregando ? (
                <div className="flex flex-col items-center justify-center py-20 text-rose-500">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p className="font-bold text-slate-400">Preparando cardápio...</p>
                </div>
              ) : (
                Object.keys(produtosAgrupados).map(cat => (
                  (categoriaAtiva === "Todas" || categoriaAtiva === cat) && (
                    <section key={cat} className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2 px-1 tracking-tight">
                        <Utensils size={20} className="text-rose-500" /> {cat}
                      </h2>
                      <div className="grid gap-4">
                        {produtosAgrupados[cat].map((produto: Produto) => {
                          const qtdeNoCarrinho = carrinho.find(i => i.id === produto.id)?.quantidade || 0;
                          return (
                            <div key={produto.id} className="bg-slate-800/50 p-4 rounded-[24px] border border-slate-800 flex gap-4 items-center group hover:border-rose-500/30 transition-colors">
                              {produto.imagem ? (
                                <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
                                  <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                              ) : (
                                <div className="w-28 h-28 flex-shrink-0 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700"><Utensils size={32} className="text-slate-600" /></div>
                              )}
                              <div className="flex-1 py-1 pr-2">
                                <h3 className="font-bold text-slate-100 text-lg leading-tight">{produto.nome}</h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{produto.descricao}</p>
                                <p className="text-rose-400 font-black text-lg mt-2">R$ {Number(produto.preco).toFixed(2)}</p>
                              </div>
                              <div className="flex flex-col items-center flex-shrink-0">
                                {qtdeNoCarrinho > 0 ? (
                                  <div className="flex flex-col items-center gap-2 bg-slate-900 rounded-full border border-slate-700 p-1 shadow-sm">
                                    <button onClick={() => adicionarAoCarrinho(produto)} className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-500 transition-colors"><Plus size={16}/></button>
                                    <span className="font-bold text-sm text-white">{qtdeNoCarrinho}</span>
                                    <button onClick={() => removerDoCarrinho(produto.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors"><Minus size={16}/></button>
                                  </div>
                                ) : (
                                  <button onClick={() => adicionarAoCarrinho(produto)} className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center border border-slate-700 hover:border-slate-600 active:scale-90 transition-all hover:bg-slate-700"><Plus size={24} /></button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )
                ))
              )}
            </main>

            {carrinho.length > 0 && !modalAberto && (
               <div className="fixed bottom-6 w-full max-w-xl px-6 z-40 animate-in slide-in-from-bottom-10 duration-300">
                 <button onClick={() => setModalAberto(true)} className="w-full bg-rose-600 text-white p-4 rounded-full shadow-[0_10px_40px_-10px_rgba(225,29,72,0.3)] border border-rose-500 flex justify-between items-center active:scale-[0.98] transition-all group">
                   <div className="flex items-center gap-3">
                     <div className="bg-black/20 p-2.5 rounded-full relative">
                       <ShoppingBag size={20} /><span className="absolute -top-1 -right-1 bg-white text-rose-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{totalItens}</span>
                     </div>
                     <span className="font-bold text-sm tracking-wide">VER PEDIDO</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="font-black text-lg">R$ {totalCarrinho.toFixed(2)}</span>
                     <ChevronRight size={20} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                   </div>
                 </button>
               </div>
            )}
          </>
        )}

        {modalAberto && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-slate-900 w-full max-w-xl rounded-t-[40px] p-8 max-h-[85vh] flex flex-col border-t border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-300 ease-out">
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6"></div>
              {pedidoSucesso ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 animate-in zoom-in-50 duration-500">
                  <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={60} className="text-green-500" /></div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Pedido na Cozinha!</h2>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-2xl font-black text-white tracking-tight">Seu Pedido</h2></div>
                    <button onClick={() => setModalAberto(false)} className="bg-slate-800 p-2.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"><X size={20} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-6">
                    {carrinho.map(item => (
                      <div key={item.id} className="bg-slate-800/50 p-5 rounded-[24px] border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 pr-4">
                            <h4 className="font-bold text-white text-md leading-tight">{item.nome}</h4>
                            <p className="text-rose-400 font-black mt-1">R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 p-1.5 rounded-full shadow-sm">
                            <button onClick={() => removerDoCarrinho(item.id)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-400"><Minus size={16}/></button>
                            <span className="font-black text-sm w-4 text-center text-white">{item.quantidade}</span>
                            <button onClick={() => adicionarAoCarrinho(item)} className="w-7 h-7 flex items-center justify-center text-rose-500"><Plus size={16}/></button>
                          </div>
                        </div>
                        <div className="relative mt-2">
                          <MessageSquare className="absolute left-3 top-3 text-slate-500" size={16} />
                          <input type="text" placeholder="Observações?" value={item.observacao} onChange={(e) => atualizarObservacao(item.id, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium focus:outline-none focus:border-rose-500 transition-all text-white placeholder:text-slate-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-slate-800 bg-slate-900">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Geral</span>
                      <span className="text-4xl font-black text-white tracking-tighter">R$ {totalCarrinho.toFixed(2)}</span>
                    </div>
                    <button onClick={confirmarPedido} disabled={enviando} className="w-full bg-rose-600 text-white p-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-900/50 disabled:opacity-70">
                      {enviando ? <Loader2 className="animate-spin text-white" size={24} /> : <>ENVIAR PARA COZINHA</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}