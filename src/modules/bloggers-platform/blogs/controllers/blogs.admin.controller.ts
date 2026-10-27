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
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { ExtendedPostViewDto } from '../../posts/api/view-dto/extended-post.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { CreatePostForBlogCommand } from '../application/use-cases/create-post-for-blog.use-case';
import { BasicAuthGuard } from '../../../../core/guards/basic/basic-auth.guard';
import { BlogsSqlQueryRepository } from '../infrastructure/query/blogs-sql.query-repository';
import { PostsSqlQueryRepository } from '../../posts/infrastructure/query/posts-sql.query-repository';
import { PostMapper } from '../../posts/api/mappers/post.mapper';
import { BlogMapper } from '../api/mappers/blog.mapper';
import { GetBlogsQueryParams } from '../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../api/view-dto/blog.view-dto';
import { CreateBlogInputDto } from '../api/input-dto/blogs.input-dto';
import { UpdateBlogInputDto } from '../api/input-dto/update-blog.input-dto';
import { CreatePostForBlogInputDto } from '../api/input-dto/create-post-for-blog.input-dto';
import { CreateBlogSwagger } from '../api/swagger/admin/create-blog.swagger.decorator';
import { UpdateBlogSwagger } from '../api/swagger/admin/update-blog.swagger.decorator';
import { DeleteBlogSwagger } from '../api/swagger/admin/delete-blog.swagger.decorator';
import { CreatePostForBlogSwagger } from '../api/swagger/admin/create-post-for-blog.swagger.decorator';
import { BlogPostParamsDto } from '../api/input-dto/blog-post-params.input-dto';
import { UpdatePostForBlogCommand } from '../application/use-cases/update-post-for-blog.use-case';
import { UpdatePostForBlogInputDto } from '../api/input-dto/update-post-for-blog.input-dto';
import { UpdatePostForBlogSwagger } from '../api/swagger/admin/update-post-for-blog.swagger.decorator';
import { DeletePostForBlogCommand } from '../application/use-cases/delete-post-for-blog.use-case';
import { DeletePostForBlogSwagger } from '../api/swagger/admin/delete-post-for-blog.swagger.decorator';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { GetAdminBlogsSwagger } from '../api/swagger/admin/get-admin-blogs.swagger.decorator';
import { GetAdminPostsForBlogSwagger } from '../api/swagger/admin/get-admin-posts-for-blog.swagger.decorator';

@ApiTags('Admin / Blogs')
@ApiBasicAuth('basicAuth')
@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class AdminBlogsController {
  constructor(
    private blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly blogMapper: BlogMapper,
    private readonly postMapper: PostMapper,
  ) {
    console.log('AdminBlogsController');
  }

  @GetAdminBlogsSwagger()
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

  @GetAdminPostsForBlogSwagger()
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
    await this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);

    const result = await this.postsSqlQueryRepository.findPostsByBlogId(
      blogId,
      query,
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

  @CreateBlogSwagger()
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    const blog =
      await this.blogsSqlQueryRepository.getByIdOrNotFoundFail(blogId);

    return this.blogMapper.toCurrentBlogsViewModel(blog);
  }

  @UpdateBlogSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(id, body),
    );
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

    const post =
      await this.postsSqlQueryRepository.getByIdOrNotFoundFail(postId);

    return this.postMapper.toExtendedPostViewModel(post);
  }

  @UpdatePostForBlogSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/posts/:postId')
  async updatePostForBlog(
    @Param() params: BlogPostParamsDto,
    @Body() body: UpdatePostForBlogInputDto,
  ): Promise<void> {
    const { blogId, postId } = params;
    return this.commandBus.execute<UpdatePostForBlogCommand, void>(
      new UpdatePostForBlogCommand(blogId, postId, body),
    );
  }

  @DeletePostForBlogSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':blogId/posts/:postId')
  async deletePostForBlog(@Param() params: BlogPostParamsDto): Promise<void> {
    const { blogId, postId } = params;
    return this.commandBus.execute<DeletePostForBlogCommand, void>(
      new DeletePostForBlogCommand(blogId, postId),
    );
  }
}
