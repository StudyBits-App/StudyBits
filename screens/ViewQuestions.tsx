import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import {
  Course,
  Unit,
  Question,
  defaultCourse,
  defaultUnit,
} from "@/utils/interfaces";
import { router, useLocalSearchParams } from "expo-router";
import { useSession } from "@/context/ctx";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { trimText } from "@/utils/utils";
import LoadingScreen from "./LoadingScreen";
import { Swipeable } from "react-native-gesture-handler";

const UserQuestionsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState<boolean>(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState<boolean>(false);
  const [userPage, setUserPage] = useState(true);
  const { user } = useSession();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (id) {
      setUserPage(false);
    } else {
      setUserPage(true);
    }
  }, [id]);

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
      const channelDoc = await firestore()
        .collection("channels")
        .doc(id ? (id as string) : user?.uid)
        .get();

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
  };

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
          {trimText(
            selectedValue
              ? items.find((item) => item.key === selectedValue)?.name
              : placeholder,
            100
          )}
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

  const handleQuestionDelete = async (id: string) => {
    try {
      const unitRef = firestore()
        .collection("courses")
        .doc(selectedCourse as string)
        .collection("units")
        .doc(selectedUnit as string);

      const unitDoc = await unitRef.get();
      if (unitDoc.exists) {
        const unitData = unitDoc.data();
        if (unitData?.questions && Array.isArray(unitData.questions)) {
          const updatedQuestions = unitData.questions.filter(
            (questionId: string) => questionId !== id
          );
          await unitRef.update({
            questions: updatedQuestions,
          });

          await firestore().collection("questions").doc(id).delete();
          const courseRef = await firestore()
            .collection("courses")
            .doc(selectedCourse as string);
          const courseDoc = await courseRef.get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data();
            if (courseData?.numQuestions) {
              await courseRef.update({
                numQuestions: firestore.FieldValue.increment(-1),
              });
            }
          }
        }
      }
      fetchQuestions(selectedCourse as string, selectedUnit as string);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleQuestionEdit = (questionId: string) => {
    router.push({
      pathname: "/question",
      params: { id: questionId },
    });
  };

  const handleView = (questionId: string) => {
    router.push({
      pathname: "/answer",
      params: { id: questionId },
    });
  };
  const renderSwipeActions = (id: string) => (
    <View style={styles.swipeActionsContainer}>
      <TouchableOpacity
        style={styles.swipeButton}
        onPress={() => handleQuestionEdit(id)}
      >
        <Ionicons name="pencil" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeButton}
        onPress={() => {
          Alert.alert(
            "Delete Question",
            "Are you sure you want to delete this question?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => handleQuestionDelete(id),
              },
            ]
          );
        }}
      >
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

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
          <LoadingScreen />
        ) : (
          <ScrollView>
            {questions.length > 0 ? (
              questions.map((item) => (
                <Swipeable
                  key={item.id}
                  renderRightActions={() => renderSwipeActions(item.id)}
                  enabled={userPage}
                >
                  <Pressable
                    style={styles.questionContainer}
                    onPress={() => handleView(item.id)}
                  >
                    <Text style={styles.questionText}>{item.question}</Text>
                    {userPage && (
                      <AntDesign
                        name="menufold"
                        size={20}
                        color="white"
                        style={{ marginLeft: 10 }}
                      />
                    )}
                  </Pressable>
                </Swipeable>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 8,
    marginTop: 15,
  },
  questionText: {
    fontSize: 16,
    color: "white",
    flex: 1,
  },
  editButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
  swipeActionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "40%",
    paddingTop: "3%",
  },
  swipeButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    height: "100%",
  },
});

export default UserQuestionsPage;
