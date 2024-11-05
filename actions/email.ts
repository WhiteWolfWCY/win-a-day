"use server";

import nodemailer from 'nodemailer';
import { db } from '@/db/drizzle';
import { Users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

type EmailData = {
  subject: string;
  title: string;
  message: string;
  callToAction?: {
    text: string;
    url: string;
  };
};

function createEmailTemplate(data: EmailData) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 32px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 24px;
            text-align: center;
          }
          .title {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
          }
          .message {
            color: #4b5563;
            margin-bottom: 24px;
          }
          .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
          }
          .button {
            display: inline-block;
            background-color: #eab308;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 16px;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 32px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">🎯 Habit Tracker</div>
            <h1 class="title">${data.title}</h1>
            <div class="message">${data.message}</div>
            ${data.callToAction ? `
              <div class="divider"></div>
              <a href="${data.callToAction.url}" class="button">
                ${data.callToAction.text}
              </a>
            ` : ''}
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Habit Tracker. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendEmailToUser(userId: string, emailData: EmailData) {
  try {
    const [user] = await db
      .select({
        email: Users.email,
        name: Users.name,
      })
      .from(Users)
      .where(eq(Users.id, userId));

    if (!user?.email) {
      throw new Error('User email not found');
    }

    const info = await transporter.sendMail({
      from: `"Habit Tracker" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: emailData.subject,
      html: createEmailTemplate(emailData),
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
} 