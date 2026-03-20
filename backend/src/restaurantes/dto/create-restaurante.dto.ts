import { Plano } from '@prisma/client';

export class CreateRestauranteDto {
  nome_fantasia: string;
  cnpj: string;
  plano?: Plano;
  limite_mesas?: number;
}