import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordRecoveryDto } from '../../../dto/new-password-recovery.dto';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { PasswordService } from '../../services/password.service';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class NewPasswordRecoveryCommand {
  constructor(public dto: NewPasswordRecoveryDto) {}
}

@CommandHandler(NewPasswordRecoveryCommand)
export class NewPasswordRecoveryUseCase implements ICommandHandler<
  NewPasswordRecoveryCommand,
  void
> {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute({ dto }: NewPasswordRecoveryCommand): Promise<void> {
    const { newPassword, recoveryCode } = dto;

    const accountState =
      await this.usersSqlRepository.findByRecoveryCode(recoveryCode);
    if (!accountState) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is incorrect',
        extensions: [
          { message: 'Recovery code is incorrect', key: 'recoveryCode' },
        ],
      });
    }

    if (
      !accountState.recoveryExpirationDate ||
      accountState.recoveryExpirationDate.getTime() <= Date.now()
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

    await this.usersSqlRepository.completePasswordRecovery(
      accountState.userId,
      newPasswordHash,
    );
  }
}
