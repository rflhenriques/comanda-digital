import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateItensComandaDto } from './dto/create-itens-comanda.dto';
import { PrismaService } from '../prisma.service';
import { StatusPreparo } from '@prisma/client';
import { ComandasGateway } from '../comandas/comandas.gateway';

@Injectable()
export class ItensComandaService {
  constructor(
    private prisma: PrismaService,
    private readonly gateway: ComandasGateway,
  ) {}

  async adicionarItem(dto: CreateItensComandaDto) {
  if (!dto.comanda_id) {
    throw new BadRequestException('O ID da comanda é obrigatório.');
  }

  const comanda = await this.prisma.comanda.findUnique({
    where: { id: dto.comanda_id },
  });

    const novoItem = await this.prisma.itemComanda.create({
      data: {
        comanda_id: dto.comanda_id,
        produto_id: dto.produto_id,
        quantidade: dto.quantidade,
        observacao: dto.observacao,
        status_preparo: 'FILA',
      },
      include: {
        produto: true,
        comanda: { include: { mesa: true } },
      },
    });

    this.gateway.notificarNovoPedido(novoItem.comanda.restaurante_id, novoItem);

    return novoItem;
  }

  async removerItem(id: string) {
    return this.prisma.itemComanda.delete({
      where: { id },
    });
  }

  listarParaCozinha(restauranteId: string) {
    return this.prisma.itemComanda.findMany({
      where: {
        comanda: { restaurante_id: restauranteId },
        status_preparo: { in: ['FILA', 'PREPARANDO'] },
      },
      include: {
        produto: true,
        comanda: { include: { mesa: true } },
      },
      orderBy: { pedido_em: 'asc' },
    });
  }

  async atualizarStatus(id: string, status: StatusPreparo) {
    const itemAtualizado = await this.prisma.itemComanda.update({
      where: { id },
      data: { status_preparo: status },
      include: {
        produto: true,
        comanda: { include: { mesa: true } },
      },
    });

    this.gateway.notificarPronto(itemAtualizado.comanda.restaurante_id, itemAtualizado);

    return itemAtualizado;
  }
}