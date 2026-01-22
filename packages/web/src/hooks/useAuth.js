import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@core/services/firebase';

export function useAuth() {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user) {
      // Fetch user profile
      getDoc(doc(db, 'users', user.uid))
        .then((userDoc) => {
          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() });
          } else {
            setUserProfile(null);
          }
        })
        .catch((error) => {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        });
    } else {
      setUserProfile(null);
    }
  }, [user]);

  return { user, userProfile, loading };
}
