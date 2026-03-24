import { useEffect, useState } from 'react';
import { LayoutDashboard, Plus, Image as ImageIcon, Tag, Trash2, Edit, Loader2, DollarSign, AlignLeft, Package } from 'lucide-react';
import api from '../services/api';

interface Categoria { id: string; nome: string; }
interface Produto { id: string; nome: string; preco: number; descricao: string; imagem?: string; categoria: Categoria; }

export default function Gerenciamento() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null); // 🚀 Estado de Edição

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  const restauranteId = "5d5748f8-f621-4d5d-b8e5-d363884627f1";

  async function carregarDados() {
    try {
      const [resProd, resCat] = await Promise.all([
        api.get(`/produtos?restaurante_id=${restauranteId}`),
        api.get(`/categorias?restaurante_id=${restauranteId}`)
      ]);
      setProdutos(resProd.data);
      setCategorias(resCat.data);
      if (resCat.data.length > 0 && !categoriaId) {
        setCategoriaId(resCat.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  // 🚀 Puxa os dados para o formulário
  function prepararEdicao(p: Produto) {
    setEditandoId(p.id);
    setNome(p.nome);
    setPreco(p.preco.toString());
    setDescricao(p.descricao || '');
    setImagem(p.imagem || '');
    setCategoriaId(p.categoria.id);
  }

  // 🚀 Limpa o formulário
  function cancelarEdicao() {
    setEditandoId(null);
    setNome(''); setPreco(''); setDescricao(''); setImagem('');
  }

  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = {
        nome,
        preco: Number(preco),
        descricao,
        imagem,
        categoria_id: categoriaId,
        restaurante_id: restauranteId
      };

      if (editandoId) {
        await api.patch(`/produtos/${editandoId}`, payload); // 🚀 Atualiza se estiver editando
        alert("✅ Produto atualizado com sucesso!");
      } else {
        await api.post('/produtos', payload); // 🚀 Cria se for novo
        alert("✅ Produto cadastrado com sucesso!");
      }

      cancelarEdicao(); // Limpa e sai do modo de edição
      await carregarDados();
    } catch (error) {
      alert("❌ Erro ao salvar produto. Verifique seu acesso de Gerente.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await api.delete(`/produtos/${id}`);
      setProdutos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert("❌ Erro ao excluir produto.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">

      {/* HEADER DO GERENTE */}
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 shadow-sm z-10 flex justify-between items-center relative">
        <div className="absolute top-0 right-10 w-48 h-20 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-blue-400 shadow-lg shadow-blue-900/20">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">Gerenciamento</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Cadastro de Produtos e Cardápio</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar flex gap-8 flex-col lg:flex-row max-w-7xl mx-auto w-full">

        {/* COLUNA ESQUERDA: FORMULÁRIO DE CADASTRO */}
        <aside className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl shadow-black/50 sticky top-8">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Plus size={20} className="text-blue-400" /> {editandoId ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <form onSubmit={salvarProduto} className="space-y-5">

              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Nome do Produto</label>
                <div className="relative">
                  <Package className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input type="text" required value={nome} onChange={e => setNome(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600"
                    placeholder="Ex: Pizza Calabresa" />
                </div>
              </div>

              {/* Preço e Categoria (Lado a lado) */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Preço</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <input type="number" step="0.01" required value={preco} onChange={e => setPreco(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-9 pr-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600"
                      placeholder="45.90" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <select required value={categoriaId} onChange={e => setCategoriaId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-9 pr-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Descrição</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-slate-500" size={18} />
                  <textarea rows={3} value={descricao} onChange={e => setDescricao(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600 resize-none custom-scrollbar"
                    placeholder="Ingredientes e detalhes..."></textarea>
                </div>
              </div>

              {/* Link da Imagem */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">URL da Imagem</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={imagem}
                    onChange={e => setImagem(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600"
                    placeholder="/produtos/foto.jpg ou link da web"
                  />
                </div>
                {/* Preview Rápido da Imagem */}
                {imagem && (
                  <div className="mt-3 p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
                    <img src={imagem} alt="Preview" className="h-24 w-auto rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              {/* 🚀 Botões do Formulário (Com Cancelar quando editando) */}
              <div className="flex gap-3 mt-6">
                {editandoId && (
                  <button type="button" onClick={cancelarEdicao} className="flex-1 bg-slate-800 text-slate-300 p-4 rounded-2xl font-black hover:bg-slate-700 transition-all">
                    CANCELAR
                  </button>
                )}
                <button type="submit" disabled={salvando}
                  className="flex-[2] bg-blue-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-70">
                  {salvando ? <Loader2 className="animate-spin" size={24} /> : editandoId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PRODUTO'}
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* COLUNA DIREITA: LISTA DE PRODUTOS (VITRINE) */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">Produtos Cadastrados</h2>
            <span className="bg-slate-800 text-slate-400 font-bold px-3 py-1 rounded-full text-xs border border-slate-700">{produtos.length} Itens</span>
          </div>

          {carregando ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
          ) : produtos.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-12 text-center text-slate-500">
              <Package size={64} className="mx-auto mb-4 text-slate-700" />
              <p className="font-bold text-lg">Nenhum produto cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {produtos.map(produto => (
                <div key={produto.id} className="bg-slate-900 border border-slate-800 rounded-[24px] overflow-hidden group hover:border-slate-600 transition-all shadow-lg hover:shadow-black/50 flex flex-col">
                  {/* FOTO DO PRODUTO (Se tiver) */}
                  {produto.imagem ? (
                    <div className="h-40 w-full overflow-hidden bg-slate-950 relative">
                      <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300 uppercase tracking-widest border border-slate-700/50">
                        {produto.categoria?.nome}
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-slate-800/50 flex items-center justify-center border-b border-slate-800">
                      <ImageIcon size={32} className="text-slate-700" />
                    </div>
                  )}

                  {/* INFORMAÇÕES DO PRODUTO */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-white text-lg leading-tight mb-1">{produto.nome}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">{produto.descricao}</p>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-black text-emerald-400 text-xl">R$ {Number(produto.preco).toFixed(2)}</span>

                      <div className="flex gap-2">
                        {/* 🚀 Botão de Editar ligado aqui */}
                        <button onClick={() => prepararEdicao(produto)} className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => excluirProduto(produto.id)} className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}