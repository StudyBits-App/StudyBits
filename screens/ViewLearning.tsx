import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import CourseCardShort from "@/components/CourseCardShort";
import { SafeAreaView } from "react-native-safe-area-context";
import { userLearningCourses } from "@/context/userLearningCourses";

const ViewLearning: React.FC = () => {
  const { learningCourses } = userLearningCourses();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>What i'm learning</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
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
