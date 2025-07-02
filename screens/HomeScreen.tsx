import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
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
          <Text style={styles.greeting}>StudyBits</Text>
          <View style={styles.iconGroup}>
            <Pressable style={styles.iconButton} onPress={search}>
              <Ionicons name="search" size={32} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={leaderboard}>
              <Ionicons name="trophy" size={32} color="yellow" />
            </Pressable>
          </View>
        </View>

        <Pressable>
          <View style={styles.learnCard}>
            <View style={styles.learnRow}>
              <Text style={styles.learnText}>Explore Trending Courses</Text>
              <Pressable style={styles.plusInline} onPress={addLearning}>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>What I'm Learning</Text>

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
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 12,
  },
  learnCard: {
    backgroundColor: "#192f6a",
    borderRadius: 15,
    padding: 20,
  },
  learnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  learnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  plusInline: {
    backgroundColor: "#4c669f",
    padding: 8,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    textAlign: "left",
    marginHorizontal: 20,
    marginBottom: 15
  },
});

export default HomeScreen;
