import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import { useSession } from "@/context/ctx";
import { useLocalSearchParams } from "expo-router";
import LoadingScreen from "./LoadingScreen";
import CourseCardShort from "@/components/CourseCardShort";
import ChannelDisplay from "@/components/ChannelComponent";
import Back from "@/components/Back";
import { courseArray } from "@/services/getUserData";

const ViewChannelPage: React.FC = () => {
  const { isLoading } = useSession();
  const [otherCourses, setOtherCourses] = useState<string[]>([]);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const setCourses = async () => {
      if (id) {
        setOtherCourses(await courseArray(id as string));
      }
    };
    setCourses();
  }, [id]);

  if (isLoading) {
    return <LoadingScreen />;
  }


  return (
    <ScrollView style={styles.container}>
      <Back link="/" />
      <ChannelDisplay id={id as string} displayBanner={true} />
      {otherCourses.map((course) => (
        <CourseCardShort
          id={course}
          key={course}
          link={"/homePages/viewCourse"}
          params={{ id: id as string }}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 15,
    paddingVertical: 20
  },
});

export default ViewChannelPage;
