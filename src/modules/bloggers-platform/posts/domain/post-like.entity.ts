import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDto } from '../dto/create-post.dto';
import { LikeStatus } from '../../comments/api/view-dto/comment.view-dto';

@Schema({ timestamps: true })
export class PostLike {
  @Prop({ type: String, required: true })
  post_id: string;
  @Prop({ type: String, required: true })
  user_id: string;
  @Prop({ type: String, required: true })
  user_login: string;
  @Prop({
    type: String,
    required: true,
    enum: [LikeStatus.Like, LikeStatus.Dislike],
  })
  status: string;

  @Prop({ type: Date, required: true })
  updatedAt: Date;
  @Prop({ type: Date, required: true })
  createdAt: Date;
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createInstancePostLike(dto: CreatePostDomainDto): PostLike {
    const post = new this();

    // post.title = dto.title;
    // post.content = dto.content;
    // post.blogId = dto.blogId;
    // post.shortDescription = dto.shortDescription;
    // post.blogName = dto.blogName;
    post.createdAt = new Date();
    post.deletedAt = null;

    return post;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

PostLikeSchema.loadClass(PostLike);

export type PostLikeDocument = HydratedDocument<PostLike>;

export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;
