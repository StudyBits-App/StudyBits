import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useSession } from "@/context/ctx";
import { getChannelData } from "@/services/getUserData";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import LoadingScreen from "./LoadingScreen";
import { Channel, defaultChannel } from "@/utils/interfaces";
import CourseCardShort from "@/components/CourseCardShort";

const UserChannelPage = () => {
  const { user, isLoading } = useSession();
  const [channel, setChannel] = useState<Channel>(defaultChannel);

  const fetchUserChannel = async () => {
    if (!user) {
      return;
    }
    try {
      const channelData = (await getChannelData(user.uid)).data() as Channel;
      setChannel(channelData);
    } catch (error) {
      console.error("Error fetching user channel: ", error);
    }
  };

  useEffect(() => {
    setChannel(defaultChannel);
    fetchUserChannel();
  }, []);

  if (isLoading || channel === defaultChannel) {
    return <LoadingScreen />;
  }

  const ChannelComponent = ({ hasBanner }: { hasBanner: boolean }) => {
    return (
      <View style={{ marginTop: hasBanner ? 0 : 60 }}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: channel.profilePicURL || `https://robohash.org/${user?.uid}`,
            }}
            style={styles.profilePic}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>
              {channel.displayName || "Default Display Name"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const AddCourse = () => {
    return (
      <Link asChild href="/channelPages/createCourse">
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
      {channel.bannerURL ? (
        <View>
          <Image
            source={{ uri: channel.bannerURL }}
            style={styles.bannerImage}
          />
          <ChannelComponent hasBanner={true} />
        </View>
      ) : (
        <View>
          <ChannelComponent hasBanner={false} />
        </View>
      )}
      {channel.courses.map((course) => (
        <CourseCardShort action={true} id={course} key={course} />
      ))}
      <AddCourse />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 15,
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
