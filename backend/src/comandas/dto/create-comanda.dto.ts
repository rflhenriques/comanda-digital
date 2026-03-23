export class CreateComandaDto {
  restaurante_id: string;
  mesa_id?: string;
  cliente_id?: string;
  mesa_numero?: number;
  itens: { 
    produto_id: string; 
    quantidade: number; 
    observacao?: string 
  }[];
}