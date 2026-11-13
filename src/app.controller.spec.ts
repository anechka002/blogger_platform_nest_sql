import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { jest } from '@jest/globals';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AppService,
          useValue: {
            live: jest.fn().mockReturnValue({ status: 'ok' }),
            app: jest.fn().mockReturnValue('Hello World'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return status: "ok"', () => {
      expect(appController.live()).toEqual({ status: 'ok' });
    });
    it('should return "Ok!"', () => {
      expect(appController.checkApp()).toEqual('Ok!');
    });
  });
});
