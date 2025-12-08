const SibApiV3Sdk = require('sib-api-v3-sdk');

class NotificationService {
  constructor() {
    // Initialize Brevo API
    this.defaultClient = SibApiV3Sdk.ApiClient.instance;
    this.apiKey = this.defaultClient.authentications['api-key'];
    this.apiKey.apiKey = process.env.BREVO_API_KEY;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    this.sender = {
      email: 'abdullahmansoor04@gmail.com',
      name: 'Meeting Minutes AI'
    };
  }

  /**
   * Send an email notification
   */
  async sendEmail(to, subject, html, text = null) {
    try {
      if (!process.env.BREVO_API_KEY) {
        console.warn('⚠️ BREVO_API_KEY not set, skipping email send');
        return { success: false, error: 'API key missing' };
      }

      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: to }];
      if (text) sendSmtpEmail.textContent = text;

      const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Email sent successfully via Brevo. MessageId:', data.messageId);
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('❌ Send Email Error (Brevo):', error);
      // Don't crash the app if email fails
      return { success: false, error: error.message };
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOTP(email, otp) {
    const subject = `🔐 Your Verification Code: ${otp}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #f4f4f5; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d97706; background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; display: inline-block; }
    .footer { font-size: 12px; color: #71717a; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="color: #18181b; margin-top: 0;">Verify Your Email</h1>
    <p style="color: #52525b;">Use the code below to complete your registration.</p>
    
    <div class="code">${otp}</div>
    
    <p style="color: #71717a; font-size: 14px;">This code expires in 10 minutes.</p>
    
    <div class="footer">If you didn't request this, please ignore this email.</div>
  </div>
</body>
</html>
`;
    return await this.sendEmail(email, subject, html);
  }

  /**
   * Send reminder email
   */
  async sendReminderEmail(user, reminder) {
    const subject = `⏰ Reminder: ${reminder.task}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', user-scalable, system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 20px auto; padding: 0; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: #d97706; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 25px; }
    .task-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .priority-badge { display: inline-block; background: #d97706; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
    .btn { display: inline-block; background: #1f2937; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 10px; }
    .footer { background: #18181b; padding: 20px; text-align: center; color: #71717a; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Task Reminder</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px;">Hi ${user.name},</p>
      <p>This is a reminder that the following task is due <strong>tomorrow</strong>.</p>
      
      <div class="task-box">
        <span class="priority-badge">DUE TOMORROW</span>
        <h2 style="margin: 8px 0; color: #1f2937;">${reminder.task}</h2>
        <p style="margin: 0; color: #4b5563;">${reminder.message}</p>
      </div>
      
      <p>Please ensure this item is completed on time.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/reminders" class="btn">View My Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Meeting Minutes AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

    return await this.sendEmail(user.email, subject, html);
  }

  /**
   * Send meeting processed notification
   */
  async sendMeetingProcessedEmail(user, meeting) {
    const subject = `✅ Meeting Processed: ${meeting.title}`;

    const actionItems = (meeting.processed_responsibilities || [])
      .map(r => `<div style="margin-bottom: 8px; padding-left: 10px; border-left: 3px solid #10b981;"><strong>${r.actor}</strong>: ${r.task}</div>`)
      .join('');

    const deadlines = (meeting.processed_deadlines || [])
      .map(d => `<div style="margin-bottom: 8px; padding-left: 10px; border-left: 3px solid #f59e0b;"><strong>${d.task}</strong><br><span style="font-size: 12px; color: #6b7280;">Due: ${d.deadline ? new Date(d.deadline).toLocaleDateString() : 'TBD'}</span></div>`)
      .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 700; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #10b981; margin: 0;">Meeting Processed</h1>
      <p style="margin: 5px 0 0; color: #6b7280;">"${meeting.title}"</p>
    </div>
    
    <div class="section">
      <div class="section-title">Summary</div>
      <p style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 0;">${meeting.summary || 'No summary available'}</p>
    </div>
    
    ${actionItems ? `
    <div class="section">
      <div class="section-title">Action Items</div>
      ${actionItems}
    </div>
    ` : ''}
    
    ${deadlines ? `
    <div class="section">
      <div class="section-title">Upcoming Deadlines</div>
      ${deadlines}
    </div>
    ` : ''}
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/meetings/${meeting._id}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600;">View Full Meeting</a>
    </div>
  </div>
</body>
</html>
`;

    return await this.sendEmail(user.email, subject, html);
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionEmail(user, tier, action = 'upgraded') {
    const subject = `🎉 Subscription ${action === 'upgraded' ? 'Upgraded' : 'Changed'} to ${tier}`;

    const features = {
      BASIC: ['50 meeting uploads/month', '2 hours of audio/month', '20 contracts/month'],
      ULTRA: ['Unlimited uploads', 'Unlimited audio', 'Unlimited contracts', 'Priority processing']
    };

    const tierFeatures = features[tier] || [];

    const html = `
<!DOCTYPE html>
<html>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #8b5cf6;">You're now on the ${tier} Plan! 🚀</h1>
    <p>Hi ${user.name},</p>
    <p>Your subscription has been successfully updated.</p>
    
    <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Plan Features:</h3>
      <ul style="padding-left: 20px;">
        ${tierFeatures.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
    
    <p>Enjoy your new powers!</p>
  </div>
</body>
</html>
`;

    return await this.sendEmail(user.email, subject, html);
  }

  /**
   * Verify connection (stub for Brevo)
   */
  async verifyConnection() {
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ Brevo API Key missing');
      return false;
    }
    return true;
  }
}

module.exports = new NotificationService();
