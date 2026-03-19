import { Module } from '@nestjs/common';
import { CaixaService } from './caixa.service';
import { CaixaController } from './caixa.controller';
import { PrismaService } from '../prisma.service';
@Module({
  controllers: [CaixaController],
  providers: [CaixaService, PrismaService],
})
export class CaixaModule {}