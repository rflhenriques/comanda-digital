import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  abrirComanda(@Body() createComandaDto: CreateComandaDto, @Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.comandasService.abrirComanda(createComandaDto, restauranteId);
  }

  @Get('abertas')
  listarAbertas(@Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.comandasService.listarAbertas(restauranteId);
  }

  @Get(':id/conta')
  obterConta(@Param('id') id: string) {
    return this.comandasService.obterConta(id);
  }

  @Patch(':id/fechar')
  fechar(@Param('id') id: string, @Request() req) {
    const usuarioId = req.user.userId;
    return this.comandasService.fecharComanda(id, usuarioId);
  }
}