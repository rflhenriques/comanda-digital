import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';

@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  create(@Body() createMesaDto: CreateMesaDto) {
    return this.mesasService.create(createMesaDto);
  }

  @Get()
  findAll(@Query('restauranteId') restauranteId: string ) {
    return this.mesasService.findAllByRestaurante(restauranteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mesasService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mesasService.remove(id)
  }
}