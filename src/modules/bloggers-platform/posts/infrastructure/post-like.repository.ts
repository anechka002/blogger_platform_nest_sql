import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostLike, PostLikeDocument } from '../domain/post-like.entity';
import type { PostLikeModelType } from '../domain/post-like.entity';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectModel(PostLike.name)
    private PostLikeModel: PostLikeModelType,
  ) {}

  async findReaction({
    postId,
    userId,
  }: {
    postId: string;
    userId: string;
  }): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({
      post_id: postId,
      user_id: userId,
    });
  }

  async createReaction(reaction: PostLike): Promise<void> {
    const reactionDocument = new this.PostLikeModel(reaction);
    await reactionDocument.save();
  }

  async deleteReaction({
    postId,
    userId,
  }: {
    postId: string;
    userId: string;
  }): Promise<void> {
    await this.PostLikeModel.deleteOne({
      post_id: postId,
      user_id: userId,
    });
  }

  async updateReaction(reaction: PostLike): Promise<void> {
    const reactionDocument = new this.PostLikeModel(reaction);
    await reactionDocument.save();
  }
}
