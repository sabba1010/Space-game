const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test email route (optional - for testing)
app.post('/api/test-email', async (req, res) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'Test Email - envo game',
      html: '<h1>Test Email</h1><p>This is a test email from the envo game server.</p>'
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Contact form submission route
app.post('/api/contact', async (req, res) => {
  try {
    const { message, playerInfo } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    // Format email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: white; padding: 20px; }
            .message-box { background-color: #ecf0f1; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
            .player-info { font-size: 0.9em; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
            .footer { text-align: center; font-size: 0.85em; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 Envo game - Player Message</h1>
            </div>
            <div class="content">
              <p>A player has sent you a message after completing the game!</p>
              
              <div class="message-box">
                <strong>Message:</strong><br>
                ${escapeHtml(message)}
              </div>

              ${playerInfo ? `
              <div class="player-info">
                <strong>Player Information:</strong><br>
                ${playerInfo.finalScore ? `Final Score: ${playerInfo.finalScore}<br>` : ''}
                ${playerInfo.timestamp ? `Sent: ${new Date(playerInfo.timestamp).toLocaleString()}<br>` : ''}
              </div>
              ` : ''}

              <div class="footer">
                <p>This is an automated email from the envo game game server.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '🎮 New Message from envo game Player',
      html: htmlContent,
      text: `Player Message: ${message}`
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully to sabbahossain123@gmail.com' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email: ' + error.message 
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Sending emails to: ${process.env.EMAIL_TO}`);
});

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
