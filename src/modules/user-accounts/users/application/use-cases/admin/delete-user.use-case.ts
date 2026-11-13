import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(public usersSqlRepository: UsersSqlRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const id = command.id;

    const user = await this.usersSqlRepository.findById(id);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    await this.usersSqlRepository.delete(id);
  }
}
