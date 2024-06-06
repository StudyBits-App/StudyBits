import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Button } from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'

interface Component {
  key: string;
  content: string;
  image?: string;
  identifier: string;
  answer: boolean;
  selected: boolean
}

let questionInfo: FirebaseFirestoreTypes.DocumentData;

firestore().collection('questions').get().then(querySnapshot => {
  questionInfo = querySnapshot.docs[Math.floor(Math.random() * querySnapshot.size)].data()
});

// const initialComponents: Component[] = questionInfo.text;

// const initialAnswerChoices: Component[] = questionInfo.answers;

// const initialQuestion = questionInfo.question;

const ComponentList = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [answerChoices, setAnswerChoices] = useState<Component[]>();
  const [components, setComponents] = useState<Component[]>();
  const [question, setQuestion] = useState<string>();

  useEffect(() => {
    setAnswerChoices(questionInfo.answers);
    setComponents(questionInfo.text);
    setQuestion(questionInfo.question);
  }, [questionInfo])

  if (!answerChoices) return <Text>Loading...</Text>

  const handleAnswerClick = (index: number) => {
    if (!answersSubmitted) {
      const newSelectedAnswers = [...selectedAnswers];
      if (newSelectedAnswers.includes(index)) {
        newSelectedAnswers.splice(newSelectedAnswers.indexOf(index), 1);
      } else {
        newSelectedAnswers.push(index);
      }
      setSelectedAnswers(newSelectedAnswers);

      // Update answerChoices to reflect selection
      const updatedChoices = answerChoices.map((choice, i) => ({
        ...choice,
        selected: newSelectedAnswers.includes(i)
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
    // setAnswerChoices(initialAnswerChoices.map(choice => ({ ...choice, selected: false })));
    // setComponents(initialComponents.map(component => ({ ...component, selected: false })));
    // setQuestion(initialQuestion);
    firestore().collection('questions').get().then(querySnapshot => {
      questionInfo = querySnapshot.docs[Math.floor(Math.random() * querySnapshot.size)].data()
      setAnswerChoices(questionInfo.answers);
      setComponents(questionInfo.text);
      setQuestion(questionInfo.question);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.text}>{question}</Text>
      </View>

      {components?.map((component, index) => {
        if (component.identifier === 'text') {
          return (
            <View key={index} style={styles.textContainer}>
              <Text>{component.content}</Text>
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
            answersSubmitted && choice.selected && choice.answer ? styles.correctAnswerContainer : {},
            answersSubmitted && choice.selected && !choice.answer ? styles.incorrectAnswerContainer : {},
          ]}
          onPress={() => handleAnswerClick(index)}
          disabled={answersSubmitted}
        >
          <Text style={styles.answerText}>{choice.content}</Text>
        </TouchableOpacity>
      ))}

      <Button
        title={answersSubmitted ? "Next" : "Submit"}
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
    borderRadius: 5
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
    backgroundColor: '#8bc34a', // Green for correct
  },
  incorrectAnswerContainer: {
    backgroundColor: '#e57373', // Red for incorrect
  },
  answerText: {
    fontSize: 16,
  },
  text: {
    fontSize: 20,
  },
});

export default ComponentList;
