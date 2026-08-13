import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { sendEmail } from '../../utils/sendEmail';

const sendContactInquiry = catchAsync(async (req: Request, res: Response) => {
  const { email, phone, message } = req.body;

  if (!email && !phone) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'Please provide either an email or phone number',
      data: null,
    });
  }

  const adminEmail = process.env.SMTP_USER || 'grabgear4100@gmail.com';

  // Send single automated confirmation email ONLY to the customer's email address 
  if (email && email.trim()) {
    const customerSubject = 'We received your inquiry - GrabGear Outdoor Rentals';
    const customerHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #059669; margin-top: 0;">GrabGear Outdoor Rentals</h2>
        <p style="font-size: 14px; line-height: 1.6;">Hi there,</p>
        <p style="font-size: 14px; line-height: 1.6;">Thank you for reaching out to <strong>GrabGear Outdoor Rentals</strong>! We have received your inquiry:</p>
        <blockquote style="background: #f8fafc; padding: 14px; border-left: 4px solid #059669; font-style: italic; font-size: 14px; color: #334155; margin: 16px 0;">
          "${message}"
        </blockquote>
        <p style="font-size: 14px; line-height: 1.6;">A member of the GrabGear support team will review your message and get back to you within <strong>72 hours</strong>.</p>
        <p style="font-size: 14px; line-height: 1.6;">If your request is urgent, please connect directly with us on WhatsApp at <a href="https://wa.me/8801611836864" style="color: #059669; font-weight: bold; text-decoration: underline;">+880 1611-836864</a>.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          Warm regards,<br />
          <strong>The GrabGear Outdoor Support Team</strong><br />
          Official Contact: grabgear4100@gmail.com
        </p>
      </div>
    `;

    const customerText = `GrabGear Outdoor Rentals\n\nHi there,\n\nThank you for reaching out to GrabGear Outdoor Rentals! We have received your inquiry:\n\n"${message}"\n\nA member of the GrabGear support team will review your message and get back to you within 72 hours.\n\nIf your request is urgent, please connect with us on WhatsApp: +880 1611-836864\n\nWarm regards,\nThe GrabGear Outdoor Support Team\ngrabgear4100@gmail.com`;

    try {
      await sendEmail(email, customerSubject, customerHtml, adminEmail, customerText);
    } catch (err) {
      console.error('Failed to send customer acknowledgment email:', err);
    }
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inquiry submitted successfully. Confirmation email sent to you.',
    data: { email, phone },
  });
});

export const ContactController = {
  sendContactInquiry,
};
