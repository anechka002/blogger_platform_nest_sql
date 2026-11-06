import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from '../domain/comment-like.entity';
import type { CommentLikeModelType } from '../domain/comment-like.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  async findReaction({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({
      comment_id: commentId,
      user_id: userId,
    });
  }

  async createReaction(reaction: CommentLike): Promise<void> {
    const reactionDocument = new this.CommentLikeModel(reaction);
    await reactionDocument.save();
  }

  async deleteReaction({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }): Promise<void> {
    await this.CommentLikeModel.deleteOne({
      comment_id: commentId,
      user_id: userId,
    });
  }

  async updateReaction(reaction: CommentLike): Promise<void> {
    const reactionDocument = new this.CommentLikeModel(reaction);
    await reactionDocument.save();
  }
}
