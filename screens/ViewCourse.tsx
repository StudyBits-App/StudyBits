import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import LoadingScreen from "@/screens/LoadingScreen";
import { getUnitData } from "@/services/getUserData";
import { useLocalSearchParams } from "expo-router";
import { Unit } from "@/utils/interfaces";
import CourseCard from "../components/CourseCard";
import UnitCard from "@/components/UnitCard";
import { AntDesign } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useSession } from "@/context/ctx";
import { userLearningCourses } from "@/context/userLearningCourses";
import Back from "@/components/Back";
import ChannelDisplay from "@/components/ChannelComponent";
import { SafeAreaView } from "react-native-safe-area-context";

const ViewCoursesPage: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const { user } = useSession();
  const [studiedUnit, setStudiedUnit] = useState(false);
  const { learningCourses } = userLearningCourses();
  const [courseCreatorId, setCourseCreatorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUnitsAndCourseCreator = async () => {
      setIsLoading(true);
      try {
        if (typeof id === "string") {
          const courseDoc = await firestore()
            .collection("courses")
            .doc(id)
            .get();
          if (courseDoc.exists) {
            const creatorId = courseDoc.data()?.creator;
            setCourseCreatorId(creatorId);
          }
          const unitDocs = await getUnitData(id);
          if (unitDocs) {
            const unitData: Unit[] = [];
            if (!unitDocs.empty) {
              unitDocs.forEach((doc) => {
                const unit = doc.data() as Unit;
                unitData.push(unit);
              });
              const sortedUnits = unitData.sort((a, b) => a.order - b.order);
              setUnits(sortedUnits);
            }
          }
          const isStudied = learningCourses.includes(id);
          setStudiedUnit(isStudied);
        }
      } catch (error) {
        console.error("Error: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnitsAndCourseCreator();
  }, [id, learningCourses]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleAddUnit = async () => {
    if (typeof id === "string") {
      await firestore()
        .collection("learning")
        .doc(user?.uid)
        .collection("courses")
        .doc(id)
        .set({ studyingUnits: [0] });
      setStudiedUnit(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Back trueBack/>
        <Text style={styles.pageTitle}>Course Details</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={studiedUnit ? undefined : handleAddUnit}
        >
          <AntDesign
            name={studiedUnit ? "checkcircle" : "plus"}
            size={24}
            color={studiedUnit ? "#4CAF50" : "#3B9EBF"}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ChannelDisplay
          link="/viewChannelPages/channelPageView"
          id={courseCreatorId as string}
          displayBanner={false}
        />
        <CourseCard id={id as string} editing={false} />
        
        <View style={styles.unitSection}>
          <Text style={styles.unitHeaderText}>Units</Text>
          {units.length > 0 ? (
            <View style={styles.unitsContainer}>
              {units.map((unit) => (
                <UnitCard
                  key={unit.key}
                  id={unit.key}
                  courseId={id as string}
                  selected={false}
                />
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2E2E2E",
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  actionButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  unitSection: {
    marginTop: 24,
  },
  unitHeaderText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  unitsContainer: {
    borderRadius: 12,
    backgroundColor: "#2E2E2E",
    padding: 12,
  },
  subText: {
    fontSize: 16,
    color: "white",
    marginTop: 12,
  },
});

export default ViewCoursesPage;