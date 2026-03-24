# 🍕 Sistema de Comanda Digital (SaaS para Restaurantes)

## 📌 Visão Geral do Projeto
Este é um sistema completo de gestão para restaurantes, pizzarias e lanchonetes. Ele engloba a experiência do cliente (cardápio digital na mesa), a operação da cozinha (dashboard de produção) e a gestão financeira/administrativa (painel do gerente e caixa).

O restaurante padrão de testes possui o ID (UUID): `5d5748f8-f621-4d5d-b8e5-d363884627f1`.

## 🛠️ Stack Tecnológico
**Frontend:**
- React.js com TypeScript (Vite)
- Estilização: Tailwind CSS
- Ícones: `lucide-react`
- Roteamento: `react-router-dom`
- Requisições: `axios` (configurado em `src/services/api.ts`)

**Backend:**
- NestJS com TypeScript
- ORM: Prisma (`prisma/schema.prisma`)
- Banco de Dados: PostgreSQL
- Hospedagem: Render

## 🏗️ Arquitetura e Regras de Negócio Importantes
1. **Exclusão Lógica (Soft Delete):** Nunca deletamos produtos ou categorias do banco. Apenas mudamos o status `ativo` para `false` para não quebrar o histórico de comandas.
2. **Auto-Criação de Mesas:** Se o cliente fizer um pedido em uma mesa (ex: `/mesa/08`) e ela não existir no banco, o Backend (Service) cria a mesa automaticamente e vincula o pedido.
3. **Nomenclatura do Prisma:** Respeitar rigidamente os nomes do `schema.prisma` (ex: `aberta_em`, `mesa_id`, `StatusComanda: ABERTA | AGUARDANDO_PAGAMENTO | PAGA`).
4. **Fluxo da Comanda:** - Cliente pede -> Status `ABERTA`, Status Preparo `FILA`.
   - Cozinha finaliza -> Status muda para `AGUARDANDO_PAGAMENTO`.
   - Caixa recebe -> Status muda para `PAGA`, registra em `MovimentacaoCaixa`.

## ✅ O Que Já Foi Realizado (Concluído)
- [x] **Banco de Dados:** Schema completo criado (Restaurantes, Usuarios, Clientes, Mesas, Caixas, Categorias, Produtos, Comandas, Itens).
- [x] **Painel do Gerente (`Gerenciamento.tsx`):** CRUD completo de Produtos com exclusão lógica e auto-criação de novas Categorias.
- [x] **Cardápio Digital (`Cardapio.tsx`):** Leitura de produtos, separação por categorias, carrinho de compras funcional, campo de observação por item e envio de pedidos.
- [x] **Dashboard da Cozinha (`Dashboard.tsx`):** Tela com auto-refresh a cada 10s, exibindo mesas ativas, produtos, quantidades, observações destacadas em amarelo e botão de concluir pedido.
- [x] **Integração de Comandas:** Backend corrigido para salvar itens aninhados (`create: dto.itens.map(...)`) sem cair no limbo e lidar com IDs de mesas de forma dinâmica.

## ⏳ O Que Falta Fazer (Próximos Passos Imediatos)
- [ ] **Módulo de Caixa / Fechamento de Conta (`Caixa.tsx`):** - Tela para o gerente/caixa visualizar as comandas com status `AGUARDANDO_PAGAMENTO` e `ABERTA`.
  - Exibir o extrato detalhado do pedido usando a rota `:id/conta`.
  - Mostrar o cálculo do Subtotal + 10% de Taxa de Serviço.
  - Botão de "Receber Pagamento" que chama a rota `:id/fechar`, alterando o status para `PAGA` e gerando a entrada no banco de dados (`MovimentacaoCaixa`).

## 🚀 Futuras Implementações (Backlog / Ideias)
- [ ] **Autenticação:** Implementar fluxo de login real (`Login.tsx`) com JWT e proteger as rotas do Frontend de acordo com o cargo (`Cargo: GARCOM, CAIXA, GERENTE, COZINHA`).
- [ ] **WebSockets:** Substituir o `setInterval` (polling de 10s) do Dashboard da Cozinha por Socket.io, para que os pedidos apareçam instantaneamente sem precisar recarregar.
- [ ] **Impressão:** Criar funcionalidade para imprimir o extrato da comanda em impressoras térmicas (não fiscal).
- [ ] **QR Code das Mesas:** Gerar e imprimir QR Codes únicos para cada mesa, que já abrem o link `/mesa/{numero}` no celular do cliente.
- [ ] **Fidelidade/Cadastro:** Permitir que o cliente insira o CPF na hora de abrir a comanda para histórico de compras.

## 🤖 Regras de Resposta para a IA (Gemini)
- Sempre valide os nomes dos campos com o `schema.prisma` antes de sugerir códigos de Backend.
- Sempre entregue os blocos de código completos ao realizar alterações.
- Mantenha o design usando a paleta do Tailwind (tons de red, gray-800/900 para a cozinha, design clean para o cardápio).

## 🎨 Diretrizes de UI/UX (Foco em Design Premium)
- **Obrigatório:** O frontend não pode ser básico. O objetivo é criar um visual **Profissional, Moderno e Premium**.
- **Para o Cliente (Cardápio):** Interface focada em conversão, com animações suaves (transitions), sombras modernas (shadow-xl, shadow-md), bordas arredondadas e excelente usabilidade no mobile.
- **Para o Staff (Cozinha/Caixa/Gerência):** Telas de alta performance, visual limpo, espaçamento inteligente (UI/UX moderno), feedback visual claro de sucesso/erro e layout bem estruturado (grids e flexbox).
- **Ferramentas:** Abusar do Tailwind CSS (efeitos glassmorphism, hover states elegantes, gradients sutis) e da biblioteca `lucide-react`.