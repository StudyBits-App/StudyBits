import React, { useState, useEffect } from "react";
import { StyleSheet, Text, ScrollView, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CourseCardShortCache from "./CourseCardCached";
import { useSession } from "@/context/ctx";

interface CourseListProps {
  collectionName: string;
  link?: string;
  params?: { [key: string]: string | number };
  noSync?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({
  collectionName,
  link,
  params,
  noSync,
}) => {
  const [learningCourseIds, setLearningCourseIds] = useState<string[]>([]);
  const { user } = useSession();
  useEffect(() => {
    const fetchLearningCourseIds = async () => {
      try {
        const storedIds = await AsyncStorage.getItem(collectionName);
        if (storedIds) {
          setLearningCourseIds(JSON.parse(storedIds));
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
        {learningCourseIds.map((courseId) => (
          <CourseCardShortCache
            id={courseId}
            key={courseId}
            link={link}
            params={{ ...params, id: courseId }}
            noSync={true}
          />
        ))}

        {learningCourseIds.length === 0 && (
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

export default CourseList;
