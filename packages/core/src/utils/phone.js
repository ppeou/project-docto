/**
 * Phone number utility functions
 */

/**
 * Normalize phone number to E.164 format
 * E.164 format: +[country code][number] (no spaces, dashes, or other formatting)
 * 
 * Examples:
 * "+1 234 234-0000" -> "+12342340000"
 * "+1 (234) 234-0000" -> "+12342340000"
 * "1-234-234-0000" -> "+12342340000" (if no +, assumes US)
 * 
 * @param {string} phoneNumber - Phone number in any format
 * @returns {string} Phone number in E.164 format
 */
export function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';

  // Remove all non-digit characters except the leading +
  let cleaned = phoneNumber.trim();

  // If it doesn't start with +, add it (assuming US/Canada +1)
  if (!cleaned.startsWith('+')) {
    // Remove all non-digits
    cleaned = cleaned.replace(/\D/g, '');
    // If it starts with 1 and has 11 digits, it's already +1
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 10) {
      // 10 digits, assume US/Canada, add +1
      cleaned = '+1' + cleaned;
    } else {
      // Unknown format, try to add +1
      cleaned = '+1' + cleaned;
    }
  } else {
    // Remove all non-digit characters except the leading +
    cleaned = '+' + cleaned.slice(1).replace(/\D/g, '');
  }

  return cleaned;
}

/**
 * Format phone number for display
 * Converts E.164 to readable format
 * 
 * @param {string} phoneNumber - Phone number in E.164 format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';

  // Remove + and get digits
  const digits = phoneNumber.replace(/\D/g, '');
  
  // US/Canada format: +1 (234) 234-0000
  if (digits.startsWith('1') && digits.length === 11) {
    const countryCode = digits.slice(0, 1);
    const areaCode = digits.slice(1, 4);
    const firstPart = digits.slice(4, 7);
    const lastPart = digits.slice(7, 11);
    return `+${countryCode} (${areaCode}) ${firstPart}-${lastPart}`;
  }
  
  // Default: just add + if not present
  if (!phoneNumber.startsWith('+')) {
    return '+' + phoneNumber;
  }
  
  return phoneNumber;
}

/**
 * Validate phone number format
 * Checks if phone number is in valid E.164 format
 * 
 * @param {string} phoneNumber - Phone number to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    return { valid: false, error: 'Phone number is required' };
  }

  const normalized = normalizePhoneNumber(phoneNumber);
  
  // E.164 format: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  
  if (!e164Regex.test(normalized)) {
    return { valid: false, error: 'Invalid phone number format. Please include country code (e.g., +1 for US)' };
  }

  return { valid: true };
}
