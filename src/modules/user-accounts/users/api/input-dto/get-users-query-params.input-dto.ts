//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { UserSortBy } from './user-sort-by';
import { ApiPropertyOptional } from '@nestjs/swagger';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetUsersQueryParams extends BaseQueryParams {
  @ApiPropertyOptional({ default: UserSortBy.CreatedAt })
  sortBy: UserSortBy = UserSortBy.CreatedAt;

  @ApiPropertyOptional({
    description:
      'Search term for user Login: Login should contains this term in any position',
    default: null,
    nullable: true,
    type: String,
  })
  searchLoginTerm: string | null = null;

  @ApiPropertyOptional({
    description:
      'Search term for user Email: Email should contains this term in any position',
    default: null,
    nullable: true,
    type: String,
  })
  searchEmailTerm: string | null = null;
}
