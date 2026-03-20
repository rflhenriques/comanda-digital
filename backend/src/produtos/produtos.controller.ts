import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Cargo } from '@prisma/client';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Cargo.GERENTE)
  create(@Body() createProdutoDto: CreateProdutoDto, @Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.produtosService.create(createProdutoDto, restauranteId);
  }

  @Get()
  @Roles(Cargo.GERENTE, Cargo.CAIXA, Cargo.GARCOM)
  findAll(@Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.produtosService.findAll(restauranteId);
  }
}