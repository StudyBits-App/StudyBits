import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "@react-native-firebase/firestore";
import { Unit } from "@/utils/interfaces";

const db = getFirestore();

const getChannelData = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is not provided");
  }
  try {
    const channelRef = doc(db, "channels", userId);
    const channelsSnapshot = await getDoc(channelRef);
    return channelsSnapshot;
  } catch (error) {
    console.error("Error fetching channel data: ", error);
    throw error;
  }
};

const getCourseData = async (courseId: string) => {
  try {
    const courseRef = doc(db, "courses", courseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      throw new Error("Course not found");
    }
    return courseDoc;
  } catch (error) {
    console.error("Error fetching course data: ", error);
    throw error;
  }
};

async function getUnitData(courseId: string) {
  try {
    const unitsRef = collection(db, "courses", courseId, "units");
    const unitDocs = await getDocs(unitsRef);
    return unitDocs;
  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
}

async function getUnit(courseId: string, unitId: string) {
  try {
    const unitRef = doc(db, "courses", courseId, "units", unitId);
    const unitDoc = await getDoc(unitRef);
    return unitDoc.exists() ? unitDoc : false;
  } catch (error) {
    console.error("Error checking units collection:", error);
    return false;
  }
}

export const fetchUnitsAndCourseCreator = async (id: string) => {
  try {
    const courseDoc = await getCourseData(id);
    const creatorId = courseDoc.data()?.creator;

    const unitDocs = await getUnitData(id);
    const unitData: Unit[] = [];

    if (!unitDocs.empty) {
      unitDocs.forEach((doc) => {
        const unit = doc.data() as Unit;
        unitData.push(unit);
      });

      const sortedUnits = unitData.sort((a, b) => a.order - b.order);
      return { creatorId, sortedUnits };
    }
    return { creatorId, sortedUnits: [] };
  } catch (error) {
    console.error("Error fetching units and course creator: ", error);
  }
};

async function getUserCourseArray(userId: string) {
  try {
    const channelRef = doc(db, "channels", userId);
    const snapshot = await getDoc(channelRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && Array.isArray(data.courses)) {
        return data.courses.filter(
          (course): course is string => typeof course === "string"
        );
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

export {
  getChannelData,
  getCourseData,
  getUnitData,
  getUnit,
  getUserCourseArray,
};