import { Unit } from '@/utils/interfaces';
import firestore from '@react-native-firebase/firestore';

const deleteExistingUnits = async (courseId: string) => {
    try {
        const unitsCollectionRef = firestore().collection('courses').doc(courseId).collection('units');
        const existingUnits = await unitsCollectionRef.get();
        const deletePromises = existingUnits.docs.map((doc) => doc.ref.delete());
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting existing units: ', error);
        throw error; 
    }
};

const saveUnit = async (courseId: string, unit: Unit): Promise<Unit> => {
  try {
    const unitsCollectionRef = firestore().collection('courses').doc(courseId).collection('units');
    const docRef = unitsCollectionRef.doc(); 
    const unitWithKey = { ...unit, key: docRef.id }; 
    await docRef.set(unitWithKey);
    return unitWithKey;
  } catch (error) {
    console.error('Error saving unit: ', error);
    throw error;
  }
};

const handleUserCourseDeletion = async (courseId: string) => {
  try {
    const course = firestore().collection('courses').doc(courseId);
    const courseDoc = await course.get();
    const courseData = courseDoc.data();

    if (courseDoc.exists && courseData?.dependency <= 0) {
        await course.update({
          creator: 'TcoD2mfnDzQ6NmPQjbxzbpbUIJG3',
        });
    }
    else {
      await firestore()
      .collection("courses")
      .doc(courseId)
      .delete();
    }
  } catch (error) {
    console.error("Error updating course:", error);
  }
};


export {deleteExistingUnits, saveUnit, handleUserCourseDeletion}

