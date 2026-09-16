import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../../../core/enum/like-status';

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
  status: LikeStatus;

  @Prop({ type: Date })
  updatedAt: Date;
  @Prop({ type: Date })
  createdAt: Date;
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createReaction({
    postId,
    userId,
    userLogin,
    status,
  }: {
    postId: string;
    userId: string;
    userLogin: string;
    status: LikeStatus;
  }): PostLike {
    const reaction = new this();

    reaction.post_id = postId;
    reaction.user_id = userId;
    reaction.user_login = userLogin;
    reaction.status = status;

    return reaction;
  }

  changeStatus(status: LikeStatus): void {
    this.status = status;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

PostLikeSchema.loadClass(PostLike);

export type PostLikeDocument = HydratedDocument<PostLike>;

export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;
