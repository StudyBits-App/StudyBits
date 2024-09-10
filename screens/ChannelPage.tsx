import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useSession } from "@/context/ctx";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import ChannelDisplay from "@/components/ChannelComponent";
import CourseList from "@/components/CourseList";

const UserChannelPage: React.FC = () => {
  const { user } = useSession();

  const AddCourse = () => {
    return (
      <Link asChild href="/channelExternalPages/createCourse">
        <Pressable style={styles.course}>
          <Ionicons name="add-circle" size={70} color={"#3B9EBF"} />
          <View style={{ ...styles.courseInfoBox, marginLeft: "3%" }}>
            <Text style={styles.courseName}>Add a Course</Text>
            <Text style={styles.courseDescription}>
              It can be about anything you'd like.
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ChannelDisplay id={user?.uid as string} displayBanner={true} />
      <CourseList collectionName={"userCourses"} link="/channelExternalPages/manageCourse"/>
      <View style = {styles.addCourseCard}>
        <AddCourse />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  bannerImage: {
    height: 300,
    resizeMode: "cover",
  },
  course: {
    borderRadius: 10,
    marginTop: "2%",
    flexDirection: "row",
    borderColor: "grey",
    borderWidth: 1,
    backgroundColor: "#2E2E2E",
    padding: 20,
  },
  profileSection: {
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    paddingVertical: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: Math.round(
      (Dimensions.get("window").height + Dimensions.get("window").width) / 2
    ),
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileInfo: {
    marginLeft: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  addCourseCard: {
    paddingHorizontal: 15
  },
  courseName: {
    fontSize: 24,
    fontWeight: "bold",
    width: "90%",
    color: "#fff",
  },
  courseDescription: {
    width: "90%",
    color: "#fff",
  },
  courseInfoBox: {
    width: "75%",
    justifyContent: "center",
  },
});

export default UserChannelPage;
