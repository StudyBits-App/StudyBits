import React, { useState, useEffect } from "react";
import { StyleSheet, Text, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import CourseCardShortCache from "./CourseCardCached";

interface ViewLearningProps {
  coursesUpdated: boolean; 
}

const ViewLearning: React.FC<ViewLearningProps> = ({ coursesUpdated }) => {
  const [learningCourseIds, setLearningCourseIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchLearningCourseIds = async () => {
      try {
        const storedIds = await AsyncStorage.getItem("learningCourses");
        if (storedIds) {
          setLearningCourseIds(JSON.parse(storedIds));
        }
      } catch (error) {
        console.error("Error fetching learning course IDs:", error);
      }
    };

    fetchLearningCourseIds();
  }, [coursesUpdated]); 

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {learningCourseIds.map((courseId) => (
          <CourseCardShortCache
            id={courseId}
            key={courseId}
            link="/homePages/viewCourse"
            params={{ id:courseId }}
          />
        ))}
        {learningCourseIds.length === 0 && (
          <Text style={styles.noCourses}>
            You haven't started learning any courses yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  noCourses: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default ViewLearning;
