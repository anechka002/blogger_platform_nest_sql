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

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {
    console.log('CommentsQueryRepository');
  }

  async getByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return CommentViewDto.mapToView(comment, LikeStatus.None);
  }

  async findCommentsByPostId(
    postId: string,
    query: GetPostsQueryParams,
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

    const items = comments.map((comment) => {
      return CommentViewDto.mapToView(comment, LikeStatus.None);
    });

    return PaginationViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }
}
