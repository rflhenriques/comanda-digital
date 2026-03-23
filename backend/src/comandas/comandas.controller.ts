import { Controller, Get, Post, Body, Query, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  abrir(@Body() dto: CreateComandaDto) {
    return this.comandasService.abrirComanda(dto, dto.restaurante_id);
  }

  @Get()
  listar(@Query('restaurante_id') restauranteId: string) {
    return this.comandasService.listarAbertas(restauranteId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/conta')
  conta(@Param('id') id: string) {
    return this.comandasService.obterConta(id);
  }

  @Patch(':id/concluir')
  concluir(@Param('id') id: string) {
    return this.comandasService.concluirPedido(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/fechar')
  fechar(@Param('id') id: string, @Request() req) {
    return this.comandasService.fecharComanda(id, req.user.userId);
  }
}