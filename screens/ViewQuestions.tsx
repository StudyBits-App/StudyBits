import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import {
  Course,
  Unit,
  Question,
  defaultCourse,
  defaultUnit,
} from "@/utils/interfaces";
import { router } from "expo-router";
import { useSession } from "@/context/ctx";

const UserQuestionsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState<boolean>(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState<boolean>(false);
  const { user } = useSession();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchUnits(selectedCourse);
      setSelectedUnit(null);
      setQuestions([]);
    } else {
      setUnits([]);
      setQuestions([]);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse && selectedUnit) {
      fetchQuestions(selectedCourse, selectedUnit);
    } else {
      setQuestions([]);
    }
  }, [selectedCourse, selectedUnit]);

  const fetchCourses = async () => {
    try {
      const channelDoc = await firestore().collection("channels").doc(user?.uid).get();
  
      if (channelDoc.exists) {
        const courseIds = channelDoc.data()?.courses || []; 
        const coursePromises = courseIds.map((courseId: string) =>
          firestore().collection("courses").doc(courseId).get()
        );
  
        const courseSnapshots = await Promise.all(coursePromises);
  
        setCourses(
          courseSnapshots.map((doc) => ({
            ...defaultCourse,
            key: doc.id,
            name: doc.data()?.name || "", 
            creator: doc.data()?.creator || "",
            picUrl: doc.data()?.picUrl || "",
            description: doc.data()?.description || "",
          }))
        );
      } else {
        console.log("No channel found for this user.");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  
  const fetchUnits = async (courseId: string) => {
    try {
      const snapshot = await firestore()
        .collection("courses")
        .doc(courseId)
        .collection("units")
        .get();
        
      const units = snapshot.docs
        .map((doc) => ({
          ...defaultUnit,
          key: doc.id,
          name: doc.data().name || "",
          description: doc.data().description || "",
          order: doc.data().order || 0,
        }))
        .sort((a, b) => a.order - b.order); 
  
      setUnits(units);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  }    

  const fetchQuestions = async (courseId: string, unitId: string) => {
    setLoading(true);
    try {
      const unitDoc = await firestore()
        .collection("courses")
        .doc(courseId)
        .collection("units")
        .doc(unitId)
        .get();

      const questionIds = unitDoc.data()?.questions || [];

      const fetchedQuestions = await Promise.all(
        questionIds.map(async (questionId: string) => {
          const questionDoc = await firestore()
            .collection("questions")
            .doc(questionId)
            .get();
          const data = questionDoc.data();
          return {
            id: questionDoc.id,
            question: data?.question || "",
            course: courseId,
            unit: unitId,
            hints: data?.hints || [],
            answers: data?.answers || [],
          } as Question;
        })
      );

      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (
    items: any[],
    selectedValue: string | null,
    onSelect: (value: string) => void,
    placeholder: string,
    show: boolean,
    setShow: (show: boolean) => void
  ) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShow(!show)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedValue
            ? items.find((item) => item.key === selectedValue)?.name
            : placeholder}
        </Text>
      </TouchableOpacity>
      {show && (
        <View style={styles.dropdownList}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(item.key);
                setShow(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const handleQuestionSelect = (questionId: string) => {
    router.push({
      pathname: "/question",
      params: { id: questionId },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {renderDropdown(
          courses,
          selectedCourse,
          setSelectedCourse,
          "Select Course",
          showCourseDropdown,
          setShowCourseDropdown
        )}
        {renderDropdown(
          units,
          selectedUnit,
          setSelectedUnit,
          "Select Unit",
          showUnitDropdown,
          setShowUnitDropdown
        )}
      </View>

      <View>
        <Text style={styles.heading}>Questions:</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.loadingIndicator}
          />
        ) : (
          <ScrollView>
            {questions.length > 0 ? (
              questions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.questionContainer}
                  onPress={() => handleQuestionSelect(item.id)}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No questions found.</Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1E1E1E",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 10,
  },
  dropdownButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
  },
  dropdownButtonText: {
    color: "white",
  },
  dropdownList: {
    backgroundColor: "#444",
    borderRadius: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    color: "white",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  questionContainer: {
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    color: "white",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});

export default UserQuestionsPage;
