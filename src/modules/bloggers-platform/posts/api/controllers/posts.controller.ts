import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../input-dto/get-posts-query-params.input-dto';
import { CommentViewDto } from '../../../comments/api/view-dto/comment.view-dto';
import { ExtendedPostViewDto } from '../view-dto/extended-post.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { GetPostsSwagger } from '../swagger/get-posts.swagger.decorator';
import { GetPostByIdSwagger } from '../swagger/get-post-by-id.swagger.decorator';
import { GetCommentsForPostSwagger } from '../swagger/get-comments-for-post.swagger.decorator';
import { CommentForPostInputDto } from '../../../comments/api/input-dto/comment-for-post.input-dto';
import { ExtractUserFromRequest } from '../../../../../core/decorators/user/param/extract-user-from-request.decorator';
import { CreateCommentForPostCommand } from '../../application/use-cases/create-comment-for-post.use-case';
import { UserContextDto } from '../../../../user-accounts/users/guards/dto/user-context.dto';
import { JwtAuthGuard } from '../../../../../core/guards/bearer/jwt-auth.guard';
import { CreateCommentForPostSwagger } from '../../../comments/api/swagger/create-comment-for-blog.swagger.decorator';
import { LikeStatusInputDto } from '../../../../../core/dto/like-status.input-dto';
import { UpdatePostLikeStatusCommand } from '../../application/use-cases/update-post-like-status.use-case';
import { LikeStatusForPostSwagger } from '../swagger/like-status-for-post.swagger.decorator';
import { JwtOptionalAuthGuard } from '../../../../../core/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequestOptional } from '../../../../../core/decorators/user/param/extract-user-from-request-optional.decorator';
import { PostsSqlQueryRepository } from '../../infrastructure/query/posts-sql.query-repository';
import { PostMapper } from '../mappers/post.mapper';
import { CommentsSqlQueryRepository } from '../../../comments/infrastructure/query/comments-sql.query-repository';
import { CommentMapper } from '../../../comments/api/mappers/comment.mapper';
import { GetCommentsQueryParams } from '../../../comments/api/input-dto/get-comments-query-params.input-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository,
    private readonly postMapper: PostMapper,
    private readonly commentMapper: CommentMapper,
  ) {}

  @GetPostByIdSwagger()
  @UseGuards(JwtOptionalAuthGuard)
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
  @UseGuards(JwtOptionalAuthGuard)
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

  @GetCommentsForPostSwagger()
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserFromRequestOptional() user: UserContextDto | null,
  ): Promise<PaginationViewDto<CommentViewDto>> {
    await this.postsSqlQueryRepository.getByIdOrNotFoundFail(postId);
    const result = await this.commentsSqlQueryRepository.findCommentsByPostId(
      postId,
      query,
      user?.id,
    );

    const items = result.comments.map((comment) =>
      this.commentMapper.toCommentViewModel(comment),
    );

    return PaginationViewDto.mapToView({
      items,
      totalCount: result.totalCount,
      pageSize: query.pageSize,
      page: query.pageNumber,
    });
  }

  @CreateCommentForPostSwagger()
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async createCommentForPost(
    @Param('postId') postId: string,
    @Body() body: CommentForPostInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const result = await this.commandBus.execute<
      CreateCommentForPostCommand,
      string
    >(new CreateCommentForPostCommand(user.id, postId, body));

    const comment =
      await this.commentsSqlQueryRepository.getByIdOrNotFoundFail(result);

    return this.commentMapper.toCommentViewModel(comment);
  }

  @LikeStatusForPostSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  async updatePostLikeStatus(
    @Param('postId') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: LikeStatusInputDto,
  ): Promise<void> {
    return this.commandBus.execute<UpdatePostLikeStatusCommand, void>(
      new UpdatePostLikeStatusCommand(user.id, postId, body),
    );
  }
}
