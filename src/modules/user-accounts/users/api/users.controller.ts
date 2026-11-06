import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewModel } from './view-dto/user.view-model';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/admin/create-user.use-case';
import { DeleteUserCommand } from '../application/use-cases/public/delete-user.use-case';
import { CreateUserSwagger } from './swagger/users/create-user.swagger.decorator';
import { DeleteUserSwagger } from './swagger/users/delete-user.swagger.decorator';
import { GetUserByIdSwagger } from './swagger/users/get-user-by-id.swagger.decorator';
import { GetUsersSwagger } from './swagger/users/get-users.swagger.decorator';
import { UsersSqlQueryRepository } from '../infrastructure/query/users-sql.query-repository';
// import { Public } from '../guards/decorators/public.decorator';

@Controller('/sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  // @Public()
  @GetUsersSwagger()
  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginationViewDto<UserViewModel>> {
    const result = await this.usersSqlQueryRepository.findAllUsers(query);

    const items = result.users.map((u) => {
      return UserViewModel.mapToView(u);
    });

    return PaginationViewDto.mapToView({
      items,
      totalCount: result.totalCount,
      pageSize: query.pageSize,
      page: query.pageNumber,
    });
  }

  @GetUserByIdSwagger()
  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserViewModel> {
    const user = await this.usersSqlQueryRepository.getByIdOrNotFoundFail(id);
    return UserViewModel.mapToView(user);
  }

  @CreateUserSwagger()
  @Post()
  async createUser(
    @Body(new ValidationPipe()) body: CreateUserInputDto,
  ): Promise<UserViewModel> {
    // Отправка команды в шину команд
    const userId = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand(body),
    );
    const user =
      await this.usersSqlQueryRepository.getByIdOrNotFoundFail(userId);
    return UserViewModel.mapToView(user);
  }

  @DeleteUserSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute<DeleteUserCommand, void>(
      new DeleteUserCommand(id),
    );
  }
}
