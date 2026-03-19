import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Cargo } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  @Roles(Cargo.GERENTE)
  create(@Body() createMesaDto: CreateMesaDto, @Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.mesasService.create(createMesaDto, restauranteId);
  }

  @Get()
  @Roles(Cargo.GERENTE, Cargo.CAIXA, Cargo.GARCOM)
  findAll(@Request() req) {
    const restauranteId = req.user.restaurante_id;
    return this.mesasService.findAll(restauranteId);
  }
}