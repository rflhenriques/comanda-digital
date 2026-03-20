import { Controller, Post, Body, UseGuards, Request, Patch, Get } from '@nestjs/common';
import { CaixaService } from './caixa.service';
import { CreateCaixaDto } from './dto/create-caixa.dto';
import { UpdateCaixaDto } from './dto/update-caixa.dto';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Cargo } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('caixa')
export class CaixaController {
  constructor(private readonly caixaService: CaixaService) {}

  @Post('abrir')
  @Roles(Cargo.CAIXA, Cargo.GERENTE)
  abrirCaixa(@Body() createCaixaDto: CreateCaixaDto, @Request() req) {
    const usuarioId = req.user.userId;
    const restauranteId = req.user.restaurante_id;
    return this.caixaService.abrirCaixa(createCaixaDto, usuarioId, restauranteId);
  }

  @Patch('fechar')
  @Roles(Cargo.CAIXA, Cargo.GERENTE)
  fecharCaixa(@Body() updateCaixaDto: UpdateCaixaDto, @Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.caixaService.fecharCaixa(updateCaixaDto, restauranteId);
  }

  @Post('movimento')
  @Roles(Cargo.CAIXA, Cargo.GERENTE)
  registrarMovimentacao(@Body() dto: CreateMovimentacaoDto, @Request() req) {
    const usuarioId = req.user.userId;
    const restauranteId = req.user.restaurante_id;
    return this.caixaService.registrarMovimentacao(dto, usuarioId, restauranteId);
  }

  @Get('relatorio')
  @Roles(Cargo.GERENTE)
  gerarRelatorio(@Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.caixaService.relatorioCaixaAberto(restauranteId);
  } 
}