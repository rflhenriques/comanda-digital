import { Module } from '@nestjs/common';
import { ItensService } from './itens.service';
import { ItensController } from './itens.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ItensController],
  providers: [ItensService, PrismaService],
})
export class ItensModule {}
