import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import request from 'supertest';
import { PaginationViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { UserViewModel } from '../../src/modules/user-accounts/users/api/view-dto/user.view-model';
import { randomUUID } from 'node:crypto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const basicAuth = {
    username: 'admin',
    password: 'qwerty',
  };

  const validUserDto = {
    login: 'Test',
    password: 'Test123',
    email: 'example@example.dev',
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

  describe('GET /app/sa/users', () => {
    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer()).get('/app/sa/users').expect(401);
    });

    it('should return empty users list', async () => {
      const response = await request(app.getHttpServer())
        .get('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const users = response.body as PaginationViewDto<UserViewModel>;

      expect(users).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('should return created user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      const createdUser = createResponse.body as UserViewModel;

      const response = await request(app.getHttpServer())
        .get('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const users = response.body as PaginationViewDto<UserViewModel>;

      expect(users.totalCount).toBe(1);
      expect(users.items).toHaveLength(1);

      const user = users.items[0];

      expect(user.id).toBe(createdUser.id);
      expect(user.login).toBe(validUserDto.login);
      expect(user.email).toBe(validUserDto.email);

      expect(typeof user.createdAt).toBe('string');
    });
  });

  describe('POST /app/sa/users', () => {
    it('should create user', async () => {
      const response = await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      const createdUser = response.body as UserViewModel;

      expect(createdUser.id).toEqual(expect.any(String));
      expect(createdUser.login).toBe(validUserDto.login);
      expect(createdUser.email).toBe(validUserDto.email);
      expect(typeof createdUser.createdAt).toBe('string');
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .post('/app/sa/users')
        .send(validUserDto)
        .expect(401);
    });

    it('should return 400 for incorrect input data', async () => {
      await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send({
          login: '',
          password: '',
          email: '',
        })
        .expect(400);
    });
  });

  describe('DELETE /app/sa/users/:id', () => {
    it('should delete user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      const createdUser = createResponse.body as UserViewModel;

      await request(app.getHttpServer())
        .delete(`/app/sa/users/${createdUser.id}`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(204);

      const response = await request(app.getHttpServer())
        .get('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .expect(200);

      const users = response.body as PaginationViewDto<UserViewModel>;

      expect(users.totalCount).toBe(0);
      expect(users.items).toEqual([]);
    });

    it('should return 401 without authorization', async () => {
      await request(app.getHttpServer())
        .delete(`/app/sa/users/${randomUUID()}`)
        .expect(401);
    });

    it('should return 404 if user does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/app/sa/users/${randomUUID()}`)
        .auth(basicAuth.username, basicAuth.password)
        .expect(404);
    });
  });
});
