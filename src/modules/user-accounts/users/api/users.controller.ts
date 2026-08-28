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
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UsersService } from '../application/users.service';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { UsersPaginationViewDto } from './view-dto/users-pagination.view-dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {
    console.log('UsersController created');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Return user by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Existing user id',
    type: String,
  })
  @ApiOkResponse({
    description: 'Success',
    type: UserViewDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  async getById(@Param('id') id: string): Promise<UserViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.usersQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Return all users',
  })
  @ApiOkResponse({
    description: 'Success',
    type: UsersPaginationViewDto,
  })
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginationViewDto<UserViewDto>> {
    return this.usersQueryRepository.findAllUsers(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Add new user to the system',
  })
  @ApiBody({
    description: 'Data for constructing new user',
    type: CreateUserInputDto,
  })
  @ApiCreatedResponse({
    description: 'Returns the newly created user',
    type: UserViewDto,
  })
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.usersService.createUser(body);
    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user specified by id',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    type: String,
  })
  @ApiNoContentResponse({
    description: 'No Content',
  })
  @ApiNotFoundResponse({
    description: 'If specified user is not exists',
  })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
