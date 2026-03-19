import { Injectable } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) {}

  create(createProdutoDto: CreateProdutoDto, restauranteId: string) {
    return this.prisma.produto.create({
      data: {
        nome: createProdutoDto.nome,
        descricao: createProdutoDto.descricao,
        preco: createProdutoDto.preco,
        categoria_id: createProdutoDto.categoria_id,
        restaurante_id: restauranteId,
      },
    });
  }

  findAll(restauranteId: string) {
    return this.prisma.produto.findMany({
      where: {
        restaurante_id: restauranteId,
      },
      include: {
        categoria: true,
      },
    });
  }
}