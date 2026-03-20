import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateItensComandaDto {
  @IsString()
  @IsNotEmpty()
  comanda_id: string;

  @IsString()
  @IsNotEmpty()
  produto_id: string;

  @IsNumber()
  @IsNotEmpty()
  quantidade: number;

  @IsString()
  @IsOptional()
  observacao?: string;
}