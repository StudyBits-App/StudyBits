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
import { Course, Unit, Question } from "@/utils/interfaces";
import { router, useLocalSearchParams } from "expo-router";
import { useSession } from "@/context/ctx";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { trimText } from "@/utils/utils";
import LoadingScreen from "./LoadingScreen";
import { Swipeable } from "react-native-gesture-handler";
import {
  fetchCoursesForChannel,
  fetchQuestionsForUnit,
  fetchUnitsForCourse,
} from "@/services/viewQuestionsHandlers";
import { deleteQuestionFromUnit } from "@/services/handleQuestionData";

interface UserQuestionsPageProps {
  componentId?: string;
}

const UserQuestionsPage: React.FC<UserQuestionsPageProps> = ({
  componentId,
}) => {
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
  const searchParams = useLocalSearchParams();
  const id = componentId ?? (searchParams.id as string | undefined);

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
      const channelId = id ? (id as string) : user?.uid;
      if (channelId) {
        const courses = await fetchCoursesForChannel(channelId);
        setCourses(courses);
      }
    } catch (error) {
      setCourses([]);
    }
  };

  const fetchUnits = async (courseId: string) => {
    try {
      const units = await fetchUnitsForCourse(courseId);
      setUnits(units);
    } catch (error) {
      setUnits([]);
    }
  };

  const fetchQuestions = async (courseId: string, unitId: string) => {
    setLoading(true);
    try {
      const questions = await fetchQuestionsForUnit(courseId, unitId);
      setQuestions(questions);
    } catch (error) {
      setQuestions([]);
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
      if (!selectedCourse || !selectedUnit) return;
      await deleteQuestionFromUnit(
        selectedCourse as string,
        selectedUnit as string,
        id
      );
      fetchQuestions(selectedCourse, selectedUnit);
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
