import { TipoMovimentacao } from '@prisma/client';

export class CreateMovimentacaoDto {
    descricao: string;
    valor: number;
    tipo: TipoMovimentacao;
}