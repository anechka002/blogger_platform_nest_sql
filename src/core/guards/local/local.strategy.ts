import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../../modules/user-accounts/users/application/services/auth.service';
import { UserContextDto } from '../../../modules/user-accounts/users/guards/dto/user-context.dto';
import { DomainException } from '../../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../exceptions/domain-exception-codes';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
      passwordField: 'password',
    });
  }

  //validate возвращает то, что впоследствии будет записано в req.user
  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto> {
    const user = await this.authService.validateUser(loginOrEmail, password);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
    }

    return user;
  }
}
