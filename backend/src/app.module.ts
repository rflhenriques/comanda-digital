import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { RestaurantesModule } from './restaurantes/restaurantes.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProdutosModule } from './produtos/produtos.module';
import { MesasModule } from './mesas/mesas.module';

@Module({
  imports: [RestaurantesModule, ClientesModule, ProdutosModule, MesasModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
