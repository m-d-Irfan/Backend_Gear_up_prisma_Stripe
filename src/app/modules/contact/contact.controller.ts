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

  const officialEmail = process.env.SMTP_USER || 'grabgear4100@gmail.com';
  const customerEmail = email && email.trim() ? email.trim() : null;

  // 1. Send the customer's inquiry message to the Official Website Mail (grabgear4100@gmail.com)
  // Setting replyTo: customerEmail ensures that hitting "Reply" in Gmail replies directly to the customer!
  const adminSubject = `New Customer Inquiry from ${customerEmail || phone || 'Website Visitor'}`;
  const adminHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #059669; margin-top: 0;">New Contact Inquiry Received</h2>
      <p style="font-size: 14px; margin: 6px 0;"><strong>Customer Email:</strong> ${customerEmail || 'Not Provided'}</p>
      <p style="font-size: 14px; margin: 6px 0;"><strong>WhatsApp / Phone:</strong> ${phone || 'Not Provided'}</p>
      <p style="font-size: 14px; margin: 16px 0 6px 0;"><strong>Message:</strong></p>
      <blockquote style="background: #f8fafc; padding: 14px; border-left: 4px solid #059669; font-size: 14px; line-height: 1.6; margin: 0; color: #334155;">
        ${message}
      </blockquote>
      <p style="font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        💡 <em>To reply directly to this customer, simply click <strong>Reply</strong> in your Gmail app.</em>
      </p>
    </div>
  `;

  const adminText = `New Contact Inquiry Received\n\nCustomer Email: ${customerEmail || 'Not Provided'}\nPhone/WhatsApp: ${phone || 'Not Provided'}\n\nMessage:\n${message}\n\nClick Reply to email the customer directly.`;

  try {
    await sendEmail(officialEmail, adminSubject, adminHtml, customerEmail || officialEmail, adminText);
  } catch (err) {
    console.error('Failed to deliver inquiry to official email:', err);
  }

  // 2. Send automated acknowledgment confirmation email to the customer's inbox (if email provided)
  if (customerEmail) {
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
      await sendEmail(customerEmail, customerSubject, customerHtml, officialEmail, customerText);
    } catch (err) {
      console.error('Failed to send customer acknowledgment email:', err);
    }
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inquiry submitted successfully.',
    data: { email: customerEmail, phone },
  });
});

export const ContactController = {
  sendContactInquiry,
};
