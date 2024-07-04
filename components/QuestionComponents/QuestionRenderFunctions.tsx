import React from "react";
import { Pressable, Text, TextInput, View, Image } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { RenderItemParams } from "react-native-draggable-flatlist";
import { Answer, Hint } from "@/utils/interfaces";
import { trimText } from "@/utils/utils";
import { styles } from "./QuestionStyles";

interface RenderHintProps {
  swipeableRefs: React.MutableRefObject<{ [key: string]: Swipeable | null }>;
  openHintEditModal: (hint: Hint) => void;
  handleHintDelete: (key: string) => void;
}

interface RenderAnswerProps {
  swipeableRefs: React.MutableRefObject<{ [key: string]: Swipeable | null }>;
  toggleAnswer: (answerKey: string) => void;
  handleAnswerDelete: (key: string) => void;
  setAnswerChoices: React.Dispatch<React.SetStateAction<Answer[]>>;
}

export const renderHint =
  ({ swipeableRefs, openHintEditModal, handleHintDelete }: RenderHintProps) =>
  ({ item, drag }: RenderItemParams<Hint>) => {
    const truncatedTitle = trimText(item.title, 10);
    const truncatedContent = trimText(item.content, 85);

    return (
      <Swipeable
        ref={(ref) => {
          if (ref && item.key) {
            swipeableRefs.current[item.key] = ref;
          }
        }}
        renderRightActions={() => (
          <View style={styles.swipeActionsContainer}>
            <Pressable
              onPress={() => openHintEditModal(item)}
              style={{ ...styles.swipeButton, backgroundColor: "#0D99FF" }}
            >
              <Text style={{ color: "white" }}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => handleHintDelete(item.key)}
              style={{ ...styles.swipeButton, backgroundColor: "#FF0D0D" }}
            >
              <Text style={{ color: "white" }}>Delete</Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable style={styles.contentContainer} onLongPress={drag}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.contentTitle,
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
                styles.contentText,
                item.image && item.content ? styles.imageContent : null,
              ]}
            >
              {truncatedContent}
            </Text>
          </View>
          <AntDesign
            name="menufold"
            size={20}
            color="white"
            style={{ marginLeft: "auto" }}
          />
        </Pressable>
      </Swipeable>
    );
  };

export const renderAnswer =
  ({
    swipeableRefs,
    toggleAnswer,
    handleAnswerDelete,
    setAnswerChoices,
  }: RenderAnswerProps) =>
  ({ item, drag }: RenderItemParams<Answer>) => {
    const handleAnswerContent = (text: string) => {
      setAnswerChoices((prevAnswers) =>
        prevAnswers.map((answer) =>
          answer.key === item.key ? { ...answer, content: text } : answer
        )
      );
    };

    return (
      <Swipeable
        ref={(ref) => {
          if (ref && item.key) {
            swipeableRefs.current[item.key] = ref;
          }
        }}
        renderRightActions={() => (
          <View style={styles.swipeActionsContainer}>
            <Pressable
              onPress={() => toggleAnswer(item.key)}
              style={styles.swipeButton}
            >
              {item.answer ? (
                <FontAwesome name="times" size={20} color="red" />
              ) : (
                <FontAwesome name="check" size={20} color="green" />
              )}
            </Pressable>
            <Pressable
              onPress={() => handleAnswerDelete(item.key)}
              style={{ ...styles.swipeButton, backgroundColor: "#FF0D0D" }}
            >
              <Text style={{ color: "white" }}>Delete</Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable
          style={[
            styles.contentContainer,
            item.answer && styles.correctAnswer,
            !item.answer && styles.incorrectAnswer,
          ]}
          onLongPress={drag}
        >
          <TextInput
            multiline
            style={styles.contentText}
            placeholder="Tricky answer choice"
            onChangeText={handleAnswerContent}
            value={item.content}
          />
          <AntDesign name="menufold" size={20} color="white" />
        </Pressable>
      </Swipeable>
    );
  };
