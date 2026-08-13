import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
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

  // 1. Send notification email to GrabGear admin inbox (grabgear4100@gmail.com)
  const adminSubject = `New Website Inquiry from ${email || phone || 'Customer'}`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>New Contact Inquiry Received</h2>
      <p><strong>Customer Email:</strong> ${email || 'Not Provided'}</p>
      <p><strong>Phone / WhatsApp:</strong> ${phone || 'Not Provided'}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #10b981;">
        ${message}
      </blockquote>
    </div>
  `;

  try {
    await sendEmail(process.env.SMTP_USER || 'grabgear4100@gmail.com', adminSubject, adminHtml);
  } catch (err) {
    console.error('Failed to send admin notification email:', err);
  }

  // 2. Send automated acknowledgment email back to customer (if email provided)
  if (email && email.trim()) {
    const customerSubject = 'Inquiry Received - GrabGear Outdoor Rentals';
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 16px;">
        <h2 style="color: #059669;">GrabGear Outdoor Rentals</h2>
        <p>Hi there,</p>
        <p>Thank you for reaching out to GrabGear Outdoor Rentals!</p>
        <p>We have successfully received your inquiry:</p>
        <blockquote style="background: #f8fafc; padding: 12px; border-left: 4px solid #059669; font-style: italic;">
          "${message}"
        </blockquote>
        <p>A member of the GrabGear support team will review your message and contact you within <strong>72 hours</strong>.</p>
        <p>If your request is urgent, please feel free to reach us directly on WhatsApp at <a href="https://wa.me/8801611836864" style="color: #059669; font-weight: bold;">+880 1611-836864</a>.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">
          Warm regards,<br />
          <strong>The GrabGear Outdoor Support Team</strong><br />
          Official Contact: grabgear4100@gmail.com
        </p>
      </div>
    `;

    try {
      await sendEmail(email, customerSubject, customerHtml);
    } catch (err) {
      console.error('Failed to send customer acknowledgment email:', err);
    }
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inquiry submitted successfully. Email sent via SMTP.',
    data: { email, phone },
  });
});

export const ContactController = {
  sendContactInquiry,
};
