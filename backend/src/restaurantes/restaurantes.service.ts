import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { PrismaService } from 'src/prisma.service';
import { Plano } from '@prisma/client';

@Injectable()
export class RestaurantesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRestauranteDto) {
    return this.prisma.restaurante.create({
      data: {
        nome_fantasia: dto.nome_fantasia,
        cnpj: dto.cnpj,
        plano: dto.plano || 'BASICO',
        limite_mesas: dto.limite_mesas || 10,
      },
    });
  }

  async atualizarPlano(id: string, novoPlano: Plano, novoLimite: number) {
    return this.prisma.restaurante.update({
      where: { id },
      data: {
        plano: novoPlano,
        limite_mesas: novoLimite,
      },
    });
  }

  async findAll() {
    return this.prisma.restaurante.findMany({
      include: {
        _count: {
          select: { usuarios: true, mesas: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const restaurante = await this.prisma.restaurante.findUnique({
      where: { id },
    });

    if (!restaurante) {
      throw new NotFoundException(`Restaurante com ID ${id} não encontrado.`);
    }

    return restaurante;
  }

  async update(id: string, updateRestauranteDto: UpdateRestauranteDto) {
    return this.prisma.restaurante.update({
      where: { id },
      data: updateRestauranteDto,
    });
  }

  async remove(id: string) {
    return this.prisma.restaurante.delete({
      where: { id },
    });
  }
}