import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getCourseData } from "@/services/getUserData";
import { Course, defaultCourse } from "@/utils/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CourseCardProps {
  id: string;
  editing: boolean;
  cache: boolean;
}

// Component for fill size course cards when managing courses
const CourseCard: React.FC<CourseCardProps> = ({ id, editing, cache }) => {
  const [course, setCourse] = useState<Course>(defaultCourse);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = (await getCourseData(id)).data() as Course;
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course: ", error);
      }
    };
    const loadCachedData = async () => {
      try {
        const cachedCourseData = await AsyncStorage.getItem(`course_${id}`);
        if (cachedCourseData) {
          const courseData = JSON.parse(cachedCourseData) as Course;
          setCourse(courseData);
        }
      } catch (error) {
        console.error("Error loading cached data:", error);
      }
    };

    if (cache) {
      loadCachedData();
    } else {
      fetchCourse();
    }
  }, [id]);

  const editCourse = () => {
    router.push({
      pathname: "/channelExternalPages/createCourse",
      params: { id: id },
    });
  };

  return (
    <Pressable
      style={styles.courseCard}
      disabled={!editing}
      onPress={editCourse}
    >
      {course.picUrl && (
        <Image source={{ uri: course.picUrl }} style={styles.coursePic} />
      )}
      <View style={styles.courseInfoBox}>
        <Text style={styles.courseName}>{course.name}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  courseCard: {
    borderRadius: 10,
    marginTop: "2%",
    flexDirection: "row",
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: "#2E2E2E",
    padding: 20,
  },
  coursePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    borderColor: "white",
    borderWidth: 1,
  },
  courseInfoBox: {
    flex: 1,
    justifyContent: "center",
  },
  courseName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    flexWrap: "wrap",
  },
  courseDescription: {
    fontSize: 16,
    color: "white",
    flexWrap: "wrap",
  },
});

export default CourseCard;
