import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import api from '../services/api';

interface Categoria { id: string; nome: string; }
interface Produto { id: string; nome: string; preco: number; descricao: string; categoria_id: string; categoria?: Categoria; }

export default function Gerenciamento() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [categoriaId, setCategoriaId] = useState(''); 

  const restauranteId = "5d5748f8-f621-4d5d-b8e5-d363884627f1";

  // READ (Ler os produtos e as categorias)
  async function buscarDados() {
    try {
      const resProdutos = await api.get(`/produtos?restaurante_id=${restauranteId}`);
      const listaDeProdutos = Array.isArray(resProdutos.data) ? resProdutos.data : [];
      setProdutos(listaDeProdutos);
      
      try {
        const resCategorias = await api.get(`/categorias?restaurante_id=${restauranteId}`);
        setCategorias(resCategorias.data);
      } catch (erroCat) {
        const categoriasExtraidas = Array.from(
          new Map(listaDeProdutos.map(p => [p.categoria_id, p.categoria])).values()
        ).filter(Boolean) as Categoria[];
        
        setCategorias(categoriasExtraidas);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { buscarDados(); }, []);

  async function salvarProduto(e: React.FormEvent) {
    e.preventDefault();
    
    if (!categoriaId) {
      return alert("⚠️ Por favor, selecione uma categoria para o produto!");
    }

    const dadosProduto = {
      nome,
      descricao,
      preco: Number(preco),
      categoria_id: categoriaId,
      restaurante_id: restauranteId
    };

    try {
      if (idEditando) {
        await api.patch(`/produtos/${idEditando}`, dadosProduto);
        alert("✅ Produto atualizado com sucesso!");
      } else {
        await api.post('/produtos', dadosProduto);
        alert("✅ Produto adicionado com sucesso!");
      }
      
      limparFormulario();
      buscarDados(); 
    } catch (error) {
      console.error(error);
      alert("❌ Erro ao salvar. (Você está logado?)");
    }
  }

  async function excluirProduto(id: string, nomeProduto: string) {
    if (confirm(`Tem certeza que deseja excluir "${nomeProduto}"?`)) {
      try {
        await api.delete(`/produtos/${id}`);
        alert("🗑️ Produto excluído!");
        buscarDados(); 
      } catch (error) {
        console.error(error);
        alert("❌ Erro ao excluir. (Você está logado?)");
      }
    }
  }
  
  // 🚀 NOVA FUNÇÃO: Cria a categoria rapidinho via "prompt" do navegador
  async function criarNovaCategoria() {
    const nomeCategoria = prompt("Digite o nome da nova categoria (ex: Sobremesas, Porções, Combos):");
    
    if (!nomeCategoria || nomeCategoria.trim() === '') return; 

    try {
      const response = await api.post('/categorias', {
        nome: nomeCategoria,
        restaurante_id: restauranteId
      });
      
      alert(`✅ Categoria "${nomeCategoria}" criada com sucesso!`);
      
      // Atualiza a tela para baixar a nova categoria e já deixa ela selecionada
      await buscarDados();
      setCategoriaId(response.data.id); 

    } catch (error) {
      console.error(error);
      alert("❌ Erro ao criar categoria. Será que a rota existe no seu backend?");
    }
  }

  function editarProduto(produto: Produto) {
    setIdEditando(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setPreco(produto.preco.toString());
    setCategoriaId(produto.categoria_id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }

  function limparFormulario() {
    setIdEditando(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setCategoriaId(''); 
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Painel do Gerente</h1>
          <p className="text-gray-500">Gerencie seu cardápio (CRUD)</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FORMULÁRIO */}
        <div className="md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit sticky top-8">
          <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
            {idEditando ? <Pencil className="text-blue-500"/> : <Plus className="text-green-500"/>}
            {idEditando ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          
          <form onSubmit={salvarProduto} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-gray-600">Nome do Produto</label>
              <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mt-1" placeholder="Ex: Pizza Calabresa" />
            </div>
            
            {/* 🚀 CAIXA DE SELEÇÃO COM O BOTÃO "+ NOVA" */}
            <div>
              <label className="text-sm font-bold text-gray-600">Categoria</label>
              <div className="flex gap-2 mt-1">
                <select 
                  required 
                  value={categoriaId} 
                  onChange={e => setCategoriaId(e.target.value)} 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-700 outline-none focus:border-red-400"
                >
                  <option value="" disabled>Selecione uma categoria...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
                
                <button 
                  type="button" 
                  onClick={criarNovaCategoria}
                  className="bg-red-50 text-red-600 px-4 rounded-xl font-bold hover:bg-red-100 active:scale-95 transition-all"
                  title="Criar nova categoria"
                >
                  + Nova
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600">Descrição</label>
              <textarea required value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mt-1 h-24" placeholder="Ingredientes..." />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-600">Preço (R$)</label>
              <input required type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mt-1" placeholder="0.00" />
            </div>

            <div className="flex gap-2 mt-4">
              {idEditando && (
                <button type="button" onClick={limparFormulario} className="flex-1 bg-gray-100 text-gray-600 font-bold p-3 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
              )}
              <button type="submit" className="flex-[2] bg-gray-800 text-white font-bold p-3 rounded-xl hover:bg-black transition-colors">
                {idEditando ? 'Atualizar' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="md:col-span-2">
          {carregando ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
          ) : (
            <div className="grid gap-4">
              {produtos?.map(produto => (
                <div key={produto.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-red-100 transition-colors">
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded-md">
                      {produto.categoria?.nome || 'Sem categoria'}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg mt-1">{produto.nome}</h3>
                    <p className="text-gray-500 font-black">R$ {Number(produto.preco).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editarProduto(produto)} className="bg-blue-50 text-blue-600 p-3 rounded-xl hover:bg-blue-100 active:scale-90 transition-all"><Pencil size={20}/></button>
                    <button onClick={() => excluirProduto(produto.id, produto.nome)} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 active:scale-90 transition-all"><Trash2 size={20}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}