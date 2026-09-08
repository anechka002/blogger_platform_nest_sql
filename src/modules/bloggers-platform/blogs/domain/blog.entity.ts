import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { HydratedDocument, Model } from 'mongoose';
import { UpdateBlogDto } from '../dto/create-blog.dto';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 15 })
  name: string;
  @Prop({ type: String, required: true, minlength: 1, maxlength: 500 })
  description: string;
  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  websiteUrl: string;
  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;
  @Prop({ type: Date, required: true })
  createdAt: Date;
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createInstanceBlog(
    this: BlogModelType,
    dto: CreateBlogDomainDto,
  ): BlogDocument {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();
    blog.deletedAt = null;
    blog.isMembership = false;

    return blog;
  }

  update(dto: UpdateBlogDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  makeDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Blog is already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;
