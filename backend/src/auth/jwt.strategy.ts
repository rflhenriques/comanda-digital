import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super ({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'MINHA_CHAVE_SECRETA_DO_RESTAURANTE',
        });
    }

    async validate(payload: any) {
        return {
            id: payload.sub,
            email: payload.email,
            cargo: payload.cargo,
            restaurante_id: payload.restaurante_id
        };
    }  
}