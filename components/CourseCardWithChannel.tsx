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
import { Channel, Course, defaultChannel, defaultCourse } from "@/utils/interfaces";
import { trimText } from "@/utils/utils";
import { getChannelData, getCourseData } from "@/services/getUserData";

interface CourseCardChannelProps {
  id: string;
}

const CourseCardChannel: React.FC<CourseCardChannelProps> = ({ id }) => {
  const [course, setCourse] = useState<Course>(defaultCourse);
  const [channel, setChannel] = useState<Channel>(defaultChannel);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = (await getCourseData(id)).data() as Course;
        setCourse(courseData);
        const channelData = (await getChannelData(courseData.creator)).data() as Channel;
        setChannel(channelData);
      } catch (error) {
        console.error("Error fetching course: ", error);
      }
    };
    fetchCourse();
  }, [id]);

  return (
    <Pressable
      style={styles.course}
      onPress={() => {
        router.push({
          pathname: "/home/futurePage",
          params: { id: course.key },
        });
      }}
    >
      <View style={styles.courseContent}>
        {course.picUrl && (
          <Image source={{ uri: course.picUrl}} style={styles.coursePic} />
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
      <View style={styles.channelInfo}>
        <Image source={{ uri: channel.profilePicURL ||`https://robohash.org/${course.creator}`}} style={styles.channelPic} />
        <Text style={styles.channelName}>{channel.displayName}</Text>
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
  channelInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  channelPic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  channelName: {
    color: "#fff",
    fontSize: 14,
  },
});

export default CourseCardChannel;