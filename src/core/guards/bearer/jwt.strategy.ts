import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserContextDto } from '../../../modules/user-accounts/users/guards/dto/user-context.dto';
import { ExtractJwt } from 'passport-jwt';

type JwtPayload = {
  userId: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'access-token-secret',
    });
  }

  //validate возвращает то, что впоследствии будет записано в req.user
  async validate(payload: JwtPayload): Promise<UserContextDto> {
    return {
      id: payload.userId,
    };
  }
}
