# Email Notification Setup Guide

## Overview
The envo game game now sends email notifications to `sabbahossain123@gmail.com` when players submit a message after winning.

## Prerequisites
- Node.js (v14 or higher)
- npm package manager
- Gmail account with 2-factor authentication enabled

## Setup Instructions

### 1. Create a Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to **App passwords** (at the bottom)
4. Select **Mail** and **Windows Computer** (or your device)
5. Google will generate a 16-character password
6. Copy this password

### 2. Configure Environment Variables
1. Navigate to the `server` folder
2. Copy `.env.example` to `.env`
3. Edit `.env` with your credentials:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM=your-gmail@gmail.com
   EMAIL_TO=sabbahossain123@gmail.com
   PORT=3000
   ```

### 3. Install Dependencies
```bash
cd server
npm install
```

### 4. Run the Server
```bash
npm start
```

The server will start on `https://server-ecru-eight-91.vercel.app`

### 5. Test the Setup
You can test the email functionality with:
```bash
curl -X POST https://server-ecru-eight-91.vercel.app/api/test-email
```

## How It Works

1. When a player wins the game, the win screen appears with a contact message box
2. Player writes a message and clicks "Send"
3. The message is sent to the backend server via HTTP POST
4. The server formats the message with player info (score, timestamp)
5. An email is sent to `sabbahossain123@gmail.com` with the message
6. The player receives confirmation

## Email Content
The email includes:
- Player's message
- Final game score
- Timestamp of when the message was sent
- Professional HTML formatting

## Troubleshooting

### "Failed to connect to server"
- Ensure the Node.js server is running on port 3000
- Check that no firewall is blocking port 3000

### "Failed to send email"
- Verify Gmail credentials in `.env` file
- Ensure you're using an [App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail password
- Confirm 2-factor authentication is enabled on the Gmail account
- Check that "Less secure apps" is not blocking the connection

### CORS Issues
- The server is configured to accept requests from any origin
- If issues persist, add the game domain to the CORS whitelist in `server.js`

## Production Deployment

For production use:
1. Deploy the Node.js server to a hosting service (Heroku, AWS, Azure, etc.)
2. Update the API endpoint in `script.js` from `https://server-ecru-eight-91.vercel.app` to your production URL
3. Use environment-specific configuration for email credentials
4. Set `NODE_ENV=production` in your `.env` file
5. Consider adding rate limiting and input validation

## Security Notes
- Never commit `.env` file to version control
- Keep email credentials secure
- Consider implementing CAPTCHA for the contact form in production
- Add rate limiting to prevent spam
- Validate and sanitize all user inputs on the server side
