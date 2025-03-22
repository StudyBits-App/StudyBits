import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 16,
  },
  headerText: {
    padding: 10,
    marginBottom: 10,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  questionInput: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: "transparent",
    overflow: "hidden",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderContainer: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  contentContainer: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  contentTitle: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  contentText: {
    flex: 1,
    color: "white",
  },
  dropdownReplacementText: {
    color: "#fff",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#ffffff",
    padding: "3%",
    alignItems: "center",
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 16,
  },
  modalContentContainer: {
    justifyContent: "center",
    flex: 1,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalHintInputContent: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  modalImageButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  errorContainer: {
    borderRadius: 25,
    padding: 10,
    marginVertical: 20,
    borderColor: '#ADD8E6',
    borderWidth: 1
  },
  errorText: {
    color: '#ADD8E6',
    fontSize: 16,
  },
  errorIconContainer: {
    marginLeft: 10,
  },
  closeButton: {
    padding: 10,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '40%',
    paddingTop: '3%',
  },
  swipeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
  },
  correctAnswer: {
    borderColor: "green",
    borderWidth: 2,
  },
  incorrectAnswer: {
    borderColor: "red",
    borderWidth: 2,
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
});
