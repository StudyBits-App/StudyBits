import { useEffect, useState } from "react";
import { useSession } from "./ctx";
import firestore from "@react-native-firebase/firestore";

export function userLearningCourses() {
  const { user } = useSession();
  const [learningCourses, setLearningCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLearningCourses([]);
      setLoading(false);
      return;
    }

    const learningCourses = firestore()
      .collection("learning")
      .doc(user?.uid)
      .collection("courses")
      .onSnapshot(
        (snapshot) => {
          const coursesArray: string[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data && typeof data.course === "string") {
              coursesArray.push(data.course);
            }
          });
          setLearningCourses(coursesArray);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user courses: ", error);
          setLoading(false);
        }
      );

    return () => learningCourses();
  }, [user]);

  return { learningCourses, loading };
}
