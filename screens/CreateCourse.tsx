import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, TextInput, Text } from 'react-native';

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
  const [imageUploaded, setImageUploaded] = useState(false);

  const handleImagePress = () => {
    if (imageUploaded) {
      setCourse({ ...course, picUrl: '' });
    } else {
      setCourse({ ...course, picUrl: '' });
    }
    setImageUploaded(!imageUploaded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.circle} onPress={handleImagePress}>
        {course.picUrl ? (
          <Image source={{ uri: course.picUrl }} style={styles.image} />
        ) : (
          <Text style={styles.circleText}>Upload Image</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.textInput}
        placeholder="Course Name"
        value={course.name}
        onChangeText={(text) => setCourse({ ...course, name: text })}
      />
      <TextInput
        style={styles.textArea}
        placeholder="Course Description"
        multiline
        numberOfLines={4}
        value={course.description}
        onChangeText={(text) => setCourse({ ...course, description: text })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleText: {
    color: '#fff',
    textAlign: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
});

export default CreateCourse;
