import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ComandasService {
  constructor(private prisma: PrismaService) {}

  // 1. ABRIR OU ATUALIZAR COMANDA (CHECK-IN E PEDIDO)
  async abrirComanda(dto: any, restauranteId: string) {
    let idDaMesa = dto.mesa_id;

    // 1. Auto-criação de Mesas
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

    // 2. Localiza ou Cria o Cliente pelo CPF
    let clienteId = dto.cliente_id;
    if (dto.cpf && dto.nome) {
      let cliente = await this.prisma.cliente.findFirst({
        where: { cpf: dto.cpf, restaurante_id: restauranteId }
      });
      if (!cliente) {
        cliente = await this.prisma.cliente.create({
          data: { cpf: dto.cpf, nome: dto.nome, restaurante_id: restauranteId }
        });
      }
      clienteId = cliente.id;
    }

    // 3. 🛡️ VERIFICAÇÃO DE SEGURANÇA (O DONO DA MESA)
    if (idDaMesa) {
      const comandaAberta = await this.prisma.comanda.findFirst({
        where: { mesa_id: idDaMesa, status: 'ABERTA' }
      });

      if (comandaAberta) {
        // Se a mesa tem dono e o CPF é diferente: TRAVA TOTAL.
        if (comandaAberta.cliente_id && clienteId && comandaAberta.cliente_id !== clienteId) {
          throw new BadRequestException('Esta mesa já está sendo utilizada por outro cliente.');
        }

        // Se o CPF for o mesmo, vamos atualizar. Se não tiver itens, apenas retornamos a comanda (Check-in)
        if (dto.itens && dto.itens.length > 0) {
          return this.prisma.comanda.update({
            where: { id: comandaAberta.id },
            data: {
              cliente_id: clienteId || comandaAberta.cliente_id,
              itens: {
                create: dto.itens.map((item: any) => ({
                  produto_id: item.produto_id,
                  quantidade: item.quantidade,
                  observacao: item.observacao || '',
                  status_preparo: 'FILA'
                }))
              }
            },
            include: { mesa: true, itens: true }
          });
        }
        
        // Retorno preventivo: Se já existe comanda e não tem itens novos, para aqui.
        return comandaAberta;
      }
    }

    // 4. CRIAR NOVA COMANDA (Só chega aqui se a mesa estiver REALMENTE vazia)
    const novaComanda: any = {
      status: 'ABERTA',
      restaurante: { connect: { id: restauranteId } },
      itens: {
        create: (dto.itens || []).map((item: any) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          observacao: item.observacao || '',
          status_preparo: 'FILA' 
        }))
      }
    };

    if (idDaMesa) novaComanda.mesa = { connect: { id: idDaMesa } };
    if (clienteId) novaComanda.cliente = { connect: { id: clienteId } };

    return this.prisma.comanda.create({
      data: novaComanda,
      include: { mesa: true, itens: true }
    });
  }

  // 2. LISTAR PARA COZINHA E CAIXA
  async listarAbertas(restauranteId: string) {
    return this.prisma.comanda.findMany({
      where: { 
        restaurante_id: restauranteId, 
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

  // 5. FECHAR COMANDA (Pagamento)
  async fecharComanda(id: string, usuarioId: string) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id },
      include: { 
        mesa: true,
        restaurante: true,
        itens: { include: { produto: true } } 
      },
    });

    if (!comanda || comanda.status === 'PAGA') throw new BadRequestException('Comanda inválida.');

    const subtotal = comanda.itens.reduce((acc, item) => acc + (Number(item.produto.preco) * item.quantidade), 0);
    const totalGeral = subtotal * 1.10;

    let caixa = await this.prisma.caixa.findFirst({
      where: { restaurante_id: comanda.restaurante_id, status: 'ABERTO' },
    });
    
    if (!caixa) {
      caixa = await this.prisma.caixa.create({
        data: {
          valor_inicial: 0,
          status: 'ABERTO',
          restaurante_id: comanda.restaurante_id,
          usuario_id: usuarioId,
        }
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.comanda.update({
        where: { id },
        data: { status: 'PAGA', fechada_em: new Date() },
      });

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