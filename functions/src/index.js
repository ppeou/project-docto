const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const { sendEmail } = require('./email');
const { sendSMS } = require('./notifications');

// Helper function to check notification settings
async function getNotificationSettings() {
  const settingsRef = admin.firestore().doc('notificationSettings/global');
  const settingsSnap = await settingsRef.get();
  
  if (settingsSnap.exists) {
    const data = settingsSnap.data();
    return {
      emailEnabled: data.emailEnabled !== false, // Default to true if not set
      smsEnabled: data.smsEnabled !== false, // Default to true if not set
    };
  }
  
  // Default settings if document doesn't exist
  return {
    emailEnabled: true,
    smsEnabled: true,
  };
}

// Auth trigger - send welcome email when user signs up
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    const settings = await getNotificationSettings();
    if (!settings.emailEnabled) {
      console.log('Email notifications are disabled, skipping welcome email');
      return null;
    }

    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Project Docto!',
        html: `
          <h2>Welcome ${user.email}!</h2>
          <p>Thank you for signing up for Project Docto.</p>
          <p>We're excited to have you on board!</p>
          <p>Start by creating your first healthcare itinerary.</p>
        `,
      });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
  return null;
});

// Firestore trigger - send email when appointment is created
exports.onAppointmentCreated = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap, context) => {
    try {
      const settings = await getNotificationSettings();
      if (!settings.emailEnabled) {
        console.log('Email notifications are disabled, skipping appointment notification');
        return null;
      }

      const appointment = snap.data();
      const itineraryRef = admin.firestore().doc(`itineraries/${appointment.itineraryId}`);
      const itinerary = await itineraryRef.get();

      if (!itinerary.exists) return null;

      const userRef = admin.firestore().doc(`users/${itinerary.data().created.by}`);
      const user = await userRef.get();

      if (user.exists && user.data().email) {
        await sendEmail({
          to: user.data().email,
          subject: `New Appointment: ${appointment.title}`,
          html: `
            <h2>New Appointment Created</h2>
            <p><strong>Title:</strong> ${appointment.title}</p>
            <p><strong>Doctor:</strong> ${appointment.doctor?.name || 'Not specified'}</p>
            <p><strong>Date:</strong> ${appointment.appointmentDate?.toDate().toLocaleString() || 'Not specified'}</p>
            <p><strong>Patient:</strong> ${itinerary.data().patient?.name || 'Not specified'}</p>
          `,
        });
      }
    } catch (error) {
      console.error('Error sending appointment notification:', error);
    }
    return null;
  });

// HTTP callable function - initialize frequency options (one-time setup)
exports.initializeFrequencyOptions = functions.https.onCall(async (data, context) => {
  // Optional: Add authentication check if you want to restrict who can call this
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  // }

  const FREQUENCY_OPTIONS = [
    { label: "Every 4 hours", intervalValue: 4, intervalUnit: "hour", displayOrder: 1 },
    { label: "Every 6 hours", intervalValue: 6, intervalUnit: "hour", displayOrder: 2 },
    { label: "Every 8 hours", intervalValue: 8, intervalUnit: "hour", displayOrder: 3 },
    { label: "Every 12 hours", intervalValue: 12, intervalUnit: "hour", displayOrder: 4 },
    { label: "4 times per day", intervalValue: 6, intervalUnit: "hour", displayOrder: 5 },
    { label: "3 times per day", intervalValue: 8, intervalUnit: "hour", displayOrder: 6 },
    { label: "2 times per day", intervalValue: 12, intervalUnit: "hour", displayOrder: 7 },
    { label: "Once daily", intervalValue: 1, intervalUnit: "day", displayOrder: 8 },
    { label: "Once per day", intervalValue: 1, intervalUnit: "day", displayOrder: 9 },
    { label: "Once per week", intervalValue: 7, intervalUnit: "day", displayOrder: 10 },
    { label: "Twice per week", intervalValue: 3.5, intervalUnit: "day", displayOrder: 11 },
    { label: "Every 2 weeks", intervalValue: 14, intervalUnit: "day", displayOrder: 12 },
    { label: "Once per month", intervalValue: 1, intervalUnit: "month", displayOrder: 13 },
    { label: "Every 2 months", intervalValue: 2, intervalUnit: "month", displayOrder: 14 },
    { label: "As needed", intervalValue: null, intervalUnit: "as_needed", displayOrder: 15 },
  ];

  const results = { added: 0, skipped: 0, errors: [] };

  for (const option of FREQUENCY_OPTIONS) {
    try {
      const docId = option.label.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      const docRef = admin.firestore().collection('frequencyOptions').doc(docId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        await docRef.set({
          ...option,
          isActive: true,
          created: {
            on: admin.firestore.FieldValue.serverTimestamp(),
          },
          updated: {
            on: admin.firestore.FieldValue.serverTimestamp(),
          },
        });
        results.added++;
      } else {
        results.skipped++;
      }
    } catch (error) {
      results.errors.push({ label: option.label, error: error.message });
    }
  }

  return results;
});

// HTTP callable function - send custom email
exports.sendCustomEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const settings = await getNotificationSettings();
  if (!settings.emailEnabled) {
    throw new functions.https.HttpsError('failed-precondition', 'Email notifications are currently disabled');
  }

  const { to, subject, message } = data;

  if (!to || !subject || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    await sendEmail({ to, subject, html: message });
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// HTTP callable function - send SMS
exports.sendSMSNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const settings = await getNotificationSettings();
  if (!settings.smsEnabled) {
    throw new functions.https.HttpsError('failed-precondition', 'SMS notifications are currently disabled');
  }

  const { phoneNumber, message } = data;

  if (!phoneNumber || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing phone number or message');
  }

  try {
    const result = await sendSMS(phoneNumber, message);
    return { success: true, messageId: result.sid || result.textId };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

