import { Injectable } from '@nestjs/common';
import { UserExternalDto } from './external-dto/user.external-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRow } from '../query/users-sql.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export type UserWithConfirmationRow = UserRow & {
  isConfirmed: boolean;
};

@Injectable()
export class UsersExternalQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserExternalDto> {
    const result = await this.dataSource.query<UserWithConfirmationRow[]>(
      `
      SELECT u.*, uas."isConfirmed"
      FROM public.users as u
      JOIN public.user_account_state as uas 
        ON uas."userId" = u.id
      WHERE u.id = $1
        AND u."deletedAt" IS NULL
    `,
      [id],
    );

    const user = result[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserExternalDto.mapToView(user);
  }
}
