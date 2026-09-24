import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserContextDto } from '../../../modules/user-accounts/users/guards/dto/user-context.dto';
import { ExtractJwt } from 'passport-jwt';
import { UserAccountsConfig } from '../../../modules/user-accounts/users/config/user-accounts.config';

type JwtPayload = {
  userId: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(usersAccountsConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: usersAccountsConfig.accessTokenSecret,
    });
  }

  //validate возвращает то, что впоследствии будет записано в req.user
  async validate(payload: JwtPayload): Promise<UserContextDto> {
    return {
      id: payload.userId,
    };
  }
}
