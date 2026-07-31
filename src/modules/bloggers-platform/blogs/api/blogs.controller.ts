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

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {
    console.log('BlogsController');
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    // NestJS будет дожидаться, когда промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginationViewDto<BlogViewDto>> {
    return this.blogsQueryRepository.findAllBlogs(query);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<BlogViewDto> {
    const blogId = await this.blogsService.updateBlog(id, body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }
}
