import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
  View,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { CheckBox } from 'rn-inkpad';
import firestore from '@react-native-firebase/firestore';

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
  const [value, onChangeText] = React.useState("");

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
    }
  };

  const handleAddAnswerChoice = () => {
    const newQuestion = qText.trim();
    if (newQuestion) {
      const newItem: QuestionItem = {
        key: uuidv4(),
        content: newQuestion,
        identifier: "question",
        answer: false,
        delete: () => handleDelete(newItem.key)
      };

      setAnswerChoices(prevChoices => [...prevChoices, newItem]);
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
    if (item.identifier === 'image') {
      return (
        <TouchableOpacity
          style={styles.imageContainer}
          onLongPress={drag}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            borderRadius={10}
            resizeMode="contain"
          />

          <TouchableOpacity onPress={item.delete} style={styles.deleteButton}>
            <Text style={{ color: 'red' }}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else if (item.identifier === 'question') {
      return (
        <TouchableOpacity
          style={styles.item}
          onLongPress={drag}
        >
          <CheckBox
            checked={item.answer || false}
            iconColor={'#464EE5'}
            iconSize={20}
            onChange={() => handleToggleSelect(item.key)}
            title={item.content}
          />
          <TouchableOpacity onPress={item.delete} style={styles.deleteButton}>
            <Text style={{ color: 'red' }}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.item}
          onLongPress={drag}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.itemText}>{item.content}</Text>
          </View>
          <TouchableOpacity onPress={item.delete} style={styles.deleteButton}>
            <Text style={{ color: 'red' }}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={components}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onDragEnd={({ data: newData }) => setComponents(newData)}
        ListHeaderComponent={<Button title="Add an image" onPress={pickImage} />}
        ListFooterComponent={<View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTextComponent}
          >
            <Text style={styles.buttonText}>Add Text Component</Text>
          </TouchableOpacity>

          <TextInput
            multiline
            style={[styles.input, { height: Math.max(40, qText.split('\n').length * 20) }]}
            onChangeText={text => setQText(text)}
            value={qText}
            placeholder="Enter text for a text component or answer choice here!"
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddAnswerChoice}
          >
            <Text style={styles.buttonText}>Add Answer Choice</Text>
          </TouchableOpacity>

          <Text style={styles.largeText}>Question</Text>

          <TextInput
            multiline
            style={[styles.input, { height: Math.max(40, value.split('\n').length * 20) }]}
            onChangeText={text => onChangeText(text)}
            value={value}
            placeholder="This is the question!"
          />

          <DraggableFlatList
            data={answerChoices}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            onDragEnd={({ data: newData }) => setAnswerChoices(newData)}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
  },
  itemText: {
    fontSize: 18,
    flex: 1,
    marginRight: 10,
  },
  imageContainer: {
    backgroundColor: "transparent",
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
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
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  largeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
});

export default QuestionPortal;
