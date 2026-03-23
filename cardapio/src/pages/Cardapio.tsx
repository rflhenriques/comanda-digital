import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, X, Plus, Minus, Send, CheckCircle2, Loader2, Utensils, MessageSquare } from 'lucide-react';
import api from '../services/api';

interface Categoria { id: string; nome: string; }
interface Produto { id: string; nome: string; preco: number; descricao: string; categoria: Categoria; }
interface ItemCarrinho extends Produto { quantidade: number; observacao: string; }

export default function Cardapio() {
  const { numeroMesa } = useParams();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [pedidoSucesso, setPedidoSucesso] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Todas");

  const restauranteId = "5d5748f8-f621-4d5d-b8e5-d363884627f1";

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

  async function confirmarPedido() {
    try {
      // 🚀 Enviando direto o NÚMERO da mesa para o backend fazer a mágica!
      await api.post('/comandas', { 
        restaurante_id: restauranteId, 
        mesa_numero: Number(numeroMesa),
        itens: carrinho.map(i => ({ 
            produto_id: i.id, 
            quantidade: i.quantidade,
            observacao: i.observacao 
        })) 
      });
      setPedidoSucesso(true); 
      setCarrinho([]); 
      setTimeout(() => { setModalAberto(false); setPedidoSucesso(false); }, 3000);
    } catch { 
      alert("Erro ao enviar pedido. Verifique sua conexão com o servidor."); 
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      <header className="bg-white pt-8 pb-4 text-center border-b border-gray-100">
        <h1 className="text-3xl font-black text-red-600 tracking-tighter uppercase italic">Pizza d'Oro</h1>
        <div className="mt-2 inline-block bg-red-50 text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
          Mesa {numeroMesa || '00'}
        </div>
      </header>

      <nav className="sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-gray-100 px-4 py-4 overflow-x-auto flex gap-3 no-scrollbar">
        {categoriasDisponiveis.map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategoriaAtiva(cat)}
            className={`whitespace-nowrap px-6 py-2 rounded-2xl text-sm font-black transition-all ${
              categoriaAtiva === cat 
              ? "bg-red-600 text-white shadow-lg shadow-red-200 scale-105" 
              : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      <main className="max-w-2xl mx-auto mt-6 px-4">
        {carregando ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>
        ) : (
          Object.keys(produtosAgrupados).map(cat => (
            (categoriaAtiva === "Todas" || categoriaAtiva === cat) && (
              <section key={cat} className="mb-10 animate-in fade-in duration-500">
                <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2 px-2 uppercase tracking-tight">
                  <Utensils size={18} className="text-red-600" />
                  {cat}
                </h2>
                <div className="grid gap-4">
                  {produtosAgrupados[cat].map((produto: Produto) => (
                    <div key={produto.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex justify-between items-center">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{produto.nome}</h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{produto.descricao}</p>
                        <p className="text-red-600 font-black text-xl mt-2">R$ {Number(produto.preco).toFixed(2)}</p>
                      </div>
                      <button onClick={() => adicionarAoCarrinho(produto)} className="bg-red-600 text-white w-14 h-14 rounded-2xl font-black text-2xl shadow-xl active:scale-90 transition-all flex items-center justify-center">+</button>
                    </div>
                  ))}
                </div>
              </section>
            )
          ))
        )}
      </main>

      {carrinho.length > 0 && (
         <div className="fixed bottom-6 left-0 right-0 px-4 z-40">
           <button onClick={() => setModalAberto(true)} className="max-w-2xl mx-auto w-full bg-red-600 text-white p-5 rounded-[28px] shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom duration-300">
             <div className="flex items-center gap-4">
               <div className="bg-white/20 p-2 rounded-xl"><ShoppingBag size={24} /></div>
               <span className="font-black text-lg">REVISAR PEDIDO ({totalItens})</span>
             </div>
             <span className="font-black text-2xl">R$ {totalCarrinho.toFixed(2)}</span>
           </button>
         </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-2xl rounded-t-[40px] p-8 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {pedidoSucesso ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10">
                <CheckCircle2 size={60} className="text-green-500 mb-4" />
                <h2 className="text-3xl font-black text-gray-800 tracking-tighter">Enviado!</h2>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-gray-800 tracking-tighter">Meu Pedido</h2>
                  <button onClick={() => setModalAberto(false)} className="bg-gray-100 p-2 rounded-xl text-gray-400 hover:bg-gray-200 transition-colors"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {carrinho.map(item => (
                    <div key={item.id} className="mb-4 bg-gray-50 p-5 rounded-[24px] border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">{item.nome}</h4>
                          <p className="text-red-600 font-black">R$ {(Number(item.preco) * item.quantidade).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
                          <button onClick={() => removerDoCarrinho(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Minus size={20}/></button>
                          <span className="font-black text-xl w-6 text-center">{item.quantidade}</span>
                          <button onClick={() => adicionarAoCarrinho(item)} className="text-red-600 hover:text-red-800 transition-colors"><Plus size={20}/></button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 text-gray-300" size={16} />
                        <input 
                          type="text"
                          placeholder="Alguma observação? (ex: sem cebola)"
                          value={item.observacao}
                          onChange={(e) => atualizarObservacao(item.id, e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-xl p-2 pl-10 text-sm focus:outline-none focus:border-red-300 transition-all text-gray-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-8 mt-4">
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Total Geral</span>
                    <span className="text-4xl font-black text-gray-800">R$ {totalCarrinho.toFixed(2)}</span>
                  </div>
                  <button onClick={confirmarPedido} className="w-full bg-green-600 text-white p-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-green-100 hover:bg-green-700 transition-colors">
                    <Send size={24} /> FINALIZAR PEDIDO
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}