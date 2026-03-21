import { Controller, Get, Post, Body, UseGuards, Request, Query, Param, Patch } from '@nestjs/common';
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
  findAll(@Query('restaurante_id') restauranteId: string) {
    if (!restauranteId) {
      return [];
    }
    return this.produtosService.findAll(restauranteId);
  }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Cargo.GERENTE)
    update(@Param('id') id: string, @Body() updateData: any) {
    return this.produtosService.update(id, updateData);
  }
}