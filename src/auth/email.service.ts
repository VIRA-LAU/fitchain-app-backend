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
        user: this.config.get('NODEMAILER_EMAIL'),
        pass: this.config.get('NODEMAILER_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(to: string, link: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.config.get('NODEMAILER_EMAIL'),
      to,
      subject: 'FitChain Email Verification',
      attachments: [
        {
          filename: 'FitChain-Logo.png',
          path: 'https://fitchain-bucket.s3.eu-north-1.amazonaws.com/logo.png',
          cid: 'fitchain-logo-favicon',
        },
      ],
      html: `
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr align="center">
          <td>
            <img
              src="cid:fitchain-logo-favicon"
              alt="FitChain Logo"
              style="margin-top: 60px;"
            />
            <p style="font-size: 32px; font-family: 'Segoe UI';">
              Welcome to FitChain!
            </p>
            <p
              style="
                font-family: 'Segoe UI';
                font-size: 24px;
                margin-top: 60px;
                margin-bottom: 30px;
              "
            >
              Please verify your email to proceed with your account registration.
            </p>
            <table
              style="
                border-spacing: 20px;
                font-size: 24px;
                font-family: 'Segoe UI';
                text-align: center;
              "
              align="center"
            >
              <tr style="height: 60px; background-color: #F77E05;">
                <td style="border-radius: 7px;">
                  <a
                    href="${link}"
                    target="_blank"
                    style="
                      display: block;
                      width: 300px;
                      padding-left: 20px;
                      padding-right: 20px;
                      text-decoration: none;
                      color: black;
                    "
                  >
                    Verify Email
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(to: string, link: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.config.get('NODEMAILER_EMAIL'),
      to,
      subject: 'FitChain Password Reset',
      attachments: [
        {
          filename: 'FitChain-Logo.png',
          path: 'https://fitchain-bucket.s3.eu-north-1.amazonaws.com/logo.png',
          cid: 'fitchain-logo-favicon',
        },
      ],
      html: `<table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr align="center">
        <td>
          <img
            src="cid:fitchain-logo-favicon"
            alt="FitChain Logo"
            style="margin-top: 60px;"
          />
          <p style="font-size: 32px; font-family: 'Segoe UI';">
            FitChain
          </p>
          <p
            style="
              font-family: 'Segoe UI';
              font-size: 24px;
              margin-top: 60px;
              margin-bottom: 30px;
            "
          >
            A request has been received to change your password.
          </p>
          <table
            style="
              border-spacing: 20px;
              font-size: 24px;
              font-family: 'Segoe UI';
              text-align: center;
            "
            align="center"
          >
            <tr style="height: 60px; background-color: #F77E05;">
              <td style="border-radius: 7px;">
                <a
                  href="${link}"
                  target="_blank"
                  style="
                    display: block;
                    width: 300px;
                    padding-left: 20px;
                    padding-right: 20px;
                    text-decoration: none;
                    color: black;
                  "
                >
                  Reset Password
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
