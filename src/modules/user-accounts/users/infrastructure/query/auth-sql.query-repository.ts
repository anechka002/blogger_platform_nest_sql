import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/me.view.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRow } from './users-sql.query-repository';

@Injectable()
export class AuthSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  // Найти me по id
  async meOrNotFoundFail(userId: string): Promise<MeViewDto> {
    const result = await this.dataSource.query<UserRow[]>(
      `
      SELECT * 
      FROM users as u
      WHERE u.id = $1
      AND u."deletedAt" IS NULL
      `,
      [userId],
    );

    const user = result[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return {
      userId: user.id,
      login: user.login,
      email: user.email,
    };
  }
}
