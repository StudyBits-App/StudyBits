import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { getUnitData } from "@/services/getUserData";
import {
  deleteQuestionsForCourse,
  deleteQuestionsForUnit,
  handleUserCourseDeletion,
} from "@/services/handleUserData";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  NestableDraggableFlatList,
  RenderItemParams,
  NestableScrollContainer,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { v4 as uuidv4 } from "uuid";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Unit } from "@/utils/interfaces";
import CourseCard from "../components/CourseCard";
import Back from "@/components/Back";
import { SafeAreaView } from "react-native-safe-area-context";
import firestore from "@react-native-firebase/firestore";
import { deleteUserChannelCourse } from "@/services/fetchCacheData";
import { useSession } from "@/context/ctx";

const ManageCoursesPage: React.FC = () => {
  const { id, isEditing } = useLocalSearchParams();
  const { user } = useSession();

  const [units, setUnits] = useState<Unit[]>([]);
  const [editing, setIsEditing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [unitName, setUnitName] = useState<string>("");
  const [unitDescription, setUnitDescription] = useState<string>("");
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  const editingAnimation = useRef(new Animated.Value(-100)).current;
  const editingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setUnits([]);
        if (typeof id === "string") {
          const unitDocs = await getUnitData(id);
          if (unitDocs) {
            const unitData: Unit[] = [];
            if (!unitDocs.empty) {
              unitDocs.forEach((doc) => {
                const unit = doc.data() as Unit;
                unitData.push(unit);
              });
              const sortedUnits = unitData.sort((a, b) => a.order - b.order);
              setUnits(sortedUnits);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching units: ", error);
      }
    };
    fetchUnits();
  }, [id]);

  useEffect(() => {
    if (editing) {
      Animated.parallel([
        Animated.timing(editingAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(editingOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(editingAnimation, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(editingOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
    }
  }, [editing]);

  const createQuestionForUnit = (unit: Unit) => {
    router.push({
      pathname: "/question",
      params: { courseId: id, unitId: unit.key },
    });
  };

  const openUnitEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitName(unit.name);
    setUnitDescription(unit.description);
    setModalVisible(true);
  };

  const addUnit = async () => {
    try {
      const newUnit: Unit = {
        key: uuidv4(),
        name: unitName,
        description: unitDescription,
        order: units.length,
      };
      if (!newUnit.name.trim()) return;

      setUnits((prevUnits) => [...prevUnits, newUnit]);
      setModalVisible(false);
      setUnitName("");
      setUnitDescription("");

      await firestore()
        .collection("courses")
        .doc(id as string)
        .collection("units")
        .doc(newUnit.key)
        .set(newUnit);

      await updateLastModified();
    } catch (error) {
      console.error("Error adding unit: ", error);
    }
  };

  const updateUnit = async () => {
    try {
      if (editingUnit) {
        if (!unitName.trim()) {
          return;
        }

        setUnits((prevUnits) =>
          prevUnits.map((unit) =>
            unit.key === editingUnit.key
              ? { ...unit, name: unitName, description: unitDescription }
              : unit
          )
        );

        await firestore()
          .collection("courses")
          .doc(id as string)
          .collection("units")
          .doc(editingUnit.key)
          .set(
            {
              name: unitName,
              description: unitDescription,
              order: editingUnit.order,
              key: editingUnit.key,
            },
            { merge: true }
          );

        await updateLastModified();

        setEditingUnit(null);
        setModalVisible(false);
        setUnitName("");
        setUnitDescription("");
        swipeableRefs.current[editingUnit.key]?.close();
      }
    } catch (error) {
      console.error("Error updating unit: ", error);
    }
  };

  const cancelModal = () => {
    if (editingUnit) {
      swipeableRefs.current[editingUnit.key]?.close();
    }
    setEditingUnit(null);
    setUnitDescription("");
    setUnitName("");
    setModalVisible(false);
  };

  
  const handleDeleteUnit = async (key: string) => {
    try {
      swipeableRefs.current[key]?.close();
      delete swipeableRefs.current[key];
  
      const updatedUnits = units
        .filter((unit) => unit.key !== key)
        .map((unit, index) => ({ ...unit, order: index }));
  
      setUnits(updatedUnits);
      await deleteQuestionsForUnit(id as string, key)
      await firestore()
        .collection("courses")
        .doc(id as string)
        .collection("units")
        .doc(key)
        .delete();
  
      await saveAllUnits(updatedUnits);
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  };
  
  const updateLastModified = async () => {
    await firestore()
      .collection("courses")
      .doc(id as string)
      .update({
        lastModified: new Date().getTime(),
      });
  };

  const saveAllUnits = async (units: Unit[]) => {
    await Promise.all(
      units.map((unit) =>
        firestore()
          .collection("courses")
          .doc(id as string)
          .collection("units")
          .doc(unit.key)
          .set({
            name: unit.name,
            description: unit.description,
            order: unit.order,
            key: unit.key,
          })
      )
    );
    await updateLastModified();
  };

  const handleToggleEdit = () => {
    units.forEach((unit) => {
      swipeableRefs.current[unit.key]?.close();
    });
    setIsEditing(!editing);
  };

  const deleteCourse = async () => {
    await Promise.all([
      deleteQuestionsForCourse(id as string),
      deleteUserChannelCourse(id as string, user?.uid as string),
      handleUserCourseDeletion(id as string),
    ]);
    router.push("/channelPages/channelPage");
  };

  const onDragEndHandler = async ({
    data,
  }: {
    data: Unit[];
  }): Promise<void> => {
    try {
      const updatedData: Unit[] = data.map(
        (unit: Unit, index: number): Unit => ({
          ...unit,
          order: index,
        })
      );
      setUnits(updatedData);

      await Promise.all(
        updatedData.map(
          (unit: Unit): Promise<void> =>
            firestore()
              .collection("courses")
              .doc(id as string)
              .collection("units")
              .doc(unit.key)
              .set(
                {
                  order: unit.order,
                },
                { merge: true }
              )
        )
      );

      await updateLastModified();
    } catch (error: unknown) {
      console.error("Error updating unit order: ", error);
    }
  };

  const renderUnit = ({ item, drag }: RenderItemParams<Unit>) => {
    return (
      <Swipeable
        ref={(ref) => {
          if (ref && item.key) {
            swipeableRefs.current[item.key] = ref;
          }
        }}
        enabled={editing}
        renderRightActions={() => (
          <View style={styles.swipeActionsContainer}>
            <Pressable
              onPress={() => openUnitEditModal(item)}
              style={{ ...styles.swipeButton, backgroundColor: "#0D99FF" }}
            >
              <Text style={{ color: "white" }}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => handleDeleteUnit(item.key)}
              style={{ ...styles.swipeButton, backgroundColor: "#FF0D0D" }}
            >
              <Text style={{ color: "white" }}>Delete</Text>
            </Pressable>
          </View>
        )}
      >
        <Pressable
          style={[
            styles.contentContainer,
            !editing && styles.viewUnits,
            editing && styles.editingUnits,
          ]}
          onLongPress={editing ? drag : null}
          onPress={() => {
            if (!editing) {
              createQuestionForUnit(item);
            }
          }}
        >
          <View>
            <Text style={styles.contentTitle}>{item.name}</Text>
            <Text style={styles.subText}>{item.description}</Text>
          </View>
          {editing && (
            <AntDesign
              name="menufold"
              size={20}
              color="white"
              style={{ marginLeft: "auto" }}
            />
          )}
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={styles.pageContainer}>
      <NestableScrollContainer contentContainerStyle={styles.scrollContainer}>
        <SafeAreaView style={styles.topActions}>
          <Back link={"/channelPages"} params={{}} />
          <FontAwesome
            name="trash"
            size={30}
            color={"#FF474C"}
            onPress={deleteCourse}
          />
        </SafeAreaView>
        <View style={styles.topBar}>
          <LinearGradient
            colors={["#bb52aa", "#63ff85"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.linearGradient}
          >
            <View style={styles.topBarContainer}>
              <AntDesign
                name={"edit"}
                size={25}
                color={"white"}
                onPress={handleToggleEdit}
              />
              <Animated.View
                style={{
                  transform: [{ translateX: editingAnimation }],
                  opacity: editingOpacity,
                }}
              >
                <Text style={styles.subText}>Editing</Text>
              </Animated.View>
            </View>
          </LinearGradient>
        </View>

        <CourseCard id={id as string} editing={editing} cache={true} />

        <View>
          <View style={styles.unitHeaderContainer}>
            <Text style={styles.unitHeaderText}>Units</Text>
            {editing && (
              <Pressable onPress={() => setModalVisible(true)}>
                <Ionicons name="add-circle" size={40} color={"#3B9EBF"} />
              </Pressable>
            )}
          </View>
          {units.length > 0 ? (
            <View style={styles.unitsContainer}>
              <NestableDraggableFlatList
                data={units}
                renderItem={renderUnit}
                keyExtractor={(item) => item.key}
                onDragEnd={onDragEndHandler}
              />
            </View>
          ) : (
            <Text style={styles.subText}>No units</Text>
          )}
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
              <View style={styles.modalContentContainer}>
                <ScrollView contentContainerStyle={styles.modalContent}>
                  <TextInput
                    multiline
                    style={styles.modalInput}
                    onChangeText={(text) => setUnitName(text)}
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
                    <Button
                      title="Cancel"
                      onPress={cancelModal}
                      color="#FF0D0D"
                    />
                    <Button
                      title={editingUnit ? "Update Unit" : "Add Unit"}
                      onPress={editingUnit ? updateUnit : addUnit}
                      color="#0D99FF"
                    />
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </NestableScrollContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBar: {
    marginBottom: 15,
  },
  linearGradient: {
    borderRadius: 15,
    padding: 2,
  },
  topBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 13,
    padding: 10,
  },
  subText: {
    fontSize: 16,
    color: "white",
  },
  contentContainer: {
    backgroundColor: "#2E2E2E",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  contentTitle: {
    fontSize: 20,
    color: "white",
  },
  unitsContainer: {
    borderRadius: 15,
    backgroundColor: "#2E2E2E",
    padding: 10,
  },
  unitHeaderContainer: {
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  unitHeaderText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
  },
  viewUnits: {
    borderBottomColor: "white",
    borderBottomWidth: 1,
  },
  editingUnits: {
    borderColor: "white",
    borderWidth: 0.5,
  },
  swipeActionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "40%",
    paddingBottom: "3%",
  },
  swipeButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContentContainer: {
    maxHeight: "80%",
    width: "90%",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  modalInput: {
    color: "white",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
  },
});

export default ManageCoursesPage;
