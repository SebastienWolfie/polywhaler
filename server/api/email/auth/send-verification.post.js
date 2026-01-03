import * as nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'; // You might need: npm install jsonwebtoken @types/jsonwebtoken

// SECRET KEY: Put this in your .env file in production!
const JWT_SECRET = 'jnkjnjkjnhbjhbyubyhiuh89h89ui87g6uhbutyv7tby67g87huih89h97ug867g78hiugh78yv5erd546f5td5';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, walletAddress, username } = body;

    if (!email || !walletAddress) {
      throw createError({ statusCode: 400, message: 'Missing email or wallet address' });
    }

    // 1. Generate a secure, time-limited token (expires in 24 hours)
    const token = jwt.sign(
      { email, walletAddress, type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 2. Create the Verification Link
    // CHANGE THIS to your real domain in production
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'; 
    const verificationLink = `${baseUrl}/verify?token=${token}`;

    // 3. Configure Transporter
    let transporter = nodemailer.createTransport({
        host: "smtp.titan.email",
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply@xn--hteronline-9db.com', // Replace with your actual email
            pass: 'Huteronline123?' // Replace with env variable in prod
        }
    });

    // 4. Send Email
    const mail_configs = {
        from: '"Polywhaler Security" <no-reply@xn--hteronline-9db.com>',
        to: email, 
        subject: 'Verify your Polywhaler Account',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #000; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #333; border-radius: 12px; }
            .btn { background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 20px;}
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
            <div class="container">
               <h2>Welcome to Polywhaler, ${username}!</h2>
               <p>To access whale tracking features, please confirm that <strong>${walletAddress}</strong> is your wallet address.</p>
               
               <a href="${verificationLink}" class="btn">Verify My Account</a>
               
               <p style="margin-top:20px; color: #888;">Link expires in 24 hours.</p>
               
               <div class="footer">
                 If you did not create this account, please ignore this email.
               </div>
            </div>
        </body>
        </html>`
    };

    await transporter.sendMail(mail_configs);

    return { success: true, message: 'Verification email sent' };

  } catch (err) {
    console.error("Email Error:", err);
    throw createError({ statusCode: 500, message: err.message });
  }
});