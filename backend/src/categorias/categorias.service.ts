import { Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  create(createCategoriaDto: CreateCategoriaDto, restauranteId: string) {
    return this.prisma.categoria.create({
      data: {
        nome: createCategoriaDto.nome,
        restaurante_id: restauranteId,
      },
    });
  }

  findAll(restauranteId: string) {
    return this.prisma.categoria.findMany({
      where: {
        restaurante_id: restauranteId,
      },
    });
  }
}
