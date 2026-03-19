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

    return this.prisma.comanda.create({
      data: {
        cliente_id: dto.cliente_id,
        mesa_id: dto.mesa_id,
        restaurante_id: restauranteId,
        status: 'ABERTA',
      },
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

 async fecharComanda(id: string, usuarioId: string) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id },
      include: { itens: { include: { produto: true } } },
    });

    if (!comanda || comanda.status !== 'ABERTA') {
      throw new BadRequestException('Comanda não encontrada ou já fechada.');
    }

    const total = comanda.itens.reduce((acc, item) => {
      return acc + (Number(item.produto.preco) * item.quantidade);
    }, 0);

    const caixa = await this.prisma.caixa.findFirst({
      where: { restaurante_id: comanda.restaurante_id, status: 'ABERTO' },
    });

    if (!caixa) {
      throw new BadRequestException('Não há um caixa aberto!');
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
          valor: total,
          tipo: 'ENTRADA',
          descricao: `Recebimento Comanda - Mesa ${comanda.mesa_id ? 'Mesa' : 'Balcao'}`,
        },
      });
    });
  }
}