import { useEffect, useState } from 'react';
import { useSession } from './ctx';
import firestore from '@react-native-firebase/firestore';

export function useUserCourses() {
  const { user } = useSession();
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const getCourses = firestore()
      .collection('channels')
      .doc(user?.uid)
      .onSnapshot(snapshot => {
        if (snapshot.exists) {
          const data = snapshot.data();
          if (data && Array.isArray(data.courses)) {
            const coursesArray = data.courses.filter((course): course is string => typeof course === 'string');
            setCourses(coursesArray);
          } else {
            setCourses([]);
          }
        } else {
          setCourses([]);
        }
        setLoading(false);
      }, error => {
        console.error("Error fetching user courses: ", error);
        setLoading(false);
      });

    return () => getCourses();
  }, [user]);

  return { courses, loading };
}