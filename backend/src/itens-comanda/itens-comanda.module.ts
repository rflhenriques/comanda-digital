import { Module } from '@nestjs/common';
import { ItensComandaService } from './itens-comanda.service';
import { ItensComandaController } from './itens-comanda.controller';
import { PrismaService } from '../prisma.service';
import { ComandasModule } from '../comandas/comandas.module';

@Module({
  imports: [ComandasModule],
  controllers: [ItensComandaController],
  providers: [ItensComandaService, PrismaService],
})
export class ItensComandaModule {}