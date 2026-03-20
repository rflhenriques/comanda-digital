import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RestaurantesService } from './restaurantes.service';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { Plano } from '@prisma/client';

@Controller('restaurantes')
export class RestaurantesController {
  constructor(private readonly restaurantesService: RestaurantesService) {}

  @Post()
  create(@Body() createRestauranteDto: CreateRestauranteDto) {
    return this.restaurantesService.create(createRestauranteDto);
  }

  @Patch(':id/plano')
  upgrade(
    @Param('id') id: string, 
    @Body() body: { plano: Plano, limite: number }
  ) {
    return this.restaurantesService.atualizarPlano(id, body.plano, body.limite);
  }

  @Get()
  findAll() {
    return this.restaurantesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRestauranteDto: UpdateRestauranteDto) {
    return this.restaurantesService.update(id, updateRestauranteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantesService.remove(id);
  }
}