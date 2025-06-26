import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSession } from "@/context/ctx";
import { useLocalSearchParams } from "expo-router";
import LoadingScreen from "./LoadingScreen";
import CourseCardShort from "@/components/CourseCardShort";
import ChannelDisplay from "@/components/ChannelComponent";
import Back from "@/components/Back";
import { getUserCourseArray } from "@/services/getUserData";

interface ViewChannelPageProps {
  componentId?: string;
}

const ViewChannelPage: React.FC<ViewChannelPageProps> = ({ componentId }) => {
  const { isLoading } = useSession();
  const searchParams = useLocalSearchParams();
  const id = componentId ?? (searchParams.id as string | undefined);

  const [otherCourses, setOtherCourses] = useState<string[]>([]);

  useEffect(() => {
    const setCourses = async () => {
      if (id) {
        setOtherCourses(await getUserCourseArray(id));
      }
    };
    setCourses();
  }, [id]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      <Back trueBack />
      {id && <ChannelDisplay id={id} displayBanner={true} />}
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
    paddingVertical: 20,
  },
});

export default ViewChannelPage;
