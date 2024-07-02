import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getCourseData } from '@/services/getUserData';
import { Course, CourseCardProps, defaultCourse } from '@/utils/interfaces';

const CourseCard: React.FC<CourseCardProps> = ({ id, editing }) => {
    
    const [course, setCourse] = useState<Course>(defaultCourse);
    const router = useRouter();

    useEffect(() => {
        const fetchCourse = async () => {
        if (typeof id === 'string') {
            try {
            const courseData = (await getCourseData(id)).data() as Course;
            setCourse(courseData);
            } catch (error) {
            console.error('Error fetching course: ', error);
            }
        }
    };
    fetchCourse();
    }, [id]);

  const editCourse = () => {
    router.push({ pathname: "/channelPages/createCourse", params: { id: id } });
  };

  return (
    <Pressable style={styles.courseCard} disabled={!editing} onPress={editCourse}>
      {course.picUrl && <Image source={{ uri: course.picUrl }} style={styles.coursePic} />}
      <View style={styles.courseInfoBox}>
        <Text style={styles.courseName}>{course.name}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  courseCard: {
    borderRadius: 10,
    marginTop: '2%',
    flexDirection: 'row',
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: '#2E2E2E',
    padding: 20,
  },
  coursePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    borderColor: 'white',
    borderWidth: 1,
  },
  courseInfoBox: {
    justifyContent: 'center',
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  courseDescription: {
    fontSize: 16,
    color: 'white',
  },
});

export default CourseCard;
