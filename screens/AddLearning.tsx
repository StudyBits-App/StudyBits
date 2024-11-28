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
import firestore from "@react-native-firebase/firestore";
import { useSession } from "@/context/ctx";
import { router } from "expo-router";
import LoadingScreen from "./LoadingScreen";
import { saveCourse } from "@/services/fetchCacheData";

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
        const snapshot = await firestore()
          .collection("courses")
          .limit(10)
          .get();
        setCourses(snapshot.docs.map((doc) => doc.id));
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchLearningCourses();
    getCourses();
  }, []);

  const handleCourseSelect = (courseKey: string) => {
    setSelectedCourseKey(courseKey === selectedCourseKey ? null : courseKey);
  };

  const handleSubmit = async () => {
    if (selectedCourseKey) {
      try {
        await firestore()
          .collection("learning")
          .doc(user?.uid)
          .collection("courses")
          .doc(selectedCourseKey)
          .set({ studyingUnits: [0] });

        console.log("Selected course:", selectedCourseKey);
        const updatedCourses = [
          ...new Set([...learningCourses, selectedCourseKey]),
        ];

        await AsyncStorage.setItem(
          "learningCourses",
          JSON.stringify(updatedCourses)
        );
        await saveCourse(selectedCourseKey);
        setLearningCourses(updatedCourses);

        setSelectedCourseKey(null);
        router.push("/");
      } catch (error) {
        console.error("Error adding course:", error);
      }
    } else {
      console.log("No course selected");
    }
  };

  const filteredCourses = courses.filter(
    (course) => !learningCourses.includes(course)
  );

  if (courses.length === 0) {
    return <LoadingScreen />;
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
