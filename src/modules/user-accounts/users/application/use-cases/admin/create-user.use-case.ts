import { UsersRepository } from '../../../infrastructure/users.repository';
import { PasswordService } from '../../services/password.service';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { User } from '../../../domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}
  async execute({ dto }: CreateUserCommand): Promise<string> {
    const { login, email, password } = dto;
    const userWithEmail = await this.usersRepository.findByEmail(email);
    if (userWithEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already exists',
        extensions: [
          {
            message: 'The email address is not unique',
            key: 'email',
          },
        ],
      });
    }

    const passwordHash: string =
      await this.passwordService.generateHash(password);

    const user = User.createUser({ login, email, passwordHash });
    const savedUser = await this.usersRepository.create(user);
    return savedUser._id.toString();
  }
}
