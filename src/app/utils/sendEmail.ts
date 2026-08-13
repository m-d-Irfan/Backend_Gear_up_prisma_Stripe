import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || 'grabgear4100@gmail.com',
      pass: process.env.SMTP_PASS || 'seqhdhbqdetudeyw',
    },
  });

  const mailOptions = {
    from: `"GrabGear Outdoor Rentals" <${process.env.SMTP_USER || 'grabgear4100@gmail.com'}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
