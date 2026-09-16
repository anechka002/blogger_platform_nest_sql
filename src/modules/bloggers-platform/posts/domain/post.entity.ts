import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDto } from '../dto/create-post.dto';
import { LikeStatus } from '../../../../core/enum/like-status';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 30 })
  title: string;
  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  shortDescription: string;
  @Prop({ type: String, required: true, minlength: 1, maxlength: 1000 })
  content: string;
  @Prop({ type: String, required: true })
  blogName: string;
  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;
  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  @Prop({ type: Date, required: true })
  createdAt: Date;
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createInstancePost(dto: CreatePostDomainDto): Post {
    const post = new this();

    post.title = dto.title;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.shortDescription = dto.shortDescription;
    post.blogName = dto.blogName;
    post.createdAt = new Date();
    post.deletedAt = null;

    return post;
  }

  update(dto: UpdatePostDto): void {
    this.title = dto.title;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.shortDescription = dto.shortDescription;
  }

  makeDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Post is already deleted');
    }
    this.deletedAt = new Date();
  }

  updateReactionCounters(prevStatus: LikeStatus, newStatus: LikeStatus): void {
    if (prevStatus === LikeStatus.None && newStatus === LikeStatus.Like) {
      this.likesCount += 1;
    }

    if (prevStatus === LikeStatus.None && newStatus === LikeStatus.Dislike) {
      this.dislikesCount += 1;
    }

    if (prevStatus === LikeStatus.Like && newStatus === LikeStatus.None) {
      this.likesCount -= 1;
    }

    if (prevStatus === LikeStatus.Dislike && newStatus === LikeStatus.None) {
      this.dislikesCount -= 1;
    }

    if (prevStatus === LikeStatus.Like && newStatus === LikeStatus.Dislike) {
      this.likesCount -= 1;
      this.dislikesCount += 1;
    }

    if (prevStatus === LikeStatus.Dislike && newStatus === LikeStatus.Like) {
      this.likesCount += 1;
      this.dislikesCount -= 1;
    }
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<Post>;
