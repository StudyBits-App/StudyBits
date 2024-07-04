import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Modal,
} from "react-native";
import { CoursesAndUnitsPageProps } from "@/utils/interfaces";
import CourseCardShort from "@/components/CourseCardShort";
import UnitCard from "@/components/UnitCard";
import { getUnitData } from "@/services/getUserData";
import { AntDesign } from "@expo/vector-icons";
import { useUserCourses } from "@/context/userCourses";

const CoursesAndUnitsPage: React.FC<CoursesAndUnitsPageProps> = ({
  isVisible,
  onClose,
  onSelect,
  initialCourseKey = null,
  initialUnitKey = null,
}) => {
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(
    initialCourseKey
  );
  const [selectedUnitKey, setSelectedUnitKey] = useState<string | null>(
    initialUnitKey
  );
  const [units, setUnits] = useState<{ id: string; courseId: string }[]>([]);
  const [showCourses, setShowCourses] = useState(true);
  const {courses} = useUserCourses();

  useEffect(() => {
    setSelectedCourseKey(initialCourseKey);
    setSelectedUnitKey(initialUnitKey);
  }, [initialCourseKey, initialUnitKey]);

  const fetchUnits = async (courseId: string) => {
    try {
      const unitDocs = await getUnitData(courseId);
      if (unitDocs) {
        const unitData: { id: string; courseId: string }[] = [];
        if (!unitDocs.empty) {
          unitDocs.forEach((doc) => {
            unitData.push({ id: doc.id, courseId: courseId });
          });
          setUnits(unitData);
        } else {
          setUnits([]);
        }
      }
    } catch (error) {
      console.error("Error fetching units: ", error);
    }
  };

  useEffect(() => {
    if (selectedCourseKey) {
      fetchUnits(selectedCourseKey);
    } else {
      setUnits([]);
    }
  }, [selectedCourseKey]);

  const handleCourseSelect = (courseKey: string) => {
    const newCourseKey = courseKey === selectedCourseKey ? null : courseKey;
    setSelectedCourseKey(newCourseKey);
    setSelectedUnitKey(null);
    onSelect(newCourseKey, null);
  };

  const handleUnitSelect = (unitKey: string) => {
    const newUnitKey = unitKey === selectedUnitKey ? null : unitKey;
    setSelectedUnitKey(newUnitKey);
    onSelect(selectedCourseKey, newUnitKey);
  };

  const toggleView = () => {
    setShowCourses(!showCourses);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.container}>
            <View style={styles.header}>
              <Pressable onPress={toggleView} style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>
                  {showCourses ? "Show Units" : "Show Courses"}
                </Text>
              </Pressable>
              <AntDesign
                name="close"
                size={25}
                color={"white"}
                onPress={onClose}
              />
            </View>
            <Text style={styles.sectionTitle}>
              {showCourses ? "Courses" : "Units"}
            </Text>
            {showCourses ? (
              courses.map((course) => (
                <CourseCardShort
                  action={false}
                  selected={course === selectedCourseKey}
                  onPress={() => handleCourseSelect(course)}
                  id={course}
                  key={course}
                />
              ))
            ) : selectedCourseKey ? (
              units.length > 0 ? (
                units.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    id={unit.id}
                    courseId={unit.courseId}
                    selected={unit.id === selectedUnitKey}
                    onPress={() => handleUnitSelect(unit.id)}
                  />
                ))
              ) : (
                <Text style={styles.noUnitsText}>
                  No units available for this course.
                </Text>
              )
            ) : (
              <Text style={styles.noUnitsText}>No course selected</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    height: "80%",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 20,
  },
  toggleButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 5,
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noUnitsText: {
    color: "#fff",
    fontSize: 16,
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#E74C3C",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CoursesAndUnitsPage;
