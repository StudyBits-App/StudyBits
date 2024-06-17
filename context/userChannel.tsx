import { useEffect, useState } from 'react';
import { useSession } from './ctx';
import firestore from '@react-native-firebase/firestore';

export function useUserChannel() {
  const { user} = useSession();
  const [hasChannel, setHasChannel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasChannel(false);
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('channels')
      .where('user', '==', user.uid)
      .onSnapshot(snapshot => {
        if (!snapshot.empty) {
          setHasChannel(true);
        } else {
          setHasChannel(false);
        }
        setLoading(false);
      }, error => {
        console.error("Error checking user channel: ", error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  return { hasChannel, loading };
}
