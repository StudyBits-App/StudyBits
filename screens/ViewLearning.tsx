import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import CourseCardShort from "@/components/CourseCardShort";
import { SafeAreaView } from "react-native-safe-area-context";
import { userLearningCourses } from "@/context/userLearningCourses";

const ViewLearning: React.FC = () => {
  const { learningCourses } = userLearningCourses();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {learningCourses.map((courseId) => (
          <CourseCardShort
            id={courseId}
            key={courseId}
            link="/homePages/viewCourse"
          />
        ))}
        {learningCourses.length === 0 && (
          <Text style={styles.noCourses}>
            You haven't started learning any courses yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 20,
  },
  noCourses: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ViewLearning;
