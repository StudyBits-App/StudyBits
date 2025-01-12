import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <AntDesign name="checkcircle" size={80} color="#1E90FF" style={styles.icon} />
          <Text style={styles.message}>Question saved successfully!</Text>
          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000cc",
  },
  container: {
    width: "90%",
    padding: 30,
    backgroundColor: "#333333", 
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  icon: {
    marginBottom: 20,
  },
  message: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF", 
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#1E90FF", 
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SuccessModal;
