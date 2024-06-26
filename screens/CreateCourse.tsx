import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Image, TextInput, Text, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface Course {
  picUrl: string;
  name: string;
  description: string;
}

const defaultCourse: Course = {
  picUrl: '',
  name: '',
  description: '',
};

const CreateCourse: React.FC = () => {
  const [course, setCourse] = useState<Course>(defaultCourse);
  const [unitModalVisible, setUnitModalVisible] = useState(false);

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
    setCourse({ ...course, picUrl: '' });
  };

  const handleNext = () => {

  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Create a course</Text>
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
          style={{ ...styles.text, width: '60%' }}
          placeholder="Course Name"
          value={course.name}
          onChangeText={(text) => setCourse({ ...course, name: text })}
        />
      </View>
      <TextInput
        style={{ ...styles.text, width: '90%' }}
        placeholder="Course Description"
        multiline
        numberOfLines={4}
        value={course.description}
        onChangeText={(text) => setCourse({ ...course, description: text })}
      />
      <Pressable style={styles.button} onPress={handleNext}>
        <Text>Submit</Text>
      </Pressable>

      <Modal visible={unitModalVisible} animationType='slide'>


      </Modal>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#1E1E1E",
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  circleText: {
    color: '#fff',
    textAlign: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  text: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: '60%',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerText: {
    padding: 10,
    marginBottom: 10,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#ffffff",
    padding: '3%',
    alignItems: "center",
    borderRadius: 5,
  },
});

export default CreateCourse;
