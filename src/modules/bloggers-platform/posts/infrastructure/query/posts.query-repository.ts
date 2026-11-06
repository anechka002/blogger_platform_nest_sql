import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { QueryFilter } from 'mongoose';
import { ExtendedPostViewDto } from '../../api/view-dto/extended-post.view-dto';
import { PostLike } from '../../domain/post-like.entity';
import type { PostLikeModelType } from '../../domain/post-like.entity';
import { LikeStatus } from '../../../../../core/enum/like-status';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  async findAllPosts(
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
    const filter: QueryFilter<Post> = { deletedAt: null };

    const posts = await this.PostModel.find(filter)
      .skip(query.calculateSkip())
      .sort({ [query.sortBy]: query.sortDirection })
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    const postsIds = posts.map((post) => post._id.toString());

    const allLikesForPosts = await this.PostLikeModel.find({
      post_id: { $in: postsIds },
      status: LikeStatus.Like,
    }).sort({
      updatedAt: -1,
      _id: -1,
    });

    const userReactions = userId
      ? await this.PostLikeModel.find({
          post_id: { $in: postsIds },
          user_id: userId,
        })
      : [];

    const items = posts.map((post) => {
      const postId = post._id.toString();

      const newestLikes = allLikesForPosts
        .filter((like) => like.post_id === postId)
        .slice(0, 3);

      const userReaction = userReactions.find(
        (reaction) => reaction.post_id === postId,
      );

      const myStatus = userReaction?.status ?? LikeStatus.None;

      return ExtendedPostViewDto.mapExtendedToView(post, myStatus, newestLikes);
    });

    return PaginationViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<ExtendedPostViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const userReaction = userId
      ? await this.PostLikeModel.findOne({ post_id: id, user_id: userId })
      : null;

    const myStatus = userReaction?.status ?? LikeStatus.None;

    // Получаем последние три реакции со статусом Like.
    const newestLikes = await this.PostLikeModel.find({
      post_id: id,
      status: LikeStatus.Like,
    })
      .sort({ updatedAt: -1 })
      .limit(3);

    return ExtendedPostViewDto.mapExtendedToView(post, myStatus, newestLikes);
  }

  async findPostsByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginationViewDto<ExtendedPostViewDto>> {
    const filter: QueryFilter<Post> = {
      blogId,
      deletedAt: null,
    };
    const posts = await this.PostModel.find(filter)
      .skip(query.calculateSkip())
      .sort({ [query.sortBy]: query.sortDirection })
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    const postsIds = posts.map((post) => post._id.toString());

    const allLikesForPosts = await this.PostLikeModel.find({
      post_id: { $in: postsIds },
      status: LikeStatus.Like,
    }).sort({
      updatedAt: -1,
      _id: -1,
    });

    const userReactions = userId
      ? await this.PostLikeModel.find({
          post_id: { $in: postsIds },
          user_id: userId,
        })
      : [];

    const items = posts.map((post) => {
      const postId = post._id.toString();

      const newestLikes = allLikesForPosts
        .filter((like) => like.post_id === postId)
        .slice(0, 3);

      const userReaction = userReactions.find(
        (reaction) => reaction.post_id === postId,
      );

      const myStatus = userReaction?.status ?? LikeStatus.None;

      return ExtendedPostViewDto.mapExtendedToView(post, myStatus, newestLikes);
    });

    return PaginationViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }
}
