import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import CourseCardShort from "@/components/CourseCardShort";
import { userLearningCourses } from "@/context/userLearningCourses";
import firestore from "@react-native-firebase/firestore";
import { useSession } from "@/context/ctx";
import { router } from "expo-router";
import LoadingScreen from "./LoadingScreen";

const AddLearning: React.FC = () => {
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(null);
  const [courses, setCourses] = useState<string[]>([]);

  const getCourses = async () => {
    const snapshot = await firestore().collection("courses").limit(10).get();
    setCourses(snapshot.docs.map((doc) => doc.id));
  };

  getCourses();

  const { learningCourses } = userLearningCourses();
  const { user } = useSession();

  const handleCourseSelect = (courseKey: string) => {
    setSelectedCourseKey(courseKey === selectedCourseKey ? null : courseKey);
  };

  const handleSubmit = async () => {
    if (selectedCourseKey) {
      await firestore()
        .collection("learning")
        .doc(user?.uid)
        .collection("courses")
        .doc(selectedCourseKey)
        .set({ studyingUnits: [0] });
      console.log("Selected course:", selectedCourseKey);
      setSelectedCourseKey(null);
      router.push("/");
    } else {
      console.log("No course selected");
    }
  };

  const filteredCourses = courses.filter(
    (course) => !learningCourses.includes(course)
  );

  if (courses === null) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Select a Course</Text>
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
