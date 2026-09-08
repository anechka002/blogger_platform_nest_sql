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
import { UsersService } from '../application/users.service';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersPaginationViewDto } from './view-dto/users-pagination.view-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
// import { Public } from '../decorators/public.decorator';
import { IdInputDto } from './input-dto/id.input-dto';
import { APIErrorResult } from '../../../../core/exceptions/filters/api-error-result';

@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {
    console.log('UsersController created');
  }

  // @Public()
  @Get()
  @ApiOperation({
    summary: 'Return all users',
  })
  @ApiOkResponse({
    description: 'Success',
    type: UsersPaginationViewDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginationViewDto<UserViewDto>> {
    return this.usersQueryRepository.findAllUsers(query);
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
  @ApiBadRequestResponse({
    description:
      'If the inputModel has incorrect values.\n' +
      '\n' +
      'Note: If the error should be in the BLL, for example, "the email address is not unique", do not try to mix this error with input validation errors in the middleware, just return one element in the errors array\n' +
      '\n',
    type: APIErrorResult,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createUser(
    @Body(new ValidationPipe()) body: CreateUserInputDto,
  ): Promise<UserViewDto> {
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
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  deleteUser(@Param() id: IdInputDto): Promise<void> {
    return this.usersService.deleteUser(id.id);
  }
}
