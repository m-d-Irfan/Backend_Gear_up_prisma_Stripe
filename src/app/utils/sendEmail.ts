import nodemailer from 'nodemailer';

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
  text?: string
) => {
  const smtpUser = process.env.SMTP_USER || 'grabgear4100@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'seqhdhbqdetudeyw';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Plain text fallback to ensure high deliverability and prevent SPAM filter flags
  const plainText = text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const mailOptions = {
    from: `"GrabGear Outdoor Rentals" <${smtpUser}>`,
    replyTo: replyTo || smtpUser,
    to,
    subject,
    text: plainText,
    html,
    headers: {
      'X-Priority': '3',
      'X-Mailer': 'Nodemailer - GrabGear Rentals',
    },
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
