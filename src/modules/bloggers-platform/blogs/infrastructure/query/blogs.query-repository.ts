import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../../domain/blog.entity';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { QueryFilter } from 'mongoose';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {
    console.log('BlogsQueryRepository');
  }
  async findAllBlogs(
    query: GetBlogsQueryParams,
  ): Promise<PaginationViewDto<BlogViewDto>> {
    const filter: QueryFilter<Blog> = { deletedAt: null };

    if (query.searchNameTerm) {
      filter.name = {
        $regex: query.searchNameTerm,
        $options: 'i',
      };
    }

    const blogs = await this.BlogModel.find(filter)
      .skip(query.calculateSkip())
      .sort({ [query.sortBy]: query.sortDirection })
      .limit(query.pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);

    const items = blogs.map((blog) => {
      return BlogViewDto.mapToView(blog);
    });

    return PaginationViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }
}
