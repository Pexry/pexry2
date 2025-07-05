# Gmail SMTP Setup Guide for Pexry Email Notifications

## Prerequisites
- A Gmail account
- Two-factor authentication enabled on your Gmail account

## Step 1: Enable Two-Factor Authentication
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Follow the setup process to enable 2FA

## Step 2: Generate App Password
1. In your Google Account settings, go to **Security**
2. Under "2-Step Verification", click **App passwords**
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Enter "Pexry Email Service" as the name
6. Click **Generate**
7. **Copy the 16-character password** (you'll need this for GMAIL_APP_PASSWORD)

## Step 3: Configure Environment Variables
Add these variables to your `.env` file:

```bash
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
GMAIL_FROM_EMAIL="Pexry Support <your-email@gmail.com>"
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Step 4: Test the Configuration
You can test if your Gmail SMTP setup is working by triggering any notification that sends emails (like dispute creation, withdrawal updates, etc.).

## Important Notes

### Security
- **Never use your regular Gmail password** - always use an App Password
- Keep your App Password secure and don't share it
- You can revoke App Passwords anytime from your Google Account settings

### Email Limits
- Gmail SMTP has sending limits:
  - **500 emails per day** for free Gmail accounts
  - **2000 emails per day** for Google Workspace accounts
- If you exceed these limits, consider using a dedicated email service

### Troubleshooting

#### "Invalid credentials" error:
- Make sure 2FA is enabled on your Gmail account
- Verify you're using an App Password, not your regular password
- Check that GMAIL_USER is your full email address

#### "Connection refused" error:
- Check your internet connection
- Verify Gmail SMTP is not blocked by your firewall
- Some VPS providers block SMTP ports (25, 587, 465)

#### Emails not being delivered:
- Check your spam folder
- Verify the recipient email address is correct
- Check Gmail's sent folder to confirm emails are being sent

### Alternative Configuration (Advanced)
If you need more control, you can also configure SMTP manually:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false  # true for 465, false for other ports
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

This setup provides a reliable, free email service for your Pexry platform notifications!
