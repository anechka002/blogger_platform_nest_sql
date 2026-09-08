import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    email: string,
    subject: string,
    code: string | null,
  ): Promise<void> {
    const confirmationLink = `https://some-front.com/confirm-registration?code=${code}`;

    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      text: `Confirm registration via link ${confirmationLink}`,
      html: `
        <h1>Thank for your registration</h1>
        <p>
          To finish registration please follow the link below:
          <a href="${confirmationLink}">complete registration</a>
        </p>
    `,
    });
  }
}
