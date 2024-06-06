import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
  ScrollView,
  View,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { CheckBox } from 'rn-inkpad';

interface QuestionItem {
  key: string;
  content: string;
  image?: string;
  identifier: string;
  selected?: boolean;
  delete: () => void;
}

const QuestionPortal: React.FC = () => {
  const [data, setData] = useState<QuestionItem[]>([]);
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
        delete: () => handleDelete(newItem.key)
      };

      setData((prevData) => [newItem, ...prevData]);
    }
  };

  const handleAddTextComponent = () => {
    const content = qText.trim();
    if (content) {
      const newItem: QuestionItem = {
        key: uuidv4(),
        content,
        identifier: "text",
        delete: () => handleDelete(newItem.key)
      };

      setData(prevData => [...prevData, newItem]);
      setQText("");
    }
  };

  const handleAddAnswerChoice = () => {
    const newQuestion = qText.trim();
    if (newQuestion) {
      const newItem: QuestionItem = {
        key: uuidv4(),
        content: newQuestion,
        identifier: "question",
        delete: () => handleDelete(newItem.key)
      };

      setData(prevData => [...prevData, newItem]);
      setQText("");
    }
  };

  const handleDelete = (key: string) => {
    setData(prevData => prevData.filter(item => item.key !== key));
  };

  const handleToggleSelect = (key: string) => {
    setData(prevData =>
      prevData.map(item =>
        item.key === key ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSubmit = () => {
    console.log("Current Question Input:", value);
    console.log("Current Components on Screen:", data);
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
              borderRadius={100}
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
            checked={item.selected || false}
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
    <ScrollView style={styles.container}>
      <Button title="Add an image" onPress={pickImage} />

      <DraggableFlatList
        data={data.filter(item => item.identifier !== 'question')}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onDragEnd={({ data: newData }) => setData(newData)}
      />

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
        data={data.filter(item => item.identifier === 'question')}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onDragEnd={({ data: newData }) => setData(newData)}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
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