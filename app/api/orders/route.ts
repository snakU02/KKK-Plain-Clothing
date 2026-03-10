import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const order = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or use SMTP settings (host, port) for more flexibility
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // User must provide an "App Password"
      },
    });

    const mailOptions = {
      from: `"KK Plain Store" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_RECEIVER || process.env.GMAIL_USER,
      subject: `New Order Received: ${order.id} - ${order.paymentMethod}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background-color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 4px; font-size: 24px;">KK Plain Clothing.</h1>
          </div>
          
          <div style="padding: 40px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 25px;">You have received a new order from your online store.</p>
            
            <div style="background-color: #f8f8f8; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 10px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Order ID</td>
                  <td style="padding-bottom: 10px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Date</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; font-size: 16px;">${order.id}</td>
                  <td style="font-weight: bold; font-size: 16px; text-align: right;">${order.date}</td>
                </tr>
                <tr><td colspan="2" style="padding-top: 20px;"></td></tr>
                <tr>
                  <td style="padding-bottom: 10px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Customer Email</td>
                  <td style="padding-bottom: 10px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Payment Method</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; font-size: 16px;">${order.customerEmail || 'Guest'}</td>
                  <td style="font-weight: bold; font-size: 16px; text-align: right;">${order.paymentMethod}</td>
                </tr>
              </table>
            </div>

            <h3 style="border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-size: 18px; text-transform: uppercase;">Order Items</h3>
            
            ${order.items.map((item: any) => `
              <div style="display: flex; margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px;">
                <div style="flex: 1;">
                  <p style="margin: 0; font-weight: bold; font-size: 15px;">${item.name}</p>
                  <p style="margin: 5px 0 0; color: #666; font-size: 13px;">Variant: ${item.variant} | Qty: ${item.qty}</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-weight: bold;">₱${(item.price * item.qty).toLocaleString()}</p>
                </div>
              </div>
            `).join('')}

            <div style="margin-top: 30px; text-align: right;">
              <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase;">Total Amount</p>
              <p style="margin: 5px 0 0; font-size: 28px; font-weight: bold; color: #000;">₱${order.total.toLocaleString()}</p>
            </div>

            <div style="margin-top: 40px; text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/admin" style="background-color: #000; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Open Admin Dashboard</a>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>© 2026 KK Plain Clothing. Sent automatically via Notification System.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Order notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification email' }, { status: 500 });
  }
}
