import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { fetchUnitsAndCourseCreator } from "@/services/getUserData";
import { router, useLocalSearchParams } from "expo-router";
import { Unit } from "@/utils/interfaces";
import CourseCard from "../components/CourseCard";
import UnitCard from "@/components/UnitCard";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useSession } from "@/context/ctx";
import Back from "@/components/Back";
import ChannelDisplay from "@/components/ChannelComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteCourseFromLocalStorage } from "@/services/fetchCacheData";

const ViewCoursesPage: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const { user } = useSession();
  const [studiedCourse, setStudiedCourse] = useState(false);
  const [courseCreatorId, setCourseCreatorId] = useState<string | null>(null);
  const [studyingUnits, setStudyingUnits] = useState<number[]>([]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (typeof id === "string") {
          console.log(id);
          const courseData = await fetchUnitsAndCourseCreator(id);
          if (courseData) {
            setCourseCreatorId(courseData.creatorId);
            setUnits(courseData.sortedUnits);
          }

          const storedCourses = await AsyncStorage.getItem("learningCourses");
          const learningCourses = storedCourses
            ? JSON.parse(storedCourses)
            : [];
          const isStudied = learningCourses.includes(id);
          setStudiedCourse(isStudied);

          if (user?.uid) {
            const learningDoc = await firestore()
              .collection("learning")
              .doc(user.uid)
              .collection("courses")
              .doc(id)
              .get();

            const fetchedStudyingUnits = learningDoc.exists
              ? learningDoc.data()?.studyingUnits || []
              : [];

            setStudyingUnits(fetchedStudyingUnits);
          }
        }
      } catch (error) {
        console.error("Error fetching course data: ", error);
      }
    };

    fetchCourseData();
  }, [id, user?.uid]);

  const handleAddCourse = async () => {
    if (typeof id === "string") {
      const storedCourses = await AsyncStorage.getItem("learningCourses");
      const learningCourses = storedCourses ? JSON.parse(storedCourses) : [];

      if (!learningCourses.includes(id)) {
        const updatedCourses = [...learningCourses, id];
        await AsyncStorage.setItem(
          "learningCourses",
          JSON.stringify(updatedCourses)
        );
      }

      await firestore()
        .collection("learning")
        .doc(user?.uid)
        .collection("courses")
        .doc(id)
        .set({ studyingUnits: [0] });

      setStudiedCourse(true);
      setStudyingUnits([0]);
    }
  };

  const deleteLearningCourse = async () => {
    deleteCourseFromLocalStorage(id as string);
    console.log("hi");
    await firestore()
      .collection("learning")
      .doc(user?.uid)
      .collection("courses")
      .doc(id as string)
      .delete();
    router.push("/");
  };

  const handleUnitCheckboxToggle = async (unitIndex: number) => {
    if (typeof id === "string" && user?.uid) {
      try {
        const docRef = firestore()
          .collection("learning")
          .doc(user.uid)
          .collection("courses")
          .doc(id);
        let newStudyingUnits = [...studyingUnits];
        const existingIndex = newStudyingUnits.indexOf(unitIndex);
        if (existingIndex > -1) {
          newStudyingUnits.splice(existingIndex, 1);
        } else {
          newStudyingUnits.push(unitIndex);
        }
        await docRef.set({ studyingUnits: newStudyingUnits }, { merge: true });
        setStudyingUnits(newStudyingUnits);
      } catch (error) {
        console.error("Error toggling unit checkbox: ", error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Back trueBack />
        <Text style={styles.title}>Course Details</Text>
        <Pressable onPress={studiedCourse ? undefined : handleAddCourse}>
          <AntDesign
            name={studiedCourse ? "checkcircle" : "plus"}
            size={30}
            color={studiedCourse ? "#4CAF50" : "#3B9EBF"}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {courseCreatorId && (
          <ChannelDisplay
            link="/viewChannelPages/channelPageView"
            id={courseCreatorId}
            displayBanner={false}
          />
        )}
        <CourseCard id={id as string} editing={false} cache={false} />

        <View style={styles.unitSection}>
          <Text style={styles.unitHeaderText}>Units</Text>
          {units.length > 0 ? (
            <View style={styles.unitsContainer}>
              {units.map((unit, index) => (
                <View key={unit.key} style={styles.unitRow}>
                  {studiedCourse && (
                    <Pressable
                      onPress={() => handleUnitCheckboxToggle(index)}
                      style={styles.checkboxContainer}
                    >
                      <AntDesign
                        name={
                          studyingUnits.includes(index)
                            ? "checkcircle"
                            : "checkcircleo"
                        }
                        size={24}
                        color="#3B9EBF"
                      />
                    </Pressable>
                  )}
                  <View style={styles.unitCardContainer}>
                    <UnitCard
                      id={unit.key}
                      courseId={id as string}
                      selected={false}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.subText}>No units</Text>
          )}
          <TouchableOpacity onPress={deleteLearningCourse}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Remove from courses i'm are learning
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2E2E2E",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  unitSection: {
    marginTop: 24,
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxContainer: {
    marginRight: 10,
  },
  unitCardContainer: {
    flex: 1,
  },
  unitsContainer: {
    borderRadius: 12,
    backgroundColor: "#2E2E2E",
    padding: 12,
  },
  errorContainer: {
    borderRadius: 25,
    padding: 15,
    marginVertical: 20,
    borderColor: "#FF474C",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF474C",
    textAlign: "center",
  },
  unitHeaderText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subText: {
    fontSize: 16,
    color: "white",
    marginTop: 12,
  },
});

export default ViewCoursesPage;
