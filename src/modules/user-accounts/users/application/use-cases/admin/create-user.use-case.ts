import { PasswordService } from '../../services/password.service';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly passwordService: PasswordService,
  ) {}
  async execute({ dto }: CreateUserCommand): Promise<string> {
    const { login, email, password } = dto;
    const userWithEmail = await this.usersSqlRepository.findByEmail(email);
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

    const userWithLogin = await this.usersSqlRepository.findByLogin(login);
    if (userWithLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Login already exists',
        extensions: [
          {
            message: 'The login is not unique',
            key: 'login',
          },
        ],
      });
    }

    const passwordHash: string =
      await this.passwordService.generateHash(password);

    const isConfirmed = true;

    const createdUser =
      await this.usersSqlRepository.createUserWithAccountState(
        { login, email, passwordHash },
        isConfirmed,
      );

    return createdUser.id;
  }
}
