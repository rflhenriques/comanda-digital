import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { ItensComandaService } from './itens-comanda.service';
import { CreateItensComandaDto } from './dto/create-itens-comanda.dto';
import { StatusPreparo } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('itens-comanda')
export class ItensComandaController {
  constructor(private readonly itensComandaService: ItensComandaService) {}

  @Post()
  create(@Body() createItensComandaDto: CreateItensComandaDto) {
    return this.itensComandaService.adicionarItem(createItensComandaDto);
  }

  @Get('cozinha')
  listarParaCozinha(@Query('restaurante_id') restauranteId: string) {
    return this.itensComandaService.listarParaCozinha(restauranteId);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id') id: string, 
    @Body('status') status: StatusPreparo
  ) {
    return this.itensComandaService.atualizarStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itensComandaService.removerItem(id);
  }
}