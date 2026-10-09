import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { PasswordService } from './password.service';
import { UsersSqlRepository } from '../../infrastructure/users-sql.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersSqlRepository: UsersSqlRepository,
    private bcryptService: PasswordService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersSqlRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const isPasswordCorrect = await this.bcryptService.checkPassword({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordCorrect) {
      return null;
    }

    return { id: user.id.toString() };
  }
}
