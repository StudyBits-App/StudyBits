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
} from "react-native";
import LoadingScreen from "@/screens/LoadingScreen";
import { getUnitData } from "@/services/getUserData";
import { deleteExistingUnits, saveUnit } from "@/services/handleUserData";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  NestableDraggableFlatList,
  RenderItemParams,
  NestableScrollContainer,
} from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { v4 as uuidv4 } from "uuid";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { Unit } from "@/utils/interfaces";
import CourseCard from "../components/CourseCard";
import Back from "@/components/Back";
import { SafeAreaView } from "react-native-safe-area-context";
import firestore from '@react-native-firebase/firestore';

const ManageCoursesPage: React.FC = () => {
  const { id, isEditing } = useLocalSearchParams();
  const [errorVisable, setErrorVisable] = useState(false);

  const [units, setUnits] = useState<Unit[]>([]);
  const [firebaseUnits, setFirebaseUnits] = useState<Unit[]>([]);

  const [editing, setIsEditing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [unitName, setUnitName] = useState<string>("");
  const [unitDescription, setUnitDescription] = useState<string>("");
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const toast = useToast();

  const editingAnimation = useRef(new Animated.Value(-100)).current;
  const editingOpacity = useRef(new Animated.Value(0)).current;
  const iconAnimation = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUnits = async () => {
      try {
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
              setFirebaseUnits(sortedUnits);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching units: ", error);
      }
    };

    if (isEditing === "1") {
      setIsEditing(true);
    }

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

  useEffect(() => {
    if (unsavedChanges) {
      Animated.parallel([
        Animated.timing(iconAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(iconAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(iconOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
      setErrorVisable(false);
    }
  }, [unsavedChanges]);

  useEffect(() => {
    setUnsavedChanges(JSON.stringify(units) !== JSON.stringify(firebaseUnits));
  }, [units, firebaseUnits]);

  if (!units) {
    return <LoadingScreen />;
  }

  const handleSave = async () => {
    if (typeof id === "string" && units.length > 0) {
      try {
        await deleteExistingUnits(id);
        const saveUnitPromises = units.map((unit) => saveUnit(id, unit));
        const savedUnits = await Promise.all(saveUnitPromises);
        setFirebaseUnits(savedUnits);
        setUnits(savedUnits);
        console.log("Units saved successfully!");
          await firestore().collection('courses').doc(id).update({
          lastModified: new Date().getTime(),
        });        
      } catch (error) {
        console.error("Error saving units or updating lastModified: ", error);
      }
    }
  };
  

  const unsavedChangesToast = () => {
    toast.show("Please save your changes before performing this action", {
      type: "custom",
      placement: "bottom",
      duration: 4000,
      animationType: "slide-in",
    });
  };

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

  const addUnit = () => {
    const newUnit: Unit = {
      key: uuidv4(),
      name: unitName,
      description: unitDescription,
      order: units.length,
    };
    setUnits((prevUnits) => [...prevUnits, newUnit]);
    setModalVisible(false);
    setUnitName("");
    setUnitDescription("");
  };

  const updateUnit = () => {
    if (editingUnit) {
      setUnits((prevUnits) =>
        prevUnits.map((unit) =>
          unit.key === editingUnit.key
            ? { ...unit, name: unitName, description: unitDescription }
            : unit
        )
      );
      setEditingUnit(null);
      setModalVisible(false);
      setUnitName("");
      setUnitDescription("");
      swipeableRefs.current[editingUnit.key]?.close();
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

  const handleDeleteUnit = (key: string) => {
    setUnits((prevUnits) => {
      const updatedUnits = prevUnits.filter((unit) => unit.key !== key);
      return updatedUnits.map((unit, index) => ({
        ...unit,
        order: index,
      }));
    });
  };

  const handleToggleEdit = () => {
    units.forEach((unit) => {
      swipeableRefs.current[unit.key]?.close();
    });
    if (editing) {
      if (unsavedChanges) {
        setErrorVisable(true);
      }
    } else {
      setErrorVisable(false);
    }
    setIsEditing(!editing);
  };

  const renderUnit = ({ item, drag }: RenderItemParams<Unit>) => {
    const originalUnit = firebaseUnits.find((fUnit) => fUnit.key === item.key);
    let hasNewChanges = false;
    let hasExistingChanges = false;

    if (originalUnit) {
      if (
        originalUnit.name !== item.name ||
        originalUnit.description !== item.description
      ) {
        hasExistingChanges = true;
      }
    } else {
      hasNewChanges = true;
    }

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
            editing &&
              !(hasExistingChanges || hasExistingChanges) &&
              styles.editingUnits,
            editing && hasNewChanges ? styles.unsavedUnit : null,
            editing && hasExistingChanges ? styles.editedUnit : null,
          ]}
          onLongPress={editing ? drag : null}
          onPress={() => {
            if (!editing && unsavedChanges) {
              unsavedChangesToast();
            } else if (!editing) {
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
        <SafeAreaView>
          <Back link={"/channelPages"} params={{}} />
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
              <Animated.View
                style={{
                  opacity: iconOpacity,
                  transform: [{ scale: iconAnimation }],
                }}
              >
                <MaterialIcons name="warning" size={25} color="yellow" />
              </Animated.View>
            </View>
          </LinearGradient>
        </View>

        {errorVisable && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              You have unsaved changes. Go back in editing mode and save them!
            </Text>
            <Pressable
              onPress={() => setErrorVisable(false)}
              style={styles.errorIconContainer}
            >
              <Ionicons name="close-circle" size={20} color="#888" />
            </Pressable>
          </View>
        )}

        <CourseCard id={id as string} editing={editing} cache = {true} />

        <View>
          <View style={styles.unitHeaderContainer}>
            <Text style={styles.unitHeaderText}>Units</Text>
            {editing && (
              <Animated.View
                style={{
                  opacity: iconOpacity,
                  transform: [{ scale: iconAnimation }],
                }}
              >
                <Pressable
                  onPress={() => setUnits(firebaseUnits)}
                  style={styles.resetIconSpace}
                >
                  <MaterialIcons name="refresh" size={30} color="#ADD8E6" />
                </Pressable>
              </Animated.View>
            )}
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
                onDragEnd={({ data }) => {
                  const updatedData = data.map((unit, index) => ({
                    ...unit,
                    order: index,
                  }));
                  setUnits(updatedData);
                }}
              />
            </View>
          ) : (
            <Text style={styles.subText}>No units</Text>
          )}
          {editing && (
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text>Save Units</Text>
            </Pressable>
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
              <View style={styles.modalContent}>
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
  errorContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderRadius: 25,
    padding: 15,
    marginVertical: 20,
    borderColor: "#EED202",
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    color: "#EED202",
    fontSize: 16,
  },
  errorIconContainer: {
    marginLeft: 10,
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
    marginTop: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  unitHeaderText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
  },
  resetIconSpace: {
    marginRight: 30,
  },
  unsavedUnit: {
    borderColor: "green",
    borderWidth: 2,
  },
  editedUnit: {
    borderColor: "#EED202",
    borderWidth: 2,
  },
  editingUnits: {
    borderColor: "grey",
    borderWidth: 1,
  },
  viewUnits: {
    borderBottomColor: "white",
    borderBottomWidth: 1,
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
  modalContent: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 10,
    width: "90%",
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
  saveButton: {
    marginTop: 30,
    backgroundColor: "#ffffff",
    padding: "3%",
    alignItems: "center",
    borderRadius: 10,
  },
});

export default ManageCoursesPage;
