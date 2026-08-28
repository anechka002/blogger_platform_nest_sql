import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from '../application/posts-service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments.query-repository';
import { ExtendedPostViewDto } from './view-dto/extended-post.view-dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { PostsPaginationViewDto } from './view-dto/posts-pagination.view-dto';
import { CommentsPaginationViewDto } from '../../comments/api/view-dto/comments-pagination.view-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {
    console.log('BlogsController');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Return post by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Existing post id',
    type: String,
  })
  @ApiOkResponse({
    description: 'Success',
    type: ExtendedPostViewDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  async getById(@Param('id') id: string): Promise<ExtendedPostViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Return all posts',
  })
  @ApiOkResponse({
    description: 'Success',
    type: PostsPaginationViewDto,
  })
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
    return this.postsQueryRepository.findAllPosts(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new post',
  })
  @ApiBody({
    description: 'Data for constructing new post entity',
    type: CreatePostInputDto,
  })
  @ApiCreatedResponse({
    description: 'Returns the newly created post',
    type: ExtendedPostViewDto,
  })
  async createPost(
    @Body() body: CreatePostInputDto,
  ): Promise<ExtendedPostViewDto> {
    const postId = await this.postsService.createPost(body);
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update existing post by id with InputModel',
  })
  @ApiParam({
    name: 'id',
    description: 'Existing post id',
    type: String,
  })
  @ApiBody({
    description: 'Data for updating',
    type: UpdatePostInputDto,
  })
  @ApiNoContentResponse({
    description: 'No Content',
  })
  @ApiNotFoundResponse({
    description: 'No Content',
  })
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<ExtendedPostViewDto> {
    const postId = await this.postsService.updatePost(id, body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete post specified by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Post id',
    type: String,
  })
  @ApiNoContentResponse({
    description: 'No Content',
  })
  @ApiNotFoundResponse({
    description: 'No Content',
  })
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePost(id);
  }

  @Get(':postId/comments')
  @ApiOperation({
    summary: 'Returns comments for specific post',
  })
  @ApiOkResponse({
    description: 'Success',
    type: CommentsPaginationViewDto,
  })
  @ApiNotFoundResponse({
    description: "If post for passed postId doesn't exists",
  })
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginationViewDto<CommentViewDto>> {
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    return this.commentsQueryRepository.findCommentsByPostId(postId, query);
  }
}
