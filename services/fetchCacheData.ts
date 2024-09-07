import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Course } from "../utils/interfaces";

const fetchAndSaveCourses = async (
  userUid: string,
  courseIdsToUpdate?: string[]
) => {
  try {
    let userCoursesQuery: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>;

    if (courseIdsToUpdate && courseIdsToUpdate.length > 0) {
      userCoursesQuery = firestore()
        .collection("learning")
        .doc(userUid)
        .collection("courses")
        .where(firestore.FieldPath.documentId(), "in", courseIdsToUpdate);
    } else {
      userCoursesQuery = firestore()
        .collection("learning")
        .doc(userUid)
        .collection("courses");
    }

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
          console.error(
            `Error fetching course ${courseId} from 'courses' collection: `,
            error
          );
        }
      }

      if (!courseIdsToUpdate) {
        await AsyncStorage.setItem(
          "learningCourses",
          JSON.stringify(courseIds)
        );
        console.log("Saved course index to AsyncStorage");
      }
    }
  } catch (error) {
    console.error(
      "Error fetching courses from user's learning collection: ",
      error
    );
  }
};

const syncCourses = async (userUid: string) => {
  try {
    const courseIndexString = await AsyncStorage.getItem("learningCourses");
    const courseIndex: string[] = courseIndexString
      ? JSON.parse(courseIndexString)
      : [];

    const userCoursesSnapshot = await firestore()
      .collection("learning")
      .doc(userUid)
      .collection("courses")
      .get();

    const updatedCourseIds: string[] = [];
    const coursesToUpdate: string[] = [];

    for (const userCourseDoc of userCoursesSnapshot.docs) {
      const courseId = userCourseDoc.id;
      updatedCourseIds.push(courseId);

      try {
        const courseDoc = await firestore()
          .collection("courses")
          .doc(courseId)
          .get();

        if (courseDoc.exists) {
          const firestoreCourseData = courseDoc.data() as Course;
          const firestoreLastModified = firestoreCourseData.lastModified;
          const localCourseDataString = await AsyncStorage.getItem(
            `course_${courseId}`
          );

          if (localCourseDataString) {
            const localCourseData = JSON.parse(localCourseDataString) as Course;
            const localLastModified = localCourseData.lastModified;

            if (firestoreLastModified > localLastModified) {
              coursesToUpdate.push(courseId);
            }
          } else {
            coursesToUpdate.push(courseId);
          }
        }
      } catch (error) {
        console.error(`Error comparing course ${courseId}:`, error);
      }
    }
    if (coursesToUpdate.length > 0) {
      await fetchAndSaveCourses(userUid, coursesToUpdate);
    }

    if (JSON.stringify(courseIndex) !== JSON.stringify(updatedCourseIds)) {
      await AsyncStorage.setItem(
        "learningCourses",
        JSON.stringify(updatedCourseIds)
      );
      console.log("Updated course index in AsyncStorage");
    }

    console.log(`Sync complete. Updated ${coursesToUpdate.length} courses.`);
  } catch (error) {
    console.error("Error syncing courses:", error);
  }
};

export { fetchAndSaveCourses, syncCourses };
