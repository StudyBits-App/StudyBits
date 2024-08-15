import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
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

const ViewCoursesPage: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const { user } = useSession();
  const [studiedUnit, setStudiedUnit] = useState(false);
  const { learningCourses } = userLearningCourses();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        if (typeof id === "string") {
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

          // Check if the unit is already studied
          const isStudied = learningCourses.includes(id);
          setStudiedUnit(isStudied);
        }
      } catch (error) {
        console.error("Error fetching units: ", error);
      }
    };

    fetchUnits();
  }, [id, learningCourses]);

  if (!units) {
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Back link="/homePages/viewLearning" params={{}} title="Back to Learning" />
        <TouchableOpacity
          onPress={studiedUnit ? undefined : handleAddUnit}
        >
          <AntDesign
            name={studiedUnit ? "checkcircle" : "plus"}
            size={30}
            color={studiedUnit ? "green" : "#3B9EBF"}
          />
        </TouchableOpacity>
      </View>
      <CourseCard id={id as string} editing={false} />
      <View>
        <View style={styles.unitHeaderContainer}>
          <Text style={styles.unitHeaderText}>Units</Text>
        </View>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    backgroundColor: "#1E1E1E",
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  unitHeaderContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  unitHeaderText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
  },
  unitsContainer: {
    borderRadius: 15,
    backgroundColor: "#2E2E2E",
    padding: 10,
  },
  subText: {
    fontSize: 16,
    color: "white",
  },
});

export default ViewCoursesPage;