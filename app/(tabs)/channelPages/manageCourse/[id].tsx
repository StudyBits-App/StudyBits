import { useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import firestore from '@react-native-firebase/firestore';

interface Course {
  picUrl: string;
  name: string;
  description: string;
}

const ManageCoursesPage: React.FC = () => {
  const { id } = useGlobalSearchParams();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (typeof id === 'string') {
        try {
          const courseDoc = await firestore().collection('courses').doc(id).get();
          if (courseDoc.exists) {
            setCourse(courseDoc.data() as Course);
          }
        } catch (error) {
          console.error('Error fetching course: ', error);
        }
      }
    };

    fetchCourse();
  }, [id]);

  if (!course) {
    return (
      <ActivityIndicator/>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>        
      <Text style={styles.headerText}>Manage Course</Text>
      {course.picUrl ? (
        <Image source={{ uri: course.picUrl }} style={styles.image} />
      ) : (
        null
      )}
      <Text style={styles.courseName}>{course.name}</Text>
      <Text style={styles.courseDescription}>{course.description}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  headerText: {
    padding: 10,
    marginBottom: 20,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  courseName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  courseDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ManageCoursesPage;
