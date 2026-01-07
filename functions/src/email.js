const nodemailer = require('nodemailer');
const functions = require('firebase-functions');

function createTransporter() {
  // SMTP Configuration (supports any SMTP server)
  const smtpHost = functions.config().smtp?.host || process.env.SMTP_HOST;
  const smtpPort = functions.config().smtp?.port || process.env.SMTP_PORT || 587;
  const smtpUser = functions.config().smtp?.user || process.env.SMTP_USER;
  const smtpPassword = functions.config().smtp?.password || process.env.SMTP_PASSWORD;
  const smtpSecure = functions.config().smtp?.secure === 'true' || process.env.SMTP_SECURE === 'true';

  // Fallback to Gmail if SMTP not configured
  const emailUser = functions.config().email?.user || process.env.EMAIL_USER || smtpUser;
  const emailPassword = functions.config().email?.password || process.env.EMAIL_PASSWORD || smtpPassword;

  if (smtpHost && smtpUser && smtpPassword) {
    // Use custom SMTP server
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
  } else if (emailUser && emailPassword) {
    // Fallback to Gmail
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  throw new Error('Email configuration not found. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD or EMAIL_USER, EMAIL_PASSWORD in config.');
}

async function sendEmail(options) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: options.from || functions.config().smtp?.user || functions.config().email?.user || 'noreply@yourdomain.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendEmail };
