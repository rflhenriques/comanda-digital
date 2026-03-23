export class CreateComandaDto {
  restaurante_id: string;
  mesa_id?: string;
  cliente_id?: string;
  itens: { 
    produto_id: string; 
    quantidade: number; 
    observacao?: string 
  }[];
}