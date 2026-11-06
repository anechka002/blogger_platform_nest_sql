import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { BlogViewDto } from '../../src/modules/bloggers-platform/blogs/api/view-dto/blog.view-dto';
import { PaginationViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { randomUUID } from 'node:crypto';
import { ExtendedPostViewDto } from '../../src/modules/bloggers-platform/posts/api/view-dto/extended-post.view-dto';
import { PostViewDto } from '../../src/modules/bloggers-platform/posts/api/view-dto/post.view-dto';
import { CommentViewDto } from '../../src/modules/bloggers-platform/comments/api/view-dto/comment.view-dto';

type PostResponse = Omit<PostViewDto, 'createdAt'> & {
  createdAt: string;
};

describe('PostsController (e2e)', () => {
  let app: INestApplication;

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

  describe('GET /app/sa/blogs/:blogId/posts', () => {
    it('should return posts by blogId', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const createdPost1 = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const createdPost2 = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const result = response.body as PaginationViewDto<ExtendedPostViewDto>;
      const post1 = createdPost1.body as ExtendedPostViewDto;
      const post2 = createdPost2.body as ExtendedPostViewDto;

      expect(result.totalCount).toBe(2);
      expect(result.items).toHaveLength(2);

      expect(result.items.map((post) => post.id)).toEqual(
        expect.arrayContaining([post1.id, post2.id]),
      );

      for (const post of result.items) {
        expect(post.blogId).toBe(createdBlog.id);
      }
    });

    it('should return an empty posts page for a blog without posts', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const response = await request(app.getHttpServer())
        .get(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const result = response.body as PaginationViewDto<ExtendedPostViewDto>;

      expect(result.totalCount).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should return 404 if blog does not exist', async () => {
      const nonExistingId = randomUUID();

      await request(app.getHttpServer())
        .get(`/app/sa/blogs/${nonExistingId}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(404);
    });
  });

  describe('POST /app/sa/blogs/:blogId/posts', () => {
    it('should create post', async () => {
      const response = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = response.body as BlogViewDto;

      const createdPost = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const post = createdPost.body as PostViewDto;

      expect(post.id).toEqual(expect.any(String));
      expect(post.blogId).toBe(createdBlog.id);
      expect(post.blogName).toBe(validBlogDto.name);

      expect(post.title).toBe(validPostDto.title);
      expect(post.shortDescription).toBe(validPostDto.shortDescription);
      expect(post.content).toBe(validPostDto.content);

      expect(post.createdAt).toBeDefined();
      expect(typeof post.createdAt).toBe('string');
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = response.body as BlogViewDto;

      await request(app.getHttpServer())
        .post(`/app/sa/blogs/${createdBlog.id}/posts`)
        .send(validPostDto)
        .expect(401);
    });

    it('should return 400 for incorrect input data', async () => {
      await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send({
          title: '',
          shortDescription: '',
          content: '',
        })
        .expect(400);
    });
  });

  describe('PUT /app/sa/blogs/:blogId/posts/:postId', () => {
    it('should update post', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const createPostResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const createdPost = createPostResponse.body as ExtendedPostViewDto;

      const updateDto = {
        title: 'Updated post',
        shortDescription: 'Updated description',
        content: 'update content',
      };

      await request(app.getHttpServer())
        .put(`/app/sa/blogs/${createdBlog.id}/posts/${createdPost.id}`)
        .auth(basicAuth.username, basicAuth.password)
        .send(updateDto)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const result = response.body as PaginationViewDto<ExtendedPostViewDto>;
      const updatedPost = result.items.find(
        (post) => post.id === createdPost.id,
      );

      expect(updatedPost).toBeDefined();
      expect(updatedPost).toMatchObject({
        id: createdPost.id,
        blogId: createdBlog.id,
        ...updateDto,
      });

      expect(updatedPost?.createdAt).toEqual(expect.any(String));
    });

    it('should return 401 without authorization', async () => {
      const blogId = randomUUID();
      const postId = randomUUID();

      await request(app.getHttpServer())
        .put(`/app/sa/blogs/${blogId}/posts/${postId}`)
        .send(validPostDto)
        .expect(401);
    });

    it('should return 404 if post does not exist', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = createResponse.body as BlogViewDto;
      const nonExistingPostId = randomUUID();

      await request(app.getHttpServer())
        .put(`/app/sa/blogs/${blog.id}/posts/${nonExistingPostId}`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(404);
    });

    it('should return 400 for incorrect input data', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const createPostResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const createdPost = createPostResponse.body as ExtendedPostViewDto;

      await request(app.getHttpServer())
        .put(`/app/sa/blogs/${createdBlog.id}/posts/${createdPost.id}`)
        .auth(basicAuth.username, basicAuth.password)
        .send({
          title: '',
          shortDescription: '',
          content: '',
        })
        .expect(400);
    });
  });

  describe('DELETE /app/sa/blogs/:blogId/posts/:postId', () => {
    it('should delete post', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const createPostResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const createdPost = createPostResponse.body as ExtendedPostViewDto;

      await request(app.getHttpServer())
        .delete(`/app/sa/blogs/${createdBlog.id}/posts/${createdPost.id}`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(204);

      const postsResponse = await request(app.getHttpServer())
        .get(`/app/sa/blogs/${createdBlog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const posts =
        postsResponse.body as PaginationViewDto<ExtendedPostViewDto>;

      expect(posts.totalCount).toBe(0);
      expect(posts.items).toEqual([]);
    });

    it('should return 401 without authorization', async () => {
      const blogId = randomUUID();
      const postId = randomUUID();

      await request(app.getHttpServer())
        .delete(`/app/sa/blogs/${blogId}/posts/${postId}`)
        .expect(401);
    });

    it('should return 404 if post does not exist', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;
      const nonExistingPostId = randomUUID();

      await request(app.getHttpServer())
        .delete(`/app/sa/blogs/${createdBlog.id}/posts/${nonExistingPostId}`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(404);
    });
  });

  describe('GET /app/posts', () => {
    it('should return posts', async () => {
      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as BlogViewDto;

      const post1Response = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const post1 = post1Response.body as PostViewDto;

      const post2Response = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send({
          ...validPostDto,
          title: 'Another test post',
        })
        .expect(201);

      const post2 = post2Response.body as PostViewDto;

      const response = await request(app.getHttpServer())
        .get('/app/posts')
        .expect(200);

      const result = response.body as PaginationViewDto<PostViewDto>;

      expect(result.totalCount).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.items.map((post) => post.id)).toEqual(
        expect.arrayContaining([post1.id, post2.id]),
      );
    });

    it('should return an empty posts page', async () => {
      const response = await request(app.getHttpServer())
        .get('/app/posts')
        .expect(200);

      const result = response.body as PaginationViewDto<PostViewDto>;

      expect(result).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return post with expected fields and default likes info', async () => {
      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as BlogViewDto;

      const postResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const createdPost = postResponse.body as PostViewDto;

      const response = await request(app.getHttpServer())
        .get('/app/posts')
        .expect(200);

      const result = response.body as PaginationViewDto<PostResponse>;
      const post = result.items.find((item) => item.id === createdPost.id);

      expect(post).toBeDefined();
      expect(post).toMatchObject({
        id: createdPost.id,
        title: validPostDto.title,
        shortDescription: validPostDto.shortDescription,
        content: validPostDto.content,
        blogId: blog.id,
        blogName: validBlogDto.name,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });

      expect(Number.isNaN(Date.parse(post!.createdAt))).toBe(false);
    });

    it('should return posts according to pagination parameters', async () => {
      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as BlogViewDto;

      const post1Response = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const post1 = post1Response.body as PostViewDto;

      const post2Response = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send({ ...validPostDto, title: 'Another post' })
        .expect(201);

      const post2 = post2Response.body as PostViewDto;

      const response = await request(app.getHttpServer())
        .get('/app/posts?pageNumber=1&pageSize=1')
        .expect(200);

      const result = response.body as PaginationViewDto<PostViewDto>;

      expect(result).toMatchObject({
        pagesCount: 2,
        page: 1,
        pageSize: 1,
        totalCount: 2,
      });
      expect(result.items).toHaveLength(1);
      expect([post1.id, post2.id]).toContain(result.items[0].id);
    });

    it('should return my like status for authorized user and None for anonymous user', async () => {
      const userDto = {
        login: 'LikeUser',
        password: 'Test123',
        email: 'like-user@example.dev',
      };

      const userResponse = await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(userDto)
        .expect(201);

      const createdUser = userResponse.body as { id: string };

      const loginResponse = await request(app.getHttpServer())
        .post('/app/auth/login')
        .send({
          loginOrEmail: userDto.login,
          password: userDto.password,
        })
        .expect(200);

      const loginData = loginResponse.body as { accessToken: string };
      const accessToken = loginData.accessToken;

      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as BlogViewDto;

      const postResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const createdPost = postResponse.body as PostViewDto;

      await request(app.getHttpServer())
        .put(`/app/posts/${createdPost.id}/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(204);

      const authorizedResponse = await request(app.getHttpServer())
        .get('/app/posts')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);

      const authorizedPosts =
        authorizedResponse.body as PaginationViewDto<ExtendedPostViewDto>;
      const authorizedPost = authorizedPosts.items.find(
        (post) => post.id === createdPost.id,
      );

      expect(authorizedPost).toBeDefined();
      expect(authorizedPost!.extendedLikesInfo).toMatchObject({
        likesCount: 1,
        myStatus: 'Like',
      });

      const anonymousResponse = await request(app.getHttpServer())
        .get('/app/posts')
        .expect(200);

      const anonymousPosts =
        anonymousResponse.body as PaginationViewDto<ExtendedPostViewDto>;
      const anonymousPost = anonymousPosts.items.find(
        (post) => post.id === createdPost.id,
      );

      expect(anonymousPost).toBeDefined();
      expect(anonymousPost!.extendedLikesInfo).toMatchObject({
        likesCount: 1,
        myStatus: 'None',
        newestLikes: [
          expect.objectContaining({
            userId: createdUser.id,
            login: userDto.login,
          }),
        ],
      });
    });
  });

  describe('GET /app/posts/:id', () => {
    it('should return post by id without authorization', async () => {
      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as BlogViewDto;

      const createPostResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const createdPost = createPostResponse.body as ExtendedPostViewDto;

      const response = await request(app.getHttpServer())
        .get(`/app/posts/${createdPost.id}`)
        .expect(200);

      const post = response.body as ExtendedPostViewDto;

      expect(post).toMatchObject({
        id: createdPost.id,
        title: validPostDto.title,
        shortDescription: validPostDto.shortDescription,
        content: validPostDto.content,
        blogId: blog.id,
        blogName: validBlogDto.name,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });

      expect(typeof post.createdAt).toBe('string');
    });

    it('should return 404 if post does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/app/posts/${randomUUID()}`)
        .expect(404);
    });

    it('should return my like status for authorized user and None for anonymous user', async () => {
      const userDto = {
        login: 'LikeUser',
        password: 'Test123',
        email: 'like-user@example.dev',
      };

      const userResponse = await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(userDto)
        .expect(201);

      const createdUser = userResponse.body as { id: string };

      const loginResponse = await request(app.getHttpServer())
        .post('/app/auth/login')
        .send({
          loginOrEmail: userDto.login,
          password: userDto.password,
        })
        .expect(200);

      const loginData = loginResponse.body as { accessToken: string };
      const accessToken = loginData.accessToken;

      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as BlogViewDto;

      const postResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const createdPost = postResponse.body as PostViewDto;

      await request(app.getHttpServer())
        .put(`/app/posts/${createdPost.id}/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(204);

      const authorizedResponse = await request(app.getHttpServer())
        .get('/app/posts')
        .auth(accessToken, { type: 'bearer' })
        .expect(200);

      const authorizedPosts =
        authorizedResponse.body as PaginationViewDto<ExtendedPostViewDto>;
      const authorizedPost = authorizedPosts.items.find(
        (post) => post.id === createdPost.id,
      );

      expect(authorizedPost).toBeDefined();
      expect(authorizedPost!.extendedLikesInfo).toMatchObject({
        likesCount: 1,
        myStatus: 'Like',
      });

      const anonymousResponse = await request(app.getHttpServer())
        .get('/app/posts')
        .expect(200);

      const anonymousPosts =
        anonymousResponse.body as PaginationViewDto<ExtendedPostViewDto>;
      const anonymousPost = anonymousPosts.items.find(
        (post) => post.id === createdPost.id,
      );

      expect(anonymousPost).toBeDefined();
      expect(anonymousPost!.extendedLikesInfo).toMatchObject({
        likesCount: 1,
        myStatus: 'None',
        newestLikes: [
          expect.objectContaining({
            userId: createdUser.id,
            login: userDto.login,
          }),
        ],
      });
    });
  });

  describe('POST /app/posts/:postId/comments', () => {
    const createPostAndGetAccessToken = async () => {
      const userDto = {
        login: 'Comment1',
        password: 'Test123',
        email: 'comment-user@example.dev',
      };

      const userResponse = await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(userDto)
        .expect(201);

      const user = userResponse.body as { id: string };

      const loginResponse = await request(app.getHttpServer())
        .post('/app/auth/login')
        .send({
          loginOrEmail: userDto.login,
          password: userDto.password,
        })
        .expect(200);

      const loginData = loginResponse.body as { accessToken: string };

      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as BlogViewDto;

      const postResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const post = postResponse.body as { id: string };

      return {
        user,
        userDto,
        accessToken: loginData.accessToken,
        postId: post.id,
      };
    };

    it('should create comment', async () => {
      const { user, userDto, accessToken, postId } =
        await createPostAndGetAccessToken();

      const content = 'This is a valid comment for the post';

      const response = await request(app.getHttpServer())
        .post(`/app/posts/${postId}/comments`)
        .auth(accessToken, { type: 'bearer' })
        .send({ content })
        .expect(201);

      const comment = response.body as CommentViewDto;

      expect(typeof comment.id).toBe('string');
      expect(comment.id).not.toBe('');

      expect(comment).toMatchObject({
        content,
        commentatorInfo: {
          userId: user.id,
          userLogin: userDto.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });

      expect(typeof comment.createdAt).toBe('string');
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .post(`/app/posts/${randomUUID()}/comments`)
        .send({ content: 'This is a valid comment for the post' })
        .expect(401);
    });

    it('should return 400 for incorrect input data', async () => {
      const { accessToken, postId } = await createPostAndGetAccessToken();

      await request(app.getHttpServer())
        .post(`/app/posts/${postId}/comments`)
        .auth(accessToken, { type: 'bearer' })
        .send({ content: 'short' })
        .expect(400);
    });

    it('should return 404 if post does not exist', async () => {
      const { accessToken } = await createPostAndGetAccessToken();

      await request(app.getHttpServer())
        .post(`/app/posts/${randomUUID()}/comments`)
        .auth(accessToken, { type: 'bearer' })
        .send({ content: 'This is a valid comment for the post' })
        .expect(404);
    });
  });

  describe('GET /app/posts/:postId/comments', () => {
    it('should return an empty comments page for an existing post', async () => {
      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as BlogViewDto;

      const postResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const post = postResponse.body as { id: string };

      const response = await request(app.getHttpServer())
        .get(`/app/posts/${post.id}/comments`)
        .expect(200);

      const commentsPage = response.body as unknown as {
        pagesCount: number;
        page: number;
        pageSize: number;
        totalCount: number;
        items: unknown[];
      };

      expect(commentsPage).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return 404 if post does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/app/posts/${randomUUID()}/comments`)
        .expect(404);
    });
  });

  describe('PUT /app/posts/:postId/like-status', () => {
    const createPostWithUserToken = async (): Promise<{
      postId: string;
      accessToken: string;
    }> => {
      const userDto = {
        login: 'LikeUser',
        password: 'Test123',
        email: 'like-user@example.dev',
      };

      await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(userDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/app/auth/login')
        .send({
          loginOrEmail: userDto.login,
          password: userDto.password,
        })
        .expect(200);

      const loginData = loginResponse.body as unknown as {
        accessToken: string;
      };

      const blogResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const blog = blogResponse.body as unknown as BlogViewDto;

      const postResponse = await request(app.getHttpServer())
        .post(`/app/sa/blogs/${blog.id}/posts`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validPostDto)
        .expect(201);

      const post = postResponse.body as unknown as { id: string };

      return {
        postId: post.id,
        accessToken: loginData.accessToken,
      };
    };

    it.each([
      {
        likeStatus: 'Like',
        likesCount: 1,
        dislikesCount: 0,
      },
      {
        likeStatus: 'Dislike',
        likesCount: 0,
        dislikesCount: 1,
      },
    ])(
      'should set like status to $likeStatus',
      async ({ likeStatus, likesCount, dislikesCount }) => {
        const { postId, accessToken } = await createPostWithUserToken();

        await request(app.getHttpServer())
          .put(`/app/posts/${postId}/like-status`)
          .auth(accessToken, { type: 'bearer' })
          .send({ likeStatus })
          .expect(204);

        const response = await request(app.getHttpServer())
          .get(`/app/posts/${postId}`)
          .auth(accessToken, { type: 'bearer' })
          .expect(200);

        const post = response.body as unknown as {
          extendedLikesInfo: {
            likesCount: number;
            dislikesCount: number;
            myStatus: string;
            newestLikes: {
              addedAt: string;
              userId: string;
              login: string;
            }[];
          };
        };

        expect(post.extendedLikesInfo).toMatchObject({
          likesCount,
          dislikesCount,
          myStatus: likeStatus,
        });

        expect(post.extendedLikesInfo.newestLikes).toHaveLength(
          likeStatus === 'Like' ? 1 : 0,
        );
      },
    );

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .put(`/app/posts/${randomUUID()}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(401);
    });

    it('should return 400 for incorrect like status', async () => {
      const { postId, accessToken } = await createPostWithUserToken();

      await request(app.getHttpServer())
        .put(`/app/posts/${postId}/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Unknown' })
        .expect(400);
    });

    it('should return 404 if post does not exist', async () => {
      const { accessToken } = await createPostWithUserToken();

      await request(app.getHttpServer())
        .put(`/app/posts/${randomUUID()}/like-status`)
        .auth(accessToken, { type: 'bearer' })
        .send({ likeStatus: 'Like' })
        .expect(404);
    });
  });
});
