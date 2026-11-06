import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import request from 'supertest';

import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';

type IdResponse = { id: string };
type LoginResponse = { accessToken: string };
type CreatedCommentResponse = { id: string; createdAt: string };

describe('CommentsController (e2e)', () => {
  let app: INestApplication<Server>;

  const basicAuth = {
    username: 'admin',
    password: 'qwerty',
  };

  const validBlogDto = {
    name: 'Test blog',
    description: 'Test blog description',
    websiteUrl: 'https://test-blog.com',
  };

  const validPostDto = {
    title: 'Test post',
    shortDescription: 'Test post shortDescription',
    content: 'content',
  };

  const validUserDto = {
    login: 'testauthor',
    email: 'author@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication<Server>>();
    appSetup(app);
    await app.init();
  });

  beforeEach(async () => {
    await request(app.getHttpServer())
      .delete('/app/testing/all-data')
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /app/comments/:id', () => {
    it('should return an existing comment without authorization', async () => {
      const server = app.getHttpServer();
      const content = 'This is a valid test comment.';

      const blogResponse = await request(server)
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as IdResponse;

      const postResponse = await request(server)
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const post = postResponse.body as IdResponse;

      const authorResponse = await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      const author = authorResponse.body as IdResponse;

      const loginResponse = await request(server)
        .post('/app/auth/login')
        .send({
          loginOrEmail: validUserDto.login,
          password: validUserDto.password,
        })
        .expect(200);

      const { accessToken } = loginResponse.body as LoginResponse;

      const commentResponse = await request(server)
        .post(`/app/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content })
        .expect(201);

      const comment = commentResponse.body as CreatedCommentResponse;

      const response = await request(server)
        .get(`/app/comments/${comment.id}`)
        .expect(200);

      expect(typeof comment.createdAt).toBe('string');
      expect(response.body).toEqual({
        id: comment.id,
        content,
        commentatorInfo: {
          userId: author.id,
          userLogin: validUserDto.login,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });

    it('should return 404 if the comment does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/app/comments/${randomUUID()}`)
        .expect(404);
    });
  });

  describe('DELETE /app/comments/:id', () => {
    let commentId: string;
    let authorToken: string;

    async function createUserAndGetToken(
      user: typeof validUserDto,
    ): Promise<string> {
      const server = app.getHttpServer();

      await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(user)
        .expect(201);

      const loginResponse = await request(server)
        .post('/app/auth/login')
        .send({
          loginOrEmail: user.login,
          password: user.password,
        })
        .expect(200);

      const { accessToken } = loginResponse.body as LoginResponse;
      return accessToken;
    }

    beforeEach(async () => {
      const server = app.getHttpServer();

      const blogResponse = await request(server)
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as IdResponse;

      const postResponse = await request(server)
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const post = postResponse.body as IdResponse;
      authorToken = await createUserAndGetToken(validUserDto);

      const commentResponse = await request(server)
        .post(`/app/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ content: 'This is a valid test comment.' })
        .expect(201);

      commentId = (commentResponse.body as IdResponse).id;
    });

    it('should let the author delete the comment', async () => {
      const server = app.getHttpServer();

      await request(server)
        .delete(`/app/comments/${commentId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(204);

      await request(server).get(`/app/comments/${commentId}`).expect(404);
    });

    it('should return 401 without a token', async () => {
      await request(app.getHttpServer())
        .delete(`/app/comments/${commentId}`)
        .expect(401);
    });

    it('should return 403 when deleting another user’s comment', async () => {
      const otherToken = await createUserAndGetToken({
        ...validUserDto,
        login: 'otheruser',
        email: 'other@example.com',
      });

      const server = app.getHttpServer();

      await request(server)
        .delete(`/app/comments/${commentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      await request(server).get(`/app/comments/${commentId}`).expect(200);
    });

    it('should return 404 if the comment does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/app/comments/${randomUUID()}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(404);
    });
  });

  describe('PUT /app/comments/:id', () => {
    const originalContent = 'This is the original test comment.';
    const updatedContent = 'This is the updated test comment.';

    let commentId: string;
    let authorToken: string;

    async function createUserAndGetToken(
      user: typeof validUserDto,
    ): Promise<string> {
      const server = app.getHttpServer();

      await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(user)
        .expect(201);

      const loginResponse = await request(server)
        .post('/app/auth/login')
        .send({
          loginOrEmail: user.login,
          password: user.password,
        })
        .expect(200);

      const { accessToken } = loginResponse.body as LoginResponse;
      return accessToken;
    }

    beforeEach(async () => {
      const server = app.getHttpServer();

      const blogResponse = await request(server)
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const { id: blogId } = blogResponse.body as IdResponse;

      const postResponse = await request(server)
        .post(`/app/sa/blogs/${blogId}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const { id: postId } = postResponse.body as IdResponse;
      authorToken = await createUserAndGetToken(validUserDto);

      const commentResponse = await request(server)
        .post(`/app/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ content: originalContent })
        .expect(201);

      commentId = (commentResponse.body as IdResponse).id;
    });

    it('should let the author update the comment', async () => {
      const server = app.getHttpServer();

      await request(server)
        .put(`/app/comments/${commentId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ content: updatedContent })
        .expect(204);

      const response = await request(server)
        .get(`/app/comments/${commentId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: commentId,
        content: updatedContent,
      });
    });

    it('should return 401 without a token', async () => {
      await request(app.getHttpServer())
        .put(`/app/comments/${commentId}`)
        .send({ content: updatedContent })
        .expect(401);
    });

    it('should return 403 when updating another user’s comment', async () => {
      const otherToken = await createUserAndGetToken({
        ...validUserDto,
        login: 'otheruser',
        email: 'other@example.com',
      });

      const server = app.getHttpServer();

      await request(server)
        .put(`/app/comments/${commentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ content: updatedContent })
        .expect(403);

      const response = await request(server)
        .get(`/app/comments/${commentId}`)
        .expect(200);

      expect(response.body).toMatchObject({ content: originalContent });
    });

    it('should return 404 if the comment does not exist', async () => {
      await request(app.getHttpServer())
        .put(`/app/comments/${randomUUID()}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ content: updatedContent })
        .expect(404);
    });

    it('should return 400 if content is empty', async () => {
      await request(app.getHttpServer())
        .put(`/app/comments/${commentId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ content: '' })
        .expect(400);
    });
  });

  describe('PUT /app/comments/:id/like-status', () => {
    let commentId: string;
    let accessToken: string;

    beforeEach(async () => {
      const server = app.getHttpServer();

      const blogResponse = await request(server)
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const { id: blogId } = blogResponse.body as IdResponse;

      const postResponse = await request(server)
        .post(`/app/sa/blogs/${blogId}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const { id: postId } = postResponse.body as IdResponse;

      await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      const loginResponse = await request(server)
        .post('/app/auth/login')
        .send({
          loginOrEmail: validUserDto.login,
          password: validUserDto.password,
        })
        .expect(200);

      accessToken = (loginResponse.body as LoginResponse).accessToken;

      const commentResponse = await request(server)
        .post(`/app/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'This is a valid test comment.' })
        .expect(201);

      commentId = (commentResponse.body as IdResponse).id;
    });

    it('should set, change and remove the reaction', async () => {
      const server = app.getHttpServer();

      const steps = [
        { likeStatus: 'Like', likesCount: 1, dislikesCount: 0 },
        { likeStatus: 'Dislike', likesCount: 0, dislikesCount: 1 },
        { likeStatus: 'None', likesCount: 0, dislikesCount: 0 },
      ];

      for (const { likeStatus, likesCount, dislikesCount } of steps) {
        await request(server)
          .put(`/app/comments/${commentId}/like-status`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ likeStatus })
          .expect(204);

        const response = await request(server)
          .get(`/app/comments/${commentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body).toMatchObject({
          id: commentId,
          likesInfo: {
            likesCount,
            dislikesCount,
            myStatus: likeStatus,
          },
        });
      }
    });

    it('should return 401 without a Bearer token', async () => {
      await request(app.getHttpServer())
        .put(`/app/comments/${commentId}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(401);
    });

    it('should return 404 if the comment does not exist', async () => {
      await request(app.getHttpServer())
        .put(`/app/comments/${randomUUID()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(404);
    });

    it('should return 400 if likeStatus is invalid', async () => {
      await request(app.getHttpServer())
        .put(`/app/comments/${commentId}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'InvalidStatus' })
        .expect(400);
    });
  });
});
