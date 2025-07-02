import React, { useState, useEffect } from "react";
import { StyleSheet, Text, ScrollView, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CourseCardShortCache from "./CourseCardCached";

interface CourseListProps {
  collectionName: string;
  link?: string;
  params?: { [key: string]: string | number };
}

const CourseList: React.FC<CourseListProps> = ({
  collectionName,
  link,
  params,
}) => {
  const [courseIds, setCourseIds] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchLearningCourseIds = async () => {
      try {
        const storedIds = await AsyncStorage.getItem(collectionName);
        if (storedIds) {
          setCourseIds(JSON.parse(storedIds));
        }
      } catch (error) {
        console.error("Error fetching learning course IDs:", error);
      }
    };

    fetchLearningCourseIds();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {courseIds.map((courseId) => (
          <CourseCardShortCache
            id={courseId}
            key={courseId}
            link={link}
            params={{ ...params, id: courseId }}
          />
        ))}

        {(courseIds.length == 0 && collectionName == 'learningCourses') && (
          <Text style={styles.noCourses}>
            You haven't started learning any courses yet. Search or explore trending courses to get started!
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

export default CourseList;
