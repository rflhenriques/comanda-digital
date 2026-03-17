import { Injectable } from '@nestjs/common';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService ) {}

  async create (createMesaDto: CreateMesaDto) {
    return this.prisma.mesa.create ({
      data:createMesaDto, 
    });
  }

  async findAllByRestaurante(restauranteId: string) { 
    return this.prisma.mesa.findMany({
      where: { restaurante_id: restauranteId },
      orderBy: { numero: 'asc' },
    });
  }

  async findOne (id: string) {
    return this.prisma.mesa.findUnique ({where:{ id } });
  }

  async remove ( id:string ) {
    return this.prisma.mesa.delete ({where: { id }});
  }
}