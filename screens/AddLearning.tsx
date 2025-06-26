import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import CourseCardShort from "@/components/CourseCardShort";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSession } from "@/context/ctx";
import { router } from "expo-router";
import { saveCourseToCache } from "@/services/fetchCacheData";
import { fetchCourses } from "@/services/fetchTrending";
import { addCourseForUser } from "@/services/handleUserData";

const AddLearning: React.FC = () => {
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(
    null
  );
  const [courses, setCourses] = useState<string[]>([]);
  const [learningCourses, setLearningCourses] = useState<string[]>([]);

  const { user } = useSession();

  useEffect(() => {
    const fetchLearningCourses = async () => {
      try {
        const storedCourses = await AsyncStorage.getItem("learningCourses");
        if (storedCourses) {
          setLearningCourses(JSON.parse(storedCourses));
        }
      } catch (error) {
        console.error(
          "Error fetching learning courses from AsyncStorage:",
          error
        );
      }
    };

    const getCourses = async () => {
      try {
        const docs = await fetchCourses(10);
        setCourses(docs.map((doc) => doc.id));
      } catch (error) {
        console.error("Failed to load courses in getCourses");
      }
    };

    fetchLearningCourses();
    getCourses();
  }, []);

  const handleCourseSelect = (courseKey: string) => {
    setSelectedCourseKey(courseKey === selectedCourseKey ? null : courseKey);
  };

  const handleSubmit = async () => {
  if (!selectedCourseKey || !user?.uid) return;

  try {
    const updatedCourses = await addCourseForUser(
      user.uid,
      selectedCourseKey,
      learningCourses,
      saveCourseToCache
    );

    setLearningCourses(updatedCourses);
    setSelectedCourseKey(null);
    router.push("/");
  } catch (error) {
    console.error("Error adding course:", error);
  }
};
  const filteredCourses = courses.filter(
    (course) => !learningCourses.includes(course)
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Explore</Text>
        {filteredCourses.map((course) => (
          <CourseCardShort
            key={course}
            id={course}
            selected={course === selectedCourseKey}
            onPress={() => handleCourseSelect(course)}
          />
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.submitButton,
            !selectedCourseKey && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedCourseKey}
        >
          <Text style={styles.submitButtonText}>Add</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  buttonContainer: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#6C757D",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AddLearning;
