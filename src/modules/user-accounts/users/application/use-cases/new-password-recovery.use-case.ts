import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { NewPasswordRecoveryDto } from '../../dto/new-password-recovery.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PasswordService } from '../services/password.service';

export class NewPasswordRecoveryCommand {
  constructor(public dto: NewPasswordRecoveryDto) {}
}

@CommandHandler(NewPasswordRecoveryCommand)
export class NewPasswordRecoveryUseCase implements ICommandHandler<
  NewPasswordRecoveryCommand,
  void
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute({ dto }: NewPasswordRecoveryCommand): Promise<void> {
    const { newPassword, recoveryCode } = dto;

    const user = await this.usersRepository.findByRecoveryCode(recoveryCode);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is incorrect',
        extensions: [
          { message: 'Recovery code is incorrect', key: 'recoveryCode' },
        ],
      });
    }

    if (
      !user.passwordRecovery.expirationDate ||
      user.passwordRecovery.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'Recovery code is expired',
        extensions: [
          { message: 'Recovery code is expired', key: 'recoveryCode' },
        ],
      });
    }

    const newPasswordHash =
      await this.passwordService.generateHash(newPassword);

    user.completePasswordRecovery(newPasswordHash);

    await this.usersRepository.save(user);
  }
}
