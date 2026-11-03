import { UserWithConfirmationRow } from '../users.external-query-repository';

export class UserExternalDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  isEmailConfirmed: boolean;

  static mapToView(user: UserWithConfirmationRow): UserExternalDto {
    const dto = new UserExternalDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user.id;
    dto.createdAt = user.createdAt;
    dto.isEmailConfirmed = user.isConfirmed;

    return dto;
  }
}
