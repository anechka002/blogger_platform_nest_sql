import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: PasswordService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

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
