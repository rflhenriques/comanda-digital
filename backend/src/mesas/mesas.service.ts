import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

async create(createMesaDto: CreateMesaDto, restauranteId: string) {
    const restaurante = await this.prisma.restaurante.findUnique({
      where: { id: restauranteId }
    });

    if (!restaurante) {
      throw new BadRequestException('Restaurante não encontrado.');
    }

    const totalMesas = await this.prisma.mesa.count({
      where: { restaurante_id: restauranteId }
    });

    if (totalMesas >= restaurante.limite_mesas) {
      throw new BadRequestException(
        `Limite de mesas atingido para o plano ${restaurante.plano}. Faça upgrade para o plano PRO!`
      );
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