import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  Button,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Hint } from "@/utils/interfaces";
import { styles } from "./QuestionStyles";
import { Ionicons } from "@expo/vector-icons";

interface HintModalProps {
  visible: boolean;
  title: string;
  content: string;
  image: string;
  error: string;
  editingHint: Hint | null;
  onTitleChange: (text: string) => void;
  onContentChange: (text: string) => void;
  onImagePick: () => Promise<void>;
  onImageClear: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  onErrorClear: () => void;
}

const HintModal: React.FC<HintModalProps> = ({
  visible,
  title,
  content,
  image,
  error,
  editingHint,
  onTitleChange,
  onContentChange,
  onImagePick,
  onImageClear,
  onCancel,
  onSubmit,
  onErrorClear,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>Additional Info</Text>
            <TextInput
              multiline
              placeholderTextColor={"rgba(255, 255, 255, 0.7)"}
              placeholder="Title"
              value={title}
              onChangeText={onTitleChange}
              style={styles.modalHintInputContent}
            />
            {image ? (
              <Pressable
                style={styles.modalHintInputContent}
                onPress={onImageClear}
              >
                <Text style={styles.modalImageButtonText}>Clear image</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.modalHintInputContent}
                onPress={onImagePick}
              >
                <Text style={styles.modalImageButtonText}>
                  Pick an image from camera roll
                </Text>
              </Pressable>
            )}

            <View style={styles.imageContainer}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : null}
            </View>
            <TextInput
              placeholderTextColor={"rgba(255, 255, 255, 0.7)"}
              placeholder="Content"
              value={content}
              onChangeText={onContentChange}
              style={styles.modalHintInputContent}
              multiline
            />
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Each piece of info must have a title and description or an image
                </Text>
                <Pressable
                  onPress={() => onErrorClear()}
                  style={styles.errorIconContainer}
                >
                  <Ionicons name="close-circle" size={20} color="#888" />
                </Pressable>
              </View>
            )}

            <View style={styles.modalButtonContainer}>
              <Button title="Cancel" onPress={onCancel} color="#FF0D0D" />
              <Button
                title={editingHint ? "Update Hint" : "Add Hint"}
                onPress={onSubmit}
                color="#0D99FF"
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

export default HintModal;
