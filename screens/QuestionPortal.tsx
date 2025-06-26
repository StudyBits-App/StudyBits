import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  Alert,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { Answer, Hint } from "@/utils/interfaces";
import CoursesAndUnitsPage from "@/components/QuestionComponents/CourseUnitSelect";
import CourseCardShort from "@/components/CourseCardShort";
import UnitCard from "@/components/UnitCard";
import { router, useLocalSearchParams } from "expo-router";
import HintModal from "@/components/QuestionComponents/QuestionHintModal";
import {
  renderAnswer,
  renderHint,
} from "@/components/QuestionComponents/QuestionRenderFunctions";
import { styles } from "@/components/QuestionComponents/QuestionStyles";
import {
  fetchQuestion,
  handleHintImages,
  updateQuestion,
} from "@/services/handleQuestionData";
import { useToast } from "react-native-toast-notifications";
import SuccessModal from "@/components/QuestionComponents/FinalModal";

const QuestionPortal: React.FC = () => {
  const [question, setQuestion] = useState<string>("");

  const [hints, setHints] = useState<Hint[]>([]);
  const [answerChoices, setAnswerChoices] = useState<Answer[]>([]);

  const [hintModalVisible, setHintModalVisible] = useState(false);
  const [hintModalContent, setHintModalContent] = useState<string>("");
  const [hintModalTitle, setHintModalTitle] = useState<string>("");
  const [hintModalImage, setHintModalImage] = useState<string>("");
  const [editingHint, setEditingHint] = useState<Hint | null>(null);
  const [hintModalError, setHintModalError] = useState<string>("");

  const [courseModal, setCourseModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const animationController = useRef(new Animated.Value(0)).current;
  const [selectedUnitKey, setSelectedUnitKey] = useState<string | null>(null);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  const [isEditing, setIsEditing] = useState(false);
  const [originalHints, setOriginalHints] = useState<Hint[]>([]);

  const { courseId, unitId, id } = useLocalSearchParams();
  const toast = useToast();

  useEffect(() => {
    if (
      typeof courseId === "string" &&
      courseId.trim() &&
      typeof unitId === "string" &&
      unitId.trim()
    ) {
      setSelectedCourseKey(courseId);
      setSelectedUnitKey(unitId);
    } else {
      openDropdown();
    }
  }, [courseId, unitId]);

  useEffect(() => {
    if (id && typeof id === "string") {
      setIsEditing(true);
      loadQuestion(id);
    }
  }, [id]);

  const loadQuestion = async (questionId: string) => {
    const questionData = await fetchQuestion(questionId);
    if (questionData) {
      setQuestion(questionData.question);
      setHints(questionData.hints);
      setOriginalHints(questionData.hints);
      setAnswerChoices(questionData.answers);
      setSelectedCourseKey(questionData.course);
      setSelectedUnitKey(questionData.unit);
    }
  };

  const toggleDropdown = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animationController, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOpen(!isOpen);
  };

  const openDropdown = () => {
    if (!isOpen) {
      toggleDropdown();
    }
  };

  const dropdownHeight = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const errorToast = () => {
    toast.show(
      "Your question is invalid. Ensure you have a question, two answer choices, an at least 1 correct answer!",
      {
        type: "custom",
        placement: "bottom",
        duration: 4000,
        animationType: "slide-in",
      }
    );
  };

  const handleSubmit = async () => {
    const hasCorrectAnswer = answerChoices.some((answer) => answer.answer);

    if (!question.trim() || answerChoices.length < 2 || !hasCorrectAnswer) {
      errorToast();
      return;
    }

    if (
      selectedCourseKey &&
      selectedUnitKey &&
      selectedCourseKey.trim() !== "" &&
      selectedUnitKey.trim() !== ""
    ) {
      try {
        const updatedHints = await handleHintImages(hints, originalHints);

        const questionData = {
          question: question.trim(),
          hints: updatedHints,
          answers: answerChoices,
          course: selectedCourseKey,
          unit: selectedUnitKey,
        };

        const unitDocRef = firestore()
          .collection("courses")
          .doc(selectedCourseKey)
          .collection("units")
          .doc(selectedUnitKey);

        const courseDocRef = firestore()
          .collection("courses")
          .doc(selectedCourseKey);

        const unitDoc = await unitDocRef.get();

        if (unitDoc.exists()) {
          if (isEditing && id && typeof id === "string") {
            await updateQuestion(id, questionData);
          } else {
            const questionDocRef = await firestore()
              .collection("questions")
              .add(questionData);

            await unitDocRef.update({
              questions: firestore.FieldValue.arrayUnion(questionDocRef.id),
            });

            await courseDocRef.update({
              numQuestions: firestore.FieldValue.increment(1),
            });
          }

          setSuccessModalVisible(true);
          setHints([]);
          setAnswerChoices([]);
          setQuestion("");
          setSelectedCourseKey("");
          setSelectedUnitKey("");
        } else {
          console.error("Invalid unit or course in Firestore");
          setCourseModalVisible(true);
        }
      } catch (error) {
        console.error("Error submitting question:", error);
        toast.show("An error occurred while saving your question.", {
          type: "danger",
        });
      }
    } else {
      console.warn(
        "Missing course or unit key:",
        selectedCourseKey,
        selectedUnitKey
      );
      toast.show("Please select a valid course and unit.", {
        type: "danger",
      });
    }
  };

  const handleHintDelete = (key: string) => {
    setHints((prevHints) => prevHints.filter((item) => item.key !== key));
  };

  const handleAnswerDelete = (key: string) => {
    setAnswerChoices((prevAnswers) =>
      prevAnswers.filter((answer) => answer.key !== key)
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setHintModalImage(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    Alert.alert(
      "Remove Image",
      "Are you sure you want to remove this image?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => setHintModalImage(""),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const addHint = () => {
    const text = hintModalContent.trim();
    const title = hintModalTitle.trim();

    if (!hintModalImage && !text && !title) {
      setHintModalError(
        "Missing information! Additional info must have a title and content or an image."
      );
      return;
    }

    const newItem: Hint = {
      key: uuidv4(),
      title: title,
      content: text,
      image: hintModalImage,
    };
    setHints((prevHints) => [...prevHints, newItem]);
    setHintModalContent("");
    setHintModalTitle("");
    setHintModalImage("");
    setHintModalError("");
    setHintModalVisible(false);
  };

  const addAnswer = () => {
    const newItem: Answer = {
      key: uuidv4(),
      content: "",
      answer: false,
    };
    setAnswerChoices((prevAnswers) => [...prevAnswers, newItem]);
  };

  const updateHint = () => {
    const text = hintModalContent.trim();
    const title = hintModalTitle.trim();

    if (!((hintModalImage && editingHint) || (text && editingHint && title))) {
      setHintModalError(
        "Missing information! Additional info must have a title and content or an image."
      );
      return;
    }
    if ((hintModalImage && editingHint) || (text && editingHint && title)) {
      setHints((prevHints) =>
        prevHints.map((hint) =>
          hint.key === editingHint.key
            ? {
                ...hint,
                content: text,
                title: title,
                image: hintModalImage,
              }
            : hint
        )
      );
    }
    swipeableRefs.current[editingHint.key]?.close();
    setHintModalTitle("");
    setHintModalContent("");
    setHintModalImage("");
    setHintModalError("");
    setEditingHint(null);
    setHintModalVisible(false);
  };

  const handleCancelHint = () => {
    if (editingHint) {
      swipeableRefs.current[editingHint.key]?.close();
    }
    setHintModalVisible(false);
    setHintModalContent("");
    setHintModalTitle("");
    setHintModalImage("");
    setHintModalError("");
    setEditingHint(null);
  };

  const openHintEditModal = (hint: Hint) => {
    setEditingHint(hint);
    setHintModalContent(hint.content);
    setHintModalTitle(hint.title);
    setHintModalImage(hint.image);
    setHintModalVisible(true);
  };

  const toggleAnswer = (answerKey: string) => {
    setAnswerChoices((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.key === answerKey
          ? { ...answer, answer: !answer.answer }
          : answer
      )
    );
    swipeableRefs.current[answerKey]?.close();
  };

  const handleSelect = (courseKey: string | null, unitKey: string | null) => {
    setSelectedCourseKey(courseKey);
    setSelectedUnitKey(unitKey);
  };

  const handleCloseModal = () => {
    setCourseModalVisible(false);
    openDropdown();
  };

  const stopEditing = () => {
    setIsEditing(false);
    setHints([]);
    setAnswerChoices([]);
    setQuestion("");
    setSelectedCourseKey(null);
    setSelectedUnitKey(null);
    router.replace(`/question`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <NestableScrollContainer>
        <View>
          {id && (
            <Pressable onPress={stopEditing} style={styles.errorContainer}>
              <Text
                style={[
                  styles.errorText,
                  { textAlign: "left", marginLeft: 10 },
                ]}
              >
                Stop Editing
              </Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.headerText}>Question</Text>

        <TextInput
          placeholderTextColor={"rgba(255, 255, 255, 0.7)"}
          placeholder="Add Question Here"
          value={question}
          onChangeText={setQuestion}
          style={styles.questionInput}
          multiline
        />
        <View style={styles.sectionContainer}>
          <Pressable
            style={styles.sectionHeaderContainer}
            onPress={toggleDropdown}
          >
            <Text style={styles.sectionTitle}>Course & Unit</Text>
            <Pressable onPress={() => setCourseModalVisible(true)}>
              <AntDesign name="edit" size={30} color={"#3B9EBF"} />
            </Pressable>
          </Pressable>
        </View>

        <Animated.View
          style={[
            styles.dropdown,
            { height: dropdownHeight },
            isOpen && { marginBottom: 30 },
          ]}
        >
          {selectedCourseKey ? (
            <CourseCardShort id={selectedCourseKey} />
          ) : (
            <Text style={styles.dropdownReplacementText}>
              No course selected
            </Text>
          )}
          {selectedCourseKey?.trim() && selectedUnitKey?.trim() ? (
            <UnitCard
              courseId={selectedCourseKey}
              selected={false}
              id={selectedUnitKey}
            />
          ) : (
            <Text style={styles.dropdownReplacementText}>No unit selected</Text>
          )}
        </Animated.View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Pressable onPress={() => setHintModalVisible(true)}>
              <Ionicons name="add-circle" size={40} color={"#3B9EBF"} />
            </Pressable>
          </View>
          <NestableDraggableFlatList
            data={hints}
            renderItem={renderHint({
              swipeableRefs,
              openHintEditModal,
              handleHintDelete,
            })}
            keyExtractor={(item) => item.key}
            onDragEnd={({ data }) => setHints(data)}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>Answer Choices</Text>
            <Pressable onPress={addAnswer}>
              <Ionicons name="add-circle" size={40} color={"#3B9EBF"} />
            </Pressable>
          </View>
          <NestableDraggableFlatList
            data={answerChoices}
            renderItem={renderAnswer({
              swipeableRefs,
              toggleAnswer,
              handleAnswerDelete,
              setAnswerChoices,
            })}
            keyExtractor={(item) => item.key}
            onDragEnd={({ data }) => setAnswerChoices(data)}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text>{isEditing ? "Update" : "Submit"}</Text>
        </TouchableOpacity>
      </NestableScrollContainer>

      <HintModal
        visible={hintModalVisible}
        title={hintModalTitle}
        content={hintModalContent}
        image={hintModalImage}
        error={hintModalError}
        editingHint={editingHint}
        onTitleChange={setHintModalTitle}
        onContentChange={setHintModalContent}
        onImagePick={pickImage}
        onImageClear={clearImage}
        onCancel={handleCancelHint}
        onSubmit={editingHint ? updateHint : addHint}
        onErrorClear={() => setHintModalError("")}
      />

      <CoursesAndUnitsPage
        isVisible={courseModal}
        onClose={handleCloseModal}
        onSelect={handleSelect}
        initialCourseKey={selectedCourseKey}
        initialUnitKey={selectedUnitKey}
      />

      <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default QuestionPortal;
