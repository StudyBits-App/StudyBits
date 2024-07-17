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
import { useUserCourses } from "@/context/userCourses";
import { userLearningCourses } from "@/context/userLearningCourses";
import firestore from "@react-native-firebase/firestore";
import { useSession } from "@/context/ctx";
import { router } from "expo-router";

const AddLearning: React.FC = () => {
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(null);
  const { courses } = useUserCourses();
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
        .add({ course: selectedCourseKey });
      console.log("Selected course:", selectedCourseKey);
      setSelectedCourseKey(null);
      router.push("/homePages/viewLearning");
    } else {
      console.log("No course selected");
    }
  };

  const filteredCourses = courses.filter(
    (course) => !learningCourses.includes(course)
  );

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
            action={false}
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
          <Text style={styles.submitButtonText}>Submit</Text>
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
