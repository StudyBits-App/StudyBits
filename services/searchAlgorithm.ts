import {
  getFirestore,
  collection,
  getDocs,
} from "@react-native-firebase/firestore";

interface CourseItem {
  key: string;
  name: string;
  description: string;
}

const db = getFirestore();

const searchCourses = async (
  query: string,
  limit: number = 10
): Promise<string[]> => {
  try {
    const coursesRef = collection(db, "courses");
    const snapshot = await getDocs(coursesRef);

    const searchTerm = query.toLowerCase();

    const allCourses: CourseItem[] = snapshot.docs.map(
      (doc) => doc.data() as CourseItem
    );

    const matchedCourses = allCourses
      .map((course) => {
        let score = 0;
        const name = course.name.toLowerCase();
        const description = course.description.toLowerCase();

        if (name.includes(searchTerm)) score += 2;
        if (description.includes(searchTerm)) score += 1;

        return { id: course.key, score };
      })
      .filter((course) => course.score > 0);

    const sortedCourses = matchedCourses
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sortedCourses.map((course) => course.id);
  } catch (error) {
    console.error("Error searching courses:", error);
    return [];
  }
};

export { searchCourses };
