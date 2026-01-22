/**
 * Notification Settings Service
 * Manages global email and SMS notification settings
 */

import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NOTIFICATION_SETTINGS_DOC_ID = 'global';

/**
 * Get notification settings
 * @returns {Promise<{emailEnabled: boolean, smsEnabled: boolean}>}
 */
export const getNotificationSettings = async () => {
  const settingsRef = doc(db, 'notificationSettings', NOTIFICATION_SETTINGS_DOC_ID);
  const settingsSnap = await getDoc(settingsRef);
  
  if (settingsSnap.exists()) {
    const data = settingsSnap.data();
    return {
      emailEnabled: data.emailEnabled !== false, // Default to true if not set
      smsEnabled: data.smsEnabled !== false, // Default to true if not set
      updatedAt: data.updatedAt,
      updatedBy: data.updatedBy,
    };
  }
  
  // Default settings if document doesn't exist
  return {
    emailEnabled: true,
    smsEnabled: true,
    updatedAt: null,
    updatedBy: null,
  };
};

/**
 * Update notification settings
 * @param {Object} settings - {emailEnabled: boolean, smsEnabled: boolean}
 * @param {string} userId - User ID making the update
 * @returns {Promise<void>}
 */
export const updateNotificationSettings = async (settings, userId) => {
  const settingsRef = doc(db, 'notificationSettings', NOTIFICATION_SETTINGS_DOC_ID);
  
  // Ensure boolean values are explicitly true or false
  const emailEnabled = Boolean(settings.emailEnabled !== false);
  const smsEnabled = Boolean(settings.smsEnabled !== false);
  
  await setDoc(
    settingsRef,
    {
      emailEnabled: emailEnabled,
      smsEnabled: smsEnabled,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    },
    { merge: true }
  );
};

/**
 * Subscribe to notification settings changes
 * @param {Function} callback - Callback function that receives settings
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotificationSettings = (callback) => {
  const settingsRef = doc(db, 'notificationSettings', NOTIFICATION_SETTINGS_DOC_ID);
  
  return onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          emailEnabled: data.emailEnabled !== false,
          smsEnabled: data.smsEnabled !== false,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        });
      } else {
        // Default settings if document doesn't exist
        callback({
          emailEnabled: true,
          smsEnabled: true,
          updatedAt: null,
          updatedBy: null,
        });
      }
    },
    (error) => {
      console.error('Error subscribing to notification settings:', error);
      // Return default settings on error
      callback({
        emailEnabled: true,
        smsEnabled: true,
        updatedAt: null,
        updatedBy: null,
      });
    }
  );
};
