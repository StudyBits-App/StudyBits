import React from 'react';
import { useStorageState } from '@/hooks/useStorageState';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

const AuthContext = React.createContext<{
  user?: FirebaseAuthTypes.User | null;
  isLoading: boolean;
}>({
  user: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, user], setUser] = useStorageState('null');

  auth().onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
    if (user) setUser(JSON.stringify(user));
    else setUser(null);
  });

  const parsed: FirebaseAuthTypes.User = JSON.parse(user || 'null');

  return (
    <AuthContext.Provider
      value={{
        user: parsed,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
