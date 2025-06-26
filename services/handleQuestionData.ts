import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  arrayUnion,
  increment,
} from '@react-native-firebase/firestore';

import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "@/services/handleImages";
import { Question, Hint } from "@/utils/interfaces";

const db = getFirestore();

export const fetchQuestion = async (id: string): Promise<Question | null> => {
  try {
    const questionRef = doc(db, "questions", id);
    const questionDoc = await getDoc(questionRef);
    return questionDoc.exists() ? { id: questionDoc.id, ...questionDoc.data() } as Question : null;
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
};

export const updateQuestion = async (
  id: string,
  questionData: Omit<Question, "id">
): Promise<void> => {
  try {
    const questionRef = doc(db, "questions", id);
    await updateDoc(questionRef, questionData);
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

export const handleHintImages = async (
  hints: Hint[],
  oldHints: Hint[] = []
): Promise<Hint[]> => {
  return await Promise.all(
    hints.map(async (hint, index) => {
      const oldHint = oldHints[index];
      if (hint.image) {
        if (hint.image.startsWith("file://")) {
          const imageRef = await uploadImageToFirebase(hint.image, "questions");
          return { ...hint, image: imageRef };
        } else if (oldHint && oldHint.image && oldHint.image !== hint.image) {
          await deleteImageFromFirebase(oldHint.image);
          const imageRef = await uploadImageToFirebase(hint.image, "questions");
          return { ...hint, image: imageRef };
        }
      } else if (oldHint?.image) {
        await deleteImageFromFirebase(oldHint.image);
      }
      return hint;
    })
  );
};

export const deleteQuestionsForUnit = async (
  courseId: string,
  unitId: string
): Promise<void> => {
  try {
    const unitRef = doc(db, "courses", courseId, "units", unitId);
    const unitDoc = await getDoc(unitRef);

    if (unitDoc.exists()) {
      const data = unitDoc.data();
      await Promise.all(
        data?.questions.map((questionId: string) =>
          deleteDoc(doc(db, "questions", questionId))
        )
      );
      console.log("Deleted questions successfully for unit");
    }
  } catch (error) {
    console.error("Error deleting questions:", error);
  }
};

export const deleteQuestionsForCourse = async (
  courseId: string
): Promise<void> => {
  try {
    const unitsRef = collection(db, "courses", courseId, "units");
    const unitsSnapshot = await getDocs(unitsRef);

    if (!unitsSnapshot.empty) {
      await Promise.all(
        unitsSnapshot.docs.map(async (unitDoc) => {
          const unitData = unitDoc.data();
          if (unitData?.questions?.length > 0) {
            await Promise.all(
              unitData.questions.map((questionId: string) =>
                deleteDoc(doc(db, "questions", questionId))
              )
            );
          }
        })
      );
      console.log("Deleted questions successfully for all units in the course");
    }
  } catch (error) {
    console.error("Error deleting questions for course:", error);
  }
};

export const addQuestionToUnit = async (
  courseId: string,
  unitId: string,
  questionData: any
): Promise<string> => {
  const unitRef = doc(db, "courses", courseId, "units", unitId);
  const courseRef = doc(db, "courses", courseId);

  const unitDoc = await getDoc(unitRef);
  if (!unitDoc.exists()) throw new Error("Unit does not exist");

  const questionRef = await addDoc(collection(db, "questions"), questionData);

  await updateDoc(unitRef, {
    questions: arrayUnion(questionRef.id),
  });

  await updateDoc(courseRef, {
    numQuestions: increment(1),
  });

  return questionRef.id;
};

export const deleteQuestionFromUnit = async (
  courseId: string,
  unitId: string,
  questionId: string
): Promise<void> => {
  try {
    const unitRef = doc(db, "courses", courseId, "units", unitId);
    const questionRef = doc(db, "questions", questionId);
    const courseRef = doc(db, "courses", courseId);

    const unitDoc = await getDoc(unitRef);
    if (!unitDoc.exists()) throw new Error("Unit not found");

    const unitData = unitDoc.data();
    const updatedQuestions = (unitData?.questions || []).filter(
      (id: string) => id !== questionId
    );

    await updateDoc(unitRef, { questions: updatedQuestions });
    await deleteDoc(questionRef);

    const courseDoc = await getDoc(courseRef);
    if (courseDoc.exists() && courseDoc.data()?.numQuestions) {
      await updateDoc(courseRef, {
        numQuestions: increment(-1),
      });
    }
  } catch (error) {
    console.error("Error in deleteQuestionFromUnit:", error);
    throw error;
  }
};