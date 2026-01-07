const twilio = require('twilio');
const functions = require('firebase-functions');
const https = require('https');

// Textbelt SMS configuration
function getTextbeltConfig() {
  const apiKey = functions.config().textbelt?.api_key || process.env.TEXTBELT_API_KEY;
  return { apiKey };
}

// Twilio SMS configuration
function getTwilioClient() {
  const accountSid = functions.config().twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = functions.config().twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = functions.config().twilio?.phone_number || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    return null;
  }

  return {
    client: twilio(accountSid, authToken),
    phoneNumber,
  };
}

// Send SMS via Textbelt (free tier available)
async function sendSMSViaTextbelt(phoneNumber, message) {
  const { apiKey } = getTextbeltConfig();
  
  if (!apiKey) {
    throw new Error('Textbelt API key not configured');
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      phone: phoneNumber,
      message: message,
      key: apiKey,
    });

    const options = {
      hostname: 'textbelt.com',
      port: 443,
      path: '/text',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log('Textbelt SMS sent:', result.textId);
            resolve(result);
          } else {
            reject(new Error(result.error || 'Failed to send SMS'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Send SMS via Twilio
async function sendSMSViaTwilio(to, message) {
  const twilioClient = getTwilioClient();
  
  if (!twilioClient) {
    throw new Error('Twilio configuration not found');
  }

  const result = await twilioClient.client.messages.create({
    body: message,
    from: twilioClient.phoneNumber,
    to: to,
  });

  console.log('Twilio SMS sent:', result.sid);
  return result;
}

// Main SMS function - tries Textbelt first, falls back to Twilio
async function sendSMS(to, message) {
  try {
    // Try Textbelt first (free tier available)
    const textbeltConfig = getTextbeltConfig();
    if (textbeltConfig.apiKey) {
      try {
        return await sendSMSViaTextbelt(to, message);
      } catch (error) {
        console.warn('Textbelt SMS failed, trying Twilio:', error.message);
        // Fall through to Twilio
      }
    }

    // Fallback to Twilio
    return await sendSMSViaTwilio(to, message);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

module.exports = { sendSMS };

