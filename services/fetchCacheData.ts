import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { Channel, Course } from "../utils/interfaces";

const fetchAndSaveCourses = async (userUid?: string) => {
  try {
    const userCoursesQuery = firestore()
      .collection("learning")
      .doc(userUid)
      .collection("courses")
      .get();

    if ((await userCoursesQuery).empty) {
      console.log("No courses found for this user in the channels collection.");
      return;
    }
    const courseIds: string[] = [];
    for (const userCourseDoc of (await userCoursesQuery).docs) {
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
          console.log(`Saved learning ourse ${courseId} to AsyncStorage`);
        }
      } catch (error) {
        console.error(
          `Error fetching course ${courseId} from 'courses`,
          error
        );
      }
      console.log("Saved course index to AsyncStorage");
    }
  } catch (error) {
    console.error(
      "Error fetching courses from user's learning collection: ",
      error
    );
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

    const courseIndexString = await AsyncStorage.getItem("learningCourses");
    const courseIndex: string[] = courseIndexString
      ? JSON.parse(courseIndexString)
      : [];

    if (!courseIndex.includes(courseId)) {
      courseIndex.push(courseId);
      await AsyncStorage.setItem(
        "learningCourses",
        JSON.stringify(courseIndex)
      );
      console.log(`Added course ${courseId} to the learning courses index.`);
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

const deleteCourseFromLocalStorage = async (courseId: string) => {
  try {
    await AsyncStorage.removeItem(`course_${courseId}`);
    console.log(`Deleted course ${courseId} from AsyncStorage.`);

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

    console.log(`Deletion complete for course ${courseId}.`);
  } catch (error) {
    console.error(`Error deleting course ${courseId} from local storage:`, error);
    throw error;
  }
};


export {
  fetchAndSaveCourses,
  syncCourse,
  fetchAndSaveUserChannelCourses,
  syncUserCourseList,
  syncUserLearnList,
  deleteCourseFromLocalStorage
};
