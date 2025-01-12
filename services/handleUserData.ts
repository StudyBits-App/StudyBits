import firestore from "@react-native-firebase/firestore";

const deleteExistingUnits = async (courseId: string) => {
  try {
    const unitsCollectionRef = firestore()
      .collection("courses")
      .doc(courseId)
      .collection("units");
    const existingUnits = await unitsCollectionRef.get();
    const deletePromises = existingUnits.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting existing units: ", error);
    throw error;
  }
};

const handleUserCourseDeletion = async (courseId: string) => {
  try {
    const course = firestore().collection("courses").doc(courseId);
    const courseDoc = await course.get();
    const courseData = courseDoc.data();

    if (courseDoc.exists && courseData?.dependency > 0) {
      await course.update({
        creator: "TcoD2mfnDzQ6NmPQjbxzbpbUIJG3",
      });
    } else {
      await firestore().collection("courses").doc(courseId).delete();
    }
  } catch (error) {
    console.error("Error updating course:", error);
  }
};

const deleteQuestionsForUnit = async (
  courseId: string,
  unitId: string
): Promise<void> => {
  try {
    const unitDoc = await firestore()
      .collection("courses")
      .doc(courseId)
      .collection("units")
      .doc(unitId)
      .get();

    if (unitDoc.exists) {
      const data = unitDoc.data();

      await Promise.all(
        data?.questions.map((questionId: string) =>
          firestore()
            .collection("courses")
            .doc(courseId)
            .collection("questions")
            .doc(questionId)
            .delete()
        )
      );
      console.log("Deleted questions successfuly for unit")
    }
  } catch (error) {
    console.error("Error deleting questions: ", error);
  }
};

const deleteQuestionsForCourse = async (courseId: string): Promise<void> => {
  try {
    const unitsSnapshot = await firestore()
      .collection("courses")
      .doc(courseId)
      .collection("units")
      .get();

    if (!unitsSnapshot.empty) {
      await Promise.all(
        unitsSnapshot.docs.map(async (unitDoc) => {
          const unitData = unitDoc.data();

          if (unitData?.questions?.length > 0) {
            await Promise.all(
              unitData.questions.map((questionId: string) =>
                firestore()
                  .collection("courses")
                  .doc(courseId)
                  .collection("questions")
                  .doc(questionId)
                  .delete()
              )
            );
          }
        })
      );
      console.log("Deleted questions successfully for all units in the course");
    }
  } catch (error) {
    console.error("Error deleting questions for course: ", error);
  }
};

export { deleteExistingUnits, handleUserCourseDeletion, deleteQuestionsForUnit, deleteQuestionsForCourse };
