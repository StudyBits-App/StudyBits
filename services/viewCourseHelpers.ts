import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  increment,
} from "@react-native-firebase/firestore";

const db = getFirestore();

export const updateUseUnitsPreference = async (
  uid: string,
  courseId: string,
  useUnits: boolean
): Promise<void> => {
  try {
    const courseRef = doc(db, "learning", uid, "courses", courseId);
    await setDoc(courseRef, { useUnits }, { merge: true });
  } catch (error) {
    console.error("Error in updateUseUnitsPreference:", error);
    throw error;
  }
};

export const fetchCourseInteractionData = async (
  uid: string,
  courseId: string
): Promise<{
  isStudied: boolean;
  useUnits: boolean;
  studyingUnits: string[];
}> => {
  try {
    const storedCourses = await AsyncStorage.getItem("learningCourses");
    const learningCourses = storedCourses ? JSON.parse(storedCourses) : [];
    const isStudied = learningCourses.includes(courseId);

    let useUnits = false;
    let studyingUnits: string[] = [];

    if (isStudied) {
      const courseRef = doc(db, "learning", uid, "courses", courseId);
      const docSnap = await getDoc(courseRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        useUnits = data?.useUnits ?? false;
        studyingUnits = data?.studyingUnits ?? [];
      }
    }

    return {
      isStudied,
      useUnits,
      studyingUnits,
    };
  } catch (error) {
    console.error("Error in fetchCourseInteractionData:", error);
    throw error;
  }
};

export const addCourseToUserLearning = async (
  uid: string,
  courseId: string
): Promise<void> => {
  try {
    const storedCourses = await AsyncStorage.getItem("learningCourses");
    const learningCourses = storedCourses ? JSON.parse(storedCourses) : [];

    if (!learningCourses.includes(courseId)) {
      const updatedCourses = [...learningCourses, courseId];
      await AsyncStorage.setItem(
        "learningCourses",
        JSON.stringify(updatedCourses)
      );
    }

    const learningCourseRef = doc(db, "learning", uid, "courses", courseId);
    await setDoc(learningCourseRef, { studyingUnits: [], useUnits: false });

    const courseRef = doc(db, "courses", courseId);
    await setDoc(courseRef, { dependency: increment(1) }, { merge: true });
  } catch (error) {
    console.error("Error in addCourseToUserLearning:", error);
    throw error;
  }
};

export const toggleStudyingUnit = async (
  uid: string,
  courseId: string,
  currentUnits: string[],
  unitId: string
): Promise<string[]> => {
  try {
    const newUnits = [...currentUnits];
    const index = newUnits.indexOf(unitId);

    if (index > -1) {
      newUnits.splice(index, 1);
    } else {
      newUnits.push(unitId);
    }

    const courseRef = doc(db, "learning", uid, "courses", courseId);
    await setDoc(courseRef, { studyingUnits: newUnits }, { merge: true });

    return newUnits;
  } catch (error) {
    console.error("Error in toggleStudyingUnit:", error);
    throw error;
  }
};

export const getSubscribedCourses = async (
  uid: string,
  courseId: string
): Promise<string[]> => {
  try {
    const courseRef = doc(db, "learning", uid, "courses", courseId);
    const docSnap = await getDoc(courseRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data?.subscribedCourses || [];
    } else {
      console.warn("No subscribed courses found for this user.");
      return [];
    }
  } catch (error) {
    console.error("Error in getSubscribedCourses:", error);
    throw error;
  }
}