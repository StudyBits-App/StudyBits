import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { fetchUnitsAndCourseCreator } from "@/services/getUserData";
import { router, useLocalSearchParams } from "expo-router";
import { Unit } from "@/utils/interfaces";
import CourseCard from "../components/CourseCard";
import UnitCard from "@/components/UnitCard";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useSession } from "@/context/ctx";
import Back from "@/components/Back";
import ChannelDisplay from "@/components/ChannelComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteUserLearningCourse } from "@/services/fetchCacheData";

const ViewCoursesPage: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const { user } = useSession();
  const [studiedCourse, setStudiedCourse] = useState(false);
  const [courseCreatorId, setCourseCreatorId] = useState<string | null>(null);
  const [studyingUnits, setStudyingUnits] = useState<string[]>([]);
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const toggleSwitch = async () => {
    const newSwitchState = !isSwitchOn;
    setIsSwitchOn(newSwitchState);
    try {
      await firestore()
        .collection("learning")
        .doc(user?.uid)
        .collection("courses")
        .doc(id as string)
        .set({ useUnits: newSwitchState }, { merge: true });
    } catch (error) {
      console.error("Error updating Firestore:", error);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (typeof id === "string") {
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

          if (isStudied) {
            const courseDoc = await firestore()
              .collection("learning")
              .doc(user?.uid)
              .collection("courses")
              .doc(id)
              .get();
            const useUnits = courseDoc.data()?.useUnits;
            setIsSwitchOn(useUnits ?? false);
          }

          const learningDoc = await firestore()
            .collection("learning")
            .doc(user?.uid)
            .collection("courses")
            .doc(id)
            .get();

          const fetchedStudyingUnits = learningDoc.exists
            ? learningDoc.data()?.studyingUnits
            : [];

          setStudyingUnits(fetchedStudyingUnits);
        }
      } catch (error) {
        console.error("Error fetching course data: ", error);
      }
    };

    fetchCourseData();
  }, [id]);

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
        .set({ studyingUnits: [], useUnits: false });

      await firestore()
        .collection("courses")
        .doc(id)
        .set(
          { dependency: firestore.FieldValue.increment(1) },
          { merge: true }
        );
      setStudiedCourse(true);
      setStudyingUnits([]);
    }
  };

  const deleteLearningCourse = async () => {
    setIsSwitchOn(false);
    setStudyingUnits([]);
    await deleteUserLearningCourse(id as string, user?.uid as string);
    router.push("/");
  };

  const handleUnitCheckboxToggle = async (unitId: string) => {
    if (typeof id === "string" && user?.uid) {
      try {
        const docRef = firestore()
          .collection("learning")
          .doc(user.uid)
          .collection("courses")
          .doc(id);

        let newStudyingUnits = [...studyingUnits];
        const existingIndex = newStudyingUnits.indexOf(unitId);

        if (existingIndex > -1) {
          newStudyingUnits.splice(existingIndex, 1);
        } else {
          newStudyingUnits.push(unitId);
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
        {!studiedCourse && (
          <AntDesign
            name={"plus"}
            size={30}
            color={"#3B9EBF"}
            onPress={handleAddCourse}
          />
        )}
        {studiedCourse && (
          <FontAwesome
            name="trash"
            size={30}
            color={"#FF474C"}
            onPress={deleteLearningCourse}
          />
        )}
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
          <View style={styles.unitHeader}>
            <Text style={styles.unitHeaderText}>Units</Text>
            {studiedCourse && (
              <Switch
                value={isSwitchOn}
                onValueChange={toggleSwitch}
                trackColor={{ false: "#767577", true: "#3B9EBF" }}
                thumbColor={isSwitchOn ? "#FFFFFF" : "#f4f3f4"}
              />
            )}
          </View>
          {units.length > 0 ? (
            <View style={styles.unitsContainer}>
              {units.map((unit) => (
                <View key={unit.key} style={styles.unitRow}>
                  {studiedCourse && isSwitchOn && (
                    <Pressable
                      onPress={() => handleUnitCheckboxToggle(unit.key)}
                      style={styles.checkboxContainer}
                    >
                      <AntDesign
                        name={
                          studyingUnits.includes(unit.key)
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
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
  unitSection: {
    marginTop: 24,
  },
  unitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  unitHeaderText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  unitsContainer: {
    borderRadius: 12,
    backgroundColor: "#2E2E2E",
    padding: 12,
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
  subText: {
    fontSize: 16,
    color: "white",
    marginTop: 12,
  },
});

export default ViewCoursesPage;
