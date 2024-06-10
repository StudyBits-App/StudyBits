import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Button, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';

interface Component {
  key: string;
  content: string;
  image?: string;
  identifier: string;
  answer: boolean;
  selected: boolean;
}

const ComponentList = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [answerChoices, setAnswerChoices] = useState<Component[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [question, setQuestion] = useState<string>();
  const [questionInfo, setQuestionInfo] = useState<any>();

  const fetchQuestionInfo = async () => {
    try {
      const querySnapshot = await firestore().collection('questions').get();
      const data = querySnapshot.docs[Math.floor(Math.random() * querySnapshot.size)].data();
      setQuestionInfo(data);
    } catch (error) {
      console.error('Error fetching question info:', error);
    }
  };

  useEffect(() => {
    fetchQuestionInfo();
  }, []);

  useEffect(() => {
    if (questionInfo) {
      setAnswerChoices(questionInfo.answers);
      setComponents(questionInfo.text);
      setQuestion(questionInfo.question);
    }
  }, [questionInfo]);

  if (!answerChoices || !components || !question) return <Text>Loading...</Text>;

  const handleAnswerClick = (index: number) => {
    if (!answersSubmitted) {
      const newSelectedAnswers = [...selectedAnswers];
      if (newSelectedAnswers.includes(index)) {
        newSelectedAnswers.splice(newSelectedAnswers.indexOf(index), 1);
      } else {
        newSelectedAnswers.push(index);
      }
      setSelectedAnswers(newSelectedAnswers);

      const updatedChoices = answerChoices.map((choice, i) => ({
        ...choice,
        selected: newSelectedAnswers.includes(i),
      }));
      setAnswerChoices(updatedChoices);
    }
  };

  const handleSubmit = () => {
    setAnswersSubmitted(true);
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setAnswersSubmitted(false);
    fetchQuestionInfo();
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.text}>{question}</Text>
      </View>

      {components.map((component, index) => {
        if (component.identifier === 'text') {
          return (
            <View key={index} style={styles.textContainer}>
              <Text>{component.content}</Text>
            </View>
          );
        } else if (component.identifier === 'image') {
          return (
            <View key={index} style={styles.imageContainer}>

              <Image 
                source={{ uri: component.image }} 
                style={styles.image} 
              />
              
            </View>
          );
        }
        return null;
      })}

  {answerChoices.map((choice, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.answerContainer,
          choice.selected ? styles.selectedAnswerContainer : {},
          answersSubmitted && choice.selected && choice.answer
            ? styles.correctAnswerContainer // Selected correct answer
            : answersSubmitted && !choice.selected && choice.answer
            ? styles.correctButNotSelectedContainer // Correct but not selected
            : answersSubmitted && choice.selected && !choice.answer
            ? styles.incorrectAnswerContainer // Selected incorrect answer
            : {},
      ]}
      onPress={() => handleAnswerClick(index)}
      disabled={answersSubmitted}
    >
      <Text style={styles.answerText}>{choice.content}</Text>
    </TouchableOpacity>
  ))}


      <Button
        title={answersSubmitted ? 'Next' : 'Submit'}
        onPress={answersSubmitted ? handleNext : handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textContainer: {
    marginBottom: 10,
  },
  questionContainer: {
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  imageContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  answerContainer: {
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  selectedAnswerContainer: {
    backgroundColor: '#aaf',
  },
  correctAnswerContainer: {
    backgroundColor: '#8bc34a', 
  },
  incorrectAnswerContainer: {
    backgroundColor: '#e57373',
  },
  correctButNotSelectedContainer: {
    borderColor: '#8bc34a', 
    borderWidth:4
  },
  answerText: {
    fontSize: 16,
  },
  text: {
    fontSize: 20,
  },
});

export default ComponentList;
