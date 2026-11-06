import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import request from 'supertest';
import { randomUUID } from 'node:crypto';

describe('SecurityDevicesController (e2e)', () => {
  let app: INestApplication<Server>;

  const basicAuth = {
    username: 'admin',
    password: 'qwerty',
  };

  const validUserDto = {
    login: 'testauthor',
    email: 'author@example.com',
    password: 'password123',
  };

  async function loginAndGetRefreshCookie(
    userAgent: string,
    user = validUserDto,
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/app/auth/login')
      .set('User-Agent', userAgent)
      .send({
        loginOrEmail: user.login,
        password: user.password,
      })
      .expect(200);

    const setCookie = response.headers['set-cookie'] as
      string[] | string | undefined;

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    const refreshCookie = cookies.find((cookie) =>
      cookie?.startsWith('refreshToken='),
    );

    if (!refreshCookie) {
      throw new Error('Login response did not include a refreshToken cookie');
    }

    // Из Set-Cookie берём только refreshToken=<значение>.
    return refreshCookie.split(';')[0];
  }

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

  describe('GET /app/security/devices', () => {
    it('should return both active sessions for the logged-in user', async () => {
      const server = app.getHttpServer();

      await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      const refreshCookie = await loginAndGetRefreshCookie('Test device A');
      await loginAndGetRefreshCookie('Test device B');

      const response = await request(server)
        .get('/app/security/devices')
        .set('Cookie', refreshCookie)
        .expect(200);

      const devices = response.body as { deviceId: string }[];

      expect(devices).toHaveLength(2);
      expect(devices[0].deviceId).toEqual(expect.any(String));
      expect(devices[1].deviceId).toEqual(expect.any(String));
      expect(devices[0].deviceId).not.toBe(devices[1].deviceId);
    });

    it('should return 401 without a refresh token cookie', async () => {
      await request(app.getHttpServer())
        .get('/app/security/devices')
        .expect(401);
    });

    it('should return 401 with an invalid refresh token cookie', async () => {
      await request(app.getHttpServer())
        .get('/app/security/devices')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);
    });
  });

  describe('DELETE /app/security/devices', () => {
    it('should terminate other sessions and keep the current one', async () => {
      const server = app.getHttpServer();

      await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      const currentCookie = await loginAndGetRefreshCookie('Test device A');

      // Запоминаем ID текущей сессии, пока она единственная.
      const initialResponse = await request(server)
        .get('/app/security/devices')
        .set('Cookie', currentCookie)
        .expect(200);

      const initialDevices = initialResponse.body as { deviceId: string }[];
      expect(initialDevices).toHaveLength(1);
      const currentDeviceId = initialDevices[0].deviceId;

      await loginAndGetRefreshCookie('Test device B');

      const beforeDelete = await request(server)
        .get('/app/security/devices')
        .set('Cookie', currentCookie)
        .expect(200);

      expect(beforeDelete.body).toHaveLength(2);

      await request(server)
        .delete('/app/security/devices')
        .set('Cookie', currentCookie)
        .expect(204);

      const afterDelete = await request(server)
        .get('/app/security/devices')
        .set('Cookie', currentCookie)
        .expect(200);

      const remainingDevices = afterDelete.body as { deviceId: string }[];

      expect(remainingDevices.map(({ deviceId }) => deviceId)).toEqual([
        currentDeviceId,
      ]);
    });

    it('should return 401 without a refresh token cookie', async () => {
      await request(app.getHttpServer())
        .delete('/app/security/devices')
        .expect(401);
    });

    it('should return 401 with an invalid refresh token cookie', async () => {
      await request(app.getHttpServer())
        .delete('/app/security/devices')
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);
    });
  });

  describe('DELETE /app/security/devices/:deviceId', () => {
    async function createUser(user = validUserDto): Promise<void> {
      await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(user)
        .expect(201);
    }

    async function getDeviceIds(cookie: string): Promise<string[]> {
      const response = await request(app.getHttpServer())
        .get('/app/security/devices')
        .set('Cookie', cookie)
        .expect(200);

      const devices = response.body as { deviceId: string }[];
      return devices.map(({ deviceId }) => deviceId);
    }

    it('should terminate the selected session and keep the current one', async () => {
      await createUser();

      const currentCookie = await loginAndGetRefreshCookie('Test device A');
      const [currentDeviceId] = await getDeviceIds(currentCookie);

      await loginAndGetRefreshCookie('Test device B');

      const deviceIds = await getDeviceIds(currentCookie);
      expect(deviceIds).toHaveLength(2);

      const targetDeviceId = deviceIds.find((id) => id !== currentDeviceId);
      if (!targetDeviceId) {
        throw new Error('The second device session was not found');
      }

      await request(app.getHttpServer())
        .delete(`/app/security/devices/${targetDeviceId}`)
        .set('Cookie', currentCookie)
        .expect(204);

      expect(await getDeviceIds(currentCookie)).toEqual([currentDeviceId]);
    });

    it('should return 401 without a refresh token cookie', async () => {
      await request(app.getHttpServer())
        .delete(`/app/security/devices/${randomUUID()}`)
        .expect(401);
    });

    it('should return 403 when deleting another user’s session', async () => {
      const otherUser = {
        ...validUserDto,
        login: 'otheruser',
        email: 'other@example.com',
      };

      await createUser();
      await createUser(otherUser);

      const currentCookie = await loginAndGetRefreshCookie('Test device A');
      const otherCookie = await loginAndGetRefreshCookie(
        'Test device B',
        otherUser,
      );
      const [otherDeviceId] = await getDeviceIds(otherCookie);

      await request(app.getHttpServer())
        .delete(`/app/security/devices/${otherDeviceId}`)
        .set('Cookie', currentCookie)
        .expect(403);

      expect(await getDeviceIds(otherCookie)).toEqual([otherDeviceId]);
    });

    it('should return 404 if the device session does not exist', async () => {
      await createUser();
      const cookie = await loginAndGetRefreshCookie('Test device A');

      await request(app.getHttpServer())
        .delete(`/app/security/devices/${randomUUID()}`)
        .set('Cookie', cookie)
        .expect(404);
    });
  });
});
