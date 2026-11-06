import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { BlogViewDto } from '../../src/modules/bloggers-platform/blogs/api/view-dto/blog.view-dto';
import { PaginationViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { randomUUID } from 'node:crypto';
import { ExtendedPostViewDto } from '../../src/modules/bloggers-platform/posts/api/view-dto/extended-post.view-dto';

describe('BlogsController (e2e)', () => {
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

  describe('GET /app/blogs', () => {
    it('should return empty blogs list', async () => {
      const response = await request(app.getHttpServer())
        .get('/app/blogs')
        .expect(200);

      const blogs = response.body as PaginationViewDto<BlogViewDto>;

      expect(blogs).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return created blogs', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const response = await request(app.getHttpServer())
        .get('/app/blogs')
        .expect(200);

      const blogs = response.body as PaginationViewDto<BlogViewDto>;

      expect(blogs.totalCount).toBe(1);
      expect(blogs.items).toHaveLength(1);

      const blog = blogs.items[0];

      expect(blog.id).toBe(createdBlog.id);
      expect(blog.name).toBe(validBlogDto.name);
      expect(blog.description).toBe(validBlogDto.description);
      expect(blog.websiteUrl).toBe(validBlogDto.websiteUrl);
      expect(blog.isMembership).toBe(false);

      expect(typeof blog.createdAt).toBe('string');
    });
  });

  describe('GET /app/blogs/:id', () => {
    it('should return blog by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const response = await request(app.getHttpServer())
        .get(`/app/blogs/${createdBlog.id}`)
        .expect(200);

      const blog = response.body as BlogViewDto;

      expect(blog.id).toBe(createdBlog.id);
      expect(blog.name).toBe(validBlogDto.name);
      expect(blog.description).toBe(validBlogDto.description);
      expect(blog.websiteUrl).toBe(validBlogDto.websiteUrl);
      expect(blog.isMembership).toBe(false);

      expect(typeof blog.createdAt).toBe('string');
    });

    it('should return 404 if blog does not exist', async () => {
      const nonExistingId = randomUUID();

      await request(app.getHttpServer())
        .get(`/app/blogs/${nonExistingId}`)
        .expect(404);
    });
  });

  describe('GET /app/blogs/:blogId/posts', () => {
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
        .get(`/app/blogs/${createdBlog.id}/posts`)
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
        .get(`/app/blogs/${createdBlog.id}/posts`)
        .expect(200);

      const result = response.body as PaginationViewDto<ExtendedPostViewDto>;

      expect(result.totalCount).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should return 404 if blog does not exist', async () => {
      const nonExistingId = randomUUID();

      await request(app.getHttpServer())
        .get(`/app/blogs/${nonExistingId}/posts`)
        .expect(404);
    });
  });

  describe('GET /app/sa/blogs', () => {
    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer()).get('/app/sa/blogs').expect(401);
    });

    it('should return empty blogs list', async () => {
      const response = await request(app.getHttpServer())
        .get('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const blogs = response.body as PaginationViewDto<BlogViewDto>;

      expect(blogs).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return created blogs', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const response = await request(app.getHttpServer())
        .get('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const blogs = response.body as PaginationViewDto<BlogViewDto>;

      expect(blogs.totalCount).toBe(1);
      expect(blogs.items).toHaveLength(1);

      const blog = blogs.items[0];

      expect(blog.id).toBe(createdBlog.id);
      expect(blog.name).toBe(validBlogDto.name);
      expect(blog.description).toBe(validBlogDto.description);
      expect(blog.websiteUrl).toBe(validBlogDto.websiteUrl);
      expect(blog.isMembership).toBe(false);

      expect(typeof blog.createdAt).toBe('string');
    });
  });

  describe('POST /app/sa/blogs', () => {
    it('should create blog', async () => {
      const response = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = response.body as BlogViewDto;

      expect(createdBlog.id).toBeDefined();
      expect(typeof createdBlog.id).toBe('string');

      expect(createdBlog.name).toBe(validBlogDto.name);
      expect(createdBlog.description).toBe(validBlogDto.description);
      expect(createdBlog.websiteUrl).toBe(validBlogDto.websiteUrl);

      expect(createdBlog.createdAt).toBeDefined();
      expect(typeof createdBlog.createdAt).toBe('string');

      expect(createdBlog.isMembership).toBe(false);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .send(validBlogDto)
        .expect(401);
    });

    it('should return 400 for incorrect input data', async () => {
      await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send({
          name: '',
          description: '',
          websiteUrl: 'incorrect-url',
        })
        .expect(400);
    });
  });

  describe('PUT /app/sa/blogs/:id', () => {
    it('should update blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      const updateDto = {
        name: 'Updated blog',
        description: 'Updated description',
        websiteUrl: 'https://updated-blog.com',
      };

      await request(app.getHttpServer())
        .put(`/app/sa/blogs/${createdBlog.id}`)
        .auth(basicAuth.username, basicAuth.password)
        .send(updateDto)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get(`/app/blogs/${createdBlog.id}`)
        .expect(200);

      const updatedBlog = response.body as BlogViewDto;

      expect(updatedBlog.id).toBe(createdBlog.id);
      expect(updatedBlog.name).toBe(updateDto.name);
      expect(updatedBlog.description).toBe(updateDto.description);
      expect(updatedBlog.websiteUrl).toBe(updateDto.websiteUrl);
      expect(updatedBlog.isMembership).toBe(false);

      expect(typeof updatedBlog.createdAt).toBe('string');
    });

    it('should return 401 without authorization', async () => {
      const nonExistingId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .put(`/app/sa/blogs/${nonExistingId}`)
        .send(validBlogDto)
        .expect(401);
    });

    it('should return 404 if blog does not exist', async () => {
      const nonExistingId = randomUUID();

      await request(app.getHttpServer())
        .put(`/app/sa/blogs/${nonExistingId}`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(404);
    });

    it('should return 400 for incorrect input data', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      await request(app.getHttpServer())
        .put(`/app/sa/blogs/${createdBlog.id}`)
        .auth(basicAuth.username, basicAuth.password)
        .send({
          name: '',
          description: '',
          websiteUrl: 'wrong-url',
        })
        .expect(400);
    });
  });

  describe('DELETE /app/blogs/:id', () => {
    it('should delete blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      await request(app.getHttpServer())
        .delete(`/app/sa/blogs/${createdBlog.id}`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/app/blogs/${createdBlog.id}`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(404);

      const response = await request(app.getHttpServer())
        .get('/app/blogs')
        .expect(200);

      const blogs = response.body as PaginationViewDto<BlogViewDto>;

      expect(blogs.totalCount).toBe(0);
      expect(blogs.items).toEqual([]);
    });

    it('should return 401 without authorization', async () => {
      const nonExistingId = randomUUID();

      await request(app.getHttpServer())
        .delete(`/app/sa/blogs/${nonExistingId}`)
        .expect(401);
    });

    it('should return 404 if blog does not exist', async () => {
      const nonExistingId = randomUUID();

      await request(app.getHttpServer())
        .delete(`/app/sa/blogs/${nonExistingId}`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(404);
    });
  });
});
