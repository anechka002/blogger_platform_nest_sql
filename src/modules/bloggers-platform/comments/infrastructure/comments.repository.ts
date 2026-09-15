import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import type { CommentModelType } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {
    console.log('CommentsRepository');
  }

  async createComment(comment: Comment): Promise<CommentDocument> {
    const commentDocument = new this.CommentModel(comment);
    await commentDocument.save();
    return commentDocument;
  }
}
