import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './commentator-info.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { LikeStatus } from '../../../../core/enum/like-status';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 300 })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  @Prop({ type: Date })
  createdAt: Date;
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createComment(dto: CreateCommentDto): Comment {
    const comment = new this();

    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.commentatorInfo = dto.commentatorInfo;

    return comment;
  }

  makeDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Comment is already deleted');
    }
    this.deletedAt = new Date();
  }

  updateContent(content: string): void {
    if (!content.trim()) {
      throw new Error('Comment content cannot be empty');
    }
    this.content = content;
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

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
