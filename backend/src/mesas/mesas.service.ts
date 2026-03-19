import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

  async create(createMesaDto: CreateMesaDto, restauranteId: string) {
    const mesaExiste = await this.prisma.mesa.findFirst({
      where: {
        numero: createMesaDto.numero,
        restaurante_id: restauranteId,
      },
    });

    if (mesaExiste) {
      throw new BadRequestException(`A Mesa número ${createMesaDto.numero} já existe neste restaurante!`);
    }

    return this.prisma.mesa.create({
      data: {
        numero: createMesaDto.numero,
        restaurante_id: restauranteId,
      },
    });
  }

  findAll(restauranteId: string) {
    return this.prisma.mesa.findMany({
      where: { restaurante_id: restauranteId },
      orderBy: { numero: 'asc' },
    });
  }
}