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
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/admin/create-user.use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user.use-case';
import { Types } from 'mongoose';
import { CreateUserSwagger } from './swagger/users/create-user.swagger.decorator';
import { DeleteUserSwagger } from './swagger/users/delete-user.swagger.decorator';
import { GetUserByIdSwagger } from './swagger/users/get-user-by-id.swagger.decorator';
import { GetUsersSwagger } from './swagger/users/get-users.swagger.decorator';
// import { Public } from '../guards/decorators/public.decorator';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
  ) {
    console.log('UsersController created');
  }

  // @Public()
  @GetUsersSwagger()
  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginationViewDto<UserViewDto>> {
    return this.usersQueryRepository.findAllUsers(query);
  }

  @GetUserByIdSwagger()
  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.usersQueryRepository.getByIdOrNotFoundFail(id);
  }

  @CreateUserSwagger()
  @Post()
  async createUser(
    @Body(new ValidationPipe()) body: CreateUserInputDto,
  ): Promise<UserViewDto> {
    // Отправка команды в шину команд
    const userId = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand(body),
    );
    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @DeleteUserSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteUser(@Param() id: Types.ObjectId): Promise<void> {
    return this.commandBus.execute<DeleteUserCommand, void>(
      new DeleteUserCommand(id),
    );
  }
}
