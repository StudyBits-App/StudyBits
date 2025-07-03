import React from "react";
import { StyleSheet, Text, ScrollView, View } from "react-native";
import CourseCardCompact from "./CourseCardShortCompact";

interface SubscriberListProps {
  link?: string;
  params?: { [key: string]: string | number };
  ids: string[];
}

const SubscriberList: React.FC<SubscriberListProps> = ({
  link,
  params,
  ids
}) => {

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {ids.map((courseId) => (
          <CourseCardCompact
            id={courseId}
            key={courseId}
            link={link}
            params={{ ...params, id: courseId }}
          />
        ))}

        {(ids.length == 0) && (
          <Text style={styles.noCourses}>
            You have no subscriptions for this course. Explore!
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 20,
    marginLeft: 15,
  },
});

export default SubscriberList;
