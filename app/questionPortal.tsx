import React, { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  Button,
  Image,
  View,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import firestore from '@react-native-firebase/firestore';
import Animated, { Easing, useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from 'react-native-vector-icons/Ionicons';

interface QuestionItem {
  key: string;
  content: string;
  image?: string;
  identifier: string;
  answer: boolean;
  delete: () => void;
}

const QuestionPortal: React.FC = () => {
  const [components, setComponents] = useState<QuestionItem[]>([]);
  const [answerChoices, setAnswerChoices] = useState<QuestionItem[]>([]);
  const [qText, setQText] = useState<string>("");
  const [value, onChangeText] = useState<string>("");
  const [answerText, setAnswerText] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editedItemKey, setEditedItemKey] = useState<string>("");
  const [editedItemContent, setEditedItemContent] = useState<string>("");

  const [showFirstContainer, setShowFirstContainer] = useState(true);
  const [dragging, setDragging] = useState(false);

  const animation = useSharedValue(1);

  const toggleContainers = () => {
    animation.value = withTiming(animation.value === 1 ? 0 : 1, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
    setShowFirstContainer(!showFirstContainer);
  };

  const animatedStyleFirstContainer = useAnimatedStyle(() => ({
    opacity: animation.value,
    display: animation.value === 1 ? 'flex' : 'none',
  }));

  const animatedStyleSecondContainer = useAnimatedStyle(() => ({
    opacity: 1 - animation.value,
    display: animation.value === 0 ? 'flex' : 'none',
  }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newItem: QuestionItem = {
        key: uuidv4(),
        content: "",
        image: result.assets[0].uri,
        identifier: "image",
        answer: false,
        delete: () => handleDelete(newItem.key)
      };

      setComponents(prevComponents => [...prevComponents, newItem]);
    }
  };

  const handleAddTextComponent = () => {
    const content = qText.trim();
    if (content) {
      const newItem: QuestionItem = {
        key: uuidv4(),
        content,
        identifier: "text",
        answer: false,
        delete: () => handleDelete(newItem.key)
      };

      setComponents(prevComponents => [...prevComponents, newItem]);
      setQText("")
    }
  };

  const handleAddAnswerChoice = () => {
    const newQuestion = answerText.trim();
    if (newQuestion) {
      const newItem: QuestionItem = {
        key: uuidv4(),
        content: newQuestion,
        identifier: "question",
        answer: false,
        delete: () => handleDelete(newItem.key)
      };

      setAnswerChoices(prevChoices => [...prevChoices, newItem]);
      setAnswerText("");
    }
  };

  const handleDelete = (key: string) => {
    setComponents(prevComponents => prevComponents.filter(item => item.key !== key));
    setAnswerChoices(prevChoices => prevChoices.filter(item => item.key !== key));
  };

  const handleToggleSelect = (key: string) => {
    setComponents(prevComponents =>
      prevComponents.map(item =>
        item.key === key ? { ...item, answer: !item.answer } : item
      )
    );

    setAnswerChoices(prevChoices =>
      prevChoices.map(item =>
        item.key === key ? { ...item, answer: !item.answer } : item
      )
    );
  };

  const handleEditContent = (key: string, currentContent: string) => {
    setEditedItemKey(key);
    setEditedItemContent(currentContent);
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    setComponents(prevComponents =>
      prevComponents.map(item =>
        item.key === editedItemKey ? { ...item, content: editedItemContent } : item
      )
    );

    setAnswerChoices(prevChoices =>
      prevChoices.map(item =>
        item.key === editedItemKey ? { ...item, content: editedItemContent } : item
      )
    );

    setModalVisible(false);
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
  };

  const handleSubmit = () => {
    const filteredComponents = components.map(component => {
      const { delete: _, ...filteredComponent } = component;
      return filteredComponent;
    });

    const filteredAnswers = answerChoices.map(answerChoice => {
      const { delete: _, ...filteredComponent } = answerChoice;
      return filteredComponent;
    });

    firestore().collection('questions').add({ question: value, text: filteredComponents, answers: filteredAnswers });
  };

  const renderItem = ({ item, drag }: RenderItemParams<QuestionItem>) => {
    const itemStyle = dragging ? { backgroundColor: '#d3d3d3' } : {};
    const textColor = dragging ? '#757575' : '#000';
    const backgroundColor = item.answer ? '#C8E6C9' : '#f9c2ff';
  
    if (item.identifier === 'image') {
      return (
        <Pressable
          style={[styles.imageContainer, itemStyle]}
          onLongPress={() => {
            drag();
            setDragging(true);
          }}
          onPressOut={() => setDragging(false)}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            borderRadius={10}
            resizeMode="contain"
          />
  
          <Pressable onPress={item.delete} style={styles.deleteButton}>
            <Text style={{ color: 'red' }}>Delete</Text>
          </Pressable>
        </Pressable>
      );
    } else {
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
            onPress={() => {
              if (item.identifier === 'question') {
                handleToggleSelect(item.key);
              }
            }}
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
    }
  };  

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.innerContainer, animatedStyleFirstContainer]}>

        <Text style={styles.largeText}>Pre-Question Components</Text>
        <Text style={styles.smallText}>Add background information and images for your question!</Text>

        <TextInput
          multiline
          style={[styles.input, { height: Math.max(40, qText.split('\n').length * 20) }]}
          onChangeText={text => setQText(text)}
          value={qText}
          placeholder="Enter text for a text component or answer choice here!"
        />

        <Pressable
          style={styles.addButton}
          onPress={handleAddTextComponent}>
          <Text style={styles.buttonText}>Add Text Component</Text>
        </Pressable>

        <Button title="Add an image" onPress={pickImage} />

        <DraggableFlatList
          data={components}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data: newData }) => setComponents(newData)}
          ListFooterComponent={<Button title="Next" onPress={toggleContainers} />}
        />
      </Animated.View>

      <Animated.View style={[styles.innerContainer, animatedStyleSecondContainer]}>

        <Text style={styles.largeText}>Question</Text>
        <Text style={styles.smallText}>Add your question text here!</Text>

        <TextInput
          multiline
          style={[styles.input, { height: Math.max(40, value.split('\n').length * 20) }]}
          onChangeText={text => onChangeText(text)}
          value={value}
          placeholder="This is the question!"
        />

        <TextInput
          multiline
          style={[styles.input, { height: Math.max(40, answerText.split('\n').length * 20) }]}
          onChangeText={text => setAnswerText(text)}
          value={answerText}
          placeholder="Enter answer choice text"
        />

        <Pressable
          style={styles.addButton}
          onPress={handleAddAnswerChoice}>
          <Text style={styles.buttonText}>Add Answer Choice</Text>
        </Pressable>

        <DraggableFlatList
          data={answerChoices}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          onDragEnd={({ data: newData }) => setAnswerChoices(newData)}
          ListHeaderComponent={<Button title="Previous" onPress={toggleContainers} />}
          ListFooterComponent={<Button title="submit" onPress={handleSubmit} />}
        />

      </Animated.View>

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
    flex: 1,
    padding: 100,
    paddingHorizontal: 20,
  },
  innerContainer: {
    width: '100%',
    flex: 1,
    marginBottom: 200
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  itemText: {
    fontSize: 18,
    flex: 1,
  },
  imageContainer: {
    backgroundColor: "transparent",
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 200,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
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
    borderRadius: 5,
    backgroundColor: 'transparent',
    marginLeft: 10,
  },
  largeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
    padding: 30,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
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
    height: '50%'
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
    flex: 1,
  },
});

export default QuestionPortal;
