import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { GetCommentByIdSwagger } from './swagger/get-comment-by-id.swagger.decorator';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { CommentForPostInputDto } from './input-dto/comment-for-post.input-dto';
import { ExtractUserFromRequest } from '../../../user-accounts/users/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/users/guards/dto/user-context.dto';
import { JwtAuthGuard } from '../../../user-accounts/users/guards/bearer/jwt-auth.guard';
import { UpdateCommentSwagger } from './swagger/update-comment.swagger.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {
    console.log('CommentsController');
  }

  @GetCommentByIdSwagger()
  @Get(':id')
  async getById(@Param('id') id: string): Promise<CommentViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
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
}
