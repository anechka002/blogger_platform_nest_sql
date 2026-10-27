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
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments.query-repository';
import { ExtendedPostViewDto } from './view-dto/extended-post.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { CreatePostSwagger } from './swagger/create-post.swagger.decorator';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { UpdatePostSwagger } from './swagger/update-post.swagger.decorator';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { DeletePostSwagger } from './swagger/delete-post.swagger.decorator';
import { GetPostsSwagger } from './swagger/get-posts.swagger.decorator';
import { GetPostByIdSwagger } from './swagger/get-post-by-id.swagger.decorator';
import { GetCommentsForPostSwagger } from './swagger/get-comments-for-post.swagger.decorator';
import { CommentForPostInputDto } from '../../comments/api/input-dto/comment-for-post.input-dto';
import { ExtractUserFromRequest } from '../../../../core/decorators/user/param/extract-user-from-request.decorator';
import { CreateCommentForPostCommand } from '../../comments/application/use-cases/create-comment-for-post.use-case';
import { UserContextDto } from '../../../user-accounts/users/guards/dto/user-context.dto';
import { JwtAuthGuard } from '../../../../core/guards/bearer/jwt-auth.guard';
import { CreateCommentForPostSwagger } from '../../comments/api/swagger/create-comment-for-blog.swagger.decorator';
import { LikeStatusInputDto } from '../../../../core/dto/like-status.input-dto';
import { UpdatePostLikeStatusCommand } from '../application/use-cases/update-post-like-status.use-case';
import { LikeStatusForPostSwagger } from './swagger/like-status-for-post.swagger.decorator';
import { JwtOptionalAuthGuard } from '../../../../core/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequestOptional } from '../../../../core/decorators/user/param/extract-user-from-request-optional.decorator';
import { PostsSqlQueryRepository } from '../infrastructure/query/posts-sql.query-repository';
import { PostMapper } from './mappers/post.mapper';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private postsQueryRepository: PostsQueryRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private readonly postMapper: PostMapper,
  ) {
    console.log('PostsController');
  }

  @GetPostByIdSwagger()
  // @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @ExtractUserFromRequestOptional() user: UserContextDto | null,
  ): Promise<ExtendedPostViewDto> {
    const post = await this.postsSqlQueryRepository.getByIdOrNotFoundFail(
      id,
      user?.id,
    );
    return this.postMapper.toExtendedPostViewModel(post);
  }

  @GetPostsSwagger()
  // @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequestOptional() user: UserContextDto | null,
  ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
    const result = await this.postsSqlQueryRepository.findAllPosts(
      query,
      user?.id,
    );

    const items: ExtendedPostViewDto[] = result.posts.map((post) =>
      this.postMapper.toExtendedPostViewModel(post),
    );

    return PaginationViewDto.mapToView({
      items,
      totalCount: result.totalCount,
      pageSize: query.pageSize,
      page: query.pageNumber,
    });
  }

  // @CreatePostSwagger()
  // @UseGuards(BasicAuthGuard)
  // @Post()
  // async createPost(
  //   @Body() body: CreatePostInputDto,
  // ): Promise<ExtendedPostViewDto> {
  //   const postId = await this.commandBus.execute<CreatePostCommand, string>(
  //     new CreatePostCommand(body),
  //   );
  //   return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  // }

  // @UpdatePostSwagger()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // async updatePost(
  //   @Param('id') id: string,
  //   @Body() body: UpdatePostInputDto,
  // ): Promise<ExtendedPostViewDto> {
  //   const postId = await this.commandBus.execute<UpdatePostCommand, string>(
  //     new UpdatePostCommand(id, body),
  //   );
  //
  //   return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  // }

  // @DeletePostSwagger()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(BasicAuthGuard)
  // @Delete(':id')
  // async deletePost(@Param('id') id: string): Promise<void> {
  //   return this.commandBus.execute<DeletePostCommand, void>(
  //     new DeletePostCommand(id),
  //   );
  // }

  // @GetCommentsForPostSwagger()
  // @UseGuards(JwtOptionalAuthGuard)
  // @Get(':postId/comments')
  // async getCommentsForPost(
  //   @Param('postId') postId: string,
  //   @Query() query: GetPostsQueryParams,
  //   @ExtractUserFromRequestOptional() user: UserContextDto | null,
  // ): Promise<PaginationViewDto<CommentViewDto>> {
  //   await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  //   return this.commentsQueryRepository.findCommentsByPostId(
  //     postId,
  //     query,
  //     user?.id,
  //   );
  // }

  // @CreateCommentForPostSwagger()
  // @UseGuards(JwtAuthGuard)
  // @Post(':postId/comments')
  // async createCommentForPost(
  //   @Param('postId') postId: string,
  //   @Body() body: CommentForPostInputDto,
  //   @ExtractUserFromRequest() user: UserContextDto,
  // ): Promise<CommentViewDto> {
  //   const result = await this.commandBus.execute<
  //     CreateCommentForPostCommand,
  //     string
  //   >(new CreateCommentForPostCommand(user.id, postId, body));
  //
  //   return this.commentsQueryRepository.getByIdOrNotFoundFail(result);
  // }

  // @LikeStatusForPostSwagger()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtAuthGuard)
  // @Put(':postId/like-status')
  // async updatePostLikeStatus(
  //   @Param('postId') postId: string,
  //   @ExtractUserFromRequest() user: UserContextDto,
  //   @Body() body: LikeStatusInputDto,
  // ): Promise<void> {
  //   return this.commandBus.execute<UpdatePostLikeStatusCommand, void>(
  //     new UpdatePostLikeStatusCommand(user.id, postId, body),
  //   );
  // }
}
