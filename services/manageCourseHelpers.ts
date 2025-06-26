import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Unit } from "@/utils/interfaces";

const db = getFirestore();

export const addUnitToCourse = async (
  courseId: string,
  unit: Unit
): Promise<void> => {
  try {
    const unitRef = doc(db, "courses", courseId, "units", unit.key);
    await setDoc(unitRef, unit);
  } catch (error) {
    console.error("Error in addUnitToCourse:", error);
    throw error;
  }
};

export const updateUnitInCourse = async (
  courseId: string,
  unitKey: string,
  name: string,
  description: string,
  order: number
): Promise<void> => {
  try {
    const unitRef = doc(db, "courses", courseId, "units", unitKey);
    await setDoc(
      unitRef,
      { name, description, order, key: unitKey },
      { merge: true }
    );
  } catch (error) {
    console.error("Error in updateUnitInCourse:", error);
    throw error;
  }
};

export const deleteUnitFromCourse = async (
  courseId: string,
  unitKey: string
): Promise<void> => {
  try {
    const unitRef = doc(db, "courses", courseId, "units", unitKey);
    await deleteDoc(unitRef);
  } catch (error) {
    console.error("Error in deleteUnitFromCourse:", error);
    throw error;
  }
};

export const updateCourseLastModified = async (
  courseId: string
): Promise<void> => {
  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, {
      lastModified: new Date().getTime(),
    });
  } catch (error) {
    console.error("Error updating lastModified:", error);
    throw error;
  }
};

export const saveAllUnitsToCourse = async (
  courseId: string,
  units: Unit[]
): Promise<void> => {
  try {
    await Promise.all(
      units.map((unit) => {
        const unitRef = doc(db, "courses", courseId, "units", unit.key);
        return setDoc(unitRef, {
          name: unit.name,
          description: unit.description,
          order: unit.order,
          key: unit.key,
        });
      })
    );

    await updateCourseLastModified(courseId);
  } catch (error) {
    console.error("Error saving all units:", error);
    throw error;
  }
};

export const updateUnitOrderInCourse = async (
  courseId: string,
  units: Unit[]
): Promise<void> => {
  try {
    await Promise.all(
      units.map((unit) => {
        const unitRef = doc(db, "courses", courseId, "units", unit.key);
        return setDoc(unitRef, { order: unit.order }, { merge: true });
      })
    );

    await updateCourseLastModified(courseId);
  } catch (error) {
    console.error("Error updating unit order in helper:", error);
    throw error;
  }
};
