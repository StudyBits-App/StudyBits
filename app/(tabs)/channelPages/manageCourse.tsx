import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Pressable } from 'react-native';
import { useSession } from '@/context/ctx';
import LoadingScreen from '@/screens/LoadingScreen';
import { getCourseData, getUnitData } from '@/services/getUserData';
import { AntDesign } from '@expo/vector-icons';
import { NestableDraggableFlatList, RenderItemParams, NestableScrollContainer } from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';

interface Course {
  picUrl: string;
  name: string;
  description: string;
}

interface Unit {
  key: string;
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

  const [modalVisible, setModalVisible] = useState(false);
  const [unitName, setUnitName] = useState<string>('');
  const [unitDescription, setUnitDescription] = useState<string>('');
  const [editingUnit, setEditintUnit] = useState<Unit | null>(null);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

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

  const editCourse = () => {
    router.push({ pathname: "/channelPages/createCourse", params: { id: id } });
  }

  const openUnitEditModal = (unit: Unit) => {
    setEditintUnit(unit);
    setUnitName(unit.name);
    setUnitDescription(unit.description);
    setModalVisible(true);
  }

  const renderUnit = ({ item, drag }: RenderItemParams<Unit>) => {
    return (
      <Swipeable
        ref={ref => {
          if (ref && item.key) {
            swipeableRefs.current[item.key] = ref;
          }
        }}
        renderRightActions={() => (
          <View style={styles.swipeActionsContainer}>
            <Pressable onPress={() => openUnitEditModal(item)} style={{ ...styles.swipeButton, backgroundColor: '#0D99FF' }}>
              <Text style={{ color: 'white' }}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => console.log('delete')} style={{ ...styles.swipeButton, backgroundColor: '#FF0D0D' }}>
              <Text style={{ color: 'white' }}>Delete</Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable
          style={styles.contentContainer}
          onLongPress={() => {
            drag();
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.contentTitle}>{item.name}</Text>

            <Text style={styles.contentText}>{item.description}</Text>
          </View>
          <AntDesign name="menufold" size={20} color="white" style={{ marginLeft: 'auto' }} />
        </Pressable>
      </Swipeable>
    );
  }


  return (
    <NestableScrollContainer contentContainerStyle={styles.container}>
      <AntDesign name={'edit'} size={30} onPress={editCourse} />
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

          <NestableDraggableFlatList
            data={units}
            renderItem={renderUnit}
            keyExtractor={item => item.key}
            onDragEnd={({ data }) => setUnits(data)}
          />
        ) : (
          <Text style={styles.courseName}>No units. Edit this course to add units</Text>
        )}
      </View>
    </NestableScrollContainer>
  );
};

const redirectToEdit = () => {

}

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
  swipeActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '40%',
    paddingBottom: '3%',
  },
  swipeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
  },
  contentContainer: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  contentTitle: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  contentText: {
    color: 'white'
  },
});

export default ManageCoursesPage;
