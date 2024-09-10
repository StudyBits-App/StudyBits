import { Unit } from "@/utils/interfaces";
import firestore from "@react-native-firebase/firestore";

const getChannelData = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is not provided");
  }
  try {
    const channelsSnapshot = await firestore()
      .collection("channels")
      .doc(userId)
      .get();
    return channelsSnapshot;
  } catch (error) {
    console.error("Error fetching channel data: ", error);
    throw error;
  }
};

const getCourseData = async (courseId: string) => {
  try {
    const courseDoc = await firestore()
      .collection("courses")
      .doc(courseId)
      .get();
    if (!courseDoc.exists) {
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
    const unitDocs = await firestore()
      .collection("courses")
      .doc(courseId)
      .collection("units")
      .get();
    return unitDocs;
  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
}

async function getUnit(courseId: string, unitId: string) {
  try {
    const unitDoc = await firestore()
      .collection("courses")
      .doc(courseId)
      .collection("units")
      .doc(unitId)
      .get();
    return unitDoc.exists ? unitDoc : false;
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


async function courseArray(userId: string) {
  try {
    const snapshot = await firestore().collection("channels").doc(userId).get();

    if (snapshot.exists) {
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

export { getChannelData, getCourseData, getUnitData, getUnit, courseArray };
