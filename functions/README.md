# Cloud Functions - Project Docto

## Email Configuration

### Option 1: SMTP (Recommended)
Supports any SMTP server (Gmail, Outlook, Yahoo, custom servers).

**Firebase Config:**
```bash
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.password="your-app-password"
firebase functions:config:set smtp.secure="false"
```

**Environment Variables (Local Development):**
Create `functions/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false
```

**Common SMTP Settings:**
- Gmail: `smtp.gmail.com:587` (secure: false) or `:465` (secure: true)
- Outlook/Hotmail: `smtp-mail.outlook.com:587`
- Yahoo: `smtp.mail.yahoo.com:587`
- Custom: Check your email provider's documentation

### Option 2: Gmail (Simple)
```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
```

**Note:** For Gmail, you need an App Password (not your regular password):
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate app password for "Mail"

## SMS Configuration

### Option 1: Textbelt (Free tier available)
Textbelt offers a free tier (1 SMS/day) and paid plans.

**Firebase Config:**
```bash
firebase functions:config:set textbelt.api_key="your-api-key"
```

**Environment Variables (Local Development):**
Create `functions/.env`:
```env
TEXTBELT_API_KEY=your-textbelt-api-key
```

**Get API Key:**
1. Visit https://textbelt.com/
2. Sign up for an account
3. Get your API key from dashboard
4. Free tier: 1 SMS/day
5. Paid: $10/month for unlimited

### Option 2: Twilio (Paid service)
Twilio offers pay-as-you-go pricing.

**Firebase Config:**
```bash
firebase functions:config:set twilio.account_sid="your-sid"
firebase functions:config:set twilio.auth_token="your-token"
firebase functions:config:set twilio.phone_number="+1234567890"
```

**Environment Variables (Local Development):**
Create `functions/.env`:
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Priority:** The code tries Textbelt first, then falls back to Twilio if Textbelt fails or is not configured.

## Local Development

1. Create `functions/.env` file with your credentials
2. Install dependencies: `npm install`
3. Start emulator: `npm run serve`

## Deployment

After setting Firebase config:
```bash
firebase deploy --only functions
```

## Functions Available

1. **onUserCreated** - Sends welcome email when user signs up
2. **onAppointmentCreated** - Sends email notification when appointment is created
3. **sendCustomEmail** - HTTP callable function to send custom emails
4. **sendSMSNotification** - HTTP callable function to send SMS

