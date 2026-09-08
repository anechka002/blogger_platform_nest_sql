import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../dto/user-context.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from './bcrypt.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
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

  async login(userId: string) {
    const accessToken = await this.jwtService.signAsync({ id: userId });
    return { accessToken };
  }
}
