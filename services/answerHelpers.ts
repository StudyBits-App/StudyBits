import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  increment,
} from "@react-native-firebase/firestore";
import { QuestionInfo } from "@/utils/interfaces";

const db = getFirestore();

export const getQuestionInfoById = async (
  questionId: string
): Promise<QuestionInfo | null> => {
  try {
    const questionRef = doc(db, "questions", questionId);
    const questionDoc = await getDoc(questionRef);

    if (questionDoc.exists()) {
      return questionDoc.data() as QuestionInfo;
    } else {
      console.error("Question not found with the given ID");
      return null;
    }
  } catch (error) {
    console.error("Error fetching question info:", error);
    throw error;
  }
};

export const incrementUserAccuracy = async (uid: string) => {
  try {
    const userRef = doc(db, "learning", uid);
    await setDoc(
      userRef,
      {
        accuracy: increment(1),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error incrementing user accuracy:", error);
    throw error;
  }
};
