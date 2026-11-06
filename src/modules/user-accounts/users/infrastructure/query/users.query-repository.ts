import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UserViewModel } from '../../api/view-dto/user.view-model';
import type { QueryFilter } from 'mongoose';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  // Найти user по id
  async getByIdOrNotFoundFail(id: string): Promise<UserViewModel> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserViewModel.mapToView(user);
  }

  // Найти список пользователей согласно переданным параметрам.
  async findAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginationViewDto<UserViewModel>> {
    // мы хотим найти только пользователей, которые не удалены.
    const filter: QueryFilter<User> = { deletedAt: null };

    if (query.searchLoginTerm) {
      // Мы проверяем, существует ли в фильтре массив $or. Если существует — используем его, если нет — создаём пустой массив.
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users = await this.UserModel.find(filter)
      .skip(query.calculateSkip())
      .sort({ [query.sortBy]: query.sortDirection })
      .limit(query.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    const items = users.map((user) => {
      return UserViewModel.mapToView(user);
    });

    // Мы передаём данные, из которых можно посчитать количество страниц, а сам расчёт прячем внутри mapToView.
    return PaginationViewDto.mapToView({
      items,
      totalCount,
      pageSize: query.pageSize,
      page: query.pageNumber,
    });
  }
}
