/**
 * Date formatting utilities
 */

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
