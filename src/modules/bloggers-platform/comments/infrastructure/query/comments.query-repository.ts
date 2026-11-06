import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import type { CommentModelType } from '../../domain/comment.entity';
import { Comment } from '../../domain/comment.entity';
import { GetPostsQueryParams } from '../../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginationViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { QueryFilter } from 'mongoose';
import { Post } from '../../../posts/domain/post.entity';
import { LikeStatus } from '../../../../../core/enum/like-status';
import { CommentLike } from '../../domain/comment-like.entity';
import type { CommentLikeModelType } from '../../domain/comment-like.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Если пользователь авторизован,
    // ищем его реакцию на комментарий.
    const userReaction = userId
      ? await this.CommentLikeModel.findOne({
          comment_id: id,
          user_id: userId,
        })
      : null;

    const myStatus = userReaction?.status ?? LikeStatus.None;

    return CommentViewDto.mapToView(comment, myStatus);
  }

  async findCommentsByPostId(
    postId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginationViewDto<CommentViewDto>> {
    const filter: QueryFilter<Post> = {
      postId,
      deletedAt: null,
    };
    const comments = await this.CommentModel.find(filter)
      .skip(query.calculateSkip())
      .sort({ [query.sortBy]: query.sortDirection })
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    const commentsIds = comments.map((comment) => comment._id.toString());

    const userReactions = userId
      ? await this.CommentLikeModel.find({
          comment_id: { $in: commentsIds },
          user_id: userId,
        })
      : [];

    const items = comments.map((comment) => {
      const commentId = comment.id.toString();

      // Если пользователь авторизован,
      // ищем его реакцию на комментарий.
      const userReaction = userReactions.find(
        (reaction) => reaction.comment_id === commentId,
      );

      const myStatus = userReaction?.status ?? LikeStatus.None;

      return CommentViewDto.mapToView(comment, myStatus);
    });

    return PaginationViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }
}
