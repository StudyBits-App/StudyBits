import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Course, defaultCourse } from "@/utils/interfaces";
import { trimText } from "@/utils/utils";
import { router } from "expo-router";
import { syncCourse } from "@/services/fetchCacheData";

interface CourseCardShortProps {
  id: string;
  link?: string;
  params?: { [key: string]: string | number };
  selected?: boolean;
  onPress?: () => void;
}

const CourseCardShortCache: React.FC<CourseCardShortProps> = ({
  id,
  link,
  params,
  selected,
  onPress,
}) => {
  const [course, setCourse] = useState<Course>(defaultCourse);

  useEffect(() => {
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

    const syncData = async () => {
      try {
        await syncCourse(id);
        const updatedCourseData = await AsyncStorage.getItem(`course_${id}`);
        if (updatedCourseData) {
          const updatedCourse = JSON.parse(updatedCourseData) as Course;
          setCourse(updatedCourse);
        }
      } catch (error) {
        console.error("Error syncing data:", error);
      }
    };

    loadCachedData();
    syncData();
  }, [id]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (link && params) {
      router.push({
        pathname: link as any,
        params: { ...params, id: course.key },
      });
    } else if (link) {
      router.push({
        pathname: link as any,
      });
    }
  };

  return (
    <Pressable
      style={[styles.course, selected && styles.selectedCourse]}
      onPress={handlePress}
    >
      <View style={styles.courseContent}>
        {course.picUrl && (
          <Image source={{ uri: course.picUrl }} style={styles.coursePic} />
        )}
        <View
          style={[
            styles.courseInfoBox,
            course.picUrl ? { marginLeft: "5%" } : null,
          ]}
        >
          <Text style={styles.courseName}>{trimText(course.name, 20)}</Text>
          <Text style={styles.courseDescription}>
            {trimText(course.description, 25)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  course: {
    borderRadius: 10,
    marginTop: "2%",
    borderColor: "grey",
    borderWidth: 1,
    backgroundColor: "#2E2E2E",
    marginBottom: 10,
  },
  courseContent: {
    flexDirection: "row",
    padding: 20,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "bold",
    width: "90%",
    color: "#fff",
  },
  courseDescription: {
    color: "#fff",
    fontSize: 14,
  },
  courseInfoBox: {
    width: "75%",
    justifyContent: "center",
  },
  coursePic: {
    width: 70,
    height: 70,
    borderRadius: Math.round(
      (Dimensions.get("window").height + Dimensions.get("window").width) / 2
    ),
    borderWidth: 1,
    borderColor: "#fff",
  },
  selectedCourse: {
    borderColor: "#ADD8E6",
    borderWidth: 2,
  },
});

export default CourseCardShortCache;
