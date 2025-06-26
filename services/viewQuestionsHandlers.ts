import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
} from "@react-native-firebase/firestore";
import {
  Course,
  Unit,
  Question,
  defaultCourse,
  defaultUnit,
} from "@/utils/interfaces";

const db = getFirestore();

export const fetchCoursesForChannel = async (
  channelId: string
): Promise<Course[]> => {
  try {
    const channelRef = doc(db, "channels", channelId);
    const channelDoc = await getDoc(channelRef);

    if (!channelDoc.exists()) return [];

    const courseIds = channelDoc.data()?.courses || [];
    const courseSnapshots = await Promise.all(
      courseIds.map((id: string) => getDoc(doc(db, "courses", id)))
    );

    return courseSnapshots.map((docSnap) => ({
      ...defaultCourse,
      key: docSnap.id,
      name: docSnap.data()?.name || "",
      creator: docSnap.data()?.creator || "",
      picUrl: docSnap.data()?.picUrl || "",
      description: docSnap.data()?.description || "",
    }));
  } catch (error) {
    console.error("Error in fetchCoursesForChannel:", error);
    throw error;
  }
};

export const fetchUnitsForCourse = async (
  courseId: string
): Promise<Unit[]> => {
  try {
    const unitsCol = collection(db, "courses", courseId, "units");
    const snapshot = await getDocs(unitsCol);

    return snapshot.docs
      .map((docSnap) => ({
        ...defaultUnit,
        key: docSnap.id,
        name: docSnap.data().name || "",
        description: docSnap.data().description || "",
        order: docSnap.data().order || 0,
      }))
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error in fetchUnitsForCourse:", error);
    throw error;
  }
};

export const fetchQuestionsForUnit = async (
  courseId: string,
  unitId: string
): Promise<Question[]> => {
  try {
    const unitRef = doc(db, "courses", courseId, "units", unitId);
    const unitDoc = await getDoc(unitRef);

    const questionIds = unitDoc.data()?.questions || [];

    const questionDocs = await Promise.all(
      questionIds.map((qid: string) => getDoc(doc(db, "questions", qid)))
    );

    return questionDocs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        question: data?.question || "",
        course: courseId,
        unit: unitId,
        hints: data?.hints || [],
        answers: data?.answers || [],
      } as Question;
    });
  } catch (error) {
    console.error("Error in fetchQuestionsForUnit:", error);
    throw error;
  }
};