const nodemailer = require('nodemailer');

class NotificationService {
    constructor() {
        // Initialize email transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    /**
     * Send an email notification
     */
    async sendEmail(to, subject, html, text = null) {
        try {
            const mailOptions = {
                from: `"Meeting Minutes AI" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '')
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Send Email Error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
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
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
    .task-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Task Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${user.name},</p>
      <p>This is a reminder about your upcoming task:</p>
      
      <div class="task-box">
        <h3>${reminder.task}</h3>
        <p>${reminder.message}</p>
      </div>
      
      <p>Don't forget to complete this task on time!</p>
      
      <div class="footer">
        <p>This reminder was sent by Meeting Minutes AI</p>
      </div>
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
            .map(r => `<li><strong>${r.actor}</strong>: ${r.task}</li>`)
            .join('');

        const deadlines = (meeting.processed_deadlines || [])
            .map(d => `<li>${d.task} - Due: ${d.deadline || 'TBD'}</li>`)
            .join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
    .section { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Meeting Processed!</h1>
    </div>
    <div class="content">
      <p>Hi ${user.name},</p>
      <p>Your meeting "<strong>${meeting.title}</strong>" has been processed.</p>
      
      <div class="section">
        <h3>📝 Summary</h3>
        <p>${meeting.summary || 'No summary available'}</p>
      </div>
      
      ${actionItems ? `
      <div class="section">
        <h3>📋 Action Items</h3>
        <ul>${actionItems}</ul>
      </div>
      ` : ''}
      
      ${deadlines ? `
      <div class="section">
        <h3>📅 Deadlines</h3>
        <ul>${deadlines}</ul>
      </div>
      ` : ''}
      
      <p>Log in to view the full details and export to Google Sheets.</p>
      
      <div class="footer">
        <p>Meeting Minutes AI - Automating your meeting notes</p>
      </div>
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
        const subject = `🎉 Subscription ${action === 'upgraded' ? 'Upgraded' : 'Changed'}: ${tier}`;

        const features = {
            BASIC: ['50 meeting uploads/month', '2 hours of audio/month', '20 contracts/month', 'Real-time extension streaming'],
            ULTRA: ['Unlimited uploads', 'Unlimited audio', 'Unlimited contracts', 'Priority processing', 'Real-time extension streaming']
        };

        const tierFeatures = features[tier] || [];

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
    .feature-list { background: white; padding: 15px; border-radius: 8px; }
    .feature-list li { padding: 5px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to ${tier}!</h1>
    </div>
    <div class="content">
      <p>Hi ${user.name},</p>
      <p>Your subscription has been ${action} to <strong>${tier}</strong>!</p>
      
      <div class="feature-list">
        <h3>Your Plan Includes:</h3>
        <ul>
          ${tierFeatures.map(f => `<li>✅ ${f}</li>`).join('')}
        </ul>
      </div>
      
      <p>Thank you for choosing Meeting Minutes AI!</p>
      
      <div class="footer">
        <p>Questions? Reply to this email for support.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

        return await this.sendEmail(user.email, subject, html);
    }

    /**
     * Verify email configuration
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email transporter verified');
            return true;
        } catch (error) {
            console.error('Email transporter verification failed:', error);
            return false;
        }
    }
}

module.exports = new NotificationService();
