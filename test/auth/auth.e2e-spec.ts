import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import request from 'supertest';
import { jest } from '@jest/globals';
import { EmailService } from '../../src/modules/notifications/email.service';
import { randomUUID } from 'node:crypto';

const sendEmail = jest
  .fn<EmailService['sendRegistrationConfirmationEmail']>()
  .mockResolvedValue(undefined);

const sendPasswordRecoveryEmail = jest
  .fn<EmailService['sendPasswordRecoveryEmail']>()
  .mockResolvedValue(undefined);

describe('AuthController (e2e)', () => {
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

  function getRefreshCookie(headers: string[] | string | undefined): string {
    const cookies = Array.isArray(headers) ? headers : [headers];
    const cookie = cookies.find((value) => value?.startsWith('refreshToken='));

    if (!cookie) {
      throw new Error('Expected a refreshToken cookie in Set-Cookie');
    }

    return cookie;
  }

  async function loginAndGetCookie(): Promise<string> {
    const server = app.getHttpServer();

    await request(server)
      .post('/app/sa/users')
      .auth(basicAuth.username, basicAuth.password)
      .send(validUserDto)
      .expect(201);

    const response = await request(server)
      .post('/app/auth/login')
      .send({
        loginOrEmail: validUserDto.login,
        password: validUserDto.password,
      })
      .expect(200);

    const setCookie = response.headers['set-cookie'] as
      string[] | string | undefined;

    // В запросе отправляем только refreshToken=<значение>.
    return getRefreshCookie(setCookie).split(';')[0];
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendRegistrationConfirmationEmail: sendEmail,
        sendPasswordRecoveryEmail,
      })
      .compile();

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

  describe('POST /app/auth/registration', () => {
    beforeEach(() => {
      sendEmail.mockClear();
    });

    it('should register a user and request a confirmation email', async () => {
      await request(app.getHttpServer())
        .post('/app/auth/registration')
        .send(validUserDto)
        .expect(204);

      expect(sendEmail).toHaveBeenCalledTimes(1);

      const [email, code] = sendEmail.mock.calls[0] ?? [];

      expect(email).toBe(validUserDto.email);
      expect(typeof code).toBe('string');
      expect(code).toBeTruthy();
    });

    it('should return 400 if the email is already registered', async () => {
      const server = app.getHttpServer();

      await request(server)
        .post('/app/auth/registration')
        .send(validUserDto)
        .expect(204);

      await request(server)
        .post('/app/auth/registration')
        .send({ ...validUserDto, login: 'otheruser' })
        .expect(400);

      // Письмо запрошено только при первой регистрации.
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for an invalid email without sending a message', async () => {
      await request(app.getHttpServer())
        .post('/app/auth/registration')
        .send({ ...validUserDto, email: 'not-an-email' })
        .expect(400);

      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('POST /app/auth/registration-confirmation', () => {
    const registrationUrl = '/app/auth/registration';
    const confirmationUrl = '/app/auth/registration-confirmation';

    beforeEach(() => {
      sendEmail.mockClear();
    });

    async function registerAndGetCode(): Promise<string> {
      await request(app.getHttpServer())
        .post(registrationUrl)
        .send(validUserDto)
        .expect(204);

      expect(sendEmail).toHaveBeenCalledTimes(1);

      const code = sendEmail.mock.calls[0]?.[1];

      if (typeof code !== 'string' || code.length === 0) {
        throw new Error('Registration did not generate a confirmation code');
      }

      return code;
    }

    it('should confirm registration with a valid code', async () => {
      const code = await registerAndGetCode();

      await request(app.getHttpServer())
        .post(confirmationUrl)
        .send({ code })
        .expect(204);
    });

    it('should return 400 if the code has already been used', async () => {
      const code = await registerAndGetCode();
      const server = app.getHttpServer();

      await request(server).post(confirmationUrl).send({ code }).expect(204);

      await request(server).post(confirmationUrl).send({ code }).expect(400);
    });

    it('should return 400 if the code does not exist', async () => {
      await request(app.getHttpServer())
        .post(confirmationUrl)
        .send({ code: randomUUID() })
        .expect(400);
    });

    it('should return 400 if the code is missing', async () => {
      await request(app.getHttpServer())
        .post(confirmationUrl)
        .send({})
        .expect(400);
    });
  });

  describe('POST /app/auth/registration-email-resending', () => {
    const registrationUrl = '/app/auth/registration';
    const confirmationUrl = '/app/auth/registration-confirmation';
    const resendingUrl = '/app/auth/registration-email-resending';

    beforeEach(() => {
      sendEmail.mockClear();
    });

    function getSentCode(callIndex: number): string {
      const [email, code] = sendEmail.mock.calls[callIndex] ?? [];

      expect(email).toBe(validUserDto.email);

      if (typeof code !== 'string' || code.length === 0) {
        throw new Error('Expected a non-empty confirmation code');
      }

      return code;
    }

    async function registerUser(): Promise<string> {
      await request(app.getHttpServer())
        .post(registrationUrl)
        .send(validUserDto)
        .expect(204);

      expect(sendEmail).toHaveBeenCalledTimes(1);
      return getSentCode(0);
    }

    it('should resend a new confirmation code for an unconfirmed email', async () => {
      const oldCode = await registerUser();
      const server = app.getHttpServer();

      await request(server)
        .post(resendingUrl)
        .send({ email: validUserDto.email })
        .expect(204);

      expect(sendEmail).toHaveBeenCalledTimes(2);

      const newCode = getSentCode(1);
      expect(newCode).not.toBe(oldCode);

      await request(server)
        .post(confirmationUrl)
        .send({ code: oldCode })
        .expect(400);

      await request(server)
        .post(confirmationUrl)
        .send({ code: newCode })
        .expect(204);
    });

    it('should return 400 if the email is not registered', async () => {
      await request(app.getHttpServer())
        .post(resendingUrl)
        .send({ email: validUserDto.email })
        .expect(400);

      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should return 400 if the email is already confirmed', async () => {
      const code = await registerUser();
      const server = app.getHttpServer();

      await request(server).post(confirmationUrl).send({ code }).expect(204);

      await request(server)
        .post(resendingUrl)
        .send({ email: validUserDto.email })
        .expect(400);

      // Был только вызов отправки при регистрации.
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the email is invalid', async () => {
      await request(app.getHttpServer())
        .post(resendingUrl)
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('POST /app/auth/refresh-token', () => {
    const refreshUrl = '/app/auth/refresh-token';

    it('should return 200 and issue tokens with a valid refresh cookie', async () => {
      const cookie = await loginAndGetCookie();
      const server = app.getHttpServer();

      const response = await request(server)
        .post(refreshUrl)
        .set('Cookie', cookie)
        .expect(200);

      const { accessToken } = response.body as { accessToken: string };
      expect(typeof accessToken).toBe('string');
      expect(accessToken).toBeTruthy();

      const setCookie = response.headers['set-cookie'] as
        string[] | string | undefined;

      const refreshCookie = getRefreshCookie(setCookie);
      expect(refreshCookie).toMatch(/^refreshToken=[^;]+/);
      expect(refreshCookie).toMatch(/;\s*HttpOnly(?:;|$)/i);

      // Проверяем, что выданный accessToken действительно работает.
      await request(server)
        .get('/app/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 401 without a refresh cookie', async () => {
      await request(app.getHttpServer()).post(refreshUrl).expect(401);
    });

    it('should return 401 with an invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post(refreshUrl)
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);
    });

    it('should return 401 if the session was terminated by logout', async () => {
      const cookie = await loginAndGetCookie();
      const server = app.getHttpServer();

      await request(server)
        .post('/app/auth/logout')
        .set('Cookie', cookie)
        .expect(204);

      // Вручную отправляем сохранённую cookie после завершения сессии.
      await request(server).post(refreshUrl).set('Cookie', cookie).expect(401);
    });
  });

  describe('POST /app/auth/login', () => {
    async function createUser(): Promise<void> {
      await request(app.getHttpServer())
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);
    }

    it('should return an access token and set a refresh token cookie', async () => {
      await createUser();

      const response = await request(app.getHttpServer())
        .post('/app/auth/login')
        .send({
          loginOrEmail: validUserDto.login,
          password: validUserDto.password,
        })
        .expect(200);

      const { accessToken } = response.body as { accessToken: string };

      expect(typeof accessToken).toBe('string');
      expect(accessToken).toBeTruthy();

      const setCookie = response.headers['set-cookie'] as
        string[] | string | undefined;

      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      const refreshCookie = cookies.find((cookie) =>
        cookie?.startsWith('refreshToken='),
      );

      expect(refreshCookie).toMatch(/^refreshToken=[^;]+/);
      expect(refreshCookie).toMatch(/;\s*HttpOnly(?:;|$)/i);
    });

    it('should return 401 for an incorrect password', async () => {
      await createUser();

      await request(app.getHttpServer())
        .post('/app/auth/login')
        .send({
          loginOrEmail: validUserDto.login,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for an unknown login', async () => {
      await request(app.getHttpServer())
        .post('/app/auth/login')
        .send({
          loginOrEmail: validUserDto.login,
          password: validUserDto.password,
        })
        .expect(401);
    });

    it('should return 400 when password is missing', async () => {
      await request(app.getHttpServer())
        .post('/app/auth/login')
        .send({ loginOrEmail: validUserDto.login })
        .expect(400);
    });
  });

  describe('POST /app/auth/logout', () => {
    const url = '/app/auth/logout';

    it('should return 204, clear the cookie and terminate the session', async () => {
      const cookie = await loginAndGetCookie();
      const server = app.getHttpServer();

      const response = await request(server)
        .post(url)
        .set('Cookie', cookie)
        .expect(204);

      const setCookie = response.headers['set-cookie'] as
        string[] | string | undefined;

      expect(getRefreshCookie(setCookie)).toMatch(/^refreshToken=(?:;|$)/);

      // Вручную отправляем старую cookie, чтобы проверить отзыв сессии.
      await request(server).post(url).set('Cookie', cookie).expect(401);
    });

    it('should return 401 without a refresh token cookie', async () => {
      await request(app.getHttpServer()).post(url).expect(401);
    });

    it('should return 401 with an invalid refresh token cookie', async () => {
      await request(app.getHttpServer())
        .post(url)
        .set('Cookie', 'refreshToken=invalid-token')
        .expect(401);
    });
  });

  describe('POST /app/auth/password-recovery', () => {
    const url = '/app/auth/password-recovery';

    beforeEach(() => {
      sendPasswordRecoveryEmail.mockClear();
    });

    it('should return 204 and send a recovery code to a registered email', async () => {
      const server = app.getHttpServer();

      await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      await request(server)
        .post(url)
        .send({ email: validUserDto.email })
        .expect(204);

      expect(sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);

      const [email, code] = sendPasswordRecoveryEmail.mock.calls[0] ?? [];
      expect(email).toBe(validUserDto.email);
      expect(typeof code).toBe('string');
      expect(code).toBeTruthy();
    });

    it('should return 204 without sending an email if the user does not exist', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send({ email: 'unknown@example.com' })
        .expect(204);

      expect(sendPasswordRecoveryEmail).not.toHaveBeenCalled();
    });

    it.each([
      { name: 'invalid', body: { email: 'not-an-email' } },
      { name: 'missing', body: {} },
    ])('should return 400 when email is $name', async ({ body }) => {
      await request(app.getHttpServer()).post(url).send(body).expect(400);

      expect(sendPasswordRecoveryEmail).not.toHaveBeenCalled();
    });
  });

  describe('POST /app/auth/new-password', () => {
    const url = '/app/auth/new-password';
    const newPassword = 'newPassword123';

    beforeEach(() => {
      sendPasswordRecoveryEmail.mockClear();
    });

    async function createUserAndGetRecoveryCode(): Promise<string> {
      const server = app.getHttpServer();

      await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      await request(server)
        .post('/app/auth/password-recovery')
        .send({ email: validUserDto.email })
        .expect(204);

      expect(sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);
      const code = sendPasswordRecoveryEmail.mock.calls[0]?.[1];

      if (typeof code !== 'string' || code.length === 0) {
        throw new Error('Expected a password recovery code');
      }

      return code;
    }

    it('should return 204 and change the password', async () => {
      const recoveryCode = await createUserAndGetRecoveryCode();
      const server = app.getHttpServer();

      await request(server)
        .post(url)
        .send({ newPassword, recoveryCode })
        .expect(204);

      await request(server)
        .post('/app/auth/login')
        .send({
          loginOrEmail: validUserDto.login,
          password: validUserDto.password,
        })
        .expect(401);

      await request(server)
        .post('/app/auth/login')
        .send({
          loginOrEmail: validUserDto.login,
          password: newPassword,
        })
        .expect(200);
    });

    it('should return 400 if the recovery code does not exist', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send({ newPassword, recoveryCode: randomUUID() })
        .expect(400);
    });

    it('should return 400 if the new password is too short', async () => {
      const recoveryCode = await createUserAndGetRecoveryCode();

      await request(app.getHttpServer())
        .post(url)
        .send({ newPassword: '123', recoveryCode })
        .expect(400);
    });

    it('should return 400 if the recovery code is missing', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send({ newPassword })
        .expect(400);
    });
  });

  describe('GET /app/auth/me', () => {
    const url = '/app/auth/me';

    it('should return the authenticated user with status 200', async () => {
      const server = app.getHttpServer();

      const createResponse = await request(server)
        .post('/app/sa/users')
        .auth(basicAuth.username, basicAuth.password)
        .send(validUserDto)
        .expect(201);

      const { id: userId } = createResponse.body as { id: string };

      const loginResponse = await request(server)
        .post('/app/auth/login')
        .send({
          loginOrEmail: validUserDto.login,
          password: validUserDto.password,
        })
        .expect(200);

      const { accessToken } = loginResponse.body as { accessToken: string };

      const response = await request(server)
        .get(url)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        userId,
        login: validUserDto.login,
        email: validUserDto.email,
      });
    });

    it('should return 401 without an access token', async () => {
      await request(app.getHttpServer()).get(url).expect(401);
    });

    it('should return 401 with an invalid access token', async () => {
      await request(app.getHttpServer())
        .get(url)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
