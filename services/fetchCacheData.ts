import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { Channel, Course } from "../utils/interfaces";

const fetchAndSaveLearningCourses = async (userUid?: string) => {
  let userCoursesQuery = firestore()
    .collection("learning")
    .doc(userUid)
    .collection("courses");

  const userCoursesSnapshot = await userCoursesQuery.get();

  if (!userCoursesSnapshot.empty) {
    const courseIds: string[] = [];

    for (const userCourseDoc of userCoursesSnapshot.docs) {
      const courseId = userCourseDoc.id;
      courseIds.push(courseId);

      try {
        const courseDoc = await firestore()
          .collection("courses")
          .doc(courseId)
          .get();

        if (courseDoc.exists) {
          const courseData = courseDoc.data();
          await AsyncStorage.setItem(
            `course_${courseId}`,
            JSON.stringify(courseData)
          );
          console.log(`Saved course ${courseId} to AsyncStorage`);
        }
      } catch (error) {
        console.error(`Error fetching course ${courseId} from 'courses`, error);
      }
    }
    await AsyncStorage.setItem("learningCourses", JSON.stringify(courseIds));
    console.log("Saved course index to AsyncStorage");
  }
};

const syncCourse = async (courseId: string) => {
  try {
    const courseDoc = await firestore()
      .collection("courses")
      .doc(courseId)
      .get();

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
    const userChannelDoc = await firestore()
      .collection("channels")
      .doc(userUid)
      .get();

    const userChannelData = userChannelDoc.data();
    const courseIds: string[] = userChannelData?.courses;

    if (courseIds.length === 0) {
      console.log("No courses found for this user in the channels collection.");
      return;
    }
    const userCourses: string[] = [];

    for (const courseId of courseIds) {
      try {
        const courseDoc = await firestore()
          .collection("courses")
          .doc(courseId)
          .get();

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
    const channelRef = firestore().collection("channels").doc(uid);
    const channelSnap = await channelRef.get();

    if (channelSnap.exists) {
      const channelData = channelSnap.data() as Channel;
      const userCourses = channelData.courses || [];
      await AsyncStorage.setItem("userCourses", JSON.stringify(userCourses));
      console.log("User courses updates successfully");
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
    const coursesRef = firestore()
      .collection("learning")
      .doc(uid)
      .collection("courses");
    const coursesSnapshot = await coursesRef.get();
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
    const userCourses: string[] = userCoursesString ? JSON.parse(userCoursesString) : [];

    if (userCourses.includes(courseId)) {
      const updatedUserCourses = userCourses.filter((id) => id !== courseId);
      await AsyncStorage.setItem("userCourses", JSON.stringify(updatedUserCourses));
      console.log(`Removed course ${courseId} from user courses index.`);
    }

    const userChannelRef = firestore().collection('channels').doc(userUid);
    const userChannelDoc = await userChannelRef.get();
    if (userChannelDoc.exists) {
      const userChannelData = userChannelDoc.data();
      if (userChannelData?.courses && Array.isArray(userChannelData.courses)) {
        const updatedCourses = userChannelData.courses.filter((id: string) => id !== courseId);
        await userChannelRef.update({ courses: updatedCourses });
      }
    }

    await deleteCourseFromStorageIfUnused(courseId);
    console.log(`Deletion complete for course ${courseId}.`);
  } catch (error) {
    console.error(`Error deleting course ${courseId} from user courses:`, error);
    return false;
  }
};

const deleteUserLearningCourse = async (courseId: string, user: string) => {
  try {
  
    await firestore()
    .collection("learning")
    .doc(user)
    .collection("courses")
    .doc(courseId)
    .delete();
    
    await firestore()
    .collection('courses')
    .doc(courseId)
    .set({
      dependency: firestore.FieldValue.increment(-1)
    }, { merge: true });

    const learningCoursesString = await AsyncStorage.getItem("learningCourses");
    const learningCourses: string[] = learningCoursesString ? JSON.parse(learningCoursesString) : [];

    if (learningCourses.includes(courseId)) {
      const updatedLearningCourses = learningCourses.filter((id) => id !== courseId);
      await AsyncStorage.setItem("learningCourses", JSON.stringify(updatedLearningCourses));
      console.log(`Removed course ${courseId} from learning courses index.`);
    }

    await deleteCourseFromStorageIfUnused(courseId);
    console.log(`Deletion complete for course ${courseId}.`);
  } catch (error) {
    console.error(`Error deleting course ${courseId} from learning courses:`, error);
  }
};

const deleteCourseFromStorageIfUnused = async (courseId: string) => {
  const learningCoursesString = await AsyncStorage.getItem("learningCourses");
  const learningCourses: string[] = learningCoursesString ? JSON.parse(learningCoursesString) : [];

  const userCoursesString = await AsyncStorage.getItem("userCourses");
  const userCourses: string[] = userCoursesString ? JSON.parse(userCoursesString) : [];

  if (!learningCourses.includes(courseId) && !userCourses.includes(courseId)) {
    await AsyncStorage.removeItem(`course_${courseId}`);
    console.log(`Deleted course ${courseId} from AsyncStorage.`);
  }
};

const saveCourseToCache = async (courseId: string) => {
  try {
    const courseDoc = await firestore()
      .collection("courses")
      .doc(courseId)
      .get();

    if (courseDoc.exists) {
      const courseData = courseDoc.data()

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
  deleteUserLearningCourse
};
