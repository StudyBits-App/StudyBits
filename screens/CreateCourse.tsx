import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "@/context/ctx";
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "@/services/handleImages";
import { getCourseData } from "@/services/getUserData";
import { Course, defaultCourse } from "@/utils/interfaces";
import Back from "@/components/Back";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "react-native-toast-notifications";
import { createNewCourse, updateExistingCourse } from "@/services/handleUserData";

const CreateCourse: React.FC = () => {
  const [course, setCourse] = useState<Course>(defaultCourse);
  const [editingURL, setEditingURL] = useState<string>("");
  const { user } = useSession();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchCourse = async () => {
      if (typeof id === "string") {
        try {
          const courseData = (await getCourseData(id)).data() as Course;
          setCourse(courseData);
          setEditingURL(courseData.picUrl);
        } catch (error) {
          console.error("Error fetching course: ", error);
        }
      }
    };
    fetchCourse();
    setCourse({ ...course, creator: user?.uid as string });
  }, [id]);

  const handleAddImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCourse({ ...course, picUrl: result.assets[0].uri });
    }
  };

  const removeImage = () => {
    setCourse({ ...course, picUrl: "" });
  };

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

  const handleNext = async () => {
    try {
      if (!course.name.trim()) {
        errorToast();
        return;
      }

      if (course.picUrl) {
        const uploadedImageUrl = await uploadImageToFirebase(
          course.picUrl,
          "coursePics"
        );
        course.picUrl = uploadedImageUrl;
      }

      if (user?.uid) {
        const docId = await createNewCourse(user.uid, course);
        router.push({
          pathname: "/channelExternalPages/manageCourse",
          params: { id: docId, isEditing: "1" },
        });
      }
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const handleSave = async () => {
    if (!course.name.trim()) {
      errorToast();
      return;
    }

    try {
      if (!(editingURL && editingURL === course.picUrl)) {
        deleteImageFromFirebase(editingURL);

        if (course.picUrl) {
          course.picUrl = await uploadImageToFirebase(
            course.picUrl,
            "coursePics"
          );
        }
      }

      course.lastModified = new Date().getTime();

      if (typeof id === "string") {
        await updateExistingCourse(id, course);
      }

      router.push({
        pathname: "/channelExternalPages/manageCourse",
        params: { id: id, isEditing: "1" },
      });
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backContainer}>
        <Back link="/channelPages" params={{}} />
      </View>
      <ScrollView>
        <Pressable style={styles.container} onPress={Keyboard.dismiss}>
          <Text style={styles.headerText}>Create a Course</Text>
          <View style={styles.row}>
            <Pressable onPress={course.picUrl ? removeImage : handleAddImage}>
              {course.picUrl ? (
                <Image source={{ uri: course.picUrl }} style={styles.image} />
              ) : (
                <View style={styles.circle}>
                  <Text style={styles.circleText}>Upload Image</Text>
                </View>
              )}
            </Pressable>
            <TextInput
              multiline
              style={styles.nameInput}
              placeholder="Course Name"
              placeholderTextColor="#888"
              value={course.name}
              onChangeText={(text) => setCourse({ ...course, name: text })}
            />
          </View>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Course Description"
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
            value={course.description}
            onChangeText={(text) => setCourse({ ...course, description: text })}
          />
          {id ? (
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  backContainer: {
    paddingHorizontal: 20,
  },
  container: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#666",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  circleText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: Math.round(
      (Dimensions.get("window").height + Dimensions.get("window").width) / 2
    ),
    marginRight: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameInput: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
    borderColor: "#555",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    flex: 1,
  },
  descriptionInput: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
    borderColor: "#555",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    width: "100%",
    marginBottom: 20,
  },
  headerText: {
    padding: 10,
    marginBottom: 20,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreateCourse;
