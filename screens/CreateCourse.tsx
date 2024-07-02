import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Image, TextInput, Text, TouchableOpacity, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSession } from '@/context/ctx';
import { uploadImageToFirebase, deleteImageFromFirebase } from '@/services/handleImages';
import { getCourseData } from '@/services/getUserData';
import { Course, defaultCourse } from '@/utils/interfaces';

const CreateCourse: React.FC = () => {
  const [course, setCourse] = useState<Course>(defaultCourse);
  const [editingURL, setEditingURL] = useState<string>('')
  const { user } = useSession();
  const { id } = useLocalSearchParams();

  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      if (typeof id === 'string') {
        try {
          const courseData = (await getCourseData(id)).data() as Course;
          setCourse(courseData);
          setEditingURL(courseData.picUrl);

        } catch (error) {
          console.error('Error fetching course: ', error);
        }
      }
    };
    fetchCourse();
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
    setCourse({ ...course, picUrl: '' });
  };

  const handleNext = async () => {
    try {
      if (course.picUrl) {
        const uploadedImageUrl = await uploadImageToFirebase(course.picUrl, 'coursePics');
        course.picUrl = uploadedImageUrl;
      }

      const courseRef = await firestore().collection('courses').add(course);
      const docId = courseRef.id;

      await courseRef.update({ key: docId });
      const currentCourses = (await firestore().collection('channels').doc(user?.uid).get()).data()?.courses;
      await firestore().collection('channels').doc(user?.uid).update({ courses: [...(currentCourses || []), docId] });
      router.push({ pathname: "/channelPages/manageCourse", params: { id: docId, isEditing: '1' } });
    } catch (error) {
      console.error('Error adding course: ', error);
    }
  };

  const handleSave = async () => {
    if (!(editingURL && editingURL === course.picUrl)) {
      console.log('Here')
      deleteImageFromFirebase(editingURL);
      if (course.picUrl) {
        const uploadedImageUrl = await uploadImageToFirebase(course.picUrl, 'coursePics');
        course.picUrl = uploadedImageUrl;
      }
    }
    if(typeof id === 'string'){
      firestore().collection('courses').doc(id).update(course);
    }
    router.push({ pathname: "/channelPages/manageCourse", params: { id: id, isEditing: '1' } });
  }

  return (
    <View style={styles.container}>
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
          style={{ ...styles.text, width: '60%' }}
          placeholder="Course Name"
          placeholderTextColor="#888"
          value={course.name}
          onChangeText={(text) => setCourse({ ...course, name: text })}
        />
      </View>
      <TextInput
        style={{ ...styles.text, width: '90%' }}
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
      ) :
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
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
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: Math.round((Dimensions.get('window').height + Dimensions.get('window').width) / 2),
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  text: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
  },
  headerText: {
    padding: 10,
    marginBottom: 20,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    width: '90%',
    alignItems: 'center',
    marginTop: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateCourse;
