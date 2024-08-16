import firestore from "@react-native-firebase/firestore";
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "@/services/handleImages";
import { Question, Hint } from "@/utils/interfaces";

export const fetchQuestion = async (id: string): Promise<Question | null> => {
  try {
    const questionDoc = await firestore().collection("questions").doc(id).get();
    if (questionDoc.exists) {
      return { id: questionDoc.id, ...questionDoc.data() } as Question;
    }
    return null;
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
    await firestore().collection("questions").doc(id).update(questionData);
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
          // New local image, upload it
          const imageRef = await uploadImageToFirebase(hint.image, "questions");
          return { ...hint, image: imageRef };
        } else if (oldHint && oldHint.image && oldHint.image !== hint.image) {
          // Image changed, delete old one and upload new one
          await deleteImageFromFirebase(oldHint.image);
          const imageRef = await uploadImageToFirebase(hint.image, "questions");
          return { ...hint, image: imageRef };
        }
      } else if (oldHint && oldHint.image) {
        // Image removed, delete old one
        await deleteImageFromFirebase(oldHint.image);
      }
      return hint;
    })
  );
};
