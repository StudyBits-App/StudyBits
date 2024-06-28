import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Pressable } from 'react-native';
import { useSession } from '@/context/ctx';
import LoadingScreen from '@/screens/LoadingScreen';
import { getCourseData, getUnitData } from '@/services/getUserData';

interface Course {
  picUrl: string;
  name: string;
  description: string;
}

interface Unit {
  name: string;
  description: string;
}

const ManageCoursesPage: React.FC = () => {
  const { id } = useLocalSearchParams();
  const { isEditing } = useLocalSearchParams();
  const { user } = useSession()
  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [editing, setIsEditing] = useState(false)

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

    const fetchUnits = async () => {
      try {
        if (typeof id === 'string') {
          const unitDocs = await getUnitData(id);
          if (unitDocs) {
            const unitData: Unit[] = [];
            if (!unitDocs.empty) {
              unitDocs.forEach((doc) => {
                const unit = doc.data() as Unit;
                unitData.push(unit);
              });
              setUnits(unitData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching units: ', error);
      }
    };


    if (isEditing === '1') {
      setIsEditing(true)
    }

    fetchCourse();
    fetchUnits();
  }, [id]);

  if (!course) {
    return (
      <LoadingScreen />
    );
  }
  const renderUnit = (unit: Unit) => {
    return (
      <View>
        <Text>hi</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isEditing &&
        <Text style={styles.courseName}>You are editing</Text>
      }
      <Pressable style={styles.courseCard} disabled={!isEditing}>
        <Image source={{ uri: course.picUrl || `https://robohash.org/${user?.uid}` }} style={styles.coursePic} />
        <View style={styles.courseInfoBox}>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
        </View>
      </Pressable>
      <View>
        <Text style={styles.courseName}>Units</Text>
        {units ? (
          units.map((unit) => renderUnit(unit))
        ) : (
          <Text style={styles.courseName}>No units. Edit this course to add units</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
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
    borderWidth: 1
  },
  courseInfoBox: {
    flex: 1,
    justifyContent: 'center',
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  courseDescription: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ManageCoursesPage;
