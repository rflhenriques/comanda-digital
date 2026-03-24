import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ComandasService {
  constructor(private prisma: PrismaService) {}

  // 1. ABRIR COMANDA (GERAR TICKET NOVO)
  async abrirComanda(dto: CreateComandaDto, restauranteId: string) {
    let idDaMesa = dto.mesa_id;

    // Auto-criação de Mesas
    if (!idDaMesa && dto.mesa_numero) {
      let mesa = await this.prisma.mesa.findFirst({
        where: { restaurante_id: restauranteId, numero: dto.mesa_numero }
      });
      if (!mesa) {
        mesa = await this.prisma.mesa.create({
          data: { numero: dto.mesa_numero, restaurante_id: restauranteId }
        });
      }
      idDaMesa = mesa.id;
    }

    // Sempre cria um NOVO Ticket na cozinha para a mesma mesa!
    const novaComanda: any = {
      status: 'ABERTA',
      restaurante: { connect: { id: restauranteId } },
      itens: {
        create: dto.itens.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          observacao: item.observacao || '',
          status_preparo: 'FILA' 
        }))
      }
    };

    if (idDaMesa) novaComanda.mesa = { connect: { id: idDaMesa } };

    return this.prisma.comanda.create({
      data: novaComanda,
      include: { itens: true }
    });
  }

  // 2. LISTAR PARA COZINHA E CAIXA
  async listarAbertas(restauranteId: string) {
    return this.prisma.comanda.findMany({
      where: { 
        restaurante_id: restauranteId, 
        // 🚀 O BUG ESTAVA AQUI! Agora o backend manda as duas!
        status: { in: ['ABERTA', 'AGUARDANDO_PAGAMENTO'] } 
      },
      include: {
        mesa: true,
        itens: { include: { produto: true } }
      },
      orderBy: { aberta_em: 'desc' } 
    });
  }

  // 3. OBTER CONTA (Extrato)
  async obterConta(id: string) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id },
      include: { 
        mesa: true,
        itens: { include: { produto: true } } 
      },
    });

    if (!comanda) throw new BadRequestException('Comanda não encontrada');

    let subtotal = 0;
    const extratoItens = comanda.itens.map((item) => {
      const precoUnitario = Number(item.produto.preco); 
      const totalItem = item.quantidade * precoUnitario;
      subtotal += totalItem;
      return {
        produto: item.produto.nome,
        quantidade: item.quantidade,
        preco_unitario: precoUnitario,
        total: totalItem,
        observacao: item.observacao
      };
    });

    const taxaServico = subtotal * 0.10;
    return {
      comanda_id: comanda.id,
      mesa: comanda.mesa?.numero || 'Balcão',
      resumo: { subtotal, taxa_servico: taxaServico, total_a_pagar: subtotal + taxaServico },
      itens: extratoItens,
    };
  }

  // 4. CONCLUIR PEDIDO (Cozinha)
  async concluirPedido(id: string) {
    return this.prisma.comanda.update({
      where: { id },
      data: { status: 'AGUARDANDO_PAGAMENTO' } 
    });
  }

  // 5. FECHAR COMANDA E RECEBER PAGAMENTO
  async fecharComanda(id: string, usuarioId: string) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id },
      include: { 
        mesa: true,
        itens: { include: { produto: true } } 
      },
    });

    if (!comanda || comanda.status === 'PAGA') throw new BadRequestException('Comanda inválida.');

    const subtotal = comanda.itens.reduce((acc, item) => acc + (Number(item.produto.preco) * item.quantidade), 0);
    const totalGeral = subtotal * 1.10;

    let caixa = await this.prisma.caixa.findFirst({
      where: { restaurante_id: comanda.restaurante_id, status: 'ABERTO' },
    });
    
    // 🚀 MÁGICA DO CAIXA: Se não tem caixa aberto, o sistema abre um automaticamente!
    if (!caixa) {
      caixa = await this.prisma.caixa.create({
        data: {
          valor_inicial: 0,
          status: 'ABERTO',
          restaurante_id: comanda.restaurante_id,
          usuario_id: usuarioId, // Vincula o caixa ao usuário que fez o login
        }
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Muda a comanda para PAGA
      await tx.comanda.update({
        where: { id },
        data: { status: 'PAGA', fechada_em: new Date() },
      });

      // 2. Registra o dinheiro entrando no fluxo de caixa
      return await tx.movimentacaoCaixa.create({
        data: {
          caixa_id: caixa.id,
          usuario_id: usuarioId,
          valor: totalGeral,
          tipo: 'ENTRADA',
          descricao: `Recebimento Mesa ${comanda.mesa?.numero || 'Avulso'}`,
        },
      });
    });
  }
}