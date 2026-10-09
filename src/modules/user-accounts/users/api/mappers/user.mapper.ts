import { UserRow } from '../../infrastructure/query/users-sql.query-repository';
import { CurrentUserViewModel } from '../view-dto/current-user.view-model';

export class UserMapper {
  public toCurrentUsersViewModel(user: UserRow): CurrentUserViewModel {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
