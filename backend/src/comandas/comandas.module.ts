import { Module } from '@nestjs/common';
import { ComandasService } from './comandas.service';
import { ComandasController } from './comandas.controller';
import { PrismaService } from '../prisma.service';
import { ComandasGateway } from './comandas.gateway'; 

@Module({
  controllers: [ComandasController],
  providers: [ComandasService, PrismaService, ComandasGateway],
  exports: [ComandasGateway],
})
export class ComandasModule {}