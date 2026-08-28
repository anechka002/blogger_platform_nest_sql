import { BlogDocument } from '../../domain/blog.entity';
import { ApiProperty } from '@nestjs/swagger';

export class BlogViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  websiteUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  isMembership: boolean;

  static mapToView(blog: BlogDocument): BlogViewDto {
    const dto = new this();

    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;
    return dto;
  }
}
