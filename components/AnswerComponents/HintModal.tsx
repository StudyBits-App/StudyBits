import React from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";

interface HintModalProps {
  visible: boolean;
  title: string;
  content: string;
  image?: string;
  onClose: () => void;
}

const HintModal: React.FC<HintModalProps> = ({
  visible,
  title,
  content,
  image,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView
          contentContainerStyle={styles.modalContentContainer}
        >
          <Text style={[styles.text, styles.modalTitleText]}>{title}</Text>

          {image && (
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="contain"
            />
          )}

          <Text style={[styles.text, styles.modalText]}>{content}</Text>
          <Pressable style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Close</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  modalContentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    paddingHorizontal: 20,
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 300,
    marginVertical: 20,
  },
  modalCancel: {
    marginTop: 20,
  },
  modalCancelText: {
    color: "#FF0D0D",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default HintModal;