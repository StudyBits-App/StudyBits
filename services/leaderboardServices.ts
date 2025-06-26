import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "@react-native-firebase/firestore";

const db = getFirestore();

export const fetchLeaderboardUsers = async (): Promise<
  { name: string; points: number }[]
> => {
  try {
    const leaderboardQuery = query(
      collection(db, "learning"),
      orderBy("accuracy", "desc")
    );
    const querySnapshot = await getDocs(leaderboardQuery);

    const docInfos = querySnapshot.docs.map((docSnap) => ({
      uid: docSnap.id,
      points: docSnap.data().accuracy,
    }));

    const users: { name: string; points: number }[] = [];

    for (const { uid, points } of docInfos) {
      const userDoc = await getDoc(doc(db, "channels", uid));
      const name = userDoc.data()?.displayName;
      if (name) {
        users.push({ name, points });
      }
    }

    return users;
  } catch (error) {
    console.error("Error in fetchLeaderboardUsers:", error);
    throw error;
  }
};
