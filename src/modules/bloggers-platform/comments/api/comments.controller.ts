import { Controller, Get, Param } from '@nestjs/common';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {
    console.log('CommentsController');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Return comment by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Existing comment id',
    type: String,
  })
  @ApiOkResponse({
    description: 'Success',
    type: CommentViewDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  async getById(@Param('id') id: string): Promise<CommentViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
  }
}
