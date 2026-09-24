import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { BlogViewDto } from '../../src/modules/bloggers-platform/blogs/api/view-dto/blog.view-dto';
import { PaginationViewDto } from '../../src/core/dto/base.paginated.view-dto';

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

  describe('POST /app/blogs', () => {
    it('should create blog', async () => {
      const response = await request(app.getHttpServer())
        .post('/app/blogs')
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
        .post('/app/blogs')
        .send(validBlogDto)
        .expect(401);
    });

    it('should return 400 for incorrect input data', async () => {
      await request(app.getHttpServer())
        .post('/app/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send({
          name: '',
          description: '',
          websiteUrl: 'incorrect-url',
        })
        .expect(400);
    });
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
        .post('/app/blogs')
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
        .post('/app/blogs')
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
      const nonExistingId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .get(`/app/blogs/${nonExistingId}`)
        .expect(404);
    });
  });

  describe('PUT /app/blogs/:id', () => {
    it('should update blog', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/blogs')
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
        .put(`/app/blogs/${createdBlog.id}`)
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
        .put(`/app/blogs/${nonExistingId}`)
        .send(validBlogDto)
        .expect(401);
    });

    it('should return 404 if blog does not exist', async () => {
      const nonExistingId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .put(`/app/blogs/${nonExistingId}`)
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(404);
    });

    it('should return 400 for incorrect input data', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      await request(app.getHttpServer())
        .put(`/app/blogs/${createdBlog.id}`)
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
        .post('/app/blogs')
        .auth(basicAuth.username, basicAuth.password)
        .send(validBlogDto)
        .expect(201);

      const createdBlog = createResponse.body as BlogViewDto;

      await request(app.getHttpServer())
        .delete(`/app/blogs/${createdBlog.id}`)
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
      const nonExistingId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .delete(`/app/blogs/${nonExistingId}`)
        .expect(401);
    });

    it('should return 404 if blog does not exist', async () => {
      const nonExistingId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .delete(`/app/blogs/${nonExistingId}`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(404);
    });
  });
});
