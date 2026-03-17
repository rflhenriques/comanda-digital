import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';

@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  create(@Body() createComandaDto: CreateComandaDto) {
    return this.comandasService.create(createComandaDto);
  }

  @Get()
  findAll(@Query('restauranteId') restauranteId: string) {
    return this.comandasService.findOpenByRestaurante(restauranteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { 
    return this.comandasService.findOne(id);
  }

  @Patch(':id/fechar')
  fecharConta(@Param('id') id: string) {
    return this.comandasService.fecharConta(id);
  }

  @Patch(':id/pagar')
  pagarConta(@Param('id') id: string) {
    return this.comandasService.pagarConta(id);
  }
}
