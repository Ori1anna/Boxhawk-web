# Email Setup for Invitations

To enable email sending for user invitations, you need to configure SMTP settings in your environment variables.

## Environment Variables

Add these to your `.env.local` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@boxhawk.com
```

## Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

## Other Email Services

You can use other SMTP services like:
- SendGrid
- Mailgun
- Amazon SES
- Outlook/Hotmail

Just update the `SMTP_HOST` and `SMTP_PORT` accordingly.

## Testing

1. Configure your environment variables
2. Uncomment the line `await transporter.sendMail(mailOptions)` in the code
3. Send a test invitation
4. Check the console logs for email details

## Current Status

Currently, the system logs email details to the console instead of actually sending emails. This is for development purposes.

To enable actual email sending:
1. Set up the environment variables above
2. Uncomment the `await transporter.sendMail(mailOptions)` line in the code
3. Restart your development server
