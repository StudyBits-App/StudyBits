import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import {
  Channel,
  Course,
  defaultChannel,
  defaultCourse,
} from "@/utils/interfaces";
import { trimText } from "@/utils/utils";
import { getChannelData, getCourseData } from "@/services/getUserData";

interface CourseCardCompactProps {
  id: string;
  selected?: boolean;
  onPress?: () => void;
  link?: string;
  params?: { [key: string]: string | number };
  channelDisplay?: boolean;
}

const CourseCardCompact: React.FC<CourseCardCompactProps> = ({
  id,
  selected,
  onPress,
  link,
  params,
  channelDisplay,
}) => {
  const [course, setCourse] = useState<Course>(defaultCourse);
  const [channel, setChannel] = useState<Channel>(defaultChannel);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = (await getCourseData(id)).data() as Course;
        setCourse(courseData);
        const channelData = (
          await getChannelData(courseData.creator)
        ).data() as Channel;
        setChannel(channelData);
      } catch (error) {
        console.error("Error fetching course: ", error);
      }
    };
    fetchCourse();
  }, [id]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (link) {
      router.push({
        pathname: link as any,
        params: { ...params, id: course.key },
      });
    }
  };

  return (
    <Pressable
      style={[styles.card, selected && styles.selected]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        {course.picUrl && (
          <Image source={{ uri: course.picUrl }} style={styles.pic} />
        )}
        <View style={[styles.infoBox, course.picUrl ? { marginLeft: 10 } : null]}>
          <Text style={styles.name}>
            {trimText(course.name, 16) || "Untitled Course"}
          </Text>
          {course.description && (
            <Text style={styles.description}>
              {trimText(course.description, 30)}
            </Text>
          )}
        </View>
      </View>
      {channelDisplay && (
        <View style={styles.channel}>
          <Image
            source={{
              uri:
                channel.profilePicURL ||
                `https://robohash.org/${course.creator}`,
            }}
            style={styles.channelPic}
          />
          <Text style={styles.channelName}>{channel.displayName}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginVertical: 6,
    borderColor: "#444",
    borderWidth: 1,
    backgroundColor: "#2A2A2A",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  selected: {
    borderColor: "#00BFFF",
    borderWidth: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  description: {
    fontSize: 12,
    color: "#ccc",
  },
  infoBox: {
    flex: 1,
    justifyContent: "center",
  },
  pic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: "#fff",
    borderWidth: 1,
  },
  channel: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  channelPic: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  channelName: {
    fontSize: 12,
    color: "#aaa",
  },
});

export default CourseCardCompact;