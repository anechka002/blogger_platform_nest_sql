import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {
    console.log('PostsRepository');
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.PostModel.findById(id);
    if (!post) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }
    return post;
  }

  async create(post: Post): Promise<PostDocument> {
    const postDocument = new this.PostModel(post);
    await postDocument.save();
    return postDocument;
  }

  async save(post: PostDocument) {
    await post.save();
  }
}
