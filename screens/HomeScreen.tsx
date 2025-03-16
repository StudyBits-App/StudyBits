import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/context/ctx";
import { router } from "expo-router";
import CourseList from "@/components/CourseList";
import LoadingScreen from "./LoadingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchAndSaveLearningCourses,
  fetchAndSaveUserChannelCourses,
} from "@/services/fetchCacheData";

const HomeScreen: React.FC = () => {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeUserData = async () => {
      if (user?.uid) {
        try {
          const hasInitialized = await AsyncStorage.getItem(
            `user_initialized_${user.uid}`
          );
          if (!hasInitialized) {
            setLoading(true);
            await fetchAndSaveLearningCourses(user.uid);
            await fetchAndSaveUserChannelCourses(user?.uid);
            await AsyncStorage.setItem(`user_initialized_${user.uid}`, "true");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error initializing user data:", error);
        }
      }
    };

    initializeUserData();
  }, [user]);

  const addLearning = () => {
    router.push("/homePages/addLearning");
  };

  const search = () => {
    router.push("/homePages/search");
  };

  const leaderboard = () => {
    router.push("/homePages/leaderboard");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.addCoursesBox}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{user?.displayName}</Text>
          <Pressable style={styles.profileButton} onPress={search}>
            <Ionicons name="search" size={40} color="#fff" />
          </Pressable>
          <Pressable onPress={leaderboard}>
            <Ionicons name="trophy" size={40} color="yellow"/>
          </Pressable>
        </View>

        <Pressable style={styles.learnContainer}>
          <View style={styles.learnCard}>
            <Text style={styles.learnText}>What I'm Learning</Text>
          </View>
        </Pressable>
        <Pressable style={styles.addButton} onPress={addLearning}>
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>
      </View>
      <CourseList
        collectionName="learningCourses"
        link="/homePages/viewCourse"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  addCoursesBox: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileButton: {
    padding: 5,
  },
  learnContainer: {
    marginBottom: 20,
  },
  learnCard: {
    backgroundColor: "#192f6a",
    borderRadius: 15,
    padding: 20,
  },
  learnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4c669f",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginVertical: "10%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
  },
  text: {
    color: "white",
  },
});

export default HomeScreen;
