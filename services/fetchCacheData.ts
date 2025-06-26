import AsyncStorage from "@react-native-async-storage/async-storage";
import { Channel, Course } from "../utils/interfaces";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";

const db = getFirestore();

const fetchAndSaveLearningCourses = async (userUid?: string) => {
  if (!userUid) return;

  const userCoursesRef = collection(db, "learning", userUid, "courses");
  const userCoursesSnapshot = await getDocs(userCoursesRef);

  if (!userCoursesSnapshot.empty) {
    const courseIds: string[] = [];

    for (const userCourseDoc of userCoursesSnapshot.docs) {
      const courseId = userCourseDoc.id;
      courseIds.push(courseId);

      try {
        const courseRef = doc(db, "courses", courseId);
        const courseDoc = await getDoc(courseRef);

        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          await AsyncStorage.setItem(
            `course_${courseId}`,
            JSON.stringify(courseData)
          );
          console.log(`Saved course ${courseId} to AsyncStorage`);
        }
      } catch (error) {
        console.error(
          `Error fetching course ${courseId} from 'courses'`,
          error
        );
      }
    }
    await AsyncStorage.setItem("learningCourses", JSON.stringify(courseIds));
    console.log("Saved course index to AsyncStorage");
  }
};

const syncCourse = async (courseId: string) => {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseDoc = await getDoc(courseRef);

    if (!courseDoc.exists()) {
      console.warn(`Course ${courseId} not found in Firestore.`);
      return;
    }

    const firestoreCourseData = courseDoc.data() as Course;
    const firestoreLastModified = firestoreCourseData.lastModified;
    const localCourseDataString = await AsyncStorage.getItem(
      `course_${courseId}`
    );

    let shouldUpdate = false;

    if (localCourseDataString) {
      const localCourseData = JSON.parse(localCourseDataString) as Course;
      const localLastModified = localCourseData.lastModified;
      if (firestoreLastModified > localLastModified) {
        shouldUpdate = true;
      } else {
        console.log(`Course ${courseId} is up to date`);
      }
    } else {
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      await AsyncStorage.setItem(
        `course_${courseId}`,
        JSON.stringify(firestoreCourseData)
      );
      console.log(`Updated course ${courseId}`);
    }
    console.log(`Sync complete for course ${courseId}.`);
  } catch (error) {
    console.error(`Error syncing course ${courseId}:`, error);
  }
};

const fetchAndSaveUserChannelCourses = async (userUid: string) => {
  try {
    const channelRef = doc(db, "channels", userUid);
    const userChannelDoc = await getDoc(channelRef);

    const userChannelData = userChannelDoc.data();
    const courseIds: string[] = userChannelData?.courses ?? [];

    if (courseIds.length === 0) {
      console.log("No courses found for this user in the channels collection.");
      return;
    }
    const userCourses: string[] = [];

    for (const courseId of courseIds) {
      try {
        const courseRef = doc(db, "courses", courseId);
        const courseDoc = await getDoc(courseRef);

        const courseData = courseDoc.data();
        if (courseData) {
          await AsyncStorage.setItem(
            `course_${courseId}`,
            JSON.stringify(courseData)
          );
          console.log(`Saved user course ${courseId} to AsyncStorage`);
          userCourses.push(courseId);
        }
      } catch (error) {
        console.error(
          `Error fetching course ${courseId} from 'courses' collection: `,
          error
        );
      }
    }
    if (userCourses.length > 0) {
      await AsyncStorage.setItem("userCourses", JSON.stringify(userCourses));
      console.log("Saved user courses index to AsyncStorage");
    }
  } catch (error) {
    console.error(
      "Error fetching user's courses from 'channels' collection: ",
      error
    );
  }
};

const syncUserCourseList = async (uid: string) => {
  try {
    const channelRef = doc(db, "channels", uid);
    const channelSnap = await getDoc(channelRef);

    if (channelSnap.exists()) {
      const channelData = channelSnap.data() as Channel;
      const userCourses = channelData.courses || [];
      await AsyncStorage.setItem("userCourses", JSON.stringify(userCourses));
      console.log("User courses updated successfully");
    } else {
      console.log("No channel found for this UID");
      await AsyncStorage.removeItem("userCourses");
    }
  } catch (error) {
    console.error("Error fetching and storing user courses:", error);
  }
};

const syncUserLearnList = async (uid: string) => {
  try {
    const coursesRef = collection(db, "learning", uid, "courses");
    const coursesSnapshot = await getDocs(coursesRef);
    const learningCourses = coursesSnapshot.docs.map((doc) => doc.id);

    if (learningCourses.length > 0) {
      await AsyncStorage.setItem(
        "learningCourses",
        JSON.stringify(learningCourses)
      );
      console.log("Learning courses stored successfully");
      console.log("Number of courses:", learningCourses.length);
    } else {
      await AsyncStorage.removeItem("learningCourses");
      console.log("No learning courses found. AsyncStorage cleared.");
    }
  } catch (error) {
    console.error("Error fetching and storing learning courses:", error);
    throw error;
  }
};

const deleteUserChannelCourse = async (courseId: string, userUid: string) => {
  try {
    const userCoursesString = await AsyncStorage.getItem("userCourses");
    const userCourses: string[] = userCoursesString
      ? JSON.parse(userCoursesString)
      : [];

    if (userCourses.includes(courseId)) {
      const updatedUserCourses = userCourses.filter((id) => id !== courseId);
      await AsyncStorage.setItem(
        "userCourses",
        JSON.stringify(updatedUserCourses)
      );
      console.log(`Removed course ${courseId} from user courses index.`);
    }

    const userChannelRef = doc(db, "channels", userUid);
    const userChannelDoc = await getDoc(userChannelRef);

    if (userChannelDoc.exists()) {
      const userChannelData = userChannelDoc.data();
      if (userChannelData?.courses && Array.isArray(userChannelData.courses)) {
        const updatedCourses = userChannelData.courses.filter(
          (id: string) => id !== courseId
        );
        await updateDoc(userChannelRef, { courses: updatedCourses });
      }
    }

    await deleteCourseFromStorageIfUnused(courseId);
    console.log(`Deletion complete for course ${courseId}.`);
  } catch (error) {
    console.error(
      `Error deleting course ${courseId} from user courses:`,
      error
    );
    return false;
  }
};

const deleteUserLearningCourse = async (courseId: string, user: string) => {
  try {
    const courseRef = doc(db, "learning", user, "courses", courseId);
    await deleteDoc(courseRef);

    const mainCourseRef = doc(db, "courses", courseId);
    await setDoc(
      mainCourseRef,
      {
        dependency: increment(-1),
      },
      { merge: true }
    );

    const learningCoursesString = await AsyncStorage.getItem("learningCourses");
    const learningCourses: string[] = learningCoursesString
      ? JSON.parse(learningCoursesString)
      : [];

    if (learningCourses.includes(courseId)) {
      const updatedLearningCourses = learningCourses.filter(
        (id) => id !== courseId
      );
      await AsyncStorage.setItem(
        "learningCourses",
        JSON.stringify(updatedLearningCourses)
      );
      console.log(`Removed course ${courseId} from learning courses index.`);
    }

    await deleteCourseFromStorageIfUnused(courseId);
    console.log(`Deletion complete for course ${courseId}.`);
  } catch (error) {
    console.error(
      `Error deleting course ${courseId} from learning courses:`,
      error
    );
  }
};

const deleteCourseFromStorageIfUnused = async (courseId: string) => {
  const learningCoursesString = await AsyncStorage.getItem("learningCourses");
  const learningCourses: string[] = learningCoursesString
    ? JSON.parse(learningCoursesString)
    : [];

  const userCoursesString = await AsyncStorage.getItem("userCourses");
  const userCourses: string[] = userCoursesString
    ? JSON.parse(userCoursesString)
    : [];

  if (!learningCourses.includes(courseId) && !userCourses.includes(courseId)) {
    await AsyncStorage.removeItem(`course_${courseId}`);
    console.log(`Deleted course ${courseId} from AsyncStorage.`);
  }
};

const saveCourseToCache = async (courseId: string) => {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseDoc = await getDoc(courseRef);

    if (courseDoc.exists()) {
      const courseData = courseDoc.data();
      await AsyncStorage.setItem(
        `course_${courseId}`,
        JSON.stringify(courseData)
      );
    }
  } catch (error) {
    console.error(`Error saving course ${courseId} contents locally:`, error);
  }
};

export {
  fetchAndSaveLearningCourses,
  syncCourse,
  fetchAndSaveUserChannelCourses,
  syncUserCourseList,
  syncUserLearnList,
  saveCourseToCache,
  deleteUserChannelCourse,
  deleteUserLearningCourse,
};
