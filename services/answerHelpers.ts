import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  increment,
  updateDoc,
  arrayUnion,
  arrayRemove,
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

export const checkIfLikeOrDislike = async (
  course: string,
  questionId: string,
  uid: string
): Promise<boolean | null> => {
  try {
    const courseDoc = doc(db, "learning", uid, "courses", course);
    const courseSnapshot = await getDoc(courseDoc);
    const likedQuestions = courseSnapshot.data()?.likedQuestions || [];
    const dislikedQuestions = courseSnapshot.data()?.dislikedQuestions || [];
    if (likedQuestions.includes(questionId)) {
      return true;
    }
    if (dislikedQuestions.includes(questionId)) {
      return false;
    }
    return null;
  } catch (error) {
    console.error("Error checking like or dislike:", error);
    throw error;
  }
};

export const getLikes = async (questionId: string): Promise<number> => {
  try {
    const questionRef = doc(db, "questions", questionId);
    const questionSnapshot = await getDoc(questionRef);
    if (questionSnapshot.exists()) {
      return questionSnapshot.data()?.likes || 0;
    } else {
      console.error("Question not found");
      return 0;
    }
  } catch (error) {
    console.error("Error fetching likes:", error);
    throw error;
  }
};

export const incrementLikes = async (
  course: string,
  uid: string,
  questionId: string
): Promise<void> => {
  try {
    const questionRef = doc(db, "questions", questionId);
    await setDoc(
      questionRef,
      {
        likes: increment(1),
      },
      { merge: true }
    );

    const courseRef = doc(db, "courses", course);
    await setDoc(
      courseRef,
      {
        likes: increment(1),
      },
      { merge: true }
    );

    const userCourseRef = doc(db, "learning", uid, "courses", course);
    await updateDoc(userCourseRef, {
      likedQuestions: arrayUnion(questionId),
    });
  } catch (error) {
    console.error("Error incrementing likes:", error);
    throw error;
  }
};

export const getDislikes = async (questionId: string): Promise<number> => {
  try {
    const questionDoc = doc(db, "questions", questionId);
    const questionSnapshot = await getDoc(questionDoc);
    return questionSnapshot.exists()
      ? questionSnapshot.data()?.dislikes || 0
      : 0;
  } catch (error) {
    console.error("Error fetching dislikes:", error);
    throw error;
  }
};

export const incrementDislikes = async (
  course: string,
  uid: string,
  questionId: string
): Promise<void> => {
  try {
    const questionDoc = doc(db, "questions", questionId);
    const courseDoc = doc(db, "courses", course);
    const userCourseDoc = doc(db, "learning", uid, "courses", course);

    await Promise.all([
      updateDoc(questionDoc, { dislikes: increment(1) }),
      setDoc(courseDoc, { dislikes: increment(1) }, { merge: true }),
      updateDoc(userCourseDoc, {
        dislikedQuestions: arrayUnion(questionId),
      }),
    ]);
  } catch (error) {
    console.error("Error incrementing dislikes:", error);
    throw error;
  }
};

export const removeLikeOrDislike = async (
  course: string,
  uid: string,
  questionId: string,
  isLike: boolean
): Promise<void> => {
  try {
    const questionDoc = doc(db, "questions", questionId);
    const courseDoc = doc(db, "courses", course);
    const userCourseDoc = doc(db, "learning", uid, "courses", course);

    if (isLike) {
      await Promise.all([
        updateDoc(questionDoc, { likes: increment(-1) }),
        updateDoc(courseDoc, { likes: increment(-1) }),
        updateDoc(userCourseDoc, {
          likedQuestions: arrayRemove(questionId),
        }),
      ]);
    } else {
      await Promise.all([
        updateDoc(questionDoc, { dislikes: increment(-1) }),
        updateDoc(courseDoc, { dislikes: increment(-1) }),
        updateDoc(userCourseDoc, {
          dislikedQuestions: arrayRemove(questionId),
        }),
      ]);
    }
  } catch (error) {
    console.error("Error removing like or dislike:", error);
    throw error;
  }
};

export const checkIfSubscribed = async (
  course: string,
  uid: string
): Promise<boolean> => {
  try {
    const userDoc = doc(db, "learning", uid, "courses", course);
    const userSnapshot = await getDoc(userDoc);
    if (!userSnapshot.exists()) return false;

    const subscribedCourses = userSnapshot.data()?.subscribedCourses || [];
    return subscribedCourses.includes(course);
  } catch (error) {
    console.error("Error checking subscription status:", error);
    throw error;
  }
};

export const subscribeToCourse = async (
  course: string,
  uid: string
): Promise<void> => {
  try {
    const userDoc = doc(db, "learning", uid, "courses", course);
    await updateDoc(userDoc, {
      subscribedCourses: arrayUnion(course),
    });
  } catch (error) {
    console.error("Error subscribing to course:", error);
    throw error;
  }
};

export const unsubscribeFromCourse = async (
  course: string,
  uid: string
): Promise<void> => {
  try {
    const userDoc = doc(db, "learning", uid, "courses", course);
    await updateDoc(userDoc, {
      subscribedCourses: arrayRemove(course),
    });
  } catch (error) {
    console.error("Error unsubscribing from course:", error);
    throw error;
  }
};

export const getViews = async (questionId: string): Promise<number> => {
  try {
    const questionDoc = doc(db, "questions", questionId);
    const questionSnapshot = await getDoc(questionDoc);
    if (questionSnapshot.exists()) {
      return questionSnapshot.data()?.views || 0;
    } else {
      console.error("Question not found");
      return 0;
    }
  } catch (error) {
    console.error("Error fetching question views:", error);
    throw error;
  }
};

export const incrementViews = async (
  chosenCourse: string,
  questionId: string
): Promise<void> => {
  try {
    const questionDoc = doc(db, "questions", questionId);
    const courseDoc = doc(db, "courses", chosenCourse);

    await Promise.all([
      updateDoc(questionDoc, { views: increment(1) }),
      setDoc(courseDoc, { views: increment(1) }, { merge: true }),
    ]);
  } catch (error) {
    console.error("Error incrementing views:", error);
    throw error;
  }
};

