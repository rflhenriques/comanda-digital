import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ItensService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    return this.prisma.itemComanda.create({
      data: createItemDto,
    });
  }

  async findAllByComanda(comandaId: string) {
    return this.prisma.itemComanda.findMany({
      where: { comanda_id: comandaId },
      include: {
        produto: true,
      }
    });
  }

  async remove(id: string) {
    return this.prisma.itemComanda.delete({ where: { id } });
  }
}