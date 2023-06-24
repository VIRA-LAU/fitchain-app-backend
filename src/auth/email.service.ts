import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: this.config.get("NODEMAILER_EMAIL"),
        pass: this.config.get("NODEMAILER_PASSWORD"),
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.config.get("NODEMAILER_EMAIL"),
      to,
      subject,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
