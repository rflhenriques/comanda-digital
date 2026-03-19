import { Controller, Post, Body, UseGuards, Delete, Param, Get, Patch, Request } from '@nestjs/common';
import { ItensComandaService } from './itens-comanda.service';
import { CreateItensComandaDto } from './dto/create-itens-comanda.dto';
import { UpdateItemStatusDto } from './dto/update-itens-comanda.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('itens-comanda')
export class ItensComandaController {
  constructor(private readonly itensComandaService: ItensComandaService) {}

  @Post()
  create(@Body() createItemComandaDto: CreateItensComandaDto) {
    return this.itensComandaService.adicionarItem(createItemComandaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itensComandaService.removerItem(id);
  }

  @Get('cozinha')
  listarParaCozinha(@Request() req){
    const restauranteId = req.user.restaurante_id;
    return this.itensComandaService.listarParaCozinha(restauranteId);
  }

  @Patch(':id/status')
  atualizarStatus(@Param('id') id:string, @Body() dto: UpdateItemStatusDto) {
    return this.itensComandaService.atualizarStatus(id, dto.status);
  }
}