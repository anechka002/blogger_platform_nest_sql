import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/live (GET): возвращает 200, приложение отвечает на HTTP-запросы', async () => {
    return request(app.getHttpServer())
      .get('/live')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/ready (GET): возвращает 200, если база доступна', async () => {
    return request(app.getHttpServer())
      .get('/ready')
      .expect(200)
      .expect({ status: 'ok', database: 'database up' });
  });

  afterEach(async () => {
    await app.close();
  });
});
