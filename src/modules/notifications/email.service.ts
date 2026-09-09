import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailTemplateManager } from './email-template.manager';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly emailTemplateManager: EmailTemplateManager,
  ) {}

  async sendRegistrationConfirmationEmail(
    email: string,
    code: string | null,
  ): Promise<void> {
    const html =
      this.emailTemplateManager.getRegistrationConfirmationTemplate(code);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Registration confirmation',
      html,
    });
  }

  async sendPasswordRecoveryEmail(
    email: string,
    recoveryCode: string | null,
  ): Promise<void> {
    const html =
      this.emailTemplateManager.getPasswordRecoveryTemplate(recoveryCode);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password recovery',
      html,
    });
  }
}
