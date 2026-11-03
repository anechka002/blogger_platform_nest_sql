import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { GetCommentByIdSwagger } from './swagger/get-comment-by-id.swagger.decorator';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { CommentForPostInputDto } from './input-dto/comment-for-post.input-dto';
import { ExtractUserFromRequest } from '../../../../core/decorators/user/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/users/guards/dto/user-context.dto';
import { JwtAuthGuard } from '../../../../core/guards/bearer/jwt-auth.guard';
import { UpdateCommentSwagger } from './swagger/update-comment.swagger.decorator';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { DeleteCommentSwagger } from './swagger/delete-comment.swagger.decorator';
import { LikeStatusInputDto } from '../../../../core/dto/like-status.input-dto';
import { UpdateLikeStatusCommand } from '../application/use-cases/update-like-status.use-case';
import { LikeStatusForCommentSwagger } from './swagger/like-status-for-comment.swagger.decorator';
import { JwtOptionalAuthGuard } from '../../../../core/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequestOptional } from '../../../../core/decorators/user/param/extract-user-from-request-optional.decorator';
import { CommentsSqlQueryRepository } from '../infrastructure/query/comments-sql.query-repository';
import { CommentMapper } from './mappers/comment.mapper';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsSqlQueryRepository: CommentsSqlQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly commentMapper: CommentMapper,
  ) {}

  @GetCommentByIdSwagger()
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @ExtractUserFromRequestOptional() user: UserContextDto | null,
  ): Promise<CommentViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    const comment = await this.commentsSqlQueryRepository.getByIdOrNotFoundFail(
      id,
      user?.id,
    );

    return this.commentMapper.toCommentViewModel(comment);
  }

  @UpdateCommentSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: CommentForPostInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(user.id, commentId, body),
    );
  }

  @DeleteCommentSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute<DeleteCommentCommand, void>(
      new DeleteCommentCommand(user.id, commentId),
    );
  }

  @LikeStatusForCommentSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  async updateLikeStatus(
    @Param('commentId') commentId: string,
    @Body() body: LikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute<UpdateLikeStatusCommand, void>(
      new UpdateLikeStatusCommand(user.id, commentId, body),
    );
  }
}
