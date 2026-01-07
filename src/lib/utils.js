import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, format = 'PP') {
  if (!date) return '';
  try {
    // Handle Firestore Timestamp
    const d = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function formatDateTime(date) {
  if (!date) return '';
  try {
    // Handle Firestore Timestamp
    const d = date.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date));
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return '';
  }
}

export function formatPhone(phone) {
  if (!phone) return '';
  try {
    const { parsePhoneNumber } = require('libphonenumber-js');
    const phoneNumber = parsePhoneNumber(phone);
    return phoneNumber.formatInternational();
  } catch {
    return phone;
  }
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

