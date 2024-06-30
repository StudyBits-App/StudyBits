import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, Modal, TextInput, Button, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSession } from '@/context/ctx';
import LoadingScreen from '@/screens/LoadingScreen';
import { getCourseData, getUnitData } from '@/services/getUserData';
import { deleteExistingUnits, saveUnit } from '@/services/handleUserData';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { NestableDraggableFlatList, RenderItemParams, NestableScrollContainer } from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { v4 as uuidv4 } from 'uuid';
import { LinearGradient } from 'expo-linear-gradient';

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
  
  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  
  const [editing, setIsEditing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [unitName, setUnitName] = useState<string>('');
  const [unitDescription, setUnitDescription] = useState<string>('');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  
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
      setIsEditing(true);
    }

    fetchCourse();
    fetchUnits();
  }, [id]);

  if (!course) {
    return <LoadingScreen />;
  }

  const handleSave = async () => {
    if (typeof id === 'string' && units.length > 0) {
      try {
        await deleteExistingUnits(id);
        const saveUnitPromises = units.map((unit) => saveUnit(id, unit));
        await Promise.all(saveUnitPromises);
        console.log('Units saved successfully!');
      } catch (error) {
        console.error('Error saving units: ', error);
      }
    }
  };

  const editCourse = () => {
    router.push({ pathname: "/channelPages/createCourse", params: { id: id } });
  };

  const openUnitEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
    setUnitDescription(unit.description);
    setModalVisible(true);
  };

  const addUnit = () => {
    const newUnit: Unit = {
      key: uuidv4(),
      name: unitName,
      description: unitDescription,
    };
    setUnits(prevUnits => [...prevUnits, newUnit]);
    setModalVisible(false);
    setUnitName('');
    setUnitDescription('');
  };

  const updateUnit = () => {
    if (editingUnit) {
      setUnits(prevUnits => prevUnits.map(unit => (unit.key === editingUnit.key ? { ...unit, name: unitName, description: unitDescription } : unit)));
      setEditingUnit(null);
      setModalVisible(false);
      setUnitName('');
      setUnitDescription('');
      swipeableRefs.current[editingUnit.key]?.close();
    }
  };

  const cancelModal = () => {
    if (editingUnit) {
        swipeableRefs.current[editingUnit.key]?.close();
    }
    setEditingUnit(null)
    setUnitDescription('');
    setUnitName('');
    setModalVisible(false)
  }

  const handleDeleteUnit = (key: string) => {
    setUnits(prevUnits => prevUnits.filter(unit => unit.key !== key));
  };

  const handleToggleEdit = () => {
    units.forEach(unit => {
      swipeableRefs.current[unit.key]?.close();
    });
    setIsEditing(!editing)
  };

  const renderUnit = ({ item, drag }: RenderItemParams<Unit>) => {
    return (
      <Swipeable
        ref={ref => {
          if (ref && item.key) {
            swipeableRefs.current[item.key] = ref;
          }
        }}
        enabled = {editing}
        renderRightActions={() => (
          <View style={styles.swipeActionsContainer}>
            <Pressable onPress={() => openUnitEditModal(item)} style={{ ...styles.swipeButton, backgroundColor: '#0D99FF' }}>
              <Text style={{ color: 'white' }}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => handleDeleteUnit(item.key)} style={{ ...styles.swipeButton, backgroundColor: '#FF0D0D' }}>
              <Text style={{ color: 'white' }}>Delete</Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable style={styles.contentContainer} onLongPress={drag} disabled = {!editing}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contentTitle}>{item.name}</Text>
            <Text style={styles.contentText}>{item.description}</Text>
          </View>
          {editing && <AntDesign name="menufold" size={20} color="white" style={{ marginLeft: 'auto' }} />}
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={{flex: 1}}>
      <NestableScrollContainer contentContainerStyle={styles.container}>
        <View style={styles.headerWrapper}>
            <LinearGradient
                colors={['#bb52aa', '#63ff85']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.linearGradient}
            >
                <View style={styles.headerContainer}>
                    <AntDesign name={'edit'} size={25} color={'white'} onPress={handleToggleEdit} />
                    {editing && <Text style={styles.editingText}>Editing</Text>}
                </View>
            </LinearGradient>
        </View>
        <Pressable style={styles.courseCard} disabled={!editing} onPress={editCourse}>
          {course.picUrl && <Image source={{ uri: course.picUrl }} style={styles.coursePic} />}
          <View style={styles.courseInfoBox}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
          </View>
        </Pressable>
    
        <View>
          <View style={styles.unitHeaderContainer}>
            <Text style={styles.unitHeaderText}>Units</Text>
            {editing &&
            <Pressable onPress={() => setModalVisible(true)}>
                <Ionicons name="add-circle" size={40} color={'#3B9EBF'} />
            </Pressable>
            }
          </View>
            {units.length > 0 ? (
                <View style={styles.unitsContainer}>
                    <NestableDraggableFlatList
                        data={units}
                        renderItem={renderUnit}
                        keyExtractor={item => item.key}
                        onDragEnd={({ data }) => setUnits(data)}
                    />
                </View>
            ) : (
                <Text style={styles.courseDescription}>No units</Text>
            )}
            {editing &&<Pressable style={styles.button} onPress={handleSave}>
                <Text>Save Units</Text>
            </Pressable>
            }
        </View>
    
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
              setModalVisible(false);
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  multiline
                  style={styles.modalInput}
                  onChangeText={text => setUnitName(text)}
                  value={unitName}
                  placeholder="Unit name"
                />
                <TextInput
                  placeholder="Unit Description"
                  value={unitDescription}
                  onChangeText={setUnitDescription}
                  style={styles.modalInput}
                  multiline
                />
                <View style={styles.modalButtons}>
                  <Button title="Cancel" onPress={cancelModal} color="#FF0D0D" />
                  <Button title={editingUnit ? 'Update Unit' : 'Add Unit'} onPress={editingUnit ? updateUnit : addUnit} color="#0D99FF" />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </NestableScrollContainer>
    </View>
  );      
};


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#1E1E1E',
        padding: 20,
    },
      headerWrapper: {
        marginTop: 15,
        marginBottom: 15
    },
      linearGradient: {
        borderRadius: 15,
        padding: 2, 
    },
      headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 13, 
        padding: 10,
    },
      editingText: {
        color: 'white',
        fontSize: 16,
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
        borderWidth: 1,
    },
    courseInfoBox: {
        flex: 1,
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
    contentContainer: {
        backgroundColor: "#2E2E2E",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: 'white',
        borderBottomWidth: 2
    },
    contentTitle: {
        fontSize: 24,
        color: 'white',
    },
    contentText: {
        fontSize: 18,
        color: 'white',
    },
    unitsContainer: {
        borderRadius: 15,
        backgroundColor: '#2E2E2E',
        padding: 10,
    } ,
    unitHeaderText: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 25,
        fontWeight: "bold",
    },
    unitHeaderContainer: {
        marginTop: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    swipeActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '40%',
    },
    swipeButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 10,
        width: '90%',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    modalInput: {
        color: 'white',
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 10,
        padding:15
    },
    button: {
        marginTop: 30,
        backgroundColor: "#ffffff",
        padding: '3%',
        alignItems: "center",
        borderRadius: 10,
    },
});

export default ManageCoursesPage;
