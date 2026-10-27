import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlogViewDto } from '../api/view-dto/blog.view-dto';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../api/input-dto/get-blogs-query-params.input-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { ExtendedPostViewDto } from '../../posts/api/view-dto/extended-post.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogsSwagger } from '../api/swagger/public/get-blogs.swagger.decorator';
import { GetBlogByIdSwagger } from '../api/swagger/public/get-blog-by-id.swagger.decorator';
import { GetPostsForBlogSwagger } from '../api/swagger/public/get-posts-for-blog.swagger.decorator';
import { JwtOptionalAuthGuard } from '../../../../core/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequestOptional } from '../../../../core/decorators/user/param/extract-user-from-request-optional.decorator';
import { UserContextDto } from '../../../user-accounts/users/guards/dto/user-context.dto';
import { BlogsSqlQueryRepository } from '../infrastructure/query/blogs-sql.query-repository';
import { BlogMapper } from '../api/mappers/blog.mapper';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/query/posts-sql.query-repository';
import { PostMapper } from '../../posts/api/mappers/post.mapper';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly blogMapper: BlogMapper,
    private readonly postMapper: PostMapper,
  ) {
    console.log('BlogsController');
  }

  @GetBlogByIdSwagger()
  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    const blog = await this.blogsSqlQueryRepository.getByIdOrNotFoundFail(id);
    return this.blogMapper.toCurrentBlogsViewModel(blog);
  }

  @GetBlogsSwagger()
  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginationViewDto<BlogViewDto>> {
    const result = await this.blogsSqlQueryRepository.findAllBlogs(query);
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
  // @UseGuards(JwtOptionalAuthGuard)
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

  // @CreateBlogSwagger()
  // @Post()
  // async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
  //   const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
  //     new CreateBlogCommand(body),
  //   );
  //   return this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);
  // }

  // @UpdateBlogSwagger()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Put(':id')
  // async updateBlog(
  //   @Param('id') id: string,
  //   @Body() body: UpdateBlogInputDto,
  // ): Promise<BlogViewDto> {
  //   const blogId = await this.commandBus.execute<UpdateBlogCommand, string>(
  //     new UpdateBlogCommand(id, body),
  //   );
  //
  //   return this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);
  // }

  // @DeleteBlogSwagger()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Delete(':id')
  // async deleteBlog(@Param('id') id: string): Promise<void> {
  //   return this.commandBus.execute<DeleteBlogCommand, void>(
  //     new DeleteBlogCommand(id),
  //   );
  // }

  // @CreatePostForBlogSwagger()
  // @Post(':blogId/posts')
  // async createPostForBlog(
  //   @Param('blogId') blogId: string,
  //   @Body() body: CreatePostForBlogInputDto,
  // ): Promise<ExtendedPostViewDto> {
  //   const postId = await this.commandBus.execute<
  //     CreatePostForBlogCommand,
  //     string
  //   >(new CreatePostForBlogCommand(blogId, body));
  //   return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  // }
}
