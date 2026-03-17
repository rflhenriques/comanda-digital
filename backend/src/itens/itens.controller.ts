import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ItensService } from './itens.service';
import { CreateItemDto } from './dto/create-item.dto';

@Controller('itens')
export class ItensController {
  constructor(private readonly itensService: ItensService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itensService.create(createItemDto);
  }

  @Get()
  findAllByComanda(@Query('comandaId') comandaId: string) {
    return this.itensService.findAllByComanda(comandaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itensService.remove(id);
  }
}