import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async obterResumo(restauranteId: string) {
    const comandasPagas = await this.prisma.comanda.findMany({
      where: {
        restaurante_id: restauranteId,
        status: 'PAGA',
      },
      include: {
        itens: {
          include: { produto: true },
        },
      },
    });

    let faturamentoTotal = 0;
    const rankingProdutos: Record<string, number> = {};

    comandasPagas.forEach((comanda) => {
      let subtotalComanda = 0;

      comanda.itens.forEach((item) => {
        const preco = Number(item.produto.preco);
        subtotalComanda += preco * item.quantidade;

        const nomeProduto = item.produto.nome;
        if (!rankingProdutos[nomeProduto]) {
          rankingProdutos[nomeProduto] = 0;
        }
        rankingProdutos[nomeProduto] += item.quantidade;
      });

      faturamentoTotal += subtotalComanda + (subtotalComanda * 0.10);
    });

    const totalComandas = comandasPagas.length;
    const ticketMedio = totalComandas > 0 ? faturamentoTotal / totalComandas : 0;

    let produtoCampeao = 'Ainda sem vendas';
    let maxVendas = 0;

    for (const [produto, quantidade] of Object.entries(rankingProdutos)) {
      if (quantidade > maxVendas) {
        maxVendas = quantidade;
        produtoCampeao = produto;
      }
    }

    return {
      indicadores: {
        total_vendas: totalComandas,
        faturamento_bruto: faturamentoTotal,
        ticket_medio: ticketMedio,
      },
      produtos: {
        campeao_de_vendas: produtoCampeao,
        quantidade_vendida: maxVendas,
      },
    };
  }
}