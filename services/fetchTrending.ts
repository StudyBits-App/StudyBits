import {
  getFirestore,
  collection,
  getDocs,
  query,
  limit,
} from '@react-native-firebase/firestore';

const db = getFirestore();

export const fetchCourses = async (limitValue: number = 10) => {
  try {
    const q = query(collection(db, "courses"), limit(limitValue));
    const snapshot = await getDocs(q);
    return snapshot.docs;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};