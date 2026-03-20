import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ComandasService {
  constructor(private prisma: PrismaService) {}

  async abrirComanda(dto: CreateComandaDto, restauranteId: string) {
    if (dto.mesa_id) {
      const mesaOcupada = await this.prisma.comanda.findFirst({
        where: {
          mesa_id: dto.mesa_id,
          status: 'ABERTA',
        },
      });

      if (mesaOcupada) {
        throw new BadRequestException('Esta mesa já está ocupada com uma comanda aberta!');
      }
    }

    const dadosDaComanda: any = {
      status: 'ABERTA',
      restaurante: { connect: { id: restauranteId } },
    };

    if (dto.mesa_id) {
      dadosDaComanda.mesa = { connect: { id: dto.mesa_id } };
    }

    if (dto.cliente_id) {
      dadosDaComanda.cliente = { connect: { id: dto.cliente_id } };
    }

    return this.prisma.comanda.create({
      data: dadosDaComanda,
    });
  }

  listarAbertas(restauranteId: string) {
    return this.prisma.comanda.findMany({
      where: {
        restaurante_id: restauranteId,
        status: 'ABERTA',
      },
      include: {
        mesa: true,
        cliente: true,
        itens: {
          include: {
            produto: true
          }
        }
      },
    });
  }

  async obterConta(id: string) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id },
      include: {
        mesa: true,
        itens: { include: { produto: true } },
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
      };
    });

    const taxaServico = subtotal * 0.10;
    const totalGeral = subtotal + taxaServico;

    return {
      comanda_id: comanda.id,
      mesa: comanda.mesa ? comanda.mesa.numero : 'Balcão',
      status: comanda.status,
      itens: extratoItens,
      resumo: { subtotal, taxa_servico: taxaServico, total_a_pagar: totalGeral },
    };
  }

  async fecharComanda(id: string, usuarioId: string) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id },
      include: { itens: { include: { produto: true } }, mesa: true },
    });

    if (!comanda || comanda.status !== 'ABERTA') {
      throw new BadRequestException('Comanda não encontrada ou já fechada.');
    }

    const subtotal = comanda.itens.reduce((acc, item) => {
      return acc + (Number(item.produto.preco) * item.quantidade);
    }, 0);
    const totalComTaxa = subtotal + (subtotal * 0.10);

    const caixa = await this.prisma.caixa.findFirst({
      where: { restaurante_id: comanda.restaurante_id, status: 'ABERTO' },
    });

    if (!caixa) {
      throw new BadRequestException('Não há um caixa aberto no momento!');
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
          valor: totalComTaxa,
          tipo: 'ENTRADA',
          descricao: `Recebimento Comanda - ${comanda.mesa ? 'Mesa ' + comanda.mesa.numero : 'Balcão'}`,
        },
      });
    });
  } 
}