import axios from "axios";
import {
  getFirestore,
  collection,
  getDocs,
} from '@react-native-firebase/firestore';

const db = getFirestore();

class CourseUnitSelector {
  uid: string;
  usedCombinations: Set<string>;
  remainingCombinations: { courseId: string; unitId: string }[];
  courses: { id: string; studyingUnits: string[] }[];
  isInitialized: boolean;

  constructor(uid: string) {
    this.uid = uid;
    this.usedCombinations = new Set();
    this.remainingCombinations = [];
    this.courses = [];
    this.isInitialized = false;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.remainingCombinations = [];
    this.courses = [];

    try {
      const coursesRef = collection(db, "learning", this.uid, "courses");
      const coursesSnapshot = await getDocs(coursesRef);

      if (coursesSnapshot.empty) {
        console.warn("[CourseUnitSelector] No courses found.");
        this.isInitialized = false;
        return;
      }

      this.courses = coursesSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (!data || !Array.isArray(data.studyingUnits)) {
            console.error(
              `[CourseUnitSelector] Invalid course data for: ${doc.id}`
            );
            return null;
          }
          const units = data.useUnits ? (data.studyingUnits as string[]) : [""];
          return { id: doc.id, studyingUnits: units };
        })
        .filter(
          (course): course is { id: string; studyingUnits: string[] } =>
            course !== null
        );

      this.courses.forEach((course) => {
        course.studyingUnits.forEach((unitId) => {
          this.remainingCombinations.push({ courseId: course.id, unitId });
        });
      });

      if (this.remainingCombinations.length === 0) {
        console.warn(
          "[CourseUnitSelector] No valid combinations found during initialization."
        );
        this.isInitialized = false;
        return;
      }

      this.shuffleArray(this.remainingCombinations);
      this.isInitialized = true;
    } catch (error) {
      console.error("[CourseUnitSelector] Error during initialization:", error);
      this.isInitialized = false;
    }
  }

  shuffleArray(array: { courseId: string; unitId: string }[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async getNextCombination() {
    if (!this.isInitialized) {
      return null;
    }

    const nextCombination = this.remainingCombinations.pop();
    if (!nextCombination) {
      return null;
    }

    console.log(
      `[CourseUnitSelector] Selected combination: { courseId: ${nextCombination.courseId}, unitId: ${nextCombination.unitId} }`
    );
    this.usedCombinations.add(
      `${nextCombination.courseId}:${nextCombination.unitId}`
    );

    return nextCombination;
  }

  async fetchApiResponse() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let nextCombination = await this.getNextCombination();

    while (nextCombination) {
      try {
        const response = await axios.post(
          "https://study-bits-api.vercel.app/find_similar_courses",
          {
            course_id: nextCombination.courseId,
            unit_id: nextCombination.unitId,
          }
        );

        if (
          response.data &&
          response.data.similar_courses &&
          response.data.similar_courses.length > 0
        ) {
          console.log(
            "[CourseUnitSelector] API Response:",
            JSON.stringify(response.data)
          );
          return [response.data, nextCombination.courseId, nextCombination.unitId];
        } else {
          console.warn(
            `[CourseUnitSelector] No results for combination: { courseId: ${nextCombination.courseId}, unitId: ${nextCombination.unitId} }`
          );
        }
      } catch (error) {
        console.error(
          `[CourseUnitSelector] API Error for combination: { courseId: ${nextCombination.courseId}, unitId: ${nextCombination.unitId} }`,
          error
        );
      }

      nextCombination = await this.getNextCombination();
    }

    console.error(
      "[CourseUnitSelector] No valid results found for any combination."
    );
    return {
      error: true,
      message: "No valid results found for any course unit combination.",
    };
  }
}

export default CourseUnitSelector;
