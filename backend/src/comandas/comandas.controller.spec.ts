import { Test, TestingModule } from '@nestjs/testing';
import { ComandasController } from './comandas.controller';
import { ComandasService } from './comandas.service';

describe('ComandasController', () => {
  let controller: ComandasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComandasController],
      providers: [ComandasService],
    }).compile();

    controller = module.get<ComandasController>(ComandasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
