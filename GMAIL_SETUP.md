# Gmail Email Configuration Guide

## 🚀 Quick Setup

Your email is configured to send password reset emails from: **softverse4@gmail.com**

## ⚠️ IMPORTANT: Generate Gmail App Password

Gmail requires an **App Password** (not your regular Gmail password) for security.

### Step-by-Step Instructions:

#### 1️⃣ Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification**
3. Follow the steps to enable it (if not already enabled)

#### 2️⃣ Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in with **softverse4@gmail.com**
3. In "Select app" → Choose **Mail**
4. In "Select device" → Choose **Other** and type: `SoftLearn Backend`
5. Click **Generate**
6. Google will show a **16-character password** like: `abcd efgh ijkl mnop`

#### 3️⃣ Add to .env File
1. Open `/Users/adhikarirabin/Desktop/softlearn/.env`
2. Find this line:
   ```
   GMAIL_APP_PASSWORD=your-gmail-app-password-here
   ```
3. Replace with your 16-character password (remove spaces):
   ```
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

#### 4️⃣ Restart Backend
```bash
cd /Users/adhikarirabin/Desktop/softlearn
docker compose restart softlearn
```

## ✅ Test Email Sending

After setup, test the password reset:

```bash
# Test with a real email address (your email to receive the reset link)
curl -X POST http://localhost:3000/api/forgot-password/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com","account_type":"student"}'
```

Check your inbox for the password reset email!

## 📧 What's Been Configured

✅ **Mailer Created**: `PasswordResetMailer`
✅ **Email Templates**: HTML and plain text versions
✅ **SMTP Settings**: Configured for Gmail (smtp.gmail.com:587)
✅ **From Address**: softverse4@gmail.com
✅ **Environment Variables**: Added to .env and compose.yaml

## 🔍 Troubleshooting

### Email not received?

**Check logs:**
```bash
docker compose logs softlearn | grep "Password reset email"
```

**Common issues:**

1. **Invalid credentials** → Error: `535 Authentication failed`
   - Verify App Password is correct (16 characters, no spaces)
   - Make sure 2FA is enabled on the Gmail account

2. **Account not found** → Check the user exists in database:
   ```bash
   docker compose exec softlearn rails console
   > User.find_by(email: 'test@example.com')
   ```

3. **Emails in Spam** → Check spam/junk folder

4. **Network timeout** → Check internet connection and firewall

### View email logs:
```bash
# See all email-related logs
docker compose logs softlearn --follow | grep -i mail

# See security logs
docker compose logs softlearn --follow | grep SECURITY
```

## 📝 Production Settings

For production (in `.env` with `RAILS_ENV=production`):
- Use the same Gmail App Password
- Update `FRONTEND_URL` to your production domain
- Consider using a dedicated email service like:
  - SendGrid
  - Mailgun
  - Amazon SES
  - Postmark

## 🛡️ Security Features

✅ **15-minute expiry** - Reset links expire automatically
✅ **3 attempt limit** - Prevents token brute-forcing  
✅ **Rate limiting** - 3 reset requests per hour per email/IP
✅ **No email enumeration** - Same response whether email exists or not
✅ **Secure tokens** - 64-character cryptographically secure tokens
✅ **Hashed storage** - Tokens are BCrypt-hashed in database
✅ **Security logging** - All password reset attempts are logged

## 📬 Email Contents

Users will receive:
- A clickable "Reset Password" button
- A copy-pasteable reset link
- Expiry time warning (15 minutes)
- Security notice about ignoring if they didn't request it

The reset link format:
```
http://localhost:5173/reset-password?token=<secure-token>
```

---

**Need help?** Check the logs or test with the curl command above!
