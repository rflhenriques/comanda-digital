import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async createOrFind(dto: CreateClienteDto) {
    let cliente = await this.prisma.cliente.findUnique({
      where: { cpf: dto.cpf },
    });

    if (!cliente) {
      cliente = await this.prisma.cliente.create({
        data: {
          cpf: dto.cpf,
          nome: dto.nome,
          telefone: dto.telefone,
        },
      });
    }

    return cliente;
  }
}