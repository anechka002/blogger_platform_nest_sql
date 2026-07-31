import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { BcryptService } from './bcrypt.service';

@Injectable()
export class UsersService {
  //инжектирование модели через DI
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;

    const passwordHash: string =
      await this.bcryptService.generateHash(password);

    const user = User.createInstance({ login, email, passwordHash });

    const savedUser = await this.usersRepository.create(user);

    return savedUser._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
