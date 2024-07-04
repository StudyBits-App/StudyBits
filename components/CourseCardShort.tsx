import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Course, defaultCourse } from "@/utils/interfaces";
import { trimText } from "@/utils/utils";
import { getCourseData } from "@/services/getUserData";

interface CourseCardShortProps {
  action: boolean;
  id: string
  selected?: boolean;
  onPress?: () => void;
}

//A component for short course cards for list display
const CourseCardShort: React.FC<CourseCardShortProps> = ({
  action,
  id,
  selected,
  onPress,
}) => {
  const [course, setCourse] = useState<Course>(defaultCourse);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = (await getCourseData(id)).data() as Course;
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course: ", error);
      }
    };
    fetchCourse();
  }, [id]);

  return (
    <Pressable
      style={[styles.course, selected && styles.selectedCourse]}
      onPress={() => {
        if (onPress) {
          onPress();
        } else if (action) {
          router.push({
            pathname: "/channelPages/manageCourse",
            params: { id: course.key, isEditing: "0" },
          });
        }
      }}
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
          <Text style={styles.courseName}>
            {trimText(course.name, 20) || "Default Course Name"}
          </Text>
          <Text style={styles.courseDescription}>
            {trimText(course.description, 25) ||
              "A course about courses, if you will."}
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
  selectedCourse: {
    borderColor: "#ADD8E6",
    borderWidth: 2,
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
});

export default CourseCardShort;
