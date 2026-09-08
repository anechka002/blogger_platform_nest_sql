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
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { BlogsService } from '../application/blogs-service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { PaginationViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { ExtendedPostViewDto } from '../../posts/api/view-dto/extended-post.view-dto';
import { CreatePostForBlogInputDto } from './input-dto/create-post-for-blog.input-dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { BlogsPaginationViewDto } from './view-dto/blogs-pagination.view-dto';
import { PostsPaginationViewDto } from '../../posts/api/view-dto/posts-pagination.view-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {
    console.log('BlogsController');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Return blog by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Existing blog id',
    type: String,
  })
  @ApiOkResponse({
    description: 'Success',
    type: BlogViewDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Return blogs with paging',
  })
  @ApiOkResponse({
    description: 'Success',
    type: BlogsPaginationViewDto,
  })
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginationViewDto<BlogViewDto>> {
    return this.blogsQueryRepository.findAllBlogs(query);
  }

  @ApiOperation({
    summary: 'Create new blog',
  })
  @ApiBody({
    description: 'Data for constructing new Blog entity',
    type: CreateBlogInputDto,
  })
  @ApiCreatedResponse({
    description: 'Returns the newly created blog',
    type: BlogViewDto,
  })
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Update existing Blog by id with InputModel',
  })
  @ApiNoContentResponse({
    description: 'No Content',
  })
  @ApiNotFoundResponse({
    description: 'No Content',
  })
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<BlogViewDto> {
    const blogId = await this.blogsService.updateBlog(id, body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete blog specified by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Blog id',
    type: String,
  })
  @ApiNoContentResponse({
    description: 'No Content',
  })
  @ApiNotFoundResponse({
    description: 'No Content',
  })
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }

  @Get(':blogId/posts')
  @ApiOperation({
    summary: 'Returns all posts for specific blog',
  })
  @ApiOkResponse({
    description: 'Success',
    type: PostsPaginationViewDto,
  })
  @ApiNotFoundResponse({
    description: 'If specified blog is not exists',
  })
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    return this.postsQueryRepository.findPostsByBlogId(blogId, query);
  }

  @Post(':blogId/posts')
  @ApiOperation({
    summary: 'Create new post for specific blog',
  })
  @ApiBody({
    description: 'Data for constructing new Post entity',
    type: CreatePostForBlogInputDto,
  })
  @ApiCreatedResponse({
    description: 'Returns the newly created post',
    type: ExtendedPostViewDto,
  })
  @ApiNotFoundResponse({
    description: "If specified blog doesn't exists",
  })
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<ExtendedPostViewDto> {
    const postId = await this.blogsService.createPostForBlog(blogId, body);
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
