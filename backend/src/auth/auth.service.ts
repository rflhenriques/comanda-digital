import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsuariosService } from "../usuarios/usuarios.service";
import * as bcrypt from 'bcrypt';
import { Cargo } from "@prisma/client";

@Injectable()
export class AuthService{
    constructor(
        private usuariosService: UsuariosService,
        private jwtService: JwtService
    ) {}

    async login(email: string, senhaLimpa: string) {
        const usuario = await this.usuariosService.findByEmail(email);

        if (!usuario) {
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        const senhaValida = await bcrypt.compare(senhaLimpa, usuario.senha_hash);

        if (!senhaValida) {
            throw new UnauthorizedException('E-mail ou senha inválidos');
        }

        const payload = {
            sub: usuario.id,
            email: usuario.email,
            cargo: usuario.cargo,
            restaurante_id: usuario.restaurante_id 
        };

        return {
            acess_token: await this.jwtService.signAsync(payload),
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                cargo: usuario.cargo
            }
        };
    }
} 