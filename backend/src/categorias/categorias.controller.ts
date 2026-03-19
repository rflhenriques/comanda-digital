import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Cargo } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @Roles(Cargo.GERENTE)
  create(@Body() createCategoriaDto: CreateCategoriaDto, @Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.categoriasService.create(createCategoriaDto, restauranteId);
  }

  @Get()
  @Roles(Cargo.GERENTE, Cargo.CAIXA, Cargo.GARCOM)
  findAll(@Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.categoriasService.findAll(restauranteId);
  }
}