import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  Modal,
  Image,
  Animated,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Hint, QuestionAnswer, QuestionInfo } from "@/utils/interfaces";
import { shuffleArray, trimText } from "@/utils/utils";
import { useSession } from "@/context/ctx";
import CourseUnitSelector from "@/services/getQuestions";
import LoadingScreen from "./LoadingScreen";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";

const AnswerPage: React.FC = () => {
  const { user } = useSession();
  const courseUnitSelector = new CourseUnitSelector(user?.uid as string);

  const [loading, setLoading] = useState(true);
  const [questionsQueue, setQuestionsQueue] = useState<string[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [questionInfo, setQuestionInfo] = useState<QuestionInfo | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [answerChoices, setAnswerChoices] = useState<QuestionAnswer[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);

  const [hintModalVisible, setHintModalVisible] = useState(false);
  const [hintModalContent, setHintModalContent] = useState<string>("");
  const [hintModalTitle, setHintModalTitle] = useState<string>("");
  const [hintModalImage, setHintModalImage] = useState<string>("");

  const baseScale = React.useRef(new Animated.Value(1)).current;
  const pinchScale = React.useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  const lastScale = React.useRef(1);
  const [hasChanged, setHasChanged] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const fetchQuestions = async () => {
    setAnswersSubmitted(false);
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await courseUnitSelector.fetchApiResponse();
      if (response.error || !response.similar_courses) {
        setErrorMessage(
          "We don't have any questions for you now! Find a fun course to learn in the meantime!"
        );
        return;
      }

      const questions = shuffleArray(response.similar_courses.flatMap(
        (course: any) => course.questions || []
      ));

      if (questions.length === 0) {
        setErrorMessage(
          "We don't have any questions for you now! Find a fun course to learn in the meantime!"
        );
        return;
      }
      setQuestionsQueue(questions);
      setCurrentQuestionId(questions[0]);
    } catch (error) {
      console.error("[AnswerPage] Error fetching questions:", error);
      setErrorMessage("An error occurred while searching for questions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionInfo = async (questionId: string) => {
    try {
      const questionDoc = await firestore()
        .collection("questions")
        .doc(questionId)
        .get();
      if (questionDoc.exists) {
        const data = questionDoc.data() as QuestionInfo;
        setQuestionInfo(data);
      } else {
        console.error("Question not found with the given ID");
      }
    } catch (error) {
      console.error("Error fetching question info:", error);
    }
  };

  const nextQuestion = () => {
    if (questionsQueue.length <= 1) {
      fetchQuestions();
    } else {
      const remainingQuestions = [...questionsQueue];
      remainingQuestions.shift();
      setQuestionsQueue(remainingQuestions);
      setCurrentQuestionId(remainingQuestions[0]);
      setAnswersSubmitted(false);
      setAnswerChoices([])
    }
  };

  const updateUserAccuracy = async () => {
    for (const answer of answerChoices) {
      if (answer.isSelected && !answer.answer) {
        return;
      }
    }
    try {
      await firestore()
        .collection("learning")
        .doc(user?.uid)
        .set(
          {
            accuracy: firestore.FieldValue.increment(1),
          },
          { merge: true }
        );
    } catch (error) {
      console.error("Error updating user document with answer result:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await courseUnitSelector.initialize();
      fetchQuestions();
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentQuestionId) {
      fetchQuestionInfo(currentQuestionId);
    }
  }, [currentQuestionId]);

  useEffect(() => {
    if (questionInfo) {
      setAnswerChoices(
        questionInfo.answers.map((item) => {
          item.isSelected = false;
          return item;
        })
      );
      setHints(questionInfo.hints);
      setQuestion(questionInfo.question);
      
    }
  }, [questionInfo]);

  const toggleSelectedAnswer = (inputAnswer: QuestionAnswer) => {
    setAnswerChoices((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.key === inputAnswer.key
          ? { ...answer, isSelected: !inputAnswer.isSelected }
          : answer
      )
    );
  };

  const handleCancelViewHint = () => {
    setHintModalVisible(false);
    setHintModalContent("");
    setHintModalTitle("");
    setHintModalImage("");
  };

  const handleOpenViewHint = (item: Hint) => {
    setHintModalContent(item.content);
    setHintModalTitle(item.title);
    setHintModalImage(item.image);
    setHintModalVisible(true);
  };

  const handleSubmitAnswers = () => {
    setAnswersSubmitted(true);
    updateUserAccuracy();
  };

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: {
    nativeEvent: { state: number; scale: number };
  }) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.current *= event.nativeEvent.scale;
      pinchScale.setValue(1);
      baseScale.setValue(lastScale.current);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      lastScale.current = 1;
      baseScale.setValue(1);
      pinchScale.setValue(1);
      setHasChanged(false);
    }
    setLastTap(now);
  };

  const renderHint = ({ item }: { item: Hint }) => {
    const truncatedTitle = trimText(item.title, 100);
    const truncatedContent = trimText(item.content, 400);

    return (
      <View key={item.key} style={styles.hintContainer}>
        <Pressable style={styles.hint} onPress={() => handleOpenViewHint(item)}>
          <Text
            style={[
              styles.text,
              styles.title,
              item.image && item.title ? styles.imageTitle : null,
            ]}
          >
            {truncatedTitle}
          </Text>
          {item.image ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ) : null}
          <Text
            style={[
              styles.text,
              item.image && item.content ? styles.imageContent : null,
            ]}
          >
            {truncatedContent}
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderAnswer = ({ item }: { item: QuestionAnswer }) => (
    <Pressable
      key={item.key}
      disabled={answersSubmitted}
      onPress={() => toggleSelectedAnswer(item)}
    >
      <View
        style={[
          styles.answerContainer,
          item.isSelected ? styles.selectedAnswerContainer : {},
          answersSubmitted && item.isSelected && item.answer
            ? styles.correctAnswerContainer // Selected correct answer
            : answersSubmitted && !item.isSelected && item.answer
            ? styles.correctButNotSelectedContainer // Correct but not selected
            : answersSubmitted && item.isSelected && !item.answer
            ? styles.incorrectAnswerContainer // Selected incorrect answer
            : {},
        ]}
      >
        <Text style={styles.text}>{item.content}</Text>
      </View>
    </Pressable>
  );
  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollview}>
        {errorMessage ? (
          <Text style={[styles.text, styles.noCoursesText]}>
            {errorMessage}
          </Text>
        ) : questionInfo ? (
          <View>
            <Text style={[styles.text, styles.question]}>{question}</Text>
            {hints.map((hint) => renderHint({ item: hint }))}
            {answerChoices.map((answer) => renderAnswer({ item: answer }))}
            <Pressable
              style={styles.button}
              onPress={() =>
                answersSubmitted ? nextQuestion() : handleSubmitAnswers()
              }
            >
              <Text>{answersSubmitted ? "Next Question" : "Check"}</Text>
            </Pressable>
          </View>
        ) : (
          <ActivityIndicator size="large" />
        )}
      </ScrollView>

      <Modal visible={hintModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContentContainer}>
            {!hasChanged && (
              <Text style={[styles.text, styles.modalTitleText]}>
                {hintModalTitle}
              </Text>
            )}
            <GestureHandlerRootView style={styles.imageContainer}>
              {hintModalImage ? (
                <Pressable onPress={handleDoubleTap}>
                  <PinchGestureHandler
                    onGestureEvent={onPinchGestureEvent}
                    onHandlerStateChange={onPinchHandlerStateChange}
                  >
                    <Animated.Image
                      source={{ uri: hintModalImage }}
                      style={[styles.image, { transform: [{ scale }] }]}
                      resizeMode="contain"
                    />
                  </PinchGestureHandler>
                </Pressable>
              ) : null}
            </GestureHandlerRootView>
            {!hasChanged && (
              <Text style={[styles.text, styles.modalText]}>
                {hintModalContent}
              </Text>
            )}
            <Pressable
              style={{ alignItems: "center" }}
              onPress={handleCancelViewHint}
            >
              {!hasChanged && (
                <Text style={{ color: "#FF0D0D", fontSize: 17 }}>Cancel</Text>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalText: {
    paddingHorizontal: "10%",
    marginVertical: "5%",
  },
  title: {
    fontWeight: "bold",
  },
  scrollview: {
    width: "75%",
  },
  button: {
    backgroundColor: "#ffffff",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginVertical: "5%",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  hintContainer: {
    backgroundColor: "#333333",
    borderRadius: 8,
    paddingVertical: "4%",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "5%",
  },
  hint: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
  },
  question: {
    marginTop:20,
    fontSize: 15,
    marginBottom: "5%",
  },
  text: {
    color: "#FFF",
  },
  sectionContainer: {
    marginVertical: 8,
  },
  imageContainer: {
    maxWidth: "100%",
    maxHeight: 150,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageTitle: {
    textAlign: "center",
    marginBottom: 15,
  },
  imageContent: {
    textAlign: "center",
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 16,
  },
  modalContentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modalTitleText: {
    padding: 10,
    marginBottom: 10,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  answerContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    alignItems: "center",
  },
  selectedAnswerContainer: {
    backgroundColor: "#00e3ff80",
  },
  correctAnswerContainer: {
    backgroundColor: "#8bc34a",
  },
  incorrectAnswerContainer: {
    backgroundColor: "#e57373",
  },
  correctButNotSelectedContainer: {
    borderColor: "#8bc34a",
    borderWidth: 4,
  },
  noCoursesText: {
    textAlign: "center",
    fontSize: 18,
    marginVertical: "5%",
  },
});

export default AnswerPage;
