import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import CourseCardShort from "@/components/CourseCardShort";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { fetchCourses } from "@/services/fetchTrending";

const Explore: React.FC = () => {
  const [courses, setCourses] = useState<string[]>([]);
  const [learningCourses, setLearningCourses] = useState<string[]>([]);

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

  const filteredCourses = courses.filter(
    (course) => !learningCourses.includes(course)
  );

  const redirect = (id: string) => {
    router.push({
      pathname: "/homePages/viewCourse",
      params: { id: id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Explore</Text>
        {filteredCourses.map((course) => (
          <CourseCardShort
            key={course}
            id={course}
            onPress={() => redirect(course)}
          />
        ))}
      </ScrollView>
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

export default Explore;
