import { Injectable } from "@nestjs/common";
import { CreateProdutoDto } from "./dto/create-produto.dto";
import { PrismaService } from "../prisma.service";
import { UpdateProdutoDto } from "./dto/update-produto.dto";

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService ) {}

  async create(CreateProdutoDto: CreateProdutoDto){
    return this.prisma.produto.create({
      data: CreateProdutoDto,
    });
  }

  async findAll() {
    return this.prisma.produto.findMany();
  }

  async findAllByRestaurante(restaurante_id: string){
    return this.prisma.produto.findMany({
      where: {restaurante_id: restaurante_id}, 
    });
  }

  async findOne(id: string) {
    return this.prisma.produto.findUnique({where: { id }});
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto ) {
    return this.prisma.produto.update({
      where: { id },
      data: updateProdutoDto, 
    });
  }

  async remove ( id: string ){
    return this.prisma.produto.delete({ where: { id }});
  }
}