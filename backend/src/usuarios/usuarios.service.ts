import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuarioExiste = await this.prisma.usuario.findUnique({
      where: { email: createUsuarioDto.email},
    });

    if (usuarioExiste) {
      throw new ConflictException('Este email já está em uso no sistema.');
    }

    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(createUsuarioDto.senha, saltRounds);

    const novoUsuario = await this.prisma.usuario.create({
      data: {
        nome: createUsuarioDto.nome,
        email: createUsuarioDto.email,
        senha_hash: senhaCriptografada,
        cargo: createUsuarioDto.cargo,
        restaurante: {
          connect: { id: createUsuarioDto.restaurante_id }
        }
      },
    });

    const { senha_hash, ...usuarioSemSenha } = novoUsuario;

    return usuarioSemSenha;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }
}