import { Cargo } from '@prisma/client';

export class CreateUsuarioDto {
    nome: string;
    email: string;
    senha: string;
    cargo?: Cargo;
    restaurante_id: string; 
}