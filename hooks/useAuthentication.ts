import React from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export function useAuthentication() {
  const [user, setUser] = React.useState<FirebaseAuthTypes.User>();

  React.useEffect(() => {
    const unsubscribeFromAuthStatusChanged = auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(undefined);
      }
    });

    return unsubscribeFromAuthStatusChanged;
  }, []);

  return {
    user
  };
}