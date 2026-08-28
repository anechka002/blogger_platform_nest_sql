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
  ) {
    console.log('PostsQueryRepository');
  }
  async findAllPosts(
    query: GetPostsQueryParams,
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

    const items = posts.map((post) => {
      const newestLikes = allLikesForPosts
        .filter((like) => like.post_id === post._id.toString())
        .slice(0, 3);
      return ExtendedPostViewDto.mapExtendedToView(
        post,
        LikeStatus.None,
        newestLikes,
      );
    });

    return PaginationViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<ExtendedPostViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return ExtendedPostViewDto.mapExtendedToView(post, LikeStatus.None, []);
  }

  async findPostsByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
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

    const items = posts.map((post) => {
      return ExtendedPostViewDto.mapExtendedToView(post, LikeStatus.None, []);
    });

    return PaginationViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }
}
