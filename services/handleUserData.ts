import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  addDoc,
  increment,
} from "@react-native-firebase/firestore";

const db = getFirestore();

const deleteExistingUnits = async (courseId: string) => {
  try {
    const unitsCollectionRef = collection(db, "courses", courseId, "units");
    const existingUnits = await getDocs(unitsCollectionRef);
    const deletePromises = existingUnits.docs.map((docSnap) =>
      deleteDoc(docSnap.ref)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting existing units: ", error);
    throw error;
  }
};

const handleUserCourseDeletion = async (courseId: string) => {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseDoc = await getDoc(courseRef);
    const courseData = courseDoc.data();

    if (courseDoc.exists() && courseData?.dependency > 0) {
      await updateDoc(courseRef, {
        creator: "TcoD2mfnDzQ6NmPQjbxzbpbUIJG3",
      });
    } else {
      await deleteDoc(courseRef);
    }
  } catch (error) {
    console.error("Error updating course:", error);
  }
};

const addCourseForUser = async (
  uid: string,
  selectedCourseKey: string,
  learningCourses: string[],
  saveCourseToCache: (key: string) => Promise<void>
): Promise<string[]> => {
  try {
    const courseRef = doc(db, "courses", selectedCourseKey);
    await updateDoc(courseRef, {
      dependency: increment(1),
    });

    const learningCourseRef = doc(
      db,
      "learning",
      uid,
      "courses",
      selectedCourseKey
    );
    await setDoc(learningCourseRef, { studyingUnits: [], useUnits: false });

    const updatedCourses = [
      ...new Set([...learningCourses, selectedCourseKey]),
    ];
    await AsyncStorage.setItem(
      "learningCourses",
      JSON.stringify(updatedCourses)
    );
    await saveCourseToCache(selectedCourseKey);

    return updatedCourses;
  } catch (error) {
    console.error("Error in addCourseForUser:", error);
    throw error;
  }
};

const createOrUpdateChannel = async (
  uid: string,
  displayName: string,
  bannerURL: string = "",
  profilePicURL: string
) => {
  try {
    const channelRef = doc(db, "channels", uid);
    await setDoc(channelRef, {
      displayName,
      bannerURL,
      profilePicURL,
    });

    console.log("Channel created/updated:", {
      uid,
      displayName,
      bannerURL,
      profilePicURL,
    });
  } catch (error) {
    console.error("Firestore error while creating/updating channel:", error);
    throw error;
  }
};

const createNewCourse = async (uid: string, course: any): Promise<string> => {
  try {
    course.lastModified = new Date().getTime();
    const courseRef = await addDoc(collection(db, "courses"), course);
    const docId = courseRef.id;

    await updateDoc(courseRef, { key: docId, numQuestions: 0 });

    const channelRef = doc(db, "channels", uid);
    const channelDoc = await getDoc(channelRef);
    const currentCourses = channelDoc.data()?.courses || [];
    await updateDoc(channelRef, { courses: [...currentCourses, docId] });

    const storedUserCourses = await AsyncStorage.getItem("userCourses");
    const userCourses = storedUserCourses ? JSON.parse(storedUserCourses) : [];
    userCourses.push(docId);
    await AsyncStorage.setItem("userCourses", JSON.stringify(userCourses));
    await AsyncStorage.setItem(`course_${docId}`, JSON.stringify(course));

    return docId;
  } catch (error) {
    console.error("Error in createNewCourse:", error);
    throw error;
  }
};

const updateExistingCourse = async (id: string, course: any): Promise<void> => {
  try {
    const courseRef = doc(db, "courses", id);
    await updateDoc(courseRef, course);
    await AsyncStorage.setItem(`course_${id}`, JSON.stringify(course));
  } catch (error) {
    console.error("Error in updateExistingCourse:", error);
    throw error;
  }
};

export {
  deleteExistingUnits,
  handleUserCourseDeletion,
  addCourseForUser,
  createOrUpdateChannel,
  createNewCourse,
  updateExistingCourse,
};
