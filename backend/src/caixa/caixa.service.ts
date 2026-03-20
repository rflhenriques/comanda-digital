import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCaixaDto } from './dto/create-caixa.dto';
import { UpdateCaixaDto } from './dto/update-caixa.dto';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CaixaService {
  constructor(private prisma: PrismaService) {}

  async abrirCaixa(createCaixaDto: CreateCaixaDto, usuarioId: string, restauranteId: string) {
    const caixaJaAberto = await this.prisma.caixa.findFirst({
      where: {
        restaurante_id: restauranteId,
        status: 'ABERTO',
      },
    });

    if (caixaJaAberto) {
      throw new BadRequestException('Já existe um caixa aberto! Feche-o antes de abrir um novo.');
    }

    return this.prisma.caixa.create({
      data: {
        valor_inicial: createCaixaDto.valor_inicial,
        status: 'ABERTO',
        restaurante: { connect: { id: restauranteId } },
        usuario: { connect: { id: usuarioId } }, 
      },
    });
  }

  async fecharCaixa(updateCaixaDto: UpdateCaixaDto, restauranteId: string) {
    const caixaAberto = await this.prisma.caixa.findFirst({
      where: {
        restaurante_id: restauranteId,
        status: 'ABERTO',
      },
    });

    if (!caixaAberto) {
      throw new BadRequestException('Não existe nenhum caixa aberto para ser fechado no momento.');
    }

    return this.prisma.caixa.update({
      where: { id: caixaAberto.id },
      data: {
        valor_final: updateCaixaDto.valor_final,
        status: 'FECHADO',
        fechado_em: new Date(),
      },
    });
  }

  async registrarMovimentacao(dto: CreateMovimentacaoDto, usuarioId: string, restauranteId: string) {
    const caixaAberto = await this.prisma.caixa.findFirst({
      where: {
        restaurante_id: restauranteId,
        status: 'ABERTO',
      },
    });

    if (!caixaAberto) {
      throw new BadRequestException('Não há nenhum caixa aberto para registrar esta movimentação!');
    }

    return this.prisma.movimentacaoCaixa.create({
      data: {
        descricao: dto.descricao,
        valor: dto.valor,
        tipo: dto.tipo,
        caixa_id: caixaAberto.id,
        usuario_id: usuarioId,
      },
    });
  }

  async relatorioCaixaAberto(restauranteId: string) {
    const caixa = await this.prisma.caixa.findFirst({
      where: {
        restaurante_id: restauranteId,
        status: 'ABERTO',
      },
      include: {
        movimentacoes: true,
      },
    });

    if (!caixa) {
      throw new BadRequestException('Não há caixa aberto para gerar relatório.');
    }

    let totalEntradas = 0;
    let totalSaidas = 0;

    caixa.movimentacoes.forEach(movimento => {
      if (movimento.tipo === 'ENTRADA') {
        totalEntradas += Number(movimento.valor);
      } else if (movimento.tipo === 'SAIDA') {
        totalSaidas += Number(movimento.valor);
      }
    });

    const valorInicial = Number(caixa.valor_inicial);
    const saldoEsperado = valorInicial + totalEntradas - totalSaidas;

    return {
      caixa_id: caixa.id,
      aberto_em: caixa.aberto_em,
      resumo_financeiro: {
        fundo_de_troco: valorInicial,
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        saldo_esperado_na_gaveta: saldoEsperado,
      },
      historico_detalhado: caixa.movimentacoes,
    };
  }
}