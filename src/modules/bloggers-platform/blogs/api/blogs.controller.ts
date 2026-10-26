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
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { ExtendedPostViewDto } from '../../posts/api/view-dto/extended-post.view-dto';
import { CreatePostForBlogInputDto } from './input-dto/create-post-for-blog.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { CreatePostForBlogCommand } from '../application/use-cases/create-post-for-blog.use-case';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { CreateBlogSwagger } from './swagger/create-blog.swagger.decorator';
import { UpdateBlogSwagger } from './swagger/update-blog.swagger.decorator';
import { DeleteBlogSwagger } from './swagger/delete-blog.swagger.decorator';
import { CreatePostForBlogSwagger } from './swagger/create-post-for-blog.swagger.decorator';
import { GetBlogsSwagger } from './swagger/get-blogs.swagger.decorator';
import { GetBlogByIdSwagger } from './swagger/get-blog-by-id.swagger.decorator';
import { GetPostsForBlogSwagger } from './swagger/get-posts-for-blog.swagger.decorator';
import { Public } from '../../../../core/decorators/user/public.decorator';
import { JwtOptionalAuthGuard } from '../../../../core/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequestOptional } from '../../../../core/decorators/user/param/extract-user-from-request-optional.decorator';
import { UserContextDto } from '../../../user-accounts/users/guards/dto/user-context.dto';
import { BlogsSqlQueryRepository } from '../infrastructure/query/blogs-sql.query-repository';
import { BlogMapper } from './mappers/blog.mapper';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/query/posts-sql.query-repository';
import { PostMapper } from '../../posts/api/mappers/post.mapper';
import { LikeStatus } from '../../../../core/enum/like-status';

@UseGuards(BasicAuthGuard)
@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly blogMapper: BlogMapper,
    private readonly postMapper: PostMapper,
  ) {
    console.log('BlogsController');
  }

  @GetBlogByIdSwagger()
  @Public()
  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    const blog = await this.blogsSqlQueryRepository.getByIdOrNotFoundFail(id);
    return this.blogMapper.toCurrentBlogsViewModel(blog);
  }

  @GetBlogsSwagger()
  @Public()
  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginationViewDto<BlogViewDto>> {
    const result = await this.blogsSqlQueryRepository.findAllBlogs(query);
    console.log('blogs result:', result);
    const items = result.blogs.map((blog) => {
      return this.blogMapper.toCurrentBlogsViewModel(blog);
    });
    return PaginationViewDto.mapToView({
      items,
      totalCount: result.totalCount,
      pageSize: query.pageSize,
      page: query.pageNumber,
    });
  }

  @GetPostsForBlogSwagger()
  @Public()
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequestOptional() user: UserContextDto | null,
  ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
    await this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);

    const result = await this.postsSqlQueryRepository.findPostsByBlogId(
      blogId,
      query,
      user?.id,
    );

    // console.log('getPostsForBlog:', result);

    // const items = result.posts.map((post) => {
    //   return this.postMapper.toCurrentPostsViewModel(post);
    // });

    const items: ExtendedPostViewDto[] = result.posts.map((post) => ({
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    }));

    return PaginationViewDto.mapToView({
      items,
      totalCount: result.totalCount,
      pageSize: query.pageSize,
      page: query.pageNumber,
    });
  }

  @CreateBlogSwagger()
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    return this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @UpdateBlogSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute<UpdateBlogCommand, string>(
      new UpdateBlogCommand(id, body),
    );

    return this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @DeleteBlogSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
  }

  @CreatePostForBlogSwagger()
  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<ExtendedPostViewDto> {
    const postId = await this.commandBus.execute<
      CreatePostForBlogCommand,
      string
    >(new CreatePostForBlogCommand(blogId, body));
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
