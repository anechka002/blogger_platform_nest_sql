import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailTemplateManager } from './email-template.manager';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'blinova.anneta@gmail.com',
          pass: 'bhwc brvy cyhv ibev',
        },
      },
      defaults: {
        from: '"Blogger API" <blinova.anneta@gmail.com>',
      },
    }),
  ],
  controllers: [],
  providers: [EmailService, EmailTemplateManager],
  exports: [EmailService],
})
export class NotificationsModule {}
