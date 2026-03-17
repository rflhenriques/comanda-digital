import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { PrismaService } from '../prisma.service';
import { StatusComanda } from '@prisma/client';

@Injectable()
export class ComandasService {
  constructor(private prisma: PrismaService) {}

  async create(createComandaDto: CreateComandaDto) {
    return this.prisma.comanda.create({
      data: createComandaDto,
    });
  }

  async findOpenByRestaurante(restauranteId: string) {
    return this.prisma.comanda.findMany({
      where: { restaurante_id: restauranteId, status: 'ABERTA' },
      include: { cliente: true, mesa: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.comanda.findUnique({
      where: { id },
      include: {
        cliente: true,
        mesa: true,
        itens: { include: { produto: true } }
      }
    });
  }

  async fecharConta(id: string) {
    const comanda = await this.prisma.comanda.findUnique({
      where: { id },
      include: { itens: { include: { produto: true } } }
    });

    if (!comanda) throw new NotFoundException('Comanda não encontrada');

    let subtotal = 0;
    for (const item of comanda.itens) {
      subtotal += item.quantidade * Number(item.produto.preco);
    }

    const gorjeta = subtotal * 0.10; 
    const totalComTaxa = subtotal + gorjeta;
    const totalSemTaxa = subtotal;

    const comandaFechada = await this.prisma.comanda.update({
      where: { id },
      data: {
        status: StatusComanda.AGUARDANDO_PAGAMENTO,
      }
    });

    return {
      comanda_id: comandaFechada.id,
      resumo_financeiro: {
        subtotal: Number(subtotal.toFixed(2)),
        valor_da_taxa_10: Number(gorjeta.toFixed(2)),
        opcoes_de_pagamento: {
          TOTAL_COM_TAXA: Number(totalComTaxa.toFixed(2)),
          TOTAL_SEM_TAXA: Number(totalSemTaxa.toFixed(2)),
        },
        sugestao_divisao_com_taxa: {
          por_2_pessoas: Number((totalComTaxa / 2).toFixed(2)),
          por_3_pessoas: Number((totalComTaxa / 3).toFixed(2)),
          por_4_pessoas: Number((totalComTaxa / 4).toFixed(2)),
        }
      }
    };
  }

  async pagarConta(id: string) {
    return this.prisma.comanda.update({
      where: { id },
      data: {
        status: StatusComanda.PAGA,
        fechada_em: new Date(), 
      }
    });
  }
}