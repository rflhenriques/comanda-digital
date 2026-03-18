import { Controller, Post, Body, Param, Patch, UseGuards, Get } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { RolesGuard } from '../auth/roles.guard'; 
import { Roles } from '../auth/roles.decorator'; 
import { Cargo } from '@prisma/client'; 

@UseGuards(JwtAuthGuard, RolesGuard) 
@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Post()
  @Roles(Cargo.GARCOM, Cargo.GERENTE)
  create(@Body() createComandaDto: CreateComandaDto) {
    return this.comandasService.create(createComandaDto);
  }

  @Get('restaurante/:id')
  @Roles(Cargo.GARCOM, Cargo.CAIXA, Cargo.GERENTE)
  findOpenByRestaurante(@Param('id') restauranteId: string) {
    return this.comandasService.findOpenByRestaurante(restauranteId);
  }

  @Get(':id')
  @Roles(Cargo.GARCOM, Cargo.CAIXA, Cargo.GERENTE) 
  findOne(@Param('id') id: string) {
    return this.comandasService.findOne(id);
  }

  @Patch(':id/fechar')
  @Roles(Cargo.GARCOM, Cargo.GERENTE)
  fecharConta(@Param('id') id: string) {
    return this.comandasService.fecharConta(id);
  }

  @Patch(':id/pagar')
  @Roles(Cargo.CAIXA, Cargo.GERENTE)
  pagarConta(@Param('id') id: string) {
    return this.comandasService.pagarConta(id);
  }
}