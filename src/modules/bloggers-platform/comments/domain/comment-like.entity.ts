import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../../../core/enum/like-status';

@Schema({ timestamps: true })
export class CommentLike {
  @Prop({ type: String, required: true })
  comment_id: string;

  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({
    type: String,
    enum: [LikeStatus.Like, LikeStatus.Dislike],
    required: true,
  })
  status: LikeStatus;

  static createReaction({
    commentId,
    userId,
    status,
  }: {
    commentId: string;
    userId: string;
    status: LikeStatus;
  }): CommentLike {
    const reaction = new this();

    reaction.comment_id = commentId;
    reaction.user_id = userId;
    reaction.status = status;

    return reaction;
  }

  changeStatus(status: LikeStatus): void {
    this.status = status;
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

// Один user может иметь только одну реакцию на один comment
CommentLikeSchema.index({ comment_id: 1, user_id: 1 }, { unique: true });

CommentLikeSchema.loadClass(CommentLike);

export type CommentLikeDocument = HydratedDocument<CommentLike>;

export type CommentLikeModelType = Model<CommentLikeDocument> &
  typeof CommentLike;
