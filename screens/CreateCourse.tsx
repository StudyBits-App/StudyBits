import React, { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  Button,
  View,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import firestore from '@react-native-firebase/firestore';
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from 'react-native-vector-icons/Ionicons';

interface UnitItem {
  key: string;
  content: string;
  delete: () => void;
}

const CoursePortal: React.FC = () => {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [unitText, setUnitText] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editedItemKey, setEditedItemKey] = useState<string>("");
  const [editedItemContent, setEditedItemContent] = useState<string>("");

  const [dragging, setDragging] = useState(false);

  const handleAddTextComponent = () => {
    const content = unitText.trim();
    if (content) {
      const newItem: UnitItem = {
        key: uuidv4(),
        content,
        delete: () => handleDelete(newItem.key)
      };

      setUnits(prevComponents => [...prevComponents, newItem]);
      setUnitText("")
    }
  };

  const handleDelete = (key: string) => {
    setUnits(prevComponents => prevComponents.filter(item => item.key !== key));
  };

  const handleEditContent = (key: string, currentContent: string) => {
    setEditedItemKey(key);
    setEditedItemContent(currentContent);
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    setUnits(prevComponents =>
      prevComponents.map(item =>
        item.key === editedItemKey ? { ...item, content: editedItemContent } : item
      )
    );

    setModalVisible(false);
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    const filteredComponents = units.map(units => {
      const { delete: _, ...filteredComponent } = units;
      return filteredComponent;
    });

    firestore().collection('questions').add({ units: filteredComponents });
  };

  const renderItem = ({ item, drag }: RenderItemParams<UnitItem>) => {
    const itemStyle = dragging ? { backgroundColor: '#d3d3d3' } : {};
    const textColor = dragging ? '#757575' : '#000';
    const backgroundColor = '#f9c2ff';
    
      return (
        <Swipeable
          renderRightActions={() => (
            <Pressable onPress={item.delete} style={styles.deleteButton}>
              <Text style={{ color: 'red' }}>Delete</Text>
            </Pressable>
          )}
        >
          <Pressable
            style={[styles.item, itemStyle, { backgroundColor }]}
            onLongPress={() => {
              drag();
              setDragging(true);
            }}
            onPressOut={() => setDragging(false)}
          >
            <Text style={[styles.itemText, { color: textColor }]}>{item.content}</Text>
            <Pressable onPress={() => handleEditContent(item.key, item.content)} style={styles.editButton}>
              <Ionicons name="pencil" size={20} color="#000" />
            </Pressable>

          </Pressable>
        </Swipeable>
      );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.largeText}>Create a course</Text>
      <Text style={styles.smallText}>Give it a name, some units, and start writing questions!</Text>
      
      <TextInput
        multiline
        style={[styles.input, { height: Math.max(40, unitText.split('\n').length * 20) }]}
        onChangeText={text => setUnitText(text)}
        value={unitText}
        placeholder="Enter text for a text component or answer choice here!"
      />
      <Pressable style={styles.addButton} onPress={handleAddTextComponent}>
        <Text style={styles.buttonText}>Add Text Component</Text>
      </Pressable>
      <DraggableFlatList
        data={units}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onDragEnd={({ data: newData }) => setUnits(newData)}
      />
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
                onChangeText={text => setEditedItemContent(text)}
                value={editedItemContent}
                placeholder="Edit content"
              />
              <View style={styles.modalButtons}>
                <Button title="Save" onPress={handleSaveEdit} />
                <Button title="Cancel" onPress={handleCancelEdit} />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
  input: {
    borderColor: "gray",
    color: 'white',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  editButton: {
    padding: 10,
    backgroundColor: 'transparent',
  },
  largeText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
    padding: 30,
    color: 'white',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    height: '50%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalInput: {
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: '100%',
    height: '80%',
  },
});

export default CoursePortal;
