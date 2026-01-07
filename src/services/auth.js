import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const signUp = async (email, password, displayName = '') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile with displayName
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      displayName: displayName || null,
      created: {
        on: serverTimestamp(),
      },
      updated: {
        on: serverTimestamp(),
      },
    });

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Prepare Firebase Auth profile update (only for displayName and photoURL)
    const authProfileUpdate = {};
    if (updates.displayName !== undefined) {
      authProfileUpdate.displayName = updates.displayName || null;
    }
    if (updates.photo !== undefined) {
      // Map 'photo' from Firestore to 'photoURL' in Firebase Auth
      authProfileUpdate.photoURL = updates.photo || null;
    }

    // Update Firebase Auth profile if there are auth-specific fields
    if (Object.keys(authProfileUpdate).length > 0) {
      await updateProfile(user, authProfileUpdate);
    }

    // Prepare Firestore update data
    const firestoreUpdate = { ...updates };
    
    // Map photoURL back to photo for Firestore consistency
    if (updates.photoURL !== undefined) {
      firestoreUpdate.photo = updates.photoURL;
      delete firestoreUpdate.photoURL;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const updateData = {
      ...firestoreUpdate,
      updated: {
        on: serverTimestamp(),
      },
    };

    await updateDoc(userDocRef, updateData);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const changeEmail = async (newEmail, currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { error: 'Not authenticated' };
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update email
    await updateEmail(user, newEmail);

    // Update email in Firestore
    await updateUserProfile({ email: newEmail });

    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const changePassword = async (newPassword, currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { error: 'Not authenticated' };
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

