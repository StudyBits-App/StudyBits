import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "@react-native-firebase/firestore";
import { Channel, Unit } from "@/utils/interfaces";

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
    if (!unitDoc.exists()) {
      throw new Error("Unit not found");
    }
    return unitDoc;
  } catch (error) {
    console.error("Error fetching unit:", error);
    throw error;
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

async function getChannelFromCourse(courseId: string): Promise<Channel | null> {
  try {
    const courseDoc = await getCourseData(courseId);
    const id = courseDoc.data()?.creator;
    const channelSnap = await getChannelData(id);

    if (channelSnap.exists()) {
      return channelSnap.data() as Channel;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching channel from course: ", error);
    return null;
  }
}

async function getCourseUnitNamesFromId(courseId: string, unit_id: string) {
  try {
    const courseDoc = await getCourseData(courseId);
    const courseName = courseDoc.data()?.name;
    const id = courseDoc.data()?.key;
    const unitDoc = await getUnit(courseId, unit_id);
    const unitName = unitDoc.data()?.name;
    return { courseName, unitName, id };
  } catch (error) {
    console.error("Error fetching course and unit names: ", error);
    return null;
  }
}

export {
  getChannelData,
  getCourseData,
  getUnitData,
  getUnit,
  getUserCourseArray,
  getChannelFromCourse,
  getCourseUnitNamesFromId,
};