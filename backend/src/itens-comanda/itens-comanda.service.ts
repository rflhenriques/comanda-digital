import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateItensComandaDto } from './dto/create-itens-comanda.dto';
import { PrismaService } from '../prisma.service';
import { StatusPreparo } from '@prisma/client';

@Injectable()
export class ItensComandaService {
  constructor(private prisma: PrismaService) {}

  async adicionarItem(dto: CreateItensComandaDto) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id: dto.comanda_id },
    });

    if (!comanda || comanda.status !== 'ABERTA') {
      throw new BadRequestException('Não é possível adicionar itens a uma comanda fechada ou inexistente!');
    }

    return this.prisma.itemComanda.create({
      data: {
        comanda_id: dto.comanda_id,
        produto_id: dto.produto_id,
        quantidade: dto.quantidade,
        observacao: dto.observacao,
        status_preparo: 'FILA',
      },
      include: {
        produto: true,
      }
    });
  }

  async removerItem(id: string) {
    return this.prisma.itemComanda.delete({
      where: { id },
    });
  }

  listarParaCozinha(restauranteId:string) {
    return this.prisma.itemComanda.findMany({
      where: {
        comanda: { restaurante_id: restauranteId},
        status_preparo: { in: ['FILA', 'PREPARANDO']}
      },
      include: {
        produto: true,
        comanda: { include: { mesa: true} }
      },
      orderBy: { pedido_em: 'asc' }
    });
  }

  async atualizarStatus(id:string, status: StatusPreparo) {
    return this.prisma.itemComanda.update ({
      where: { id },
      data: { status_preparo: status}
    });
  }
}