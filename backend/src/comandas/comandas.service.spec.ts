import { Test, TestingModule } from '@nestjs/testing';
import { ComandasService } from './comandas.service';

describe('ComandasService', () => {
  let service: ComandasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComandasService],
    }).compile();

    service = module.get<ComandasService>(ComandasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
