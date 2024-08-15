import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Modal,
} from "react-native";
import CourseCardShort from "@/components/CourseCardShort";
import UnitCard from "@/components/UnitCard";
import { getUnitData } from "@/services/getUserData";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useUserCourses } from "@/context/userCourses";

interface UnitCardData {
  id: string;
  courseId: string;
  order: number;
}

interface CoursesAndUnitsPageProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (courseKey: string | null, unitKey: string | null) => void;
  initialCourseKey?: string | null;
  initialUnitKey?: string | null;
}

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
  const [units, setUnits] = useState<UnitCardData[]>([]);
  const [showCourses, setShowCourses] = useState(true);
  const { courses } = useUserCourses();

  useEffect(() => {
    setSelectedCourseKey(initialCourseKey);
    setSelectedUnitKey(initialUnitKey);
  }, [initialCourseKey, initialUnitKey]);

  const fetchUnits = async (courseId: string) => {
    try {
      const unitDocs = await getUnitData(courseId);
      if (unitDocs) {
        const unitDataArray: UnitCardData[] = [];
        if (!unitDocs.empty) {
          unitDocs.forEach((doc) => {
            const unitData = doc.data();
            unitDataArray.push({
              id: doc.id,
              courseId: courseId,
              order: unitData.order,
            });
          });
          unitDataArray.sort((a, b) => a.order - b.order);
          setUnits(unitDataArray);
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
  }, [selectedCourseKey, courses]);

  const refreshUnits = () => {
    if (selectedCourseKey) {
      fetchUnits(selectedCourseKey);
    }
  };

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

  const handleUnitNotFound = (unitId: string) => {
    if (unitId === selectedUnitKey) {
      setSelectedUnitKey(null);
      onSelect(selectedCourseKey, null);
    }
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
              {!showCourses && 
              <MaterialIcons 
                name="refresh"
                 size={30} 
                 color="#ADD8E6" 
                 onPress={refreshUnits}/>
              }
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
                    onUnitNotFound={handleUnitNotFound}
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
