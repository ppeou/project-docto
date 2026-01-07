const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const { sendEmail } = require('./email');
const { sendSMS } = require('./notifications');

// Auth trigger - send welcome email when user signs up
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
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

// HTTP callable function - send custom email
exports.sendCustomEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
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

  const { phoneNumber, message } = data;

  if (!phoneNumber || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing phone number or message');
  }

  try {
    const result = await sendSMS(phoneNumber, message);
    return { success: true, messageId: result.sid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

