const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();


const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const baseTemplate = (content, name, subject) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7f9;
      margin: 0;
      padding: 0;
      color: #334155;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .header {
      background-color: #4f46e5;
      background-image: linear-gradient(to bottom right, #4f46e5, #3b82f6);
      padding: 40px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.025em;
      text-transform: uppercase;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
      font-weight: 500;
      letter-spacing: 0.1em;
      font-size: 12px;
    }
    .content {
      padding: 40px;
    }
    .content h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 0;
    }
    .content p {
      line-height: 1.6;
      font-size: 16px;
    }
    .btn-container {
      text-align: center;
      margin: 35px 0;
    }
    .btn {
      background-color: #4f46e5;
      color: #ffffff !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      display: inline-block;
      box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
    }
    .otp-container {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: 0.2em;
      color: #4f46e5;
      margin: 0;
    }
    .footer {
      padding: 30px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
    }
    .footer p {
      margin: 5px 0;
    }
    .highlight {
      color: #4f46e5;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SCORION</h1>
      <p>Intelligence Network</p>
    </div>
    <div class="content">
      <h2>Hello, ${name}</h2>
      ${content}
      <p style="margin-top: 40px;">Stay optimized,</p>
      <p style="font-weight: 700; color: #4f46e5;">The Scorion Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Scorion Network Protocols. All rights reserved.</p>
      <p>Confidential Academic Intelligence Transmission</p>
    </div>
  </div>
</body>
</html>
`;

// Existing OTP Function
const sendEmail = async (email, otp, name = "User", subject = "OTP Verification") => {
  try {
    const transporter = createTransporter();
    const content = `
      <p>Welcome to the Scorion community. To proceed with your request, please use the following One-Time Password (OTP) for verification.</p>
      <div class="otp-container">
        <p style="margin-bottom: 15px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">Verification Code</p>
        <h1 class="otp-code">${otp}</h1>
      </div>
      <p>This code will expire in <span class="highlight">10 minutes</span>. If you did not request this verification, please ignore this email or contact our security node.</p>
    `;

    const htmlContent = baseTemplate(content, name, subject);
console.log(process.env.EMAIL_USER,";");

    await transporter.sendMail({
      from: `"Scorion Network" <fasalgafoor2080@gmail.com>`,
      to: email,
      subject: subject,
      text: `Your OTP for SCORION verification is: ${otp}`,
      html: htmlContent
    });

    console.log(`OTP Email sent to ${email}`);
  } catch (error) {
    console.error("Email error Details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
  }
};

// New Account Creation Function
console.log(process.env.FRONTEND_URL,"url")

const sendAccountCreationEmail = async (email, name, role, token) => {
  try {
    const transporter = createTransporter();
    const subject = `Welcome to SCORION - Initialize Your ${role === 'teacher' ? 'Faculty' : 'Student'} Account`;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const createPassUrl = `${frontendUrl}/createpass/${token}`;

    const content = `
      <p>Welcome to the <span class="highlight">SCORION Intelligence Network</span>. Your ${role} profile has been successfully initialized by the administrative department.</p>
      <p>To access your dashboard and active modules, you must first secure your account by establishing a unique access key (password).</p>
      <div class="btn-container">
        <a href="${createPassUrl}" class="btn">SECURE YOUR ACCOUNT</a>
      </div>
      <p>Note: For security reasons, this setup link is only active for <span class="highlight">1 hour</span>. If the link expires, please contact your system administrator.</p>
      <p style="font-size: 13px; color: #64748b;">If the button doesn't work, copy and paste this URL into your browser: ${createPassUrl}</p>
    `;

    const htmlContent = baseTemplate(content, name, subject);

    await transporter.sendMail({
      from: `"Scorion Registry" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: `Welcome to SCORION! Please set your password here: ${createPassUrl}`,
      html: htmlContent
    });

    console.log(`Account Creation Email sent to ${email}`);
  } catch (error) {
    console.error("Account Creation Email error Details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
};

module.exports = { sendEmail, sendAccountCreationEmail };

