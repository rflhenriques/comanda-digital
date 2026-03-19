import { Test, TestingModule } from '@nestjs/testing';
import { ItensComandaService } from './itens-comanda.service';

describe('ItensComandaService', () => {
  let service: ItensComandaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItensComandaService],
    }).compile();

    service = module.get<ItensComandaService>(ItensComandaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
