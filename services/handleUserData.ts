import firestore from '@react-native-firebase/firestore';

interface Unit {
    key: string;
    name: string;
    description: string;
  }

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

export {deleteExistingUnits, saveUnit}

