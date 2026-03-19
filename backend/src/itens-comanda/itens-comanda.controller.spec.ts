import { Test, TestingModule } from '@nestjs/testing';
import { ItensComandaController } from './itens-comanda.controller';
import { ItensComandaService } from './itens-comanda.service';

describe('ItensComandaController', () => {
  let controller: ItensComandaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItensComandaController],
      providers: [ItensComandaService],
    }).compile();

    controller = module.get<ItensComandaController>(ItensComandaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
