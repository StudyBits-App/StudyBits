import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Channel,
  Hint,
  QuestionAnswer,
  QuestionInfo,
  QuestionMetadata,
} from "@/utils/interfaces";
import { formatCount, shuffleArray, trimText } from "@/utils/utils";
import { useSession } from "@/context/ctx";
import CourseUnitSelector from "@/utils/getQuestions";
import LoadingScreen from "./LoadingScreen";
import {
  checkIfLikeOrDislike,
  checkIfSubscribed,
  getDislikes,
  getLikes,
  getQuestionInfoById,
  getViews,
  incrementDislikes,
  incrementLikes,
  incrementUserAccuracy,
  incrementViews,
  removeLikeOrDislike,
  subscribeToCourse,
  unsubscribeFromCourse,
} from "@/services/answerHelpers";
import {
  getChannelFromCourse,
  getCourseUnitNamesFromId,
} from "@/services/getUserData";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import HintModal from "@/components/AnswerComponents/HintModal";

const AnswerPage: React.FC = () => {
  const { user } = useSession();
  const courseUnitSelector = new CourseUnitSelector(user?.uid as string);

  const [loading, setLoading] = useState(true);
  const [questionsQueue, setQuestionsQueue] = useState<QuestionMetadata[]>([]);
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

  const [channel, setChannel] = useState<Channel | null>(null);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [unitName, setUnitName] = useState<string | null>(null);
  const courseIdRef = useRef<string | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState<string | null>(
    null
  );

  //ones the algorithm selects to send to api
  const [selectedUnitName, setSelectedUnitName] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  const fetchQuestions = async () => {
    setAnswersSubmitted(false);
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await courseUnitSelector.fetchApiResponse();

      if (!Array.isArray(response)) {
        setErrorMessage(response.message || "Something went wrong.");
        return;
      }

      const [data, courseId, unitId] = response;
      const names = await getCourseUnitNamesFromId(courseId, unitId);
      if (names) {
        setSelectedCourseName(names.courseName);
        setSelectedUnitName(names.unitName);
        setSelectedCourseId(names.id);
      }

      if (data.error || !data.similar_courses) {
        setErrorMessage(
          "We don't have any questions for you now! Find a fun course to learn in the meantime!"
        );
        return;
      }

      const newQuestions: QuestionMetadata[] = data.similar_courses.flatMap(
        (entry: any) =>
          (entry.questions || []).map((qid: string) => ({
            questionId: qid,
            courseId: entry.course_id,
            courseName: entry.course_name,
            unitName: entry.unit_name,
          }))
      );

      const merged = shuffleArray([...questionsQueue, ...newQuestions]);
      console.log("[fetchQuestions] merged[0]:", merged[0]);

      if (merged.length === 0) {
        setErrorMessage(
          "We don't have any questions for you now! Find a fun course to learn in the meantime!"
        );
        return;
      }

      setQuestionsQueue(merged);
      if (!currentQuestionId) {
        setCurrentQuestionId(merged[0].questionId);
        courseIdRef.current = merged[0].courseId;
        fetchEngagementData(merged[0].questionId, merged[0].courseId);
        setUnitName(merged[0].unitName);
        setCourseName(merged[0].courseName);
      }
    } catch (error) {
      console.error("[AnswerPage] Error fetching questions:", error);
      setErrorMessage("An error occurred while searching for questions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionInfo = async (questionId: string) => {
    try {
      const data = await getQuestionInfoById(questionId);
      if (data) {
        setQuestionInfo(data);
        setAnswerChoices(
          Array.isArray(data.answers)
            ? data.answers.map((a) => ({ ...a, isSelected: false }))
            : []
        );
        setHints(data.hints || []);
        setQuestion(data.question || "");

        const courseIdInside = data.course;
        const channel = await getChannelFromCourse(courseIdInside);
        setChannel(channel);
        fetchEngagementData(questionId, courseIdInside);
      }
    } catch (error) {
      console.error("Failed to load question info");
    }
  };

  const nextQuestion = () => {
    if (questionsQueue.length <= 1) {
      fetchQuestions();
    } else {
      const remainingQuestions = [...questionsQueue];
      remainingQuestions.shift();
      setQuestionsQueue(remainingQuestions);
      setCurrentQuestionId(remainingQuestions[0].questionId);
      courseIdRef.current = remainingQuestions[0].courseId;
      setCourseName(remainingQuestions[0].courseName);
      setUnitName(remainingQuestions[0].unitName);
      setAnswersSubmitted(false);
      setAnswerChoices([]);
    }
  };

  const updateUserAccuracy = async () => {
    for (const answer of answerChoices) {
      if (answer.isSelected && !answer.answer) {
        return;
      }
    }
    try {
      if (user?.uid) {
        await incrementUserAccuracy(user.uid);
      }
    } catch (error) {
      console.error("Failed to update accuracy");
    }
  };

  const fetchEngagementData = async (
    questionId: string,
    courseIdParam: string
  ) => {
    if (!questionId || !user?.uid || !courseIdParam) return;
    console.log(questionId, courseIdParam, user.uid);
    try {
      const [likeOrDislike, isSubscribed, likes, dislikes, views] =
        await Promise.all([
          checkIfLikeOrDislike(courseIdParam, questionId, user.uid),
          checkIfSubscribed(courseIdParam, user.uid),
          getLikes(questionId),
          getDislikes(questionId),
          getViews(questionId),
        ]);

      setLiked(likeOrDislike === true);
      setDisliked(likeOrDislike === false);
      setSubscribed(isSubscribed);
      setLikeCount(likes);
      setDislikeCount(dislikes);
      setViewCount(views);
    } catch (error) {
      console.error("Error fetching like/dislike/subscription states:", error);
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

  const handleLike = async () => {
    if (!user?.uid || !questionInfo || !courseIdRef) return;

    try {
      if (liked && currentQuestionId) {
        await removeLikeOrDislike(
          courseIdRef.current!,
          user.uid,
          currentQuestionId,
          true
        );
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        if (disliked && currentQuestionId) {
          await removeLikeOrDislike(
            courseIdRef.current!,
            user.uid,
            currentQuestionId,
            false
          );
          setDisliked(false);
          setDislikeCount((prev) => prev - 1);
        }
        if (currentQuestionId) {
          await incrementLikes(
            courseIdRef.current!,
            user.uid,
            currentQuestionId
          );
          setLiked(true);
          setLikeCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleDislike = async () => {
    if (!user?.uid || !questionInfo || !courseIdRef.current) return;

    try {
      if (disliked && currentQuestionId) {
        await removeLikeOrDislike(
          courseIdRef.current,
          user.uid,
          currentQuestionId,
          false
        );
        setDisliked(false);
        setDislikeCount((prev) => prev - 1);
      } else {
        if (liked && currentQuestionId) {
          await removeLikeOrDislike(
            courseIdRef.current,
            user.uid,
            currentQuestionId,
            true
          );
          setLiked(false);
          setLikeCount((prev) => prev - 1);
        }
        if (currentQuestionId) {
          await incrementDislikes(
            courseIdRef.current,
            user.uid,
            currentQuestionId
          );
          setDisliked(true);
          setDislikeCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error handling dislike:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!user?.uid || !courseIdRef.current) return;

    try {
      if (subscribed) {
        await unsubscribeFromCourse(courseIdRef.current, user.uid);
        setSubscribed(false);
      } else {
        await subscribeToCourse(courseIdRef.current, user.uid);
        setSubscribed(true);
      }
    } catch (error) {
      console.error("Error handling subscription:", error);
    }
  };

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
    incrementViews(courseIdRef.current!, currentQuestionId as string);
    setViewCount((prev) => prev + 1);
    updateUserAccuracy();
  };

  const courseDirect = () => {
    router.push({
      pathname: "/homePages/viewCourse",
      params: { id: courseIdRef.current },
    });
  };

  const userCourseDirect = () => {
    router.push({
      pathname: "/channelExternalPages/manageCourse",
      params: { id: selectedCourseId },
    });
  };

  const renderHint = ({ item }: { item: Hint }) => {
    const truncatedTitle = trimText(item.title, 100);
    const truncatedContent = trimText(item.content, 400);

    return (
      <View key={item.key} style={styles.hintContainer}>
        <Pressable style={styles.hint} onPress={() => handleOpenViewHint(item)}>
          {item.title ? (
            <Text style={[styles.text, styles.title, styles.imageTitle]}>
              {truncatedTitle}
            </Text>
          ) : null}
          {item.image ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ) : null}
          {item.content ? (
            <Text style={[styles.text, styles.imageContent]}>
              {truncatedContent}
            </Text>
          ) : null}
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
        <Text style={styles.answerText}>{item.content}</Text>
      </View>
    </Pressable>
  );

  const renderBottomBar = () => {
    return (
      <View style={styles.bottomBar}>
        <View style={styles.barTopRow}>
          <Pressable onPress={courseDirect} style={styles.bottomSection}>
            {channel?.profilePicURL && (
              <Image
                source={{ uri: channel.profilePicURL }}
                style={styles.profilePic}
              />
            )}
            <Text style={styles.displayName}>{channel?.displayName}</Text>
          </Pressable>

          <View style={styles.interactionButtons}>
            <Pressable onPress={handleLike} style={styles.iconButton}>
              <FontAwesome
                name={liked ? "thumbs-up" : "thumbs-o-up"}
                size={20}
                color={liked ? "#00e3ff" : "#ccc"}
              />
              <Text style={styles.iconLabel}>{formatCount(likeCount)}</Text>
            </Pressable>

            <Pressable onPress={handleDislike} style={styles.iconButton}>
              <FontAwesome
                name={disliked ? "thumbs-down" : "thumbs-o-down"}
                size={20}
                color={disliked ? "#FF5555" : "#ccc"}
              />
              <Text style={styles.iconLabel}>{formatCount(dislikeCount)}</Text>
            </Pressable>

            <Pressable
              onPress={handleSubscribe}
              style={[
                styles.subscribeButton,
                subscribed && styles.subscribeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.subscribeButtonText,
                  subscribed && styles.subscribeButtonTextActive,
                ]}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.courseInfoRow}>
          <Pressable onPress={userCourseDirect}>
            <Text style={styles.recommendationText}>
              {courseName ?? "Course"} • {unitName ?? "Unit"}
            </Text>
          </Pressable>

          <View style={styles.viewCountWrapper}>
            <FontAwesome name="pencil" size={14} color="#aaa" />
            <Text style={styles.viewCountText}>{formatCount(viewCount)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollview}
        contentContainerStyle={styles.content}
      >
        {errorMessage ? (
          <Text style={[styles.text, styles.noCoursesText]}>
            {errorMessage}
          </Text>
        ) : questionInfo ? (
          <>
            <Pressable
              style={{ marginBottom: 8, alignItems: "center" }}
              onPress={userCourseDirect}
            >
              <Text style={styles.recommendationText}>
                {selectedCourseName} • {selectedUnitName}
              </Text>
            </Pressable>

            <Text
              style={[
                styles.text,
                styles.question,
                question && question.length < 80 ? { textAlign: "center" } : {},
              ]}
            >
              {question}
            </Text>

            <View style={{ width: "100%" }}>
              {hints && hints.map((hint) => renderHint({ item: hint }))}
              {answerChoices.map((answer) => renderAnswer({ item: answer }))}
              <Pressable
                style={styles.button}
                onPress={() =>
                  answersSubmitted ? nextQuestion() : handleSubmitAnswers()
                }
              >
                <Text style={{ textAlign: "center" }}>
                  {answersSubmitted ? "Next Question" : "Check"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" />
        )}
      </ScrollView>
      {renderBottomBar()}
      <HintModal
        visible={hintModalVisible}
        title={hintModalTitle}
        content={hintModalContent}
        image={hintModalImage}
        onClose={handleCancelViewHint}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
  },
  content: {
    paddingVertical: 30,
    alignItems: "center",
  },
  scrollview: {
    width: "90%",
    height: "100%",
  },
  question: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 24,
  },
  text: {
    color: "#FFFFFF",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  hintContainer: {
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    width: "100%",
  },
  hint: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 160,
    marginVertical: 10,
    borderRadius: 6,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageTitle: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 16,
  },
  imageContent: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  answerContainer: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  answerText: {
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "center",
  },
  selectedAnswerContainer: {
    backgroundColor: "#00e3ff30",
    borderColor: "#00e3ff",
  },
  correctAnswerContainer: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  incorrectAnswerContainer: {
    backgroundColor: "#E57373",
    borderColor: "#E57373",
    shadowColor: "#E57373",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  correctButNotSelectedContainer: {
    borderColor: "#8bc34a",
    borderWidth: 3,
    shadowColor: "#8bc34a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  button: {
    backgroundColor: "#00e3ff",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonText: {
    color: "#1E1E1E",
    fontWeight: "bold",
    fontSize: 16,
  },
  noCoursesText: {
    textAlign: "center",
    fontSize: 18,
    marginVertical: 30,
  },
  bottomBar: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  barTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  interactionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    alignItems: "center",
    marginHorizontal: 6,
  },
  iconLabel: {
    fontSize: 10,
    color: "#ccc",
    marginTop: 2,
  },
  subscribeButton: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 8,
    minWidth: 90,
    alignItems: "center",
  },
  subscribeButtonActive: {
    backgroundColor: "#555",
  },
  subscribeButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  subscribeButtonTextActive: {
    color: "#fff",
  },
  courseInfoRow: {
    marginTop: 8,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recommendationText: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "left",
  },
  viewCountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewCountText: {
    fontSize: 12,
    color: "#aaa",
    marginLeft: 4,
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  displayName: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
    marginHorizontal: 10,
  },
});

export default AnswerPage;
